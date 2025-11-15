# CI/CD Pipeline Generation - Quick Start Guide

## Overview

Pathfinder can automatically generate production-ready CI/CD pipeline configurations for your Playwright tests. This guide will help you get started in minutes.

## Step 1: Create Your Test Suite

1. Navigate to the **Designer** page
2. Fill in test suite details (name, URL, description)
3. Complete the analysis and review steps
4. Click **"Save Tests"** to publish your test suite

## Step 2: Generate CI/CD Pipeline

On the completion screen, you'll see a prominent CI/CD callout:

```
┌─────────────────────────────────────────┐
│         Ready for CI/CD?                │
│  Generate a ready-to-use GitHub Actions │
│  or GitLab CI pipeline for your test    │
│              suite                       │
│                                          │
│  [Generate CI/CD Pipeline]               │
└─────────────────────────────────────────┘
```

Click **"Generate CI/CD Pipeline"** to launch the wizard.

## Step 3: Choose Your CI Provider

Select your preferred CI/CD platform:

### GitHub Actions
- Best for GitHub-hosted repositories
- Seamless integration with GitHub
- Free for public repositories
- GitHub Actions minutes for private repos

### GitLab CI/CD
- Best for GitLab-hosted repositories
- Built-in GitLab Pages for reports
- Free CI/CD minutes included
- Self-hosted runners available

## Step 4: Configure Pipeline Settings

Customize your pipeline:

| Setting | Options | Recommendation |
|---------|---------|----------------|
| **Node.js Version** | 18, 20, 22 | Use 20 (LTS) |
| **Browsers** | Chromium, Firefox, WebKit | Start with Chromium only |
| **Workers** | 1-10 | Use 1 for simple tests |
| **Retries** | 0-5 | Use 2 for reliability |
| **Triggers** (GitHub) | Push, Pull Request | Enable both |

**Pro Tip**: Start with minimal configuration and expand later.

## Step 5: Deploy Your Pipeline

Choose your deployment method:

### Option A: Deploy via GitHub API (Recommended for GitHub)

1. **Create a Personal Access Token**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` and `workflow`
   - Copy the token (starts with `ghp_`)

2. **Enter Repository Details**:
   - Token: Paste your GitHub token
   - Repository: Enter in format `owner/repo` (e.g., `username/my-project`)

3. **Click "Deploy to GitHub"**:
   - Files are committed directly to your repository
   - Success message shows commit URL
   - Workflow is ready to run immediately

### Option B: Download as ZIP (Manual Import)

1. **Click "Download ZIP"**
2. **Extract the downloaded file**
3. **Copy files to your repository**:
   ```bash
   # Extract ZIP
   unzip test-suite-ci-pipeline.zip -d ci-files

   # Copy to your repository
   cp -r ci-files/.github .
   cp ci-files/playwright.config.* .
   cp -r ci-files/tests .

   # Commit and push
   git add .github/ playwright.config.* tests/
   git commit -m "Add Playwright CI pipeline"
   git push
   ```

## Step 6: Run Your Pipeline

### GitHub Actions
1. Go to your repository on GitHub
2. Click the **"Actions"** tab
3. You should see your workflow listed
4. Push a commit or create a PR to trigger the workflow
5. Monitor test execution in the Actions tab

### GitLab CI
1. Go to your repository on GitLab
2. Navigate to **CI/CD → Pipelines**
3. Push a commit to trigger the pipeline
4. Monitor execution in the Pipelines view
5. View reports on GitLab Pages (if configured)

## What Gets Generated?

### GitHub Actions Package
```
.github/
  workflows/
    {suite-name}.yml          # Workflow configuration
playwright.config.ts          # Playwright config
tests/
  test.spec.ts                # Your test code
CI_PIPELINE_README.md         # Setup instructions
package.json.scripts          # NPM scripts to add
```

### GitLab CI Package
```
.gitlab-ci.yml                # Pipeline configuration
playwright.config.ts          # Playwright config
tests/
  test.spec.ts                # Your test code
README.md                     # Setup instructions
GITLAB_CI_VARIABLES.md        # Variables guide
GITLAB_PAGES.md               # Pages setup
package.json.scripts          # NPM scripts to add
```

## Troubleshooting

### GitHub API Deployment Fails

**Error**: "Failed to fetch repository info"
- **Solution**: Verify token has `repo` scope and repository name is correct

**Error**: "Failed to create commit"
- **Solution**: Ensure you have write access to the repository

**Error**: "Failed to update reference"
- **Solution**: Check if the branch is protected; may need to disable protections temporarily

### Tests Fail in CI

**Issue**: Tests pass locally but fail in CI
- Check Node.js version matches local environment
- Verify Playwright version is correct
- Review CI logs for specific errors
- Ensure environment variables are set

**Issue**: Browser launch fails
- Verify browser is included in installation step
- Check `--with-deps` flag is present in workflow

## Next Steps

After successful deployment:

1. **Monitor First Run**: Watch the pipeline execute to ensure everything works
2. **Review Artifacts**: Check uploaded test results and screenshots
3. **Configure Secrets**: Add any required environment variables
4. **Customize Pipeline**: Adjust triggers, schedules, or browsers as needed
5. **Set Up Notifications**: Configure alerts for failed tests
6. **Enable Pages** (GitLab): Publish HTML reports to GitLab Pages

## Best Practices

### Security
- ✅ Use GitHub Secrets for sensitive data (API keys, passwords)
- ✅ Never commit tokens or credentials to repository
- ✅ Rotate access tokens regularly
- ✅ Use minimum required token scopes

### Performance
- ✅ Run critical tests first (fail fast)
- ✅ Use browser matrix only when necessary
- ✅ Cache dependencies for faster runs
- ✅ Run tests in parallel with workers

### Reliability
- ✅ Enable retries for flaky tests
- ✅ Upload artifacts for debugging
- ✅ Use stable selectors in tests
- ✅ Add appropriate timeouts

### Maintenance
- ✅ Keep Playwright version up to date
- ✅ Review and update tests regularly
- ✅ Monitor test execution times
- ✅ Remove obsolete tests

## Advanced Configuration

### Custom Schedules (GitHub Actions)

Edit your workflow to add scheduled runs:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Run daily at 2 AM UTC
```

### Multiple Environments

Add environment-specific configuration:

```yaml
env:
  STAGING_URL: ${{ secrets.STAGING_URL }}
  PRODUCTION_URL: ${{ secrets.PRODUCTION_URL }}
```

### Custom Reporters

Modify `playwright.config.ts` to add custom reporters:

```typescript
reporter: [
  ['html'],
  ['junit', { outputFile: 'results.xml' }],
  ['github'],  // GitHub-specific annotations
],
```

## Getting Help

If you encounter issues:

1. Check the generated `README.md` in the ZIP file
2. Review Playwright documentation: https://playwright.dev/docs/ci
3. Check CI provider documentation:
   - GitHub Actions: https://docs.github.com/en/actions
   - GitLab CI: https://docs.gitlab.com/ee/ci/

## Summary

You've successfully generated and deployed a CI/CD pipeline for your Playwright tests! Your tests will now run automatically on every push, pull request, or schedule, helping you catch issues early and maintain code quality.

**Next**: Create more test suites and generate pipelines for each project!
