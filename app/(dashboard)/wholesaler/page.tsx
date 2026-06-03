import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { WHOLESALER_NAV, WHOLESALER_ROUTES } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Wholesaler",
};

export default function WholesalerDashboardPage() {
  return (
    <DashboardShell
      title="Wholesaler dashboard"
      roleLabel="Wholesaler"
      navItems={[...WHOLESALER_NAV]}
    >
      <DashboardPlaceholder
        heading="Wholesaler workspace"
        description="Manage your product catalog from the Products section."
      />
      <p className="mt-4 text-center text-sm">
        <Link
          href={WHOLESALER_ROUTES.products}
          className="font-medium text-brand-600 hover:underline"
        >
          Go to Products →
        </Link>
      </p>
    </DashboardShell>
  );
}
