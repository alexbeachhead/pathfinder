/**
 * Form helper utilities for designer components
 */

import { CSSProperties } from 'react';
import { Theme } from '@/lib/theme';

/**
 * Generate form input styles
 */
export function getInputStyle(
  theme: Theme,
  hasError?: boolean
): CSSProperties {
  return {
    backgroundColor: theme.colors.surface,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: hasError ? '#ef4444' : theme.colors.border,
    color: theme.colors.text.primary,
  };
}

/**
 * Generate label styles
 */
export function getLabelStyle(theme: Theme): CSSProperties {
  return {
    color: theme.colors.text.secondary,
  };
}

/**
 * Generate error text style
 */
export function getErrorStyle(): CSSProperties {
  return {
    color: '#ef4444',
  };
}

/**
 * Download file helper
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download image from base64
 */
export function downloadImageFromBase64(base64: string, filename: string) {
  const link = document.createElement('a');
  link.href = `data:image/png;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
