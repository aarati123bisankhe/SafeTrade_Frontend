import Badge from "./Badge";

type StatusBadgeVariant = "success" | "warning" | "danger" | "info" | "default"; 

type StatusBadgeProps = {
  label: string;
  variant?: StatusBadgeVariant;
};

export default function StatusBadge({
  label,
  variant = "default",
}: StatusBadgeProps) {
  return <Badge variant={variant}>{label}</Badge>;
}
