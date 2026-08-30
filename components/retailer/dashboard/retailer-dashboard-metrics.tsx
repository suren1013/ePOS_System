import Link from "next/link";
import { LowStockBadge } from "@/components/retailer/inventory/low-stock-badge";
import { RETAILER_ROUTES } from "@/lib/auth/routes";
import { formatCurrency } from "@/lib/utils/format";
import type { InventoryItem } from "@/types/inventory";
import type { BestSellingProduct, SaleSummary, ExtendedSalesMetrics } from "@/types/sales";
import { Button } from "@/components/ui/button";

interface RetailerDashboardMetricsProps {
  metrics: ExtendedSalesMetrics;
  lowStockItems: InventoryItem[];
  bestSellingProducts: BestSellingProduct[];
  recentSales: SaleSummary[];
  loadError?: string | null;
}

export function RetailerDashboardMetrics({
  metrics,
  lowStockItems,
  bestSellingProducts,
  recentSales,
  loadError,
}: RetailerDashboardMetricsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      {/* Sales Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sales Today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(metrics.todaySalesAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sales This Week</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(metrics.weekSalesAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Sales This Month</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatCurrency(metrics.monthSalesAmount)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Transactions Today</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {metrics.todayTransactionCount}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Import Supplier Invoice</h2>
            <p className="mt-1 text-xs text-slate-500">
              Upload supplier bills and automatically update inventory using AI extraction.
            </p>
          </div>
          <Link href={RETAILER_ROUTES.inventoryImport}>
            <Button variant="primary" size="sm">
              Import Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Best Selling Products */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Best Selling Products</h2>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </div>
          </div>
          {bestSellingProducts.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-500">
              No sales data available yet.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {bestSellingProducts.map((product, index) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{product.productName}</p>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900">{product.totalSold} sold</p>
                    <p className="text-xs text-slate-500">{formatCurrency(product.totalRevenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Low Stock</h2>
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
              {lowStockItems.slice(0, 5).map((item) => (
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
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent Activity</h2>
            <p className="text-xs text-slate-500">Latest sales transactions</p>
          </div>
          <Link
            href={RETAILER_ROUTES.sales}
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            View all sales
          </Link>
        </div>
        {recentSales.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No recent sales activity.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentSales.map((sale) => (
              <li
                key={sale.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      Sale completed
                    </p>
                    <p className="text-xs text-slate-500">
                      {sale.payment_method === "card" ? "Card" : "Cash"} • {formatDate(sale.created_at)}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-slate-900">
                  {formatCurrency(sale.total_amount)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick Links */}
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
        <Link
          href={RETAILER_ROUTES.inventory}
          className="font-medium text-brand-600 hover:underline"
        >
          Manage inventory →
        </Link>
      </div>
    </div>
  );
}
