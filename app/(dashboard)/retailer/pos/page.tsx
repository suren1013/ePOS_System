import type { Metadata } from "next";
import { getRetailerInventory } from "@/app/actions/retailer/inventory";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PosWorkspace } from "@/components/retailer/pos/pos-workspace";
import { RETAILER_NAV } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "POS",
};

export default async function RetailerPosPage() {
  const result = await getRetailerInventory();
  const inventory = result.success ? result.data : [];
  const loadError = result.success ? null : result.error;

  return (
    <DashboardShell title="Point of sale" roleLabel="Retailer" navItems={[...RETAILER_NAV]}>
      <PosWorkspace initialInventory={inventory} loadError={loadError} />
    </DashboardShell>
  );
}
