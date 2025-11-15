import { supabase } from '../supabase';
import { TestIssueLink, IssueTrackerType } from '../types';

/**
 * Create a new test issue link
 */
export async function createIssueLink(
  resultId: string,
  ticketId: string,
  trackerType: IssueTrackerType,
  ticketUrl: string,
  ticketKey: string
): Promise<{ data: TestIssueLink | null; error: Error | null }> {
  try {
    const issueLink: TestIssueLink = {
      id: crypto.randomUUID(),
      result_id: resultId,
      ticket_id: ticketId,
      tracker_type: trackerType,
      ticket_url: ticketUrl,
      ticket_key: ticketKey,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('test_issue_links')
      .insert(issueLink)
      .select()
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get issue links for a specific test result
 */
export async function getIssueLinksForResult(
  resultId: string
): Promise<{ data: TestIssueLink[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('test_issue_links')
      .select('*')
      .eq('result_id', resultId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get all issue links for a test run
 */
export async function getIssueLinksForRun(
  runId: string
): Promise<{ data: TestIssueLink[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('test_issue_links')
      .select(`
        *,
        test_results!inner(run_id)
      `)
      .eq('test_results.run_id', runId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get issue link by ticket ID
 */
export async function getIssueLinkByTicketId(
  ticketId: string
): Promise<{ data: TestIssueLink | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('test_issue_links')
      .select('*')
      .eq('ticket_id', ticketId)
      .single();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Delete an issue link
 */
export async function deleteIssueLink(
  linkId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('test_issue_links')
      .delete()
      .eq('id', linkId);

    if (error) {
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get statistics about issue links by tracker type
 */
export async function getIssueLinkStats(): Promise<{
  data: Array<{ tracker_type: IssueTrackerType; count: number }> | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('test_issue_links')
      .select('tracker_type')
      .order('tracker_type');

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    // Count by tracker type
    const stats = data.reduce((acc, link) => {
      const existing = acc.find((s) => s.tracker_type === link.tracker_type);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ tracker_type: link.tracker_type as IssueTrackerType, count: 1 });
      }
      return acc;
    }, [] as Array<{ tracker_type: IssueTrackerType; count: number }>);

    return { data: stats, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
