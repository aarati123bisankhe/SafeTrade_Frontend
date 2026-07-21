import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";

export default function EmailVerificationPage() {
  const { verifyEmail } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your SafeTrade email...");
  const token = searchParams.get("token");

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    if (!token) {
      hasProcessed.current = true;
      setStatus("error");
      setMessage(
        "We couldn't verify your email because the verification token is missing.",
      );
      return;
    }

    hasProcessed.current = true;

    const handleVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been verified. Redirecting to sign in...");

        window.setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1200);
      } catch (error) {
        setStatus("error");
        setMessage(
          getApiErrorMessage(
            error,
            "We couldn't verify your email. Please request a new registration link.",
          ),
        );
      }
    };

    void handleVerification();
  }, [navigate, token, verifyEmail]);

  return (
    <AuthLayout
      title="Verify your email"
      description="SafeTrade verifies your email address before activating a new account."
    >
      <div className="auth-form">
        {status === "loading" ? <Loader label={message} /> : null}

        {status === "success" ? (
          <Alert variant="success" title="Email verified">
            {message}
          </Alert>
        ) : null}

        {status === "error" ? (
          <>
            <Alert variant="error" title="Verification failed">
              {message}
            </Alert>
            <div className="auth-inline-links">
              <span>Need to start again?</span>
              <Link to="/register">Back to registration</Link>
            </div>
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
}
