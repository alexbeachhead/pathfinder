# CI/CD Pipeline Auto-Generation Implementation

## Overview

This implementation adds comprehensive auto-generation of CI/CD pipeline templates for Playwright tests. After publishing a test suite in the Designer, users can generate ready-to-use GitHub Actions workflows or GitLab CI pipelines with a single click.

## Features Implemented

### 1. Template Generators

**GitHub Actions Template** (`src/lib/ci/githubActionsTemplate.ts`)
- Generates production-ready GitHub Actions workflow YAML
- Configurable Node.js version, browsers, workers, and retries
- Supports multiple trigger events (push, pull request, schedule)
- Automatic artifact uploads for test results, screenshots, and reports
- Generates Playwright configuration file
- Creates comprehensive README with setup instructions

**GitLab CI Template** (`src/lib/ci/gitlabCITemplate.ts`)
- Generates GitLab CI/CD pipeline YAML
- Multi-stage pipeline (install, test, report)
- Browser matrix support with parallel execution
- GitLab Pages integration for test reports
- Comprehensive documentation for CI variables
- Setup guide for GitLab-specific features

### 2. Interactive Wizard UI

**CIPipelineWizard Component** (`src/app/features/designer/components/CIPipelineWizard.tsx`)
- Three-step wizard interface:
  1. **Select Provider**: Choose GitHub Actions or GitLab CI
  2. **Configure**: Customize pipeline settings
  3. **Deploy**: Deploy via API or download as ZIP

**Configuration Options:**
- Node.js version (18, 20, 22)
- Browser matrix (Chromium, Firefox, WebKit)
- Trigger events (Push, Pull Request)
- Workers and retries
- GitHub token and repository (for API deployment)

**UI Features:**
- Themed components using existing design system
- Step indicator with progress tracking
- Comprehensive error handling and feedback
- Test IDs for all interactive elements

### 3. GitHub API Integration

**Deployment Service** (`src/app/api/ci/deploy-github/route.ts`)
- Automatically commits workflow files to GitHub repositories
- Uses GitHub API v3 (REST API)
- Creates blobs, trees, and commits programmatically
- Updates repository reference to include new commit
- Comprehensive error handling and validation

**Files Deployed:**
- `.github/workflows/{suite-name}.yml` - GitHub Actions workflow
- `playwright.config.ts/js` - Playwright configuration
- `tests/test.spec.ts/js` - Generated test code
- `CI_PIPELINE_README.md` - Setup instructions

### 4. ZIP Download Functionality

**Manual Import Option:**
- Uses jszip library to package all files
- Includes workflow/pipeline YAML
- Includes Playwright config and test files
- Includes comprehensive documentation
- Downloads as `{suite-name}-ci-pipeline.zip`

### 5. Database Schema

**Schema File** (`supabase/schema-ci-configs.sql`)

**Tables:**
- `ci_configurations`: Stores CI pipeline configurations
  - Provider (github/gitlab)
  - Configuration settings (browsers, workers, retries)
  - Deployment details (deployed status, commit SHA, repository URL)
  - Generated files metadata

- `ci_deployment_logs`: Tracks deployment history
  - Deployment status (pending, in_progress, success, failed)
  - GitHub/GitLab specific details
  - Error information
  - Performance metrics (deployment duration)

**Features:**
- Row-level security policies
- Automatic timestamp updates
- Helper functions for querying configurations
- Indexes for performance optimization

### 6. Supabase Integration

**Service Layer** (`src/lib/supabase/ciConfigs.ts`)

**Functions:**
- `createCIConfiguration()` - Create new configuration
- `getCIConfiguration()` - Get configuration by ID
- `getLatestCIConfig()` - Get latest config for a suite
- `getCIConfigurationsForSuite()` - Get all configs for a suite
- `updateCIConfiguration()` - Update configuration
- `markCIConfigurationDeployed()` - Mark as deployed
- `createDeploymentLog()` - Log deployment attempt
- `updateDeploymentLog()` - Update deployment status
- `getDeploymentLogs()` - Get deployment history
- `getCIDeploymentStats()` - Get aggregated statistics

### 7. Designer Integration

**StepComplete Enhancement** (`src/app/features/designer/components/StepComplete.tsx`)
- Added prominent CI/CD callout section
- "Generate CI/CD Pipeline" button with GitBranch icon
- Modal integration for CIPipelineWizard
- Passes test suite data to wizard

