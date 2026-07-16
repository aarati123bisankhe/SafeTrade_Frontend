import { TransactionStatus, type TradeTransaction } from "../../types/transaction.types";
import {
  formatTransactionStatusLabel,
  normalizeTransactionProgressStatus,
  sellerTransactionProgressSteps,
} from "./transactionUtils";

export default function TransactionProgress({
  status,
}: {
  status: TradeTransaction["status"];
}) {
  const normalizedStatus = normalizeTransactionProgressStatus(status);

  if (
    normalizedStatus === TransactionStatus.DISPUTED ||
    normalizedStatus === TransactionStatus.BUYER_REFUNDED
  ) {
    return (
      <div
        className={[
          "purchases-special-state",
          status === TransactionStatus.DISPUTED
            ? "purchases-special-state--disputed"
            : "purchases-special-state--refunded",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <strong>{formatTransactionStatusLabel(status)}</strong>
        <span>
          {status === TransactionStatus.DISPUTED
            ? "This order is currently under dispute review."
            : "This order was refunded after review."}
        </span>
      </div>
    );
  }

  const activeIndex = sellerTransactionProgressSteps.indexOf(
    normalizedStatus as (typeof sellerTransactionProgressSteps)[number]
  );

  return (
    <div className="transaction-progress" aria-label={`Progress: ${formatTransactionStatusLabel(status)}`}>
      {sellerTransactionProgressSteps.map((step, index) => {
        const isActive = activeIndex >= index;

        return (
          <div
            key={step}
            className={[
              "transaction-progress__step",
              isActive ? "transaction-progress__step--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="transaction-progress__dot" />
            <span>{formatTransactionStatusLabel(step)}</span>
          </div>
        );
      })}
    </div>
  );
}
