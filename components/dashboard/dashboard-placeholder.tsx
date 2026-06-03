interface DashboardPlaceholderProps {
  heading: string;
  description?: string;
}

export function DashboardPlaceholder({
  heading,
  description = "Business logic will be implemented here.",
}: DashboardPlaceholderProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{heading}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
