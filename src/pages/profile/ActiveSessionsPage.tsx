import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import ReauthenticationModal from "../../components/security/ReauthenticationModal";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";
import sessionService from "../../services/session.service";
import type { ActiveSession, ReauthenticationAction } from "../../types/auth.types";
import { getApiErrorMessage } from "../../utils/apiError";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRelativeTime(value: string) {
  const differenceMs = Date.now() - new Date(value).getTime();
  const differenceMinutes = Math.max(1, Math.round(differenceMs / 60000));

  if (differenceMinutes < 60) {
    return `${differenceMinutes} minute${differenceMinutes === 1 ? "" : "s"} ago`;
  }

  const differenceHours = Math.round(differenceMinutes / 60);

  if (differenceHours < 24) {
    return `${differenceHours} hour${differenceHours === 1 ? "" : "s"} ago`;
  }

  const differenceDays = Math.round(differenceHours / 24);
  return `${differenceDays} day${differenceDays === 1 ? "" : "s"} ago`;
}

export default function ActiveSessionsPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isRevokingCurrent, setIsRevokingCurrent] = useState(false);
  const [isRevokingOthers, setIsRevokingOthers] = useState(false);
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
  const [reauthAction, setReauthAction] = useState<ReauthenticationAction | null>(null);

  const loadSessions = async () => {
    setErrorMessage("");

    try {
      const response = await sessionService.getSessions();
      setSessions(response);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your active sessions.")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSessions();
  }, []);

  const handleLogoutCurrent = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsRevokingCurrent(true);

    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleRevokeSession = async (session: ActiveSession) => {
    const confirmed = window.confirm(
      "Log out this device?\n\nThis device will immediately lose access to your SafeTrade account."
    );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setRevokingSessionId(session.id);

    try {
      await sessionService.revokeSession(session.id);
      setSuccessMessage("The selected device has been logged out.");
      await loadSessions();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't log out that device.")
      );
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeOthers = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setReauthAction("REVOKE_OTHER_SESSIONS");
  };

  const handleConfirmReauthentication = async (payload: {
    action: ReauthenticationAction;
    method: "PASSWORD" | "TOTP" | "RECOVERY_CODE";
    password?: string;
    code?: string;
  }) => {
    setIsRevokingOthers(true);
    try {
      const { reauthToken } = await authService.reauthenticate(payload);
      await sessionService.revokeOtherSessionsWithReauth(reauthToken);
      setSuccessMessage("All other active devices have been logged out.");
      setReauthAction(null);
      await loadSessions();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't log out the other devices.")
      );
    } finally {
      setIsRevokingOthers(false);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Active Sessions"
        description="Review the devices that currently have access to your SafeTrade account."
        actions={
          <div className="page-header__button-row">
            <Button variant="secondary" onClick={() => void loadSessions()}>
              Refresh
            </Button>
            <Button
              variant="ghost"
              onClick={handleRevokeOthers}
              disabled={isRevokingOthers}
            >
              {isRevokingOthers ? "Logging out..." : "Log out all other devices"}
            </Button>
          </div>
        }
      />

      {errorMessage ? (
        <Alert variant="error" title="Session update failed">
          {errorMessage}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert variant="success" title="Sessions updated">
          {successMessage}
        </Alert>
      ) : null}

      {isLoading ? (
        <Card className="panel-card">
          <Loader label="Loading active sessions..." />
        </Card>
      ) : (
        <div className="profile-stack">
          {sessions.map((session) => (
            <Card key={session.id} className="panel-card session-card">
              <div className="panel-card__header">
                <div>
                  <h3>{session.device}</h3>
                  <p>
                    Approximate IP: {session.ipAddress} • Login time:{" "}
                    {formatDateTime(session.createdAt)}
                  </p>
                </div>
                <Badge variant={session.isCurrent ? "success" : "default"}>
                  {session.isCurrent ? "Current device" : "Active device"}
                </Badge>
              </div>

              <div className="profile-detail-grid session-card__details">
                <div>
                  <span>Last active</span>
                  <strong>{formatRelativeTime(session.lastUsedAt)}</strong>
                </div>
                <div>
                  <span>Session expires</span>
                  <strong>{formatDateTime(session.expiresAt)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{session.isCurrent ? "Current device" : "Signed in"}</strong>
                </div>
              </div>

              <div className="profile-coming-soon">
                {session.isCurrent ? (
                  <Button
                    variant="secondary"
                    onClick={handleLogoutCurrent}
                    disabled={isRevokingCurrent}
                  >
                    {isRevokingCurrent ? "Logging out..." : "Log out this device"}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => void handleRevokeSession(session)}
                    disabled={revokingSessionId === session.id}
                  >
                    {revokingSessionId === session.id
                      ? "Logging out..."
                      : "Log out selected device"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {reauthAction && user ? (
        <ReauthenticationModal
          action={reauthAction}
          user={user}
          isSubmitting={isRevokingOthers}
          message="For your security, please verify your identity before logging out all other active devices."
          onCancel={() => {
            if (isRevokingOthers) {
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
