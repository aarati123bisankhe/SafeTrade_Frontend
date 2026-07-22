import { useState, type FormEvent } from "react";

import Button from "../common/Button";
import Card from "../common/Card";
import Input from "../common/Input";
import type {
  ReauthenticateRequest,
  ReauthenticationAction,
  ReauthenticationMethod,
  User,
} from "../../types/auth.types";

type ReauthenticationModalProps = {
  action: ReauthenticationAction;
  user: User;
  isSubmitting: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: (payload: ReauthenticateRequest) => Promise<void>;
};

function getInitialMethod(user: User): ReauthenticationMethod {
  if (user.totpEnabled) {
    return user.passwordAuthEnabled ? "PASSWORD" : "TOTP";
  }

  return "PASSWORD";
}

export default function ReauthenticationModal({
  action,
  user,
  isSubmitting,
  title = "Confirm it's you",
  message = "For your security, please verify your identity before continuing.",
  onCancel,
  onConfirm,
}: ReauthenticationModalProps) {
  const [method, setMethod] = useState<ReauthenticationMethod>(getInitialMethod(user));
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const supportsPassword = Boolean(user.passwordAuthEnabled);
  const supportsTotp = Boolean(user.totpEnabled);
  const showPassword = method === "PASSWORD";
  const showTotpCode = method === "TOTP" || (method === "PASSWORD" && supportsTotp);
  const usesRecoveryCode = method === "RECOVERY_CODE";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onConfirm({
      action,
      method,
      ...(showPassword ? { password } : {}),
      ...(showTotpCode || usesRecoveryCode ? { code } : {}),
    });
  };

  return (
    <div className="seller-modal" role="dialog" aria-modal="true" aria-labelledby="reauth-title">
      <div className="seller-modal__backdrop" onClick={onCancel} />
      <Card className="seller-modal__card">
        <form className="seller-modal__content" onSubmit={handleSubmit}>
          <h3 id="reauth-title">{title}</h3>
          <p>{message}</p>

          {supportsTotp ? (
            <div className="profile-coming-soon">
              {supportsPassword ? (
                <Button
                  variant={method === "PASSWORD" ? "secondary" : "ghost"}
                  onClick={() => {
                    setMethod("PASSWORD");
                    setCode("");
                  }}
                  disabled={isSubmitting}
                >
                  Password {supportsTotp ? "+ code" : ""}
                </Button>
              ) : null}
              {!supportsPassword ? (
                <Button
                  variant={method === "TOTP" ? "secondary" : "ghost"}
                  onClick={() => {
                    setMethod("TOTP");
                    setPassword("");
                  }}
                  disabled={isSubmitting}
                >
                  Authenticator code
                </Button>
              ) : null}
              <Button
                variant={method === "RECOVERY_CODE" ? "secondary" : "ghost"}
                onClick={() => {
                  setMethod("RECOVERY_CODE");
                  setPassword("");
                  setCode("");
                }}
                disabled={isSubmitting}
              >
                Recovery code
              </Button>
            </div>
          ) : null}

          {showPassword ? (
            <Input
              label="Current password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
          ) : null}

          {showTotpCode ? (
            <Input
              label={method === "TOTP" ? "Authentication code" : "Authentication code"}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              required
            />
          ) : null}

          {usesRecoveryCode ? (
            <>
              <Input
                label="Recovery code"
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="ABCD-1234"
                required
              />
              <p className="reauth-note">
                Using a recovery code will permanently consume it.
              </p>
            </>
          ) : null}

          <div className="seller-modal__actions">
            <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify and continue"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
