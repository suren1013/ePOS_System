import type { InventoryItem } from "@/types/inventory";

export type InventorySort = "stock-asc" | "stock-desc" | "name-asc";

export function filterAndSortInventory(
  items: InventoryItem[],
  options: {
    nameQuery: string;
    barcodeQuery: string;
    sort: InventorySort;
  }
): InventoryItem[] {
  const nameQ = options.nameQuery.trim().toLowerCase();
  const barcodeQ = options.barcodeQuery.trim().toLowerCase();

  let result = items;

  if (nameQ) {
    result = result.filter((item) => item.product_name.toLowerCase().includes(nameQ));
  }

  if (barcodeQ) {
    result = result.filter((item) => (item.barcode ?? "").toLowerCase().includes(barcodeQ));
  }

  const sorted = [...result];
  switch (options.sort) {
    case "stock-desc":
      sorted.sort((a, b) => b.stock_quantity - a.stock_quantity);
      break;
    case "name-asc":
      sorted.sort((a, b) => a.product_name.localeCompare(b.product_name));
      break;
    case "stock-asc":
    default:
      sorted.sort((a, b) => a.stock_quantity - b.stock_quantity);
      break;
  }

  return sorted;
}
