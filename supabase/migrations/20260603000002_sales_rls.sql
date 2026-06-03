-- Sales & POS checkout RLS and atomic complete_retailer_sale function

alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

create policy "Retailers can view own sales"
  on public.sales
  for select
  to authenticated
  using (retailer_id = auth.uid());

create policy "Retailers can insert own sales"
  on public.sales
  for insert
  to authenticated
  with check (retailer_id = auth.uid());

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

create or replace function public.complete_retailer_sale(
  p_payment_method text,
  p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_retailer_id uuid := auth.uid();
  v_sale_id uuid;
  v_subtotal numeric := 0;
  v_item jsonb;
  v_inventory record;
  v_qty integer;
  v_unit_price numeric;
  v_line_total numeric;
  v_inventory_id uuid;
  v_product_id uuid;
begin
  if v_retailer_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_payment_method not in ('cash', 'card') then
    raise exception 'Invalid payment method';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_inventory_id := (v_item->>'inventory_id')::uuid;
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric;

    if v_qty is null or v_qty < 1 then
      raise exception 'Invalid quantity';
    end if;

    if v_unit_price is null or v_unit_price < 0 then
      raise exception 'Invalid unit price';
    end if;

    select *
    into v_inventory
    from public.retailer_inventory
    where id = v_inventory_id
      and retailer_id = v_retailer_id
      and product_id = v_product_id
    for update;

    if not found then
      raise exception 'Inventory item not found';
    end if;

    if v_inventory.stock_quantity < v_qty then
      raise exception 'Insufficient stock for product %', v_product_id;
    end if;

    v_line_total := round(v_qty * v_unit_price, 2);
    v_subtotal := v_subtotal + v_line_total;
  end loop;

  v_subtotal := round(v_subtotal, 2);

  insert into public.sales (retailer_id, subtotal, total, payment_method)
  values (v_retailer_id, v_subtotal, v_subtotal, p_payment_method)
  returning id into v_sale_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_inventory_id := (v_item->>'inventory_id')::uuid;
    v_product_id := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'quantity')::integer;
    v_unit_price := (v_item->>'unit_price')::numeric;
    v_line_total := round(v_qty * v_unit_price, 2);

    insert into public.sale_items (sale_id, product_id, quantity, unit_price, line_total)
    values (v_sale_id, v_product_id, v_qty, v_unit_price, v_line_total);

    update public.retailer_inventory
    set stock_quantity = stock_quantity - v_qty
    where id = v_inventory_id
      and retailer_id = v_retailer_id
      and stock_quantity >= v_qty;

    if not found then
      raise exception 'Insufficient stock while completing sale';
    end if;
  end loop;

  return v_sale_id;
end;
$$;

grant execute on function public.complete_retailer_sale(text, jsonb) to authenticated;
