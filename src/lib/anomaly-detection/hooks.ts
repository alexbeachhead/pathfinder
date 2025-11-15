import { useState, useEffect } from 'react';
import { AnomalyData } from '@/app/features/dashboard/components/RecentTestItem';

/**
 * Hook to fetch anomaly data for multiple test runs
 */
export function useAnomalyDetection(runIds: string[], enabled: boolean = true) {
  const [anomalies, setAnomalies] = useState<Record<string, AnomalyData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || runIds.length === 0) {
      return;
    }

    const fetchAnomalies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Call batch anomaly detection API
        const response = await fetch('/api/anomaly-detection/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ runIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch anomaly data');
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Convert array to object keyed by runId
          const anomalyMap: Record<string, AnomalyData> = {};

          for (const anomaly of result.data) {
            anomalyMap[anomaly.runId] = {
              isAnomalous: anomaly.isAnomalous,
              anomalyType: anomaly.anomalyType,
              confidence: anomaly.confidence,
              explanation: anomaly.explanation,
              suggestedAction: anomaly.suggestedAction,
            };
          }

          setAnomalies(anomalyMap);
        }
      } catch (err) {
        console.error('Error fetching anomalies:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, [runIds.join(','), enabled]);

  return { anomalies, loading, error };
}

/**
 * Hook to fetch anomaly data for a single test run
 */
export function useRunAnomaly(runId: string | null, enabled: boolean = true) {
  const [anomaly, setAnomaly] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !runId) {
      return;
    }

    const fetchAnomaly = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/anomaly-detection/detect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ runId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch anomaly data');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setAnomaly({
            isAnomalous: result.data.isAnomalous,
            anomalyType: result.data.anomalyType,
            confidence: result.data.confidence,
            explanation: result.data.explanation,
            suggestedAction: result.data.suggestedAction,
          });
        }
      } catch (err) {
        console.error('Error fetching anomaly:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomaly();
  }, [runId, enabled]);

  return { anomaly, loading, error };
}
