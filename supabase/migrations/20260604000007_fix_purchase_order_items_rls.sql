-- =============================================================================
-- Fix RLS Policies for purchase_order_items table
-- Ensures retailers can manage their own purchase order items
-- =============================================================================

-- Drop existing policies if any
drop policy if exists "Retailers can view own purchase order items" on public.purchase_order_items;
drop policy if exists "Retailers can insert own purchase order items" on public.purchase_order_items;

-- Enable RLS if not already enabled
alter table public.purchase_order_items enable row level security;

-- Retailers can view their own purchase order items (via purchase_orders relationship)
create policy "Retailers can view own purchase order items"
  on public.purchase_order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.purchase_orders po
      where po.id = purchase_order_items.po_id
        and po.retailer_id = auth.uid()
        and exists (
          select 1 from public.retailers 
          where retailers.id = auth.uid()
        )
    )
  );

-- Retailers can insert their own purchase order items (via purchase_orders relationship)
create policy "Retailers can insert own purchase order items"
  on public.purchase_order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.purchase_orders po
      where po.id = purchase_order_items.po_id
        and po.retailer_id = auth.uid()
        and exists (
          select 1 from public.retailers 
          where retailers.id = auth.uid()
        )
    )
  );

-- Wholesalers can view purchase order items for orders sent to them
create policy "Wholesalers can view purchase order items"
  on public.purchase_order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.purchase_orders po
      where po.id = purchase_order_items.po_id
        and po.wholesaler_id = auth.uid()
        and exists (
          select 1 from public.wholesalers 
          where wholesalers.id = auth.uid()
        )
    )
  );

-- Service role has full access (for admin operations)
create policy "Service role full access"
  on public.purchase_order_items
  for all
  to service_role
  using (true)
  with check (true);
