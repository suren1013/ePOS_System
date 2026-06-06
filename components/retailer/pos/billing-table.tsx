"use client";

import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { calculateLineTotal } from "@/lib/utils/cart";
import type { CartLine } from "@/types/sales";

interface BillingTableProps {
  lines: CartLine[];
  selectedLineIndex: number | null;
  onQuantityChange: (inventoryId: string, quantity: number) => void;
  onDiscountChange: (inventoryId: string, discount: number) => void;
  onTaxChange: (inventoryId: string, tax: number) => void;
  onRemove: (inventoryId: string) => void;
  onSelectLine: (index: number) => void;
}

export function BillingTable({
  lines,
  selectedLineIndex,
  onQuantityChange,
  onDiscountChange,
  onTaxChange,
  onRemove,
  onSelectLine,
}: BillingTableProps) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lines.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const nextIndex = selectedLineIndex === null
          ? 0
          : Math.min(selectedLineIndex + 1, lines.length - 1);
        onSelectLine(nextIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prevIndex = selectedLineIndex === null
          ? 0
          : Math.max(selectedLineIndex - 1, 0);
        onSelectLine(prevIndex);
      } else if (e.key === "Delete" && selectedLineIndex !== null) {
        e.preventDefault();
        onRemove(lines[selectedLineIndex].inventoryId);
        onSelectLine(Math.max(selectedLineIndex - 1, 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lines, selectedLineIndex, onRemove, onSelectLine]);

  if (lines.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Add products to start billing
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <table
        ref={tableRef}
        className="w-full border-collapse text-sm"
      >
        <thead className="sticky top-0 bg-slate-50">
          <tr className="border-b border-slate-200">
            <th className="px-3 py-2 text-left font-semibold text-slate-700">Item Name</th>
            <th className="px-3 py-2 text-left font-semibold text-slate-700">SKU</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700 w-20">Qty</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700 w-24">Price</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700 w-24">Discount</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700 w-24">Tax</th>
            <th className="px-3 py-2 text-right font-semibold text-slate-700 w-28">Line Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => {
            const lineTotal = calculateLineTotal(line);
            const isSelected = selectedLineIndex === index;

            return (
              <tr
                key={line.inventoryId}
                className={`border-b border-slate-100 transition-colors ${
                  isSelected ? "bg-brand-50" : "hover:bg-slate-50"
                }`}
                onClick={() => onSelectLine(index)}
              >
                <td className="px-3 py-2 font-medium text-slate-900">{line.productName}</td>
                <td className="px-3 py-2 text-slate-600">{line.sku}</td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min={1}
                    max={line.maxStock}
                    value={line.quantity}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (!Number.isNaN(next)) {
                        onQuantityChange(line.inventoryId, next);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-16 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </td>
                <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(line.unitPrice)}</td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={line.discount || 0}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (!Number.isNaN(next)) {
                        onDiscountChange(line.inventoryId, next);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={line.tax || 0}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (!Number.isNaN(next)) {
                        onTaxChange(line.inventoryId, next);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </td>
                <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatCurrency(lineTotal)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
