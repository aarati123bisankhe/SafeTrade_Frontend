import { useEffect, useMemo, useState, type FormEvent } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";
import securityNotificationService from "../../services/security-notification.service";
import { getApiErrorMessage } from "../../utils/apiError";

const SECURITY_NOTIFICATION_POLLING_MS = 45000;

function formatRoleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function formatMemberSince(value?: string) {
  if (!value) {
    return "Member date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
  }).format(new Date(value));
}

function getInitials(username?: string, email?: string) {
  const base = username?.trim() || email?.trim() || "ST";
  const parts = base.split(/[\s._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return base.slice(0, 2).toUpperCase();
}

function ProfileMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="profile-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading, refreshCurrentUser } = useAuth();
  const [setupState, setSetupState] = useState<{
    qrCodeDataUrl: string;
    manualKey: string;
  } | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disableRecoveryCode, setDisableRecoveryCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isEnablingTotp, setIsEnablingTotp] = useState(false);
  const [isDisablingTotp, setIsDisablingTotp] = useState(false);
  const [unreadSecurityNotifications, setUnreadSecurityNotifications] = useState(0);

  const securityOverview = useMemo(() => {
    if (!user) {
      return null;
    }

    return {
      roleLabel: formatRoleLabel(user.role),
      memberSince: formatMemberSince(user.createdAt),
      accountStatus: "Authenticated",
      emailStatus: user.isEmailVerified ? "Verified email" : "Email on file",
      totpStatus: user.totpEnabled ? "Enabled" : "Not enabled",
      googleStatus: "Status unavailable",
      loginSecurity: user.totpEnabled
        ? "Two-step verification is active for sign-in."
        : "Two-step verification can be added when setup is available.",
    };
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    const loadUnreadCount = async () => {
      try {
        const response = await securityNotificationService.getUnreadCount();

        if (isMounted) {
          setUnreadSecurityNotifications(response.unreadCount);
        }
      } catch {
        if (isMounted) {
          setUnreadSecurityNotifications(0);
        }
      }
    };

    void loadUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, SECURITY_NOTIFICATION_POLLING_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <section className="profile-hero ui-card">
          <Loader label="Loading profile..." />
        </section>
      </div>
    );
  }

  if (!user || !securityOverview) {
    return (
      <div className="dashboard-page">
        <section className="panel-card ui-card">
          <Alert variant="error" title="Profile unavailable">
            We couldn't load your profile information right now.
          </Alert>
          <div className="purchases-feedback">
            <Button
              variant="secondary"
              onClick={() => {
                void refreshCurrentUser();
              }}
            >
              Retry
            </Button>
          </div>
        </section>
      </div>
    );
  }

  const resetFeedback = () => {
    setSecurityError("");
    setSecurityMessage("");
  };

  const handleStartSetup = async () => {
    resetFeedback();
    setIsStartingSetup(true);

    try {
      const response = await authService.startTotpSetup();
      setSetupState(response);
      setRecoveryCodes([]);
      setSecurityMessage(
        "Scan the QR code with your authenticator app, then enter the 6-digit code below."
      );
    } catch (error) {
      setSecurityError(
        getApiErrorMessage(error, "We couldn't start two-factor setup.")
      );
    } finally {
      setIsStartingSetup(false);
    }
  };

  const handleEnableTotp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setIsEnablingTotp(true);

    try {
      const response = await authService.enableTotp({ code: setupCode });
      setRecoveryCodes(response.recoveryCodes);
      setSetupCode("");
      setSetupState(null);
      await refreshCurrentUser();
      setSecurityMessage(
        "Two-factor authentication is now enabled. Save your recovery codes somewhere secure."
      );
    } catch (error) {
      setSecurityError(
        getApiErrorMessage(error, "We couldn't enable two-factor authentication.")
      );
    } finally {
      setIsEnablingTotp(false);
    }
  };

  const handleDisableTotp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setIsDisablingTotp(true);

    try {
      await authService.disableTotp({
        password: disablePassword,
        code: disableCode.trim() || undefined,
        recoveryCode: disableRecoveryCode.trim().toUpperCase() || undefined,
      });
      setDisablePassword("");
      setDisableCode("");
      setDisableRecoveryCode("");
      setRecoveryCodes([]);
      await refreshCurrentUser();
      setSecurityMessage("Two-factor authentication has been disabled.");
    } catch (error) {
      setSecurityError(
        getApiErrorMessage(error, "We couldn't disable two-factor authentication.")
      );
    } finally {
      setIsDisablingTotp(false);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="profile-hero ui-card">
        <div className="profile-hero__identity">
          <div className="profile-avatar" aria-hidden="true">
            {getInitials(user.username, user.email)}
          </div>

          <div className="profile-hero__copy">
            <div className="profile-hero__badges">
              <Badge variant="info">Profile</Badge>
              <Badge variant="success">{securityOverview.accountStatus}</Badge>
            </div>
            <h1>{user.username}</h1>
            <p>{user.email}</p>
            <div className="profile-hero__meta">
              <Badge variant="default">{securityOverview.roleLabel}</Badge>
              <span>{securityOverview.memberSince}</span>
            </div>
          </div>
        </div>

        <div className="profile-hero__stats">
          <ProfileMetric label="Role" value={securityOverview.roleLabel} />
          <ProfileMetric label="TOTP" value={securityOverview.totpStatus} />
          <ProfileMetric label="Google OAuth" value={securityOverview.googleStatus} />
        </div>
      </section>

      <section className="buyer-main-grid">
        <Card className="panel-card profile-panel">
          <div className="panel-card__header">
            <div>
              <h3>Personal Information</h3>
              <p>Your account identity and role details from the current session.</p>
            </div>
          </div>

          <div className="profile-detail-grid">
            <div>
              <span>Username</span>
              <strong>{user.username}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{securityOverview.roleLabel}</strong>
            </div>
            <div>
              <span>Account status</span>
              <strong>{securityOverview.accountStatus}</strong>
            </div>
            <div>
              <span>Member since</span>
              <strong>{securityOverview.memberSince}</strong>
            </div>
            <div>
              <span>Email status</span>
              <strong>{securityOverview.emailStatus}</strong>
            </div>
          </div>

          <div className="profile-coming-soon">
            <Button variant="secondary" disabled>
              Edit Profile
            </Button>
            <span>Profile editing is coming soon.</span>
          </div>
        </Card>

        <Card className="panel-card profile-panel">
          <div className="panel-card__header">
            <div>
              <h3>Security Settings</h3>
              <p>Current protection status for sign-in and account safety.</p>
            </div>
          </div>

          {securityError ? (
            <Alert variant="error" title="Security update failed">
              {securityError}
            </Alert>
          ) : null}

          {securityMessage ? (
            <Alert variant="success" title="Security updated">
              {securityMessage}
            </Alert>
          ) : null}

          <div className="profile-stack">
            <div className="profile-list-row">
              <div>
                <strong>Password security</strong>
                <span>Password change controls are not yet supported by the backend.</span>
              </div>
              <Badge variant="default">Coming soon</Badge>
            </div>
            <div className="profile-list-row">
              <div>
                <strong>TOTP status</strong>
                <span>{securityOverview.loginSecurity}</span>
              </div>
              <div className="profile-coming-soon">
                <Badge variant={user.totpEnabled ? "success" : "warning"}>
                  {securityOverview.totpStatus}
                </Badge>
                {user.totpEnabled ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSetupState(null);
                      setRecoveryCodes([]);
                      resetFeedback();
                    }}
                  >
                    Manage
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      void handleStartSetup();
                    }}
                    disabled={isStartingSetup}
                  >
                    {isStartingSetup ? "Starting..." : "Enable TOTP"}
                  </Button>
                )}
              </div>
            </div>
            <div className="profile-list-row">
              <div>
                <strong>Account protection</strong>
                <span>SafeTrade protects access with authenticated sessions and security logging.</span>
              </div>
              <Badge variant="success">Protected</Badge>
            </div>
            <div className="profile-list-row">
              <div>
                <strong>Login security</strong>
                <span>More detailed login history will appear here when backend support is available.</span>
              </div>
              <Badge variant="default">Limited data</Badge>
            </div>
            <div className="profile-list-row">
              <div>
                <strong>Active Sessions</strong>
                <span>Review signed-in devices and revoke access without changing the rest of your security setup.</span>
              </div>
              <div className="profile-coming-soon">
                <Badge variant="info">Available</Badge>
                <Button to="/profile/sessions" variant="secondary">
                  Manage
                </Button>
              </div>
            </div>
            <div className="profile-list-row">
              <div>
                <strong>Security Notifications</strong>
                <span>Review important account alerts such as new logins, password changes, and session revocations.</span>
              </div>
              <div className="profile-coming-soon">
                <Badge variant={unreadSecurityNotifications > 0 ? "warning" : "info"}>
                  {unreadSecurityNotifications > 0
                    ? `${unreadSecurityNotifications} unread`
                    : "Available"}
                </Badge>
                <Button to="/profile/security-notifications" variant="secondary">
                  Manage
                </Button>
              </div>
            </div>
          </div>

          {!user.totpEnabled && setupState ? (
            <form className="profile-stack" onSubmit={handleEnableTotp}>
              <div className="profile-list-row">
                <div>
                  <strong>Authenticator setup</strong>
                  <span>Scan the QR code or enter the manual key in your authenticator app.</span>
                </div>
                <Badge variant="info">Setup in progress</Badge>
              </div>
              <div className="profile-detail-grid">
                <div>
                  <span>Manual key</span>
                  <strong>{setupState.manualKey}</strong>
                </div>
                <div>
                  <span>Verification</span>
                  <strong>Enter the 6-digit code below to finish</strong>
                </div>
              </div>
              <img
                src={setupState.qrCodeDataUrl}
                alt="Authenticator QR code"
                style={{ width: "180px", maxWidth: "100%", borderRadius: "1rem" }}
              />
              <Input
                label="Authenticator code"
                value={setupCode}
                onChange={(event) => setSetupCode(event.target.value)}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                required
              />
              <div className="profile-coming-soon">
                <Button type="submit" variant="success" disabled={isEnablingTotp}>
                  {isEnablingTotp ? "Verifying..." : "Confirm and enable"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSetupState(null);
                    setSetupCode("");
                    resetFeedback();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}

          {user.totpEnabled ? (
            <form className="profile-stack" onSubmit={handleDisableTotp}>
              <div className="profile-list-row">
                <div>
                  <strong>Disable TOTP</strong>
                  <span>Confirm your password and provide either an authenticator code or a recovery code.</span>
                </div>
                <Badge variant="warning">Sensitive action</Badge>
              </div>
              <Input
                label="Current password"
                type="password"
                value={disablePassword}
                onChange={(event) => setDisablePassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <Input
                label="Authenticator code"
                value={disableCode}
                onChange={(event) => setDisableCode(event.target.value)}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
              />
              <Input
                label="Recovery code"
                value={disableRecoveryCode}
                onChange={(event) => setDisableRecoveryCode(event.target.value)}
                placeholder="ABCD-1234"
              />
              <div className="profile-coming-soon">
                <Button type="submit" variant="secondary" disabled={isDisablingTotp}>
                  {isDisablingTotp ? "Disabling..." : "Disable TOTP"}
                </Button>
              </div>
            </form>
          ) : null}

          {recoveryCodes.length > 0 ? (
            <div className="profile-stack">
              <div className="profile-list-row">
                <div>
                  <strong>Recovery codes</strong>
                  <span>Each code can be used once if you lose access to your authenticator app.</span>
                </div>
                <Badge variant="warning">Save now</Badge>
              </div>
              <div className="profile-detail-grid">
                {recoveryCodes.map((recoveryCode) => (
                  <div key={recoveryCode}>
                    <span>Recovery code</span>
                    <strong>{recoveryCode}</strong>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="buyer-main-grid">
        <Card className="panel-card profile-panel">
          <div className="panel-card__header">
            <div>
              <h3>Connected Accounts</h3>
              <p>Google OAuth connection status and future account-linking controls.</p>
            </div>
          </div>

          <div className="profile-stack">
            <div className="profile-list-row">
              <div>
                <strong>Google account</strong>
                <span>
                  SafeTrade has Google OAuth endpoints, but the current profile response does
                  not expose whether your Google account is linked.
                </span>
              </div>
              <Badge variant="default">{securityOverview.googleStatus}</Badge>
            </div>
          </div>

          <div className="profile-coming-soon">
            <Button variant="secondary" disabled>
              Connect Google
            </Button>
            <Button variant="ghost" disabled>
              Disconnect Google
            </Button>
          </div>
        </Card>

        <Card className="panel-card profile-panel">
          <div className="panel-card__header">
            <div>
              <h3>Account Activity</h3>
              <p>Safe account information available from the authenticated user context.</p>
            </div>
          </div>

          <div className="profile-detail-grid">
            <div>
              <span>Account status</span>
              <strong>{securityOverview.accountStatus}</strong>
            </div>
            <div>
              <span>Role badge</span>
              <strong>{securityOverview.roleLabel}</strong>
            </div>
            <div>
              <span>Last login</span>
              <strong>Not available in the current backend response</strong>
            </div>
            <div>
              <span>Recent security info</span>
              <strong>{user.totpEnabled ? "TOTP active" : "TOTP not enabled"}</strong>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
