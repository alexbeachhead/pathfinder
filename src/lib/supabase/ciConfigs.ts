import { supabase } from './supabase';

export interface CIConfiguration {
  id: string;
  suite_id: string;
  provider: 'github' | 'gitlab';
  node_version: string;
  playwright_version: string;
  code_language: 'javascript' | 'typescript';
  browsers: ('chromium' | 'firefox' | 'webkit')[];
  workers: number;
  retries: number;
  run_on_push?: boolean;
  run_on_pull_request?: boolean;
  branches?: string[];
  schedule?: string;
  deployed: boolean;
  deployed_at?: string;
  deployment_method?: 'api' | 'manual' | 'zip';
  repository_url?: string;
  commit_sha?: string;
  generated_files?: string[];
  configuration_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface CIDeploymentLog {
  id: string;
  ci_config_id: string;
  deployment_status: 'pending' | 'in_progress' | 'success' | 'failed';
  deployment_method: 'api' | 'manual' | 'zip';
  github_repo?: string;
  github_branch?: string;
  commit_sha?: string;
  commit_url?: string;
  error_message?: string;
  error_details?: Record<string, unknown>;
  deployed_by?: string;
  deployment_duration_ms?: number;
  files_deployed?: string[];
  started_at: string;
  completed_at?: string;
}

/**
 * Create a new CI configuration
 */
export async function createCIConfiguration(
  config: Omit<CIConfiguration, 'id' | 'created_at' | 'updated_at' | 'deployed' | 'deployed_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('ci_configurations')
    .insert({
      suite_id: config.suite_id,
      provider: config.provider,
      node_version: config.node_version,
      playwright_version: config.playwright_version,
      code_language: config.code_language,
      browsers: config.browsers,
      workers: config.workers,
      retries: config.retries,
      run_on_push: config.run_on_push,
      run_on_pull_request: config.run_on_pull_request,
      branches: config.branches,
      schedule: config.schedule,
      repository_url: config.repository_url,
      generated_files: config.generated_files,
      configuration_hash: config.configuration_hash,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating CI configuration:', error);
    throw new Error(error.message);
  }

  return data.id;
}

/**
 * Get CI configuration by ID
 */
export async function getCIConfiguration(id: string): Promise<CIConfiguration | null> {
  const { data, error } = await supabase
    .from('ci_configurations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching CI configuration:', error);
    return null;
  }

  return data as CIConfiguration;
}

/**
 * Get latest CI configuration for a test suite
 */
export async function getLatestCIConfig(
  suiteId: string,
  provider?: 'github' | 'gitlab'
): Promise<CIConfiguration | null> {
  let query = supabase
    .from('ci_configurations')
    .select('*')
    .eq('suite_id', suiteId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (provider) {
    query = query.eq('provider', provider);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null;
    }
    console.error('Error fetching latest CI configuration:', error);
    return null;
  }

  return data as CIConfiguration;
}

/**
 * Get all CI configurations for a test suite
 */
export async function getCIConfigurationsForSuite(suiteId: string): Promise<CIConfiguration[]> {
  const { data, error } = await supabase
    .from('ci_configurations')
    .select('*')
    .eq('suite_id', suiteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching CI configurations:', error);
    throw new Error(error.message);
  }

  return (data as CIConfiguration[]) || [];
}

/**
 * Update CI configuration
 */
export async function updateCIConfiguration(
  id: string,
  updates: Partial<
    Omit<CIConfiguration, 'id' | 'suite_id' | 'created_at' | 'updated_at'>
  >
): Promise<void> {
  const { error } = await supabase
    .from('ci_configurations')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating CI configuration:', error);
    throw new Error(error.message);
  }
}

/**
 * Mark CI configuration as deployed
 */
export async function markCIConfigurationDeployed(
  id: string,
  deploymentDetails: {
    deployment_method: 'api' | 'manual' | 'zip';
    repository_url?: string;
    commit_sha?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('ci_configurations')
    .update({
      deployed: true,
      deployed_at: new Date().toISOString(),
      deployment_method: deploymentDetails.deployment_method,
      repository_url: deploymentDetails.repository_url,
      commit_sha: deploymentDetails.commit_sha,
    })
    .eq('id', id);

  if (error) {
    console.error('Error marking CI configuration as deployed:', error);
    throw new Error(error.message);
  }
}

/**
 * Delete CI configuration
 */
export async function deleteCIConfiguration(id: string): Promise<void> {
  const { error } = await supabase
    .from('ci_configurations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting CI configuration:', error);
    throw new Error(error.message);
  }
}

/**
 * Create a deployment log entry
 */
export async function createDeploymentLog(
  log: Omit<CIDeploymentLog, 'id' | 'started_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('ci_deployment_logs')
    .insert({
      ci_config_id: log.ci_config_id,
      deployment_status: log.deployment_status,
      deployment_method: log.deployment_method,
      github_repo: log.github_repo,
      github_branch: log.github_branch,
      commit_sha: log.commit_sha,
      commit_url: log.commit_url,
      error_message: log.error_message,
      error_details: log.error_details,
      deployed_by: log.deployed_by,
      deployment_duration_ms: log.deployment_duration_ms,
      files_deployed: log.files_deployed,
      completed_at: log.completed_at,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating deployment log:', error);
    throw new Error(error.message);
  }

  return data.id;
}

/**
 * Update deployment log status
 */
export async function updateDeploymentLog(
  id: string,
  updates: Partial<Omit<CIDeploymentLog, 'id' | 'ci_config_id' | 'started_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('ci_deployment_logs')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating deployment log:', error);
    throw new Error(error.message);
  }
}

/**
 * Get deployment logs for a CI configuration
 */
export async function getDeploymentLogs(ciConfigId: string): Promise<CIDeploymentLog[]> {
  const { data, error } = await supabase
    .from('ci_deployment_logs')
    .select('*')
    .eq('ci_config_id', ciConfigId)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching deployment logs:', error);
    throw new Error(error.message);
  }

  return (data as CIDeploymentLog[]) || [];
}

/**
 * Get deployment statistics for a test suite
 */
export async function getCIDeploymentStats(
  suiteId: string
): Promise<{
  total_configs: number;
  deployed_configs: number;
  total_deployments: number;
  successful_deployments: number;
  failed_deployments: number;
  last_deployment?: string;
}> {
  // Get all configurations for the suite
  const configs = await getCIConfigurationsForSuite(suiteId);

  const deployedConfigs = configs.filter((c) => c.deployed);

  // Get all deployment logs for these configs
  const allLogs = await Promise.all(
    configs.map((config) => getDeploymentLogs(config.id))
  );
  const flatLogs = allLogs.flat();

  const successfulDeployments = flatLogs.filter(
    (log) => log.deployment_status === 'success'
  );
  const failedDeployments = flatLogs.filter(
    (log) => log.deployment_status === 'failed'
  );

  const lastDeployment =
    flatLogs.length > 0
      ? flatLogs.sort((a, b) =>
          new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
        )[0].started_at
      : undefined;

  return {
    total_configs: configs.length,
    deployed_configs: deployedConfigs.length,
    total_deployments: flatLogs.length,
    successful_deployments: successfulDeployments.length,
    failed_deployments: failedDeployments.length,
    last_deployment: lastDeployment,
  };
}
