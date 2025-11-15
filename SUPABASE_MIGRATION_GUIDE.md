# Supabase Migration Guide - Suite Assets

This guide explains how to apply the database migration for storing screenshots and test scenarios.

## ⚠️ Important Configuration

Before starting, check your storage bucket name:
- **Default**: `test-screenshots` (plural)
- If your bucket uses a different name (e.g., `test-screenshot` singular), update `STORAGE_CONFIG.screenshotBucket` in `src/lib/config.ts`

## What This Migration Adds

This migration creates two new tables to store assets generated during test suite creation:

1. **`suite_screenshots`** - Stores metadata about screenshots captured during analysis
2. **`test_scenarios`** - Stores AI-generated test scenarios

## Migration Steps

### 1. Run the SQL Migration

Open the Supabase SQL Editor and run the contents of:
```
supabase/008_schema_suite_assets.sql
```

This will create:
- ✅ `suite_screenshots` table
- ✅ `test_scenarios` table
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Foreign key constraints

### 2. Verify Storage Bucket

Ensure the `test-screenshots` storage bucket exists:

1. Go to **Storage** in Supabase Dashboard
2. Check if `test-screenshots` bucket exists
3. If not, create it with:
   - Name: `test-screenshots`
   - Public: **Yes** (for public URL access)
   - File size limit: 50MB
   - Allowed MIME types: `image/png, image/jpeg`

### 3. Verify Bucket Configuration

The bucket should be configured as:
- **Region**: eu-west-1 (or your preferred region)
- **Public bucket**: Yes
- **Path**: `/test-screenshots`

## What Gets Stored

### Suite Screenshots

When a test suite is analyzed, screenshots are:
1. **Uploaded** to Supabase Storage (`test-screenshots` bucket)
2. **Metadata saved** in `suite_screenshots` table:
   - Suite ID reference
   - Viewport info (desktop/tablet/mobile)
   - Storage URL
   - Capture timestamp

### Test Scenarios

When AI generates test scenarios, they are saved in `test_scenarios` table:
- Title and description
- Test steps (JSON array)
- Priority level
- Category
- Expected outcomes
- AI confidence score

## Verification

After running the migration, verify with these queries:

```sql
-- Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_name IN ('suite_screenshots', 'test_scenarios');

-- Check if storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'test-screenshots';
```

## How It Works

### When Creating a Suite

1. User generates test suite in Designer
2. Screenshots are captured during analysis
3. AI generates test scenarios
4. When user clicks "Save Test Suite":
   - Suite metadata → `test_suites`
   - Test code → `test_code`
   - Screenshot files → Storage bucket
   - Screenshot metadata → `suite_screenshots`
   - Test scenarios → `test_scenarios`

### When Loading an Existing Suite

1. User selects existing suite from dropdown
2. System loads:
   - Suite metadata from `test_suites`
   - Test code from `test_code`
   - Screenshots from `suite_screenshots` (with URLs from storage)
   - Scenarios from `test_scenarios`
3. All 4 tabs are populated with data:
   - 📸 Screenshots tab
   - 📝 Test Scenarios tab
   - ▶️ Live Preview tab
   - 💻 Generated Code tab

## Troubleshooting

### Screenshots not appearing?

1. Check if storage bucket exists
2. Verify bucket is public
3. Check browser console for errors
4. Query: `SELECT * FROM suite_screenshots WHERE suite_id = 'your-suite-id'`

### Scenarios not loading?

1. Check if migration was run
2. Query: `SELECT * FROM test_scenarios WHERE suite_id = 'your-suite-id'`
3. Check browser console for errors

### Storage URL Issues?

The public URL format should be:
```
https://[PROJECT_REF].supabase.co/storage/v1/object/public/test-screenshots/[path]
```

If you see errors about S3, check your Supabase project region matches the storage configuration.

## Code Changes Summary

### New Files Created:
- ✅ `supabase/008_schema_suite_assets.sql` - Database schema
- ✅ `src/lib/supabase/suiteAssets.ts` - Helper functions
- ✅ `src/lib/storage/screenshots.ts` - Screenshot upload/download
- ✅ `src/lib/config.ts` - Added STORAGE_CONFIG

### Modified Files:
- ✅ `src/app/features/designer/components/StepReview.tsx` - Save screenshots & scenarios
- ✅ `src/app/features/designer/Designer.tsx` - Load screenshots & scenarios

### Functions Available:

```typescript
// Save assets
await saveSuiteScreenshots(suiteId, screenshots);
await saveTestScenarios(suiteId, scenarios);

// Retrieve assets
const screenshots = await getSuiteScreenshots(suiteId);
const scenarios = await getTestScenarios(suiteId);

// Delete assets
await deleteSuiteScreenshots(suiteId);
await deleteTestScenarios(suiteId);
```

## Next Steps

After applying this migration:

1. ✅ Run the SQL migration in Supabase
2. ✅ Verify storage bucket exists and is public
3. ✅ Test creating a new suite
4. ✅ Verify screenshots and scenarios are saved
5. ✅ Test loading an existing suite
6. ✅ Verify all 4 tabs show data

---

**Questions?** Check browser console logs for detailed error messages during save/load operations.
