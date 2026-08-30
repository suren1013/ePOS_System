"use client";

import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils/format";
import type { InventoryItem } from "@/types/inventory";

interface SearchDropdownProps {
  items: InventoryItem[];
  searchQuery: string;
  isOpen: boolean;
  selectedIndex: number | null;
  onSelect: (item: InventoryItem) => void;
  onClose: () => void;
  onNavigate: (direction: 'up' | 'down') => void;
}

export function SearchDropdown({
  items,
  searchQuery,
  isOpen,
  selectedIndex,
  onSelect,
  onClose,
  onNavigate,
}: SearchDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !searchQuery.trim()) {
    return null;
  }

  console.log("SearchDropdown - searchQuery:", searchQuery);
  console.log("SearchDropdown - items:", items);

  if (items.length === 0) {
    return (
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg max-h-96 overflow-auto"
      >
        <div className="px-4 py-3 text-sm text-slate-500">
          No products found
        </div>
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white shadow-lg max-h-96 overflow-auto"
    >
      {items.map((item, index) => {
        const isSelected = selectedIndex === index;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              console.log("SearchDropdown - selected item:", item);
              onSelect(item);
            }}
            className={`w-full px-4 py-3 text-left transition-colors ${
              isSelected ? "bg-brand-50" : "hover:bg-slate-50"
            }`}
          >
            <div className="font-medium text-slate-900">{item.product_name}</div>
            <div className="mt-1 text-xs text-slate-500 space-y-0.5">
              <div>SKU: {item.sku}</div>
              {item.barcode && <div>Barcode: {item.barcode}</div>}
              <div>Stock: {item.stock_quantity}</div>
              <div className="font-semibold text-brand-600">
                {formatCurrency(item.retail_price)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
