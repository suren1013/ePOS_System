-- Row Level Security for products (apply if not already configured in Supabase)
-- wholesaler_id must match auth.uid() for wholesaler accounts

alter table public.products enable row level security;

create policy "Wholesalers can view own products"
  on public.products
  for select
  to authenticated
  using (wholesaler_id = auth.uid());

create policy "Wholesalers can insert own products"
  on public.products
  for insert
  to authenticated
  with check (wholesaler_id = auth.uid());

create policy "Wholesalers can update own products"
  on public.products
  for update
  to authenticated
  using (wholesaler_id = auth.uid())
  with check (wholesaler_id = auth.uid());

create policy "Wholesalers can delete own products"
  on public.products
  for delete
  to authenticated
  using (wholesaler_id = auth.uid());
