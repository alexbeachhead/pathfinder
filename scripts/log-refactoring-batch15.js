const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

const logEntry = {
  id: randomUUID(),
  project_id: '108b16e3-019b-469c-a329-47138d60a21f',
  requirement_name: 'Refactoring Tasks - Batch 15 of 23',
  title: 'Code Quality Improvements Batch 15',
  overview: `Completed comprehensive code quality refactoring addressing 20 issues across reports and runner components:

**Key Improvements:**
1. Removed unused imports from 4 files (ScreenshotComparison, ReportOverview, HistoricalComparison, ViewportConfigurator)
2. Removed console.log statements from 3 files, replacing with silent error handling
3. Created reusable helper utilities (reportHelpers.ts) for color functions and status helpers
4. Extracted duplicated code into reusable components:
   - MetricCard.tsx - Standardized metric display component
   - ComparisonMetricRow.tsx - Reusable comparison metric row
5. Refactored RootCauseAnalysisModal to use centralized helper functions
6. Refactored HistoricalComparison reducing 100+ lines of duplicated code

**Files Modified:**
- src/app/features/reports/components/ScreenshotComparison.tsx
- src/app/features/reports/components/RootCauseAnalysisModal.tsx
- src/app/features/reports/components/ReportOverview.tsx
- src/app/features/reports/components/HistoricalComparison.tsx
- src/app/features/runner/components/ViewportConfigurator.tsx
- src/app/features/runner/components/TestSuiteSelector.tsx

**Files Created:**
- src/app/features/reports/lib/reportHelpers.ts (utility functions)
- src/app/features/reports/components/MetricCard.tsx (reusable component)
- src/app/features/reports/components/ComparisonMetricRow.tsx (reusable component)

**Impact:**
- Reduced code duplication by ~150 lines
- Improved maintainability with centralized color/status logic
- Enhanced code organization with reusable components
- Cleaner production code without console statements
- Smaller bundle size from removed unused imports`,
  tested: 0,
  created_at: new Date().toISOString()
};

try {
  const stmt = db.prepare(`
    INSERT INTO implementation_log (id, project_id, requirement_name, title, overview, tested, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    logEntry.id,
    logEntry.project_id,
    logEntry.requirement_name,
    logEntry.title,
    logEntry.overview,
    logEntry.tested,
    logEntry.created_at
  );

  console.log('✅ Implementation log entry created successfully!');
  console.log(`   ID: ${logEntry.id}`);
  console.log(`   Title: ${logEntry.title}`);
} catch (error) {
  console.error('❌ Failed to create log entry:', error.message);
  process.exit(1);
} finally {
  db.close();
}
