import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
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
    { label: "My Sales", to: "/seller/dashboard#sales" },
    { label: "Disputes", to: "/seller/dashboard#disputes" },
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

export default function Sidebar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <aside className="dashboard-sidebar ui-card">
      <div className="dashboard-sidebar__brand">
        <img
          src="/safetrade-logo.png"
          alt="SafeTrade logo"
          className="dashboard-sidebar__logo"
        />
        <div>
          <strong>SafeTrade</strong>
          <span>{user.role.toLowerCase()} workspace</span>
        </div>
      </div>

      <nav className="dashboard-sidebar__nav" aria-label="Sidebar navigation">
        {getNavigationItems(user.role).map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              [
                "dashboard-sidebar__link",
                isActive ? "dashboard-sidebar__link--active" : "",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
