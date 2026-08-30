-- =============================================================================
-- complete_retailer_sale — POS checkout RPC for Supabase
-- Paste this entire file into the Supabase SQL Editor and run it once.
-- =============================================================================

-- Remove old versions (wrong signature, return type, or column names)
drop function if exists public.complete_retailer_sale(text, jsonb);
drop function if exists public.complete_retailer_sale(jsonb, text);

-- -----------------------------------------------------------------------------
-- Row Level Security (skip if policies already exist in your project)
-- -----------------------------------------------------------------------------

alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

drop policy if exists "Retailers can view own sales" on public.sales;
create policy "Retailers can view own sales"
  on public.sales
  for select
  to authenticated
  using (retailer_id = auth.uid());

drop policy if exists "Retailers can insert own sales" on public.sales;
create policy "Retailers can insert own sales"
  on public.sales
  for insert
  to authenticated
  with check (retailer_id = auth.uid());

drop policy if exists "Retailers can view own sale items" on public.sale_items;
create policy "Retailers can view own sale items"
  on public.sale_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
        and s.retailer_id = auth.uid()
    )
  );

drop policy if exists "Retailers can insert own sale items" on public.sale_items;
create policy "Retailers can insert own sale items"
  on public.sale_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.sales s
      where s.id = sale_items.sale_id
        and s.retailer_id = auth.uid()
    )
  );

-- Retailers must be able to update their own inventory during checkout
drop policy if exists "Retailers can update own inventory" on public.retailer_inventory;
create policy "Retailers can update own inventory"
  on public.retailer_inventory
  for update
  to authenticated
  using (retailer_id = auth.uid())
  with check (retailer_id = auth.uid());

-- Retailers need read access to products for wholesaler_id / wholesale_price
drop policy if exists "Retailers can view product catalog" on public.products;
create policy "Retailers can view product catalog"
  on public.products
  for select
  to authenticated
  using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'retailer');

-- -----------------------------------------------------------------------------
-- RPC: complete_retailer_sale
--
-- p_items JSONB array shape (sent by POS):
-- [
--   {
--     "inventory_id": "uuid",
--     "product_id":   "uuid",
--     "quantity":     2,
--     "unit_price":   9.99
--   }
-- ]
--
-- Parameter order MUST be (p_items, p_payment_method) — PostgREST resolves
-- RPC overloads alphabetically by parameter name.
-- -----------------------------------------------------------------------------

create or replace function public.complete_retailer_sale(
  p_items jsonb,
  p_payment_method text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_retailer_id   uuid := auth.uid();
  v_sale_id       uuid;
  v_total_amount  numeric := 0;
  v_item          jsonb;
  v_inventory     record;
  v_product       record;
  v_qty           integer;
  v_unit_price    numeric;
  v_line_subtotal numeric;
  v_inventory_id  uuid;
  v_product_id    uuid;
begin
  -- Auth
  if v_retailer_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Payment method
  if p_payment_method is null
     or lower(trim(p_payment_method)) not in ('cash', 'card') then
    raise exception 'Invalid payment method. Use cash or card.';
  end if;

  -- Cart
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  -- -------------------------------------------------------------------------
  -- Pass 1: validate, lock inventory rows, compute total_amount
  -- (entire function runs in one transaction; any error rolls back everything)
  -- -------------------------------------------------------------------------
  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    v_inventory_id := nullif(v_item->>'inventory_id', '')::uuid;
    v_product_id   := nullif(v_item->>'product_id', '')::uuid;
    v_qty          := (v_item->>'quantity')::integer;
    v_unit_price   := (v_item->>'unit_price')::numeric;

    if v_inventory_id is null or v_product_id is null then
      raise exception 'Each cart item requires inventory_id and product_id';
    end if;

    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity for product %', v_product_id;
    end if;

    if v_unit_price is null or v_unit_price < 0 then
      raise exception 'Invalid unit price for product %', v_product_id;
    end if;

    select ri.*
    into v_inventory
    from public.retailer_inventory ri
    where ri.id = v_inventory_id
      and ri.retailer_id = v_retailer_id
      and ri.product_id = v_product_id
    for update;

    if not found then
      raise exception 'Inventory item not found for product %', v_product_id;
    end if;

    if v_inventory.stock_quantity < v_qty then
      raise exception 'Insufficient stock for product % (requested %, available %)',
        v_product_id, v_qty, v_inventory.stock_quantity;
    end if;

    select p.id, p.wholesaler_id, p.wholesale_price
    into v_product
    from public.products p
    where p.id = v_product_id;

    if not found then
      raise exception 'Product % not found in catalog', v_product_id;
    end if;

    v_line_subtotal := round(v_qty * v_unit_price, 2);
    v_total_amount  := v_total_amount + v_line_subtotal;
  end loop;

  v_total_amount := round(v_total_amount, 2);

  -- -------------------------------------------------------------------------
  -- Create sale header
  -- -------------------------------------------------------------------------
  insert into public.sales (
    retailer_id,
    customer_id,
    total_amount,
    payment_method,
    status
  )
  values (
    v_retailer_id,
    null,
    v_total_amount,
    lower(trim(p_payment_method)),
    'COMPLETED'
  )
  returning id into v_sale_id;

  -- -------------------------------------------------------------------------
  -- Pass 2: insert line items and decrement stock
  -- -------------------------------------------------------------------------
  for v_item in
    select value from jsonb_array_elements(p_items)
  loop
    v_inventory_id := nullif(v_item->>'inventory_id', '')::uuid;
    v_product_id   := nullif(v_item->>'product_id', '')::uuid;
    v_qty          := (v_item->>'quantity')::integer;
    v_unit_price   := (v_item->>'unit_price')::numeric;
    v_line_subtotal := round(v_qty * v_unit_price, 2);

    select p.id, p.wholesaler_id, p.wholesale_price
    into v_product
    from public.products p
    where p.id = v_product_id;

    insert into public.sale_items (
      sale_id,
      product_id,
      wholesaler_id,
      quantity,
      unit_price,
      cost_basis,
      subtotal
    )
    values (
      v_sale_id,
      v_product_id,
      v_product.wholesaler_id,
      v_qty,
      v_unit_price,
      v_product.wholesale_price,
      v_line_subtotal
    );

    update public.retailer_inventory
    set
      stock_quantity = stock_quantity - v_qty,
      updated_at     = now()
    where id = v_inventory_id
      and retailer_id = v_retailer_id
      and stock_quantity >= v_qty;

    if not found then
      raise exception 'Insufficient stock while completing sale for product %', v_product_id;
    end if;
  end loop;

  return jsonb_build_object(
    'success',       true,
    'sale_id',       v_sale_id,
    'total_amount',  v_total_amount
  );
end;
$$;

-- Permissions
revoke all on function public.complete_retailer_sale(jsonb, text) from public;
grant execute on function public.complete_retailer_sale(jsonb, text) to authenticated;
grant execute on function public.complete_retailer_sale(jsonb, text) to service_role;

-- Ask PostgREST to reload its schema cache (Supabase API)
notify pgrst, 'reload schema';
