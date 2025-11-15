import { createClient } from '@supabase/supabase-js';
import type {
  TestSuite,
  TestRun,
  TestResult,
  AIAnalysis,
  TestCode
} from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generic database helpers to reduce code duplication
async function fetchAll<T>(table: string, orderBy: string = 'created_at'): Promise<T[]> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderBy, { ascending: false });

  if (error) throw error;
  return data as T[];
}

async function fetchById<T>(table: string, id: string): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as T;
}

async function insertOne<T>(table: string, record: unknown): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data as T;
}

async function updateOne<T>(table: string, id: string, updates: unknown): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as T;
}

async function deleteOne(table: string, id: string): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Test Suites Operations
export const testSuiteOperations = {
  async getAll() {
    return fetchAll<TestSuite>('test_suites');
  },

  async getById(id: string) {
    return fetchById<TestSuite>('test_suites', id);
  },

  async create(suite: Omit<TestSuite, 'id' | 'created_at' | 'updated_at'>) {
    return insertOne<TestSuite>('test_suites', suite);
  },

  async update(id: string, updates: Partial<TestSuite>) {
    return updateOne<TestSuite>('test_suites', id, {
      ...updates,
      updated_at: new Date().toISOString()
    });
  },

  async delete(id: string) {
    return deleteOne('test_suites', id);
  },
};

// Test Runs Operations
export const testRunOperations = {
  async getAll(suiteId?: string) {
    let query = supabase
      .from('test_runs')
      .select('*')
      .order('created_at', { ascending: false });

    if (suiteId) {
      query = query.eq('suite_id', suiteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as TestRun[];
  },

  async getById(id: string) {
    return fetchById<TestRun>('test_runs', id);
  },

  async create(run: Omit<TestRun, 'id' | 'created_at'>) {
    return insertOne<TestRun>('test_runs', run);
  },

  async updateStatus(
    id: string,
    status: TestRun['status'],
    additionalData?: Partial<TestRun>
  ) {
    const updates: Partial<TestRun> = { status, ...additionalData };

    if (status === 'running' && !additionalData?.started_at) {
      updates.started_at = new Date().toISOString();
    }

    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }

    return updateOne<TestRun>('test_runs', id, updates);
  },
};

// Test Results Operations
export const testResultOperations = {
  async getByRunId(runId: string) {
    const { data, error } = await supabase
      .from('test_results')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as TestResult[];
  },

  async create(result: Omit<TestResult, 'id' | 'created_at'>) {
    return insertOne<TestResult>('test_results', result);
  },
};

// AI Analysis Operations
export const aiAnalysisOperations = {
  async getByResultId(resultId: string) {
    const { data, error } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('result_id', resultId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as AIAnalysis[];
  },

  async create(analysis: Omit<AIAnalysis, 'id' | 'created_at'>) {
    return insertOne<AIAnalysis>('ai_analyses', analysis);
  },
};

// Test Code Operations
export const testCodeOperations = {
  async getBySuiteId(suiteId: string) {
    const { data, error } = await supabase
      .from('test_code')
      .select('*')
      .eq('suite_id', suiteId)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data as TestCode;
  },

  async create(code: Omit<TestCode, 'id' | 'created_at'>) {
    return insertOne<TestCode>('test_code', code);
  },
};

// Real-time Subscriptions
export const subscribeToTestRuns = (
  suiteId: string,
  callback: (payload: TestRun) => void
) => {
  return supabase
    .channel(`test_runs:suite_id=eq.${suiteId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'test_runs',
        filter: `suite_id=eq.${suiteId}`,
      },
      (payload) => {
        callback(payload.new as TestRun);
      }
    )
    .subscribe();
};

export const subscribeToTestResults = (
  runId: string,
  callback: (payload: TestResult) => void
) => {
  return supabase
    .channel(`test_results:run_id=eq.${runId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'test_results',
        filter: `run_id=eq.${runId}`,
      },
      (payload) => {
        callback(payload.new as TestResult);
      }
    )
    .subscribe();
};
