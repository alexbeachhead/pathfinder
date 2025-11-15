'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard, ThemedCardHeader, ThemedCardContent } from '@/components/ui/ThemedCard';
import { Image, SplitSquareHorizontal, Check, X, Loader2 } from 'lucide-react';
import { useLazyImage } from '../lib/useLazyImage';

interface ScreenshotComparisonProps {
  testName: string;
  viewport: string;
  hasVisualDiff?: boolean;
  baselineUrl?: string;
  currentUrl?: string;
  diffUrl?: string;
}

/**
 * UI Improvement 1: Interactive visual regression comparison
 * - Side-by-side view of baseline vs current screenshots
 * - Diff highlighting overlay
 * - Toggle between comparison modes
 * - Visual indicators for changes detected
 * - Lazy-loading with IntersectionObserver for performance
 */
export function ScreenshotComparison({
  testName,
  viewport,
  hasVisualDiff = false,
  baselineUrl,
  currentUrl,
  diffUrl
}: ScreenshotComparisonProps) {
  const { currentTheme } = useTheme();
  const [viewMode, setViewMode] = useState<'side-by-side' | 'diff' | 'overlay'>('side-by-side');

  // Lazy-load images with IntersectionObserver
  const baseline = useLazyImage({
    src: baselineUrl || '',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E',
    rootMargin: '200px',
  });

  const current = useLazyImage({
    src: currentUrl || '',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E',
    rootMargin: '200px',
  });

  const diff = useLazyImage({
    src: diffUrl || '',
    placeholder: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3C/svg%3E',
    rootMargin: '200px',
  });

  // Fallback colors for placeholder divs when no URL provided
  const baselineColor = currentTheme.colors.surface;
  const currentColor = hasVisualDiff ? '#ef444420' : '#22c55e20';
  const diffColor = hasVisualDiff ? '#ef4444' : currentTheme.colors.border;

  return (
    <ThemedCard variant="bordered">
      <ThemedCardHeader
        title={`${testName} - ${viewport}`}
        subtitle="Visual comparison"
        icon={<Image className="w-5 h-5" />}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('side-by-side')}
              className="text-xs px-3 py-1 rounded transition-colors"
              style={{
                backgroundColor: viewMode === 'side-by-side' ? currentTheme.colors.primary : currentTheme.colors.surface,
                color: viewMode === 'side-by-side' ? '#ffffff' : currentTheme.colors.text.secondary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
            >
              Side-by-side
            </button>
            <button
              onClick={() => setViewMode('diff')}
              className="text-xs px-3 py-1 rounded transition-colors"
              style={{
                backgroundColor: viewMode === 'diff' ? currentTheme.colors.primary : currentTheme.colors.surface,
                color: viewMode === 'diff' ? '#ffffff' : currentTheme.colors.text.secondary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
            >
              Diff
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className="text-xs px-3 py-1 rounded transition-colors"
              style={{
                backgroundColor: viewMode === 'overlay' ? currentTheme.colors.primary : currentTheme.colors.surface,
                color: viewMode === 'overlay' ? '#ffffff' : currentTheme.colors.text.secondary,
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: currentTheme.colors.border,
              }}
            >
              Overlay
            </button>
          </div>
        }
      />
      <ThemedCardContent>
        <div className="mt-4">
          {/* Status Banner */}
          {hasVisualDiff && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg flex items-center gap-3"
              style={{
                backgroundColor: '#ef444410',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#ef444430',
              }}
            >
              <X className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                  Visual differences detected
                </p>
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.secondary }}>
                  The current screenshot differs from the baseline by 3.2%
                </p>
              </div>
            </motion.div>
          )}

          {!hasVisualDiff && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg flex items-center gap-3"
              style={{
                backgroundColor: '#22c55e10',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: '#22c55e30',
              }}
            >
              <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#22c55e' }} />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: '#22c55e' }}>
                  No visual differences
                </p>
                <p className="text-xs mt-1" style={{ color: currentTheme.colors.text.secondary }}>
                  Current screenshot matches the baseline
                </p>
              </div>
            </motion.div>
          )}

          {/* Screenshot Comparison View */}
          <div className="rounded-lg overflow-hidden"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: currentTheme.colors.border,
            }}
          >
            {viewMode === 'side-by-side' && (
              <div className="grid grid-cols-2 gap-0">
                {/* Baseline */}
                <div>
                  <div className="p-2 text-center text-xs font-medium"
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      color: currentTheme.colors.text.secondary,
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: currentTheme.colors.border,
                    }}
                  >
                    Baseline
                  </div>
                  <div ref={baseline.ref} className="aspect-video flex items-center justify-center relative"
                    style={{ backgroundColor: baselineColor }}
                    data-testid="screenshot-baseline-container"
                  >
                    {baselineUrl ? (
                      <>
                        <img
                          src={baseline.imageSrc}
                          alt={`${testName} - ${viewport} baseline`}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            baseline.isLoaded ? 'opacity-100' : 'opacity-50'
                          }`}
                          data-testid="screenshot-baseline-img"
                        />
                        {baseline.isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.colors.text.tertiary }} />
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm" style={{ color: currentTheme.colors.text.tertiary }}>
                        No baseline screenshot
                      </span>
                    )}
                  </div>
                </div>

                {/* Current */}
                <div style={{ borderLeftWidth: '1px', borderLeftStyle: 'solid', borderLeftColor: currentTheme.colors.border }}>
                  <div className="p-2 text-center text-xs font-medium"
                    style={{
                      backgroundColor: currentTheme.colors.surface,
                      color: currentTheme.colors.text.secondary,
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: currentTheme.colors.border,
                    }}
                  >
                    Current
                  </div>
                  <div ref={current.ref} className="aspect-video flex items-center justify-center relative"
                    style={{ backgroundColor: currentColor }}
                    data-testid="screenshot-current-container"
                  >
                    {currentUrl ? (
                      <>
                        <img
                          src={current.imageSrc}
                          alt={`${testName} - ${viewport} current`}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            current.isLoaded ? 'opacity-100' : 'opacity-50'
                          }`}
                          data-testid="screenshot-current-img"
                        />
                        {current.isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.colors.text.tertiary }} />
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm" style={{ color: currentTheme.colors.text.tertiary }}>
                        No current screenshot
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'diff' && (
              <div>
                <div className="p-2 text-center text-xs font-medium"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    color: currentTheme.colors.text.secondary,
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: currentTheme.colors.border,
                  }}
                >
                  Difference Highlight
                </div>
                <div ref={diff.ref} className="aspect-video flex items-center justify-center relative"
                  style={{ backgroundColor: baselineColor }}
                  data-testid="screenshot-diff-container"
                >
                  {diffUrl ? (
                    <>
                      <img
                        src={diff.imageSrc}
                        alt={`${testName} - ${viewport} diff`}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          diff.isLoaded ? 'opacity-100' : 'opacity-50'
                        }`}
                        data-testid="screenshot-diff-img"
                      />
                      {diff.isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.colors.text.tertiary }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-sm" style={{ color: currentTheme.colors.text.tertiary }}>
                        {hasVisualDiff ? 'Diff overlay placeholder' : 'No differences detected'}
                      </span>
                      {hasVisualDiff && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          className="absolute inset-0"
                          style={{
                            background: `repeating-linear-gradient(45deg, transparent, transparent 10px, ${diffColor}30 10px, ${diffColor}30 20px)`,
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'overlay' && (
              <div>
                <div className="p-2 text-center text-xs font-medium"
                  style={{
                    backgroundColor: currentTheme.colors.surface,
                    color: currentTheme.colors.text.secondary,
                    borderBottomWidth: '1px',
                    borderBottomStyle: 'solid',
                    borderBottomColor: currentTheme.colors.border,
                  }}
                >
                  Overlay Comparison
                </div>
                <div className="aspect-video flex items-center justify-center relative"
                  style={{ backgroundColor: baselineColor }}
                  data-testid="screenshot-overlay-container"
                >
                  {baselineUrl && currentUrl ? (
                    <>
                      <div ref={baseline.ref} className="absolute inset-0">
                        <img
                          src={baseline.imageSrc}
                          alt={`${testName} - ${viewport} baseline`}
                          className="w-full h-full object-cover"
                          data-testid="screenshot-overlay-baseline-img"
                        />
                      </div>
                      <div ref={current.ref} className="absolute inset-0">
                        <motion.img
                          src={current.imageSrc}
                          alt={`${testName} - ${viewport} current overlay`}
                          className="w-full h-full object-cover"
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          data-testid="screenshot-overlay-current-img"
                        />
                      </div>
                      {(baseline.isLoading || current.isLoading) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" style={{ color: currentTheme.colors.text.tertiary }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="text-sm" style={{ color: currentTheme.colors.text.tertiary }}>
                        Overlay view placeholder
                      </span>
                      <motion.div
                        className="absolute inset-0"
                        style={{ backgroundColor: currentColor }}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
}
