# AI Root-Cause Analysis for Test Failures

## Overview

The AI Root-Cause Analysis feature provides automated debugging assistance for test failures by leveraging machine learning and large language models. When a test fails, developers can click an "Analyze" button to receive AI-generated insights about probable causes, remediation suggestions, and similar past failures.

## Features

### 1. Automated Root Cause Detection
- **Embedding Generation**: Converts failure logs, stack traces, and console output into vector embeddings
- **Pattern Recognition**: Uses GPT-4 to analyze failure patterns and identify root causes
- **Confidence Scoring**: Each probable cause includes a confidence score (0-100%)
- **Categorization**: Classifies failures into categories: code, environment, data, infrastructure, timeout, or dependency

### 2. Intelligent Remediation Suggestions
- **Prioritized Fixes**: Suggestions ranked by priority (high, medium, low) and effort (low, medium, high)
- **Step-by-Step Guidance**: Detailed steps to resolve each issue
- **Code Examples**: Includes code snippets demonstrating the fix when applicable
- **Multiple Solutions**: Provides 2-5 alternative approaches for each failure

### 3. Historical Context
- **Similar Failure Search**: Uses vector similarity search to find related past failures
- **Resolution Tracking**: Shows how similar failures were resolved in the past
- **Learning System**: Builds a knowledge base from resolved failures to improve future analyses

### 4. Interactive UI
- **Modal Dialog**: Clean, tabbed interface for exploring analysis results
- **Three Tabs**:
  - **Probable Causes**: Lists root causes with confidence scores and evidence
  - **Remediation**: Actionable fixes with priority and effort indicators
  - **Similar Failures**: Historical failures with similarity scores and resolutions

## Architecture

### Database Schema

#### test_failure_embeddings
Stores vector embeddings of failure data for similarity search.
- `id`: UUID primary key
- `result_id`: Foreign key to test_results
- `error_message`: Text of the error
- `stack_trace`: Stack trace text
- `embedding`: Vector(1536) - OpenAI ada-002 embedding
- `created_at`: Timestamp

#### root_cause_analyses
Stores AI-generated analysis results.
- `id`: UUID primary key
- `result_id`: Foreign key to test_results
- `probable_causes`: JSONB array of causes with confidence scores
- `remediation_suggestions`: JSONB array of fix suggestions
- `similar_failures`: JSONB array of related past failures
- `ai_model`: Model used (e.g., "gpt-4")
- `confidence_score`: Overall analysis confidence
- `analyzed_at`: Analysis timestamp
- `created_at`: Record creation timestamp

#### failure_resolutions
Tracks how failures were resolved for learning.
- `id`: UUID primary key
- `result_id`: Foreign key to test_results
- `root_cause`: Description of the actual root cause
- `solution_applied`: Description of the fix
- `resolution_notes`: Additional notes
- `resolved_by`: User who resolved it
- `resolved_at`: Resolution timestamp
- `created_at`: Record creation timestamp

### API Endpoints

#### POST /api/ai/embeddings
Generates vector embedding for text input.
- **Input**: `{ text: string }`
- **Output**: `{ embedding: number[] }`
- **Model**: text-embedding-ada-002

#### POST /api/ai/similar-failures
Finds similar failures using vector search.
- **Input**: `{ embedding: number[], limit?: number, threshold?: number }`
- **Output**: `{ similar_failures: SimilarFailure[] }`
- **Method**: Cosine similarity via pgvector

#### POST /api/ai/analyze-root-cause
Analyzes failure and generates root cause insights.
- **Input**: `{ context: FailureContext, similar_failures: SimilarFailure[] }`
- **Output**: `{ analysis: RootCauseAnalysis }`
- **Model**: GPT-4

#### GET /api/ai/root-cause-analysis/[resultId]
Retrieves cached analysis for a result.
- **Output**: `{ analysis: RootCauseAnalysis }`
- **Cache**: Checks database before generating new analysis

