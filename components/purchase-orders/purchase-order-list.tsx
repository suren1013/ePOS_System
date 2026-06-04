import Link from "next/link";
import { PurchaseOrderStatusBadge } from "./purchase-order-status-badge";
import type { PurchaseOrderSummary } from "@/types/purchase-orders";

interface PurchaseOrderListProps {
  orders: PurchaseOrderSummary[];
  userType: "retailer" | "wholesaler";
  selectedOrderId?: string;
}

export function PurchaseOrderList({
  orders,
  userType,
  selectedOrderId,
}: PurchaseOrderListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
        <p className="text-slate-500">No purchase orders found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/${userType}/purchase-orders?view=list&orderId=${order.id}`}
          className={`block rounded-lg border bg-white p-4 transition-colors hover:bg-slate-50 ${
            selectedOrderId === order.id
              ? "border-brand-500 ring-2 ring-brand-500/20"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-slate-900">
                  Order #{order.id.slice(0, 8)}
                </p>
                <PurchaseOrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {userType === "retailer" ? "From" : "To"}:{" "}
                {userType === "retailer"
                  ? order.wholesaler_name
                  : order.retailer_name}
              </p>
              <p className="text-sm text-slate-500">
                {order.item_count} {order.item_count === 1 ? "item" : "items"}
              </p>
              <p className="text-sm text-slate-500">
                {formatDate(order.created_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-900">
                ${order.total_amount.toFixed(2)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
