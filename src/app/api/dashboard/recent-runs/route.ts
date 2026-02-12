import { NextRequest } from 'next/server';
import { getRecentTestRuns } from '@/lib/supabase/dashboard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/recent-runs?page=1&pageSize=10&status=completed&...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize')) || 10));
    const status = searchParams.get('status') as 'running' | 'completed' | 'failed' | null;
    const minQualityScore = searchParams.get('minQualityScore') ? Number(searchParams.get('minQualityScore')) : undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;

    const result = await getRecentTestRuns(page, pageSize, {
      status: status || undefined,
      minQualityScore,
      dateFrom,
      dateTo,
    });

    return Response.json(result);
  } catch (error) {
    console.error('[api/dashboard/recent-runs]', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to load recent runs' },
      { status: 500 }
    );
  }
}
