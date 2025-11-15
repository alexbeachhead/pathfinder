const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

const id = randomUUID();
const projectId = '108b16e3-019b-469c-a329-47138d60a21f';
const requirementName = 'idea-13510a4e-ai-driven-anomaly-detection-fo';
const title = 'AI Anomaly Detection for Test Runs';
const overview = `Implemented a comprehensive LLM-based anomaly detection pipeline that analyzes test run logs and metrics to identify unusual failure patterns, flaky tests, and environment issues.

Key components created:
- src/lib/anomaly-detection/service.ts: Core service with embedding computation using Gemini text-embedding-004, cosine similarity calculation, baseline distribution analysis, and LLM-driven anomaly classification
- src/app/api/anomaly-detection/detect/route.ts: Single test run anomaly detection endpoint
- src/app/api/anomaly-detection/batch/route.ts: Batch anomaly detection for multiple test runs
- src/lib/anomaly-detection/hooks.ts: React hooks (useAnomalyDetection, useRunAnomaly) for fetching anomaly data
- src/app/features/dashboard/components/RecentTestItem.tsx: Enhanced with anomaly warning badge, tooltip with explanation, confidence score, and suggested actions
- src/app/features/dashboard/components/AnomalyAwareTestRunsList.tsx: Full test runs table with anomaly indicators, "Anomalies Only" filter, and visual alerts

Features implemented:
- Extracts key entities from test run logs (pass rate, duration, errors, console logs)
- Computes embeddings using Gemini AI for semantic comparison
- Compares current runs against baseline distribution of healthy runs
- Uses cosine similarity with configurable threshold (default 0.7)
- LLM analyzes detected anomalies to classify type (flaky_test, environment_issue, regression, unusual_failure_pattern)
- Provides confidence scores and actionable suggestions
- Visual warning badges on dashboard with color-coded severity (red for high confidence, orange for medium)
- Interactive tooltips showing detailed explanation and suggested actions
- Batch processing API for efficient dashboard rendering
- Real-time anomaly detection integrated into dashboard workflow

The system reduces QA triage time by automatically surfacing probable root causes and providing specific recommendations without manual analysis.`;

const tested = 0;

try {
  const stmt = db.prepare(`
    INSERT INTO implementation_log (id, project_id, requirement_name, title, overview, tested, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(id, projectId, requirementName, title, overview, tested);

  console.log('✅ Implementation log entry created successfully!');
  console.log(`ID: ${id}`);
  console.log(`Title: ${title}`);
} catch (error) {
  console.error('❌ Error creating implementation log:', error.message);
  process.exit(1);
} finally {
  db.close();
}
