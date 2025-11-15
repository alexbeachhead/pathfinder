const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'goals.db');
const db = new Database(dbPath);

const id = randomUUID();
const projectId = '108b16e3-019b-469c-a329-47138d60a21f';
const requirementName = 'auto-generate-ci-pipeline-templates';
const title = 'Auto-Generate CI/CD Pipelines';

const overview = `Implemented complete auto-generation of CI/CD pipeline templates for Playwright tests. After publishing a test suite in the Designer, users can now click a one-click button to generate ready-to-use GitHub Actions workflows or GitLab CI pipelines.

**Key Features Implemented:**

1. **Template Generators**: Created comprehensive template generators for both GitHub Actions and GitLab CI/CD, producing production-ready YAML configurations with customizable settings (src/lib/ci/githubActionsTemplate.ts, src/lib/ci/gitlabCITemplate.ts).

2. **Interactive Wizard UI**: Built a three-step wizard (CIPipelineWizard.tsx) that guides users through:
   - Selecting CI provider (GitHub Actions or GitLab CI)
   - Configuring pipeline settings (Node.js version, browsers, workers, retries, triggers)
   - Deploying via GitHub API or downloading as ZIP

3. **GitHub API Integration**: Implemented full GitHub API integration (src/app/api/ci/deploy-github/route.ts) that can automatically commit workflow files to repositories using personal access tokens.

4. **ZIP Download**: Integrated jszip library to package all CI/CD files (workflow YAML, playwright.config, test files, README) for manual import.

5. **Database Schema**: Created comprehensive schema for tracking CI configurations and deployment history (supabase/schema-ci-configs.sql) with tables for ci_configurations and ci_deployment_logs.

6. **Supabase Integration**: Built complete CRUD operations for CI configurations (src/lib/supabase/ciConfigs.ts) with functions for creating, retrieving, updating, and tracking deployment statistics.

7. **Designer Integration**: Enhanced StepComplete component to display prominent CI/CD callout with "Generate CI/CD Pipeline" button, seamlessly integrated into the test creation workflow.

**Generated Files Include:**
- GitHub Actions workflow YAML (.github/workflows/*.yml)
- GitLab CI pipeline YAML (.gitlab-ci.yml)
- Playwright configuration (playwright.config.ts/js)
- Test files (tests/test.spec.ts/js)
- Comprehensive README with setup instructions
- GitLab-specific documentation (variables, Pages configuration)

**Technical Implementation:**
- Follows existing theme system with inline styles using currentTheme
- Includes comprehensive data-testid attributes for all interactive elements
- Supports both TypeScript and JavaScript code generation
- Configurable browser matrix (Chromium, Firefox, WebKit)
- Customizable trigger events, branches, and scheduling
- Full error handling and user feedback

This feature significantly reduces friction in deploying tests to CI/CD pipelines, making it easy for teams to integrate Playwright tests into their continuous delivery workflows.`;

const stmt = db.prepare(`
  INSERT INTO implementation_log (
    id,
    project_id,
    requirement_name,
    title,
    overview,
    tested,
    created_at
  ) VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
`);

try {
  stmt.run(id, projectId, requirementName, title, overview);
  console.log('✓ Implementation log entry created successfully');
  console.log(`  ID: ${id}`);
  console.log(`  Title: ${title}`);
  console.log(`  Requirement: ${requirementName}`);
} catch (error) {
  console.error('✗ Error creating implementation log entry:', error);
  process.exit(1);
} finally {
  db.close();
}
