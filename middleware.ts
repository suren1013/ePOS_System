import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  AUTH_ROUTES,
  DASHBOARD_ROUTES,
  DEFAULT_DASHBOARD_BY_ROLE,
  isAuthRoute,
  isDashboardRoute,
  type UserRole,
} from "@/lib/auth/routes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabaseResponse, user } = await updateSession(request);

  const role = (user?.user_metadata?.role as UserRole | undefined) ?? null;

  if (isAuthRoute(pathname) && user) {
    const destination =
      role && DEFAULT_DASHBOARD_BY_ROLE[role]
        ? DEFAULT_DASHBOARD_BY_ROLE[role]
        : DASHBOARD_ROUTES.retailer;
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isDashboardRoute(pathname) && !user) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user && role && isDashboardRoute(pathname)) {
    const allowedPrefix = DEFAULT_DASHBOARD_BY_ROLE[role];
    if (allowedPrefix && !pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
