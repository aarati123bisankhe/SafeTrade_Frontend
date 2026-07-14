import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

type BaseButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

type ButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never;
  };

type LinkButtonProps = BaseButtonProps & {
  to: string;
};

function getButtonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: BaseButtonProps) {
  return [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Button(props: ButtonProps | LinkButtonProps) {
  if ("to" in props && typeof props.to === "string") {
    const { children, to, variant, size, fullWidth, className } = props;

    return (
      <Link
        to={to}
        className={getButtonClassName({
          children,
          variant,
          size,
          fullWidth,
          className,
        })}
      >
        {children}
      </Link>
    );
  }

  const {
    children,
    type = "button",
    variant,
    size,
    fullWidth,
    className,
    ...buttonProps
  } = props;

  return (
    <button
      type={type}
      className={getButtonClassName({
        children,
        variant,
        size,
        fullWidth,
        className,
      })}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
