import { PluginStepData, PluginActionType } from '../types';

/**
 * Code generators for plugin actions
 */

export interface CodeGeneratorContext {
  indent?: string;
  language?: 'javascript' | 'typescript';
}

/**
 * Generate Playwright code for API call plugin
 */
export function generateApiCallCode(
  pluginData: PluginStepData,
  context: CodeGeneratorContext = {}
): string {
  const { indent = '    ' } = context;
  const { parameters } = pluginData;

  const method = (parameters.method as string)?.toLowerCase() || 'get';
  const url = parameters.url as string;
  const headers = parameters.headers as Record<string, string> | undefined;
  const body = parameters.body as Record<string, unknown> | undefined;
  const assertStatus = parameters.assertStatus as number | undefined;

  let code = '';

  // Build options object
  const options: string[] = [];
  if (headers) {
    options.push(`headers: ${JSON.stringify(headers, null, 2).split('\n').join(`\n${indent}  `)}`);
  }
  if (body && ['post', 'put', 'patch'].includes(method)) {
    options.push(`data: ${JSON.stringify(body, null, 2).split('\n').join(`\n${indent}  `)}`);
  }

  const optionsStr = options.length > 0 ? `, {\n${indent}  ${options.join(`,\n${indent}  `)}\n${indent}}` : '';

  code += `${indent}// API Call: ${method.toUpperCase()} ${url}\n`;
  code += `${indent}const response = await page.request.${method}('${url}'${optionsStr});\n`;

  if (assertStatus) {
    code += `${indent}expect(response.status()).toBe(${assertStatus});\n`;
  }

  return code;
}

/**
 * Generate Playwright code for custom selector plugin
 */
export function generateCustomSelectorCode(
  pluginData: PluginStepData,
  context: CodeGeneratorContext = {}
): string {
  const { indent = '    ' } = context;
  const { parameters } = pluginData;

  const selectorType = parameters.selectorType as string;
  const selector = parameters.selector as string;
  const action = parameters.action as string;
  const value = parameters.value as string | undefined;

  let selectorStr = selector;

  // Format selector based on type
  switch (selectorType) {
    case 'xpath':
      selectorStr = `xpath=${selector}`;
      break;
    case 'text':
      selectorStr = `text=${selector}`;
      break;
    case 'data-testid':
      selectorStr = `[data-testid="${selector}"]`;
      break;
    case 'css':
    default:
      selectorStr = selector;
  }

  let code = `${indent}// Custom Selector: ${selectorType}\n`;

  switch (action) {
    case 'click':
      code += `${indent}await page.locator('${selectorStr}').click();\n`;
      break;
    case 'fill':
      code += `${indent}await page.locator('${selectorStr}').fill('${value || ''}');\n`;
      break;
    case 'assert-visible':
      code += `${indent}await expect(page.locator('${selectorStr}')).toBeVisible();\n`;
      break;
    case 'get-text':
      code += `${indent}const text = await page.locator('${selectorStr}').textContent();\n`;
      break;
    case 'hover':
      code += `${indent}await page.locator('${selectorStr}').hover();\n`;
      break;
    default:
      code += `${indent}// Unknown action: ${action}\n`;
  }

  return code;
}

/**
 * Generate Playwright code for file upload plugin
 */
export function generateFileUploadCode(
  pluginData: PluginStepData,
  context: CodeGeneratorContext = {}
): string {
  const { indent = '    ' } = context;
  const { parameters } = pluginData;

  const selector = parameters.selector as string;
  const filePath = parameters.filePath as string;
  const multiple = parameters.multiple as boolean;

  let code = `${indent}// File Upload\n`;

  if (multiple) {
    code += `${indent}await page.setInputFiles('${selector}', ['${filePath}']);\n`;
  } else {
    code += `${indent}await page.setInputFiles('${selector}', '${filePath}');\n`;
  }

  return code;
}

/**
 * Generate Playwright code for drag & drop plugin
 */
