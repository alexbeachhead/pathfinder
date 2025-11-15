'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { Monitor, Smartphone, Tablet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLazyImage } from '../lib/useLazyImage';

interface ViewportResult {
  viewport: string;
  viewport_size: string;
  status: 'pass' | 'fail' | 'skip' | 'skipped';
  duration_ms?: number;
  errors?: any[];
  screenshot_url?: string;
}

interface ViewportGridProps {
  results: ViewportResult[];
  testName: string;
}

function ViewportCard({
  viewport,
  result,
  index
}: {
  viewport: string;
  result: ViewportResult;
  index: number;
}) {
  const { currentTheme } = useTheme();

  const getViewportIcon = (viewport: string) => {
    const lowerViewport = viewport.toLowerCase();
    if (lowerViewport.includes('mobile')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (lowerViewport.includes('tablet')) {
      return <Tablet className="w-5 h-5" />;
    }
    return <Monitor className="w-5 h-5" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5" />;
      case 'fail':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return '#22c55e';
      case 'fail':
        return '#ef4444';
      default:
        return '#eab308';
    }
  };

  const statusColor = getStatusColor(result.status);

  // Lazy-load screenshot
  const screenshot = useLazyImage({
    src: result.screenshot_url || '',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E',
    rootMargin: '300px',
  });

  return (
    <motion.div
      key={viewport}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="rounded-lg overflow-hidden"
      style={{
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: statusColor,
        backgroundColor: `${statusColor}05`,
      }}
      data-testid={`viewport-card-${viewport}`}
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between"
        style={{
          backgroundColor: `${statusColor}15`,
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: `${statusColor}30`,
        }}
      >
        <div className="flex items-center gap-3">
          <div style={{ color: statusColor }}>
            {getViewportIcon(viewport)}
          </div>
          <div>
            <div className="font-semibold" style={{ color: currentTheme.colors.text.primary }}>
              {viewport}
            </div>
            <div className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
              {result.viewport_size}
            </div>
          </div>
        </div>
        <div style={{ color: statusColor }}>
          {getStatusIcon(result.status)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
            Status
          </span>
          <span
            className="text-sm font-semibold uppercase px-2 py-1 rounded"
            style={{
              color: statusColor,
              backgroundColor: `${statusColor}20`,
            }}
            data-testid={`viewport-status-${viewport}`}
          >
            {result.status}
          </span>
        </div>

        {/* Duration */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: currentTheme.colors.text.secondary }}>
            Duration
          </span>
          <span className="text-sm font-medium" style={{ color: currentTheme.colors.text.primary }}>
            {result.duration_ms ? `${(result.duration_ms / 1000).toFixed(2)}s` : 'N/A'}
          </span>
        </div>

        {/* Errors */}
        {result.errors && result.errors.length > 0 && (
          <div>
            <span className="text-sm block mb-1" style={{ color: currentTheme.colors.text.secondary }}>
              Errors
            </span>
            <div className="space-y-1">
              {result.errors.slice(0, 2).map((error, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2 rounded"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    color: '#ef4444',
                  }}
                >
                  {error.message || 'Unknown error'}
                </div>
              ))}
              {result.errors.length > 2 && (
                <div className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                  +{result.errors.length - 2} more errors
                </div>
              )}
            </div>
          </div>
        )}

        {/* Screenshot Preview with Lazy Loading */}
        {result.screenshot_url && (
          <div>
            <span className="text-sm block mb-2" style={{ color: currentTheme.colors.text.secondary }}>
              Screenshot
            </span>
            <div
              ref={screenshot.ref}
              className="rounded overflow-hidden relative"
              style={{
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
              data-testid={`viewport-screenshot-container-${viewport}`}
            >
              <img
                src={screenshot.imageSrc}
                alt={`${viewport} screenshot`}
                className={`w-full h-32 object-cover object-top cursor-pointer transition-opacity duration-300 ${
                  screenshot.isLoaded ? 'opacity-100 hover:opacity-80' : 'opacity-50'
                }`}
                onClick={() => window.open(result.screenshot_url, '_blank')}
                data-testid={`viewport-screenshot-img-${viewport}`}
              />
              {screenshot.isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.colors.text.tertiary }} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ViewportGrid({ results, testName }: ViewportGridProps) {
  const { currentTheme } = useTheme();

  // Group results by viewport
  const viewportGroups = results.reduce((acc, result) => {
    const key = result.viewport;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {} as Record<string, ViewportResult[]>);

  const viewports = Object.keys(viewportGroups);

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title="Viewport Comparison"
        subtitle={`${testName} across ${viewports.length} viewports`}
        icon={<Monitor className="w-5 h-5" />}
      />
      <ThemedCardContent>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {viewports.map((viewport, index) => {
            const viewportResults = viewportGroups[viewport];
            const latestResult = viewportResults[viewportResults.length - 1];

            return (
              <ViewportCard
                key={viewport}
                viewport={viewport}
                result={latestResult}
                index={index}
              />
            );
          })}
        </div>

        {/* Summary */}
        {viewports.length > 0 && (
          <div
            className="mt-6 p-4 rounded-lg"
            style={{
              backgroundColor: `${currentTheme.colors.primary}10`,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: `${currentTheme.colors.primary}30`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: currentTheme.colors.text.primary }}>
                Cross-Viewport Summary
              </span>
              <div className="flex gap-4 text-sm">
                <span style={{ color: '#22c55e' }}>
                  {Object.values(viewportGroups).flat().filter(r => r.status === 'pass').length} passed
                </span>
                <span style={{ color: '#ef4444' }}>
                  {Object.values(viewportGroups).flat().filter(r => r.status === 'fail').length} failed
                </span>
                <span style={{ color: '#eab308' }}>
                  {Object.values(viewportGroups).flat().filter(r => r.status === 'skip').length} skipped
                </span>
              </div>
            </div>
          </div>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
}
