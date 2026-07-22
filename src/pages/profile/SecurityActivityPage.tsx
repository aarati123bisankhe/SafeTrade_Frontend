import { useEffect, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import SecurityActivityCard from "../../components/security/SecurityActivityCard";
import securityActivityService from "../../services/security-activity.service";
import type {
  SecurityActivity,
  SecurityActivityFilters,
  SecurityActivityOutcome,
  SecurityActivitySeverity,
  SecurityActivityType,
} from "../../types/security-activity.types";
import { getApiErrorMessage } from "../../utils/apiError";

const PAGE_SIZE = 20;
const POLLING_INTERVAL_MS = 45000;

const activityTypeOptions: Array<{ value: "" | SecurityActivityType; label: string }> = [
  { value: "", label: "All event types" },
  { value: "LOGIN_SUCCESS", label: "Successful login" },
  { value: "LOGIN_FAILURE", label: "Failed login attempt" },
  { value: "ACCOUNT_LOCKED", label: "Account lockout" },
  { value: "PASSWORD_RESET_REQUESTED", label: "Password reset requested" },
  { value: "PASSWORD_CHANGED", label: "Password changed" },
  { value: "TOTP_ENABLED", label: "TOTP enabled" },
  { value: "TOTP_DISABLED", label: "TOTP disabled" },
  { value: "RECOVERY_CODE_USED", label: "Recovery code used" },
  { value: "GOOGLE_LINKED", label: "Google linked" },
  { value: "GOOGLE_UNLINKED", label: "Google unlinked" },
  { value: "SESSION_CREATED", label: "Session created" },
  { value: "SESSION_REVOKED", label: "Session revoked" },
  { value: "OTHER_SESSIONS_REVOKED", label: "All other sessions revoked" },
  { value: "REAUTH_SUCCESS", label: "Re-authentication success" },
  { value: "REAUTH_FAILURE", label: "Re-authentication failure" },
  { value: "SENSITIVE_ACTION_COMPLETED", label: "Sensitive action completed" },
  { value: "SENSITIVE_ACTION_BLOCKED", label: "Sensitive action blocked" },
];

const severityOptions: Array<{ value: "" | SecurityActivitySeverity; label: string }> = [
  { value: "", label: "All severities" },
  { value: "INFO", label: "Info" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
];

const outcomeOptions: Array<{ value: "" | SecurityActivityOutcome; label: string }> = [
  { value: "", label: "All outcomes" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILURE", label: "Failure" },
  { value: "BLOCKED", label: "Blocked" },
];

export default function SecurityActivityPage() {
  const [activities, setActivities] = useState<SecurityActivity[]>([]);
  const [filters, setFilters] = useState<SecurityActivityFilters>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadActivities = async (
    nextPage = page,
    nextFilters = filters,
    showLoader = false,
  ) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const response = await securityActivityService.getActivities(
        nextPage,
        PAGE_SIZE,
        nextFilters,
      );

      setActivities(response.activities);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your security activity."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadActivities(page, filters, true);

    const intervalId = window.setInterval(() => {
      void loadActivities(page, filters, false);
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [page, filters]);

  const handleFilterChange = (
    key: keyof SecurityActivityFilters,
    value: string,
  ) => {
    setPage(1);
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
    }));
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Security Activity"
        description="Review a safe, chronological history of important security events for your SafeTrade account."
        actions={
          <div className="page-header__button-row">
            <Badge variant={totalItems > 0 ? "info" : "default"}>
              {totalItems} event{totalItems === 1 ? "" : "s"}
            </Badge>
            <Button variant="secondary" onClick={() => void loadActivities(page, filters, true)}>
              Refresh
            </Button>
          </div>
        }
      />

      {errorMessage ? (
        <Alert variant="error" title="Security activity unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      <Card className="panel-card profile-panel">
        <div className="panel-card__header">
          <div>
            <h3>Filter activity</h3>
            <p>Focus on the events that matter most without exposing internal audit data.</p>
          </div>
        </div>

        <div className="security-activity-filters">
          <label className="security-activity-filter">
            <span>Event type</span>
            <select
              value={filters.type ?? ""}
              onChange={(event) => handleFilterChange("type", event.target.value)}
            >
              {activityTypeOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="security-activity-filter">
            <span>Severity</span>
            <select
              value={filters.severity ?? ""}
              onChange={(event) => handleFilterChange("severity", event.target.value)}
            >
              {severityOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="security-activity-filter">
            <span>Outcome</span>
            <select
              value={filters.outcome ?? ""}
              onChange={(event) => handleFilterChange("outcome", event.target.value)}
            >
              {outcomeOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="profile-coming-soon">
          <Button
            variant="ghost"
            onClick={() => {
              setPage(1);
              setFilters({});
            }}
            disabled={!filters.type && !filters.severity && !filters.outcome}
          >
            Clear filters
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="panel-card">
          <Loader label="Loading security activity..." />
        </Card>
      ) : activities.length === 0 ? (
        <Card className="panel-card profile-panel">
          <div className="panel-card__header">
            <div>
              <h3>No matching security activity</h3>
              <p>Important sign-in, password, session, and protection events will appear here.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="profile-stack">
          {activities.map((activity) => (
            <SecurityActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      )}

      <Card className="panel-card profile-panel">
        <div className="panel-card__header">
          <div>
            <h3>Activity pages</h3>
            <p>Security activity is separate from alert-style security notifications.</p>
          </div>
        </div>

        <div className="profile-detail-grid">
          <div>
            <span>Current page</span>
            <strong>Chronological security history</strong>
          </div>
          <div>
            <span>Visible data</span>
            <strong>Safe titles, device labels, masked IPs, and outcomes</strong>
          </div>
          <div>
            <span>Hidden data</span>
            <strong>Tokens, passwords, recovery codes, secrets, and raw IDs</strong>
          </div>
          <div>
            <span>Page</span>
            <strong>
              {page} of {totalPages}
            </strong>
          </div>
        </div>

        <div className="profile-coming-soon">
          <Button
            variant="secondary"
            onClick={() => void loadActivities(Math.max(1, page - 1), filters, true)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            onClick={() => void loadActivities(Math.min(totalPages, page + 1), filters, true)}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
