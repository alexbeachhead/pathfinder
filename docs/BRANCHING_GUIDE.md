# Test Suite Branching & Merge Workflow Guide

## Overview

The Test Suite Branching & Merge Workflow feature brings Git-like version control to your automated test suites. Teams can now fork test suites, experiment with changes, and merge them back with built-in conflict resolution.

## Key Concepts

### Branches
- **Default Branch (main)**: Automatically created for each test suite
- **Feature Branches**: Created for experimentation, new test scenarios, or parallel development
- **Branch Hierarchy**: Branches can be created from other branches, maintaining parent-child relationships

### Snapshots
- Capture the complete state of a test suite at a specific point in time
- Include test code, configuration, and metadata
- Automatically created on branch creation and merge operations

### Diffs
- Track changes between branches
- Support both code and configuration differences
- Line-by-line comparison for code changes
- JSON-based comparison for configuration changes

### Merge Requests
- Formal process for merging changes from one branch to another
- Automatic conflict detection
- Multiple conflict resolution strategies
- Complete audit trail

## Database Schema

### Tables

#### `test_suite_branches`
Stores branch metadata and relationships.

```sql
CREATE TABLE test_suite_branches (
    id UUID PRIMARY KEY,
    suite_id UUID REFERENCES test_suites(id),
    branch_name VARCHAR(255) NOT NULL,
    parent_branch_id UUID REFERENCES test_suite_branches(id),
    is_default BOOLEAN DEFAULT false,
    description TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(suite_id, branch_name)
);
```

#### `branch_snapshots`
Captures complete state of test suite at specific points.

