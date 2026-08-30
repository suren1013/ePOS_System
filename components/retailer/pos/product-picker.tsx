"use client";

import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/format";
import type { InventoryItem } from "@/types/inventory";

interface ProductPickerProps {
  items: InventoryItem[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onAddToCart: (item: InventoryItem) => void;
}

export function ProductPicker({
  items,
  searchQuery,
  onSearchChange,
  onAddToCart,
}: ProductPickerProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Products</h2>
        <p className="mt-1 text-xs text-slate-500">Search by name, SKU, or barcode</p>
        <div className="mt-3">
          <Input
            name="posSearch"
            placeholder="Search inventory…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
        {items.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-slate-500">
            No in-stock products match your search.
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onAddToCart(item)}
                className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-brand-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{item.product_name}</p>
                  <p className="text-xs text-slate-500">
                    {item.sku}
                    {item.barcode ? ` · ${item.barcode}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Stock: {item.stock_quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-slate-900">
                  {formatCurrency(item.retail_price)}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
