import StatusBadge from "../common/StatusBadge";
import type { ProductStatus } from "../../types/product.types";

function formatStatusLabel(status: ProductStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function getStatusVariant(status: ProductStatus) {
  switch (status) {
    case "AVAILABLE":
      return "success";
    case "RESERVED":
      return "warning";
    case "SOLD":
      return "info";
    case "REMOVED":
      return "danger";
    default:
      return "default";
  }
}

export default function ProductStatusBadge({
  status,
}: {
  status: ProductStatus;
}) {
  return (
    <StatusBadge
      label={formatStatusLabel(status)}
      variant={getStatusVariant(status)}
    />
  );
}
