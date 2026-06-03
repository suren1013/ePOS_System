"use client";

import { Button } from "@/components/ui/button";
import { LowStockBadge } from "@/components/retailer/inventory/low-stock-badge";
import { formatCurrency } from "@/lib/utils/format";
import type { InventoryItem } from "@/types/inventory";

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateStock: (item: InventoryItem) => void;
  onRemove: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onUpdateStock, onRemove }: InventoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-900">No inventory items</p>
        <p className="mt-1 text-sm text-slate-500">
          Add stock from the catalog to start tracking inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">SKU</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Barcode</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Stock</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Retail price</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{item.product_name}</span>
                    <LowStockBadge stockQuantity={item.stock_quantity} />
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.sku}</td>
                <td className="px-4 py-3 text-slate-600">{item.barcode ?? "—"}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {item.stock_quantity}
                </td>
                <td className="px-4 py-3 text-right text-slate-900">
                  {formatCurrency(item.retail_price)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateStock(item)}
                    >
                      Update stock
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => onRemove(item)}
                    >
                      Remove
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
