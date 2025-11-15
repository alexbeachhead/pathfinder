const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

const logEntry = {
  id: randomUUID(),
  project_id: '108b16e3-019b-469c-a329-47138d60a21f',
  requirement_name: 'test-suite-mascot-generator',
  title: 'Test Suite Mascot Generator',
  overview: `Implemented a playful mascot generator feature that creates unique SVG mascots for test suites. The feature includes five mascot types (Robot, Wizard, Ninja, Explorer, Detective) that are automatically inferred from test suite names and descriptions. Each mascot can be customized with team colors using preset color schemes or custom RGB values. The mascot appears with smooth animations in the Designer wizard header and in test suite list items on the dashboard. Key files created: mascotGenerator.ts (SVG generation utility with type inference), MascotAvatar.tsx (animated component), and MascotCustomizer.tsx (customization UI in StepSetup). The feature integrates seamlessly with the existing theme system and uses Framer Motion for delightful entrance animations. All interactive components include data-testid attributes for automated testing.`,
  tested: 0,
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

  console.log('Implementation log entry created successfully!');
  console.log('Entry ID:', logEntry.id);
  console.log('Title:', logEntry.title);
} catch (error) {
  console.error('Error creating log entry:', error);
  process.exit(1);
} finally {
  db.close();
}
