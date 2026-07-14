import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "ghost" | "success";
type ButtonSize = "sm" | "md" | "lg";

type BaseButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

type NativeButtonProps = BaseButtonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    to?: never;
  };

type RouterButtonProps = BaseButtonProps &
  Omit<LinkProps, "className" | "children">;

function isRouterButtonProps(
  props: NativeButtonProps | RouterButtonProps
): props is RouterButtonProps {
  return "to" in props && props.to !== undefined;
}

function getButtonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: Omit<BaseButtonProps, "children">) {
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

export default function Button(props: NativeButtonProps | RouterButtonProps) {
  if (isRouterButtonProps(props)) {
    const {
      children,
      to,
      variant,
      size,
      fullWidth,
      className,
      ...linkProps
    } = props;

    return (
      <Link
        to={to}
        {...linkProps}
        className={getButtonClassName({
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
