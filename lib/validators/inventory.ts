import type { AddInventoryFormInput, UpdateStockFormInput } from "@/types/inventory";

export interface ParsedAddInventoryInput {
  product_id: string;
  stock_quantity: number;
  retail_price: number;
}

export function parseAddInventoryForm(
  input: AddInventoryFormInput
): { data: ParsedAddInventoryInput } | { error: string } {
  const productId = input.product_id.trim();
  if (!productId) return { error: "Select a product." };

  const quantity = parseQuantity(input.stock_quantity, "Quantity");
  if ("error" in quantity) return quantity;
  if (quantity.value < 1) {
    return { error: "Quantity must be at least 1 when adding stock." };
  }

  const retailPrice = parsePrice(input.retail_price, "Retail price");
  if ("error" in retailPrice) return retailPrice;

  return {
    data: {
      product_id: productId,
      stock_quantity: quantity.value,
      retail_price: retailPrice.value,
    },
  };
}

export function parseUpdateStockForm(
  input: UpdateStockFormInput
): { data: { stock_quantity: number } } | { error: string } {
  const quantity = parseQuantity(input.stock_quantity, "Stock quantity");
  if ("error" in quantity) return quantity;

  return { data: { stock_quantity: quantity.value } };
}

function parseQuantity(
  raw: string,
  label: string
): { value: number } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: `${label} is required.` };

  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 0) {
    return { error: `${label} must be a whole number of 0 or greater.` };
  }

  return { value };
}

function parsePrice(
  raw: string,
  label: string
): { value: number } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: `${label} is required.` };

  const value = Number(trimmed);
  if (Number.isNaN(value) || value < 0) {
    return { error: `${label} must be a valid non-negative number.` };
  }

  return { value: Math.round(value * 100) / 100 };
}
