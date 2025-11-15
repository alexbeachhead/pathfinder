const Database = require('better-sqlite3');
const path = require('path');
const { randomUUID } = require('crypto');

// Database path
const dbPath = path.join(__dirname, '..', 'database', 'goals.db');

try {
  const db = new Database(dbPath);

  const id = randomUUID();
  const projectId = '108b16e3-019b-469c-a329-47138d60a21f';
  const requirementName = 'Visual Test Flow Builder';
  const title = 'Visual Test Flow Builder';
  const overview = `Implemented a comprehensive drag-and-drop visual test flow builder that allows content creators to assemble NL test steps without manual code editing.

Key components created:
- FlowBuilder main component (src/app/features/flow-builder/components/FlowBuilder.tsx) - Central UI orchestrating palette, canvas, and editor
- StepPalette component - Draggable palette of test step types organized by category (actions, assertions, utilities)
- FlowCanvas component - Drag-and-drop canvas for building test flows with visual step cards
- StepEditor component - Dynamic form for configuring step parameters based on step type
- useFlowBuilder hook - State management for flow building with add, remove, update, and reorder operations
- Flow serialization utilities - Convert flows to JSON, natural language, Playwright code, and TestTemplate format
- Type definitions for FlowStep, TestFlow, PaletteItem with 9 step types (navigate, click, fill, select, hover, assert, verify, screenshot, wait)
- Integration with existing testTemplates module via importFlowAsTemplate function
- Flow Builder page (/flow-builder) with save, export, and preview functionality
- Link from NL Test page to Flow Builder for seamless navigation

The builder outputs JSON flows consumed by testTemplates, provides real-time validation, and exports Playwright code. All interactive components include data-testid attributes for automated testing. Follows existing design patterns with themed cards, glassmorphism effects, and consistent styling.`;

  const stmt = db.prepare(`
    INSERT INTO implementation_log (
      id,
      project_id,
      requirement_name,
      title,
      overview,
      tested,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(id, projectId, requirementName, title, overview, 0);

  console.log('✓ Implementation log entry created successfully');
  console.log(`  ID: ${id}`);
  console.log(`  Title: ${title}`);

  db.close();
} catch (error) {
  console.error('Error creating implementation log entry:', error);
  process.exit(1);
}
