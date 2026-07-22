export type SecurityActivityType =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "ACCOUNT_LOCKED"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_CHANGED"
  | "TOTP_ENABLED"
  | "TOTP_DISABLED"
  | "RECOVERY_CODE_USED"
  | "GOOGLE_LINKED"
  | "GOOGLE_UNLINKED"
  | "SESSION_CREATED"
  | "SESSION_REVOKED"
  | "OTHER_SESSIONS_REVOKED"
  | "REAUTH_SUCCESS"
  | "REAUTH_FAILURE"
  | "SENSITIVE_ACTION_COMPLETED"
  | "SENSITIVE_ACTION_BLOCKED";

export type SecurityActivitySeverity = "INFO" | "WARNING" | "CRITICAL";
export type SecurityActivityOutcome = "SUCCESS" | "FAILURE" | "BLOCKED";

export interface SecurityActivity {
  id: string;
  type: SecurityActivityType;
  title: string;
  description: string;
  severity: SecurityActivitySeverity;
  outcome: SecurityActivityOutcome;
  device: string;
  ipAddress: string;
  createdAt: string;
}

export interface SecurityActivityFilters {
  type?: SecurityActivityType;
  severity?: SecurityActivitySeverity;
  outcome?: SecurityActivityOutcome;
}

export interface SecurityActivityListResponse {
  activities: SecurityActivity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
