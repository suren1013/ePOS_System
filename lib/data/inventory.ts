import { createClient } from "@/lib/supabase/server";
import type { InventoryItem, InventoryProductSummary } from "@/types/inventory";
import type { RetailerInventoryInsert, RetailerInventoryRow } from "@/types/inventory";
import type { TablesUpdate } from "@/types/database";

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

type InventoryRowWithProduct = RetailerInventoryRow & {
  products: { name: string; sku: string; barcode: string | null } | null;
};

type InventoryQuery = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      order: (
        column: string,
        options: { ascending: boolean }
      ) => Promise<{
        data: InventoryRowWithProduct[] | null;
        error: { message: string; code?: string } | null;
      }>;
      maybeSingle: () => Promise<{
        data: InventoryRowWithProduct | null;
        error: { message: string } | null;
      }>;
    };
  };
  insert: (row: RetailerInventoryInsert) => {
    select: (columns: string) => {
      single: () => Promise<{
        data: InventoryRowWithProduct | null;
        error: { message: string; code?: string } | null;
      }>;
    };
  };
  update: (row: TablesUpdate<"retailer_inventory">) => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => {
        select: (columns: string) => {
          single: () => Promise<{
            data: InventoryRowWithProduct | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  };
  delete: () => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
};

type ProductsCatalogQuery = {
  select: (columns: string) => {
    order: (
      column: string,
      options: { ascending: boolean }
    ) => Promise<{
      data: InventoryProductSummary[] | null;
      error: { message: string } | null;
    }>;
  };
};

function inventoryTable(supabase: Awaited<ReturnType<typeof createClient>>) {
  return supabase.from("retailer_inventory") as unknown as InventoryQuery;
}

function productsTable(supabase: Awaited<ReturnType<typeof createClient>>) {
  return supabase.from("products") as unknown as ProductsCatalogQuery;
}

export function mapInventoryRow(data: unknown): InventoryItem | null {
  if (!data || typeof data !== "object") return null;

  const row = data as InventoryRowWithProduct;
  if (!row.products) return null;

  return {
    id: row.id,
    retailer_id: row.retailer_id,
    product_id: row.product_id,
    stock_quantity: row.stock_quantity,
    retail_price: row.retail_price,
    product_name: row.products.name,
    sku: row.products.sku,
    barcode: row.products.barcode,
  };
}

export async function listInventoryByRetailer(retailerId: string) {
  const supabase = await createClient();
  return inventoryTable(supabase)
    .select(INVENTORY_SELECT)
    .eq("retailer_id", retailerId)
    .order("stock_quantity", { ascending: true });
}

export async function listCatalogProducts() {
  const supabase = await createClient();
  return productsTable(supabase)
    .select("id, name, sku, barcode, suggested_retail_price")
    .order("name", { ascending: true });
}

export async function insertInventoryRow(row: RetailerInventoryInsert) {
  const supabase = await createClient();
  return inventoryTable(supabase).insert(row).select(INVENTORY_SELECT).single();
}

export async function updateInventoryRow(
  inventoryId: string,
  retailerId: string,
  updates: TablesUpdate<"retailer_inventory">
) {
  const supabase = await createClient();
  return inventoryTable(supabase)
    .update(updates)
    .eq("id", inventoryId)
    .eq("retailer_id", retailerId)
    .select(INVENTORY_SELECT)
    .single();
}

export async function deleteInventoryRow(inventoryId: string, retailerId: string) {
  const supabase = await createClient();
  return inventoryTable(supabase).delete().eq("id", inventoryId).eq("retailer_id", retailerId);
}

export async function findProductByBarcode(barcode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("barcode", barcode)
    .maybeSingle();
  
  if (error) {
    console.error("Error finding product by barcode:", error);
    return null;
  }
  
  return data;
}

export async function findRetailerInventory(retailerId: string, productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("retailer_inventory")
    .select("*")
    .eq("retailer_id", retailerId)
    .eq("product_id", productId)
    .maybeSingle();
  
  if (error) {
    console.error("Error finding retailer inventory:", error);
    return null;
  }
  
  return data as any;
}

export function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === "23505";
}
