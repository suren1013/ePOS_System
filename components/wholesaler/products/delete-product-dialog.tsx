"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/app/actions/wholesaler/products";
import { Dialog } from "@/components/ui/dialog";
import type { Product } from "@/types/product";

interface DeleteProductDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteProductDialog({
  product,
  open,
  onClose,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (isPending) return;
    setError(null);
    onClose();
  }

  function handleConfirm() {
    if (!product) return;
    setError(null);

    startTransition(async () => {
      const result = await deleteProduct(product.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess();
      handleClose();
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Delete product"
      description={
        product
          ? `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
          : undefined
      }
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={handleConfirm}
      loading={isPending}
      variant="danger"
    >
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}
