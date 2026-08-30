"use client";

import { useState, useTransition } from "react";
import { removeInventory } from "@/app/actions/retailer/inventory";
import { Dialog } from "@/components/ui/dialog";
import type { InventoryItem } from "@/types/inventory";

interface RemoveStockDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RemoveStockDialog({ item, open, onClose, onSuccess }: RemoveStockDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (isPending) return;
    setError(null);
    onClose();
  }

  function handleConfirm() {
    if (!item) return;
    setError(null);

    startTransition(async () => {
      const result = await removeInventory(item.id);
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
      title="Remove from inventory"
      description={
        item
          ? `Remove "${item.product_name}" from your inventory? This does not delete the product from the catalog.`
          : undefined
      }
      confirmLabel="Remove"
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
