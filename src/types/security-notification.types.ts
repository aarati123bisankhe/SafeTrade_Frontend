export type SecurityNotificationType =
  | "NEW_LOGIN"
  | "LOGIN_FAILURE_WARNING"
  | "ACCOUNT_LOCKED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_CHANGED"
  | "TOTP_ENABLED"
  | "TOTP_DISABLED"
  | "RECOVERY_CODE_USED"
  | "GOOGLE_LINKED"
  | "GOOGLE_UNLINKED"
  | "SESSION_REVOKED"
  | "OTHER_SESSIONS_REVOKED"
  | "SUSPICIOUS_LOGIN";

export type SecurityNotificationSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface SecurityNotification {
  id: string;
  type: SecurityNotificationType;
  severity: SecurityNotificationSeverity;
  title: string;
  message: string;
  device: string | null;
  ipAddress: string | null;
  createdAt: string;
  readAt: string | null;
  isRead: boolean;
}

export interface SecurityNotificationListResponse {
  notifications: SecurityNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SecurityNotificationUnreadCountResponse {
  unreadCount: number;
}
