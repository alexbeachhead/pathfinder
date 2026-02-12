import { NextRequest } from 'next/server';
import { compareTestRuns } from '@/lib/supabase/dashboard';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/compare-runs?current=...&previous=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const current = searchParams.get('current');
    const previous = searchParams.get('previous');

    if (!current || !previous) {
      return Response.json({ error: 'Missing current or previous run id' }, { status: 400 });
    }

    const data = await compareTestRuns(current, previous);
    return Response.json(data);
  } catch (error) {
    console.error('[api/dashboard/compare-runs]', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to compare runs' },
      { status: 500 }
    );
  }
}
