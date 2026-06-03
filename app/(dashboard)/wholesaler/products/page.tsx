import type { Metadata } from "next";
import { getWholesalerProducts } from "@/app/actions/wholesaler/products";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProductsManager } from "@/components/wholesaler/products/products-manager";
import { WHOLESALER_NAV } from "@/lib/auth/routes";

export const metadata: Metadata = {
  title: "Products",
};

export default async function WholesalerProductsPage() {
  const result = await getWholesalerProducts();
  const products = result.success ? result.data : [];
  const loadError = result.success ? null : result.error;

  return (
    <DashboardShell
      title="Product catalog"
      roleLabel="Wholesaler"
      navItems={[...WHOLESALER_NAV]}
    >
      <ProductsManager initialProducts={products} loadError={loadError} />
    </DashboardShell>
  );
}
