'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { CodeLanguage } from '@/lib/types';
import { X, FileCode } from 'lucide-react';
import { CIProvider, WizardStep, GitHubConfig, GitLabConfig } from './lib/ciHelpers';
import { downloadCIZip, deployToGitHub } from './lib/ciHelpers';
import { WizardStepIndicator } from './components/WizardStepIndicator';
import { ProviderSelector } from './components/ProviderSelector';
import { ConfigurationForm } from './components/ConfigurationForm';
import { DeploymentOptions } from './components/DeploymentOptions';

interface CIPipelineWizardProps {
  testSuiteName: string;
  targetUrl: string;
  codeLanguage: CodeLanguage;
  generatedCode: string;
  onClose: () => void;
}

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
  const [workers, setWorkers] = useState(1);
  const [retries, setRetries] = useState(2);
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState('');

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

  const handleDownloadZip = async () => {
    if (!provider) return;

    try {
      const config: GitHubConfig | GitLabConfig =
        provider === 'github'
          ? {
              testSuiteName,
              targetUrl,
              codeLanguage,
              nodeVersion,
              browsers,
              runOn: [
                ...(runOnPush ? (['push'] as const) : []),
                ...(runOnPR ? (['pull_request'] as const) : []),
              ],
              branches: ['main', 'master', 'develop'],
              schedule: undefined,
              workers,
              retries,
            }
          : {
              testSuiteName,
              targetUrl,
              codeLanguage,
              nodeVersion,
              browsers,
              workers,
              retries,
            };

      await downloadCIZip(provider, config, generatedCode);
      setDeploySuccess(true);
    } catch (error) {
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
      const config: GitHubConfig = {
        testSuiteName,
        targetUrl,
        codeLanguage,
        nodeVersion,
        browsers,
        runOn: [
          ...(runOnPush ? (['push'] as const) : []),
          ...(runOnPR ? (['pull_request'] as const) : []),
        ],
        branches: ['main', 'master', 'develop'],
        schedule: undefined,
        workers,
        retries,
      };

      await deployToGitHub(githubToken, githubRepo, config, generatedCode);
      setDeploySuccess(true);
    } catch (error) {
      setDeployError((error as Error).message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      data-testid="ci-pipeline-wizard"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl"
      >
        <ThemedCard variant="glow" className="max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <motion.div
                className="flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <FileCode className="w-7 h-7" style={{ color: currentTheme.colors.accent }} />
                <h2 className="text-3xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
                  Generate CI/CD Pipeline
                </h2>
              </motion.div>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                style={{ backgroundColor: `${currentTheme.colors.surface}80` }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                data-testid="close-wizard-btn"
              >
                <X className="w-6 h-6" style={{ color: currentTheme.colors.text.secondary }} />
              </motion.button>
            </div>

            {/* Step Indicator */}
            <WizardStepIndicator currentStep={step} />
            {/* Content */}
            <AnimatePresence mode="wait">
              {step === 'select-provider' && (
                <ProviderSelector onSelect={handleProviderSelect} />
              )}

              {step === 'configure' && provider && (
                <ConfigurationForm
                  provider={provider}
                  nodeVersion={nodeVersion}
                  setNodeVersion={setNodeVersion}
                  browsers={browsers}
                  setBrowsers={setBrowsers}
                  runOnPush={runOnPush}
                  setRunOnPush={setRunOnPush}
                  runOnPR={runOnPR}
                  setRunOnPR={setRunOnPR}
                  workers={workers}
                  setWorkers={setWorkers}
                  retries={retries}
                  setRetries={setRetries}
                  onBack={handleBack}
                  onNext={() => setStep('deploy')}
                />
              )}

              {step === 'deploy' && provider && (
                <DeploymentOptions
                  provider={provider}
                  isDeploying={isDeploying}
                  deployError={deployError}
                  deploySuccess={deploySuccess}
                  githubToken={githubToken}
                  setGithubToken={setGithubToken}
                  githubRepo={githubRepo}
                  setGithubRepo={setGithubRepo}
                  onDeployToGitHub={handleDeployToGitHub}
                  onDownloadZip={handleDownloadZip}
                  onBack={handleBack}
                />
              )}
            </AnimatePresence>
          </div>
        </ThemedCard>
      </motion.div>
    </motion.div>
  );
}
