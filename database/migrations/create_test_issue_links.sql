-- Create table for tracking issue tracker links
CREATE TABLE IF NOT EXISTS test_issue_links (
  id TEXT PRIMARY KEY,
  result_id TEXT NOT NULL,
  ticket_id TEXT NOT NULL,
  tracker_type TEXT NOT NULL CHECK(tracker_type IN ('jira', 'github', 'trello')),
  ticket_url TEXT NOT NULL,
  ticket_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (result_id) REFERENCES test_results(id) ON DELETE CASCADE
);

-- Create index for faster lookups by result_id
CREATE INDEX IF NOT EXISTS idx_test_issue_links_result_id ON test_issue_links(result_id);

-- Create index for faster lookups by tracker_type
CREATE INDEX IF NOT EXISTS idx_test_issue_links_tracker_type ON test_issue_links(tracker_type);

-- Create index for faster lookups by ticket_id
CREATE INDEX IF NOT EXISTS idx_test_issue_links_ticket_id ON test_issue_links(ticket_id);
