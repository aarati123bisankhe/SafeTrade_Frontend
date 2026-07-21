import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import Alert from "../../components/common/Alert";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
        <Alert variant="info" title="Design preview">
          The forgot-password screen is ready and matches the current auth UI.
          The reset email action can be connected next.
        </Alert>

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

        <Button type="submit" fullWidth size="lg" disabled>
          Send reset link
        </Button>

        <div className="auth-inline-links">
          <span>Remembered your password?</span>
          <Link to="/login">Back to sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
