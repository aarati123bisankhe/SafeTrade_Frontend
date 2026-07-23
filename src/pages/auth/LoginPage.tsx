import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import CaptchaChallenge from "../../components/auth/CaptchaChallenge";
import PasswordInput from "../../components/auth/PasswordInput";
import SocialLoginButton from "../../components/auth/SocialLoginButton";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import useAuth from "../../hooks/useAuth";
import captchaService from "../../services/captcha.service";
import { getApiErrorMessage } from "../../utils/apiError";
import { getDashboardRouteByRole } from "../../utils/authRedirect";
import type { CaptchaChallenge as CaptchaChallengeType } from "../../types/auth.types";

export default function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const locationState = (location.state as
    | { email?: string; message?: string }
    | null);
  const [email, setEmail] = useState(
    locationState?.email ?? ""
  );
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaChallengeType | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage] = useState(locationState?.message ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);
  const oauthErrorMessage = useMemo(() => {
    const error = searchParams.get("error");

    if (!error) {
      return "";
    }

    return decodeURIComponent(error);
  }, [searchParams]);

  useEffect(() => {
    const loadCaptcha = async () => {
      setIsRefreshingCaptcha(true);
      try {
        const challenge = await captchaService.getChallenge("LOGIN");
        setCaptcha(challenge);
      } finally {
        setIsRefreshingCaptcha(false);
      }
    };

    void loadCaptcha();
  }, []);

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardRouteByRole(user.role)} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await login({
        email,
        password,
        captchaToken: captcha?.captchaToken ?? "",
        captchaAnswer,
      });

      if ("requiresTotp" in response && response.requiresTotp) {
        navigate("/auth/totp");
        return;
      }

      if ("accessToken" in response) {
        navigate(getDashboardRouteByRole(response.user.role), { replace: true });
      }
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "We couldn't sign you in."));
      setCaptchaAnswer("");
      const challenge = await captchaService.getChallenge("LOGIN");
      setCaptcha(challenge);
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
        {successMessage ? (
          <Alert variant="success" title="Ready to sign in">
            {successMessage}
          </Alert>
        ) : null}

        {errorMessage ? (
          <Alert variant="error" title="Sign-in failed">
            {errorMessage}
          </Alert>
        ) : null}

        {!errorMessage && oauthErrorMessage ? (
          <Alert variant="error" title="Google sign-in failed">
            {oauthErrorMessage}
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

        <div className="auth-form__row">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <span>Remember me on this device</span>
          </label>

          <Link
            to="/forgot-password"
            className="auth-text-link auth-text-link--small"
          >
            Forgot password?
          </Link>
        </div>

        <CaptchaChallenge
          challenge={captcha}
          answer={captchaAnswer}
          onAnswerChange={setCaptchaAnswer}
          onRefresh={() => {
            void (async () => {
              setIsRefreshingCaptcha(true);
              try {
                const challenge = await captchaService.getChallenge("LOGIN");
                setCaptcha(challenge);
                setCaptchaAnswer("");
              } finally {
                setIsRefreshingCaptcha(false);
              }
            })();
          }}
          isRefreshing={isRefreshingCaptcha}
        />

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
