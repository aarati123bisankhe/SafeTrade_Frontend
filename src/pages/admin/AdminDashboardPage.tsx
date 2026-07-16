import { useCallback, useEffect, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import adminService from "../../services/admin.service";
import type {
  AdminAuditLog,
  AdminDashboardData,
  AdminDashboardPeriod,
} from "../../types/admin.types";
import { getApiErrorMessage } from "../../utils/apiError";

const periodOptions: AdminDashboardPeriod[] = ["24h", "7d", "30d"];

function formatPeriodLabel(value: AdminDashboardPeriod) {
  switch (value) {
    case "24h":
      return "Last 24 Hours";
    case "30d":
      return "Last 30 Days";
    default:
      return "Last 7 Days";
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getAuditBadgeVariant(eventType: string) {
  if (
    eventType === "UNAUTHORIZED_ACCESS_ATTEMPT" ||
    eventType === "ACCOUNT_LOCKED" ||
    eventType === "LOGIN_BLOCKED"
  ) {
    return "danger";
  }

  if (eventType.startsWith("DISPUTE_")) {
    return "warning";
  }

  if (
    eventType === "FUNDS_RELEASED" ||
    eventType === "TRANSACTION_ACCEPTED" ||
    eventType === "TRANSACTION_SHIPPED"
  ) {
    return "success";
  }

  return "info";
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<AdminDashboardPeriod>("7d");
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [dashboardData, auditLogData] = await Promise.all([
        adminService.getDashboard(period),
        adminService.getAuditLogs({ page: 1, limit: 10 }),
      ]);

      setDashboard(dashboardData);
      setAuditLogs(auditLogData.items);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load the admin dashboard.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Security and platform oversight"
        description="Monitor users, disputes, transaction flow, and suspicious activity from one protected workspace."
        actions={
          <div className="page-header__button-row">
            {periodOptions.map((option) => (
              <Button
                key={option}
                variant={period === option ? "primary" : "ghost"}
                size="sm"
                onClick={() => setPeriod(option)}
              >
                {formatPeriodLabel(option)}
              </Button>
            ))}
          </div>
        }
      />

      {isLoading ? <Loader label="Loading admin dashboard..." /> : null}
      {errorMessage ? (
        <Alert variant="error" title="Dashboard unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      {!isLoading && dashboard ? (
        <>
          <section className="metrics-grid" id="users">
            <Card className="metric-card">
              <span>Total Users</span>
              <strong>{dashboard.users.total}</strong>
              <Badge variant="info">
                {dashboard.users.buyers} buyers / {dashboard.users.sellers} sellers
              </Badge>
            </Card>
            <Card className="metric-card">
              <span>Admin Accounts</span>
              <strong>{dashboard.users.admins}</strong>
              <Badge variant="default">Privileged access</Badge>
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
              <Badge variant="danger">{formatPeriodLabel(dashboard.period)}</Badge>
            </Card>
            <Card className="metric-card">
              <span>Unauthorized Attempts</span>
              <strong>{dashboard.security.unauthorizedAttemptsLastPeriod}</strong>
              <Badge variant="danger">{formatPeriodLabel(dashboard.period)}</Badge>
            </Card>
          </section>

          <section className="dashboard-grid">
            <Card className="panel-card" id="security">
              <h3>Security Overview</h3>
              <div className="list-stack">
                {[
                  ["Failed Logins", dashboard.security.failedLoginsLastPeriod],
                  ["Locked Events", dashboard.security.lockedEventsLastPeriod],
                  ["Unauthorized Attempts", dashboard.security.unauthorizedAttemptsLastPeriod],
                  ["Evidence Uploads", dashboard.security.evidenceUploadsLastPeriod],
                ].map(([label, value]) => (
                  <div key={label} className="list-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="panel-card">
              <h3>Product Summary</h3>
              <div className="list-stack">
                {[
                  ["Total", dashboard.products.total],
                  ["Available", dashboard.products.available],
                  ["Reserved", dashboard.products.reserved],
                  ["Sold", dashboard.products.sold],
                  ["Removed", dashboard.products.removed],
                ].map(([label, value]) => (
                  <div key={label} className="list-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="panel-card">
              <h3>Transaction Summary</h3>
              <div className="list-stack">
                {[
                  ["Funds Held", dashboard.transactions.fundsHeld],
                  ["Seller Accepted", dashboard.transactions.sellerAccepted],
                  ["Shipped", dashboard.transactions.shipped],
                  ["Disputed", dashboard.transactions.disputed],
                  ["Funds Released", dashboard.transactions.fundsReleased],
                  ["Refunded", dashboard.transactions.buyerRefunded],
                ].map(([label, value]) => (
                  <div key={label} className="list-row">
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="dashboard-grid">
            <Card className="panel-card" id="disputes">
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
                      <span>{formatDateTime(activity.createdAt)}</span>
                    </div>
                    <Badge variant={getAuditBadgeVariant(activity.eventType)}>
                      {activity.eventType}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="panel-card ui-card" id="audit-logs">
            <div className="panel-card__header">
              <div>
                <h3>Audit Logs</h3>
                <p>Recent administrative and security-relevant activity.</p>
              </div>
              <Badge variant="info">{auditLogs.length} recent records</Badge>
            </div>

            {auditLogs.length === 0 ? (
              <Card className="marketplace-empty-state purchases-empty-state">
                <Badge variant="info">No audit logs yet</Badge>
                <h3>No audit activity is available right now.</h3>
                <p>Audit events will appear here as platform activity grows.</p>
              </Card>
            ) : (
              <div className="list-stack">
                {auditLogs.map((log) => (
                  <div key={log.id} className="list-row">
                    <div>
                      <strong>{log.description}</strong>
                      <span>
                        {formatDateTime(log.createdAt)}
                        {log.targetType ? ` · ${log.targetType}` : ""}
                        {log.targetId ? ` · ${log.targetId}` : ""}
                      </span>
                    </div>
                    <Badge variant={getAuditBadgeVariant(log.eventType)}>
                      {log.eventType}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
