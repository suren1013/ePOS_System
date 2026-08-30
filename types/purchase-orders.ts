import type { Database } from "@/types/database";

export type PurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Row"];
export type PurchaseOrderInsert = Database["public"]["Tables"]["purchase_orders"]["Insert"];
export type PurchaseOrderUpdate = Database["public"]["Tables"]["purchase_orders"]["Update"];

export type PurchaseOrderItem = Database["public"]["Tables"]["purchase_order_items"]["Row"];
export type PurchaseOrderItemInsert = Database["public"]["Tables"]["purchase_order_items"]["Insert"];
export type PurchaseOrderItemUpdate = Database["public"]["Tables"]["purchase_order_items"]["Update"];

export type Wholesaler = Database["public"]["Tables"]["wholesalers"]["Row"];
export type Retailer = Database["public"]["Tables"]["retailers"]["Row"];

export type PurchaseOrderStatus = "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED";

export interface PurchaseOrderWithDetails extends PurchaseOrder {
  wholesaler: Wholesaler;
  retailer: Retailer;
  items: PurchaseOrderItemWithProduct[];
}

export interface PurchaseOrderItemWithProduct extends PurchaseOrderItem {
  product: {
    id: string;
    name: string;
    sku: string;
    barcode: string | null;
    wholesale_price: number;
  };
}

export interface PurchaseOrderSummary {
  id: string;
  wholesaler_id: string;
  wholesaler_name: string;
  retailer_id: string;
  retailer_name: string;
  total_amount: number;
  status: PurchaseOrderStatus;
  created_at: string;
  updated_at: string;
  item_count: number;
}

export interface CartItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_barcode: string | null;
  wholesaler_id: string;
  wholesaler_name: string;
  unit_cost: number;
  quantity: number;
  subtotal: number;
}

export interface CreatePurchaseOrderInput {
  wholesaler_id: string;
  items: {
    product_id: string;
    quantity: number;
    unit_cost: number;
  }[];
}

export interface UpdatePurchaseOrderStatusInput {
  status: PurchaseOrderStatus;
}
