const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('C:\\Users\\kazda\\kiro\\pathfinder\\database\\goals.db');

const id = randomUUID();
const projectId = '108b16e3-019b-469c-a329-47138d60a21f';
const requirementName = 'Refactoring Tasks - Batch 11 of 23';
const title = 'Code Quality Improvements Batch 11';
const overview = `Implemented automated code quality improvements for Batch 11 of 23, focusing on removing console statements, cleaning up unused imports, refactoring code duplication, and fixing TypeScript type errors.

Key Changes:
1. Console Log Removal:
   - Removed console.error from src/app/features/reports/lib/useLazyImage.ts (line 121)
   - Removed console.error from src/app/api/ai/root-cause-analysis/[resultId]/route.ts (line 33)

2. Unused Import Cleanup:
   - Removed unused TestResult import from src/app/features/reports/lib/mockData.ts
   - Removed unused fillTemplate import from src/app/features/flow-builder/lib/flowSerializer.ts

3. Code Duplication Refactoring:
   - ThemedSelect.tsx: Extracted applyCSSProperties helper function to eliminate duplicate CSS property setting code (reduced ~60 lines of duplication)
   - StoreInitializer.tsx: Extracted getHealthGlowColor function outside component for better reusability
   - page.tsx: Extracted getMaskColor function outside component for better modularity

4. TypeScript Type Fixes:
   - Added 'navigateTo' alias to useNavigation hook in appStore.ts for backwards compatibility
   - Fixed startPrompt interface in AdaptiveDifficultyContext.tsx to accept optional estimatedDuration parameter
   - Added 'secondary' and 'outline' variants to BadgeVariant type in types.ts
   - Added corresponding styles for new badge variants in Badge.tsx

Files Modified:
- src/app/features/reports/lib/useLazyImage.ts
- src/app/api/ai/root-cause-analysis/[resultId]/route.ts
- src/app/features/reports/lib/mockData.ts
- src/app/features/flow-builder/lib/flowSerializer.ts
- src/components/ui/ThemedSelect.tsx
- src/lib/stores/StoreInitializer.tsx
- src/app/page.tsx
- src/lib/stores/appStore.ts
- src/app/features/nl-test/components/AdaptiveDifficultyContext.tsx
- src/lib/types.ts
- src/components/ui/Badge.tsx

Impact:
- Cleaner production code with no console statements in production builds
- Reduced bundle size by removing unused imports
- Improved maintainability through extracted helper functions
- Better type safety with completed type definitions
- Resolved backwards compatibility issues with navigation hooks`;

const tested = 0;

try {
  const stmt = db.prepare(`
    INSERT INTO implementation_log (id, project_id, requirement_name, title, overview, tested, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const result = stmt.run(id, projectId, requirementName, title, overview, tested);

  console.log('✅ Implementation log entry created successfully!');
  console.log(`   ID: ${id}`);
  console.log(`   Title: ${title}`);
  console.log(`   Rows affected: ${result.changes}`);
} catch (error) {
  console.error('❌ Error creating implementation log:', error.message);
  process.exit(1);
} finally {
  db.close();
}
