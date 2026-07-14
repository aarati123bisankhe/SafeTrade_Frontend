import type { ReactNode } from "react";

type CardProps = { //card component props
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return <div className={["ui-card", className].filter(Boolean).join(" ")}>{children}</div>;
}
