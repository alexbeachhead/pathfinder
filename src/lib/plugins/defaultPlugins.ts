import { PluginAction } from '../types';

/**
 * Default built-in plugin actions
 */

export const apiCallPlugin: PluginAction = {
  metadata: {
    id: 'builtin-api-call',
    name: 'api-call',
    displayName: 'API Call',
    description: 'Make HTTP API requests during test execution',
    author: 'Pathfinder',
    version: '1.0.0',
    category: 'api',
    icon: 'Globe',
    tags: ['api', 'http', 'rest', 'request'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  actionType: 'api-call',
  parameters: [
    {
      name: 'method',
      label: 'HTTP Method',
      type: 'select',
      required: true,
      defaultValue: 'GET',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'PATCH', value: 'PATCH' },
        { label: 'DELETE', value: 'DELETE' },
      ],
      description: 'HTTP method to use for the API call',
    },
    {
      name: 'url',
      label: 'API URL',
      type: 'string',
      required: true,
      placeholder: 'https://api.example.com/endpoint',
      description: 'The full URL of the API endpoint',
      validation: {
        pattern: '^https?://.+',
      },
    },
    {
      name: 'headers',
      label: 'Headers (JSON)',
      type: 'json',
      required: false,
      placeholder: '{"Content-Type": "application/json"}',
      description: 'HTTP headers as JSON object',
    },
    {
      name: 'body',
      label: 'Request Body (JSON)',
      type: 'json',
      required: false,
      placeholder: '{"key": "value"}',
      description: 'Request body for POST/PUT/PATCH requests',
    },
    {
      name: 'assertStatus',
      label: 'Expected Status Code',
      type: 'number',
      required: false,
      defaultValue: 200,
      description: 'Assert the response status code',
      validation: {
        min: 100,
        max: 599,
      },
    },
  ],
  codeGenerator: 'generateApiCallCode',
  dependencies: [],
  examples: [
    {
      title: 'Simple GET request',
      description: 'Fetch data from an API endpoint',
      parameterValues: {
        method: 'GET',
        url: 'https://api.example.com/users',
        assertStatus: 200,
      },
      expectedCode: `const response = await page.request.get('https://api.example.com/users');
expect(response.status()).toBe(200);`,
    },
  ],
};

