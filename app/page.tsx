import Link from "next/link";
import { AUTH_ROUTES } from "@/lib/auth/routes";
export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">ePOS SaaS</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
          Point of sale, built for scale
        </h1>
        <p className="mt-4 text-slate-600">
          Retailer, wholesaler, and admin dashboards — infrastructure ready for your business logic.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href={AUTH_ROUTES.login}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
        >
          Sign in
        </Link>
        <Link
          href={AUTH_ROUTES.signup}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
