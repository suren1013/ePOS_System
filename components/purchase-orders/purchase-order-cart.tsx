"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CartItem } from "@/types/purchase-orders";

interface PurchaseOrderCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCreateOrder: () => void;
  loading?: boolean;
}

export function PurchaseOrderCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCreateOrder,
  loading = false,
}: PurchaseOrderCartProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-900">Your cart is empty</h3>
        <p className="mt-1 text-sm text-slate-500">
          Add products from a wholesaler catalog to get started
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">
            Shopping Cart
          </h3>
          <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {items.map((item) => (
          <div key={item.product_id} className="px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium text-slate-900">{item.product_name}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                  <span>SKU: {item.product_sku}</span>
                  {item.product_barcode && <span>Barcode: {item.product_barcode}</span>}
                  <span>From: {item.wholesaler_name}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  ${item.unit_cost.toFixed(2)} / unit
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border border-slate-300 bg-white">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || loading}
                    className="h-8 w-8 rounded-none rounded-l-lg"
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      onUpdateQuantity(item.product_id, Math.max(1, value));
                    }}
                    className="w-16 h-8 border-0 text-center rounded-none"
                    disabled={loading}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                    disabled={loading}
                    className="h-8 w-8 rounded-none rounded-r-lg"
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRemoveItem(item.product_id)}
                  disabled={loading}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <p className="text-sm font-semibold text-slate-900">
                Subtotal: ${item.subtotal.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Subtotal</p>
              <p className="text-lg font-bold text-slate-900">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
            <Button
              size="lg"
              onClick={onCreateOrder}
              loading={loading}
              disabled={items.length === 0}
              className="min-w-[200px]"
            >
              Create Purchase Order
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            By creating this order, you agree to the wholesaler's terms and conditions
          </p>
        </div>
      </div>
    </div>
  );
}
