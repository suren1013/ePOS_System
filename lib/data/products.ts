import { createClient } from "@/lib/supabase/server";
import type { Product, ProductInsert } from "@/types/product";
import type { TablesUpdate } from "@/types/database";

type ProductsQuery = {
  select: (columns?: string) => {
    eq: (column: string, value: string) => {
      order: (column: string, options: { ascending: boolean }) => Promise<{
        data: Product[] | null;
        error: { message: string } | null;
      }>;
    };
  };
  insert: (row: ProductInsert) => {
    select: () => { single: () => Promise<{ data: Product | null; error: { message: string } | null }> };
  };
  update: (row: TablesUpdate<"products">) => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => {
        select: () => { single: () => Promise<{ data: Product | null; error: { message: string } | null }> };
      };
    };
  };
  delete: () => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string } | null }>;
    };
  };
};

function productsTable(supabase: Awaited<ReturnType<typeof createClient>>) {
  return supabase.from("products") as unknown as ProductsQuery;
}

export async function listProductsByWholesaler(wholesalerId: string) {
  const supabase = await createClient();
  return productsTable(supabase)
    .select("*")
    .eq("wholesaler_id", wholesalerId)
    .order("name", { ascending: true });
}

export async function insertProductRow(row: ProductInsert) {
  const supabase = await createClient();
  return productsTable(supabase).insert(row).select().single();
}

export async function updateProductRow(
  productId: string,
  wholesalerId: string,
  updates: TablesUpdate<"products">
) {
  const supabase = await createClient();
  return productsTable(supabase)
    .update(updates)
    .eq("id", productId)
    .eq("wholesaler_id", wholesalerId)
    .select()
    .single();
}

export async function deleteProductRow(productId: string, wholesalerId: string) {
  const supabase = await createClient();
  return productsTable(supabase).delete().eq("id", productId).eq("wholesaler_id", wholesalerId);
}

export function mapProductRow(data: unknown): Product | null {
  if (!data || typeof data !== "object") return null;
  return data as Product;
}
