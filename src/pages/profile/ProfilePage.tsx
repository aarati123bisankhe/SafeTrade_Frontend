import { useMemo } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import useAuth from "../../hooks/useAuth";

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
              <Badge variant={user.totpEnabled ? "success" : "warning"}>
                {securityOverview.totpStatus}
              </Badge>
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
          </div>
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
