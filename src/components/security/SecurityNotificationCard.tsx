import Badge from "../common/Badge";
import Button from "../common/Button";
import Card from "../common/Card";
import type { SecurityNotification } from "../../types/security-notification.types";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function getSeverityVariant(severity: SecurityNotification["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return "danger";
    case "WARNING":
      return "warning";
    default:
      return "info";
  }
}

function getAction(notification: SecurityNotification) {
  switch (notification.type) {
    case "NEW_LOGIN":
    case "SESSION_REVOKED":
    case "OTHER_SESSIONS_REVOKED":
      return { label: "Review sessions", to: "/profile/sessions" };
    case "PASSWORD_CHANGED":
      return { label: "Review security activity", to: "/profile/security-activity" };
    case "TOTP_DISABLED":
      return { label: "Enable two-factor authentication", to: "/profile" };
    case "ACCOUNT_LOCKED":
      return { label: "Review security activity", to: "/profile/security-activity" };
    default:
      return null;
  }
}

export default function SecurityNotificationCard({
  notification,
  onMarkRead,
  onDelete,
  isUpdating,
}: {
  notification: SecurityNotification;
  onMarkRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  isUpdating: boolean;
}) {
  const action = getAction(notification);

  return (
    <Card className="panel-card security-notification-card">
      <div className="panel-card__header">
        <div>
          <h3>{notification.title}</h3>
          <p>{notification.message}</p>
        </div>
        <div className="security-notification-card__badges">
          <Badge variant={getSeverityVariant(notification.severity)}>
            {notification.severity}
          </Badge>
          <Badge variant={notification.isRead ? "default" : "success"}>
            {notification.isRead ? "Read" : "Unread"}
          </Badge>
        </div>
      </div>

      <div className="profile-detail-grid security-notification-card__details">
        <div>
          <span>Time</span>
          <strong>{formatDateTime(notification.createdAt)}</strong>
        </div>
        <div>
          <span>Device</span>
          <strong>{notification.device ?? "Unknown browser"}</strong>
        </div>
        <div>
          <span>Approximate IP</span>
          <strong>{notification.ipAddress ?? "Hidden"}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{notification.isRead ? "Reviewed" : "Needs review"}</strong>
        </div>
      </div>

      <div className="profile-coming-soon security-notification-card__actions">
        {!notification.isRead ? (
          <Button
            variant="secondary"
            onClick={() => onMarkRead(notification.id)}
            disabled={isUpdating}
          >
            Mark as read
          </Button>
        ) : null}
        {action ? (
          <Button to={action.to} variant="ghost">
            {action.label}
          </Button>
        ) : null}
        <Button
          variant="ghost"
          onClick={() => onDelete(notification.id)}
          disabled={isUpdating}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}
