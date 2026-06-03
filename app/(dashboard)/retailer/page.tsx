import type { Metadata } from "next";
import { getRetailerDashboardData } from "@/app/actions/retailer/sales";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RetailerDashboardMetrics } from "@/components/retailer/dashboard/retailer-dashboard-metrics";
import { RETAILER_NAV } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Retailer",
};

export default async function RetailerDashboardPage() {
  const result = await getRetailerDashboardData();

  if (!result.success) {
    return (
      <DashboardShell
        title="Retailer dashboard"
        roleLabel="Retailer"
        navItems={[...RETAILER_NAV]}
      >
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {result.error}
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Retailer dashboard"
      roleLabel="Retailer"
      navItems={[...RETAILER_NAV]}
    >
      <RetailerDashboardMetrics
        metrics={result.data.metrics}
        lowStockItems={result.data.lowStockItems}
      />
    </DashboardShell>
  );
}
