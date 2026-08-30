import { Suspense } from "react";
import Link from "next/link";
import { getWholesalerPurchaseOrders, getPurchaseOrderDetails } from "@/app/actions/wholesaler/purchase-orders";
import { PurchaseOrderList } from "@/components/purchase-orders/purchase-order-list";
import { PurchaseOrderDetailsClient } from "@/components/purchase-orders/purchase-order-details-client";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default async function WholesalerPurchaseOrdersPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Incoming Purchase Orders</h1>
        <p className="text-slate-600">
          Manage purchase orders from retailers
        </p>
      </div>

      <Suspense fallback={<LoadingState />}>
        <PurchaseOrdersList orderId={orderId} />
      </Suspense>
    </div>
  );
}

async function PurchaseOrdersList({ orderId }: { orderId?: string }) {
  const result = await getWholesalerPurchaseOrders();

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Error: {result.error}</p>
      </div>
    );
  }

  if (orderId) {
    return (
      <Suspense fallback={<LoadingState />}>
        <PurchaseOrderDetailsView orderId={orderId} />
      </Suspense>
    );
  }

  return (
    <PurchaseOrderList
      orders={result.data}
      userType="wholesaler"
      selectedOrderId={orderId}
    />
  );
}

async function PurchaseOrderDetailsView({ orderId }: { orderId: string }) {
  const result = await getPurchaseOrderDetails(orderId);

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Error: {result.error}</p>
        <Link href="/wholesaler/purchase-orders">
          <Button variant="secondary" className="mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <PurchaseOrderDetailsClient
      initialOrder={result.data}
      userType="wholesaler"
    />
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-12">
      <Spinner />
    </div>
  );
}
