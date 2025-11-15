import { NextRequest, NextResponse } from 'next/server';
import { findSimilarFailuresByEmbedding } from '@/lib/supabase/rootCauseAnalysis';

/**
 * API Route: Find similar failures using vector similarity
 * POST /api/ai/similar-failures
 */
export async function POST(request: NextRequest) {
  try {
    const { embedding, limit = 5, threshold = 0.7 } = await request.json();

    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: 'Valid embedding array is required' },
        { status: 400 }
      );
    }

    const similarFailures = await findSimilarFailuresByEmbedding(
      embedding,
      limit,
      threshold
    );

    return NextResponse.json({ similar_failures: similarFailures });
  } catch (error) {
    console.error('Error finding similar failures:', error);
    return NextResponse.json(
      { error: 'Failed to find similar failures' },
      { status: 500 }
    );
  }
}
