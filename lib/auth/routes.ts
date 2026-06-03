export type UserRole = "retailer" | "wholesaler" | "admin";

export const AUTH_ROUTES = {
  login: "/login",
  signup: "/signup",
} as const;

export const DASHBOARD_ROUTES = {
  retailer: "/retailer",
  wholesaler: "/wholesaler",
  admin: "/admin",
} as const;

export const WHOLESALER_ROUTES = {
  overview: DASHBOARD_ROUTES.wholesaler,
  products: "/wholesaler/products",
} as const;

export const WHOLESALER_NAV = [
  { label: "Overview", href: WHOLESALER_ROUTES.overview },
  { label: "Products", href: WHOLESALER_ROUTES.products },
] as const;

export const RETAILER_ROUTES = {
  overview: DASHBOARD_ROUTES.retailer,
  inventory: "/retailer/inventory",
  inventoryAdd: "/retailer/inventory/add",
  pos: "/retailer/pos",
  sales: "/retailer/sales",
} as const;

export const RETAILER_NAV = [
  { label: "Overview", href: RETAILER_ROUTES.overview },
  { label: "Inventory", href: RETAILER_ROUTES.inventory },
  { label: "POS", href: RETAILER_ROUTES.pos },
  { label: "Sales", href: RETAILER_ROUTES.sales },
] as const;

export const DEFAULT_DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  retailer: DASHBOARD_ROUTES.retailer,
  wholesaler: DASHBOARD_ROUTES.wholesaler,
  admin: DASHBOARD_ROUTES.admin,
};

const AUTH_PATHS = new Set<string>(Object.values(AUTH_ROUTES));
const DASHBOARD_PATHS = new Set<string>(Object.values(DASHBOARD_ROUTES));

export function isAuthRoute(pathname: string): boolean {
  return AUTH_PATHS.has(pathname);
}

export function isDashboardRoute(pathname: string): boolean {
  return [...DASHBOARD_PATHS].some((path) => pathname.startsWith(path));
}
