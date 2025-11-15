import { supabase } from '../supabase';
import type { Project } from '@/lib/stores/appStore';

/**
 * Get all test projects
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const { data, error } = await supabase
      .from('test_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching test projects:', error);
    return [];
  }
}

/**
 * Get a single test project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('test_projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching test project:', error);
    return null;
  }
}

/**
 * Create a new test project
 */
export async function createProject(
  name: string,
  repo?: string,
  description?: string
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('test_projects')
      .insert({ name, repo, description })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating test project:', error);
    return null;
  }
}

/**
 * Update an existing test project
 */
export async function updateProject(
  id: string,
  updates: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>
): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('test_projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error updating test project:', error);
    return null;
  }
}

/**
 * Delete a test project
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('test_projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting test project:', error);
    return false;
  }
}
