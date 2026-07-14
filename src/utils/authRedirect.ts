import type { UserRole } from "../types/auth.types";

export function getDashboardRouteByRole(role: UserRole): string {
  switch (role) {
    case "SELLER":
      return "/seller/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "BUYER":
    default:
      return "/buyer/dashboard";
  }
}
