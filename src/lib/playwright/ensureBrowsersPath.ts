import path from 'path';
import { existsSync, readdirSync } from 'fs';

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

/** Path to chromium headless_shell executable, or null if not installed. */
function findChromiumHeadlessShell(baseDir: string): string | null {
  try {
    const entries = readdirSync(baseDir);
    const chromiumDir = entries.find((e) => e.startsWith('chromium_headless_shell-'));
    if (!chromiumDir) return null;
    const executable = path.join(baseDir, chromiumDir, 'chrome-linux', 'headless_shell');
    return existsSync(executable) ? executable : null;
  } catch {
    return null;
  }
}

/**
 * Call after ensurePlaywrightBrowsersPath(). Returns a user-facing message if
 * the browser binary is not available (e.g. on Vercel due to 50MB function limit).
 * Returns null if the browser is available.
 */
export function getPlaywrightBrowsersUnavailableReason(): string | null {
  const base =
    process.env.PLAYWRIGHT_BROWSERS_PATH ||
    BROWSERS_DIRS.map((d) => path.join(process.cwd(), d)).find((p) => existsSync(p));
  if (!base || !existsSync(base)) {
    return (
      'Playwright browsers are not installed. Run "npx playwright install chromium" (or set PLAYWRIGHT_BROWSERS_PATH and install in the build).'
    );
  }
  if (!findChromiumHeadlessShell(base)) {
    return (
      'Run tests is not available on this deployment: the browser binary was not bundled (e.g. Vercel\'s 50MB function limit). ' +
      'Run tests locally or deploy to Railway/Render. See docs/DEPLOYMENT.md.'
    );
  }
  return null;
}
