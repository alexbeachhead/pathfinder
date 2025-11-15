import { NextRequest, NextResponse } from 'next/server';
import { saveFailureResolution } from '@/lib/supabase/rootCauseAnalysis';

/**
 * API Route: Save a failure resolution
 * POST /api/ai/save-resolution
 */
export async function POST(request: NextRequest) {
  try {
    const { result_id, root_cause, solution_applied, resolution_notes, resolved_by } =
      await request.json();

    if (!result_id || !root_cause || !solution_applied) {
      return NextResponse.json(
        { error: 'result_id, root_cause, and solution_applied are required' },
        { status: 400 }
      );
    }

    const resolutionId = await saveFailureResolution(
      result_id,
      root_cause,
      solution_applied,
      resolution_notes,
      resolved_by
    );

    return NextResponse.json({
      success: true,
      resolution_id: resolutionId,
    });
  } catch (error) {
    console.error('Error saving resolution:', error);
    return NextResponse.json(
      { error: 'Failed to save resolution' },
      { status: 500 }
    );
  }
}
