import { Outlet } from "react-router-dom";

import DashboardFooter from "./DashboardFooter";
import DashboardHeader from "./DashboardHeader";

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <DashboardHeader />
      <div className="dashboard-main">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
      <DashboardFooter />
    </div>
  );
}
