"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreateProductModal } from "@/components/wholesaler/products/create-product-modal";
import { DeleteProductDialog } from "@/components/wholesaler/products/delete-product-dialog";
import { EditProductModal } from "@/components/wholesaler/products/edit-product-modal";
import { ProductTable } from "@/components/wholesaler/products/product-table";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product";

interface ProductsManagerProps {
  initialProducts: Product[];
  loadError?: string | null;
}

export function ProductsManager({ initialProducts, loadError }: ProductsManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleSuccess = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {products.length} product{products.length === 1 ? "" : "s"} in your catalog
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)}>
          Add product
        </Button>
      </div>

      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      <ProductTable
        products={products}
        onEdit={(product) => setEditProduct(product)}
        onDelete={(product) => setDeleteProduct(product)}
      />

      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={handleSuccess}
      />

      <EditProductModal
        product={editProduct}
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        onSuccess={handleSuccess}
      />

      <DeleteProductDialog
        product={deleteProduct}
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
