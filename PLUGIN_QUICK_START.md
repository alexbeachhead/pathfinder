# Plugin System - Quick Start Guide

## 5-Minute Setup

### Step 1: Run Database Migration

Execute the plugin schema in your Supabase SQL Editor:

```sql
-- Copy and paste contents from: supabase/schema-plugins.sql
```

Or via Supabase CLI:
```bash
supabase db push
```

### Step 2: Verify Installation

The plugin system auto-initializes on app load. Check browser console for:
```
[Plugin System] Initializing...
[Plugin System] Initialized with 6 plugins (6 enabled)
```

### Step 3: Access Plugin Manager

1. Navigate to the Designer page
2. Look for the "Plugin Manager" button
3. Click to open the Plugin Manager modal

You should see 6 built-in plugins installed:
- API Call
- Custom Selector
- File Upload
- Drag & Drop
- Local Storage
- Cookie Management

## Using Built-in Plugins

### Example 1: Add an API Call to Your Test

1. In Designer, create a new test suite
2. Click "Add Plugin Action"
3. Select **API Call** from the list
4. Fill in parameters:
   - **HTTP Method**: GET
   - **API URL**: https://api.example.com/users
   - **Expected Status**: 200
5. Click "Add Action"

Generated code:
```typescript
// API Call: GET https://api.example.com/users
const response = await page.request.get('https://api.example.com/users');
expect(response.status()).toBe(200);
```

### Example 2: Use Custom Selector (XPath)

1. Click "Add Plugin Action"
2. Select **Custom Selector**
3. Fill in parameters:
   - **Selector Type**: XPath
   - **Selector**: `//button[contains(text(), "Submit")]`
   - **Action**: Click
4. Click "Add Action"

Generated code:
```typescript
// Custom Selector: xpath
await page.locator('xpath=//button[contains(text(), "Submit")]').click();
```

### Example 3: Manage Cookies

1. Click "Add Plugin Action"
2. Select **Cookie Management**
3. Fill in parameters:
   - **Operation**: Set Cookie
   - **Cookie Name**: session_id
   - **Cookie Value**: abc123xyz
   - **Domain**: .example.com
4. Click "Add Action"

Generated code:
```typescript
// Cookie: set
await page.context().addCookies([{
  name: 'session_id',
  value: 'abc123xyz',
  domain: '.example.com',
  path: '/'
}]);
```

## Creating Your First Custom Plugin

### Simple Example: Screenshot with Timestamp

Create a file: `src/lib/plugins/custom/timestampScreenshot.ts`

```typescript
import { PluginAction } from '@/lib/types';
import { registerPlugin, registerCodeGenerator } from '@/lib/plugins';

// Define the plugin
export const timestampScreenshotPlugin: PluginAction = {
  metadata: {
    id: 'custom-timestamp-screenshot',
    name: 'timestamp-screenshot',
    displayName: 'Screenshot with Timestamp',
    description: 'Takes a screenshot with current timestamp in filename',
    author: 'Your Team',
    version: '1.0.0',
    category: 'utility',
    icon: 'Camera',
    tags: ['screenshot', 'timestamp', 'utility'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  actionType: 'custom',
  parameters: [
    {
      name: 'prefix',
      label: 'Filename Prefix',
      type: 'string',
      required: false,
      defaultValue: 'screenshot',
      placeholder: 'screenshot',
      description: 'Prefix for the screenshot filename',
    },
    {
      name: 'fullPage',
      label: 'Full Page',
      type: 'boolean',
      required: false,
      defaultValue: true,
      description: 'Capture full scrollable page',
    },
  ],
  codeGenerator: 'generateTimestampScreenshotCode',
  examples: [
    {
      title: 'Basic timestamp screenshot',
      description: 'Capture full page with timestamp',
      parameterValues: {
        prefix: 'checkout',
        fullPage: true,
      },
      expectedCode: `const timestamp = new Date().toISOString().replace(/:/g, '-');
await page.screenshot({ path: \`checkout-\${timestamp}.png\`, fullPage: true });`,
    },
  ],
};

