"use client";

import { Input } from "@/components/ui/input";
import type { InventorySort } from "@/lib/utils/inventory-filters";

interface InventoryFiltersProps {
  nameQuery: string;
  barcodeQuery: string;
  sort: InventorySort;
  onNameQueryChange: (value: string) => void;
  onBarcodeQueryChange: (value: string) => void;
  onSortChange: (value: InventorySort) => void;
  resultCount: number;
  totalCount: number;
}

const SORT_OPTIONS: { value: InventorySort; label: string }[] = [
  { value: "stock-asc", label: "Stock (low to high)" },
  { value: "stock-desc", label: "Stock (high to low)" },
  { value: "name-asc", label: "Name (A–Z)" },
];

export function InventoryFilters({
  nameQuery,
  barcodeQuery,
  sort,
  onNameQueryChange,
  onBarcodeQueryChange,
  onSortChange,
  resultCount,
  totalCount,
}: InventoryFiltersProps) {
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Search by name"
          name="nameSearch"
          placeholder="Product name…"
          value={nameQuery}
          onChange={(e) => onNameQueryChange(e.target.value)}
        />
        <Input
          label="Search by barcode"
          name="barcodeSearch"
          placeholder="Barcode…"
          value={barcodeQuery}
          onChange={(e) => onBarcodeQueryChange(e.target.value)}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="inventorySort" className="text-sm font-medium text-slate-700">
            Sort by stock
          </label>
          <select
            id="inventorySort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as InventorySort)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-sm text-slate-500">
        Showing {resultCount} of {totalCount} item{totalCount === 1 ? "" : "s"}
      </p>
    </div>
  );
}
