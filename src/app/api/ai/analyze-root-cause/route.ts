import { NextRequest, NextResponse } from 'next/server';
import {
  FailureContext,
  SimilarFailure,
  RootCauseAnalysis,
} from '@/lib/ai/rootCauseAnalysis';

/**
 * API Route: Analyze root cause of test failure using LLM
 * POST /api/ai/analyze-root-cause
 */
export async function POST(request: NextRequest) {
  try {
    const { context, similar_failures } = await request.json();

    if (!context) {
      return NextResponse.json(
        { error: 'Failure context is required' },
        { status: 400 }
      );
    }

    const failureContext = context as FailureContext;
    const similarFailures = (similar_failures || []) as SimilarFailure[];

    // Build the prompt for the LLM
    const prompt = buildRootCauseAnalysisPrompt(failureContext, similarFailures);

    // Call OpenAI API for analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert QA engineer and debugger. Your task is to analyze test failures and provide probable root causes and remediation suggestions. Always provide structured, actionable insights.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error('Failed to analyze root cause');
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    const parsedAnalysis = JSON.parse(analysisText);

    // Structure the analysis
    const analysis: RootCauseAnalysis = {
      result_id: '', // Will be set by the caller
      probable_causes: parsedAnalysis.probable_causes || [],
      remediation_suggestions: parsedAnalysis.remediation_suggestions || [],
      similar_failures: similarFailures,
      ai_model: 'gpt-4',
      confidence_score: parsedAnalysis.overall_confidence || 0.7,
      analyzed_at: new Date().toISOString(),
    };

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to analyze root cause' },
      { status: 500 }
    );
  }
}

/**
 * Build the prompt for root cause analysis
 */
function buildRootCauseAnalysisPrompt(
  context: FailureContext,
  similarFailures: SimilarFailure[]
): string {
  let prompt = `Analyze the following test failure and provide a structured root cause analysis.

**Test Failure Details:**
- Test Name: ${context.test_name}
- Viewport: ${context.viewport} (${context.viewport_size || 'unknown size'})
- Error Message: ${context.error_message}
`;

  if (context.stack_trace) {
    prompt += `
- Stack Trace:
\`\`\`
${context.stack_trace.slice(0, 2000)}
\`\`\`
`;
  }

  if (context.console_logs && context.console_logs.length > 0) {
    const relevantLogs = context.console_logs
      .filter(log => log.type === 'error' || log.type === 'warn')
      .slice(0, 5);

    if (relevantLogs.length > 0) {
      prompt += `
- Console Logs (errors/warnings):
${relevantLogs.map(log => `  [${log.type}] ${log.message}`).join('\n')}
`;
    }
  }

  if (context.duration_ms) {
    prompt += `- Duration: ${context.duration_ms}ms\n`;
  }

  if (similarFailures.length > 0) {
    prompt += `
**Similar Past Failures:**
`;
    similarFailures.forEach((failure, index) => {
      prompt += `
${index + 1}. ${failure.test_name} (${Math.round(failure.similarity_score * 100)}% similar)
   - Error: ${failure.error_message}
`;
      if (failure.resolution) {
        prompt += `   - Resolution: ${failure.resolution}\n`;
      }
    });
  }

  prompt += `

**Required Output Format (JSON):**
Please provide your analysis in the following JSON structure:

{
  "probable_causes": [
    {
      "description": "Detailed description of the probable cause",
      "confidence": 0.85,
      "category": "code|environment|data|infrastructure|timeout|dependency",
      "evidence": ["Evidence point 1", "Evidence point 2"]
    }
  ],
  "remediation_suggestions": [
    {
      "title": "Short title for the fix",
      "description": "Detailed description of the remediation",
      "priority": "high|medium|low",
      "effort": "low|medium|high",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "code_example": "Optional code snippet showing the fix"
    }
  ],
  "overall_confidence": 0.8
}

Provide 2-4 probable causes (ordered by confidence) and 2-5 remediation suggestions (ordered by priority).`;

  return prompt;
}
