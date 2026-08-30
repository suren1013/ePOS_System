import type { InventoryItem } from "@/types/inventory";

export function filterInventoryForPos(
  items: InventoryItem[],
  query: string
): InventoryItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items.filter((item) => item.stock_quantity > 0);

  return items.filter((item) => {
    if (item.stock_quantity <= 0) return false;
    const nameMatch = item.product_name.toLowerCase().includes(q);
    const barcodeMatch = (item.barcode ?? "").toLowerCase().includes(q);
    const skuMatch = item.sku.toLowerCase().includes(q);
    return nameMatch || barcodeMatch || skuMatch;
  });
}