export function generateDragDropCode(
  pluginData: PluginStepData,
  context: CodeGeneratorContext = {}
): string {
  const { indent = '    ' } = context;
  const { parameters } = pluginData;

  const sourceSelector = parameters.sourceSelector as string;
  const targetSelector = parameters.targetSelector as string;

  let code = `${indent}// Drag & Drop\n`;
  code += `${indent}await page.locator('${sourceSelector}').dragTo(page.locator('${targetSelector}'));\n`;

  return code;
}

/**
 * Generate Playwright code for localStorage plugin
 */
export function generateLocalStorageCode(
  pluginData: PluginStepData,
  context: CodeGeneratorContext = {}
): string {
  const { indent = '    ' } = context;
  const { parameters } = pluginData;

  const operation = parameters.operation as string;
  const key = parameters.key as string;
  const value = parameters.value as string;

  let code = `${indent}// LocalStorage: ${operation}\n`;

  switch (operation) {
    case 'get':
      code += `${indent}const ${key.replace(/[^a-zA-Z0-9]/g, '_')} = await page.evaluate(() => localStorage.getItem('${key}'));\n`;
      break;
    case 'set':
      code += `${indent}await page.evaluate(() => localStorage.setItem('${key}', '${value}'));\n`;
      break;
    case 'remove':
      code += `${indent}await page.evaluate(() => localStorage.removeItem('${key}'));\n`;
      break;
    case 'clear':
      code += `${indent}await page.evaluate(() => localStorage.clear());\n`;
      break;
    default:
      code += `${indent}// Unknown operation: ${operation}\n`;
  }

  return code;
}

/**
 * Generate Playwright code for cookie plugin
 */
export function generateCookieCode(
  pluginData: PluginStepData,
  context: CodeGeneratorContext = {}
): string {
  const { indent = '    ' } = context;
  const { parameters } = pluginData;

  const operation = parameters.operation as string;
  const name = parameters.name as string;
  const value = parameters.value as string;
  const domain = parameters.domain as string;

  let code = `${indent}// Cookie: ${operation}\n`;

  switch (operation) {
    case 'get':
      code += `${indent}const cookies = await page.context().cookies();\n`;
      code += `${indent}const ${name?.replace(/[^a-zA-Z0-9]/g, '_')} = cookies.find(c => c.name === '${name}');\n`;
      break;
    case 'set':
      code += `${indent}await page.context().addCookies([{\n`;
      code += `${indent}  name: '${name}',\n`;
      code += `${indent}  value: '${value}',\n`;
      if (domain) {
        code += `${indent}  domain: '${domain}',\n`;
      }
      code += `${indent}  path: '/'\n`;
      code += `${indent}}]);\n`;
      break;
    case 'delete':
      code += `${indent}await page.context().clearCookies({ name: '${name}' });\n`;
      break;
    case 'clear':
      code += `${indent}await page.context().clearCookies();\n`;
      break;
    default:
      code += `${indent}// Unknown operation: ${operation}\n`;
  }

  return code;
}

/**
 * Map of code generators by name
 */
const codeGenerators: Record<string, (data: PluginStepData, context: CodeGeneratorContext) => string> = {
  generateApiCallCode,
  generateCustomSelectorCode,
  generateFileUploadCode,
  generateDragDropCode,
  generateLocalStorageCode,
  generateCookieCode,
};

/**
 * Generate code for a plugin step
 */
export function generatePluginCode(
  pluginData: PluginStepData,
  generatorName: string,
  context: CodeGeneratorContext = {}
): string {
  const generator = codeGenerators[generatorName];

  if (!generator) {
    console.warn(`Code generator "${generatorName}" not found`);
    return `${context.indent || '    '}// Plugin action: ${pluginData.actionType} (generator not found)\n`;
  }

  try {
    return generator(pluginData, context);
  } catch (error) {
    console.error(`Error generating code for plugin ${pluginData.pluginId}:`, error);
    return `${context.indent || '    '}// Error generating plugin code\n`;
  }
}

/**
 * Register a custom code generator
 */
export function registerCodeGenerator(
  name: string,
  generator: (data: PluginStepData, context: CodeGeneratorContext) => string
): void {
  codeGenerators[name] = generator;
}
