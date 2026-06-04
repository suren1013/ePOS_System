import { createClient } from "@/lib/supabase/server";
import type {
  PurchaseOrder,
  PurchaseOrderInsert,
  PurchaseOrderItem,
  PurchaseOrderItemInsert,
  PurchaseOrderSummary,
  PurchaseOrderWithDetails,
  PurchaseOrderItemWithProduct,
  PurchaseOrderUpdate,
} from "@/types/purchase-orders";
import type { TablesUpdate } from "@/types/database";

const PURCHASE_ORDER_SELECT = `
  id,
  retailer_id,
  wholesaler_id,
  total_amount,
  status,
  created_at,
  updated_at,
  retailers!inner (
    id,
    store_name,
    contact_email
  ),
  wholesalers!inner (
    id,
    business_name,
    contact_email
  )
`;

const PURCHASE_ORDER_ITEMS_SELECT = `
  id,
  po_id,
  product_id,
  quantity,
  unit_cost,
  created_at,
  updated_at,
  products!inner (
    id,
    name,
    sku,
    barcode,
    wholesale_price
  )
`;

type PurchaseOrdersQuery = any;

type PurchaseOrderItemsQuery = any;

type ProductsQuery = any;

type WholesalerRetailersQuery = any;


export async function listPurchaseOrdersByRetailer(
  retailerId: string,
  status?: string
) {
  const supabase = await createClient();
  let query = supabase
    .from("purchase_orders")
    .select(PURCHASE_ORDER_SELECT)
    .eq("retailer_id", retailerId);

  if (status) {
    query = query.eq("status", status);
  }

  return query.order("created_at", { ascending: false });
}

export async function listPurchaseOrdersByWholesaler(
  wholesalerId: string,
  status?: string
) {
  const supabase = await createClient();
  const result = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("wholesaler_id", wholesalerId);

  console.log("[listPurchaseOrdersByWholesaler] wholesalerId:", wholesalerId);
  console.log("[listPurchaseOrdersByWholesaler] query result:", result);
  console.log("[listPurchaseOrdersByWholesaler] query error:", result.error);
  return result;
}

export async function getPurchaseOrderById(
  purchaseOrderId: string
): Promise<{ data: PurchaseOrderWithDetails | null; error: { message: string } | null }> {
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("purchase_orders")
    .select(PURCHASE_ORDER_SELECT)
    .eq("id", purchaseOrderId)
    .single();

  if (orderError || !order) {
    return { data: null, error: orderError || { message: "Order not found" } };
  }

  const { data: items, error: itemsError } = await supabase
    .from("purchase_order_items")
    .select(PURCHASE_ORDER_ITEMS_SELECT)
    .eq("po_id", purchaseOrderId)
    .order("created_at", { ascending: true });

  if (itemsError) {
    return { data: null, error: itemsError };
  }

  const orderWithDetails: PurchaseOrderWithDetails = {
    ...(order as any),
    items: (items ?? []) as PurchaseOrderItemWithProduct[],
  };

  return { data: orderWithDetails, error: null };
}

export async function insertPurchaseOrderRow(
  row: PurchaseOrderInsert
): Promise<{ data: PurchaseOrder | null; error: { message: string } | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .insert(row as any)
    .select()
    .single();
  return { data: data as PurchaseOrder | null, error };
}

export async function insertPurchaseOrderItemRows(
  items: PurchaseOrderItemInsert[]
): Promise<{ data: PurchaseOrderItem[] | null; error: { message: string } | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_order_items")
    .insert(items as any)
    .select();
  return { data: data as PurchaseOrderItem[] | null, error };
}

export async function updatePurchaseOrderStatus(
  purchaseOrderId: string,
  status: string
): Promise<{ data: PurchaseOrder | null; error: { message: string } | null }> {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("purchase_orders") as any)
    .update({ status })
    .eq("id", purchaseOrderId)
    .select()
    .single();
  return { data: data as PurchaseOrder | null, error };
}

export async function searchWholesalerCatalog(
  retailerId: string,
  wholesalerId: string,
  searchTerm: string
) {
  const supabase = await createClient();

  // Search products from specific wholesaler
  const searchQuery = searchTerm.trim();
  let query = supabase
    .from("products")
    .select(`
      id,
      wholesaler_id,
      sku,
      barcode,
      name,
      wholesale_price,
      suggested_retail_price,
      wholesalers!inner (
        id,
        business_name,
        contact_email
      )
    `)
    .eq("wholesaler_id", wholesalerId);

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,sku.ilike.%${searchQuery}%,barcode.ilike.%${searchQuery}%`);
  }

  return query.order("name", { ascending: true }).limit(100);
}

export async function getAllWholesalers() {
  const supabase = await createClient();
  return supabase
    .from("wholesalers")
    .select("id, business_name, contact_email")
    .order("business_name", { ascending: true });
}

export async function getWholesalerCatalog(
  wholesalerId: string,
  searchTerm: string = ""
) {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      id,
      wholesaler_id,
      sku,
      barcode,
      name,
      wholesale_price,
      suggested_retail_price,
      wholesalers!inner (
        id,
        business_name,
        contact_email
      )
    `)
    .eq("wholesaler_id", wholesalerId);

  if (searchTerm.trim()) {
    query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,barcode.ilike.%${searchTerm}%`);
  }

  return query.order("name", { ascending: true }).limit(100);
}

export async function createWholesalerRetailerRelationship(
  retailerId: string,
  wholesalerId: string
) {
  const supabase = await createClient();
  const { data, error } = await (supabase
    .from("wholesaler_retailers") as any)
    .insert({ retailer_id: retailerId, wholesaler_id: wholesalerId })
    .select()
    .single();
  return { data, error };
}

export function mapPurchaseOrderRow(data: unknown): PurchaseOrder | null {
  if (!data || typeof data !== "object") return null;
  return data as PurchaseOrder;
}

export function mapPurchaseOrderSummary(data: unknown): PurchaseOrderSummary | null {
  if (!data || typeof data !== "object") return null;
  const row = data as any;
  if (!row.id || !row.created_at) return null;
  
  return {
    id: row.id,
    wholesaler_id: row.wholesaler_id,
    wholesaler_name: row.wholesalers?.business_name || "Unknown",
    retailer_id: row.retailer_id,
    retailer_name: row.retailers?.store_name || "Unknown",
    total_amount: Number(row.total_amount),
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    item_count: row.item_count || 0,
  };
}
