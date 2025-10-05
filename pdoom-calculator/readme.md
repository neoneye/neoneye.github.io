# Create table inside Supabase

```sql
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null,
  factors jsonb not null,
  summary jsonb not null,
  inserted_at timestamptz not null default now()
);
```
