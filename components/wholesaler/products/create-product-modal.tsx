"use client";

import { useState, useTransition } from "react";
import { createProduct } from "@/app/actions/wholesaler/products";
import { ProductFormFields } from "@/components/wholesaler/products/product-form-fields";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { emptyProductForm, type ProductFormInput } from "@/types/product";

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProductModal({ open, onClose, onSuccess }: CreateProductModalProps) {
  const [values, setValues] = useState<ProductFormInput>(emptyProductForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(field: keyof ProductFormInput, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleClose() {
    if (isPending) return;
    setValues(emptyProductForm);
    setFormError(null);
    onClose();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);

    startTransition(async () => {
      const result = await createProduct(values);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setValues(emptyProductForm);
      onSuccess();
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add product"
      description="Create a new product for your catalog. Wholesaler ID is assigned automatically."
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
            Create product
          </Button>
        </div>
      </form>
    </Modal>
  );
}
