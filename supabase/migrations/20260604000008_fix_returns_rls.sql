-- =============================================================================
-- Fix RLS Policies for returns table
-- Ensures retailers can manage their own returns
-- =============================================================================

-- Drop existing policies if any
drop policy if exists "Retailers can view own returns" on public.returns;
drop policy if exists "Retailers can insert own returns" on public.returns;
drop policy if exists "Retailers can update own returns" on public.returns;

-- Enable RLS if not already enabled
alter table public.returns enable row level security;

-- Retailers can view their own returns
create policy "Retailers can view own returns"
  on public.returns
  for select
  to authenticated
  using (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Retailers can insert their own returns
create policy "Retailers can insert own returns"
  on public.returns
  for insert
  to authenticated
  with check (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Retailers can update their own returns
create policy "Retailers can update own returns"
  on public.returns
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

-- Service role has full access (for admin operations)
create policy "Service role full access"
  on public.returns
  for all
  to service_role
  using (true)
  with check (true);
