-- =============================================================================
-- Fix RLS Policies for wholesaler_retailers table
-- Ensures wholesalers and retailers can view their relationships
-- =============================================================================

-- Drop existing policies if any
drop policy if exists "Wholesalers can view retailer relationships" on public.wholesaler_retailers;
drop policy if exists "Retailers can view wholesaler relationships" on public.wholesaler_retailers;

-- Enable RLS if not already enabled
alter table public.wholesaler_retailers enable row level security;

-- Wholesalers can view their retailer relationships
create policy "Wholesalers can view retailer relationships"
  on public.wholesaler_retailers
  for select
  to authenticated
  using (
    wholesaler_id = auth.uid()
    and exists (
      select 1 from public.wholesalers 
      where wholesalers.id = auth.uid()
    )
  );

-- Retailers can view their wholesaler relationships
create policy "Retailers can view wholesaler relationships"
  on public.wholesaler_retailers
  for select
  to authenticated
  using (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Wholesalers can insert retailer relationships
create policy "Wholesalers can insert retailer relationships"
  on public.wholesaler_retailers
  for insert
  to authenticated
  with check (
    wholesaler_id = auth.uid()
    and exists (
      select 1 from public.wholesalers 
      where wholesalers.id = auth.uid()
    )
  );

-- Retailers can insert wholesaler relationships
create policy "Retailers can insert wholesaler relationships"
  on public.wholesaler_retailers
  for insert
  to authenticated
  with check (
    retailer_id = auth.uid()
    and exists (
      select 1 from public.retailers 
      where retailers.id = auth.uid()
    )
  );

-- Wholesalers can update their retailer relationships
create policy "Wholesalers can update retailer relationships"
  on public.wholesaler_retailers
  for update
  to authenticated
  using (
    wholesaler_id = auth.uid()
    and exists (
      select 1 from public.wholesalers 
      where wholesalers.id = auth.uid()
    )
  )
  with check (
    wholesaler_id = auth.uid()
    and exists (
      select 1 from public.wholesalers 
      where wholesalers.id = auth.uid()
    )
  );

-- Retailers can update their wholesaler relationships
create policy "Retailers can update wholesaler relationships"
  on public.wholesaler_retailers
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
  on public.wholesaler_retailers
  for all
  to service_role
  using (true)
  with check (true);
