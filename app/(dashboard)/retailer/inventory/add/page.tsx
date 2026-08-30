import type { Metadata } from "next";
import Link from "next/link";
import {
  getCatalogProducts,
  getRetailerInventory,
} from "@/app/actions/retailer/inventory";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AddInventoryForm } from "@/components/retailer/inventory/add-inventory-form";
import { RETAILER_NAV, RETAILER_ROUTES } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Add stock",
};

export default async function AddInventoryPage() {
  const [inventoryResult, catalogResult] = await Promise.all([
    getRetailerInventory(),
    getCatalogProducts(),
  ]);

  const existingProductIds = inventoryResult.success
    ? inventoryResult.data.map((item) => item.product_id)
    : [];

  const products = catalogResult.success ? catalogResult.data : [];
  const loadError = !catalogResult.success
    ? catalogResult.error
    : !inventoryResult.success
      ? inventoryResult.error
      : null;

  return (
    <DashboardShell
      title="Add stock"
      roleLabel="Retailer"
      navItems={[...RETAILER_NAV]}
    >
      <div className="mb-6">
        <Link
          href={RETAILER_ROUTES.inventory}
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          ← Back to inventory
        </Link>
      </div>
      <AddInventoryForm
        products={products}
        existingProductIds={existingProductIds}
        loadError={loadError}
      />
    </DashboardShell>
  );
}
