const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

const logEntry = {
  id: randomUUID(),
  project_id: '108b16e3-019b-469c-a329-47138d60a21f',
  requirement_name: 'launch-demo-run-on-first-visit',
  title: 'Demo Run on First Visit',
  overview: `Implemented an automatic demo run feature for first-time visitors to the Test Runner. When a user opens the Runner for the first time, the system automatically creates a lightweight demo test suite targeting 'https://playwright.dev', starts execution, and streams realistic logs with progress updates. A prominent banner explains this is a demo and provides two call-to-action buttons: 'Create Your Test Suite' (navigates to Designer) and 'Got it, thanks' (dismisses banner). The demo uses localStorage to track first-visit status and runs a simulated test across 3 viewports (iPhone 12, iPad, Tablet) with streaming logs that mimic real Playwright execution. Created files: demoRunner.ts (demo logic, log generation, first-visit detection), DemoBanner.tsx (themed banner component with animations), and integrated auto-start logic into RealRunner.tsx using useEffect. Added data-testid attributes to all interactive components for testing support (demo-banner, create-real-suite-btn, dismiss-demo-banner-btn, close-demo-banner-btn, viewport-toggle-*, test-suite-item-*, test-suite-search-input). The feature provides instant visual feedback, removes friction from onboarding, and demonstrates the core workflow without requiring manual configuration.`,
  tested: 0,
  created_at: new Date().toISOString()
};

try {
  const stmt = db.prepare(`
    INSERT INTO implementation_log (
      id,
      project_id,
      requirement_name,
      title,
      overview,
      tested,
      created_at
    ) VALUES (
      @id,
      @project_id,
      @requirement_name,
      @title,
      @overview,
      @tested,
      @created_at
    )
  `);

  const result = stmt.run(logEntry);
  console.log('✓ Implementation log entry created successfully');
  console.log(`  ID: ${logEntry.id}`);
  console.log(`  Title: ${logEntry.title}`);
  console.log(`  Requirement: ${logEntry.requirement_name}`);
} catch (error) {
  console.error('✗ Failed to create implementation log entry:', error.message);
  process.exit(1);
} finally {
  db.close();
}
