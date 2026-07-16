import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import SellerOrderCard from "../../components/transactions/SellerOrderCard";
import disputeService from "../../services/dispute.service";
import transactionService from "../../services/transaction.service";
import { DisputeStatus, type Dispute } from "../../types/dispute.types";
import {
  TransactionStatus,
  type TradeTransaction,
} from "../../types/transaction.types";
import { getApiErrorMessage } from "../../utils/apiError";
import { formatTransactionCurrency } from "../../components/transactions/transactionUtils";

const statusTabs: Array<{ label: string; value: "ALL" | TradeTransaction["status"] }> = [
  { label: "All", value: "ALL" },
  { label: "Funds Held", value: TransactionStatus.FUNDS_HELD },
  { label: "Accepted", value: TransactionStatus.SELLER_ACCEPTED },
  { label: "Shipped", value: TransactionStatus.SHIPPED },
  { label: "Disputed", value: TransactionStatus.DISPUTED },
  { label: "Completed", value: TransactionStatus.FUNDS_RELEASED },
  { label: "Refunded", value: TransactionStatus.BUYER_REFUNDED },
];

function OrderSkeleton() {
  return (
    <article className="purchases-card purchases-card--skeleton">
      <div className="purchases-skeleton purchases-skeleton--image" />
      <div className="purchases-card__content">
        <div className="purchases-skeleton purchases-skeleton--title" />
        <div className="purchases-skeleton purchases-skeleton--meta" />
        <div className="purchases-skeleton purchases-skeleton--progress" />
        <div className="purchases-skeleton purchases-skeleton--actions" />
      </div>
    </article>
  );
}

export default function SellerSalesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sales, setSales] = useState<TradeTransaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [shippingId, setShippingId] = useState<string | null>(null);

  const activeStatus = useMemo(() => {
    const status = searchParams.get("status");
    return statusTabs.some((tab) => tab.value === status)
      ? (status as (typeof statusTabs)[number]["value"])
      : "ALL";
  }, [searchParams]);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [salesData, disputesData] = await Promise.all([
        transactionService.getMySales(),
        disputeService.getMyDisputes(),
      ]);
      setSales(salesData);
      setDisputes(disputesData);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your sales orders right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const summary = useMemo(() => {
    const heldStatuses: TradeTransaction["status"][] = [
      TransactionStatus.FUNDS_HELD,
      TransactionStatus.SELLER_ACCEPTED,
      TransactionStatus.SHIPPED,
      TransactionStatus.DISPUTED,
    ];
    const openDisputeStatuses: DisputeStatus[] = [
      DisputeStatus.OPEN,
      DisputeStatus.UNDER_REVIEW,
    ];

    return {
      toAccept: sales.filter((sale) => sale.status === TransactionStatus.FUNDS_HELD).length,
      toShip: sales.filter((sale) => sale.status === TransactionStatus.SELLER_ACCEPTED).length,
      fundsHeld: sales
        .filter((sale) => heldStatuses.includes(sale.status))
        .reduce((sum, sale) => sum + sale.agreedPrice, 0),
      completed: sales.filter((sale) => sale.status === TransactionStatus.FUNDS_RELEASED).length,
      disputes: disputes.filter((dispute) => openDisputeStatuses.includes(dispute.status))
        .length,
    };
  }, [disputes, sales]);

  const filteredSales = useMemo(() => {
    if (activeStatus === "ALL") {
      return sales;
    }

    return sales.filter((sale) => sale.status === activeStatus);
  }, [activeStatus, sales]);

  const disputeUrlByTransactionId = useMemo(() => {
    return new Map(
      disputes.map((dispute) => [dispute.transactionId, `/disputes/${dispute.id}`])
    );
  }, [disputes]);

  const handleAccept = async (transactionId: string) => {
    setAcceptingId(transactionId);

    try {
      await transactionService.acceptTransaction(transactionId);
      await loadSales();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't accept this order right now.")
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleShip = async (transactionId: string) => {
    setShippingId(transactionId);

    try {
      await transactionService.shipTransaction(transactionId);
      await loadSales();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't mark this order as shipped right now.")
      );
    } finally {
      setShippingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Manage protected sales orders"
        description="Review buyer purchases, move orders through escrow, and keep shipping progress visible."
        actions={
          <Button to="/seller/products" variant="secondary">
            Manage Products
          </Button>
        }
      />

      <section className="metrics-grid">
        <Card className="metric-card metric-card--enhanced">
          <span>Orders to Accept</span>
          <strong>{String(summary.toAccept).padStart(2, "0")}</strong>
          <Badge variant="warning">Funds held</Badge>
        </Card>
        <Card className="metric-card metric-card--enhanced">
          <span>Orders to Ship</span>
          <strong>{String(summary.toShip).padStart(2, "0")}</strong>
          <Badge variant="info">Accepted</Badge>
        </Card>
        <Card className="metric-card metric-card--enhanced">
          <span>Funds Held in Escrow</span>
          <strong>{formatTransactionCurrency(summary.fundsHeld)}</strong>
          <Badge variant="success">Protected</Badge>
        </Card>
        <Card className="metric-card metric-card--enhanced">
          <span>Completed Sales</span>
          <strong>{String(summary.completed).padStart(2, "0")}</strong>
          <Badge variant="success">Released</Badge>
        </Card>
        <Card className="metric-card metric-card--enhanced">
          <span>Open Disputes</span>
          <strong>{String(summary.disputes).padStart(2, "0")}</strong>
          <Badge variant="danger">Needs review</Badge>
        </Card>
      </section>

      <section className="panel-card purchases-panel ui-card">
        <div className="panel-card__header">
          <div>
            <h3>Sales Activity</h3>
            <p>Filter your orders by real escrow status and keep fulfillment moving.</p>
          </div>
        </div>

        <div className="purchases-tabs" role="tablist" aria-label="Seller sales statuses">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeStatus === tab.value}
              className={[
                "purchases-tab",
                activeStatus === tab.value ? "purchases-tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                setSearchParams(tab.value === "ALL" ? {} : { status: tab.value })
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {errorMessage ? (
          <div className="purchases-feedback">
            <Alert variant="error" title="Sales unavailable">
              {errorMessage}
            </Alert>
            <Button onClick={() => void loadSales()} variant="secondary">
              Retry
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="transaction-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredSales.length === 0 ? (
          <Card className="marketplace-empty-state purchases-empty-state">
            <Badge variant="info">
              {sales.length === 0 ? "No sales yet" : "No matches"}
            </Badge>
            <h3>
              {sales.length === 0
                ? "No buyer orders have been created yet."
                : "No orders match this status."}
            </h3>
            <p>
              {sales.length === 0
                ? "When buyers purchase your listings, those orders will appear here."
                : "Try another status filter or review all sales."}
            </p>
            <div className="purchases-empty-state__actions">
              <Button to="/seller/products">View My Products</Button>
            </div>
          </Card>
        ) : null}

        {!isLoading && filteredSales.length > 0 ? (
          <div className="transaction-list">
            {filteredSales.map((transaction) => (
              <SellerOrderCard
                key={transaction.id}
                transaction={transaction}
                disputeUrl={disputeUrlByTransactionId.get(transaction.id)}
                isAccepting={acceptingId === transaction.id}
                isShipping={shippingId === transaction.id}
                onAccept={(transactionId) => void handleAccept(transactionId)}
                onShip={(transactionId) => void handleShip(transactionId)}
              />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
