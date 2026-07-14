import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthLayoutProps = { //auth layout component props
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <section className="auth-layout__visual">
          <Link to="/" className="auth-layout__brand">
            <span className="auth-layout__brand-mark">S</span>
            <div>
              <strong>SafeTrade</strong>
              <span>Protected local marketplace</span>
            </div>
          </Link>

          <div className="auth-layout__copy">
            <span className="section-tag">Security-first access</span>
            <h1>Protected by escrow. Built for trusted local trading.</h1>
            <p>
              Secure account protection, escrow-backed payments, and fair
              dispute support are built into the SafeTrade experience from the
              first sign-in.
            </p>
          </div>

          <div className="auth-layout__trust-grid">
            <div>
              <span>Protected by escrow</span>
              <strong>Buyer payments stay secured until confirmation.</strong>
            </div>
            <div>
              <span>Secure account protection</span>
              <strong>MFA, lockout controls, and session checks help reduce risk.</strong>
            </div>
          </div>
        </section>

        <section className="auth-layout__content">
          <div className="auth-layout__card ui-card">
            <div className="auth-layout__header">
              <h2>{title}</h2>
              <p>{description}</p>
            </div>

            {children}

            {footer ? <div className="auth-layout__footer">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