**Designer Updates** (`src/app/features/designer/Designer.tsx`)
- Passes required props to StepComplete (targetUrl, codeLanguage, generatedCode)
- Maintains existing workflow and state management

## Technical Details

### Dependencies Added
- `jszip` - ZIP file generation for manual import
- `@types/jszip` - TypeScript types for jszip

### File Structure
```
src/
├── lib/
│   ├── ci/
│   │   ├── githubActionsTemplate.ts    # GitHub Actions generators
│   │   └── gitlabCITemplate.ts         # GitLab CI generators
│   └── supabase/
│       └── ciConfigs.ts                # CI configuration CRUD
├── app/
│   ├── api/
│   │   └── ci/
│   │       └── deploy-github/
│   │           └── route.ts            # GitHub deployment API
│   └── features/
│       └── designer/
│           └── components/
│               ├── CIPipelineWizard.tsx     # Wizard UI
│               └── StepComplete.tsx         # Enhanced completion
supabase/
└── schema-ci-configs.sql               # Database schema
```

### Design Patterns

**Theme Consistency:**
- Uses `useTheme()` hook from appStore
- Inline styles with currentTheme colors
- Consistent with existing component styling

**State Management:**
- Local state in CIPipelineWizard component
- Zustand integration via Designer props
- No global state pollution

**Error Handling:**
- Try-catch blocks in all async operations
- User-friendly error messages
- Deployment logs for debugging

**Accessibility:**
- Comprehensive data-testid attributes
- Semantic HTML structure
- Keyboard navigation support

## Usage Flow

1. User completes test suite creation in Designer
2. StepComplete shows "Generate CI/CD Pipeline" button
3. User clicks button to open CIPipelineWizard
4. User selects provider (GitHub Actions or GitLab CI)
5. User configures pipeline settings
6. User chooses deployment method:
   - **GitHub API**: Provide token and repo, auto-deploy
   - **ZIP Download**: Download files for manual import
7. Success confirmation with next steps

## Generated Pipeline Features

### GitHub Actions
- Multi-browser matrix (optional)
- Artifact uploads (reports, screenshots)
- Automatic retries on failure
- Caching for faster runs
- Manual workflow trigger support
- Scheduled runs (cron)

### GitLab CI
- Multi-stage pipeline (install, test, report)
- Browser parallelization
- GitLab Pages for reports
- Artifact retention
- Cache optimization
- Environment variables guide

## Benefits

1. **Reduced Friction**: No manual YAML authoring required
2. **Best Practices**: Templates follow CI/CD best practices
3. **Time Savings**: Setup in minutes instead of hours
4. **Consistency**: Standardized pipeline configurations
5. **Documentation**: Auto-generated setup guides
6. **Flexibility**: Deploy via API or manual import
7. **Visibility**: Track configurations and deployments in database

## Future Enhancements

Potential improvements for future iterations:
- Support for additional CI providers (CircleCI, Azure Pipelines)
- Custom pipeline templates
- Environment variable management UI
- Secrets management integration
- Pipeline performance analytics
- Automated testing of generated pipelines
- Branch-specific pipeline generation

## Testing Considerations

All interactive components include `data-testid` attributes:
- `ci-pipeline-wizard` - Main wizard modal
- `close-wizard-btn` - Close button
- `select-github-btn` - GitHub provider selection
- `select-gitlab-btn` - GitLab provider selection
- `node-version-select` - Node version dropdown
- `browser-{chromium|firefox|webkit}-checkbox` - Browser selection
- `trigger-push-checkbox` - Push trigger toggle
- `trigger-pr-checkbox` - PR trigger toggle
- `workers-input` - Workers input
- `retries-input` - Retries input
- `github-token-input` - GitHub token input
- `github-repo-input` - Repository input
- `deploy-github-btn` - Deploy to GitHub button
- `download-zip-btn` - Download ZIP button
- `generate-ci-pipeline-btn` - Main trigger button in StepComplete

## Implementation Log

Implementation logged in database:
- **ID**: 053f8de0-77b8-4b9b-bbb8-d8eff16ad8a9
- **Title**: Auto-Generate CI/CD Pipelines
- **Requirement**: auto-generate-ci-pipeline-templates
- **Status**: Completed, not yet tested
