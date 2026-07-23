import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SocialLoginButton from "../../components/auth/SocialLoginButton";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";
import { getDashboardRouteByRole } from "../../utils/authRedirect";

export default function RegisterPage() {
  const { register, isAuthenticated, user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRouteByRole(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setPreviewUrl(null);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await register({
        username,
        email,
        password,
      });

      setSuccessMessage(
        `We sent a verification link to ${response.email}. Please check your email and verify your account before signing in.`
      );
      setPreviewUrl(response.previewUrl ?? null);
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't create your account.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your SafeTrade account"
      description="Create an account to start buying and selling with escrow-backed protection."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMessage ? (
          <Alert variant="error" title="Registration failed">
            {errorMessage}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert variant="success" title="Account created">
            {successMessage}
          </Alert>
        ) : null}

        <Input
          label="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Choose a username"
          autoComplete="username"
          required
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          name="password"
          placeholder="Create a password"
          autoComplete="new-password"
          helperText="Use at least 12 characters with uppercase, lowercase, number, and symbol."
          required
          showStrengthFeedback
        />

        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          name="confirmPassword"
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
        />

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        {previewUrl ? (
          <Button
            to={previewUrl.replace(window.location.origin, "")}
            variant="secondary"
            fullWidth
          >
            Open local verification link
          </Button>
        ) : null}

        <SocialLoginButton />

        <div className="auth-inline-links">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
