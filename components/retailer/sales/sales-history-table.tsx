"use client";

import { formatCurrency, formatDateTime, formatPaymentMethod } from "@/lib/utils/format";
import type { SaleSummary } from "@/types/sales";

interface SalesHistoryTableProps {
  sales: SaleSummary[];
}

export function SalesHistoryTable({ sales }: SalesHistoryTableProps) {
  if (sales.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-900">No sales yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Completed checkouts will appear here.
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
              <th className="px-4 py-3 text-left font-medium text-slate-600">Date & time</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Payment</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3 text-slate-900">{formatDateTime(sale.created_at)}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatPaymentMethod(sale.payment_method)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {sale.status}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-900">
                  {formatCurrency(sale.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
