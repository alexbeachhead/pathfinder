/**
 * Flow Builder Tests
 *
 * These tests verify the core functionality of the Flow Builder feature
 */

import { describe, it, expect } from '@jest/globals';
import {
  serializeFlow,
  deserializeFlow,
  flowToNaturalLanguage,
  flowToPlaywrightCode,
  validateFlow,
  flowToTestTemplate,
} from '../lib/flowSerializer';
import { TestFlow } from '../lib/flowTypes';

describe('Flow Builder', () => {
  const sampleFlow: TestFlow = {
    id: 'test-flow-1',
    name: 'Sample Login Test',
    description: 'Test user login flow',
    targetUrl: 'https://example.com/login',
    steps: [
      {
        id: 'step-1',
        type: 'navigate',
        order: 0,
        config: {
          description: 'Navigate to login page',
          url: 'https://example.com/login',
        },
      },
      {
        id: 'step-2',
        type: 'fill',
        order: 1,
        config: {
          description: 'Enter username',
          selector: 'input[name="username"]',
          value: 'testuser@example.com',
        },
      },
      {
        id: 'step-3',
        type: 'fill',
        order: 2,
        config: {
          description: 'Enter password',
          selector: 'input[name="password"]',
          value: 'password123',
        },
      },
      {
        id: 'step-4',
        type: 'click',
        order: 3,
        config: {
          description: 'Click login button',
          selector: 'button[type="submit"]',
        },
      },
      {
        id: 'step-5',
        type: 'verify',
        order: 4,
        config: {
          description: 'Verify dashboard loaded',
          selector: '.dashboard-header',
          expectedResult: 'Dashboard',
        },
      },
    ],
    metadata: {
      createdAt: '2025-01-14T00:00:00.000Z',
      updatedAt: '2025-01-14T00:00:00.000Z',
    },
  };

  describe('Serialization', () => {
    it('should serialize flow to JSON', () => {
      const json = serializeFlow(sampleFlow);
      expect(json).toBeDefined();
      expect(typeof json).toBe('string');
      expect(json).toContain('Sample Login Test');
    });

    it('should deserialize JSON to flow', () => {
      const json = serializeFlow(sampleFlow);
      const flow = deserializeFlow(json);
      expect(flow).toEqual(sampleFlow);
    });

    it('should maintain flow structure through serialize/deserialize cycle', () => {
      const json = serializeFlow(sampleFlow);
      const flow = deserializeFlow(json);
      expect(flow.id).toBe(sampleFlow.id);
      expect(flow.steps.length).toBe(sampleFlow.steps.length);
      expect(flow.steps[0].type).toBe('navigate');
    });
  });

  describe('Natural Language Generation', () => {
    it('should convert flow to natural language', () => {
      const nl = flowToNaturalLanguage(sampleFlow);
      expect(nl).toContain('Sample Login Test');
      expect(nl).toContain('Navigate to');
      expect(nl).toContain('https://example.com/login');
      expect(nl).toContain('Fill');
      expect(nl).toContain('Click');
      expect(nl).toContain('Verify');
    });

    it('should include all steps in natural language output', () => {
      const nl = flowToNaturalLanguage(sampleFlow);
      const stepCount = (nl.match(/\d+\./g) || []).length;
      expect(stepCount).toBe(sampleFlow.steps.length);
    });
  });

  describe('Playwright Code Generation', () => {
    it('should generate Playwright code', () => {
      const code = flowToPlaywrightCode(sampleFlow);
      expect(code).toContain('import { test, expect }');
      expect(code).toContain('from \'@playwright/test\'');
      expect(code).toContain('test(\'Sample Login Test\'');
    });

    it('should include all step actions in code', () => {
      const code = flowToPlaywrightCode(sampleFlow);
      expect(code).toContain('await page.goto');
      expect(code).toContain('await page.fill');
      expect(code).toContain('await page.click');
      expect(code).toContain('await expect');
    });

    it('should use correct selectors', () => {
      const code = flowToPlaywrightCode(sampleFlow);
      expect(code).toContain('input[name="username"]');
      expect(code).toContain('input[name="password"]');
      expect(code).toContain('button[type="submit"]');
    });
  });

  describe('Validation', () => {
    it('should validate complete flow as valid', () => {
      const result = validateFlow(sampleFlow);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing flow name', () => {
      const invalidFlow = { ...sampleFlow, name: '' };
      const result = validateFlow(invalidFlow);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Flow must have a name');
    });

    it('should detect empty steps', () => {
      const invalidFlow = { ...sampleFlow, steps: [] };
      const result = validateFlow(invalidFlow);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Flow must have at least one step');
    });

    it('should detect missing URL in navigate step', () => {
      const invalidFlow = {
        ...sampleFlow,
        steps: [
          {
            id: 'step-1',
            type: 'navigate' as const,
            order: 0,
            config: { description: 'Navigate' },
          },
        ],
      };
      const result = validateFlow(invalidFlow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('missing URL'))).toBe(true);
    });

    it('should detect missing selector in click step', () => {
      const invalidFlow = {
        ...sampleFlow,
        steps: [
          {
            id: 'step-1',
            type: 'click' as const,
            order: 0,
            config: { description: 'Click' },
          },
        ],
      };
      const result = validateFlow(invalidFlow);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('missing selector'))).toBe(true);
    });
  });

  describe('Template Conversion', () => {
    it('should convert flow to test template', () => {
      const template = flowToTestTemplate(sampleFlow);
      expect(template.id).toBe(sampleFlow.id);
      expect(template.name).toBe(sampleFlow.name);
      expect(template.description).toBe(sampleFlow.description);
      expect(template.template).toContain('Navigate to');
    });

    it('should include placeholders for URL', () => {
      const template = flowToTestTemplate(sampleFlow);
      expect(template.placeholders.some(p => p.key === 'url')).toBe(true);
    });

    it('should preserve metadata', () => {
      const flow = {
        ...sampleFlow,
        metadata: {
          ...sampleFlow.metadata,
          category: 'Authentication',
          difficulty: 5,
          estimatedTime: 60,
        },
      };
      const template = flowToTestTemplate(flow);
      expect(template.category).toBe('Authentication');
      expect(template.difficulty).toBe(5);
      expect(template.estimatedTime).toBe(60);
    });
  });
});
