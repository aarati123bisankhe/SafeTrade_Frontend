import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";
import Loader from "../../components/common/Loader";
import useAuth from "../../hooks/useAuth";
import { getApiErrorMessage } from "../../utils/apiError";
import { getDashboardRouteByRole } from "../../utils/authRedirect";

const redirectToDashboard = (role: "BUYER" | "SELLER" | "ADMIN") => {
  window.location.replace(getDashboardRouteByRole(role));
};

export default function OAuthCallbackPage() {
  const { exchangeGoogleCode, isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting your Google account...");
  const code = searchParams.get("code");

  if (isAuthenticated && user) {
    redirectToDashboard(user.role);
    return null;
  }

  useEffect(() => {
    if (hasProcessed.current) {
      return;
    }

    if (!code) {
      hasProcessed.current = true;
      setStatus("error");
      setMessage("We couldn't complete sign-in because the Google exchange code is missing.");
      return;
    }

    hasProcessed.current = true;

    const handleExchange = async () => {
      try {
        const response = await exchangeGoogleCode(code);
        setStatus("success");
        setMessage("Authentication successful. Redirecting to your dashboard...");

        window.setTimeout(() => {
          redirectToDashboard(response.user.role);
        }, 1000);
      } catch (error) {
        setStatus("error");
        setMessage(getApiErrorMessage(error, "We couldn't complete sign-in."));
      }
    };

    void handleExchange();
  }, [code, exchangeGoogleCode]);

  return (
    <AuthLayout
      title="Google authentication"
      description="SafeTrade is connecting your Google sign-in to a protected session."
    >
      <div className="auth-form">
        {status === "loading" ? (
          <Loader label={message} />
        ) : null}

        {status === "success" ? (
          <Alert variant="success" title="Authentication successful">
            {message}
          </Alert>
        ) : null}

        {status === "error" ? (
          <>
            <Alert variant="error" title="We couldn't complete sign-in">
              {message}
            </Alert>
            <div className="auth-inline-links">
              <span>Try again from the sign-in page.</span>
              <Link to="/login">Back to login</Link>
            </div>
          </>
        ) : null}
      </div>
    </AuthLayout>
  );
}
