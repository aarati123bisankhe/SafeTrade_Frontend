import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import useAuth from "../../hooks/useAuth";
import authService from "../../services/auth.service";
import { getApiErrorMessage } from "../../utils/apiError";
import { getDashboardRouteByRole } from "../../utils/authRedirect";

export default function TotpVerificationPage() {
  const { verifyTotp, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mfaToken = authService.getStoredMfaToken();

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRouteByRole(user.role)} replace />;
  }

  if (!mfaToken) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    setIsSubmitting(true);

    try {
      const response = await verifyTotp({ mfaToken, code });
      navigate(getDashboardRouteByRole(response.user.role), { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "We couldn't verify your code."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your identity"
      description="Enter the 6-digit code from your authenticator app to complete sign-in."
      footer={
        <p className="auth-meta">
          This temporary verification step keeps your SafeTrade session
          separate from your permanent access token.
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMessage ? (
          <Alert variant="error" title="Verification failed">
            {errorMessage}
          </Alert>
        ) : null}

        {infoMessage ? (
          <Alert variant="info" title="Recovery flow">
            {infoMessage}
          </Alert>
        ) : null}

        <Input
          label="Authentication code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Enter 6-digit code"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          required
        />

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() =>
            setInfoMessage(
              "Recovery code verification can be connected next using the /auth/totp/recovery route."
            )
          }
        >
          Use recovery code instead
        </Button>

        <div className="auth-inline-links">
          <span>Need to restart sign-in?</span>
          <Link to="/login">Back to login</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
