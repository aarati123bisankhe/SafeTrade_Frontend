import StatusBadge from "../common/StatusBadge";
import type { TradeTransaction } from "../../types/transaction.types";
import {
  formatTransactionStatusLabel,
  getTransactionStatusVariant,
} from "./transactionUtils";

export default function TransactionStatusBadge({
  status,
}: {
  status: TradeTransaction["status"];
}) {
  return (
    <StatusBadge
      label={formatTransactionStatusLabel(status)}
      variant={getTransactionStatusVariant(status)}
    />
  );
}
