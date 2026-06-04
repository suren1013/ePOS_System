"use server";

import { revalidatePath } from "next/cache";
import { requireWholesaler } from "@/lib/auth/require-wholesaler";
import {
  getPurchaseOrderById,
  listPurchaseOrdersByWholesaler,
  mapPurchaseOrderSummary,
  updatePurchaseOrderStatus,
} from "@/lib/data/purchase-orders";
import type {
  PurchaseOrderSummary,
  PurchaseOrderWithDetails,
  PurchaseOrderStatus,
} from "@/types/purchase-orders";

const PURCHASE_ORDERS_PATH = "/wholesaler/purchase-orders";

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

export async function getWholesalerPurchaseOrders(
  status?: string
): Promise<ActionResult<PurchaseOrderSummary[]>> {
  try {
    const wholesalerId = await requireWholesaler();
    console.log("[getWholesalerPurchaseOrders] wholesalerId:", wholesalerId);
    const { data, error } = await listPurchaseOrdersByWholesaler(wholesalerId, status);

    console.log("[getWholesalerPurchaseOrders] data:", data);
    console.log("[getWholesalerPurchaseOrders] error:", error);

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
    await requireWholesaler();
    const { data, error } = await getPurchaseOrderById(purchaseOrderId);

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: "Purchase order not found" };
    }

    // Verify the order belongs to this wholesaler
    if (data.wholesaler_id !== await requireWholesaler()) {
      return { success: false, error: "Unauthorized access to this order" };
    }

    return { success: true, data };
  } catch (err) {
    return toActionError(err);
  }
}

export async function approvePurchaseOrder(
  purchaseOrderId: string
): Promise<ActionResult<PurchaseOrderWithDetails>> {
  try {
    const wholesalerId = await requireWholesaler();

    // Get the order first to verify ownership
    const { data: order, error: fetchError } = await getPurchaseOrderById(purchaseOrderId);

    if (fetchError || !order) {
      return { success: false, error: fetchError?.message || "Order not found" };
    }

    if (order.wholesaler_id !== wholesalerId) {
      return { success: false, error: "Unauthorized access to this order" };
    }

    if (order.status !== "PENDING") {
      return { success: false, error: "Only pending orders can be approved" };
    }

    // Update status to APPROVED
    const { data: updatedOrder, error: updateError } = await updatePurchaseOrderStatus(
      purchaseOrderId,
      "APPROVED"
    );

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Fetch complete order details
    const { data: orderWithDetails, error: detailsError } = await getPurchaseOrderById(
      purchaseOrderId
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

export async function rejectPurchaseOrder(
  purchaseOrderId: string
): Promise<ActionResult<PurchaseOrderWithDetails>> {
  try {
    const wholesalerId = await requireWholesaler();

    // Get the order first to verify ownership
    const { data: order, error: fetchError } = await getPurchaseOrderById(purchaseOrderId);

    if (fetchError || !order) {
      return { success: false, error: fetchError?.message || "Order not found" };
    }

    if (order.wholesaler_id !== wholesalerId) {
      return { success: false, error: "Unauthorized access to this order" };
    }

    if (order.status !== "PENDING") {
      return { success: false, error: "Only pending orders can be rejected" };
    }

    // Update status to REJECTED
    const { data: updatedOrder, error: updateError } = await updatePurchaseOrderStatus(
      purchaseOrderId,
      "REJECTED"
    );

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Fetch complete order details
    const { data: orderWithDetails, error: detailsError } = await getPurchaseOrderById(
      purchaseOrderId
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

export async function fulfillPurchaseOrder(
  purchaseOrderId: string
): Promise<ActionResult<PurchaseOrderWithDetails>> {
  try {
    const wholesalerId = await requireWholesaler();

    // Get the order first to verify ownership
    const { data: order, error: fetchError } = await getPurchaseOrderById(purchaseOrderId);

    if (fetchError || !order) {
      return { success: false, error: fetchError?.message || "Order not found" };
    }

    if (order.wholesaler_id !== wholesalerId) {
      return { success: false, error: "Unauthorized access to this order" };
    }

    if (order.status !== "APPROVED") {
      return { success: false, error: "Only approved orders can be fulfilled" };
    }

    // Update status to FULFILLED
    const { data: updatedOrder, error: updateError } = await updatePurchaseOrderStatus(
      purchaseOrderId,
      "FULFILLED"
    );

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Fetch complete order details
    const { data: orderWithDetails, error: detailsError } = await getPurchaseOrderById(
      purchaseOrderId
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
