"use server";

import { revalidatePath } from "next/cache";
import { AuthError, requireWholesaler } from "@/lib/auth/require-wholesaler";
import {
  deleteProductRow,
  insertProductRow,
  listProductsByWholesaler,
  mapProductRow,
  updateProductRow,
} from "@/lib/data/products";
import { parseProductForm } from "@/lib/validators/product";
import type { Product, ProductFormInput } from "@/types/product";

const PRODUCTS_PATH = "/wholesaler/products";

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

export async function getWholesalerProducts(): Promise<ActionResult<Product[]>> {
  try {
    const wholesalerId = await requireWholesaler();
    const { data, error } = await listProductsByWholesaler(wholesalerId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data ?? [] };
  } catch (err) {
    return toActionError(err);
  }
}

export async function createProduct(
  input: ProductFormInput
): Promise<ActionResult<Product>> {
  try {
    const wholesalerId = await requireWholesaler();
    const parsed = parseProductForm(input);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const { data, error } = await insertProductRow({
      wholesaler_id: wholesalerId,
      ...parsed.data,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const product = mapProductRow(data);
    if (!product) {
      return { success: false, error: "Failed to create product." };
    }

    revalidatePath(PRODUCTS_PATH);
    return { success: true, data: product };
  } catch (err) {
    return toActionError(err);
  }
}

export async function updateProduct(
  productId: string,
  input: ProductFormInput
): Promise<ActionResult<Product>> {
  try {
    const wholesalerId = await requireWholesaler();
    const parsed = parseProductForm(input);
    if ("error" in parsed) {
      return { success: false, error: parsed.error };
    }

    const { data, error } = await updateProductRow(productId, wholesalerId, parsed.data);

    if (error) {
      return { success: false, error: error.message };
    }

    const product = mapProductRow(data);
    if (!product) {
      return { success: false, error: "Product not found." };
    }

    revalidatePath(PRODUCTS_PATH);
    return { success: true, data: product };
  } catch (err) {
    return toActionError(err);
  }
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    const wholesalerId = await requireWholesaler();
    const { error } = await deleteProductRow(productId, wholesalerId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(PRODUCTS_PATH);
    return { success: true, data: undefined };
  } catch (err) {
    return toActionError(err);
  }
}
