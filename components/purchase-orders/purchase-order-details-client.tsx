"use client";

import { useState } from "react";
import Link from "next/link";
import { PurchaseOrderDetails } from "./purchase-order-details";
import { Button } from "@/components/ui/button";
import type { PurchaseOrderWithDetails } from "@/types/purchase-orders";

interface PurchaseOrderDetailsClientProps {
  initialOrder: PurchaseOrderWithDetails;
  userType: "retailer" | "wholesaler";
}

export function PurchaseOrderDetailsClient({
  initialOrder,
  userType,
}: PurchaseOrderDetailsClientProps) {
  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const { approvePurchaseOrder } = await import("@/app/actions/wholesaler/purchase-orders");
    const result = await approvePurchaseOrder(order.id);
    if (result.success) {
      setOrder(result.data);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    const { rejectPurchaseOrder } = await import("@/app/actions/wholesaler/purchase-orders");
    const result = await rejectPurchaseOrder(order.id);
    if (result.success) {
      setOrder(result.data);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleFulfill = async () => {
    setLoading(true);
    const { fulfillPurchaseOrder } = await import("@/app/actions/wholesaler/purchase-orders");
    const result = await fulfillPurchaseOrder(order.id);
    if (result.success) {
      setOrder(result.data);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <div>
      <Link href="/wholesaler/purchase-orders">
        <Button variant="secondary" className="mb-4">
          Back to Orders
        </Button>
      </Link>
      <PurchaseOrderDetails
        order={order}
        userType={userType}
        onApprove={handleApprove}
        onReject={handleReject}
        onFulfill={handleFulfill}
        loading={loading}
      />
    </div>
  );
}
