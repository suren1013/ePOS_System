"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { completeSale } from "@/app/actions/retailer/sales";
import { CartPanel } from "@/components/retailer/pos/cart-panel";
import { CheckoutPanel } from "@/components/retailer/pos/checkout-panel";
import { ProductPicker } from "@/components/retailer/pos/product-picker";
import { calculateCartSubtotal, calculateCartTotal } from "@/lib/utils/cart";
import { filterInventoryForPos } from "@/lib/utils/pos-search";
import type { InventoryItem } from "@/types/inventory";
import type { CartLine, PaymentMethod } from "@/types/sales";

interface PosWorkspaceProps {
  initialInventory: InventoryItem[];
  loadError?: string | null;
}

function inventoryItemToCartLine(item: InventoryItem, quantity = 1): CartLine {
  return {
    inventoryId: item.id,
    productId: item.product_id,
    productName: item.product_name,
    sku: item.sku,
    barcode: item.barcode,
    unitPrice: item.retail_price,
    quantity,
    maxStock: item.stock_quantity,
  };
}

export function PosWorkspace({ initialInventory, loadError }: PosWorkspaceProps) {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(
    () => filterInventoryForPos(inventory, searchQuery),
    [inventory, searchQuery]
  );

  const subtotal = useMemo(() => calculateCartSubtotal(cartLines), [cartLines]);
  const total = useMemo(() => calculateCartTotal(cartLines), [cartLines]);

  const getStockForInventory = useCallback(
    (inventoryId: string) =>
      inventory.find((item) => item.id === inventoryId)?.stock_quantity ?? 0,
    [inventory]
  );

  const handleAddToCart = useCallback(
    (item: InventoryItem) => {
      setCheckoutError(null);
      setSuccessMessage(null);
      setCartLines((prev) => {
        const existing = prev.find((line) => line.inventoryId === item.id);
        if (existing) {
          const nextQty = Math.min(existing.quantity + 1, item.stock_quantity);
          return prev.map((line) =>
            line.inventoryId === item.id
              ? { ...line, quantity: nextQty, maxStock: item.stock_quantity }
              : line
          );
        }
        return [...prev, inventoryItemToCartLine(item)];
      });
    },
    []
  );

  const handleQuantityChange = useCallback(
    (inventoryId: string, quantity: number) => {
      setCheckoutError(null);
      setSuccessMessage(null);
      const maxStock = getStockForInventory(inventoryId);
      const clamped = Math.max(1, Math.min(Math.floor(quantity), maxStock));

      setCartLines((prev) =>
        prev.map((line) =>
          line.inventoryId === inventoryId
            ? { ...line, quantity: clamped, maxStock }
            : line
        )
      );
    },
    [getStockForInventory]
  );

  const handleRemove = useCallback((inventoryId: string) => {
    setCheckoutError(null);
    setSuccessMessage(null);
    setCartLines((prev) => prev.filter((line) => line.inventoryId !== inventoryId));
  }, []);

  const handleCompleteSale = useCallback(() => {
    setCheckoutError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await completeSale({
        payment_method: paymentMethod,
        items: cartLines.map((line) => ({
          inventory_id: line.inventoryId,
          product_id: line.productId,
          quantity: line.quantity,
          unit_price: line.unitPrice,
        })),
      });

      if (!result.success) {
        setCheckoutError(result.error);
        return;
      }

      setInventory(result.data.updatedInventory);
      setCartLines([]);
      setSuccessMessage(`Sale completed. Receipt #${result.data.saleId.slice(0, 8)}…`);
    });
  }, [cartLines, paymentMethod]);

  return (
    <div className="space-y-4">
      {loadError && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-4 min-h-[420px]">
          <ProductPicker
            items={filteredProducts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAddToCart={handleAddToCart}
          />
        </div>
        <div className="space-y-4 lg:col-span-5 min-h-[420px]">
          <CartPanel
            lines={cartLines}
            subtotal={subtotal}
            total={total}
            onQuantityChange={handleQuantityChange}
            onRemove={handleRemove}
          />
        </div>
        <div className="lg:col-span-3">
          <CheckoutPanel
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
            onComplete={handleCompleteSale}
            disabled={cartLines.length === 0}
            loading={isPending}
            error={checkoutError}
            successMessage={successMessage}
          />
        </div>
      </div>
    </div>
  );
}
