import {
  IssueTrackerType,
  IssueTrackerConfig,
  IssueTicket,
  CreateTicketRequest,
  CreateTicketResponse,
} from './types';

/**
 * Issue Tracker Service
 * Manages integration with Jira, GitHub Issues, and Trello
 */
export class IssueTrackerService {
  private config: IssueTrackerConfig | null = null;

  constructor(config?: IssueTrackerConfig) {
    if (config) {
      this.config = config;
    }
  }

  /**
   * Set or update configuration
   */
  setConfig(config: IssueTrackerConfig) {
    this.config = config;
  }

  /**
   * Get current configuration
   */
  getConfig(): IssueTrackerConfig | null {
    return this.config;
  }

  /**
   * Create a ticket in the configured issue tracker
   */
  async createTicket(request: CreateTicketRequest): Promise<CreateTicketResponse> {
    if (!this.config) {
      return {
        success: false,
        error: 'Issue tracker not configured. Please configure Jira, GitHub, or Trello integration.',
      };
    }

    try {
      switch (this.config.type) {
        case 'jira':
          return await this.createJiraTicket(request);
        case 'github':
          return await this.createGitHubIssue(request);
        case 'trello':
          return await this.createTrelloCard(request);
        default:
          return {
            success: false,
            error: `Unsupported tracker type: ${this.config.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Create a Jira ticket
   */
  private async createJiraTicket(request: CreateTicketRequest): Promise<CreateTicketResponse> {
    if (!this.config || !this.config.projectKey) {
      return {
        success: false,
        error: 'Jira project key not configured',
      };
    }

    const description = this.generateJiraDescription(request);
    const summary = `[Test Failure] ${request.testName} - ${request.viewport}`;

    const payload = {
      fields: {
        project: {
          key: this.config.projectKey,
        },
        summary,
        description,
        issuetype: {
          name: 'Bug',
        },
        labels: ['automated-test', 'qa', request.viewport.toLowerCase()],
        priority: {
          name: request.status === 'fail' ? 'High' : 'Medium',
        },
      },
    };

    const response = await fetch(`${this.config.baseUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Jira API error: ${error}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      ticket: {
        id: data.id,
        title: summary,
        description,
        url: `${this.config.baseUrl}/browse/${data.key}`,
        status: 'Open',
        createdAt: new Date().toISOString(),
        tracker: 'jira',
      },
    };
  }

  /**
   * Create a GitHub issue
   */
  private async createGitHubIssue(request: CreateTicketRequest): Promise<CreateTicketResponse> {
    if (!this.config || !this.config.repositoryOwner || !this.config.repositoryName) {
      return {
        success: false,
        error: 'GitHub repository not configured',
      };
    }

    const title = `[Test Failure] ${request.testName} - ${request.viewport}`;
    const body = this.generateGitHubDescription(request);

    const payload = {
      title,
      body,
      labels: ['bug', 'automated-test', 'qa', request.viewport.toLowerCase()],
    };

    const response = await fetch(
      `https://api.github.com/repos/${this.config.repositoryOwner}/${this.config.repositoryName}/issues`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `GitHub API error: ${error}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      ticket: {
        id: data.id.toString(),
        title,
        description: body,
        url: data.html_url,
        status: data.state,
        createdAt: data.created_at,
        tracker: 'github',
      },
    };
  }

  /**
   * Create a Trello card
   */
  private async createTrelloCard(request: CreateTicketRequest): Promise<CreateTicketResponse> {
    if (!this.config || !this.config.listId) {
      return {
        success: false,
        error: 'Trello list not configured',
      };
    }

    const name = `[Test Failure] ${request.testName} - ${request.viewport}`;
    const desc = this.generateTrelloDescription(request);

    const payload = {
      name,
      desc,
      idList: this.config.listId,
      pos: 'top',
      labels: request.status === 'fail' ? 'red' : 'orange',
    };

    const response = await fetch(
      `https://api.trello.com/1/cards?key=${this.config.apiKey}&token=${this.config.baseUrl}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Trello API error: ${error}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      ticket: {
        id: data.id,
        title: name,
        description: desc,
        url: data.url,
        status: 'Open',
        createdAt: new Date().toISOString(),
        tracker: 'trello',
      },
    };
  }

  /**
   * Generate Jira-formatted description
   */
  private generateJiraDescription(request: CreateTicketRequest): string {
    let description = `h2. Test Failure Details\n\n`;
    description += `*Test Name:* ${request.testName}\n`;
    description += `*Viewport:* ${request.viewport} (${request.viewportSize})\n`;
    description += `*Status:* ${request.status.toUpperCase()}\n`;
    description += `*Duration:* ${request.duration ? `${request.duration}ms` : 'N/A'}\n`;
    description += `*Test Suite:* ${request.testSuiteName}\n`;
    description += `*Target URL:* ${request.targetUrl}\n`;
    description += `*Run ID:* ${request.testRunId}\n\n`;

    if (request.errors && request.errors.length > 0) {
      description += `h3. Errors\n\n`;
      request.errors.forEach((error, index) => {
        description += `{panel:title=Error ${index + 1}}\n`;
        description += `*Message:* ${error.message}\n`;
        if (error.line && error.column) {
          description += `*Location:* Line ${error.line}, Column ${error.column}\n`;
        }
        if (error.stack) {
          description += `\n*Stack Trace:*\n{code}\n${error.stack}\n{code}\n`;
        }
        description += `{panel}\n\n`;
      });
    }

    if (request.screenshots && request.screenshots.length > 0) {
      description += `h3. Screenshots\n\n`;
      request.screenshots.forEach((screenshot) => {
        description += `* [${screenshot.type.toUpperCase()}|${screenshot.url}]\n`;
      });
      description += `\n`;
    }

    if (request.consoleLogs && request.consoleLogs.length > 0) {
      description += `h3. Console Logs\n\n`;
      description += `{code}\n`;
      request.consoleLogs.slice(0, 10).forEach((log) => {
        description += `[${log.type.toUpperCase()}] ${log.message}\n`;
      });
      if (request.consoleLogs.length > 10) {
        description += `... and ${request.consoleLogs.length - 10} more logs\n`;
      }
      description += `{code}\n`;
    }

    return description;
  }

  /**
   * Generate GitHub-formatted description
   */
  private generateGitHubDescription(request: CreateTicketRequest): string {
    let description = `## Test Failure Details\n\n`;
    description += `- **Test Name:** ${request.testName}\n`;
    description += `- **Viewport:** ${request.viewport} (${request.viewportSize})\n`;
    description += `- **Status:** ${request.status.toUpperCase()}\n`;
    description += `- **Duration:** ${request.duration ? `${request.duration}ms` : 'N/A'}\n`;
    description += `- **Test Suite:** ${request.testSuiteName}\n`;
    description += `- **Target URL:** ${request.targetUrl}\n`;
    description += `- **Run ID:** ${request.testRunId}\n\n`;

    if (request.errors && request.errors.length > 0) {
      description += `## Errors\n\n`;
      request.errors.forEach((error, index) => {
        description += `### Error ${index + 1}\n\n`;
        description += `**Message:** ${error.message}\n\n`;
        if (error.line && error.column) {
          description += `**Location:** Line ${error.line}, Column ${error.column}\n\n`;
        }
        if (error.stack) {
          description += `**Stack Trace:**\n\`\`\`\n${error.stack}\n\`\`\`\n\n`;
        }
      });
    }

    if (request.screenshots && request.screenshots.length > 0) {
      description += `## Screenshots\n\n`;
      request.screenshots.forEach((screenshot) => {
        description += `- [${screenshot.type.toUpperCase()}](${screenshot.url})\n`;
      });
      description += `\n`;
    }

    if (request.consoleLogs && request.consoleLogs.length > 0) {
      description += `## Console Logs\n\n`;
      description += `\`\`\`\n`;
      request.consoleLogs.slice(0, 10).forEach((log) => {
        description += `[${log.type.toUpperCase()}] ${log.message}\n`;
      });
      if (request.consoleLogs.length > 10) {
        description += `... and ${request.consoleLogs.length - 10} more logs\n`;
      }
      description += `\`\`\`\n`;
    }

    description += `\n---\n*This issue was automatically generated by Pathfinder Test Automation*`;

    return description;
  }

  /**
   * Generate Trello-formatted description
   */
  private generateTrelloDescription(request: CreateTicketRequest): string {
    let description = `**Test Failure Details**\n\n`;
    description += `Test Name: ${request.testName}\n`;
    description += `Viewport: ${request.viewport} (${request.viewportSize})\n`;
    description += `Status: ${request.status.toUpperCase()}\n`;
    description += `Duration: ${request.duration ? `${request.duration}ms` : 'N/A'}\n`;
    description += `Test Suite: ${request.testSuiteName}\n`;
    description += `Target URL: ${request.targetUrl}\n`;
    description += `Run ID: ${request.testRunId}\n\n`;

    if (request.errors && request.errors.length > 0) {
      description += `**Errors**\n\n`;
      request.errors.forEach((error, index) => {
        description += `Error ${index + 1}: ${error.message}\n`;
        if (error.line && error.column) {
          description += `Location: Line ${error.line}, Column ${error.column}\n`;
        }
      });
      description += `\n`;
    }

    if (request.screenshots && request.screenshots.length > 0) {
      description += `**Screenshots**\n\n`;
      request.screenshots.forEach((screenshot) => {
        description += `${screenshot.type.toUpperCase()}: ${screenshot.url}\n`;
      });
      description += `\n`;
    }

    description += `\n---\nGenerated by Pathfinder Test Automation`;

    return description;
  }

  /**
   * Test connection to the configured issue tracker
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config) {
      return {
        success: false,
        message: 'No configuration set',
      };
    }

    try {
      switch (this.config.type) {
        case 'jira':
          return await this.testJiraConnection();
        case 'github':
          return await this.testGitHubConnection();
        case 'trello':
          return await this.testTrelloConnection();
        default:
          return {
            success: false,
            message: `Unsupported tracker type: ${this.config.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async testJiraConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config) return { success: false, message: 'No config' };

    const response = await fetch(`${this.config.baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    return {
      success: response.ok,
      message: response.ok ? 'Connected to Jira' : 'Failed to connect to Jira',
    };
  }

  private async testGitHubConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config) return { success: false, message: 'No config' };

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    return {
      success: response.ok,
      message: response.ok ? 'Connected to GitHub' : 'Failed to connect to GitHub',
    };
  }

  private async testTrelloConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config) return { success: false, message: 'No config' };

    const response = await fetch(
      `https://api.trello.com/1/members/me?key=${this.config.apiKey}&token=${this.config.baseUrl}`
    );

    return {
      success: response.ok,
      message: response.ok ? 'Connected to Trello' : 'Failed to connect to Trello',
    };
  }
}

// Singleton instance
export const issueTrackerService = new IssueTrackerService();
