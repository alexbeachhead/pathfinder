const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

const id = randomUUID();
const projectId = '108b16e3-019b-469c-a329-47138d60a21f';
const requirementName = 'lightweight-preview-vs-full-rendering-toggle';
const title = 'Lightweight Preview vs Full Rendering Toggle';
const overview = `Implemented a preview mode toggle feature in the Designer wizard that allows users to choose between lightweight DOM snapshots and full screenshot rendering.

**Key Features Implemented:**
- Added PreviewMode type ('lightweight' | 'full') to the type system
- Created toggle UI in StepSetup component with visual indicators (Zap icon for lightweight, Camera icon for full)
- Implemented DOM snapshot capture using Playwright's page.evaluate() to clone and inline all computed styles
- Updated screenshot capture API to support both rendering modes with conditional logic
- Modified ScreenshotPreview component to display DOM snapshots in sandboxed iframes for lightweight mode
- Added localStorage persistence to remember user's preview mode preference across sessions
- Included helpful descriptions explaining the trade-offs: lightweight mode for speed and low memory usage, full mode for accurate visual feedback

**Files Modified:**
- src/lib/types.ts - Added PreviewMode type and updated ScreenshotMetadata interface
- src/app/features/designer/Designer.tsx - Added preview mode state management and localStorage persistence
- src/app/features/designer/components/StepSetup.tsx - Created toggle UI with themed buttons and icons
- src/lib/playwright/setup.ts - Implemented captureDOMSnapshot() function with style inlining
- src/app/api/screenshots/capture/route.ts - Updated API to handle both preview modes
- src/app/features/designer/components/ScreenshotPreview.tsx - Added iframe rendering for lightweight previews

**Technical Implementation:**
- Lightweight mode captures HTML with inlined computed styles for accurate rendering without external dependencies
- DOM snapshot removes scripts, iframes, and interactive elements for security
- Images are converted to data URLs where possible to maintain visual fidelity
- Sandboxed iframes (sandbox="allow-same-origin") display DOM snapshots safely
- Full mode continues to use Playwright screenshots with Supabase storage integration
- User preference persists via localStorage with key 'pathfinder-preview-mode'

**User Experience:**
- Clear visual distinction between modes with descriptive icons and labels
- Contextual help text explains the benefits of each mode
- Seamless switching between modes with instant feedback
- Download functionality adapted to export HTML for lightweight mode, PNG for full mode`;

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
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(id, projectId, requirementName, title, overview, 0);

  console.log('✓ Implementation log entry created successfully');
  console.log(`  ID: ${id}`);
  console.log(`  Title: ${title}`);
  console.log(`  Requirement: ${requirementName}`);
} catch (error) {
  console.error('✗ Failed to create implementation log entry:', error.message);
  process.exit(1);
} finally {
  db.close();
}
