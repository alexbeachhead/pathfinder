// Issue Tracker Types

export type IssueTrackerType = 'jira' | 'github' | 'trello';

export interface IssueTrackerConfig {
  type: IssueTrackerType;
  apiKey: string;
  baseUrl: string;
  projectKey?: string; // For Jira
  repositoryOwner?: string; // For GitHub
  repositoryName?: string; // For GitHub
  boardId?: string; // For Trello
  listId?: string; // For Trello
}

export interface IssueTicket {
  id: string;
  title: string;
  description: string;
  url: string;
  status: string;
  createdAt: string;
  tracker: IssueTrackerType;
}

export interface TestIssueLink {
  id: string;
  result_id: string;
  ticket_id: string;
  tracker_type: IssueTrackerType;
  ticket_url: string;
  ticket_key: string;
  created_at: string;
}

export interface CreateTicketRequest {
  testName: string;
  viewport: string;
  viewportSize: string;
  status: 'pass' | 'fail' | 'skipped';
  duration?: number;
  errors?: Array<{
    message: string;
    stack?: string;
    line?: number;
    column?: number;
  }>;
  consoleLogs?: Array<{
    type: 'log' | 'warn' | 'error' | 'info';
    message: string;
    timestamp: string;
  }>;
  screenshots?: Array<{
    type: 'before' | 'after' | 'diff';
    url: string;
  }>;
  testRunId: string;
  testSuiteName: string;
  targetUrl: string;
}

export interface CreateTicketResponse {
  success: boolean;
  ticket?: IssueTicket;
  error?: string;
}
