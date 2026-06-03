import type { Metadata } from "next";
import { getRetailerInventory } from "@/app/actions/retailer/inventory";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { InventoryManager } from "@/components/retailer/inventory/inventory-manager";
import { RETAILER_NAV } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Inventory",
};

export default async function RetailerInventoryPage() {
  const result = await getRetailerInventory();
  const items = result.success ? result.data : [];
  const loadError = result.success ? null : result.error;

  return (
    <DashboardShell
      title="Inventory"
      roleLabel="Retailer"
      navItems={[...RETAILER_NAV]}
    >
      <InventoryManager initialItems={items} loadError={loadError} />
    </DashboardShell>
  );
}
