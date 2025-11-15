# AI-Driven Anomaly Detection for Test Runs

## Overview

This feature implements an LLM-based anomaly detection pipeline that analyzes test run logs and metrics to automatically identify unusual failure patterns, flaky tests, and environment issues. It reduces QA triage time by surfacing probable root causes without manual analysis.

## Architecture

### Core Components

1. **Anomaly Detection Service** (`src/lib/anomaly-detection/service.ts`)
   - Extracts key entities from test run logs (pass rate, duration, errors, console logs)
   - Computes embeddings using Gemini `text-embedding-004` model
   - Calculates cosine similarity between current run and baseline distribution
   - Uses LLM to classify anomaly types and provide explanations

2. **API Endpoints**
   - `POST /api/anomaly-detection/detect` - Detect anomalies in a single test run
   - `POST /api/anomaly-detection/batch` - Batch process multiple test runs

3. **React Integration**
   - `useAnomalyDetection(runIds[])` - Hook for batch anomaly detection
   - `useRunAnomaly(runId)` - Hook for single run anomaly detection

4. **UI Components**
   - `RecentTestItem` - Enhanced with anomaly badge and tooltip
   - `AnomalyAwareTestRunsList` - Full table with anomaly indicators and filtering

## How It Works

### 1. Feature Extraction

For each test run, the system extracts:
```typescript
Run ID: xyz
Status: completed/failed
Pass Rate: 85.5%
Duration: 12345ms
Failed Tests: 3
Errors: "TypeError: Cannot read...", "Network timeout..."
Console Errors: "Failed to load resource..."
```

### 2. Embedding Computation

Features are converted to semantic embeddings using Gemini:
```typescript
const embedding = await computeTestRunEmbedding(features);
// Returns 768-dimensional vector
```

### 3. Baseline Comparison

Current run is compared against historical baseline:
- Only "healthy" runs included in baseline (status=completed, pass rate ≥80%)
- Minimum 3 historical runs required
- Cosine similarity calculated with each baseline run
- Average similarity < 0.7 threshold triggers anomaly flag

### 4. LLM Classification

If anomalous, Gemini analyzes the run to determine:
- **Anomaly Type**: `flaky_test`, `environment_issue`, `regression`, `unusual_failure_pattern`
- **Explanation**: 1-2 sentence summary of what's abnormal
- **Affected Tests**: Specific test names if applicable
- **Suggested Action**: Concrete next step to investigate

### 5. Visual Feedback

Dashboard displays:
- **Warning Badge**: Color-coded by confidence (red >50%, orange ≤50%)
- **Tooltip**: Shows full explanation, confidence %, and suggested action
- **Border Highlight**: Anomalous runs have colored borders
- **Filter**: "Anomalies Only" button to focus on problematic runs

## Usage

### In Dashboard Components

```typescript
import { useAnomalyDetection } from '@/lib/anomaly-detection/hooks';

function MyComponent() {
  const runIds = ['run-1', 'run-2', 'run-3'];
  const { anomalies, loading, error } = useAnomalyDetection(runIds);

  return (
    <div>
      {runIds.map(id => (
        <TestRunItem
          key={id}
          runId={id}
          anomaly={anomalies[id]}
        />
      ))}
    </div>
  );
}
```

### API Call

```typescript
// Single run detection
const response = await fetch('/api/anomaly-detection/detect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    runId: 'test-run-123',
    lookbackDays: 30 // optional, default 30
  })
});

const { data } = await response.json();
// data.isAnomalous: boolean
// data.anomalyType: string
// data.confidence: number (0-1)
// data.explanation: string
// data.suggestedAction: string
```

```typescript
// Batch detection
const response = await fetch('/api/anomaly-detection/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    runIds: ['run-1', 'run-2', 'run-3'],
    lookbackDays: 30
  })
});

const { data } = await response.json();
// data: Array<AnomalyResult>
```

## Configuration

### Threshold Tuning

Adjust sensitivity in `src/lib/anomaly-detection/service.ts`:

```typescript
const SIMILARITY_THRESHOLD = 0.7; // Lower = more sensitive
const MIN_BASELINE_RUNS = 3;      // Minimum history needed
const LOOKBACK_DAYS = 30;          // Historical window
```

### Rate Limiting

Gemini API calls are rate-limited:
- 4-second delay between requests
- Automatic retry with exponential backoff
- Batch API processes runs sequentially to avoid quota issues

## Anomaly Types

| Type | Description | Example |
|------|-------------|---------|
| `flaky_test` | Tests that pass/fail inconsistently | Test passed last 5 runs, now failing |
| `environment_issue` | Infrastructure or config problems | Database connection timeouts |
| `regression` | New code breaking existing tests | API endpoint returns 500 instead of 200 |
| `unusual_failure_pattern` | Unexpected failure characteristics | Different error message than usual |

## Performance Considerations

- **Batch API**: Use for dashboard loading (processes up to 20 runs)
- **Single API**: Use for real-time detection on new runs
- **Caching**: Embeddings could be cached in future iteration
- **Timeout**: Batch endpoint has 300s timeout for large batches

## Database Schema

No new tables required. Uses existing:
- `test_runs` - Run metadata
- `test_results` - Individual test outcomes
- Anomaly data is computed on-demand (not persisted)

## Future Enhancements

1. **Embedding Cache**: Store embeddings to avoid recomputation
2. **Anomaly History**: Persist anomaly results for trend analysis
3. **Auto-Triage**: Automatically create tickets for high-confidence anomalies
4. **Pattern Learning**: Train custom model on project-specific patterns
5. **Slack/Email Alerts**: Notify team when critical anomalies detected

## Testing

### Manual Testing

1. Run several successful test suites to establish baseline
2. Introduce a failure (e.g., network timeout, assertion error)
3. Navigate to dashboard
4. Verify anomaly badge appears on recent run
5. Hover over badge to see detailed explanation

### API Testing

```bash
# Test single run detection
curl -X POST http://localhost:3000/api/anomaly-detection/detect \
  -H "Content-Type: application/json" \
  -d '{"runId": "your-run-id"}'

# Test batch detection
curl -X POST http://localhost:3000/api/anomaly-detection/batch \
  -H "Content-Type: application/json" \
  -d '{"runIds": ["run-1", "run-2"]}'
```

## Troubleshooting

### No Anomalies Detected

- Ensure at least 3 historical runs exist
- Check that baseline runs meet criteria (status=completed, pass rate ≥80%)
- Verify Gemini API key is configured (`GEMINI_API_KEY`)

### High False Positive Rate

- Increase `SIMILARITY_THRESHOLD` (e.g., 0.8 or 0.9)
- Increase `MIN_BASELINE_RUNS` for more robust baseline

### Gemini API Errors

- Check rate limits (15 req/min on free tier)
- Verify API key validity
- Review logs for specific error messages

## Implementation Details

**Files Created:**
- `src/lib/anomaly-detection/service.ts` (319 lines)
- `src/lib/anomaly-detection/hooks.ts` (102 lines)
- `src/app/api/anomaly-detection/detect/route.ts` (77 lines)
- `src/app/api/anomaly-detection/batch/route.ts` (103 lines)
- `src/app/features/dashboard/components/RecentTestItem.tsx` (updated, 233 lines)
- `src/app/features/dashboard/components/AnomalyAwareTestRunsList.tsx` (449 lines)

**Total Lines of Code:** ~1,283 LOC

**Dependencies:**
- `@google/generative-ai` - Gemini SDK (already installed)
- No additional npm packages required

---

**Last Updated:** 2025-11-15
**Status:** ✅ Fully Implemented & Tested
