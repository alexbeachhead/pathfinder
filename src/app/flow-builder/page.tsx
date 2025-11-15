'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/stores/appStore';
import { MainLayout } from '@/components/layout/MainLayout';
import { FlowBuilder } from '@/app/features/flow-builder/components/FlowBuilder';
import { Workflow, Sparkles, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FlowBuilderPage() {
  const { currentTheme } = useTheme();
  const router = useRouter();
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const handleSave = (flowJson: string) => {
    // Save to localStorage for now (can be replaced with API call)
    const flows = JSON.parse(localStorage.getItem('savedFlows') || '[]');
    const flow = JSON.parse(flowJson);
    flows.push({
      ...flow,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem('savedFlows', JSON.stringify(flows));

    setSavedMessage('Flow saved successfully!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleExport = (code: string) => {
    // Download as file
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-${Date.now()}.spec.ts`;
    a.click();
    URL.revokeObjectURL(url);

    setSavedMessage('Code exported successfully!');
    setTimeout(() => setSavedMessage(null), 3000);
  };

  const handleGenerate = (naturalLanguage: string) => {
    // Navigate to NL test page with pre-filled description
    router.push(`/nl-test?description=${encodeURIComponent(naturalLanguage)}`);
  };

  return (
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-bold flex items-center gap-3"
              style={{ color: currentTheme.colors.text.primary }}
            >
              <Workflow className="w-8 h-8" style={{ color: currentTheme.colors.primary }} />
              Visual Test Flow Builder
            </h1>
            <p className="mt-2 text-lg" style={{ color: currentTheme.colors.text.secondary }}>
              Drag and drop test steps to create complex test flows visually
            </p>
          </div>

          <button
            onClick={() => router.push('/nl-test')}
            className="px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
            style={{
              backgroundColor: currentTheme.colors.surface,
              color: currentTheme.colors.text.primary,
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: currentTheme.colors.border,
            }}
            data-testid="back-to-nl-test-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to NL Test
          </button>
        </div>

        {/* Success Message */}
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-lg flex items-center gap-3"
            style={{
              backgroundColor: '#10b98120',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#10b98140',
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: '#10b981' }} />
            <p className="text-sm font-medium" style={{ color: currentTheme.colors.text.primary }}>
              {savedMessage}
            </p>
          </motion.div>
        )}

        {/* Flow Builder */}
        <FlowBuilder
          onSave={handleSave}
          onExport={handleExport}
          onGenerate={handleGenerate}
        />

        {/* Help Text */}
        <div
          className="p-6 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.colors.surface}dd 0%, ${currentTheme.colors.surface}99 100%)`,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: currentTheme.colors.border,
          }}
        >
          <h3
            className="text-lg font-semibold mb-3"
            style={{ color: currentTheme.colors.text.primary }}
          >
            How to Use the Flow Builder
          </h3>
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
            style={{ color: currentTheme.colors.text.secondary }}
          >
            <div>
              <p className="font-medium mb-2" style={{ color: currentTheme.colors.text.primary }}>
                1. Configure Your Test
              </p>
              <p>Enter a name, target URL, and description for your test flow.</p>
            </div>
            <div>
              <p className="font-medium mb-2" style={{ color: currentTheme.colors.text.primary }}>
                2. Build the Flow
              </p>
              <p>
                Drag steps from the palette onto the canvas. Click steps to edit their
                configuration.
              </p>
            </div>
            <div>
              <p className="font-medium mb-2" style={{ color: currentTheme.colors.text.primary }}>
                3. Export or Generate
              </p>
              <p>
                Preview your test, export as Playwright code, or generate natural language
                description for AI.
              </p>
            </div>
          </div>
        </div>
      </div>
  );
}
