import { CodeLanguage } from '@/lib/types';
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

export type CIProvider = 'github' | 'gitlab';
export type WizardStep = 'select-provider' | 'configure' | 'deploy';

export interface CIConfig {
  testSuiteName: string;
  targetUrl: string;
  codeLanguage: CodeLanguage;
  nodeVersion: string;
  browsers: ('chromium' | 'firefox' | 'webkit')[];
  workers: number;
  retries: number;
}

export interface GitHubConfig extends CIConfig {
  runOn: ('push' | 'pull_request')[];
  branches: string[];
  schedule?: string;
}

export interface GitLabConfig extends CIConfig {
  // GitLab specific config can be added here
}

/**
 * Generate configuration files for the selected CI provider
 */
export function generateCIFiles(
  provider: CIProvider,
  config: GitHubConfig | GitLabConfig,
  generatedCode: string
): Record<string, string> {
  const files: Record<string, string> = {};

  if (provider === 'github') {
    const githubConfig = config as GitHubConfig;
    const workflowName = githubConfig.testSuiteName.toLowerCase().replace(/\s+/g, '-');

    files[`.github/workflows/${workflowName}.yml`] = generateGitHubActionsWorkflow(
      githubConfig as GitHubActionsConfig
    );
    files['README.md'] = generateCIReadme(githubConfig as GitHubActionsConfig);
  } else {
    files['.gitlab-ci.yml'] = generateGitLabCIPipeline(config as GitLabCIConfig);
    files['README.md'] = generateGitLabCIReadme(config as GitLabCIConfig);
    files['GITLAB_CI_VARIABLES.md'] = generateGitLabCIVariables(config as GitLabCIConfig);
    files['GITLAB_PAGES.md'] = generateGitLabPagesConfig();
  }

  // Common files
  const extension = config.codeLanguage === 'typescript' ? 'ts' : 'js';
  files[`playwright.config.${extension}`] = generatePlaywrightConfig(
    config as GitHubActionsConfig
  );
  files[`tests/test.spec.${extension}`] = generatedCode;
  files['package.json.scripts'] = JSON.stringify(
    generatePackageJsonScripts(),
    null,
    2
  );

  return files;
}

/**
 * Create and download a ZIP file containing all CI/CD files
 */
export async function downloadCIZip(
  provider: CIProvider,
  config: GitHubConfig | GitLabConfig,
  generatedCode: string
): Promise<void> {
  const files = generateCIFiles(provider, config, generatedCode);

  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  Object.entries(files).forEach(([path, content]) => {
    zip.file(path, content);
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${config.testSuiteName.toLowerCase().replace(/\s+/g, '-')}-ci-pipeline.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Deploy CI/CD configuration to GitHub repository
 */
export async function deployToGitHub(
  githubToken: string,
  githubRepo: string,
  config: GitHubConfig,
  generatedCode: string
): Promise<void> {
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
}

/**
 * Validate configuration before proceeding
 */
export function validateCIConfig(
  config: Partial<CIConfig>,
  provider: CIProvider
): string | null {
  if (!config.nodeVersion) {
    return 'Node.js version is required';
  }

  if (!config.browsers || config.browsers.length === 0) {
    return 'At least one browser must be selected';
  }

  if (!config.workers || config.workers < 1) {
    return 'Workers must be at least 1';
  }

  if (config.retries === undefined || config.retries < 0) {
    return 'Retries must be 0 or greater';
  }

  if (provider === 'github') {
    const githubConfig = config as Partial<GitHubConfig>;
    if (!githubConfig.runOn || githubConfig.runOn.length === 0) {
      return 'At least one trigger event must be selected';
    }
  }

  return null;
}
