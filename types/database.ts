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
      sales: {
        Row: {
          id: string;
          retailer_id: string;
          customer_id: string | null;
          total_amount: number;
          payment_method: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          retailer_id: string;
          customer_id?: string | null;
          total_amount: number;
          payment_method: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          retailer_id?: string;
          customer_id?: string | null;
          total_amount?: number;
          payment_method?: string;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sales_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      sale_items: {
        Row: {
          id: string;
          sale_id: string;
          product_id: string;
          wholesaler_id: string;
          quantity: number;
          unit_price: number;
          cost_basis: number;
          subtotal: number;
        };
        Insert: {
          id?: string;
          sale_id: string;
          product_id: string;
          wholesaler_id: string;
          quantity: number;
          unit_price: number;
          cost_basis: number;
          subtotal: number;
        };
        Update: {
          id?: string;
          sale_id?: string;
          product_id?: string;
          wholesaler_id?: string;
          quantity?: number;
          unit_price?: number;
          cost_basis?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: "sale_items_sale_id_fkey";
            columns: ["sale_id"];
            isOneToOne: false;
            referencedRelation: "sales";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "sale_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_orders: {
        Row: {
          id: string;
          retailer_id: string;
          wholesaler_id: string;
          total_amount: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          retailer_id: string;
          wholesaler_id: string;
          total_amount: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          retailer_id?: string;
          wholesaler_id?: string;
          total_amount?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_orders_retailer_id_fkey";
            columns: ["retailer_id"];
            isOneToOne: false;
            referencedRelation: "retailers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_orders_wholesaler_id_fkey";
            columns: ["wholesaler_id"];
            isOneToOne: false;
            referencedRelation: "wholesalers";
            referencedColumns: ["id"];
          },
        ];
      };
      purchase_order_items: {
        Row: {
          id: string;
          po_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          po_id: string;
          product_id: string;
          quantity: number;
          unit_cost: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          po_id?: string;
          product_id?: string;
          quantity?: number;
          unit_cost?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_po_id_fkey";
            columns: ["po_id"];
            isOneToOne: false;
            referencedRelation: "purchase_orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      wholesalers: {
        Row: {
          id: string;
          business_name: string;
          contact_email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          contact_email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_name?: string;
          contact_email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      retailers: {
        Row: {
          id: string;
          store_name: string;
          contact_email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_name: string;
          contact_email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_name?: string;
          contact_email?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      complete_retailer_sale: {
        Args: {
          p_payment_method: string;
          p_items: Json;
        };
        Returns: string;
      };
    };
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
