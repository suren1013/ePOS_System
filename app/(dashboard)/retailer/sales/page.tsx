import type { Metadata } from "next";
import Link from "next/link";
import { getRecentSales } from "@/app/actions/retailer/sales";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SalesHistoryTable } from "@/components/retailer/sales/sales-history-table";
import { RETAILER_NAV, RETAILER_ROUTES } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Sales",
};

export default async function RetailerSalesPage() {
  const result = await getRecentSales();
  const sales = result.success ? result.data : [];
  const loadError = result.success ? null : result.error;

  return (
    <DashboardShell title="Sales history" roleLabel="Retailer" navItems={[...RETAILER_NAV]}>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {sales.length} recent sale{sales.length === 1 ? "" : "s"}
        </p>
        <Link
          href={RETAILER_ROUTES.pos}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          New sale →
        </Link>
      </div>
      {loadError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}
      <SalesHistoryTable sales={sales} />
    </DashboardShell>
  );
}
