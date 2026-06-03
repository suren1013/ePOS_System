"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <h2 className="text-xl font-semibold text-slate-900">Dashboard error</h2>
      <p className="max-w-md text-sm text-slate-600">
        We could not load this section. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
