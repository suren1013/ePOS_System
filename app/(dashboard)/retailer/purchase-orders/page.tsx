import { Suspense } from "react";
import Link from "next/link";
import { getRetailerPurchaseOrders } from "@/app/actions/retailer/purchase-orders";
import { PurchaseOrderForm } from "@/components/purchase-orders/purchase-order-form";
import { PurchaseOrderList } from "@/components/purchase-orders/purchase-order-list";
import { PurchaseOrderDetails } from "@/components/purchase-orders/purchase-order-details";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default async function RetailerPurchaseOrdersPage({
  searchParams,
}: {
  searchParams: { view?: string; orderId?: string };
}) {
  const view = searchParams.view || "list";
  const orderId = searchParams.orderId;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-600">
            Browse wholesalers and create purchase orders
          </p>
        </div>
        {view === "list" && (
          <Link href="/retailer/purchase-orders?view=create">
            <Button variant="primary">Create New Order</Button>
          </Link>
        )}
        {view === "create" && (
          <Link href="/retailer/purchase-orders?view=list">
            <Button variant="secondary">View Orders</Button>
          </Link>
        )}
      </div>

      {view === "list" && (
        <Suspense fallback={<LoadingState />}>
          <PurchaseOrdersList orderId={orderId} />
        </Suspense>
      )}

      {view === "create" && (
        <Suspense fallback={<LoadingState />}>
          <PurchaseOrderForm />
        </Suspense>
      )}
    </div>
  );
}

async function PurchaseOrdersList({ orderId }: { orderId?: string }) {
  const result = await getRetailerPurchaseOrders();

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
        <PurchaseOrderDetailsView orderId={orderId} userType="retailer" />
      </Suspense>
    );
  }

  if (result.data.length === 0) {
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-900">No purchase orders yet</h3>
        <p className="mt-1 text-sm text-slate-500">
          Create your first purchase order to get started
        </p>
        <Link href="/retailer/purchase-orders?view=create" className="mt-4 inline-block">
          <Button variant="primary">Create Order</Button>
        </Link>
      </div>
    );
  }

  return (
    <PurchaseOrderList
      orders={result.data}
      userType="retailer"
      selectedOrderId={orderId}
    />
  );
}

async function PurchaseOrderDetailsView({
  orderId,
  userType,
}: {
  orderId: string;
  userType: "retailer" | "wholesaler";
}) {
  const { getPurchaseOrderDetails } = await import(
    "@/app/actions/retailer/purchase-orders"
  );
  const result = await getPurchaseOrderDetails(orderId);

  if (!result.success) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-red-800">Error: {result.error}</p>
        <Link href="/retailer/purchase-orders?view=list">
          <Button variant="secondary" className="mt-4">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/retailer/purchase-orders?view=list">
        <Button variant="secondary" className="mb-4">
          Back to Orders
        </Button>
      </Link>
      <PurchaseOrderDetails order={result.data} userType={userType} />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-12">
      <Spinner />
    </div>
  );
}
