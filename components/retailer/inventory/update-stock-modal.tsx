"use client";

import { useEffect, useState, useTransition } from "react";
import { updateInventoryStock } from "@/app/actions/retailer/inventory";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { InventoryItem, UpdateStockFormInput } from "@/types/inventory";

interface UpdateStockModalProps {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateStockModal({ item, open, onClose, onSuccess }: UpdateStockModalProps) {
  const [values, setValues] = useState<UpdateStockFormInput>({ stock_quantity: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (item) {
      setValues({ stock_quantity: String(item.stock_quantity) });
      setFormError(null);
    }
  }, [item]);

  function handleClose() {
    if (isPending) return;
    setFormError(null);
    onClose();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!item) return;
    setFormError(null);

    startTransition(async () => {
      const result = await updateInventoryStock(item.id, values);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      onSuccess();
      handleClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Update stock"
      description={
        item ? `Set the current stock quantity for "${item.product_name}".` : undefined
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Current stock"
          name="stock_quantity"
          type="number"
          min={0}
          step={1}
          value={values.stock_quantity}
          onChange={(e) => setValues({ stock_quantity: e.target.value })}
          disabled={isPending || !item}
          required
        />
        {formError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {formError}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={isPending} disabled={!item}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