export const customSelectorPlugin: PluginAction = {
  metadata: {
    id: 'builtin-custom-selector',
    name: 'custom-selector',
    displayName: 'Custom Selector',
    description: 'Use advanced selectors like XPath, nth-child, or custom attributes',
    author: 'Pathfinder',
    version: '1.0.0',
    category: 'interaction',
    icon: 'Target',
    tags: ['selector', 'xpath', 'css', 'custom'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  actionType: 'custom-selector',
  parameters: [
    {
      name: 'selectorType',
      label: 'Selector Type',
      type: 'select',
      required: true,
      defaultValue: 'css',
      options: [
        { label: 'CSS Selector', value: 'css' },
        { label: 'XPath', value: 'xpath' },
        { label: 'Text Content', value: 'text' },
        { label: 'Data Attribute', value: 'data-testid' },
        { label: 'Nth Child', value: 'nth' },
      ],
    },
    {
      name: 'selector',
      label: 'Selector',
      type: 'string',
      required: true,
      placeholder: '//div[@class="button"]',
      description: 'The selector string',
    },
    {
      name: 'action',
      label: 'Action',
      type: 'select',
      required: true,
      defaultValue: 'click',
      options: [
        { label: 'Click', value: 'click' },
        { label: 'Fill', value: 'fill' },
        { label: 'Assert Visible', value: 'assert-visible' },
        { label: 'Get Text', value: 'get-text' },
        { label: 'Hover', value: 'hover' },
      ],
    },
    {
      name: 'value',
      label: 'Value (for fill action)',
      type: 'string',
      required: false,
      placeholder: 'Text to enter',
    },
  ],
  codeGenerator: 'generateCustomSelectorCode',
  dependencies: [],
  examples: [
    {
      title: 'Click using XPath',
      description: 'Click an element using XPath selector',
      parameterValues: {
        selectorType: 'xpath',
        selector: '//button[contains(text(), "Submit")]',
        action: 'click',
      },
      expectedCode: `await page.locator('xpath=//button[contains(text(), "Submit")]').click();`,
    },
  ],
};

export const fileUploadPlugin: PluginAction = {
  metadata: {
    id: 'builtin-file-upload',
    name: 'file-upload',
    displayName: 'File Upload',
    description: 'Upload files to file input elements',
    author: 'Pathfinder',
    version: '1.0.0',
    category: 'interaction',
    icon: 'Upload',
    tags: ['upload', 'file', 'input'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  actionType: 'file-upload',
  parameters: [
    {
      name: 'selector',
      label: 'File Input Selector',
      type: 'string',
      required: true,
      placeholder: 'input[type="file"]',
      description: 'CSS selector for the file input element',
    },
    {
      name: 'filePath',
      label: 'File Path',
      type: 'string',
      required: true,
      placeholder: './test-files/sample.pdf',
      description: 'Path to the file to upload',
    },
    {
      name: 'multiple',
      label: 'Multiple Files',
      type: 'boolean',
      required: false,
      defaultValue: false,
      description: 'Upload multiple files',
    },
  ],
  codeGenerator: 'generateFileUploadCode',
  dependencies: [],
  examples: [
    {
      title: 'Single file upload',
      description: 'Upload a single file',
      parameterValues: {
        selector: 'input[type="file"]',
        filePath: './test-files/sample.pdf',
        multiple: false,
      },
      expectedCode: `await page.setInputFiles('input[type="file"]', './test-files/sample.pdf');`,
    },
  ],
};

export const dragDropPlugin: PluginAction = {
  metadata: {
    id: 'builtin-drag-drop',
    name: 'drag-drop',
    displayName: 'Drag & Drop',
    description: 'Perform drag and drop operations',
    author: 'Pathfinder',
    version: '1.0.0',
    category: 'interaction',
    icon: 'Move',
    tags: ['drag', 'drop', 'dnd', 'interaction'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  actionType: 'drag-drop',
  parameters: [
    {
      name: 'sourceSelector',
      label: 'Source Element Selector',
      type: 'string',
      required: true,
      placeholder: '.draggable-item',
      description: 'Selector for the element to drag',
    },
    {
      name: 'targetSelector',
      label: 'Target Element Selector',
      type: 'string',
      required: true,
      placeholder: '.drop-zone',
      description: 'Selector for the drop target',
    },
  ],
  codeGenerator: 'generateDragDropCode',
  dependencies: [],
  examples: [
    {
      title: 'Drag and drop',
      description: 'Drag an element to a drop zone',
      parameterValues: {
        sourceSelector: '.draggable-item',
        targetSelector: '.drop-zone',
      },
      expectedCode: `await page.locator('.draggable-item').dragTo(page.locator('.drop-zone'));`,
    },
  ],
};

export const localStoragePlugin: PluginAction = {
  metadata: {
    id: 'builtin-local-storage',
    name: 'local-storage',
    displayName: 'Local Storage',
    description: 'Read, write, or clear localStorage',
    author: 'Pathfinder',
    version: '1.0.0',
    category: 'data',
    icon: 'Database',
    tags: ['storage', 'localstorage', 'data'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  actionType: 'local-storage',
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      required: true,
      defaultValue: 'get',
      options: [
        { label: 'Get Item', value: 'get' },
        { label: 'Set Item', value: 'set' },
        { label: 'Remove Item', value: 'remove' },
        { label: 'Clear All', value: 'clear' },
      ],
    },
    {
      name: 'key',
      label: 'Storage Key',
      type: 'string',
      required: false,
      placeholder: 'user-preferences',
      description: 'Key for the localStorage item',
    },
    {
      name: 'value',
      label: 'Value (for set operation)',
      type: 'string',
      required: false,
      placeholder: '{"theme": "dark"}',
      description: 'Value to store',
    },
  ],
  codeGenerator: 'generateLocalStorageCode',
  dependencies: [],
  examples: [
    {
      title: 'Set localStorage item',
      description: 'Store data in localStorage',
      parameterValues: {
        operation: 'set',
        key: 'theme',
        value: 'dark',
      },
      expectedCode: `await page.evaluate(() => localStorage.setItem('theme', 'dark'));`,
    },
  ],
};

export const cookiePlugin: PluginAction = {
  metadata: {
    id: 'builtin-cookie',
    name: 'cookie',
    displayName: 'Cookie Management',
    description: 'Read, write, or delete cookies',
    author: 'Pathfinder',
    version: '1.0.0',
    category: 'data',
    icon: 'Cookie',
    tags: ['cookie', 'session', 'auth'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  actionType: 'cookie',
  parameters: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      required: true,
      defaultValue: 'get',
      options: [
        { label: 'Get Cookie', value: 'get' },
        { label: 'Set Cookie', value: 'set' },
        { label: 'Delete Cookie', value: 'delete' },
        { label: 'Clear All', value: 'clear' },
      ],
    },
    {
      name: 'name',
      label: 'Cookie Name',
      type: 'string',
      required: false,
      placeholder: 'session_id',
    },
    {
      name: 'value',
      label: 'Cookie Value',
      type: 'string',
      required: false,
      placeholder: 'abc123',
    },
    {
      name: 'domain',
      label: 'Domain',
      type: 'string',
      required: false,
      placeholder: '.example.com',
    },
  ],
  codeGenerator: 'generateCookieCode',
  dependencies: [],
  examples: [
    {
      title: 'Set a cookie',
      description: 'Add a cookie to the browser context',
      parameterValues: {
        operation: 'set',
        name: 'session_id',
        value: 'abc123',
        domain: '.example.com',
      },
      expectedCode: `await page.context().addCookies([{ name: 'session_id', value: 'abc123', domain: '.example.com', path: '/' }]);`,
    },
  ],
};

/**
 * Get all default plugins
 */
export function getDefaultPlugins(): PluginAction[] {
  return [
    apiCallPlugin,
    customSelectorPlugin,
    fileUploadPlugin,
    dragDropPlugin,
    localStoragePlugin,
    cookiePlugin,
  ];
}
