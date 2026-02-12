import path from 'path';
import { existsSync } from 'fs';

/**
 * Point Playwright at project-installed browsers (e.g. from build step
 * PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium).
 * Call before chromium.launch() so serverless (Vercel, etc.) finds the binaries.
 */
export function ensurePlaywrightBrowsersPath(): void {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) return;
  const projectBrowsers = path.join(process.cwd(), '.playwright-browsers');
  if (existsSync(projectBrowsers)) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = projectBrowsers;
  }
}
