import { supabase } from '../supabase';
import { TestScenario } from '../types';

/**
 * Save test scenarios to database
 */
export async function saveTestScenarios(
  suiteId: string,
  scenarios: TestScenario[]
): Promise<void> {
  if (!scenarios || scenarios.length === 0) {
    return;
  }

  const scenarioRecords = scenarios.map((scenario, index) => ({
    suite_id: suiteId,
    title: scenario.name || `Scenario ${index + 1}`, // Use 'name' field from TestScenario
    description: scenario.description || '',
    steps: scenario.steps || [],
    priority: scenario.priority || 'medium',
    category: scenario.category || 'functional',
    expected_outcome: Array.isArray(scenario.expectedOutcomes)
      ? scenario.expectedOutcomes.join('; ')
      : '', // Convert array to string
    confidence_score: 0.8, // Default confidence score
    order_index: index,
    target_url: scenario.targetUrl ?? null,
  }));

  const { error } = await supabase
    .from('test_scenarios')
    .insert(scenarioRecords);

  if (error) {
    console.error('Failed to save test scenarios:', error);
    throw new Error(`Failed to save scenarios: ${error.message}`);
  }
}

/**
 * Get test scenarios for a test suite
 */
export async function getTestScenarios(suiteId: string): Promise<TestScenario[]> {
  const { data, error } = await supabase
    .from('test_scenarios')
    .select('*')
    .eq('suite_id', suiteId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Failed to fetch test scenarios:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((record) => ({
    id: record.id,
    name: record.title, // Map 'title' to 'name' field
    description: record.description,
    steps: record.steps,
    priority: record.priority,
    category: record.category,
    expectedOutcomes: record.expected_outcome
      ? record.expected_outcome.split('; ')
      : [], // Convert string back to array
    viewports: [], // Default empty array, could be enhanced later
    targetUrl: record.target_url ?? undefined,
  }));
}


/**
 * Delete all scenarios for a test suite
 */
export async function deleteTestScenarios(suiteId: string): Promise<void> {
  const { error } = await supabase
    .from('test_scenarios')
    .delete()
    .eq('suite_id', suiteId);

  if (error) {
    console.error('Failed to delete test scenarios:', error);
    throw new Error(`Failed to delete scenarios: ${error.message}`);
  }
}

/**
 * Delete a single test scenario by id
 */
export async function deleteTestScenario(scenarioId: string): Promise<void> {
  const { error } = await supabase
    .from('test_scenarios')
    .delete()
    .eq('id', scenarioId);

  if (error) {
    console.error('Failed to delete test scenario:', error);
    throw new Error(`Failed to delete scenario: ${error.message}`);
  }
}

/**
 * Update a test scenario
 */
export async function updateTestScenario(
  scenarioId: string,
  updates: Partial<TestScenario>
): Promise<void> {
  const updateData: Record<string, unknown> = {};

  if (updates.name !== undefined) updateData.title = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.steps !== undefined) updateData.steps = updates.steps;
  if (updates.priority !== undefined) updateData.priority = updates.priority;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.expectedOutcomes !== undefined) {
    updateData.expected_outcome = Array.isArray(updates.expectedOutcomes)
      ? updates.expectedOutcomes.join('; ')
      : '';
  }
  if (updates.targetUrl !== undefined) updateData.target_url = updates.targetUrl || null;

  const { error } = await supabase
    .from('test_scenarios')
    .update(updateData)
    .eq('id', scenarioId);

  if (error) {
    console.error('Failed to update test scenario:', error);
    throw new Error(`Failed to update scenario: ${error.message}`);
  }
}

/**
 * Save a single flow scenario
 */
export async function saveFlowScenario(
  suiteId: string,
  flowName: string,
  flowDescription: string,
  flowSteps: any[],
  targetUrl?: string
): Promise<string> {
  const scenarioRecord = {
    suite_id: suiteId,
    title: flowName,
    description: flowDescription,
    steps: flowSteps,
    priority: 'medium',
    category: 'flow-builder',
    confidence_score: 1.0, // User-created flows have full confidence
    order_index: 0,
    target_url: targetUrl?.trim() || null,
  };

  const { data, error } = await supabase
    .from('test_scenarios')
    .insert([scenarioRecord])
    .select()
    .single();

  if (error) {
    console.error('Failed to save flow scenario:', error);
    throw new Error(`Failed to save flow: ${error.message}`);
  }

  return data.id;
}

/**
 * Update an existing flow scenario
 */
export async function updateFlowScenario(
  scenarioId: string,
  flowName: string,
  flowDescription: string,
  flowSteps: any[],
  targetUrl?: string
): Promise<void> {
  const updatePayload: Record<string, unknown> = {
    title: flowName,
    description: flowDescription,
    steps: flowSteps,
  };
  if (targetUrl !== undefined) updatePayload.target_url = targetUrl?.trim() || null;

  const { error } = await supabase
    .from('test_scenarios')
    .update(updatePayload)
    .eq('id', scenarioId);

  if (error) {
    console.error('Failed to update flow scenario:', error);
    throw new Error(`Failed to update flow: ${error.message}`);
  }
}

/**
 * Get flow scenarios for a suite
 */
export async function getFlowScenarios(suiteId: string): Promise<TestScenario[]> {
  const { data, error } = await supabase
    .from('test_scenarios')
    .select('*')
    .eq('suite_id', suiteId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch flow scenarios:', error);
    return [];
  }

  if (!data) {
    return [];
  }

  return data.map((record) => ({
    id: record.id,
    name: record.title,
    description: record.description,
    steps: record.steps,
    priority: record.priority,
    category: record.category,
    expectedOutcomes: record.expected_outcome
      ? record.expected_outcome.split('; ')
      : [],
    viewports: [],
    targetUrl: record.target_url ?? undefined,
  }));
}
