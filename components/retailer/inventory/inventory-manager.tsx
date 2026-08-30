"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InventoryFilters } from "@/components/retailer/inventory/inventory-filters";
import { InventoryTable } from "@/components/retailer/inventory/inventory-table";
import { RemoveStockDialog } from "@/components/retailer/inventory/remove-stock-dialog";
import { UpdateStockModal } from "@/components/retailer/inventory/update-stock-modal";
import { RETAILER_ROUTES } from "@/lib/auth/routes";
import {
  filterAndSortInventory,
  type InventorySort,
} from "@/lib/utils/inventory-filters";
import type { InventoryItem } from "@/types/inventory";

interface InventoryManagerProps {
  initialItems: InventoryItem[];
  loadError?: string | null;
}

export function InventoryManager({ initialItems, loadError }: InventoryManagerProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [nameQuery, setNameQuery] = useState("");
  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [sort, setSort] = useState<InventorySort>("stock-asc");
  const [updateItem, setUpdateItem] = useState<InventoryItem | null>(null);
  const [removeItem, setRemoveItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const filteredItems = useMemo(
    () =>
      filterAndSortInventory(items, {
        nameQuery,
        barcodeQuery,
        sort,
      }),
    [items, nameQuery, barcodeQuery, sort]
  );

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {items.length} product{items.length === 1 ? "" : "s"} in inventory
        </p>
        <div className="flex gap-3">
          <Link href={RETAILER_ROUTES.inventoryImport}>
            <Button variant="secondary" size="md">
              Import Invoice
            </Button>
          </Link>
          <Link href={RETAILER_ROUTES.inventoryAdd}>
            <Button variant="primary" size="md">
              Add stock
            </Button>
          </Link>
        </div>
      </div>

      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      <InventoryFilters
        nameQuery={nameQuery}
        barcodeQuery={barcodeQuery}
        sort={sort}
        onNameQueryChange={setNameQuery}
        onBarcodeQueryChange={setBarcodeQuery}
        onSortChange={setSort}
        resultCount={filteredItems.length}
        totalCount={items.length}
      />

      <InventoryTable
        items={filteredItems}
        onUpdateStock={(item) => setUpdateItem(item)}
        onRemove={(item) => setRemoveItem(item)}
      />

      <UpdateStockModal
        item={updateItem}
        open={!!updateItem}
        onClose={() => setUpdateItem(null)}
        onSuccess={refresh}
      />

      <RemoveStockDialog
        item={removeItem}
        open={!!removeItem}
        onClose={() => setRemoveItem(null)}
        onSuccess={refresh}
      />
    </div>
  );
}
