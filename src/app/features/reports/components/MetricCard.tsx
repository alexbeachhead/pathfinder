'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: number;
  suffix?: string;
  backgroundColor: string;
  borderColor: string;
  delay?: number;
  textColor: string;
  tertiaryColor: string;
  testId?: string;
}

/**
 * Reusable metric card component to reduce duplication
 * Refactoring Batch 15 - Extract common metric display pattern
 */
export function MetricCard({
  icon: Icon,
  iconColor,
  label,
  value,
  suffix = '',
  backgroundColor,
  borderColor,
  delay = 0,
  textColor,
  tertiaryColor,
  testId,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="p-4 rounded-lg"
      style={{
        backgroundColor,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor,
      }}
      data-testid={testId}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
        <span className="text-xs font-medium" style={{ color: tertiaryColor }}>
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold" style={{ color: textColor }}>
        {value > 0 && suffix === 'Tests fixed' ? '+' : ''}
        {value}
        {suffix === 'Tests broken' && value > 0 ? '-' : ''}
      </div>
      <div className="text-xs mt-1" style={{ color: tertiaryColor }}>
        {suffix}
      </div>
    </motion.div>
  );
}
