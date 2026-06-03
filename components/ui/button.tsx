import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantStyles = {
  primary: [
    "bg-brand-600 text-white shadow-sm",
    "hover:bg-brand-700 active:bg-brand-800",
    "focus-visible:ring-brand-500",
    "disabled:bg-brand-300 disabled:text-white disabled:shadow-none",
  ].join(" "),
  secondary: [
    "bg-slate-100 text-slate-900 shadow-sm",
    "hover:bg-slate-200 active:bg-slate-300",
    "focus-visible:ring-slate-400",
    "disabled:bg-slate-100 disabled:text-slate-400",
  ].join(" "),
  ghost: [
    "bg-transparent text-slate-700",
    "hover:bg-slate-100 active:bg-slate-200",
    "disabled:text-slate-400",
  ].join(" "),
  danger: [
    "bg-red-600 text-white shadow-sm",
    "hover:bg-red-700 active:bg-red-800",
    "focus-visible:ring-red-500",
    "disabled:bg-red-300 disabled:text-white",
  ].join(" "),
};

const sizeStyles = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-100",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";
