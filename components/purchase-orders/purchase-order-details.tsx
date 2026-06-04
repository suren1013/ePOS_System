import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge";
import type { PurchaseOrderWithDetails } from "@/types/purchase-orders";

interface PurchaseOrderDetailsProps {
  order: PurchaseOrderWithDetails;
  userType: "retailer" | "wholesaler";
  onApprove?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onFulfill?: (orderId: string) => void;
  loading?: boolean;
}

export function PurchaseOrderDetails({
  order,
  userType,
  onApprove,
  onReject,
  onFulfill,
  loading = false,
}: PurchaseOrderDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canApprove = userType === "wholesaler" && order.status === "PENDING";
  const canReject = userType === "wholesaler" && order.status === "PENDING";
  const canFulfill = userType === "wholesaler" && order.status === "APPROVED";

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Order #{order.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-slate-500">
              Created: {formatDate(order.created_at)}
            </p>
            {order.updated_at !== order.created_at && (
              <p className="text-sm text-slate-500">
                Updated: {formatDate(order.updated_at)}
              </p>
            )}
          </div>
          <PurchaseOrderStatusBadge status={order.status as any} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Total Amount</p>
            <p className="text-lg font-semibold text-slate-900">
              ${order.total_amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">
              {userType === "retailer" ? "Wholesaler" : "Retailer"}
            </p>
            <p className="text-sm font-medium text-slate-900">
              {userType === "retailer"
                ? order.wholesaler.business_name
                : order.retailer.store_name}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Contact Email</p>
            <p className="text-sm font-medium text-slate-900">
              {userType === "retailer"
                ? order.wholesaler.contact_email
                : order.retailer.contact_email}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Items</p>
            <p className="text-sm font-medium text-slate-900">
              {order.items.length}
            </p>
          </div>
        </div>

        {/* Wholesaler Actions */}
        {userType === "wholesaler" && (canApprove || canReject || canFulfill) && (
          <div className="mt-6 flex gap-2">
            {canApprove && (
              <button
                onClick={() => onApprove?.(order.id)}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Approve Order
              </button>
            )}
            {canReject && (
              <button
                onClick={() => onReject?.(order.id)}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reject Order
              </button>
            )}
            {canFulfill && (
              <button
                onClick={() => onFulfill?.(order.id)}
                disabled={loading}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Mark as Fulfilled
              </button>
            )}
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Order Items</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {order.items.map((item) => (
            <div key={item.id} className="px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">
                    {item.product.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    SKU: {item.product.sku}
                    {item.product.barcode && ` • Barcode: ${item.product.barcode}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Quantity</p>
                  <p className="text-sm font-medium text-slate-900">
                    {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Unit Cost</p>
                  <p className="text-sm font-medium text-slate-900">
                    ${item.unit_cost.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Subtotal</p>
                  <p className="text-sm font-medium text-slate-900">
                    ${(item.quantity * item.unit_cost).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                ${order.total_amount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
