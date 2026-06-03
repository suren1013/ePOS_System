import { createClient } from "@/lib/supabase/server";
import { mapInventoryRow } from "@/lib/data/inventory";
import type { Json } from "@/types/database";
import type { CheckoutLineInput, PaymentMethod, SaleSummary } from "@/types/sales";

const INVENTORY_SELECT = `
  id,
  retailer_id,
  product_id,
  stock_quantity,
  retail_price,
  products (
    name,
    sku,
    barcode
  )
`;

type SalesQuery = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      gte: (column: string, value: string) => Promise<{
        data: { total: number }[] | null;
        error: { message: string } | null;
      }>;
      order: (
        column: string,
        options: { ascending: boolean }
      ) => {
        limit: (count: number) => Promise<{
          data: SaleSummary[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
};

type RpcClient = {
  rpc: (
    fn: "complete_retailer_sale",
    args: { p_payment_method: string; p_items: Json }
  ) => Promise<{ data: string | null; error: { message: string } | null }>;
};

function salesTable(supabase: Awaited<ReturnType<typeof createClient>>) {
  return supabase.from("sales") as unknown as SalesQuery;
}

function rpcClient(supabase: Awaited<ReturnType<typeof createClient>>) {
  return supabase as unknown as RpcClient;
}

export function getStartOfTodayIso(): string {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export async function listRecentSales(retailerId: string, limit = 50) {
  const supabase = await createClient();
  return salesTable(supabase)
    .select("id, subtotal, total, payment_method, created_at")
    .eq("retailer_id", retailerId)
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getTodaySalesRows(retailerId: string) {
  const supabase = await createClient();
  return salesTable(supabase)
    .select("total")
    .eq("retailer_id", retailerId)
    .gte("created_at", getStartOfTodayIso());
}

export async function completeSaleTransaction(
  paymentMethod: PaymentMethod,
  items: CheckoutLineInput[]
) {
  const supabase = await createClient();
  return rpcClient(supabase).rpc("complete_retailer_sale", {
    p_payment_method: paymentMethod,
    p_items: items as unknown as Json,
  });
}

export async function fetchInventoryAfterSale(retailerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("retailer_inventory")
    .select(INVENTORY_SELECT)
    .eq("retailer_id", retailerId)
    .order("stock_quantity", { ascending: true });

  const items = (data ?? [])
    .map(mapInventoryRow)
    .filter((item): item is NonNullable<ReturnType<typeof mapInventoryRow>> => item !== null);

  return { data: items, error };
}

export function mapSaleRow(data: unknown): SaleSummary | null {
  if (!data || typeof data !== "object") return null;
  const row = data as SaleSummary;
  if (!row.id || !row.created_at) return null;
  return {
    id: row.id,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    payment_method: row.payment_method as PaymentMethod,
    created_at: row.created_at,
  };
}
