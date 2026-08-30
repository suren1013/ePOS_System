"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "@/lib/auth/require-wholesaler";
import { requireRetailer } from "@/lib/auth/require-retailer";
import {
  deleteInventoryRow,
  insertInventoryRow,
  isUniqueViolation,
  listCatalogProducts,
  listInventoryByRetailer,
  mapInventoryRow,
  updateInventoryRow,
} from "@/lib/data/inventory";
import { parseAddInventoryForm, parseUpdateStockForm } from "@/lib/validators/inventory";
import type {
  AddInventoryFormInput,
  InventoryItem,
  InventoryProductSummary,
  UpdateStockFormInput,
} from "@/types/inventory";

const INVENTORY_PATH = "/retailer/inventory";
const INVENTORY_ADD_PATH = "/retailer/inventory/add";

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

function revalidateInventory() {
  revalidatePath(INVENTORY_PATH);
  revalidatePath(INVENTORY_ADD_PATH);
}

export async function getRetailerInventory(): Promise<ActionResult<InventoryItem[]>> {
  try {
    const retailerId = await requireRetailer();
    const { data, error } = await listInventoryByRetailer(retailerId);

    if (error) {
      return { success: false, error: error.message };
    }

    const items = (data ?? [])
      .map(mapInventoryRow)
      .filter((item): item is InventoryItem => item !== null);

    return { success: true, data: items };
  } catch (err) {
    return toActionError(err);
  }
}

export async function getCatalogProducts(): Promise<ActionResult<InventoryProductSummary[]>> {
  try {
    await requireRetailer();
    const { data, error } = await listCatalogProducts();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
  } catch (err) {
    return toActionError(err);
  }
}

export async function addInventory(
  input: AddInventoryFormInput
): Promise<ActionResult<InventoryItem>> {
  try {
    const retailerId = await requireRetailer();
    const parsed = parseAddInventoryForm(input);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const { data, error } = await insertInventoryRow({
      retailer_id: retailerId,
      product_id: parsed.data.product_id,
      stock_quantity: parsed.data.stock_quantity,
      retail_price: parsed.data.retail_price,
    });

    if (error) {
      if (isUniqueViolation(error)) {
        return {
          success: false,
          error: "This product is already in your inventory. Update the quantity instead.",
        };
      }
      return { success: false, error: error.message };
    }

    const item = mapInventoryRow(data);
    if (!item) {
      return { success: false, error: "Failed to add inventory." };
    }

    revalidateInventory();
    return { success: true, data: item };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateInventoryStock(
  inventoryId: string,
  input: UpdateStockFormInput
): Promise<ActionResult<InventoryItem>> {
  try {
    const retailerId = await requireRetailer();
    const parsed = parseUpdateStockForm(input);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const { data, error } = await updateInventoryRow(inventoryId, retailerId, {
      stock_quantity: parsed.data.stock_quantity,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const item = mapInventoryRow(data);
    if (!item) {
      return { success: false, error: "Inventory item not found." };
    }

    revalidateInventory();
    return { success: true, data: item };
  } catch (err) {
    return toActionError(err);
  }
}

export async function removeInventory(inventoryId: string): Promise<ActionResult> {
  try {
    const retailerId = await requireRetailer();
    const { error } = await deleteInventoryRow(inventoryId, retailerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidateInventory();
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
