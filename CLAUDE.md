# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pathfinder** is an intelligent automated testing platform powered by AI, Playwright, and Next.js. It enables visual test design, AI-driven test generation, multi-viewport test execution, and comprehensive reporting with visual regression detection.

## Commands

### Development
```bash
npm run dev         # Start development server with Turbopack
npm run dev:clean   # Clear lock files and start dev server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

### Database Setup
1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Set up storage buckets per `SUPABASE_SETUP.md`

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anonymous key
GEMINI_API_KEY                 # Google Gemini API key (server-side only)
```

## Architecture Overview

### Technology Stack
- **Next.js 16** with App Router (Turbopack enabled)
- **React 19** with TypeScript 5 (strict mode)
- **Zustand** for state management (replaced Context API)
- **Supabase** for database, storage, and real-time subscriptions
- **Playwright 1.56** for browser automation
- **Gemini AI** for test generation and analysis
- **Tailwind CSS 4** with custom design system
- **Framer Motion** for animations

### Client-Side SPA Navigation

This app uses a **unique SPA-style navigation** within Next.js:
- Single route at `/` (no `/dashboard`, `/designer`, etc.)
- `src/app/page.tsx` acts as a router, conditionally rendering feature components
- Navigation state managed via **Zustand** (`useNavigation` hook in `lib/stores/appStore.ts`)
- Pages: `dashboard`, `designer`, `runner`, `reports`

```typescript
// Navigation pattern
const { currentPage, navigateTo } = useNavigation();
navigateTo('designer'); // Changes page without URL change
```

### State Management with Zustand

**Important:** The codebase migrated from React Context to **Zustand** for state management:

```typescript
// lib/stores/appStore.ts - Combined store
import { useTheme, useNavigation } from '@/lib/stores/appStore';

// Theme management
const { currentTheme, themeId, setTheme } = useTheme();

// Navigation
const { currentPage, reportId, navigateTo, setReportId } = useNavigation();
```

**Migration Notes:**
- `ThemeContext` → `useTheme()` hook from appStore
- `NavigationContext` → `useNavigation()` hook from appStore
- All imports should use `@/lib/stores/appStore`, not contexts

### Theme System

**3 Available Themes:**
1. **Cyber Blueprint** (default) - Cyan/blue technical aesthetic
2. **Crimson Dark** - Dark red minimalist
3. **Golden Slate** - Slate gray with gold accents

**Implementation:**
- Theme definitions in `src/lib/theme.ts`
- State managed via Zustand `useTheme()` hook
- CSS variables in `globals.css` (e.g., `--theme-primary`, `--theme-surface`)
- `data-theme` attribute on root element
- LocalStorage persistence

**Styling Pattern:**
```typescript
// Use inline styles with theme values (NOT Tailwind variants)
style={{
  color: currentTheme.colors.text.primary,
  backgroundColor: currentTheme.colors.surface
}}
```

**Health Glow Feature:**
- Dashboard displays ambient glow based on test pass-rate
- Green (≥90%), Yellow (70-89%), Red (<70%)
- Implemented via CSS variables and animations
- See `IMPLEMENTATION_SUMMARY.md` for details

### Component Organization

```
src/
├── app/
│   ├── features/              # Feature-based page components
│   │   ├── dashboard/        # Main dashboard view
│   │   ├── designer/         # Test designer workflow (4 steps)
│   │   ├── runner/           # Test execution interface
│   │   └── reports/          # Test reports & history
│   ├── api/                  # Next.js API routes
│   │   ├── playwright/execute # Execute test suites
│   │   ├── screenshots/capture # Capture screenshots
│   │   ├── gemini/           # AI analysis endpoints
│   │   └── diff/             # Visual regression APIs
│   └── page.tsx              # SPA router (renders feature components)
│
├── components/
│   ├── ui/                   # Reusable themed components
│   ├── layout/               # Header, Sidebar, MainLayout
│   ├── logo/                 # LogoTitle component
│   └── decorative/           # ThemeBackground
│
├── lib/
│   ├── stores/
│   │   └── appStore.ts       # Zustand state management (theme + navigation)
│   ├── theme.ts              # Theme definitions
│   ├── types.ts              # TypeScript interfaces
│   ├── supabase.ts           # Supabase client & operations
│   ├── gemini.ts             # Gemini AI client
│   ├── playwright/           # Playwright execution utilities
│   ├── diff/                 # Screenshot comparison (pixelmatch)
│   └── storage/              # Supabase storage helpers
│
└── hooks/
    ├── useSupabase.ts        # Supabase data operations
    └── useTestRuns.ts        # Real-time test run subscriptions
```

### Database Schema (Supabase)

**Key Tables:**
- `test_suites` - Test suite configurations (name, URL, description)
- `test_runs` - Test execution records (status, config, timestamps)
- `test_results` - Individual viewport results (screenshots, errors, logs)
- `ai_analyses` - AI-generated findings (severity, suggestions, confidence)
- `test_code` - Versioned test code (Playwright code, language)

