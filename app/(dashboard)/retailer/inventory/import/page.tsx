import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { InvoiceImportWorkspace } from "@/components/retailer/invoice-import/invoice-import-workspace";
import { RETAILER_NAV } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Import Invoice",
};

export default function InvoiceImportPage() {
  return (
    <DashboardShell
      title="Import Invoice"
      roleLabel="Retailer"
      navItems={[...RETAILER_NAV]}
    >
      <InvoiceImportWorkspace />
    </DashboardShell>
  );
}
