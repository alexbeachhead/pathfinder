/**
 * Tab navigation helper components and utilities
 */

import React from 'react';
import { motion } from 'framer-motion';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  accentColor: string;
  textColor: string;
  secondaryColor: string;
  testId?: string;
}

/**
 * Themed tab button with animation
 */
export function TabButton({
  active,
  onClick,
  icon,
  label,
  accentColor,
  textColor,
  secondaryColor,
  testId,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all relative"
      style={{
        color: active ? accentColor : secondaryColor,
      }}
      data-testid={testId}
    >
      {icon}
      {label}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: accentColor }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </button>
  );
}
