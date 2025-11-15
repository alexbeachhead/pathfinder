'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { TestSuiteWithCode } from '../lib/mockData';
import { Play, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface TestSuiteCardProps {
  suite: TestSuiteWithCode;
  onRun: (suiteId: string) => void;
  isRunning?: boolean;
}

// Helper function to get status display properties
function getStatusDisplay(status: 'passed' | 'failed' | 'running' | undefined, accentColor: string, tertiaryColor: string) {
  const config = {
    passed: { color: '#22c55e', icon: CheckCircle2, label: 'Passed', className: '' },
    failed: { color: '#ef4444', icon: XCircle, label: 'Failed', className: '' },
    running: { color: accentColor, icon: Clock, label: 'Running', className: 'animate-spin' },
    default: { color: tertiaryColor, icon: Clock, label: 'Unknown', className: '' },
  };

  return config[status || 'default'];
}

export function TestSuiteCard({ suite, onRun, isRunning }: TestSuiteCardProps) {
  const { currentTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ThemedCard variant="bordered">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-1 truncate" style={{ color: currentTheme.colors.text.primary }}>
                {suite.name}
              </h3>
              <p className="text-sm mb-2" style={{ color: currentTheme.colors.text.secondary }}>
                {suite.description || 'No description'}
              </p>
              <p className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                {suite.target_url}
              </p>
            </div>
            <ThemedButton
              variant="primary"
              size="sm"
              onClick={() => onRun(suite.id)}
              disabled={isRunning}
              leftIcon={<Play className="w-4 h-4" />}
            >
              {isRunning ? 'Running...' : 'Run'}
            </ThemedButton>
          </div>

          <div className="flex items-center justify-between pt-4 mt-4"
            style={{
              borderTopWidth: '1px',
              borderTopStyle: 'solid',
              borderTopColor: currentTheme.colors.border,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span style={{ color: currentTheme.colors.text.tertiary }}>Tests: </span>
                <span className="font-medium" style={{ color: currentTheme.colors.text.primary }}>
                  {suite.testCount}
                </span>
              </div>
              {suite.lastRun && (() => {
                const statusDisplay = getStatusDisplay(suite.lastRun.status, currentTheme.colors.accent, currentTheme.colors.text.tertiary);
                const StatusIcon = statusDisplay.icon;
                return (
                  <>
                    <div className="flex items-center gap-2">
                      <span style={{ color: statusDisplay.color }}>
                        <StatusIcon className={`w-4 h-4 ${statusDisplay.className}`} />
                      </span>
                      <span className="text-sm font-medium" style={{ color: statusDisplay.color }}>
                        {statusDisplay.label}
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: currentTheme.colors.text.tertiary }}>
                      {suite.lastRun.timestamp} • {suite.lastRun.duration}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </ThemedCard>
    </motion.div>
  );
}
