'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ThemedSelect } from '@/components/ui/ThemedSelect';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { TestSuite } from '@/lib/types';

interface SuiteControlsProps {
  availableSuites: TestSuite[];
  selectedSuiteId: string;
  sortOrder: 'asc' | 'desc';
  isLoadingSuites: boolean;
  onSelectSuite: (suiteId: string) => void;
  onNewSuite: () => void;
}

export function SuiteControls({
  availableSuites,
  selectedSuiteId,
  sortOrder,
  isLoadingSuites,
  onSelectSuite,
  onNewSuite,
}: SuiteControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      {/* Suite Selector */}
      <div style={{ minWidth: '250px' }}>
        <ThemedSelect
          value={selectedSuiteId}
          onChange={(suiteId) => {
            if (suiteId) {
              onSelectSuite(suiteId);
            }
          }}
          options={availableSuites
            .sort((a, b) => {
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            })
            .map(suite => ({
              value: suite.id,
              label: suite.name,
            }))
          }
          placeholder="Select suite..."
          isLoading={isLoadingSuites}
          size="md"
        />
      </div>

      {/* New Suite Button */}
      <ThemedButton
        variant="primary"
        size="md"
        leftIcon={<Plus className="w-4 h-4" />}
        onClick={onNewSuite}
      >
        New Suite
      </ThemedButton>
    </motion.div>
  );
}
