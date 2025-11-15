import { NextRequest, NextResponse } from 'next/server';
import { VIEWPORTS, PAGE_LOAD_TIMEOUT } from '@/lib/config';
import { createContext, navigateToUrl, captureScreenshot, captureDOMSnapshot, closeBrowser } from '@/lib/playwright/setup';
import { ScreenshotMetadata, PreviewMode } from '@/lib/types';
import { uploadScreenshot, ScreenshotMetadata as StorageMetadata } from '@/lib/storage/screenshots';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for serverless function

interface CaptureRequest {
  url: string;
  viewports?: string[]; // viewport keys from VIEWPORTS config
  previewMode?: PreviewMode; // 'lightweight' or 'full'
}

export async function POST(request: NextRequest) {
  try {
    const body: CaptureRequest = await request.json();
    const { url, viewports: requestedViewports, previewMode = 'full' } = body;

    // Validate URL
    if (!url || !isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Determine which viewports to capture
    const viewportsToCapture = requestedViewports && requestedViewports.length > 0
      ? requestedViewports.filter(v => v in VIEWPORTS)
      : Object.keys(VIEWPORTS);

    if (viewportsToCapture.length === 0) {
      return NextResponse.json(
        { error: 'No valid viewports specified' },
        { status: 400 }
      );
    }

    const screenshots: ScreenshotMetadata[] = [];
    const timestamp = Date.now();
    const sessionId = `designer-${timestamp}`;

    // Capture screenshots for each viewport
    for (const viewportKey of viewportsToCapture) {
      const viewport = VIEWPORTS[viewportKey];

      try {
        const context = await createContext(viewport);
        const page = await context.newPage();

        // Navigate to URL
        await navigateToUrl(page, url, PAGE_LOAD_TIMEOUT);

        // Wait a bit for dynamic content
        await page.waitForTimeout(1000);

        let base64 = '';
        let screenshotUrl = '';
        let domSnapshot: string | undefined;

        if (previewMode === 'lightweight') {
          // Capture DOM snapshot for lightweight preview
          domSnapshot = await captureDOMSnapshot(page);
          // Create a minimal placeholder image for thumbnails
          const placeholderBuffer = Buffer.from(
            `<svg width="${viewport.width}" height="200" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#1a1a2e"/>
              <text x="50%" y="50%" text-anchor="middle" fill="#00d4ff" font-size="16" font-family="Arial">
                Lightweight Preview (${viewport.name})
              </text>
            </svg>`
          );
          base64 = placeholderBuffer.toString('base64');
        } else {
          // Capture full screenshot
          const screenshotBuffer = await captureScreenshot(page, { fullPage: true });

          // Upload to Supabase storage
          try {
            const metadata: StorageMetadata = {
              testRunId: sessionId,
              testName: 'designer-preview',
              stepName: viewportKey,
              viewport: viewport.name,
              timestamp,
            };
            screenshotUrl = await uploadScreenshot(screenshotBuffer, metadata);
          } catch (uploadError) {
            console.warn('Screenshot upload failed, using base64 fallback:', uploadError);
          }

          // Convert to base64 as fallback
          base64 = screenshotBuffer.toString('base64');
        }

        screenshots.push({
          viewportName: viewport.name,
          width: viewport.width,
          height: viewport.height,
          url: url,
          base64: screenshotUrl || base64, // Use URL if available, otherwise base64
          screenshotUrl: screenshotUrl || undefined,
          previewMode,
          domSnapshot,
        });

        // Cleanup
        await context.close();
      } catch (error) {
        console.error(`Failed to capture screenshot for ${viewport.name}:`, error);
        // Continue with other viewports even if one fails
      }
    }

    if (screenshots.length === 0) {
      return NextResponse.json(
        { error: 'Failed to capture any screenshots' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      screenshots,
      url,
    });

  } catch (error) {
    console.error('Screenshot capture error:', error);
    return NextResponse.json(
      { error: `Screenshot capture failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}
