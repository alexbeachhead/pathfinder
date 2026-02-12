import path from 'path';
import { existsSync } from 'fs';

const BROWSERS_DIRS = ['playwright-browsers', '.playwright-browsers'] as const;

/**
 * Point Playwright at project-installed browsers (e.g. from build step
 * PLAYWRIGHT_BROWSERS_PATH=playwright-browsers npx playwright install chromium).
 * Call before chromium.launch() so serverless (Vercel, etc.) finds the binaries.
 * Prefers non-hidden "playwright-browsers" so bundlers/tracing include it.
 */
export function ensurePlaywrightBrowsersPath(): void {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) return;
  for (const dir of BROWSERS_DIRS) {
    const projectBrowsers = path.join(process.cwd(), dir);
    if (existsSync(projectBrowsers)) {
      process.env.PLAYWRIGHT_BROWSERS_PATH = projectBrowsers;
      return;
    }
  }
}
