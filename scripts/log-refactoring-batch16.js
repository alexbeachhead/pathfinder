const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('database/goals.db');

const id = randomUUID();
const projectId = '108b16e3-019b-469c-a329-47138d60a21f';
const requirementName = 'refactoring-batch-16';
const title = 'Code Quality Refactoring - Batch 16';
const overview = `Completed comprehensive refactoring of 20 code quality issues across runner and nl-test feature components. Key improvements include: (1) Extracted duplicated status display logic into reusable helper functions in TestSuiteCard, RunHistoryPanel, QueuePanel, and LiveLogsPanel components. (2) Removed console.log statements from RunHistoryPanel and QueuePanel for cleaner production code. (3) Removed unused imports from LiveLogsPanel, PerformanceStats, and DifficultyBadge components. (4) Refactored ExecutionProgress component by extracting StatCard helper component to reduce duplication in statistics grid. (5) Refactored PerformanceStats component by extracting PerformanceTrendIndicator and StatCard components to eliminate code duplication and improve maintainability. (6) Improved code organization with helper functions for status colors, icons, and date formatting. All changes maintain existing functionality while significantly reducing code duplication and improving maintainability. Files modified: TestSuiteCard.tsx, RunHistoryPanel.tsx, QueuePanel.tsx, LiveLogsPanel.tsx, ExecutionProgress.tsx, PerformanceStats.tsx, and DifficultyBadge.tsx.`;

const stmt = db.prepare(`
  INSERT INTO implementation_log (id, project_id, requirement_name, title, overview, tested, created_at)
  VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
`);

stmt.run(id, projectId, requirementName, title, overview);

console.log('✅ Implementation log entry created successfully');
console.log('ID:', id);

db.close();
