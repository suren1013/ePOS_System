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
        data: { total_amount: number }[] | null;
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

export interface CompleteRetailerSaleResponse {
  success: boolean;
  sale_id: string;
  total_amount: number;
}

type RpcClient = {
  rpc: (
    fn: "complete_retailer_sale",
    args: { p_payment_method: string; p_items: Json }
  ) => Promise<{ data: CompleteRetailerSaleResponse | null; error: { message: string } | null }>;
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

export function getStartOfWeekIso(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export function getStartOfMonthIso(): string {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

export async function listRecentSales(retailerId: string, limit = 50) {
  const supabase = await createClient();
  return salesTable(supabase)
    .select("id, total_amount, payment_method, status, created_at")
    .eq("retailer_id", retailerId)
    .order("created_at", { ascending: false })
    .limit(limit);
}

export async function getTodaySalesRows(retailerId: string) {
  const supabase = await createClient();
  return salesTable(supabase)
    .select("total_amount")
    .eq("retailer_id", retailerId)
    .gte("created_at", getStartOfTodayIso());
}

export async function getWeekSalesRows(retailerId: string) {
  const supabase = await createClient();
  return salesTable(supabase)
    .select("total_amount")
    .eq("retailer_id", retailerId)
    .gte("created_at", getStartOfWeekIso());
}

export async function getMonthSalesRows(retailerId: string) {
  const supabase = await createClient();
  return salesTable(supabase)
    .select("total_amount")
    .eq("retailer_id", retailerId)
    .gte("created_at", getStartOfMonthIso());
}

export async function getBestSellingProducts(retailerId: string, limit = 5) {
  const supabase = await createClient();
  // Get recent sales IDs (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: sales } = await supabase
    .from("sales")
    .select("id")
    .eq("retailer_id", retailerId)
    .gte("created_at", thirtyDaysAgo.toISOString());
  
  if (!sales || sales.length === 0) {
    return { data: [], error: null };
  }
  
  const saleIds = sales.map((s: any) => s.id);
  
  // Get all sale items for these sales
  const { data: saleItems, error } = await supabase
    .from("sale_items")
    .select("product_id, quantity")
    .in("sale_id", saleIds);
  
  if (error) {
    return { data: null, error };
  }
  
  // Aggregate by product
  const productSales = new Map<string, { totalSold: number; totalRevenue: number }>();
  
  for (const item of saleItems || []) {
    const productId = (item as any).product_id;
    const quantity = (item as any).quantity;
    
    if (!productSales.has(productId)) {
      productSales.set(productId, { totalSold: 0, totalRevenue: 0 });
    }
    
    const current = productSales.get(productId)!;
    current.totalSold += quantity;
  }
  
  // Get product details
  const productIds = Array.from(productSales.keys());
  const { data: products } = await supabase
    .from("products")
    .select("id, name, sku, barcode, suggested_retail_price")
    .in("id", productIds);
  
  // Combine data and sort by total sold
  const bestSelling = (products || []).map((p: any) => {
    const sales = productSales.get(p.id)!;
    return {
      id: p.id,
      productName: p.name,
      sku: p.sku,
      barcode: p.barcode,
      totalSold: sales.totalSold,
      totalRevenue: sales.totalSold * (p.suggested_retail_price || 0),
    };
  }).sort((a, b) => b.totalSold - a.totalSold).slice(0, limit);
  
  return { data: bestSelling, error: null };
}

export async function completeSaleTransaction(
  paymentMethod: PaymentMethod,
  items: CheckoutLineInput[]
): Promise<{ data: CompleteRetailerSaleResponse | null; error: { message: string } | null }> {
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
    total_amount: Number(row.total_amount),
    payment_method: row.payment_method as PaymentMethod,
    status: row.status,
    created_at: row.created_at,
  };
}