#### POST /api/ai/save-resolution
Saves how a failure was resolved.
- **Input**: `{ result_id, root_cause, solution_applied, resolution_notes?, resolved_by? }`
- **Output**: `{ success: boolean, resolution_id: string }`

### Components

#### RootCauseAnalysisModal
Main UI component displaying analysis results.
- **Location**: `src/app/features/reports/components/RootCauseAnalysisModal.tsx`
- **Props**:
  - `isOpen`: boolean
  - `onClose`: () => void
  - `testResult`: TestResult
- **Features**:
  - Tabbed interface (Causes, Remediation, Similar)
  - Loading state with animation
  - Error handling
  - Confidence score visualization
  - Priority/effort badges

#### TestResultsTable (Enhanced)
Test results table with "Analyze" button for failures.
- **Location**: `src/app/features/reports/components/TestResultsTable.tsx`
- **New Features**:
  - "Analyze" button with Brain icon for failed tests
  - Opens RootCauseAnalysisModal on click
  - Displays alongside "Create Ticket" button

### Service Layer

#### rootCauseAnalysis.ts
Core service for AI analysis operations.
- **Location**: `src/lib/ai/rootCauseAnalysis.ts`
- **Functions**:
  - `performRootCauseAnalysis()`: Complete analysis pipeline
  - `generateFailureEmbedding()`: Create embedding from failure context
  - `findSimilarFailures()`: Search for related failures
  - `analyzeRootCause()`: LLM-based analysis
  - `getCachedAnalysis()`: Retrieve existing analysis
  - `saveFailureResolution()`: Save resolution data

#### rootCauseAnalysis.ts (Supabase)
Database operations for analysis data.
- **Location**: `src/lib/supabase/rootCauseAnalysis.ts`
- **Functions**:
  - `storeFailureEmbedding()`: Save embedding to database
  - `findSimilarFailuresByEmbedding()`: Vector similarity query
  - `saveRootCauseAnalysis()`: Persist analysis results
  - `getRootCauseAnalysis()`: Fetch cached analysis
  - `saveFailureResolution()`: Record resolution
  - `getRootCauseAnalysisStats()`: Analysis statistics

### PostgreSQL Functions

#### find_similar_failures
Vector similarity search function using pgvector.
- **Location**: `database/migrations/add_similarity_search_function.sql`
- **Parameters**:
  - `query_embedding`: vector(1536)
  - `match_threshold`: float (default 0.7)
  - `match_count`: int (default 5)
- **Returns**: Table of similar failures with similarity scores
- **Method**: Cosine distance with IVFFlat index

## Setup Instructions

### 1. Database Migration

Run the following migrations in order:

```bash
# Create tables for embeddings and analyses
psql -d your_database -f database/migrations/add_root_cause_analysis.sql

# Create similarity search function (requires pgvector extension)
psql -d your_database -f database/migrations/add_similarity_search_function.sql
```

### 2. Environment Variables

Add OpenAI API key to your `.env.local`:

```env
OPENAI_API_KEY=sk-...your-key-here...
```

### 3. pgvector Extension

Ensure pgvector is installed on your PostgreSQL database:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

For local development:
```bash
# PostgreSQL with pgvector via Docker
docker run -d \
  --name pathfinder-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

### 4. Supabase Configuration

If using Supabase:
1. Enable pgvector extension in Supabase dashboard
2. Run migrations via Supabase SQL editor
3. Grant appropriate permissions to authenticated users

## Usage

### For Users

1. Navigate to the Reports page
2. Find a failed test in the Test Results Table
3. Click the "Analyze" button (with brain icon)
4. View the AI analysis in the modal:
   - **Probable Causes**: See what might have caused the failure
   - **Remediation**: Get step-by-step fix suggestions
   - **Similar Failures**: Learn from past similar issues
5. (Optional) Mark the failure as resolved to help improve future analyses

### For Developers

#### Trigger Analysis Programmatically

```typescript
import { performRootCauseAnalysis } from '@/lib/ai/rootCauseAnalysis';

