"use client";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import type { CartLine } from "@/types/sales";

interface CartPanelProps {
  lines: CartLine[];
  subtotal: number;
  total: number;
  onQuantityChange: (inventoryId: string, quantity: number) => void;
  onRemove: (inventoryId: string) => void;
}

export function CartPanel({
  lines,
  subtotal,
  total,
  onQuantityChange,
  onRemove,
}: CartPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Cart</h2>
        <p className="text-xs text-slate-500">
          {lines.length} item{lines.length === 1 ? "" : "s"}
        </p>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-12 text-center text-sm text-slate-500">
          Add products from inventory to start a sale.
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
          {lines.map((line) => (
            <li key={line.inventoryId} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{line.productName}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(line.unitPrice)} each</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-red-600 hover:bg-red-50"
                  onClick={() => onRemove(line.inventoryId)}
                >
                  Remove
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => onQuantityChange(line.inventoryId, line.quantity - 1)}
                    disabled={line.quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    −
                  </Button>
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
                    className="h-8 w-14 rounded-lg border border-slate-300 text-center text-sm"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 w-8 px-0"
                    onClick={() => onQuantityChange(line.inventoryId, line.quantity + 1)}
                    disabled={line.quantity >= line.maxStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </Button>
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {formatCurrency(line.unitPrice * line.quantity)}
                </span>
              </div>
              {line.quantity >= line.maxStock && (
                <p className="mt-1 text-xs text-amber-700">Max available: {line.maxStock}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-slate-100 px-4 py-4 space-y-2">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
