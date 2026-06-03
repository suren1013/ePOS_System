"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addInventory } from "@/app/actions/retailer/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RETAILER_ROUTES } from "@/lib/auth/routes";
import { formatCurrency } from "@/lib/utils/format";
import {
  emptyAddInventoryForm,
  type AddInventoryFormInput,
  type InventoryProductSummary,
} from "@/types/inventory";

interface AddInventoryFormProps {
  products: InventoryProductSummary[];
  existingProductIds: string[];
  loadError?: string | null;
}

export function AddInventoryForm({
  products,
  existingProductIds,
  loadError,
}: AddInventoryFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<AddInventoryFormInput>(emptyAddInventoryForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const existingSet = useMemo(() => new Set(existingProductIds), [existingProductIds]);

  const availableProducts = useMemo(
    () => products.filter((p) => !existingSet.has(p.id)),
    [products, existingSet]
  );

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === values.product_id),
    [products, values.product_id]
  );

  function handleProductChange(productId: string) {
    const product = products.find((p) => p.id === productId);
    setValues((prev) => ({
      ...prev,
      product_id: productId,
      retail_price:
        prev.retail_price ||
        (product?.suggested_retail_price != null
          ? String(product.suggested_retail_price)
          : ""),
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const result = await addInventory(values);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      router.push(RETAILER_ROUTES.inventory);
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {(loadError || formError) && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {formError ?? loadError}
          </p>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="product_id" className="text-sm font-medium text-slate-700">
            Product
          </label>
          <select
            id="product_id"
            name="product_id"
            required
            disabled={isPending || availableProducts.length === 0}
            value={values.product_id}
            onChange={(e) => handleProductChange(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="">Select a product…</option>
            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
          {availableProducts.length === 0 && (
            <p className="text-sm text-slate-500">
              All catalog products are already in your inventory, or the catalog is empty.
            </p>
          )}
          {selectedProduct?.suggested_retail_price != null && (
            <p className="text-xs text-slate-500">
              Suggested retail: {formatCurrency(selectedProduct.suggested_retail_price)}
            </p>
          )}
        </div>

        <Input
          label="Quantity"
          name="stock_quantity"
          type="number"
          min={0}
          step={1}
          value={values.stock_quantity}
          onChange={(e) => setValues((prev) => ({ ...prev, stock_quantity: e.target.value }))}
          disabled={isPending}
          required
        />

        <Input
          label="Retail price"
          name="retail_price"
          type="number"
          min={0}
          step="0.01"
          value={values.retail_price}
          onChange={(e) => setValues((prev) => ({ ...prev, retail_price: e.target.value }))}
          disabled={isPending}
          required
        />

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Link
            href={RETAILER_ROUTES.inventory}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-900 hover:bg-slate-200"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            loading={isPending}
            disabled={availableProducts.length === 0}
          >
            Add to inventory
          </Button>
        </div>
      </form>
    </div>
  );
}
