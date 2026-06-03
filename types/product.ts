import type { Database } from "@/types/database";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];

export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export interface ProductFormInput {
  sku: string;
  barcode: string;
  name: string;
  wholesale_price: string;
  suggested_retail_price: string;
}

export const emptyProductForm: ProductFormInput = {
  sku: "",
  barcode: "",
  name: "",
  wholesale_price: "",
  suggested_retail_price: "",
};

export function productToFormInput(product: Product): ProductFormInput {
  return {
    sku: product.sku,
    barcode: product.barcode ?? "",
    name: product.name,
    wholesale_price: String(product.wholesale_price),
    suggested_retail_price:
      product.suggested_retail_price != null ? String(product.suggested_retail_price) : "",
  };
}
