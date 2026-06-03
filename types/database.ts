export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type ProductRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          wholesaler_id: string;
          sku: string;
          barcode: string | null;
          name: string;
          wholesale_price: number;
          suggested_retail_price: number | null;
        };
        Insert: {
          id?: string;
          wholesaler_id: string;
          sku: string;
          barcode?: string | null;
          name: string;
          wholesale_price: number;
          suggested_retail_price?: number | null;
        };
        Update: {
          id?: string;
          wholesaler_id?: string;
          sku?: string;
          barcode?: string | null;
          name?: string;
          wholesale_price?: number;
          suggested_retail_price?: number | null;
        };
        Relationships: ProductRelationship[];
      };
      retailer_inventory: {
        Row: {
          id: string;
          retailer_id: string;
          product_id: string;
          stock_quantity: number;
          retail_price: number;
        };
        Insert: {
          id?: string;
          retailer_id: string;
          product_id: string;
          stock_quantity: number;
          retail_price: number;
        };
        Update: {
          id?: string;
          retailer_id?: string;
          product_id?: string;
          stock_quantity?: number;
          retail_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "retailer_inventory_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "retailer_inventory_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
