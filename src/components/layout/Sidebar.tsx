import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { getNavigationItems } from "./navigationItems";

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
