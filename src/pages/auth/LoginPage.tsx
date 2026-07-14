import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import SocialLoginButton from "../../components/auth/SocialLoginButton";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";
import { getDashboardRouteByRole } from "../../utils/authRedirect";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(
    (location.state as { email?: string } | null)?.email ?? ""
  );
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRouteByRole(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({ email, password });

      if ("requiresTotp" in response && response.requiresTotp) {
        navigate("/auth/totp");
        return;
      }

      if ("accessToken" in response) {
        navigate(getDashboardRouteByRole(response.user.role), { replace: true });
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "We couldn't sign you in."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue using protected local trading with SafeTrade."
      footer={
        <p className="auth-meta">
          Protected with rate limiting, account lockout, multi-factor
          authentication, and secure session controls.
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMessage ? (
          <Alert variant="error" title="Sign-in failed">
            {errorMessage}
          </Alert>
        ) : null}

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
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
          />
          <span>Remember me on this device</span>
        </label>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>

        <SocialLoginButton />

        <div className="auth-inline-links">
          <span>Don't have an account?</span>
          <Link to="/register">Create account</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