**Relations:**
- `test_runs.suite_id` → `test_suites.id`
- `test_results.run_id` → `test_runs.id`
- `ai_analyses.result_id` → `test_results.id`
- `test_code.suite_id` → `test_suites.id`

**Real-time Subscriptions:**
```typescript
// Subscribe to test runs
subscribeToTestRuns(suiteId, callback);

// Subscribe to test results
subscribeToTestResults(runId, callback);
```

### API Routes

**RESTful Next.js API Routes** in `src/app/api/`:

```
POST /api/playwright/execute     # Execute test suite
POST /api/screenshots/capture    # Capture screenshots
POST /api/gemini/analyze-intent  # Analyze NL test intent
POST /api/gemini/nl-to-playwright # Generate Playwright from NL
POST /api/diff/compare           # Compare two screenshots
POST /api/diff/batch-compare     # Batch screenshot comparison
GET  /api/diff/baselines         # Fetch baselines
POST /api/analyze/complexity     # Analyze site complexity
```

**Important:** Most endpoints use `maxDuration = 60-300s` for serverless compatibility with long-running operations (Playwright tests, AI analysis).

## Key Features

### Visual Test Designer (Module 1)
**4-Step Workflow:**
1. **Setup** - Name, URL, description
2. **Analyzing** - Screenshot capture + Gemini analysis (with progress)
3. **Review** - Edit scenarios, view generated Playwright code
4. **Complete** - Save to Supabase, ready to run

**Location:** `src/app/features/designer/`

### Test Runner (Module 2)
- Select test suite + viewports (desktop, tablet, mobile)
- Real-time execution monitoring with live logs
- Screenshot capture at key steps
- Parallel execution support

**Location:** `src/app/features/runner/`

### Reports & Dashboard (Module 4)
- Test run history & metrics
- Pass/fail statistics with charts
- Screenshot galleries
- AI-detected issues
- **Health Glow** visual feedback

**Location:** `src/app/features/dashboard/` and `src/app/features/reports/`

### Visual Regression Detection (Module 5)
- Pixelmatch-based image diffing
- Baseline management
- Ignore regions configuration
- Configurable thresholds
- Batch comparison API

**Location:** `src/lib/diff/` and `src/app/api/diff/`

### Natural Language Test Input (Module 6)
- Gemini intent analysis
- Convert NL descriptions to Playwright code
- Example prompts & templates

**Location:** `src/lib/nl-test/` and `src/app/api/gemini/`

## Development Patterns

### Themed Components
```typescript
// Always use useTheme from Zustand store
import { useTheme } from '@/lib/stores/appStore';

const { currentTheme } = useTheme();

// Use inline styles for theme-dependent colors
<div style={{
  backgroundColor: currentTheme.colors.surface,
  color: currentTheme.colors.text.primary
}}>
```

### Navigation
```typescript
// Use Zustand navigation hook
import { useNavigation } from '@/lib/stores/appStore';

const { currentPage, navigateTo, reportId, setReportId } = useNavigation();

// Navigate to a page
navigateTo('designer');

// Navigate to reports with specific run ID
navigateTo('reports');
setReportId(runId);
```

### API Route Pattern
```typescript
// route.ts
export const maxDuration = 60; // For long-running operations

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Handle request
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Supabase Operations
```typescript
import { supabase } from '@/lib/supabase';

// Fetch data
const { data, error } = await supabase
  .from('test_suites')
  .select('*')
  .order('created_at', { ascending: false });

// Insert data
const { data, error } = await supabase
  .from('test_suites')
  .insert({ name, target_url, description })
  .select()
  .single();

// Real-time subscription
const subscription = supabase
  .channel('test-runs')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'test_runs' },
    (payload) => callback(payload)
  )
  .subscribe();
```

### Performance Optimizations
- **Lazy Loading:** Sidebar uses dynamic import with Suspense
- **Code Splitting:** Feature components loaded on-demand
- **Skeleton States:** Loading states for better UX
- **Turbopack:** Enabled for faster development builds

## Important Notes

### No Unit Testing
- No Jest, Vitest, or React Testing Library configured
- This app **creates** and **runs** Playwright tests; it's not self-tested
- Playwright is for browser automation, not testing this codebase

### TypeScript Strict Mode
- All types must be properly defined
- No `any` types (use `unknown` with type guards)
- Comprehensive interfaces in `src/lib/types.ts`

### CSS Architecture
- **CSS Variables** for theming (NOT Tailwind color variants)
- Tailwind for layout/spacing utilities
- Framer Motion for animations
- Global styles in `src/app/globals.css`

### Server vs Client Components
- API routes are server-side
- Feature components are client components (`'use client'`)
- Layout components use Suspense for lazy loading

## Reference Documentation

- `THEME_SYSTEM.md` - Comprehensive theme system guide
- `SUPABASE_SETUP.md` - Storage bucket setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Health glow feature details
- `.claude/module-*.md` - Feature module specifications
- `supabase/schema.sql` - Database schema
