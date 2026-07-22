import Badge from "../common/Badge";
import Card from "../common/Card";
import type { SecurityActivity } from "../../types/security-activity.types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSeverityVariant(severity: SecurityActivity["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return "danger";
    case "WARNING":
      return "warning";
    default:
      return "info";
  }
}

function getOutcomeVariant(outcome: SecurityActivity["outcome"]) {
  switch (outcome) {
    case "BLOCKED":
      return "warning";
    case "FAILURE":
      return "danger";
    default:
      return "success";
  }
}

function formatOutcomeLabel(outcome: SecurityActivity["outcome"]) {
  switch (outcome) {
    case "BLOCKED":
      return "Blocked";
    case "FAILURE":
      return "Failure";
    default:
      return "Success";
  }
}

export default function SecurityActivityCard({
  activity,
}: {
  activity: SecurityActivity;
}) {
  return (
    <Card className="panel-card security-activity-card">
      <div className="panel-card__header">
        <div>
          <h3>{activity.title}</h3>
          <p>{activity.description}</p>
        </div>
        <div className="security-notification-card__badges">
          <Badge variant={getSeverityVariant(activity.severity)}>
            {activity.severity}
          </Badge>
          <Badge variant={getOutcomeVariant(activity.outcome)}>
            {formatOutcomeLabel(activity.outcome)}
          </Badge>
        </div>
      </div>

      <div className="profile-detail-grid security-notification-card__details">
        <div>
          <span>Time</span>
          <strong>{formatDateTime(activity.createdAt)}</strong>
        </div>
        <div>
          <span>Device</span>
          <strong>{activity.device}</strong>
        </div>
        <div>
          <span>Approximate IP</span>
          <strong>{activity.ipAddress}</strong>
        </div>
        <div>
          <span>Event type</span>
          <strong>{activity.type.replaceAll("_", " ")}</strong>
        </div>
      </div>
    </Card>
  );
}
