import { LOW_STOCK_THRESHOLD } from "@/types/inventory";
import { cn } from "@/lib/utils/cn";

interface LowStockBadgeProps {
  stockQuantity: number;
  className?: string;
}

export function LowStockBadge({ stockQuantity, className }: LowStockBadgeProps) {
  if (stockQuantity >= LOW_STOCK_THRESHOLD) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800",
        className
      )}
    >
      Low stock
    </span>
  );
}
