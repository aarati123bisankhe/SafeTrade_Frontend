import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "", ...divProps }: CardProps) {
  return (
    <div
      className={["ui-card", className].filter(Boolean).join(" ")}
      {...divProps}
    >
      {children}
    </div>
  );
}
