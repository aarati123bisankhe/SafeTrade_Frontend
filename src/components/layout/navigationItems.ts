import type { UserRole } from "../../types/auth.types";

const navigationByRole: Record<
  UserRole,
  Array<{ label: string; to: string }>
> = {
  BUYER: [
    { label: "Dashboard", to: "/buyer/dashboard" },
    { label: "Browse Products", to: "/products" },
    { label: "My Purchases", to: "/my-purchases" },
    { label: "Disputes", to: "/disputes" },
    { label: "Profile", to: "/profile" },
  ],
  SELLER: [
    { label: "Dashboard", to: "/seller/dashboard" },
    { label: "My Products", to: "/seller/products" },
    { label: "Add Product", to: "/seller/products/new" },
    { label: "My Sales", to: "/seller/sales" },
    { label: "Disputes", to: "/seller/sales?status=DISPUTED" },
    { label: "Profile", to: "/profile" },
  ],
  ADMIN: [
    { label: "Dashboard", to: "/admin/dashboard" },
    { label: "Users", to: "/admin/dashboard#users" },
    { label: "Disputes", to: "/admin/dashboard#disputes" },
    { label: "Audit Logs", to: "/admin/dashboard#audit-logs" },
    { label: "Security Activity", to: "/admin/dashboard#security" },
  ],
};

export function getNavigationItems(role: UserRole) {
  return navigationByRole[role];
}
