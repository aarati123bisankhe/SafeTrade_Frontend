import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage(
        "We couldn't reset your password because the reset token is missing."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({ token, password });

      setSuccessMessage(response.message);

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            email: response.email,
            message: "Your password has been reset. Please sign in.",
          },
        });
      }, 1200);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "We couldn't reset your password. Please request a new reset link."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      description="Choose a new password for your SafeTrade account."
      cardClassName="auth-layout__card--compact"
      headerClassName="auth-layout__header--compact"
      footer={
        <p className="auth-meta">
          Reset links expire automatically and can only be used once for your
          account security.
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {!token ? (
          <Alert variant="error" title="Invalid reset link">
            We couldn't find a reset token in this link. Please request a new
            password reset email.
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="error" title="Reset failed">
            {errorMessage}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert variant="success" title="Password updated">
            {successMessage}
          </Alert>
        ) : null}

        <PasswordInput
          label="New password"
          value={password}
          onChange={setPassword}
          name="password"
          placeholder="Create a new password"
          autoComplete="new-password"
          helperText="Use at least 12 characters with uppercase, lowercase, number, and symbol."
          required
          showStrengthFeedback
        />

        <PasswordInput
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          name="confirmPassword"
          placeholder="Confirm your new password"
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          disabled={isSubmitting || !token}
        >
          {isSubmitting ? "Resetting password..." : "Reset password"}
        </Button>

        <div className="auth-inline-links">
          <span>Need another link?</span>
          <Link to="/forgot-password">Request a new reset email</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
