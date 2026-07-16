import Badge from "../common/Badge";
import Button from "../common/Button";
import type { TradeTransaction } from "../../types/transaction.types";
import TransactionActionPanel from "./TransactionActionPanel";
import TransactionProgress from "./TransactionProgress";
import TransactionStatusBadge from "./TransactionStatusBadge";
import {
  formatTransactionCurrency,
  formatTransactionDate,
  getTransactionImage,
} from "./transactionUtils";

type SellerOrderCardProps = {
  transaction: TradeTransaction;
  disputeUrl?: string;
  isAccepting?: boolean;
  isShipping?: boolean;
  onAccept?: (transactionId: string) => void;
  onShip?: (transactionId: string) => void;
};

export default function SellerOrderCard({
  transaction,
  disputeUrl,
  isAccepting = false,
  isShipping = false,
  onAccept,
  onShip,
}: SellerOrderCardProps) {
  return (
    <article className="purchases-card">
      <img
        src={getTransactionImage(transaction.product)}
        alt={transaction.productName}
        className="purchases-card__image"
      />

      <div className="purchases-card__content">
        <div className="transaction-card__top">
          <div className="purchases-card__headline">
            <div className="purchases-card__badges">
              <Badge variant="success">Escrow Protected</Badge>
              <TransactionStatusBadge status={transaction.status} />
            </div>
            <strong>{transaction.productName}</strong>
            <span>Buyer: {transaction.buyer?.username ?? `buyer-${transaction.buyerId.slice(-4)}`}</span>
          </div>

          <div className="transaction-card__meta">
            <strong>{formatTransactionCurrency(transaction.agreedPrice)}</strong>
            <span>Purchased {formatTransactionDate(transaction.createdAt)}</span>
          </div>
        </div>

        <div className="purchases-card__meta">
          <span>Transaction ID: {transaction.id}</span>
          <span>Location: {transaction.product?.location ?? "Protected local listing"}</span>
        </div>

        <TransactionProgress status={transaction.status} />

        <div className="purchases-card__actions">
          <Button to={`/transactions/${transaction.id}`} variant="secondary" size="sm">
            View Details
          </Button>
          <TransactionActionPanel
            transactionId={transaction.id}
            status={transaction.status}
            disputeUrl={disputeUrl}
            isAccepting={isAccepting}
            isShipping={isShipping}
            onAccept={onAccept}
            onShip={onShip}
          />
        </div>
      </div>
    </article>
  );
}
