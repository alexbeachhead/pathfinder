# Flow Builder Feature

A drag-and-drop visual test flow builder for creating test scenarios without manual code writing.

## Quick Start

```tsx
import { FlowBuilder } from '@/app/features/flow-builder';

export default function MyPage() {
  return (
    <FlowBuilder
      onSave={(flowJson) => {
        // Save flow JSON to database or file
        console.log('Flow saved:', flowJson);
      }}
      onExport={(playwrightCode) => {
        // Export Playwright code
        downloadFile(playwrightCode, 'test.spec.ts');
      }}
      onGenerate={(naturalLanguage) => {
        // Generate NL description for AI processing
        console.log('NL Description:', naturalLanguage);
      }}
    />
  );
}
```

## Architecture

### Components

#### FlowBuilder (Main)
The orchestrator component with three-column layout:
- **Left**: StepPalette - draggable step types
- **Center**: FlowCanvas - drop zone for building flows
- **Right**: StepEditor - configure selected step

#### StepPalette
Displays 9 step types organized in 3 categories:
- **Actions**: navigate, click, fill, select, hover
- **Assertions**: assert, verify
- **Utilities**: screenshot, wait

#### FlowCanvas
Drag-and-drop canvas with:
- Visual step cards
- Drag zones for reordering
- Edit/delete buttons
- Empty state instructions

#### StepEditor
Dynamic form that adapts to step type:
- Navigate: URL field
- Click/Hover: Selector field
- Fill/Select: Selector + Value fields
- Assert: Assertion + Expected result
- Verify: Selector + Expected text/state
- Wait: Timeout + Optional selector

### State Management

Use the `useFlowBuilder` hook:

```tsx
import { useFlowBuilder } from '@/app/features/flow-builder';

const {
  flow,              // Current flow state
  selectedStepId,    // ID of selected step
  selectedStep,      // Full selected step object
  isDirty,           // Has flow been modified?
  validation,        // Validation result

  // Actions
  addStep,           // Add step to flow
  removeStep,        // Remove step by ID
  updateStep,        // Update step config
  moveStep,          // Reorder steps
  updateMetadata,    // Update flow name/description/URL
  clearFlow,         // Reset flow
  loadFlow,          // Load existing flow
  setSelectedStepId, // Select step for editing
  exportJson,        // Export flow as JSON
} = useFlowBuilder({
  initialFlow: existingFlow,
  onChange: (flow) => console.log('Flow changed:', flow),
});
```

### Serialization

Convert flows to different formats:

```tsx
import {
  serializeFlow,           // Flow -> JSON string
  deserializeFlow,         // JSON string -> Flow
  flowToNaturalLanguage,   // Flow -> NL description
  flowToPlaywrightCode,    // Flow -> Playwright code
  flowToTestTemplate,      // Flow -> TestTemplate
  validateFlow,            // Check flow validity
} from '@/app/features/flow-builder';

const flow = { /* ... */ };

// Export as JSON
const json = serializeFlow(flow);

// Generate natural language
const nl = flowToNaturalLanguage(flow);
// Output: "Test: My Test\n1. Navigate to https://example.com\n2. Click 'button'..."

// Generate Playwright code
const code = flowToPlaywrightCode(flow);
// Output: "import { test, expect } from '@playwright/test';\n..."

// Convert to template
const template = flowToTestTemplate(flow);

// Validate
const { valid, errors } = validateFlow(flow);
```

### Integration with Test Templates

Import flows as reusable templates:

```tsx
import { flowToTestTemplate } from '@/app/features/flow-builder';
import { importFlowAsTemplate } from '@/lib/nl-test/testTemplates';

const flow = { /* flow from builder */ };
const template = flowToTestTemplate(flow);

// Make it available in template system
importFlowAsTemplate(template);
```

## Step Types

| Type | Description | Required Fields |
|------|-------------|-----------------|
| `navigate` | Go to URL | url |
| `click` | Click element | selector |
| `fill` | Enter text | selector, value |
| `select` | Choose option | selector, value |
| `hover` | Hover element | selector |
| `assert` | Verify condition | assertion |
| `verify` | Check element | selector |
| `screenshot` | Capture screen | - |
| `wait` | Delay/wait | timeout |

## Type Definitions

```typescript
interface TestFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  targetUrl?: string;
  viewport?: string;
  metadata?: FlowMetadata;
}

interface FlowStep {
  id: string;
  type: StepType;
  order: number;
  config: FlowStepConfig;
}

interface FlowStepConfig {
  description: string;
  selector?: string;
  value?: string;
  url?: string;
  assertion?: string;
  timeout?: number;
  expectedResult?: string;
}

type StepType =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'assert'
  | 'screenshot'
  | 'wait'
  | 'hover'
  | 'select'
  | 'verify';
```

## Test IDs

All interactive components include test IDs for automation:

### Flow Configuration
- `flow-name-input`
- `flow-target-url-input`
- `flow-description-input`

### Actions
- `save-flow-btn`
- `export-code-btn`
- `preview-flow-btn`
- `clear-flow-btn`
- `preview-nl-btn`
- `preview-code-btn`

### Palette
- `palette-item-navigate`
- `palette-item-click`
- `palette-item-fill`
- etc.

### Canvas
- `flow-canvas`
- `flow-step-{stepId}`
- `edit-step-{stepId}`
- `delete-step-{stepId}`

### Step Editor
- `step-description-input`
- `step-url-input`
- `step-selector-input`
- `step-value-input`
- `step-assertion-input`
- `step-expected-result-input`
- `step-timeout-input`

## Examples

### Create a Login Flow

```tsx
const { addStep, updateStep, flow } = useFlowBuilder();

// Add navigate step
const navId = addStep('navigate', {
  description: 'Go to login page',
  url: 'https://example.com/login',
});

// Add fill username
const usernameId = addStep('fill', {
  description: 'Enter username',
  selector: 'input[name="username"]',
  value: 'testuser@example.com',
});

// Add fill password
const passwordId = addStep('fill', {
  description: 'Enter password',
  selector: 'input[name="password"]',
  value: 'password123',
});

// Add click submit
const submitId = addStep('click', {
  description: 'Click login button',
  selector: 'button[type="submit"]',
});

// Add verification
const verifyId = addStep('verify', {
  description: 'Verify redirect to dashboard',
  selector: '.dashboard-header',
  expectedResult: 'Dashboard',
});

// Export as code
const playwrightCode = flowToPlaywrightCode(flow);
```

### Load Saved Flow

```tsx
const savedJson = localStorage.getItem('myFlow');
const savedFlow = deserializeFlow(savedJson);

const { loadFlow } = useFlowBuilder();
loadFlow(savedFlow);
```

### Validate Before Save

```tsx
const { flow, validation } = useFlowBuilder();

if (validation.valid) {
  const json = serializeFlow(flow);
  await saveToDatabase(json);
} else {
  console.error('Validation errors:', validation.errors);
}
```

## Styling

The Flow Builder uses the app's theme system:
- Inherits colors from `ThemeContext`
- Supports light/dark modes
- Uses glassmorphism effects
- Matches existing card/badge styling

## Performance

- Memoized step rendering
- Optimized drag-and-drop with minimal re-renders
- Validation debounced during editing
- Lazy loading of code preview

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- Screen reader friendly

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires:
- HTML5 Drag and Drop API
- ES2020+ JavaScript features
