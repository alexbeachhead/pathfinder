# Branching Quick Start Guide

## Setup (One-Time)

1. **Run Database Migration**
   ```bash
   # In Supabase SQL Editor, run:
   supabase/schema-branches.sql
   ```

2. **Verify Tables Created**
   - test_suite_branches
   - branch_snapshots
   - branch_diffs
   - merge_requests
   - merge_history

## Basic Usage

### Create a Branch
```typescript
import { createBranch } from '@/lib/supabase/branches';

const branchId = await createBranch({
  suite_id: 'your-suite-id',
  branch_name: 'feature/new-tests',
  description: 'Adding mobile test scenarios'
});
```

### List Branches
```typescript
import { getBranches } from '@/lib/supabase/branches';

const branches = await getBranches('your-suite-id');
```

### Compare Branches
```typescript
import { calculateDiff } from '@/lib/supabase/branches';

const diffs = await calculateDiff(sourceBranchId, targetBranchId);
```

### Create Merge Request
```typescript
import { createMergeRequest } from '@/lib/supabase/branches';

const requestId = await createMergeRequest({
  suite_id: 'your-suite-id',
  source_branch_id: 'feature-branch-id',
  target_branch_id: 'main-branch-id',
  title: 'Merge new mobile tests'
});
```

### Resolve Conflicts
```typescript
import { resolveConflicts } from '@/lib/supabase/branches';

await resolveConflicts(requestId, [
  { conflictIndex: 0, resolution: 'accept_source' },
  { conflictIndex: 1, resolution: 'custom', customValue: 'merged code' }
]);
```

### Execute Merge
```typescript
import { executeMerge } from '@/lib/supabase/branches';

await executeMerge(requestId);
```

## UI Components

### Branch Picker
```tsx
import { BranchPicker } from '@/app/features/designer/components/BranchPicker';

<BranchPicker
  suiteId={suiteId}
  selectedBranchId={currentBranch}
  onBranchChange={setBranch}
/>
```

### Diff Viewer
```tsx
import { DiffViewer } from '@/app/features/designer/components/DiffViewer';

<DiffViewer diffs={branchDiffs} />
```

### Merge Request Manager
```tsx
import { MergeRequestManager } from '@/app/features/designer/components/MergeRequestManager';

<MergeRequestManager
  suiteId={suiteId}
  currentBranchId={currentBranch}
/>
```

## Common Workflows

### Creating a Feature Branch
1. Navigate to Designer or Dashboard
2. Select test suite
3. Click branch picker
4. Click "Create new branch"
5. Name it: `feature/description`
6. Make your changes
7. Save (creates snapshot)

### Merging Changes
1. Open Branch Management Panel
2. Select source branch
3. Click "Show Merge Requests"
4. Click "New Merge Request"
5. Select target branch
6. Resolve any conflicts
7. Click "Merge"

### Comparing Branches
1. Open Branch Management Panel
2. Select first branch
3. Click "Show Branch Comparison"
4. Select second branch
5. Click "Compare Branches"
6. Review differences

## Conflict Resolution Strategies

| Strategy | Description | When to Use |
|----------|-------------|-------------|
| **Accept Source** | Use changes from source branch | Source has correct version |
| **Accept Target** | Keep target branch version | Target should remain unchanged |
| **Accept Both** | Include both versions | Both changes are valid |
| **Custom** | Write your own resolution | Need manual merge |

## Best Practices

✅ **Do:**
- Use descriptive branch names
- Merge frequently to avoid large conflicts
- Test changes before merging
- Delete merged branches
- Document complex resolutions

❌ **Don't:**
- Create branches without description
- Keep long-lived feature branches
- Merge without reviewing diffs
- Force merge with unresolved conflicts
- Delete unmerged branches with changes

## Keyboard Shortcuts (Future)

Coming soon:
- `Ctrl+B`: Toggle branch picker
- `Ctrl+M`: Create merge request
- `Ctrl+D`: Show diff
- `Esc`: Close dropdowns

## Troubleshooting

### Branch Not Found
```typescript
const branch = await getBranch(branchId);
if (!branch) {
  // Branch doesn't exist or was deleted
}
```

### Merge Conflicts
```typescript
const request = await getMergeRequest(requestId);
if (request.status === 'conflict') {
  // Resolve conflicts before merging
  await resolveConflicts(requestId, resolutions);
}
```

### Permission Denied
Check Supabase RLS policies are enabled:
```sql
SELECT * FROM test_suite_branches WHERE id = 'branch-id';
```

## Reference

- **Full Guide**: [BRANCHING_GUIDE.md](./BRANCHING_GUIDE.md)
- **Implementation Details**: [BRANCHING_IMPLEMENTATION_SUMMARY.md](./BRANCHING_IMPLEMENTATION_SUMMARY.md)
- **Database Schema**: [supabase/schema-branches.sql](./supabase/schema-branches.sql)
- **API Functions**: [src/lib/supabase/branches.ts](./src/lib/supabase/branches.ts)
