'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/lib/stores/appStore';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { CIProvider } from '../lib/ciHelpers';
import { ArrowLeft, ArrowRight, Settings, Chrome, Globe, Users, RotateCcw } from 'lucide-react';

interface ConfigurationFormProps {
  provider: CIProvider;
  nodeVersion: string;
  setNodeVersion: (version: string) => void;
  browsers: ('chromium' | 'firefox' | 'webkit')[];
  setBrowsers: (browsers: ('chromium' | 'firefox' | 'webkit')[]) => void;
  runOnPush: boolean;
  setRunOnPush: (value: boolean) => void;
  runOnPR: boolean;
  setRunOnPR: (value: boolean) => void;
  workers: number;
  setWorkers: (value: number) => void;
  retries: number;
  setRetries: (value: number) => void;
  onBack: () => void;
  onNext: () => void;
}

const BROWSER_OPTIONS = [
  { value: 'chromium', label: 'Chromium', icon: Chrome, color: '#22d3ee' },
  { value: 'firefox', label: 'Firefox', icon: Globe, color: '#f59e0b' },
  { value: 'webkit', label: 'WebKit', icon: Globe, color: '#a855f7' },
];

export function ConfigurationForm({
  provider,
  nodeVersion,
  setNodeVersion,
  browsers,
  setBrowsers,
  runOnPush,
  setRunOnPush,
  runOnPR,
  setRunOnPR,
  workers,
  setWorkers,
  retries,
  setRetries,
  onBack,
  onNext,
}: ConfigurationFormProps) {
  const { currentTheme } = useTheme();

  const toggleBrowser = (browser: 'chromium' | 'firefox' | 'webkit') => {
    setBrowsers(
      browsers.includes(browser)
        ? browsers.filter((b) => b !== browser)
        : [...browsers, browser]
    );
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6" style={{ color: currentTheme.colors.accent }} />
        <h3 className="text-xl font-bold" style={{ color: currentTheme.colors.text.primary }}>
          Configure Pipeline Settings
        </h3>
      </div>

      {/* Node Version */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ThemedSelect
          value={nodeVersion}
          onChange={setNodeVersion}
          options={[
            { value: '18', label: 'Node.js 18 LTS' },
            { value: '20', label: 'Node.js 20 LTS (Recommended)' },
            { value: '22', label: 'Node.js 22 (Latest)' },
          ]}
          label="Node.js Version"
          icon={<Globe className="w-4 h-4" />}
          helperText="Select the Node.js version for your CI environment"
        />
      </motion.div>

      {/* Browsers */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label
          className="block text-sm font-semibold mb-3"
          style={{ color: currentTheme.colors.text.primary }}
        >
          <div className="flex items-center gap-2">
            <Chrome className="w-4 h-4" />
            <span>Test Browsers</span>
          </div>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {BROWSER_OPTIONS.map((browser) => {
            const Icon = browser.icon;
            const isSelected = browsers.includes(browser.value as 'chromium' | 'firefox' | 'webkit');

            return (
              <motion.button
                key={browser.value}
                type="button"
                onClick={() => toggleBrowser(browser.value as 'chromium' | 'firefox' | 'webkit')}
                className="relative p-4 rounded-lg border-2 transition-all"
                style={{
                  borderColor: isSelected ? browser.color : currentTheme.colors.border,
                  backgroundColor: isSelected
                    ? `${browser.color}15`
                    : currentTheme.colors.surface,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                data-testid={`browser-${browser.value}-checkbox`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon
                    className="w-6 h-6"
                    style={{ color: isSelected ? browser.color : currentTheme.colors.text.tertiary }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isSelected
                        ? currentTheme.colors.text.primary
                        : currentTheme.colors.text.secondary,
                    }}
                  >
                    {browser.label}
                  </span>
                </div>

                {isSelected && (
                  <motion.div
                    className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ backgroundColor: browser.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    layoutId={`browser-${browser.value}`}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
        <p
          className="text-xs mt-2"
          style={{ color: currentTheme.colors.text.tertiary }}
        >
          Select which browsers to test against
        </p>
      </motion.div>

      {/* GitHub Triggers */}
      {provider === 'github' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg"
          style={{ backgroundColor: `${currentTheme.colors.surface}80` }}
        >
          <label
            className="block text-sm font-semibold mb-3"
            style={{ color: currentTheme.colors.text.primary }}
          >
            Trigger Events
          </label>
          <div className="space-y-2">
            {[
              { label: 'On Push', value: runOnPush, setter: setRunOnPush, testId: 'trigger-push-checkbox' },
              { label: 'On Pull Request', value: runOnPR, setter: setRunOnPR, testId: 'trigger-pr-checkbox' },
            ].map((trigger) => (
              <label key={trigger.label} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={trigger.value}
                    onChange={(e) => trigger.setter(e.target.checked)}
                    className="peer sr-only"
                    data-testid={trigger.testId}
                  />
                  <div
                    className="w-11 h-6 rounded-full transition-colors peer-checked:bg-accent"
                    style={{
                      backgroundColor: trigger.value
                        ? currentTheme.colors.accent
                        : currentTheme.colors.border,
                    }}
                  />
                  <motion.div
                    className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: trigger.value ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </div>
                <span
                  className="text-sm font-medium group-hover:opacity-80"
                  style={{ color: currentTheme.colors.text.primary }}
                >
                  {trigger.label}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {/* Performance Settings */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: currentTheme.colors.text.primary }}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Parallel Workers</span>
            </div>
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={workers}
            onChange={(e) => setWorkers(parseInt(e.target.value) || 1)}
            className="w-full p-3 rounded-lg border-2 font-medium transition-colors focus:outline-none focus:ring-2"
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text.primary,
              boxShadow: `0 0 0 0 ${currentTheme.colors.accent}40`,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = currentTheme.colors.accent;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.colors.accent}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = currentTheme.colors.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
            data-testid="workers-input"
          />
        </div>

        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: currentTheme.colors.text.primary }}
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>Test Retries</span>
            </div>
          </label>
          <input
            type="number"
            min="0"
            max="5"
            value={retries}
            onChange={(e) => setRetries(parseInt(e.target.value) || 0)}
            className="w-full p-3 rounded-lg border-2 font-medium transition-colors focus:outline-none focus:ring-2"
            style={{
              backgroundColor: currentTheme.colors.background,
              borderColor: currentTheme.colors.border,
              color: currentTheme.colors.text.primary,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = currentTheme.colors.accent;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${currentTheme.colors.accent}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = currentTheme.colors.border;
              e.currentTarget.style.boxShadow = 'none';
            }}
            data-testid="retries-input"
          />
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex gap-3 pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <ThemedButton variant="secondary" onClick={onBack} data-testid="back-btn" leftIcon={<ArrowLeft />}>
          Back
        </ThemedButton>
        <ThemedButton
          variant="primary"
          onClick={onNext}
          disabled={browsers.length === 0}
          fullWidth
          data-testid="next-btn"
          leftIcon={<ArrowRight />}
        >
          Continue to Deploy
        </ThemedButton>
      </motion.div>
    </motion.div>
  );
}
