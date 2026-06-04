"use server";

import { revalidatePath } from "next/cache";
import { requireRetailer } from "@/lib/auth/require-retailer";
import {
  createWholesalerRetailerRelationship,
  getPurchaseOrderById,
  getAllWholesalers,
  getWholesalerCatalog,
  insertPurchaseOrderItemRows,
  insertPurchaseOrderRow,
  listPurchaseOrdersByRetailer,
  mapPurchaseOrderSummary,
} from "@/lib/data/purchase-orders";
import type {
  CartItem,
  CreatePurchaseOrderInput,
  PurchaseOrderSummary,
  PurchaseOrderWithDetails,
} from "@/types/purchase-orders";

const PURCHASE_ORDERS_PATH = "/retailer/purchase-orders";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "An unexpected error occurred." };
}

function revalidatePurchaseOrders() {
  revalidatePath(PURCHASE_ORDERS_PATH);
}

export async function getRetailerPurchaseOrders(
  status?: string
): Promise<ActionResult<PurchaseOrderSummary[]>> {
  try {
    const retailerId = await requireRetailer();
    const { data, error } = await listPurchaseOrdersByRetailer(retailerId, status);

    if (error) {
      return { success: false, error: error.message };
    }

    const summaries = (data ?? [])
      .map(mapPurchaseOrderSummary)
      .filter((item): item is PurchaseOrderSummary => item !== null);

    return { success: true, data: summaries };
  } catch (err) {
    return toActionError(err);
  }
}

export async function getPurchaseOrderDetails(
  purchaseOrderId: string
): Promise<ActionResult<PurchaseOrderWithDetails>> {
  try {
    await requireRetailer();
    const { data, error } = await getPurchaseOrderById(purchaseOrderId);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Purchase order not found" };
    }

    return { success: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function getAllWholesalersList(): Promise<ActionResult<any[]>> {
  try {
    await requireRetailer();
    const { data, error } = await getAllWholesalers();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
  } catch (err) {
    return toActionError(err);
  }
}

export async function getWholesalerProducts(
  wholesalerId: string,
  searchTerm: string = ""
): Promise<ActionResult<any[]>> {
  try {
    await requireRetailer();
    const { data, error } = await getWholesalerCatalog(wholesalerId, searchTerm);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
  } catch (err) {
    return toActionError(err);
  }
}

export async function ensureWholesalerRelationship(
  wholesalerId: string
): Promise<ActionResult> {
  try {
    const retailerId = await requireRetailer();

    // Check if relationship already exists
    const supabase = await (await import("@/lib/supabase/server")).createClient();
    const { data: existing } = await (supabase
      .from("wholesaler_retailers") as any)
      .select("*")
      .eq("retailer_id", retailerId)
      .eq("wholesaler_id", wholesalerId)
      .maybesingle();

    if (existing) {
      return { success: true, data: undefined };
    }

    // Create new relationship
    const { error } = await createWholesalerRetailerRelationship(
      retailerId,
      wholesalerId
    );

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput
): Promise<ActionResult<PurchaseOrderWithDetails>> {
  try {
    const retailerId = await requireRetailer();

    if (!input.wholesaler_id) {
      return { success: false, error: "Wholesaler ID is required" };
    }

    if (!input.items || input.items.length === 0) {
      return { success: false, error: "At least one item is required" };
    }

    // Ensure wholesaler-retailer relationship exists
    const relationshipResult = await ensureWholesalerRelationship(input.wholesaler_id);
    if (!relationshipResult.success) {
      return { success: false, error: relationshipResult.error };
    }

    // Calculate total amount
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_cost,
      0
    );

    // Insert purchase order
    const { data: order, error: orderError } = await insertPurchaseOrderRow({
      retailer_id: retailerId,
      wholesaler_id: input.wholesaler_id,
      total_amount: totalAmount,
      status: "PENDING",
    });

    if (orderError || !order) {
      return { success: false, error: orderError?.message || "Failed to create purchase order" };
    }

    // Insert purchase order items
    const itemsToInsert = input.items.map((item) => ({
      po_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    }));

    const { error: itemsError } = await insertPurchaseOrderItemRows(itemsToInsert);

    if (itemsError) {
      return { success: false, error: itemsError.message };
    }

    // Fetch the complete order with details
    const { data: orderWithDetails, error: detailsError } = await getPurchaseOrderById(
      order.id
    );

    if (detailsError || !orderWithDetails) {
      return { success: false, error: detailsError?.message || "Failed to fetch order details" };
    }

    revalidatePurchaseOrders();
    return { success: true, data: orderWithDetails };
  } catch (err) {
    return toActionError(err);
  }
}
