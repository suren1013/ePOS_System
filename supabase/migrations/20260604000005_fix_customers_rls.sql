-- =============================================================================
-- Fix RLS Policies for customers table
-- Ensures retailers can manage their own customers
-- =============================================================================

-- Drop existing policies if any
drop policy if exists "Retailers can view own customers" on public.customers;
drop policy if exists "Retailers can insert own customers" on public.customers;
drop policy if exists "Retailers can update own customers" on public.customers;
drop policy if exists "Retailers can delete own customers" on public.customers;

-- Enable RLS if not already enabled
alter table public.customers enable row level security;

-- Retailers can view their own customers
create policy "Retailers can view own customers"
  on public.customers
  for select
  to authenticated
  using (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Retailers can insert their own customers
create policy "Retailers can insert own customers"
  on public.customers
  for insert
  to authenticated
  with check (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Retailers can update their own customers
create policy "Retailers can update own customers"
  on public.customers
  for update
  to authenticated
  using (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  )
  with check (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Retailers can delete their own customers
create policy "Retailers can delete own customers"
  on public.customers
  for delete
  to authenticated
  using (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Service role has full access (for admin operations)
create policy "Service role full access"
  on public.customers
  for all
  to service_role
  using (true)
  with check (true);
