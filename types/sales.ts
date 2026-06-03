import type { Database } from "@/types/database";
import type { InventoryItem } from "@/types/inventory";

export type SaleRow = Database["public"]["Tables"]["sales"]["Row"];
export type SaleItemRow = Database["public"]["Tables"]["sale_items"]["Row"];

export type PaymentMethod = "cash" | "card";

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
];

export interface CartLine {
  inventoryId: string;
  productId: string;
  productName: string;
  sku: string;
  barcode: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface CheckoutLineInput {
  inventory_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface CheckoutInput {
  payment_method: PaymentMethod;
  items: CheckoutLineInput[];
}

export interface SaleSummary {
  id: string;
  subtotal: number;
  total: number;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface TodaySalesMetrics {
  todaySalesAmount: number;
  todayTransactionCount: number;
}

export interface RetailerDashboardData {
  metrics: TodaySalesMetrics;
  lowStockItems: InventoryItem[];
}

export interface CompleteSaleResult {
  saleId: string;
  updatedInventory: InventoryItem[];
}
