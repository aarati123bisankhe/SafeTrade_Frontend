import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import useAuth from "../../hooks/useAuth";
import disputeService from "../../services/dispute.service";
import transactionService from "../../services/transaction.service";
import { TransactionStatus, type TradeTransaction } from "../../types/transaction.types";
import TransactionActionPanel from "../../components/transactions/TransactionActionPanel";
import TransactionProgress from "../../components/transactions/TransactionProgress";
import TransactionStatusBadge from "../../components/transactions/TransactionStatusBadge";
import {
  formatTransactionCurrency,
  formatTransactionDate,
  getTransactionImage,
} from "../../components/transactions/transactionUtils";
import { getApiErrorMessage } from "../../utils/apiError";

export default function TransactionDetailsPage() {
  const { transactionId = "" } = useParams();
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<TradeTransaction | null>(null);
  const [disputeUrl, setDisputeUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isShipping, setIsShipping] = useState(false);
  const [isConfirmingReceipt, setIsConfirmingReceipt] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadTransaction = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await transactionService.getTransactionById(transactionId);
      setTransaction(data);

      if (data.status === TransactionStatus.DISPUTED) {
        const disputes = await disputeService.getMyDisputes();
        const linkedDispute = disputes.find((dispute) => dispute.transactionId === data.id);
        setDisputeUrl(linkedDispute ? `/disputes/${linkedDispute.id}` : undefined);
      } else {
        setDisputeUrl(undefined);
      }
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load this transaction right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    void loadTransaction();
  }, [loadTransaction]);

  const canManageAsSeller = useMemo(() => {
    if (!transaction || !user) {
      return false;
    }

    return user.role === "SELLER" && user.id === transaction.sellerId;
  }, [transaction, user]);

  const canManageAsBuyer = useMemo(() => {
    if (!transaction || !user) {
      return false;
    }

    return user.role === "BUYER" && user.id === transaction.buyerId;
  }, [transaction, user]);

  const handleAccept = async (id: string) => {
    setIsAccepting(true);

    try {
      const updated = await transactionService.acceptTransaction(id);
      setTransaction(updated);
      await loadTransaction();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't accept this order right now.")
      );
    } finally {
      setIsAccepting(false);
    }
  };

  const handleShip = async (id: string) => {
    setIsShipping(true);

    try {
      const updated = await transactionService.shipTransaction(id);
      setTransaction(updated);
      await loadTransaction();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't mark this order as shipped right now.")
      );
    } finally {
      setIsShipping(false);
    }
  };

  const handleConfirmReceipt = async (id: string) => {
    setIsConfirmingReceipt(true);

    try {
      const updated = await transactionService.confirmReceipt(id);
      setTransaction(updated);
      await loadTransaction();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't confirm receipt right now.")
      );
    } finally {
      setIsConfirmingReceipt(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <section className="panel-card ui-card">
          <p>Loading transaction details...</p>
        </section>
      </div>
    );
  }

  if (errorMessage && !transaction) {
    return (
      <div className="dashboard-page">
        <section className="panel-card ui-card">
          <Alert variant="error" title="Transaction unavailable">
            {errorMessage}
          </Alert>
          <Button onClick={() => void loadTransaction()} variant="secondary">
            Retry
          </Button>
        </section>
      </div>
    );
  }

  if (!transaction) {
    return null;
  }

  const buyerDisputableStatuses: TradeTransaction["status"][] = [
    TransactionStatus.FUNDS_HELD,
    TransactionStatus.SELLER_ACCEPTED,
    TransactionStatus.SHIPPED,
  ];

  return (
    <div className="dashboard-page">
      <section className="purchases-hero ui-card">
        <div className="purchases-hero__copy">
          <Badge variant="info">Transaction Details</Badge>
          <h1>{transaction.productName}</h1>
          <p>Review the protected order timeline, counterpart details, and current escrow action.</p>
        </div>
      </section>

      {errorMessage ? (
        <Alert variant="error" title="Transaction action unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      <section className="buyer-main-grid">
        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Order Status</h3>
              <p>The latest escrow state and next expected milestone.</p>
            </div>
            <TransactionStatusBadge status={transaction.status} />
          </div>

          <TransactionProgress status={transaction.status} />

          <div className="purchases-card__details seller-transaction-details">
            <div>
              <span>Agreed price</span>
              <strong>{formatTransactionCurrency(transaction.agreedPrice)}</strong>
            </div>
            <div>
              <span>Purchased on</span>
              <strong>{formatTransactionDate(transaction.createdAt)}</strong>
            </div>
            <div>
              <span>Buyer confirmed</span>
              <strong>{formatTransactionDate(transaction.buyerConfirmedAt)}</strong>
            </div>
            <div>
              <span>Funds released</span>
              <strong>{formatTransactionDate(transaction.releasedAt)}</strong>
            </div>
          </div>

          {canManageAsSeller ? (
            <div className="seller-transaction-action-row">
              <TransactionActionPanel
                transactionId={transaction.id}
                status={transaction.status}
                disputeUrl={disputeUrl}
                isAccepting={isAccepting}
                isShipping={isShipping}
                onAccept={(id) => void handleAccept(id)}
                onShip={(id) => void handleShip(id)}
              />
            </div>
          ) : null}
        </Card>

        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Product Summary</h3>
              <p>The listing that this protected transaction was created from.</p>
            </div>
          </div>

          <div className="dispute-product-row">
            <img
              src={getTransactionImage(transaction.product)}
              alt={transaction.productName}
              className="disputes-card__image"
            />
            <div className="disputes-card__content">
              <strong>{transaction.productName}</strong>
              <span>Location: {transaction.product?.location ?? "Protected local listing"}</span>
              <span>Category: {transaction.product?.category ?? "Not available"}</span>
              {transaction.product?.id ? (
                <Link to={`/products/${transaction.product.id}`} className="purchases-card__details-link">
                  View product listing
                </Link>
              ) : null}
            </div>
          </div>
        </Card>
      </section>

      <section className="buyer-main-grid">
        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>{canManageAsBuyer ? "Seller Details" : "Buyer Details"}</h3>
              <p>
                {canManageAsBuyer
                  ? "The seller attached to this protected order."
                  : "The buyer attached to this order."}
              </p>
            </div>
          </div>
          <div className="purchases-card__details seller-transaction-details">
            <div>
              <span>{canManageAsBuyer ? "Seller username" : "Buyer username"}</span>
              <strong>
                {canManageAsBuyer
                  ? transaction.seller?.username ?? "Not available"
                  : transaction.buyer?.username ?? "Not available"}
              </strong>
            </div>
            <div>
              <span>{canManageAsBuyer ? "Seller email" : "Buyer email"}</span>
              <strong>
                {canManageAsBuyer
                  ? transaction.seller?.email ?? "Not available"
                  : transaction.buyer?.email ?? "Not available"}
              </strong>
            </div>
            <div>
              <span>Transaction ID</span>
              <strong>{transaction.id}</strong>
            </div>
            <div>
              <span>Refunded at</span>
              <strong>{formatTransactionDate(transaction.refundedAt)}</strong>
            </div>
          </div>
        </Card>

        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Available Navigation</h3>
              <p>
                {canManageAsBuyer
                  ? "Jump back to your buyer workflow or take the next supported action."
                  : "Jump back to the most useful seller workflow from here."}
              </p>
            </div>
          </div>

          <div className="seller-transaction-links">
            {canManageAsBuyer ? (
              <Button to="/my-purchases" variant="secondary">
                Back to My Purchases
              </Button>
            ) : (
              <Button to="/seller/sales" variant="secondary">
                Back to My Sales
              </Button>
            )}
            {canManageAsBuyer ? (
              <Button to="/products" variant="ghost">
                Browse Products
              </Button>
            ) : (
              <Button to="/seller/products" variant="ghost">
                Manage Products
              </Button>
            )}
            {canManageAsBuyer && transaction.status === TransactionStatus.SHIPPED ? (
              <Button
                onClick={() => void handleConfirmReceipt(transaction.id)}
                disabled={isConfirmingReceipt}
              >
                {isConfirmingReceipt ? "Confirming..." : "Confirm Receipt"}
              </Button>
            ) : null}
            {canManageAsBuyer &&
            buyerDisputableStatuses.includes(transaction.status) ? (
              <Button
                to="/disputes/new"
                state={{ transactionId: transaction.id }}
                variant="ghost"
              >
                Raise Dispute
              </Button>
            ) : null}
            {transaction.status === TransactionStatus.DISPUTED && disputeUrl ? (
              <Button to={disputeUrl} variant="ghost">
                View Dispute
              </Button>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
