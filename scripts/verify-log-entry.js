const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

try {
  const stmt = db.prepare(`
    SELECT id, requirement_name, title, tested, created_at
    FROM implementation_log
    WHERE requirement_name = ?
  `);

  const row = stmt.get('move-quality-metrics-aggregation-to-supabase');

  if (row) {
    console.log('\n✓ Implementation log entry verified:');
    console.log('  ID:', row.id);
    console.log('  Requirement:', row.requirement_name);
    console.log('  Title:', row.title);
    console.log('  Tested:', row.tested);
    console.log('  Created:', row.created_at);
  } else {
    console.log('\n✗ No log entry found for requirement: move-quality-metrics-aggregation-to-supabase');
  }
} catch (error) {
  console.error('Error querying database:', error.message);
  process.exit(1);
} finally {
  db.close();
}
