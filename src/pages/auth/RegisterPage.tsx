import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRouteByRole(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username,
        email,
        password,
      });

      setSuccessMessage("Account created successfully. Redirecting to sign in...");

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { email },
        });
      }, 1200);
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
          helperText="Use a strong password you have not used elsewhere."
        />

        <PasswordInput
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          name="confirmPassword"
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>

        <SocialLoginButton />

        <div className="auth-inline-links">
          <span>Already have an account?</span>
          <Link to="/login">Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
