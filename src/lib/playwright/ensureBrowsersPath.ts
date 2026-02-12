import path from 'path';
import { existsSync, readdirSync } from 'fs';

const BROWSERS_DIRS = ['playwright-browsers', '.playwright-browsers'] as const;
const DOCKER_BROWSERS_PATH = '/app/playwright-browsers';

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
  if (existsSync(DOCKER_BROWSERS_PATH)) {
    process.env.PLAYWRIGHT_BROWSERS_PATH = DOCKER_BROWSERS_PATH;
  }
}

/** Path to chromium headless_shell (or full chrome) executable, or null if not installed. */
function findChromiumHeadlessShell(baseDir: string): string | null {
  try {
    const entries = readdirSync(baseDir);
    // Prefer headless_shell (from playwright install chromium --only-shell)
    const headlessDir = entries.find((e) => e.startsWith('chromium_headless_shell-'));
    if (headlessDir) {
      const exe = path.join(baseDir, headlessDir, 'chrome-linux', 'headless_shell');
      if (existsSync(exe)) return exe;
    }
    // Fallback: full chromium (from playwright install chromium without --only-shell)
    const fullDir = entries.find((e) => e.startsWith('chromium-'));
    if (fullDir) {
      const exe = path.join(baseDir, fullDir, 'chrome-linux', 'chrome');
      if (existsSync(exe)) return exe;
    }
    return null;
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
    (existsSync(DOCKER_BROWSERS_PATH) ? DOCKER_BROWSERS_PATH : null) ||
    BROWSERS_DIRS.map((d) => path.join(process.cwd(), d)).find((p) => existsSync(p));
  const onVercel = process.env.VERCEL === '1';
  const unavailableOnDeployment =
    'Run tests is not available on this deployment. Run tests locally or deploy to Railway/Render. See docs/DEPLOYMENT.md.';

  if (!base || !existsSync(base)) {
    return onVercel
      ? unavailableOnDeployment
      : 'Playwright browsers are not installed. Run "npx playwright install chromium" (or set PLAYWRIGHT_BROWSERS_PATH and install in the build).';
  }
  if (!findChromiumHeadlessShell(base)) {
    return unavailableOnDeployment;
  }
  return null;
}