```sql
CREATE TABLE branch_snapshots (
    id UUID PRIMARY KEY,
    branch_id UUID REFERENCES test_suite_branches(id),
    test_code_id UUID REFERENCES test_code(id),
    suite_config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `branch_diffs`
Tracks changes between branches.

```sql
CREATE TABLE branch_diffs (
    id UUID PRIMARY KEY,
    source_branch_id UUID REFERENCES test_suite_branches(id),
    target_branch_id UUID REFERENCES test_suite_branches(id),
    diff_type VARCHAR(50) NOT NULL, -- 'code', 'config', 'steps'
    changes JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### `merge_requests`
Manages merge operations with conflict tracking.

```sql
CREATE TABLE merge_requests (
    id UUID PRIMARY KEY,
    suite_id UUID REFERENCES test_suites(id),
    source_branch_id UUID REFERENCES test_suite_branches(id),
    target_branch_id UUID REFERENCES test_suite_branches(id),
    status VARCHAR(50) DEFAULT 'open', -- open, merged, closed, conflict
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by VARCHAR(255),
    merged_by VARCHAR(255),
    conflicts JSONB,
    resolution JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    merged_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `merge_history`
Audit trail of merge operations.

```sql
CREATE TABLE merge_history (
    id UUID PRIMARY KEY,
    merge_request_id UUID REFERENCES merge_requests(id),
    action VARCHAR(50) NOT NULL, -- 'created', 'resolved_conflict', 'merged', 'closed'
    actor VARCHAR(255),
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Usage Guide

### 1. Creating a Branch

**In the Designer:**
When saving a test suite, a default "main" branch is automatically created.

**In the Dashboard (Branch Management Panel):**
1. Select a test suite
2. Click the branch picker dropdown
3. Click "Create new branch"
4. Enter branch name
5. Click "Create"

**Programmatically:**
```typescript
import { createBranch } from '@/lib/supabase/branches';

const branchId = await createBranch({
  suite_id: 'test-suite-uuid',
  branch_name: 'feature/new-scenarios',
  parent_branch_id: 'parent-branch-uuid', // optional
  description: 'Adding mobile-specific test scenarios',
  created_by: 'user@example.com',
});
```

### 2. Comparing Branches

**In the Dashboard:**
1. Navigate to Branch Management Panel
2. Select test suite
3. Select current branch
4. Click "Show Branch Comparison"
5. Choose a branch to compare with
6. Click "Compare Branches"

The diff viewer will display:
- **Additions** (green): New lines added
- **Deletions** (red): Lines removed
- **Modifications** (yellow): Changed lines

**Programmatically:**
```typescript
import { calculateDiff } from '@/lib/supabase/branches';

const diffs = await calculateDiff(sourceBranchId, targetBranchId);
// Returns array of BranchDiff objects with detailed changes
```

### 3. Creating a Merge Request

**In the Dashboard:**
1. Navigate to Branch Management Panel
2. Select test suite and current branch
3. Click "Show Merge Requests"
4. Click "New Merge Request"
5. Select target branch
6. Click "Create Request"

**Programmatically:**
```typescript
import { createMergeRequest } from '@/lib/supabase/branches';

const requestId = await createMergeRequest({
  suite_id: 'test-suite-uuid',
  source_branch_id: 'feature-branch-uuid',
  target_branch_id: 'main-branch-uuid',
  title: 'Merge feature/new-scenarios into main',
  description: 'Added 5 new mobile test scenarios',
  created_by: 'user@example.com',
});
```

### 4. Resolving Conflicts

If conflicts are detected, the merge request status will be set to `conflict`.

**In the UI:**
1. Click "Resolve Conflicts" on the merge request
2. For each conflict, choose a resolution strategy:
   - **Keep Source**: Accept changes from the source branch
   - **Keep Target**: Keep the target branch version
   - **Keep Both**: Include both versions
   - **Custom**: Write your own resolution
3. Click "Resolve & Continue"

**Programmatically:**
```typescript
import { resolveConflicts } from '@/lib/supabase/branches';

const resolutions = [
  {
    conflictIndex: 0,
    resolution: 'accept_source',
  },
  {
    conflictIndex: 1,
    resolution: 'custom',
    customValue: 'my custom code here',
  },
];

await resolveConflicts(mergeRequestId, resolutions, 'user@example.com');
```

### 5. Executing a Merge

Once conflicts are resolved (or if there were none), execute the merge:

**In the UI:**
1. Click "Merge" button on the merge request
2. Confirm the action

**Programmatically:**
```typescript
import { executeMerge } from '@/lib/supabase/branches';

await executeMerge(mergeRequestId, 'user@example.com');
```

## UI Components

### BranchPicker
Dropdown component for selecting and creating branches.

```tsx
import { BranchPicker } from '@/app/features/designer/components/BranchPicker';

<BranchPicker
  suiteId="test-suite-uuid"
  selectedBranchId={currentBranch}
  onBranchChange={(branchId) => setCurrentBranch(branchId)}
/>
```

### DiffViewer
Visual representation of changes between branches.

```tsx
import { DiffViewer } from '@/app/features/designer/components/DiffViewer';

<DiffViewer diffs={branchDiffs} />
```

### MergeConflictResolver
Interactive conflict resolution interface.

```tsx
import { MergeConflictResolver } from '@/app/features/designer/components/MergeConflictResolver';

<MergeConflictResolver
  conflicts={mergeRequest.conflicts}
  sourceBranchName="feature"
  targetBranchName="main"
  onResolve={(resolutions) => handleResolve(resolutions)}
  onCancel={() => setShowResolver(false)}
/>
```

### MergeRequestManager
Complete merge request workflow management.

```tsx
import { MergeRequestManager } from '@/app/features/designer/components/MergeRequestManager';

<MergeRequestManager
  suiteId="test-suite-uuid"
  currentBranchId={currentBranch}
/>
```

### BranchManagementPanel
Full dashboard integration.

```tsx
import { BranchManagementPanel } from '@/app/features/dashboard/components/BranchManagementPanel';

<BranchManagementPanel />
```

## API Reference

### Core Functions

#### `createBranch(data)`
Creates a new branch and initial snapshot.

**Parameters:**
- `suite_id`: UUID of the test suite
- `branch_name`: Name of the new branch
- `parent_branch_id`: (optional) Parent branch UUID
- `description`: (optional) Branch description
- `created_by`: (optional) User identifier

**Returns:** Branch UUID

---

#### `getBranches(suiteId)`
Retrieves all branches for a test suite.

**Parameters:**
- `suiteId`: UUID of the test suite

**Returns:** Array of TestSuiteBranch objects

---

#### `getBranchWithDetails(branchId)`
Gets branch with snapshot and test code details.

**Parameters:**
- `branchId`: UUID of the branch

**Returns:** BranchWithDetails object

---

#### `calculateDiff(sourceBranchId, targetBranchId)`
Calculates differences between two branches.

**Parameters:**
- `sourceBranchId`: UUID of source branch
- `targetBranchId`: UUID of target branch

**Returns:** Array of BranchDiff objects

---

#### `createMergeRequest(data)`
Creates a merge request with automatic conflict detection.

**Parameters:**
- `suite_id`: UUID of the test suite
- `source_branch_id`: UUID of source branch
- `target_branch_id`: UUID of target branch
- `title`: Merge request title
- `description`: (optional) Detailed description
- `created_by`: (optional) User identifier

**Returns:** Merge request UUID

---

#### `resolveConflicts(requestId, resolutions, actor)`
Resolves conflicts in a merge request.

**Parameters:**
- `requestId`: UUID of merge request
- `resolutions`: Array of ConflictResolution objects
- `actor`: (optional) User identifier

**Returns:** void

---

#### `executeMerge(requestId, merged_by)`
Executes the merge operation.

**Parameters:**
- `requestId`: UUID of merge request
- `merged_by`: (optional) User identifier

**Returns:** void

## CI/CD Integration

### Referencing Specific Branches

In your CI/CD pipeline, you can reference specific branches:

```yaml
# GitHub Actions example
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Run tests from feature branch
        env:
          BRANCH_ID: ${{ secrets.TEST_BRANCH_ID }}
        run: npm run test:branch -- --branch-id=$BRANCH_ID
```

### Branch-Based Test Execution

```typescript
// scripts/run-branch-tests.ts
import { getBranchWithDetails } from '@/lib/supabase/branches';

const branchId = process.env.BRANCH_ID;
const branch = await getBranchWithDetails(branchId);

if (branch?.testCode) {
  // Execute tests from this specific branch
  await runPlaywrightTests(branch.testCode.code);
}
```

## Best Practices

### 1. Branch Naming
- Use descriptive names: `feature/mobile-tests`, `fix/login-assertion`
- Follow team conventions: `<type>/<description>`
- Keep names concise but meaningful

### 2. Merge Strategy
- Merge frequently to avoid large conflicts
- Test changes in feature branches before merging
- Use merge requests for code review and discussion

### 3. Conflict Resolution
- Understand both versions before resolving
- Test the merged code after resolution
- Document complex resolution decisions

### 4. Branch Cleanup
- Delete merged feature branches
- Keep main branch stable and deployable
- Archive old branches instead of deleting if needed for history

### 5. Snapshot Management
- Snapshots are created automatically
- Use snapshots for rollback if needed
- Monitor snapshot storage usage

## Troubleshooting

### Conflict Detection Issues
If conflicts aren't detected properly:
1. Ensure both branches have snapshots
2. Check that test code versions are different
3. Verify branch parent relationships

### Merge Failures
If a merge fails:
1. Check for unresolved conflicts
2. Verify branch permissions
3. Ensure target branch exists
4. Check database constraints

### Performance Issues
If operations are slow:
1. Check database indexes (created in schema)
2. Limit number of active branches
3. Archive old merge requests
4. Clean up old snapshots

## Future Enhancements

Potential future improvements:
- Visual merge conflict editor with syntax highlighting
- Branch comparison with side-by-side code view
- Automated merge for trivial changes
- Branch protection rules
- Pull request templates
- Branch analytics and insights
- Rebase support
- Cherry-pick functionality

## Support

For questions or issues:
1. Check this guide first
2. Review the implementation code in `src/lib/supabase/branches.ts`
3. Examine UI components in `src/app/features/designer/components/`
4. Check database schema in `supabase/schema-branches.sql`
