import type { PurchaseOrderStatus } from "@/types/purchase-orders";

interface PurchaseOrderStatusBadgeProps {
  status: PurchaseOrderStatus;
}

const statusConfig: Record<
  PurchaseOrderStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  PENDING: {
    label: "Pending",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  APPROVED: {
    label: "Approved",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  REJECTED: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
  FULFILLED: {
    label: "Fulfilled",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
};

export function PurchaseOrderStatusBadge({
  status,
}: PurchaseOrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
}
