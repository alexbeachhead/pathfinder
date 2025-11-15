const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const dbPath = 'C:\\Users\\kazda\\kiro\\pathfinder\\database\\goals.db';
const db = new Database(dbPath);

const implementationLog = {
  id: randomUUID(),
  project_id: '108b16e3-019b-469c-a329-47138d60a21f',
  requirement_name: 'choose-generated-code-format-javascript-or-typescript',
  title: 'Code Language Selection',
  overview: `Implemented a feature that allows users to choose between JavaScript and TypeScript for generated Playwright test code. Added a language selection toggle in the StepSetup component with visual buttons for TypeScript (type-safe with IDE support) and JavaScript (simple and widely compatible). Updated the generateTestCode function to generate proper JavaScript (CommonJS require syntax) or TypeScript (ES6 import syntax) based on user preference. Modified Designer.tsx to track the codeLanguage state throughout the wizard workflow and pass it to code generation and saving. Updated TestCodeEditor to display the correct language label, use appropriate syntax highlighting, and download files with correct extensions (.js or .ts). Updated the database schema type for test_code.language to enforce 'javascript' | 'typescript' union type. Modified saveTestCode function to accept CodeLanguage type. Files modified: src/lib/types.ts (added CodeLanguage type), src/app/features/designer/components/StepSetup.tsx (added language selection UI with test IDs), src/lib/playwright/generateTestCode.ts (added JavaScript generation support), src/app/features/designer/Designer.tsx (added state management for language preference), src/app/features/designer/components/TestCodeEditor.tsx (updated to use selected language), src/app/features/designer/components/StepReview.tsx (passes language to editor), src/lib/supabase/testSuites.ts (updated type signatures). The implementation maintains consistency with existing theme styling using inline styles and currentTheme colors, and all interactive elements include data-testid attributes for automated testing.`,
  tested: 0,
  created_at: new Date().toISOString()
};

try {
  const stmt = db.prepare(`
    INSERT INTO implementation_log (id, project_id, requirement_name, title, overview, tested, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(
    implementationLog.id,
    implementationLog.project_id,
    implementationLog.requirement_name,
    implementationLog.title,
    implementationLog.overview,
    implementationLog.tested
  );

  console.log('✅ Implementation log entry created successfully!');
  console.log(`   ID: ${implementationLog.id}`);
  console.log(`   Title: ${implementationLog.title}`);
} catch (error) {
  console.error('❌ Error creating implementation log:', error.message);
  process.exit(1);
} finally {
  db.close();
}
