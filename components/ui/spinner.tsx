import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  className?: string;
  label?: string;
}

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)} role="status">
      <span
        className="size-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
