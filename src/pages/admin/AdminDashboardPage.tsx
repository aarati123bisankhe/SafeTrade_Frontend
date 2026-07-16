import { useCallback, useEffect, useMemo, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import adminService from "../../services/admin.service";
import disputeService from "../../services/dispute.service";
import type {
  AdminAuditLog,
  AdminDashboardData,
  AdminDashboardPeriod,
} from "../../types/admin.types";
import {
  DisputeStatus,
  type Dispute,
  type ResolveDisputeRequest,
} from "../../types/dispute.types";
import { getApiErrorMessage } from "../../utils/apiError";

const periodOptions: AdminDashboardPeriod[] = ["24h", "7d", "30d"];
const resolutionOptions: Array<{
  value: ResolveDisputeRequest["decision"];
  label: string;
}> = [
  { value: "REFUND_BUYER", label: "Refund Buyer" },
  { value: "RELEASE_SELLER", label: "Release Seller" },
  { value: "REJECT_DISPUTE", label: "Reject Dispute" },
];

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

function formatReason(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function getDisputeBadgeVariant(status: Dispute["status"]) {
  switch (status) {
    case DisputeStatus.OPEN:
      return "warning";
    case DisputeStatus.UNDER_REVIEW:
      return "info";
    case DisputeStatus.RESOLVED_BUYER:
    case DisputeStatus.RESOLVED_SELLER:
      return "success";
    case DisputeStatus.REJECTED:
      return "danger";
    default:
      return "default";
  }
}

function getInitialResolutionState() {
  return {
    disputeId: "",
    decision: "REFUND_BUYER" as ResolveDisputeRequest["decision"],
    adminNote: "",
  };
}

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<AdminDashboardPeriod>("7d");
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewingId, setIsReviewingId] = useState<string | null>(null);
  const [isResolvingId, setIsResolvingId] = useState<string | null>(null);
  const [resolutionState, setResolutionState] = useState(getInitialResolutionState());
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [dashboardData, auditLogData, disputeData] = await Promise.all([
        adminService.getDashboard(period),
        adminService.getAuditLogs({ page: 1, limit: 10 }),
        disputeService.getMyDisputes(),
      ]);

      setDashboard(dashboardData);
      setAuditLogs(auditLogData.items);
      setDisputes(disputeData);
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

  const actionableDisputes = useMemo(
    () =>
      disputes.filter(
        (dispute) =>
          dispute.status === DisputeStatus.OPEN ||
          dispute.status === DisputeStatus.UNDER_REVIEW
      ),
    [disputes]
  );

  const handleMarkUnderReview = async (disputeId: string) => {
    setIsReviewingId(disputeId);
    setErrorMessage("");

    try {
      await disputeService.markUnderReview(disputeId);
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't move this dispute into review.")
      );
    } finally {
      setIsReviewingId(null);
    }
  };

  const handleResolveDispute = async () => {
    if (resolutionState.adminNote.trim().length < 5 || !resolutionState.disputeId) {
      return;
    }

    setIsResolvingId(resolutionState.disputeId);
    setErrorMessage("");

    try {
      await disputeService.resolveDispute(resolutionState.disputeId, {
        decision: resolutionState.decision,
        adminNote: resolutionState.adminNote.trim(),
      });
      setResolutionState(getInitialResolutionState());
      await loadDashboard();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't resolve this dispute right now.")
      );
    } finally {
      setIsResolvingId(null);
    }
  };

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

          <section className="panel-card ui-card">
            <div className="panel-card__header">
              <div>
                <h3>Dispute Actions</h3>
                <p>Move open disputes into review and resolve them from the admin workspace.</p>
              </div>
              <Badge variant="warning">
                {actionableDisputes.length} actionable dispute
                {actionableDisputes.length === 1 ? "" : "s"}
              </Badge>
            </div>

            {actionableDisputes.length === 0 ? (
              <Card className="marketplace-empty-state purchases-empty-state">
                <Badge variant="success">All caught up</Badge>
                <h3>No open admin dispute actions right now.</h3>
                <p>New buyer disputes will appear here when they need admin attention.</p>
              </Card>
            ) : (
              <div className="list-stack">
                {actionableDisputes.map((dispute) => (
                  <div key={dispute.id} className="profile-list-row">
                    <div>
                      <strong>{dispute.transaction?.productName ?? "Protected transaction"}</strong>
                      <span>
                        {formatReason(dispute.reason)} · {dispute.raisedBy?.username ?? "Buyer"} ·{" "}
                        {formatDateTime(dispute.createdAt)}
                      </span>
                      <span>{dispute.description}</span>
                    </div>
                    <div className="page-header__button-row">
                      <Badge variant={getDisputeBadgeVariant(dispute.status)}>
                        {dispute.status}
                      </Badge>
                      {dispute.status === DisputeStatus.OPEN ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void handleMarkUnderReview(dispute.id)}
                          disabled={isReviewingId === dispute.id}
                        >
                          {isReviewingId === dispute.id ? "Reviewing..." : "Mark Under Review"}
                        </Button>
                      ) : null}
                      {dispute.status === DisputeStatus.UNDER_REVIEW ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setResolutionState({
                              disputeId: dispute.id,
                              decision: "REFUND_BUYER",
                              adminNote: dispute.adminNote ?? "",
                            })
                          }
                        >
                          Resolve Dispute
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {resolutionState.disputeId ? (
              <div className="dispute-form" style={{ marginTop: 24 }}>
                <label className="dispute-form__field">
                  <span>Resolution</span>
                  <select
                    value={resolutionState.decision}
                    onChange={(event) =>
                      setResolutionState((current) => ({
                        ...current,
                        decision: event.target.value as ResolveDisputeRequest["decision"],
                      }))
                    }
                  >
                    {resolutionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="dispute-form__field">
                  <span>Admin Note</span>
                  <textarea
                    rows={5}
                    value={resolutionState.adminNote}
                    onChange={(event) =>
                      setResolutionState((current) => ({
                        ...current,
                        adminNote: event.target.value,
                      }))
                    }
                    placeholder="Explain the decision clearly for the buyer and seller."
                  />
                </label>

                <div className="dispute-form__actions">
                  <Button
                    onClick={() => void handleResolveDispute()}
                    disabled={
                      isResolvingId === resolutionState.disputeId ||
                      resolutionState.adminNote.trim().length < 5
                    }
                  >
                    {isResolvingId === resolutionState.disputeId
                      ? "Resolving..."
                      : "Confirm Resolution"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setResolutionState(getInitialResolutionState())}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        </>
      ) : null}
    </div>
  );
}