const analysis = await performRootCauseAnalysis(testResult);
console.log(analysis.probable_causes);
console.log(analysis.remediation_suggestions);
```

#### Save Resolution

```typescript
import { saveFailureResolution } from '@/lib/ai/rootCauseAnalysis';

await saveFailureResolution(
  resultId,
  'Race condition in async data fetch',
  'Added proper await statements and error handling',
  'Additional notes here'
);
```

#### Get Analysis Stats

```typescript
import { getRootCauseAnalysisStats } from '@/lib/supabase/rootCauseAnalysis';

const stats = await getRootCauseAnalysisStats(suiteId);
console.log(`Total analyses: ${stats.total_analyses}`);
console.log(`Avg confidence: ${stats.avg_confidence}`);
console.log(`Resolution rate: ${stats.resolution_rate}`);
```

## Data Flow

1. **User clicks "Analyze"** → Opens RootCauseAnalysisModal
2. **Modal checks cache** → Calls `getCachedAnalysis(resultId)`
3. **If no cache, analyze**:
   a. Extract failure context from TestResult
   b. Generate embedding via `/api/ai/embeddings`
   c. Find similar failures via `/api/ai/similar-failures`
   d. Analyze with GPT-4 via `/api/ai/analyze-root-cause`
   e. Store analysis in database
4. **Display results** → Show causes, remediation, and similar failures
5. **User resolves issue** → Save resolution via `/api/ai/save-resolution`
6. **Learning loop** → Future analyses use this resolution data

## Performance Considerations

### Caching
- Analyses are cached in `root_cause_analyses` table
- Check cache before generating new analysis
- Cache hit avoids expensive LLM calls

### Embedding Storage
- Embeddings use 1536 dimensions (6KB per embedding)
- IVFFlat index optimizes similarity search
- Consider cleanup of old embeddings (>90 days)

### Rate Limiting
- OpenAI API has rate limits
- Implement request throttling for high-volume environments
- Consider caching embeddings aggressively

### Cost Optimization
- Embedding generation: ~$0.0001 per 1K tokens
- GPT-4 analysis: ~$0.03 per 1K tokens
- Cache analyses to minimize API calls
- Consider using GPT-3.5-turbo for lower-priority analyses

## Testing

### Component Tests

```typescript
// Test IDs available for automated testing
- "root-cause-analysis-modal"
- "close-modal-btn"
- "causes-tab"
- "remediation-tab"
- "similar-tab"
- "cause-{index}"
- "suggestion-{index}"
- "similar-failure-{index}"
- "analyze-root-cause-btn-{result.id}"
- "create-ticket-with-analysis-btn"
```

### Integration Tests

Test the complete flow:
1. Trigger analysis for a failed test
2. Verify embedding generation
3. Check similarity search results
4. Validate LLM response structure
5. Ensure proper caching

## Future Enhancements

- [ ] Real-time analysis during test execution
- [ ] Automated ticket creation with analysis data
- [ ] Pattern detection across multiple test suites
- [ ] Integration with CI/CD pipelines
- [ ] Custom analysis prompts per project
- [ ] Resolution effectiveness tracking
- [ ] Team collaboration on resolutions
- [ ] Export analysis reports (PDF, CSV)
- [ ] Integration with error tracking tools (Sentry, etc.)
- [ ] Multi-language LLM support

## Troubleshooting

### Analysis Taking Too Long
- Check OpenAI API status
- Verify network connectivity
- Review API rate limits

### No Similar Failures Found
- Database may be new (no historical data)
- Threshold may be too high (try lowering to 0.5)
- Embedding index may need rebuilding

### Low Confidence Scores
- Limited context in error messages
- Unusual or novel failure patterns
- Consider adding more console logs to tests

### Database Errors
- Ensure pgvector extension is installed
- Verify table migrations ran successfully
- Check Supabase/PostgreSQL permissions

## Support

For issues or questions:
- Check the implementation log in `database/goals.db`
- Review error logs in browser console
- Verify environment variables are set
- Test API endpoints individually

## License

Part of the Pathfinder test automation platform.
