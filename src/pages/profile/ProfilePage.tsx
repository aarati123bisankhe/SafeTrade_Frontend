import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PasswordInput from "../../components/auth/PasswordInput";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import ReauthenticationModal from "../../components/security/ReauthenticationModal";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";
import securityNotificationService from "../../services/security-notification.service";
import type { ReauthenticationAction } from "../../types/auth.types";
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
  const { user, isLoading, refreshCurrentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [setupState, setSetupState] = useState<{
    qrCodeDataUrl: string;
    manualKey: string;
  } | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");
  const [isStartingSetup, setIsStartingSetup] = useState(false);
  const [isEnablingTotp, setIsEnablingTotp] = useState(false);
  const [isSensitiveActionPending, setIsSensitiveActionPending] = useState(false);
  const [unreadSecurityNotifications, setUnreadSecurityNotifications] = useState(0);
  const [reauthAction, setReauthAction] = useState<ReauthenticationAction | null>(null);

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
      googleStatus: user.googleLinked ? "Linked" : "Not linked",
      passwordExpiryStatus: user.passwordChangeRequired
        ? "Change required now"
        : user.passwordExpiresSoon
          ? `Expires in ${user.passwordExpiresInDays ?? "a few"} days`
          : "Up to date",
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

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (newPassword !== confirmNewPassword) {
      setSecurityError("New password and confirmation must match.");
      return;
    }

    setReauthAction("CHANGE_PASSWORD");
  };

  const handleSensitiveAction = async (action: ReauthenticationAction) => {
    resetFeedback();
    setReauthAction(action);
  };

  const handleConfirmReauthentication = async (payload: {
    action: ReauthenticationAction;
    method: "PASSWORD" | "TOTP" | "RECOVERY_CODE";
    password?: string;
    code?: string;
  }) => {
    setIsSensitiveActionPending(true);

    try {
      const { reauthToken } = await authService.reauthenticate(payload);

      if (payload.action === "CHANGE_PASSWORD") {
        await authService.changePassword({
          newPassword,
          reauthToken,
        });
        setNewPassword("");
        setConfirmNewPassword("");
        setSecurityMessage("Password changed successfully. Please sign in again.");
        setReauthAction(null);
        await logout();
        navigate("/login", { replace: true });
        return;
      }

      if (payload.action === "DISABLE_TOTP") {
        await authService.disableTotp({ reauthToken });
        setRecoveryCodes([]);
        await refreshCurrentUser();
        setSecurityMessage("Two-factor authentication has been disabled.");
      }

      if (payload.action === "REGENERATE_RECOVERY_CODES") {
        const response = await authService.regenerateRecoveryCodes({ reauthToken });
        setRecoveryCodes(response.recoveryCodes);
        setSecurityMessage(
          "Recovery codes regenerated successfully. All previous recovery codes are no longer valid."
        );
      }

      if (payload.action === "UNLINK_GOOGLE") {
        await authService.unlinkGoogle(reauthToken);
        await refreshCurrentUser();
        setSecurityMessage("Google account unlinked successfully.");
      }

      setReauthAction(null);
    } catch (error) {
      setSecurityError(
        getApiErrorMessage(error, "We couldn't verify your identity for that action.")
      );
    } finally {
      setIsSensitiveActionPending(false);
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

          {user.passwordChangeRequired ? (
            <Alert variant="error" title="Password change required">
              Your password has expired. Change it now to continue using the rest of your account safely.
            </Alert>
          ) : null}

          {!user.passwordChangeRequired && user.passwordExpiresSoon ? (
            <Alert variant="warning" title="Password expiry warning">
              Your password will expire in {user.passwordExpiresInDays ?? "a few"} day
              {user.passwordExpiresInDays === 1 ? "" : "s"}. Update it now to avoid interruption.
            </Alert>
          ) : null}

          {searchParams.get("passwordFlow") === "expired" && !user.passwordChangeRequired ? (
            <Alert variant="warning" title="Password updated">
              Your password-expiry restriction has been cleared. You can continue using the rest of your account.
            </Alert>
          ) : null}

          <div className="profile-stack">
            <div className="profile-list-row">
              <div>
                <strong>Password security</strong>
                <span>Choose a strong password, avoid reusing recent passwords, and confirm your identity before the change is applied.</span>
              </div>
              <Badge variant={user.passwordChangeRequired ? "danger" : user.passwordExpiresSoon ? "warning" : "info"}>
                {securityOverview.passwordExpiryStatus}
              </Badge>
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
            {user.totpEnabled ? (
              <div className="profile-list-row">
                <div>
                  <strong>Recovery code rotation</strong>
                  <span>Generate a completely new recovery-code set and invalidate every previous code.</span>
                </div>
                <div className="profile-coming-soon">
                  <Badge variant="warning">Sensitive action</Badge>
                  <Button
                    variant="secondary"
                    onClick={() => void handleSensitiveAction("REGENERATE_RECOVERY_CODES")}
                    disabled={isSensitiveActionPending}
                  >
                    {isSensitiveActionPending &&
                    reauthAction === "REGENERATE_RECOVERY_CODES"
                      ? "Regenerating..."
                      : "Regenerate"}
                  </Button>
                </div>
              </div>
            ) : null}
            <div className="profile-list-row">
              <div>
                <strong>Security Activity</strong>
                <span>Review a chronological history of important sign-in, password, session, and security-protection events.</span>
              </div>
              <div className="profile-coming-soon">
                <Badge variant="info">Available</Badge>
                <Button to="/profile/security-activity" variant="secondary">
                  Manage
                </Button>
              </div>
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

          <form className="profile-stack" onSubmit={handleChangePassword}>
            <div className="profile-list-row">
              <div>
                <strong>Change password</strong>
                <span>This high-risk action requires a short re-authentication step.</span>
              </div>
              <Badge variant="warning">Sensitive action</Badge>
            </div>
            <div className="profile-password-fields">
              <PasswordInput
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                name="newPassword"
                autoComplete="new-password"
                helperText="Choose a stronger password with at least 12 characters, uppercase and lowercase letters, a number, and a special character."
                required
                showStrengthFeedback
                userInputs={[user.username, user.email]}
              />
              <PasswordInput
                label="Confirm new password"
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                name="confirmNewPassword"
                autoComplete="new-password"
                required
              />
            </div>
            <div className="profile-coming-soon">
              <Button type="submit" variant="secondary" disabled={isSensitiveActionPending}>
                {user.passwordChangeRequired ? "Change password now" : "Change password"}
              </Button>
            </div>
          </form>

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
            <div className="profile-stack">
              <div className="profile-list-row">
                <div>
                  <strong>Disable TOTP</strong>
                  <span>Confirm your identity again before turning off two-factor authentication.</span>
                </div>
                <Badge variant="warning">Sensitive action</Badge>
              </div>
              <div className="profile-coming-soon">
                <Button
                  variant="secondary"
                  onClick={() => void handleSensitiveAction("DISABLE_TOTP")}
                  disabled={isSensitiveActionPending}
                >
                  {isSensitiveActionPending && reauthAction === "DISABLE_TOTP"
                    ? "Disabling..."
                    : "Disable TOTP"}
                </Button>
              </div>
            </div>
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
              {user.totpEnabled ? (
                <div className="profile-coming-soon">
                  <Button
                    variant="secondary"
                    onClick={() => void handleSensitiveAction("REGENERATE_RECOVERY_CODES")}
                    disabled={isSensitiveActionPending}
                  >
                    {isSensitiveActionPending &&
                    reauthAction === "REGENERATE_RECOVERY_CODES"
                      ? "Regenerating..."
                      : "Regenerate recovery codes"}
                  </Button>
                  <span>
                    Generating new recovery codes will permanently invalidate all
                    existing recovery codes.
                  </span>
                </div>
              ) : null}
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
                  Review whether your SafeTrade account can use Google as a sign-in
                  method.
                </span>
              </div>
              <Badge variant={user.googleLinked ? "success" : "default"}>
                {securityOverview.googleStatus}
              </Badge>
            </div>
          </div>

          <div className="profile-coming-soon">
            <Button variant="secondary" disabled>
              Connect Google
            </Button>
            <Button
              variant="ghost"
              onClick={() => void handleSensitiveAction("UNLINK_GOOGLE")}
              disabled={!user.googleLinked || isSensitiveActionPending}
            >
              Disconnect Google
            </Button>
          </div>
        </Card>

        <Card className="panel-card profile-panel">
          <div className="panel-card__header">
            <div>
              <h3>Security Activity</h3>
              <p>Open your full account-security timeline without exposing internal audit details.</p>
            </div>
          </div>

          <div className="profile-detail-grid">
            <div>
              <span>Coverage</span>
              <strong>Login, password, TOTP, session, and re-authentication events</strong>
            </div>
            <div>
              <span>Privacy</span>
              <strong>Masked IPs and safe device labels only</strong>
            </div>
            <div>
              <span>Visibility</span>
              <strong>Your affected-account events only</strong>
            </div>
            <div>
              <span>Purpose</span>
              <strong>Chronological security history for your account</strong>
            </div>
          </div>

          <div className="profile-coming-soon">
            <Button to="/profile/security-activity" variant="secondary">
              Review security activity
            </Button>
          </div>
        </Card>
      </section>

      {reauthAction ? (
        <ReauthenticationModal
          action={reauthAction}
          user={user}
          isSubmitting={isSensitiveActionPending}
          message={
            reauthAction === "REGENERATE_RECOVERY_CODES"
              ? "For your security, please verify your identity before generating a new set of recovery codes. Your current recovery codes will stop working immediately."
              : reauthAction === "UNLINK_GOOGLE"
                ? "For your security, please verify your identity before removing Google from your SafeTrade sign-in methods."
                : undefined
          }
          onCancel={() => {
            if (isSensitiveActionPending) {
              return;
            }
            setReauthAction(null);
          }}
          onConfirm={handleConfirmReauthentication}
        />
      ) : null}
    </div>
  );
}
