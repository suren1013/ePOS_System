import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { RETAILER_NAV, RETAILER_ROUTES } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Retailer",
};

export default function RetailerDashboardPage() {
  return (
    <DashboardShell
      title="Retailer dashboard"
      roleLabel="Retailer"
      navItems={[...RETAILER_NAV]}
    >
      <DashboardPlaceholder
        heading="Retailer workspace"
        description="Track stock levels and retail pricing from the Inventory section."
      />
      <p className="mt-4 text-center text-sm">
        <Link
          href={RETAILER_ROUTES.inventory}
          className="font-medium text-brand-600 hover:underline"
        >
          Go to Inventory →
        </Link>
      </p>
    </DashboardShell>
  );
}
