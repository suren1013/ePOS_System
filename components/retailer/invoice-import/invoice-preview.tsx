"use client";

import { formatCurrency } from "@/lib/utils/format";
import type { ExtractedInvoiceItem } from "@/app/actions/retailer/invoice-import";

interface InvoicePreviewProps {
  items: ExtractedInvoiceItem[];
  onEditItem: (index: number, item: ExtractedInvoiceItem) => void;
  onRemoveItem: (index: number) => void;
}

export function InvoicePreview({ items, onEditItem, onRemoveItem }: InvoicePreviewProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-slate-500">
        No items extracted from invoice
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Product Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Barcode
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Purchase Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Line Total
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-sm font-medium text-slate-900">
                {item.productName}
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{item.sku}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{item.barcode}</td>
              <td className="px-4 py-3 text-sm text-slate-900 text-right">{item.quantity}</td>
              <td className="px-4 py-3 text-sm text-slate-900 text-right">
                {formatCurrency(item.purchasePrice)}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                {formatCurrency(item.quantity * item.purchasePrice)}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={() => onRemoveItem(index)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-slate-200">
            <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
              Total:
            </td>
            <td className="px-4 py-3 text-right text-lg font-bold text-brand-600">
              {formatCurrency(
                items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0)
              )}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
