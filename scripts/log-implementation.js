const fs = require('fs');
const path = require('path');

// Check if better-sqlite3 is available, otherwise create a placeholder
try {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '..', 'database', 'goals.db');

  const db = new Database(dbPath);

  const insert = db.prepare(`
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

  const crypto = require('crypto');
  const id = crypto.randomUUID();

  const result = insert.run(
    id,
    '108b16e3-019b-469c-a329-47138d60a21f',
    'replace-context-with-zustand',
    'Replace Context with Zustand',
    'Successfully migrated the entire application from React Context (ThemeContext and NavigationContext) to Zustand state management. Created a unified appStore.ts that manages theme state, navigation state, and NL test state with optimized selectors. Implemented StoreInitializer component for client-side initialization and CSS variable management. Updated 30+ component files to use the new Zustand hooks (useTheme, useNavigation, useTestState). This improves performance by reducing unnecessary re-renders through selective state subscriptions, provides better debugging with Zustand DevTools, and enables hot module reloading without component re-mounts. The store uses middleware for persistence (localStorage) and development tools integration.',
    0
  );

  db.close();
  console.log('✓ Implementation log entry created successfully');
  console.log('  ID:', id);
  console.log('  Title:', 'Replace Context with Zustand');
} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('⚠ better-sqlite3 module not found. Creating fallback log file...');

    const crypto = require('crypto');
    const logEntry = {
      id: crypto.randomUUID(),
      project_id: '108b16e3-019b-469c-a329-47138d60a21f',
      requirement_name: 'replace-context-with-zustand',
      title: 'Replace Context with Zustand',
      overview: 'Successfully migrated the entire application from React Context (ThemeContext and NavigationContext) to Zustand state management. Created a unified appStore.ts that manages theme state, navigation state, and NL test state with optimized selectors. Implemented StoreInitializer component for client-side initialization and CSS variable management. Updated 30+ component files to use the new Zustand hooks (useTheme, useNavigation, useTestState). This improves performance by reducing unnecessary re-renders through selective state subscriptions, provides better debugging with Zustand DevTools, and enables hot module reloading without component re-mounts. The store uses middleware for persistence (localStorage) and development tools integration.',
      tested: 0,
      created_at: new Date().toISOString()
    };

    const logPath = path.join(__dirname, '..', 'database', 'implementation-log-fallback.json');
    let logs = [];

    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }

    logs.push(logEntry);
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

    console.log('✓ Fallback log entry created at:', logPath);
    console.log('  ID:', logEntry.id);
    console.log('  Title:', logEntry.title);
  } else {
    console.error('✗ Error creating implementation log:', error.message);
    throw error;
  }
}
