import { NextRequest, NextResponse } from 'next/server';
import { analyzePageForTests } from '@/lib/llm/gemini';
import { ScreenshotMetadata, CodebaseAnalysis } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds for AI analysis

interface AnalyzeRequest {
  url: string;
  screenshots: ScreenshotMetadata[];
  codeAnalysis?: CodebaseAnalysis | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { url, screenshots, codeAnalysis = null } = body;

    // Validate inputs
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const screenshotList = screenshots && screenshots.length > 0 ? screenshots : [];

    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Perform AI analysis (works with or without screenshots)
    const scenarios = await analyzePageForTests(
      screenshotList,
      codeAnalysis,
      url
    );

    return NextResponse.json({
      success: true,
      scenarios,
      meta: {
        url,
        screenshotCount: screenshotList.length,
        scenarioCount: scenarios.length,
      },
    });

  } catch (error) {
    console.error('Gemini analysis error:', error);
    return NextResponse.json(
      { error: `AI analysis failed: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
