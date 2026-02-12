import { NextRequest } from 'next/server';
import { getDashboardStats, getQualityTrends, getIssuesByCategory } from '@/lib/supabase/dashboard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard?daysBack=30
 * Returns dashboard stats, previous stats, quality trends, and issues by category.
 * Server-only so Supabase env vars are read at runtime.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = Math.min(90, Math.max(1, Number(searchParams.get('daysBack')) || 30));

    const [stats, previousStats, trends, issues] = await Promise.all([
      getDashboardStats(daysBack),
      getDashboardStats(daysBack, daysBack),
      getQualityTrends(daysBack),
      getIssuesByCategory(daysBack),
    ]);

    return Response.json({
      stats,
      previousStats,
      trends,
      issues,
    });
  } catch (error) {
    console.error('[api/dashboard]', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
