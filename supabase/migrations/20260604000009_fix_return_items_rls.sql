-- =============================================================================
-- Fix RLS Policies for return_items table
-- Ensures retailers can manage their own return items (via returns relationship)
-- =============================================================================

-- Drop existing policies if any
drop policy if exists "Retailers can view own return items" on public.return_items;
drop policy if exists "Retailers can insert own return items" on public.return_items;

-- Enable RLS if not already enabled
alter table public.return_items enable row level security;

-- Retailers can view their own return items (via returns relationship)
create policy "Retailers can view own return items"
  on public.return_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.returns r
      where r.id = return_items.return_id
        and r.retailer_id = auth.uid()
        and exists (
          select 1 from public.retailers 
          where retailers.id = auth.uid()
        )
    )
  );

-- Retailers can insert their own return items (via returns relationship)
create policy "Retailers can insert own return items"
  on public.return_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.returns r
      where r.id = return_items.return_id
        and r.retailer_id = auth.uid()
        and exists (
          select 1 from public.retailers 
          where retailers.id = auth.uid()
        )
    )
  );

-- Wholesalers can view return items for their products
create policy "Wholesalers can view return items"
  on public.return_items
  for select
  to authenticated
  using (
    wholesaler_id = auth.uid()
    and exists (
      select 1 from public.wholesalers 
      where wholesalers.id = auth.uid()
    )
  );

-- Service role has full access (for admin operations)
create policy "Service role full access"
  on public.return_items
  for all
  to service_role
  using (true)
  with check (true);
