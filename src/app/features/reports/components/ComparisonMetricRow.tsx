'use client';

/**
 * Reusable comparison metric row component
 * Refactoring Batch 15 - Extract duplicated metric row pattern
 */

interface ComparisonMetricRowProps {
  label: string;
  value: number | string;
  labelColor: string;
  valueColor: string;
  isBold?: boolean;
}

export function ComparisonMetricRow({
  label,
  value,
  labelColor,
  valueColor,
  isBold = false,
}: ComparisonMetricRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm" style={{ color: labelColor }}>
        {label}
      </span>
      <span
        className={isBold ? 'font-semibold' : 'font-normal'}
        style={{ color: valueColor }}
      >
        {value}
      </span>
    </div>
  );
}
