"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "@/lib/auth/require-wholesaler";
import { requireRetailer } from "@/lib/auth/require-retailer";
import {
  completeSaleTransaction,
  fetchInventoryAfterSale,
  getTodaySalesRows,
  getWeekSalesRows,
  getMonthSalesRows,
  getBestSellingProducts,
  listRecentSales,
  mapSaleRow,
} from "@/lib/data/sales";
import { listInventoryByRetailer, mapInventoryRow } from "@/lib/data/inventory";
import { parseCheckoutInput } from "@/lib/validators/sales";
import { LOW_STOCK_THRESHOLD, type InventoryItem } from "@/types/inventory";
import type {
  CheckoutInput,
  CompleteSaleResult,
  RetailerDashboardData,
  SaleSummary,
  TodaySalesMetrics,
} from "@/types/sales";

const POS_PATH = "/retailer/pos";
const SALES_PATH = "/retailer/sales";
const RETAILER_PATH = "/retailer";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function toActionError(error: unknown): ActionResult<never> {
  if (error instanceof AuthError) {
    return { success: false, error: error.message };
  }
  if (error instanceof Error) {
    return { success: false, error: error.message };
  }
  return { success: false, error: "An unexpected error occurred." };
}

function revalidateSalesPaths() {
  revalidatePath(POS_PATH);
  revalidatePath(SALES_PATH);
  revalidatePath(RETAILER_PATH);
}

export async function getRecentSales(): Promise<ActionResult<SaleSummary[]>> {
  try {
    const retailerId = await requireRetailer();
    const { data, error } = await listRecentSales(retailerId);

    if (error) {
      return { success: false, error: error.message };
    }

    const sales = (data ?? [])
      .map(mapSaleRow)
      .filter((sale): sale is SaleSummary => sale !== null);

    return { success: true, data: sales };
  } catch (err) {
    return toActionError(err);
  }
}

export async function getTodaySalesMetrics(): Promise<ActionResult<TodaySalesMetrics>> {
  try {
    const retailerId = await requireRetailer();
    const { data, error } = await getTodaySalesRows(retailerId);

    if (error) {
      return { success: false, error: error.message };
    }

    const rows = data ?? [];
    const todaySalesAmount = rows.reduce((sum, row) => sum + Number(row.total_amount), 0);

    return {
      success: true,
      data: {
        todaySalesAmount: Math.round(todaySalesAmount * 100) / 100,
        todayTransactionCount: rows.length,
      },
    };
  } catch (err) {
    return toActionError(err);
  }
}

export async function getRetailerDashboardData(): Promise<ActionResult<RetailerDashboardData>> {
  try {
    const retailerId = await requireRetailer();

    const [todayResult, weekResult, monthResult, inventoryResult, bestSellingResult, recentSalesResult] = await Promise.all([
      getTodaySalesRows(retailerId),
      getWeekSalesRows(retailerId),
      getMonthSalesRows(retailerId),
      listInventoryByRetailer(retailerId),
      getBestSellingProducts(retailerId, 5),
      listRecentSales(retailerId, 10),
    ]);

    if (todayResult.error) {
      return { success: false, error: todayResult.error.message };
    }
    if (weekResult.error) {
      return { success: false, error: weekResult.error.message };
    }
    if (monthResult.error) {
      return { success: false, error: monthResult.error.message };
    }
    if (inventoryResult.error) {
      return { success: false, error: inventoryResult.error.message };
    }
    if (bestSellingResult.error) {
      return { success: false, error: bestSellingResult.error.message };
    }
    if (recentSalesResult.error) {
      return { success: false, error: recentSalesResult.error.message };
    }

    const todayRows = todayResult.data ?? [];
    const weekRows = weekResult.data ?? [];
    const monthRows = monthResult.data ?? [];
    const inventory = (inventoryResult.data ?? [])
      .map(mapInventoryRow)
      .filter((item): item is InventoryItem => item !== null);
    const bestSelling = bestSellingResult.data ?? [];
    const recentSales = (recentSalesResult.data ?? [])
      .map(mapSaleRow)
      .filter((sale): sale is SaleSummary => sale !== null);

    const lowStockItems = inventory.filter(
      (item) => item.stock_quantity < LOW_STOCK_THRESHOLD
    );

    return {
      success: true,
      data: {
        metrics: {
          todaySalesAmount: Math.round(
            todayRows.reduce((sum, row) => sum + Number(row.total_amount), 0) * 100
          ) / 100,
          weekSalesAmount: Math.round(
            weekRows.reduce((sum, row) => sum + Number(row.total_amount), 0) * 100
          ) / 100,
          monthSalesAmount: Math.round(
            monthRows.reduce((sum, row) => sum + Number(row.total_amount), 0) * 100
          ) / 100,
          todayTransactionCount: todayRows.length,
        },
        lowStockItems,
        bestSellingProducts: bestSelling,
        recentSales,
      },
    };
  } catch (err) {
    return toActionError(err);
  }
}

export async function completeSale(
  input: CheckoutInput
): Promise<ActionResult<CompleteSaleResult>> {
  try {
    const retailerId = await requireRetailer();
    const parsed = parseCheckoutInput(input);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const { data: rpcResponse, error } = await completeSaleTransaction(
      parsed.data.payment_method,
      parsed.data.items
    );

    if (error) {
      const message = error.message.includes("Insufficient stock")
        ? "Insufficient stock for one or more items."
        : error.message;
      return { success: false, error: message };
    }

    if (!rpcResponse || !rpcResponse.success || !rpcResponse.sale_id) {
      return { success: false, error: "Failed to complete sale." };
    }

    const { data: updatedInventory, error: inventoryError } =
      await fetchInventoryAfterSale(retailerId);

    if (inventoryError) {
      return { success: false, error: inventoryError.message };
    }

    revalidateSalesPaths();
    return {
      success: true,
      data: {
        sale_id: rpcResponse.sale_id,
        total_amount: rpcResponse.total_amount,
        updatedInventory: updatedInventory ?? [],
      },
    };
  } catch (err) {
    return toActionError(err);
  }
}
