import Link from "next/link";
import { LowStockBadge } from "@/components/retailer/inventory/low-stock-badge";
import { RETAILER_ROUTES } from "@/lib/auth/routes";
import { formatCurrency } from "@/lib/utils/format";
import type { InventoryItem } from "@/types/inventory";
import type { TodaySalesMetrics } from "@/types/sales";

interface RetailerDashboardMetricsProps {
  metrics: TodaySalesMetrics;
  lowStockItems: InventoryItem[];
  loadError?: string | null;
}

export function RetailerDashboardMetrics({
  metrics,
  lowStockItems,
  loadError,
}: RetailerDashboardMetricsProps) {
  return (
    <div className="space-y-6">
      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Today&apos;s sales</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(metrics.todaySalesAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Today&apos;s transactions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {metrics.todayTransactionCount}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Low stock</h2>
            <p className="text-xs text-slate-500">Products with fewer than 10 units</p>
          </div>
          <Link
            href={RETAILER_ROUTES.inventory}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            View inventory
          </Link>
        </div>
        {lowStockItems.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No low-stock products right now.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {lowStockItems.slice(0, 8).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{item.product_name}</p>
                  <p className="text-xs text-slate-500">{item.sku}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{item.stock_quantity}</span>
                  <LowStockBadge stockQuantity={item.stock_quantity} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <Link href={RETAILER_ROUTES.pos} className="font-medium text-brand-600 hover:underline">
          Open POS →
        </Link>
        <Link
          href={RETAILER_ROUTES.sales}
          className="font-medium text-brand-600 hover:underline"
        >
          Sales history →
        </Link>
      </div>
    </div>
  );
}
