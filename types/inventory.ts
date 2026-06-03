import type { Database } from "@/types/database";

export type RetailerInventoryRow =
  Database["public"]["Tables"]["retailer_inventory"]["Row"];

export type RetailerInventoryInsert =
  Database["public"]["Tables"]["retailer_inventory"]["Insert"];

export type RetailerInventoryUpdate =
  Database["public"]["Tables"]["retailer_inventory"]["Update"];

export const LOW_STOCK_THRESHOLD = 10;

export interface InventoryProductSummary {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  suggested_retail_price: number | null;
}

export interface InventoryItem {
  id: string;
  retailer_id: string;
  product_id: string;
  stock_quantity: number;
  retail_price: number;
  product_name: string;
  sku: string;
  barcode: string | null;
}

export interface AddInventoryFormInput {
  product_id: string;
  stock_quantity: string;
  retail_price: string;
}

export interface UpdateStockFormInput {
  stock_quantity: string;
}

export const emptyAddInventoryForm: AddInventoryFormInput = {
  product_id: "",
  stock_quantity: "",
  retail_price: "",
};
