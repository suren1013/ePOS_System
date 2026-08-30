-- =============================================================================
-- Fix RLS Policies for purchase_orders table
-- Ensures retailers can manage their own purchase orders from wholesalers
-- =============================================================================

-- Drop existing policies if any
drop policy if exists "Retailers can view own purchase orders" on public.purchase_orders;
drop policy if exists "Retailers can insert own purchase orders" on public.purchase_orders;
drop policy if exists "Retailers can update own purchase orders" on public.purchase_orders;

-- Enable RLS if not already enabled
alter table public.purchase_orders enable row level security;

-- Retailers can view their own purchase orders
create policy "Retailers can view own purchase orders"
  on public.purchase_orders
  for select
  to authenticated
  using (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Retailers can insert their own purchase orders
create policy "Retailers can insert own purchase orders"
  on public.purchase_orders
  for insert
  to authenticated
  with check (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Retailers can update their own purchase orders
create policy "Retailers can update own purchase orders"
  on public.purchase_orders
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

-- Wholesalers can view purchase orders sent to them
create policy "Wholesalers can view purchase orders"
  on public.purchase_orders
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
  on public.purchase_orders
  for all
  to service_role
  using (true)
  with check (true);
