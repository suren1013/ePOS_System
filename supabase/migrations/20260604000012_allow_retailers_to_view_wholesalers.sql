-- Allow retailers to view all wholesalers for catalog browsing and purchase orders
-- This policy grants SELECT only, preserving existing wholesaler self-management policies

drop policy if exists "Retailers can view wholesalers" on public.wholesalers;

create policy "Retailers can view wholesalers"
  on public.wholesalers
  for select
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'retailer');
