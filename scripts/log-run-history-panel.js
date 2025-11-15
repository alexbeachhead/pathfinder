const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

const logEntry = {
  id: '34569a3c-8f12-4d3e-9c21-7b8e4d2a5f16',
  project_id: '108b16e3-019b-469c-a329-47138d60a21f',
  requirement_name: 'run-history-panel',
  title: 'Run History Panel',
  overview: 'Implemented RunHistoryPanel component that displays past test runs in a sortable table inside RealRunner. The panel queries Supabase using the new getTestRuns() function from testRuns.ts and displays runs with status indicators, duration information, and mini progress bars. Each row includes relaunch and view details buttons. The panel supports filtering by suite and sorting by date, status, or duration. Integrated into RealRunner layout in a new right column alongside TestSuiteSelector. Added test IDs to all interactive elements for automated testing. The feature reuses existing theme system, ExecutionProgress styling patterns, and Supabase helpers for consistency.',
  tested: 0
};

try {
  const stmt = db.prepare(`
    INSERT INTO implementation_log (id, project_id, requirement_name, title, overview, tested, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(
    logEntry.id,
    logEntry.project_id,
    logEntry.requirement_name,
    logEntry.title,
    logEntry.overview,
    logEntry.tested
  );

  console.log('✓ Implementation log entry created successfully');
  console.log(`  ID: ${logEntry.id}`);
  console.log(`  Title: ${logEntry.title}`);
} catch (error) {
  console.error('Error creating log entry:', error.message);
  process.exit(1);
} finally {
  db.close();
}
