-- Retailer inventory RLS and catalog read access for retailers
-- Apply if not already configured in your Supabase project

alter table public.retailer_inventory enable row level security;

create policy "Retailers can view own inventory"
  on public.retailer_inventory
  for select
  to authenticated
  using (retailer_id = auth.uid());

create policy "Retailers can insert own inventory"
  on public.retailer_inventory
  for insert
  to authenticated
  with check (retailer_id = auth.uid());

create policy "Retailers can update own inventory"
  on public.retailer_inventory
  for update
  to authenticated
  using (retailer_id = auth.uid())
  with check (retailer_id = auth.uid());

create policy "Retailers can delete own inventory"
  on public.retailer_inventory
  for delete
  to authenticated
  using (retailer_id = auth.uid());

-- Allow retailers to read the product catalog when adding stock (read-only)
create policy "Retailers can view product catalog"
  on public.products
  for select
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'retailer');
