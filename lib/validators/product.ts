import type { ProductFormInput } from "@/types/product";

export interface ParsedProductInput {
  sku: string;
  barcode: string | null;
  name: string;
  wholesale_price: number;
  suggested_retail_price: number | null;
}

export function parseProductForm(
  input: ProductFormInput
): { data: ParsedProductInput } | { error: string } {
  const sku = input.sku.trim();
  const name = input.name.trim();
  const barcode = input.barcode.trim();

  if (!sku) return { error: "SKU is required." };
  if (!name) return { error: "Product name is required." };

  const wholesalePrice = parsePrice(input.wholesale_price, "Wholesale price");
  if ("error" in wholesalePrice) return wholesalePrice;

  let suggestedRetailPrice: number | null = null;
  if (input.suggested_retail_price.trim()) {
    const parsed = parsePrice(input.suggested_retail_price, "Suggested retail price");
    if ("error" in parsed) return parsed;
    suggestedRetailPrice = parsed.value;
  }

  return {
    data: {
      sku,
      barcode: barcode || null,
      name,
      wholesale_price: wholesalePrice.value,
      suggested_retail_price: suggestedRetailPrice,
    },
  };
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
