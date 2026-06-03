import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DASHBOARD_ROUTES } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Retailer",
};

export default function RetailerDashboardPage() {
  return (
    <DashboardShell
      title="Retailer dashboard"
      roleLabel="Retailer"
      navItems={[{ label: "Overview", href: DASHBOARD_ROUTES.retailer }]}
    >
      <DashboardPlaceholder heading="Retailer workspace" />
    </DashboardShell>
  );
}
