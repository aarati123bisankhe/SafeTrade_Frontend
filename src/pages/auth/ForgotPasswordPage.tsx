import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";
import CaptchaChallenge from "../../components/auth/CaptchaChallenge";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import useAuth from "../../hooks/useAuth";
import captchaService from "../../services/captcha.service";
import type { CaptchaChallenge as CaptchaChallengeType } from "../../types/auth.types";
import { getApiErrorMessage } from "../../utils/apiError";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaChallengeType | null>(null);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);

  useEffect(() => {
    const loadCaptcha = async () => {
      setIsRefreshingCaptcha(true);
      try {
        const challenge = await captchaService.getChallenge("PASSWORD_RESET");
        setCaptcha(challenge);
      } finally {
        setIsRefreshingCaptcha(false);
      }
    };

    void loadCaptcha();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setPreviewUrl(null);
    setIsSubmitting(true);

    try {
      const response = await requestPasswordReset({
        email,
        captchaToken: captcha?.captchaToken ?? "",
        captchaAnswer,
      });

      setSuccessMessage(
        "If an account exists for that email, we sent a password reset link."
      );
      setPreviewUrl(response.previewUrl ?? null);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "We couldn't send the reset link right now. Please try again."
        )
      );
      setCaptchaAnswer("");
      const challenge = await captchaService.getChallenge("PASSWORD_RESET");
      setCaptcha(challenge);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter the email linked to your SafeTrade account and we'll prepare a secure reset flow."
      cardClassName="auth-layout__card--compact"
      headerClassName="auth-layout__header--compact"
      footer={
        <p className="auth-meta">
          Reset requests will keep the same security-first experience as sign
          in, including protected account recovery and session safeguards.
        </p>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        {errorMessage ? (
          <Alert variant="error" title="Reset request failed">
            {errorMessage}
          </Alert>
        ) : null}

        {successMessage ? (
          <Alert variant="success" title="Check your email">
            {successMessage}
          </Alert>
        ) : null}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          helperText="Use the email address you signed up with."
          required
        />

        <CaptchaChallenge
          challenge={captcha}
          answer={captchaAnswer}
          onAnswerChange={setCaptchaAnswer}
          onRefresh={() => {
            void (async () => {
              setIsRefreshingCaptcha(true);
              try {
                const challenge = await captchaService.getChallenge("PASSWORD_RESET");
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
          {isSubmitting ? "Sending reset link..." : "Send reset link"}
        </Button>

        {previewUrl ? (
          <Button
            to={previewUrl.replace(window.location.origin, "")}
            variant="secondary"
            fullWidth
          >
            Open local reset link
          </Button>
        ) : null}

        <div className="auth-inline-links">
          <span>Remembered your password?</span>
          <Link to="/login">Back to sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
