import Button from "../common/Button";
import { TransactionStatus, type TradeTransaction } from "../../types/transaction.types";

type TransactionActionPanelProps = {
  transactionId: string;
  status: TradeTransaction["status"];
  disputeUrl?: string;
  isAccepting?: boolean;
  isShipping?: boolean;
  onAccept?: (transactionId: string) => void;
  onShip?: (transactionId: string) => void;
};

export default function TransactionActionPanel({
  transactionId,
  status,
  disputeUrl,
  isAccepting = false,
  isShipping = false,
  onAccept,
  onShip,
}: TransactionActionPanelProps) {
  if (status === TransactionStatus.FUNDS_HELD) {
    return (
      <Button
        size="sm"
        onClick={() => onAccept?.(transactionId)}
        disabled={isAccepting}
      >
        {isAccepting ? "Accepting..." : "Accept Order"}
      </Button>
    );
  }

  if (status === TransactionStatus.SELLER_ACCEPTED) {
    return (
      <Button
        size="sm"
        onClick={() => onShip?.(transactionId)}
        disabled={isShipping}
      >
        {isShipping ? "Updating..." : "Mark as Shipped"}
      </Button>
    );
  }

  if (status === TransactionStatus.SHIPPED) {
    return (
      <Button size="sm" variant="secondary" disabled>
        Waiting for Buyer Confirmation
      </Button>
    );
  }

  if (status === TransactionStatus.DISPUTED) {
    return disputeUrl ? (
      <Button to={disputeUrl} size="sm" variant="secondary">
        View Dispute
      </Button>
    ) : (
      <Button size="sm" variant="secondary" disabled>
        View Dispute
      </Button>
    );
  }

  if (status === TransactionStatus.FUNDS_RELEASED) {
    return (
      <Button size="sm" variant="secondary" disabled>
        Completed
      </Button>
    );
  }

  if (status === TransactionStatus.BUYER_REFUNDED) {
    return (
      <Button size="sm" variant="ghost" disabled>
        Refunded
      </Button>
    );
  }

  return null;
}
