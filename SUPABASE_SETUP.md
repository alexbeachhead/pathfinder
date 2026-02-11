# Supabase Setup

## Database

1. In the [Supabase Dashboard](https://supabase.com/dashboard), open your project.
2. Go to **SQL Editor** and run the schema migrations in order:
   - `supabase/000_schema_initial.sql`
   - Then any other `supabase/*.sql` migrations as needed for your features.

## Storage

The screenshots feature has been removed. No Supabase Storage buckets are required for the app.
