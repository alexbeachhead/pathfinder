# Supabase Setup

## Database

1. In the [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **SQL Editor** and run the schema migrations in order:
   - `supabase/000_schema_initial.sql`
   - Then any other `supabase/*.sql` migrations as needed for your features.

## Storage buckets

Pathfinder stores screenshots and related assets in Supabase Storage. Create the required bucket:

### 1. Create the screenshot bucket

1. In the Supabase Dashboard, go to **Storage**.
2. Click **New bucket**.
3. Set **Name** to: `test-screenshots`
4. Optionally enable **Public bucket** if you want screenshot URLs to be publicly readable (e.g. for report links). Otherwise keep it private and use signed URLs in the app.
5. Click **Create bucket**.

### 2. Bucket policy (if using RLS)

If you use Row Level Security on Storage:

- For **public** buckets: add a policy that allows public read (e.g. `SELECT` for all).
- For **private** buckets: add policies that allow your app role (e.g. `anon` or `authenticated`) to `INSERT`, `SELECT`, and optionally `UPDATE`/`DELETE` as needed.

Example policy for anonymous upload/read (adjust to your auth model):

```sql
-- Allow insert and select for the test-screenshots bucket (anon key)
CREATE POLICY "Allow anon upload and read"
ON storage.objects FOR ALL
USING (bucket_id = 'test-screenshots')
WITH CHECK (bucket_id = 'test-screenshots');
```

### 3. Config in the app

The app expects the bucket name `test-screenshots` by default. To use a different name:

- Edit `src/lib/config.ts` and set `STORAGE_CONFIG.screenshotBucket` to your bucket name.

### Verify

After creating the bucket, run the app and trigger a flow that captures screenshots (e.g. Designer or Runner). You should no longer see:

```text
Screenshot storage bucket 'test-screenshots' not found.
```

in the server logs.
