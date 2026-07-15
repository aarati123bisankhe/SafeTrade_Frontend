import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import Button from "../common/Button";
import Badge from "../common/Badge";
import useAuth from "../../hooks/useAuth";
import { getNavigationItems } from "./Sidebar";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isNavItemActive = (to: string) => {
    const [path, hashFragment] = to.split("#");

    if (hashFragment) {
      return location.pathname === path && location.hash === `#${hashFragment}`;
    }

    if (path === "/products") {
      return location.pathname.startsWith(path);
    }

    return location.pathname.startsWith(path) && location.hash.length === 0;
  };

  return (
    <>
      <div className="dashboard-trust-strip">
        <div className="dashboard-trust-strip__inner">
          <span>Protected transactions with escrow security</span>
          <span>Buy and sell locally with confidence</span>
        </div>
      </div>

      <header className="dashboard-navbar">
        <div className="dashboard-navbar__inner">
          <Link to="/" className="dashboard-navbar__brand">
            <img
              src="/safetrade-logo.png"
              alt="SafeTrade logo"
              className="dashboard-navbar__logo"
            />
            <div>
              <strong>SafeTrade</strong>
              <span>Protected local marketplace</span>
            </div>
          </Link>

          <nav className="dashboard-nav-links" aria-label="Dashboard navigation">
            {getNavigationItems(user.role).slice(0, 4).map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={[
                  "dashboard-nav-link",
                  isNavItemActive(item.to) ? "dashboard-nav-link--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="dashboard-navbar__actions">
            <Badge variant="success">{user.role}</Badge>
            <NavLink
              to={`${location.pathname}#profile`}
              className={[
                "dashboard-nav-link",
                location.hash === "#profile" ? "dashboard-nav-link--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              Profile
            </NavLink>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
