import { useLocation, useNavigate } from "react-router-dom";

import Button from "../common/Button";
import Badge from "../common/Badge";
import useAuth from "../../hooks/useAuth";

const titleByPath = [
  { path: "/buyer/dashboard", title: "Buyer Dashboard" },
  { path: "/seller/dashboard", title: "Seller Dashboard" },
  { path: "/admin/dashboard", title: "Admin Dashboard" },
];

function getTitle(pathname: string) {
  return (
    titleByPath.find((item) => pathname.startsWith(item.path))?.title ??
    "SafeTrade"
  );
}

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

  return (
    <header className="dashboard-header ui-card">
      <div className="dashboard-header__title-block">
        <span className="section-tag">Protected workspace</span>
        <h2>{getTitle(location.pathname)}</h2>
      </div>

      <div className="dashboard-header__actions">
        <Badge variant="success">{user.role}</Badge>
        <div className="dashboard-header__user">
          <strong>{user.username}</strong>
          <span>{user.email}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
