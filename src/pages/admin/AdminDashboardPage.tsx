import { useEffect, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import adminService, { type AdminDashboardData } from "../../services/admin.service";
import { getApiErrorMessage } from "../../utils/apiError";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await adminService.getDashboard("7d");
        setDashboard(data);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, "We couldn't load the admin dashboard.")
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Security and platform oversight"
        description="Monitor users, disputes, transaction flow, and suspicious activity from one protected workspace."
      />

      {isLoading ? <Loader label="Loading admin dashboard..." /> : null}
      {errorMessage ? (
        <Alert variant="error" title="Dashboard unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      {!isLoading && dashboard ? (
        <>
          <section className="metrics-grid">
            <Card className="metric-card">
              <span>Total Users</span>
              <strong>{dashboard.users.total}</strong>
              <Badge variant="info">
                {dashboard.users.buyers} buyers / {dashboard.users.sellers} sellers
              </Badge>
            </Card>
            <Card className="metric-card">
              <span>Locked Accounts</span>
              <strong>{dashboard.users.currentlyLocked}</strong>
              <Badge variant="danger">Live risk signal</Badge>
            </Card>
            <Card className="metric-card">
              <span>Open Disputes</span>
              <strong>{dashboard.disputes.open}</strong>
              <Badge variant="warning">Needs review</Badge>
            </Card>
            <Card className="metric-card">
              <span>Failed Logins</span>
              <strong>{dashboard.security.failedLoginsLastPeriod}</strong>
              <Badge variant="danger">Last {dashboard.period}</Badge>
            </Card>
            <Card className="metric-card">
              <span>Unauthorized Attempts</span>
              <strong>{dashboard.security.unauthorizedAttemptsLastPeriod}</strong>
              <Badge variant="danger">Last {dashboard.period}</Badge>
            </Card>
            <Card className="metric-card">
              <span>Evidence Uploads</span>
              <strong>{dashboard.security.evidenceUploadsLastPeriod}</strong>
              <Badge variant="info">Dispute support</Badge>
            </Card>
          </section>

          <section className="dashboard-grid">
            <Card className="panel-card">
              <h3>Transaction Summary</h3>
              <div className="list-stack">
                {[
                  ["Funds Held", dashboard.transactions.fundsHeld],
                  ["Seller Accepted", dashboard.transactions.sellerAccepted],
                  ["Shipped", dashboard.transactions.shipped],
                  ["Disputed", dashboard.transactions.disputed],
                  ["Funds Released", dashboard.transactions.fundsReleased],
                ].map(([label, value]) => (
                  <div key={label} className="list-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="panel-card">
              <h3>Dispute Snapshot</h3>
              <div className="list-stack">
                {[
                  ["Open", dashboard.disputes.open],
                  ["Under Review", dashboard.disputes.underReview],
                  ["Resolved for Buyer", dashboard.disputes.resolvedForBuyer],
                  ["Resolved for Seller", dashboard.disputes.resolvedForSeller],
                  ["Rejected", dashboard.disputes.rejected],
                ].map(([label, value]) => (
                  <div key={label} className="list-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="panel-card">
              <h3>Recent Security Activity</h3>
              <div className="list-stack">
                {dashboard.recentActivity.map((activity) => (
                  <div key={activity.id} className="list-row">
                    <div>
                      <strong>{activity.description}</strong>
                      <span>{new Date(activity.createdAt).toLocaleString()}</span>
                    </div>
                    <Badge variant="info">{activity.eventType}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </>
      ) : null}
    </div>
  );
}
