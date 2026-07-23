import { NavLink } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { getNavigationItems } from "./navigationItems";

export default function MobileNavigation() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <nav className="mobile-navigation ui-card" aria-label="Mobile navigation">
      {getNavigationItems(user.role).slice(0, 4).map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) =>
            [
              "mobile-navigation__link",
              isActive ? "mobile-navigation__link--active" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
