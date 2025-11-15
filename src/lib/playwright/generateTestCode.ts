import { TestScenario, TestStep, CodeLanguage, PluginStepData } from '../types';
import { generatePluginCode } from '../plugins/pluginCodeGenerator';
import { getPlugin } from '../plugins/pluginRegistry';

/**
 * Generate Playwright test code from AI-generated test scenarios
 */
export function generateTestCode(
  suiteName: string,
  targetUrl: string,
  scenarios: TestScenario[],
  language: CodeLanguage = 'typescript'
): string {
  const imports = generateImports(language);
  const testSuite = generateTestSuite(suiteName, targetUrl, scenarios, language);

  return `${imports}\n\n${testSuite}`;
}

/**
 * Generate import statements
 */
function generateImports(language: CodeLanguage): string {
  if (language === 'javascript') {
    return `const { test, expect } = require('@playwright/test');`;
  }
  return `import { test, expect } from '@playwright/test';`;
}

/**
 * Generate the test suite with all scenarios
 */
function generateTestSuite(
  suiteName: string,
  targetUrl: string,
  scenarios: TestScenario[],
  language: CodeLanguage
): string {
  const arrow = language === 'javascript' ? 'async ({ page })' : 'async ({ page })';

  const beforeEach = `  test.beforeEach(${arrow} => {
    await page.goto('${targetUrl}');
    await page.waitForLoadState('networkidle');
  });`;

  const tests = scenarios.map((scenario) => generateTest(scenario, language)).join('\n\n');

  return `test.describe('${suiteName}', () => {
${beforeEach}

${tests}
});`;
}

/**
 * Generate a single test from a scenario
 */
function generateTest(scenario: TestScenario, language: CodeLanguage): string {
  const testBody = scenario.steps.map((step) => generateStep(step)).join('\n');

  const viewportConfig = scenario.viewports.length > 0
    ? `\n  // Test applies to: ${scenario.viewports.join(', ')}`
    : '';

  const arrow = language === 'javascript' ? 'async ({ page })' : 'async ({ page })';

  return `  test('${scenario.name}', ${arrow} => {
    // ${scenario.description}
    // Priority: ${scenario.priority} | Category: ${scenario.category}${viewportConfig}

${testBody}
  });`;
}

/**
 * Generate code for a single test step
 */
function generateStep(step: TestStep): string {
  const indent = '    ';
  const comment = `// ${step.description}`;

  // Check if this is a plugin action
  if (step.pluginAction) {
    return generatePluginStepCode(step.pluginAction, comment, indent);
  }

  switch (step.action) {
    case 'navigate':
      return `${indent}${comment}\n${indent}await page.goto('${step.value}');`;

    case 'click':
      return `${indent}${comment}\n${indent}await page.click('${step.selector}');`;

    case 'fill':
      return `${indent}${comment}\n${indent}await page.fill('${step.selector}', '${step.value}');`;

    case 'assert':
      if (step.selector) {
        return `${indent}${comment}\n${indent}await expect(page.locator('${step.selector}')).toBeVisible();`;
      }
      return `${indent}${comment}\n${indent}// Custom assertion needed`;

    case 'screenshot':
      const screenshotName = step.value || 'checkpoint';
      return `${indent}${comment}\n${indent}await page.screenshot({ path: '${screenshotName}.png', fullPage: true });`;

    case 'wait':
      if (step.selector) {
        return `${indent}${comment}\n${indent}await page.waitForSelector('${step.selector}', { state: 'visible' });`;
      }
      return `${indent}${comment}\n${indent}await page.waitForTimeout(${step.value || '1000'});`;

    case 'hover':
      return `${indent}${comment}\n${indent}await page.hover('${step.selector}');`;

    case 'select':
      return `${indent}${comment}\n${indent}await page.selectOption('${step.selector}', '${step.value}');`;

    default:
      return `${indent}${comment}\n${indent}// Unknown action: ${step.action}`;
  }
}

/**
 * Generate code for a plugin step
 */
function generatePluginStepCode(pluginData: PluginStepData, comment: string, indent: string): string {
  const plugin = getPlugin(pluginData.pluginId);

  if (!plugin) {
    return `${indent}${comment}\n${indent}// Plugin not found: ${pluginData.pluginId}`;
  }

  const generatedCode = generatePluginCode(pluginData, plugin.codeGenerator, { indent });
  return `${indent}${comment}\n${generatedCode}`;
}

/**
 * Format and prettify the generated code
 */
export function formatCode(code: string): string {
  // Basic formatting - can be enhanced with prettier
  return code
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim() + '\n';
}
