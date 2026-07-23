import type { ReactNode } from "react";

type AlertVariant = "error" | "success" | "info" | "warning";

type AlertProps = {
  title?: string;
  children: ReactNode;
  variant?: AlertVariant;
};

export default function Alert({
  title,
  children,
  variant = "info",
}: AlertProps) {
  return (
    <div className={`ui-alert ui-alert--${variant}`} role="alert">
      {title ? <strong>{title}</strong> : null}
      <span>{children}</span>
    </div>
  );
}