// Define the code generator
export function generateTimestampScreenshotCode(pluginData, context = {}) {
  const { indent = '    ' } = context;
  const { parameters } = pluginData;

  const prefix = parameters.prefix || 'screenshot';
  const fullPage = parameters.fullPage !== false;

  let code = `${indent}// Screenshot with Timestamp\n`;
  code += `${indent}const timestamp = new Date().toISOString().replace(/:/g, '-');\n`;
  code += `${indent}await page.screenshot({ path: \`${prefix}-\${timestamp}.png\`, fullPage: ${fullPage} });\n`;

  return code;
}

// Register the plugin
registerCodeGenerator('generateTimestampScreenshotCode', generateTimestampScreenshotCode);
registerPlugin(timestampScreenshotPlugin);
```

### Import in App Initialization

In `src/app/layout.tsx` or a central initialization file:

```typescript
import '@/lib/plugins/custom/timestampScreenshot';
```

That's it! Your custom plugin is now available in the Plugin Manager and Designer.

## Common Plugin Patterns

### API Integration Plugin

```typescript
{
  name: 'graphql-query',
  displayName: 'GraphQL Query',
  parameters: [
    { name: 'endpoint', type: 'string', required: true },
    { name: 'query', type: 'multiline', required: true },
    { name: 'variables', type: 'json', required: false },
  ],
  codeGenerator: 'generateGraphQLCode',
}
```

### Custom Assertion Plugin

```typescript
{
  name: 'assert-email-valid',
  displayName: 'Assert Valid Email',
  parameters: [
    { name: 'selector', type: 'string', required: true },
  ],
  codeGenerator: 'generateEmailAssertionCode',
}
```

### Database Plugin

```typescript
{
  name: 'postgres-query',
  displayName: 'PostgreSQL Query',
  parameters: [
    { name: 'connectionString', type: 'string', required: true },
    { name: 'query', type: 'multiline', required: true },
  ],
  codeGenerator: 'generatePostgresCode',
  dependencies: ['pg'], // NPM packages needed
}
```

## Plugin Development Tips

### 1. Use Descriptive Names
```typescript
// Good
displayName: 'Verify Payment Gateway Response'

// Bad
displayName: 'Check PG'
```

### 2. Provide Helpful Descriptions
```typescript
description: 'Validates payment gateway response including status code, transaction ID, and amount'
```

### 3. Add Examples
```typescript
examples: [
  {
    title: 'Verify successful payment',
    description: 'Check 200 status and valid transaction ID',
    parameterValues: { ... },
    expectedCode: '...',
  },
]
```

### 4. Use Validation
```typescript
{
  name: 'timeout',
  type: 'number',
  validation: {
    min: 1000,
    max: 60000,
  },
}
```

### 5. Categorize Properly
- `interaction` - User interactions (clicks, fills, etc.)
- `api` - API calls and HTTP requests
- `data` - Data management (storage, cookies, etc.)
- `assertion` - Validation and assertions
- `utility` - Helper functions
- `custom` - Everything else

## Troubleshooting

### Plugin Not Showing Up

**Check console for errors:**
```javascript
// Open browser console
// Look for: [Plugin System] Initialized with X plugins
```

**Verify registration:**
```javascript
import { getAllPlugins } from '@/lib/plugins';
console.log(getAllPlugins());
```

### Code Not Generating

**Ensure code generator is registered:**
```typescript
import { registerCodeGenerator } from '@/lib/plugins';
registerCodeGenerator('myGeneratorName', myGeneratorFunction);
```

**Check generator function signature:**
```typescript
function myGenerator(pluginData: PluginStepData, context: CodeGeneratorContext = {}) {
  // Must return string
  return '    // Generated code\n';
}
```

### Plugin Manager Not Opening

**Check for modal blocking:**
- Look for z-index conflicts
- Verify ThemedCard component is working
- Check browser console for errors

## Next Steps

1. **Explore Built-in Plugins**: Try each of the 6 default plugins
2. **Read Full Documentation**: See PLUGIN_SYSTEM.md
3. **Create Custom Plugins**: Start with simple examples
4. **Share with Team**: Use Plugin Manager to distribute
5. **Contribute**: Submit plugins to marketplace (future feature)

## Resources

- **Full Documentation**: PLUGIN_SYSTEM.md
- **Implementation Summary**: PLUGIN_IMPLEMENTATION_SUMMARY.md
- **Type Definitions**: src/lib/types.ts
- **Example Plugins**: src/lib/plugins/defaultPlugins.ts
- **Code Generators**: src/lib/plugins/pluginCodeGenerator.ts

---

**Happy Plugin Development! 🚀**
