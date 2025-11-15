'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { CodeLanguage } from '@/lib/types';
import {
  Download,
  GitBranch,
  Github,
  X,
  Check,
  AlertCircle,
  Upload,
  FileCode,
  Loader2,
} from 'lucide-react';
import {
  generateGitHubActionsWorkflow,
  generatePlaywrightConfig,
  generateCIReadme,
  generatePackageJsonScripts,
  GitHubActionsConfig,
} from '@/lib/ci/githubActionsTemplate';
import {
  generateGitLabCIPipeline,
  generateGitLabCIReadme,
  generateGitLabCIVariables,
  generateGitLabPagesConfig,
  GitLabCIConfig,
} from '@/lib/ci/gitlabCITemplate';

interface CIPipelineWizardProps {
  testSuiteName: string;
  targetUrl: string;
  codeLanguage: CodeLanguage;
  generatedCode: string;
  onClose: () => void;
}

type CIProvider = 'github' | 'gitlab';
type WizardStep = 'select-provider' | 'configure' | 'deploy';

export function CIPipelineWizard({
  testSuiteName,
  targetUrl,
  codeLanguage,
  generatedCode,
  onClose,
}: CIPipelineWizardProps) {
  const { currentTheme } = useTheme();
  const [step, setStep] = useState<WizardStep>('select-provider');
  const [provider, setProvider] = useState<CIProvider | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deploySuccess, setDeploySuccess] = useState(false);

  // Configuration state
  const [nodeVersion, setNodeVersion] = useState('20');
  const [browsers, setBrowsers] = useState<('chromium' | 'firefox' | 'webkit')[]>(['chromium']);
  const [runOnPush, setRunOnPush] = useState(true);
  const [runOnPR, setRunOnPR] = useState(true);
  const branches = ['main', 'master', 'develop'];
  const schedule = '';
  const [workers, setWorkers] = useState(1);
  const [retries, setRetries] = useState(2);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState(''); // Format: owner/repo

  const handleProviderSelect = (selectedProvider: CIProvider) => {
    setProvider(selectedProvider);
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select-provider');
      setProvider(null);
    } else if (step === 'deploy') {
      setStep('configure');
    }
  };

  const toggleBrowser = (browser: 'chromium' | 'firefox' | 'webkit') => {
    setBrowsers((prev) =>
      prev.includes(browser) ? prev.filter((b) => b !== browser) : [...prev, browser]
    );
  };

  const handleDownloadZip = async () => {
    if (!provider) return;

    try {
      const config =
        provider === 'github'
          ? ({
              testSuiteName,
              targetUrl,
              codeLanguage,
              nodeVersion,
              browsers,
              runOn: [
                ...(runOnPush ? (['push'] as const) : []),
                ...(runOnPR ? (['pull_request'] as const) : []),
              ],
              branches,
              schedule: schedule || undefined,
              workers,
              retries,
            } as GitHubActionsConfig)
          : ({
              testSuiteName,
              targetUrl,
              codeLanguage,
              nodeVersion,
              browsers,
              workers,
              retries,
            } as GitLabCIConfig);

      // Generate files
      const files: Record<string, string> = {};

      if (provider === 'github') {
        const workflowName = testSuiteName.toLowerCase().replace(/\s+/g, '-');
        files[`.github/workflows/${workflowName}.yml`] = generateGitHubActionsWorkflow(
          config as GitHubActionsConfig
        );
        files['README.md'] = generateCIReadme(config as GitHubActionsConfig);
      } else {
        files['.gitlab-ci.yml'] = generateGitLabCIPipeline(config as GitLabCIConfig);
        files['README.md'] = generateGitLabCIReadme(config as GitLabCIConfig);
        files['GITLAB_CI_VARIABLES.md'] = generateGitLabCIVariables(config as GitLabCIConfig);
        files['GITLAB_PAGES.md'] = generateGitLabPagesConfig();
      }

      // Common files
      const extension = codeLanguage === 'typescript' ? 'ts' : 'js';
      files[`playwright.config.${extension}`] = generatePlaywrightConfig(
        config as GitHubActionsConfig
      );
      files[`tests/test.spec.${extension}`] = generatedCode;
      files['package.json.scripts'] = JSON.stringify(
        generatePackageJsonScripts(),
        null,
        2
      );

      // Create a blob and download
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${testSuiteName.toLowerCase().replace(/\s+/g, '-')}-ci-pipeline.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDeploySuccess(true);
    } catch (error) {
      console.error('Error creating ZIP:', error);
      setDeployError('Failed to create ZIP file');
    }
  };

  const handleDeployToGitHub = async () => {
    if (!githubToken || !githubRepo) {
      setDeployError('GitHub token and repository are required');
      return;
    }

    setIsDeploying(true);
    setDeployError(null);

    try {
      const config: GitHubActionsConfig = {
        testSuiteName,
        targetUrl,
        codeLanguage,
        nodeVersion,
        browsers,
        runOn: [
          ...(runOnPush ? (['push'] as const) : []),
          ...(runOnPR ? (['pull_request'] as const) : []),
        ],
        branches,
        schedule: schedule || undefined,
        workers,
        retries,
      };

      const response = await fetch('/api/ci/deploy-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: githubToken,
          repo: githubRepo,
          config,
          generatedCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Deployment failed');
      }

      setDeploySuccess(true);
    } catch (error) {
      console.error('GitHub deployment error:', error);
      setDeployError((error as Error).message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      data-testid="ci-pipeline-wizard"
    >
      <ThemedCard variant="glow" className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileCode className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
              <h2 className="text-2xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                Generate CI/CD Pipeline
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:opacity-70 transition-opacity"
              data-testid="close-wizard-btn"
            >
              <X className="w-5 h-5" style={{ color: currentTheme.colors.text.secondary }} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'select-provider' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor:
                    step === 'select-provider' || step === 'configure' || step === 'deploy'
                      ? currentTheme.colors.accent
                      : currentTheme.colors.surface,
                  ringColor: currentTheme.colors.accent,
                }}
              >
                <span className="text-sm font-bold">1</span>
              </div>
              <span
                className="text-sm"
                style={{
                  color:
                    step === 'select-provider'
                      ? currentTheme.colors.text.primary
                      : currentTheme.colors.text.secondary,
                }}
              >
                Select Provider
              </span>
            </div>

            <div className="h-0.5 w-12" style={{ backgroundColor: currentTheme.colors.border }} />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'configure' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor:
                    step === 'configure' || step === 'deploy'
                      ? currentTheme.colors.accent
                      : currentTheme.colors.surface,
                  ringColor: currentTheme.colors.accent,
                }}
              >
                <span className="text-sm font-bold">2</span>
              </div>
              <span
                className="text-sm"
                style={{
                  color:
                    step === 'configure'
                      ? currentTheme.colors.text.primary
                      : currentTheme.colors.text.secondary,
                }}
              >
                Configure
              </span>
            </div>

            <div className="h-0.5 w-12" style={{ backgroundColor: currentTheme.colors.border }} />

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'deploy' ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: step === 'deploy' ? currentTheme.colors.accent : currentTheme.colors.surface,
                  ringColor: currentTheme.colors.accent,
                }}
              >
                <span className="text-sm font-bold">3</span>
              </div>
              <span
                className="text-sm"
                style={{
                  color:
                    step === 'deploy'
                      ? currentTheme.colors.text.primary
                      : currentTheme.colors.text.secondary,
                }}
              >
                Deploy
              </span>
            </div>
          </div>

          {/* Content */}
          {step === 'select-provider' && (
            <div className="space-y-4">
              <p className="text-center mb-6" style={{ color: currentTheme.colors.text.secondary }}>
                Choose your CI/CD provider to generate a ready-to-use pipeline configuration
              </p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleProviderSelect('github')}
                  className="p-6 rounded-lg border-2 hover:scale-105 transition-transform"
                  style={{
                    borderColor: currentTheme.colors.border,
                    backgroundColor: currentTheme.colors.surface,
                  }}
                  data-testid="select-github-btn"
                >
                  <Github className="w-12 h-12 mx-auto mb-3" style={{ color: currentTheme.colors.accent }} />
                  <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    GitHub Actions
                  </h3>
                  <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    Generate workflow for GitHub repositories
                  </p>
                </button>

                <button
                  onClick={() => handleProviderSelect('gitlab')}
                  className="p-6 rounded-lg border-2 hover:scale-105 transition-transform"
                  style={{
                    borderColor: currentTheme.colors.border,
                    backgroundColor: currentTheme.colors.surface,
                  }}
                  data-testid="select-gitlab-btn"
                >
                  <GitBranch className="w-12 h-12 mx-auto mb-3" style={{ color: currentTheme.colors.accent }} />
                  <h3 className="text-lg font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    GitLab CI/CD
                  </h3>
                  <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                    Generate pipeline for GitLab repositories
                  </p>
                </button>
              </div>
            </div>
          )}

          {step === 'configure' && provider && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  Node.js Version
                </label>
                <select
                  value={nodeVersion}
                  onChange={(e) => setNodeVersion(e.target.value)}
                  className="w-full p-2 rounded border"
                  style={{
                    backgroundColor: currentTheme.colors.background,
                    borderColor: currentTheme.colors.border,
                    color: currentTheme.colors.text.primary,
                  }}
                  data-testid="node-version-select"
                >
                  <option value="18">Node.js 18</option>
                  <option value="20">Node.js 20</option>
                  <option value="22">Node.js 22</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                  Browsers
                </label>
                <div className="flex gap-4">
                  {(['chromium', 'firefox', 'webkit'] as const).map((browser) => (
                    <label key={browser} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={browsers.includes(browser)}
                        onChange={() => toggleBrowser(browser)}
                        className="w-4 h-4"
                        data-testid={`browser-${browser}-checkbox`}
                      />
                      <span style={{ color: currentTheme.colors.text.primary }}>
                        {browser.charAt(0).toUpperCase() + browser.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {provider === 'github' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    Trigger Events
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={runOnPush}
                        onChange={(e) => setRunOnPush(e.target.checked)}
                        className="w-4 h-4"
                        data-testid="trigger-push-checkbox"
                      />
                      <span style={{ color: currentTheme.colors.text.primary }}>On Push</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={runOnPR}
                        onChange={(e) => setRunOnPR(e.target.checked)}
                        className="w-4 h-4"
                        data-testid="trigger-pr-checkbox"
                      />
                      <span style={{ color: currentTheme.colors.text.primary }}>On Pull Request</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    Workers
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={workers}
                    onChange={(e) => setWorkers(parseInt(e.target.value))}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text.primary,
                    }}
                    data-testid="workers-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    Retries
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={retries}
                    onChange={(e) => setRetries(parseInt(e.target.value))}
                    className="w-full p-2 rounded border"
                    style={{
                      backgroundColor: currentTheme.colors.background,
                      borderColor: currentTheme.colors.border,
                      color: currentTheme.colors.text.primary,
                    }}
                    data-testid="retries-input"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <ThemedButton variant="secondary" onClick={handleBack} data-testid="back-btn">
                  Back
                </ThemedButton>
                <ThemedButton
                  variant="primary"
                  onClick={() => setStep('deploy')}
                  disabled={browsers.length === 0}
                  data-testid="next-btn"
                >
                  Next
                </ThemedButton>
              </div>
            </div>
          )}

          {step === 'deploy' && provider && (
            <div className="space-y-6">
              {deploySuccess ? (
                <div className="text-center py-8">
                  <Check className="w-16 h-16 mx-auto mb-4" style={{ color: '#22c55e' }} />
                  <h3 className="text-xl font-bold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                    {provider === 'github' && githubToken ? 'Deployed Successfully!' : 'Downloaded Successfully!'}
                  </h3>
                  <p style={{ color: currentTheme.colors.text.secondary }}>
                    {provider === 'github' && githubToken
                      ? 'Your CI/CD pipeline has been deployed to GitHub'
                      : 'Your CI/CD pipeline files have been downloaded as a ZIP'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold" style={{ color: currentTheme.colors.text.primary }}>
                      Deployment Options
                    </h3>

                    {provider === 'github' && (
                      <div className="space-y-4 p-4 rounded-lg" style={{ backgroundColor: currentTheme.colors.surface }}>
                        <h4 className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
                          Deploy to GitHub (Optional)
                        </h4>
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                            GitHub Personal Access Token
                          </label>
                          <input
                            type="password"
                            value={githubToken}
                            onChange={(e) => setGithubToken(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxx"
                            className="w-full p-2 rounded border"
                            style={{
                              backgroundColor: currentTheme.colors.background,
                              borderColor: currentTheme.colors.border,
                              color: currentTheme.colors.text.primary,
                            }}
                            data-testid="github-token-input"
                          />
                          <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.secondary }}>
                            Requires &apos;repo&apos; and &apos;workflow&apos; scopes
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2" style={{ color: currentTheme.colors.text.primary }}>
                            Repository (owner/repo)
                          </label>
                          <input
                            type="text"
                            value={githubRepo}
                            onChange={(e) => setGithubRepo(e.target.value)}
                            placeholder="username/repository"
                            className="w-full p-2 rounded border"
                            style={{
                              backgroundColor: currentTheme.colors.background,
                              borderColor: currentTheme.colors.border,
                              color: currentTheme.colors.text.primary,
                            }}
                            data-testid="github-repo-input"
                          />
                        </div>
                        <ThemedButton
                          variant="primary"
                          onClick={handleDeployToGitHub}
                          disabled={isDeploying || !githubToken || !githubRepo}
                          className="w-full"
                          data-testid="deploy-github-btn"
                        >
                          {isDeploying ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deploying...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Deploy to GitHub
                            </>
                          )}
                        </ThemedButton>
                      </div>
                    )}

                    <div className="text-center">
                      <p className="text-sm mb-2" style={{ color: currentTheme.colors.text.secondary }}>
                        Or download as ZIP for manual import
                      </p>
                      <ThemedButton variant="secondary" onClick={handleDownloadZip} className="w-full" data-testid="download-zip-btn">
                        <Download className="w-4 h-4 mr-2" />
                        Download ZIP
                      </ThemedButton>
                    </div>
                  </div>

                  {deployError && (
                    <div className="p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                      <div>
                        <h4 className="font-semibold mb-1" style={{ color: '#ef4444' }}>
                          Deployment Error
                        </h4>
                        <p className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
                          {deployError}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <ThemedButton variant="secondary" onClick={handleBack} data-testid="back-from-deploy-btn">
                      Back
                    </ThemedButton>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </ThemedCard>
    </div>
  );
}
