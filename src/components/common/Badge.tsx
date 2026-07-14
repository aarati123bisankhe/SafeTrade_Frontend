import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
};

export default function Badge({
  children,
  variant = "default",
}: BadgeProps) {
  return <span className={`ui-badge ui-badge--${variant}`}>{children}</span>;
}
