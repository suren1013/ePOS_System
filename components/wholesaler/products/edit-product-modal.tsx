"use client";

import { useEffect, useState, useTransition } from "react";
import { updateProduct } from "@/app/actions/wholesaler/products";
import { ProductFormFields } from "@/components/wholesaler/products/product-form-fields";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { productToFormInput, type Product, type ProductFormInput } from "@/types/product";

interface EditProductModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({ product, open, onClose, onSuccess }: EditProductModalProps) {
  const [values, setValues] = useState<ProductFormInput | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (product && open) {
      setValues(productToFormInput(product));
      setFormError(null);
    }
  }, [product, open]);

  function handleChange(field: keyof ProductFormInput, value: string) {
    setValues((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function handleClose() {
    if (isPending) return;
    setFormError(null);
    onClose();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!product || !values) return;
    setFormError(null);

    startTransition(async () => {
      const result = await updateProduct(product.id, values);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      onSuccess();
      onClose();
    });
  }

  if (!values) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Edit product"
      description={`Update details for ${product?.name ?? "product"}.`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <ProductFormFields
          values={values}
          onChange={handleChange}
          disabled={isPending}
          formError={formError}
        />
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
