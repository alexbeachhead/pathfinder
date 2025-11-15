import { PaletteItem } from './flowTypes';

/**
 * Palette of available test step types that can be dragged into the flow
 */
export const PALETTE_ITEMS: PaletteItem[] = [
  // Navigation Actions
  {
    type: 'navigate',
    label: 'Navigate to URL',
    description: 'Go to a specific page',
    icon: 'ArrowRight',
    intent: 'navigation',
    category: 'action',
    defaultConfig: {
      description: 'Navigate to page',
      url: '',
    },
  },

  // Interaction Actions
  {
    type: 'click',
    label: 'Click Element',
    description: 'Click a button, link, or element',
    icon: 'MousePointer',
    intent: 'interaction',
    category: 'action',
    defaultConfig: {
      description: 'Click element',
      selector: '',
    },
  },
  {
    type: 'fill',
    label: 'Fill Input',
    description: 'Enter text into a form field',
    icon: 'Type',
    intent: 'data-entry',
    category: 'action',
    defaultConfig: {
      description: 'Fill input field',
      selector: '',
      value: '',
    },
  },
  {
    type: 'select',
    label: 'Select Option',
    description: 'Select from a dropdown',
    icon: 'List',
    intent: 'data-entry',
    category: 'action',
    defaultConfig: {
      description: 'Select option',
      selector: '',
      value: '',
    },
  },
  {
    type: 'hover',
    label: 'Hover Element',
    description: 'Hover over an element',
    icon: 'Move',
    intent: 'interaction',
    category: 'action',
    defaultConfig: {
      description: 'Hover over element',
      selector: '',
    },
  },

  // Assertion Actions
  {
    type: 'assert',
    label: 'Assert Condition',
    description: 'Verify a condition is true',
    icon: 'CheckCircle',
    intent: 'validation',
    category: 'assertion',
    defaultConfig: {
      description: 'Verify condition',
      assertion: '',
      expectedResult: '',
    },
  },
  {
    type: 'verify',
    label: 'Verify Element',
    description: 'Check element exists or has specific text',
    icon: 'Eye',
    intent: 'validation',
    category: 'assertion',
    defaultConfig: {
      description: 'Verify element',
      selector: '',
      expectedResult: '',
    },
  },

  // Utility Actions
  {
    type: 'screenshot',
    label: 'Take Screenshot',
    description: 'Capture page screenshot',
    icon: 'Camera',
    intent: 'visual',
    category: 'utility',
    defaultConfig: {
      description: 'Take screenshot',
    },
  },
  {
    type: 'wait',
    label: 'Wait',
    description: 'Wait for a duration or condition',
    icon: 'Clock',
    intent: 'waiting',
    category: 'utility',
    defaultConfig: {
      description: 'Wait for element or duration',
      timeout: 3000,
    },
  },
];

/**
 * Get palette items by category
 */
export function getPaletteItemsByCategory(category: 'action' | 'assertion' | 'utility'): PaletteItem[] {
  return PALETTE_ITEMS.filter(item => item.category === category);
}

/**
 * Get palette item by type
 */
export function getPaletteItemByType(type: string): PaletteItem | undefined {
  return PALETTE_ITEMS.find(item => item.type === type);
}

/**
 * Get palette items by intent
 */
export function getPaletteItemsByIntent(intent: string): PaletteItem[] {
  return PALETTE_ITEMS.filter(item => item.intent === intent);
}

/**
 * Palette categories for UI organization
 */
export const PALETTE_CATEGORIES = [
  {
    id: 'action',
    label: 'Actions',
    description: 'User interactions and navigation',
    color: '#3b82f6',
  },
  {
    id: 'assertion',
    label: 'Assertions',
    description: 'Verify conditions and elements',
    color: '#10b981',
  },
  {
    id: 'utility',
    label: 'Utilities',
    description: 'Screenshots and delays',
    color: '#8b5cf6',
  },
] as const;
