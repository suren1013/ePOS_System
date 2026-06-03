import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface AuthCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm",
        className
      )}
    >
      <header className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      </header>
      {children}
      {footer && <footer className="mt-6 border-t border-slate-100 pt-6 text-center text-sm">{footer}</footer>}
    </div>
  );
}
