"use client";

import { formatCurrency } from "@/lib/utils/format";

interface TotalsPanelProps {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  billDiscount: number;
  onBillDiscountChange: (discount: number) => void;
}

export function TotalsPanel({
  subtotal,
  discount,
  tax,
  total,
  billDiscount,
  onBillDiscountChange,
}: TotalsPanelProps) {
  return (
    <div className="flex items-center gap-6 rounded-lg border border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Subtotal</span>
        <span className="text-lg font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Item Discount</span>
        <span className="text-lg font-semibold text-green-600">{formatCurrency(discount)}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Bill Discount</span>
        <input
          type="number"
          min={0}
          step={0.01}
          value={billDiscount}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) {
              onBillDiscountChange(next);
            }
          }}
          className="w-24 rounded border border-slate-300 px-2 py-1 text-right text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">Tax</span>
        <span className="text-lg font-semibold text-slate-600">{formatCurrency(tax)}</span>
      </div>

      <div className="ml-auto flex flex-col gap-1">
        <span className="text-xs text-slate-500">Grand Total</span>
        <span className="text-2xl font-bold text-brand-600">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
