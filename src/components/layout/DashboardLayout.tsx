import { Outlet } from "react-router-dom";

import DashboardHeader from "./DashboardHeader";
import MobileNavigation from "./MobileNavigation";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <DashboardHeader />
        <MobileNavigation />
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
