import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardPlaceholder } from "@/components/dashboard/dashboard-placeholder";
import { DASHBOARD_ROUTES } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminDashboardPage() {
  return (
    <DashboardShell
      title="Admin dashboard"
      roleLabel="Administrator"
      navItems={[{ label: "Overview", href: DASHBOARD_ROUTES.admin }]}
    >
      <DashboardPlaceholder heading="Admin workspace" />
    </DashboardShell>
  );
}
