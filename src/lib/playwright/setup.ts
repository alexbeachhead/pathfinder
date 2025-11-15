import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { ViewportConfig } from '../config';

let browser: Browser | null = null;

/**
 * Get or create a Playwright browser instance
 */
export async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    });
  }
  return browser;
}

/**
 * Close the browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

/**
 * Create a new browser context with specified viewport
 */
export async function createContext(
  viewport: ViewportConfig
): Promise<BrowserContext> {
  const browserInstance = await getBrowser();
  return await browserInstance.newContext({
    viewport: {
      width: viewport.width,
      height: viewport.height,
    },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
}

/**
 * Navigate to URL with proper error handling and wait strategies
 */
export async function navigateToUrl(
  page: Page,
  url: string,
  timeout: number = 30000
): Promise<void> {
  try {
    await page.goto(url, {
      timeout,
      waitUntil: 'networkidle',
    });
  } catch {
    // Fallback to 'load' if 'networkidle' times out
    try {
      await page.goto(url, {
        timeout,
        waitUntil: 'load',
      });
    } catch (retryError) {
      throw new Error(`Failed to navigate to ${url}: ${(retryError as Error).message}`);
    }
  }
}

/**
 * Capture full-page screenshot
 */
export async function captureScreenshot(
  page: Page,
  options?: { fullPage?: boolean }
): Promise<Buffer> {
  return await page.screenshot({
    fullPage: options?.fullPage ?? true,
    type: 'png',
  });
}

/**
 * Capture DOM snapshot for lightweight preview
 * Returns HTML with inlined styles for accurate rendering
 */
export async function captureDOMSnapshot(page: Page): Promise<string> {
  return await page.evaluate(() => {
    // Clone the document
    const clone = document.documentElement.cloneNode(true) as HTMLElement;

    // Inline all computed styles
    const inlineStyles = (element: Element, sourceElement: Element) => {
      if (element instanceof HTMLElement && sourceElement instanceof HTMLElement) {
        const computedStyle = window.getComputedStyle(sourceElement);
        let styleStr = '';
        for (let i = 0; i < computedStyle.length; i++) {
          const prop = computedStyle[i];
          styleStr += `${prop}:${computedStyle.getPropertyValue(prop)};`;
        }
        element.setAttribute('style', styleStr);
      }

      // Process children
      const children = element.children;
      const sourceChildren = sourceElement.children;
      for (let i = 0; i < children.length && i < sourceChildren.length; i++) {
        inlineStyles(children[i], sourceChildren[i]);
      }
    };

    inlineStyles(clone, document.documentElement);

    // Remove scripts and interactive elements for security and performance
    const scriptsAndInteractive = clone.querySelectorAll('script, iframe, object, embed');
    scriptsAndInteractive.forEach(el => el.remove());

    // Convert images to data URLs where possible (for small images)
    const images = clone.querySelectorAll('img');
    images.forEach((img, index) => {
      const sourceImg = document.querySelectorAll('img')[index];
      if (sourceImg && sourceImg.complete && sourceImg.naturalWidth > 0) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = sourceImg.naturalWidth;
          canvas.height = sourceImg.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(sourceImg, 0, 0);
            (img as HTMLImageElement).src = canvas.toDataURL('image/png');
          }
        } catch {
          // Cross-origin images will fail, keep original src
        }
      }
    });

    return `<!DOCTYPE html>\n${clone.outerHTML}`;
  });
}
