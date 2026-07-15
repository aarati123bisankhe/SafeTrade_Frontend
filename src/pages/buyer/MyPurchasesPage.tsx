import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import transactionService from "../../services/transaction.service";
import type { Product } from "../../types/product.types";
import {
  TransactionStatus,
  type TradeTransaction,
} from "../../types/transaction.types";
import { getApiErrorMessage } from "../../utils/apiError";

const SUMMARY_CARD_VARIANTS = {
  active: "info",
  escrow: "success",
  completed: "default",
  disputes: "warning",
} as const;

const statusTabs = [
  { label: "All", value: "ALL" },
  { label: "Funds Held", value: TransactionStatus.FUNDS_HELD },
  { label: "Seller Accepted", value: TransactionStatus.SELLER_ACCEPTED },
  { label: "Shipped", value: TransactionStatus.SHIPPED },
  { label: "Completed", value: TransactionStatus.FUNDS_RELEASED },
  { label: "Disputed", value: TransactionStatus.DISPUTED },
  { label: "Refunded", value: TransactionStatus.BUYER_REFUNDED },
] as const;

const progressSteps = [
  TransactionStatus.FUNDS_HELD,
  TransactionStatus.SELLER_ACCEPTED,
  TransactionStatus.SHIPPED,
  TransactionStatus.FUNDS_RELEASED,
] as const;

type StatusTabValue = (typeof statusTabs)[number]["value"];

function SummaryIcon({
  tone,
}: {
  tone: keyof typeof SUMMARY_CARD_VARIANTS;
}) {
  const paths = {
    active: (
      <path d="M8 10V8a4 4 0 1 1 8 0v2m-9 0h10l1 10H6l1-10Z" />
    ),
    escrow: (
      <path d="M12 3l7 3v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Z" />
    ),
    completed: <path d="m7 12 3 3 7-7m-5-5a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />,
    disputes: (
      <path d="M12 8v4m0 4h.01M10.3 4.9 3.6 16.2A1.4 1.4 0 0 0 4.8 18h14.4a1.4 1.4 0 0 0 1.2-1.8L13.7 4.9a1.4 1.4 0 0 0-2.4 0Z" />
    ),
  };

  return (
    <span className="metric-card__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {paths[tone]}
      </svg>
    </span>
  );
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString()}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatStatusLabel(value: string) {
  if (value === TransactionStatus.BUYER_REFUNDED) {
    return "Refunded";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusVariant(status: TradeTransaction["status"]) {
  switch (status) {
    case TransactionStatus.FUNDS_HELD:
      return "warning";
    case TransactionStatus.SELLER_ACCEPTED:
      return "info";
    case TransactionStatus.SHIPPED:
      return "info";
    case TransactionStatus.FUNDS_RELEASED:
      return "success";
    case TransactionStatus.DISPUTED:
      return "danger";
    case TransactionStatus.BUYER_REFUNDED:
      return "default";
    default:
      return "default";
  }
}

function normalizeProgressStatus(status: TradeTransaction["status"]) {
  if (status === TransactionStatus.READY_FOR_COLLECTION) {
    return TransactionStatus.SHIPPED;
  }

  if (status === TransactionStatus.BUYER_CONFIRMED) {
    return TransactionStatus.FUNDS_RELEASED;
  }

  return status;
}

function getEscrowStateLabel(status: TradeTransaction["status"]) {
  switch (status) {
    case TransactionStatus.FUNDS_RELEASED:
      return "Escrow Released";
    case TransactionStatus.BUYER_REFUNDED:
      return "Refund Processed";
    case TransactionStatus.DISPUTED:
      return "Escrow Under Review";
    default:
      return "Escrow Protected";
  }
}

function getPurchaseImage(product?: Product) {
  if (product?.imageUrl?.trim()) {
    return product.imageUrl;
  }

  const category = product?.category ?? "OTHER";
  const accentMap: Record<string, { start: string; end: string; accent: string; label: string }> = {
    BOOKS: { start: "#eff6ff", end: "#dbeafe", accent: "#2563eb", label: "BOOKS" },
    ELECTRONICS: { start: "#ecfeff", end: "#cffafe", accent: "#0891b2", label: "TECH" },
    CLOTHING: { start: "#fdf2f8", end: "#fce7f3", accent: "#db2777", label: "STYLE" },
    FURNITURE: { start: "#fef3c7", end: "#fde68a", accent: "#b45309", label: "HOME" },
    HANDMADE: { start: "#ecfccb", end: "#d9f99d", accent: "#65a30d", label: "CRAFT" },
    OTHER: { start: "#f8fafc", end: "#e2e8f0", accent: "#475569", label: "SAFE" },
  };

  const art = accentMap[category] ?? accentMap.OTHER;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${art.start}" />
          <stop offset="100%" stop-color="${art.end}" />
        </linearGradient>
      </defs>
      <rect width="320" height="320" rx="32" fill="url(#bg)" />
      <circle cx="250" cy="70" r="52" fill="${art.accent}" fill-opacity="0.18" />
      <circle cx="78" cy="250" r="64" fill="${art.accent}" fill-opacity="0.12" />
      <rect x="56" y="62" width="208" height="196" rx="28" fill="#fff" fill-opacity="0.84" />
      <rect x="82" y="94" width="156" height="92" rx="20" fill="${art.accent}" fill-opacity="0.16" />
      <text x="160" y="149" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" fill="${art.accent}">${art.label}</text>
      <rect x="84" y="208" width="112" height="12" rx="6" fill="${art.accent}" fill-opacity="0.24" />
      <rect x="84" y="230" width="84" height="10" rx="5" fill="${art.accent}" fill-opacity="0.16" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function PurchaseSkeleton() {
  return (
    <article className="purchases-card purchases-card--skeleton">
      <div className="purchases-skeleton purchases-skeleton--image" />
      <div className="purchases-card__content">
        <div className="purchases-skeleton purchases-skeleton--title" />
        <div className="purchases-skeleton purchases-skeleton--meta" />
        <div className="purchases-skeleton purchases-skeleton--meta" />
        <div className="purchases-skeleton purchases-skeleton--progress" />
        <div className="purchases-skeleton purchases-skeleton--actions" />
      </div>
    </article>
  );
}

function TransactionProgress({ status }: { status: TradeTransaction["status"] }) {
  const normalizedStatus = normalizeProgressStatus(status);

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
        <strong>{formatStatusLabel(status)}</strong>
        <span>
          {status === TransactionStatus.DISPUTED
            ? "This purchase is currently under dispute review."
            : "This purchase has been refunded to the buyer."}
        </span>
      </div>
    );
  }

  const activeIndex = progressSteps.indexOf(
    normalizedStatus as (typeof progressSteps)[number]
  );

  return (
    <div className="transaction-progress" aria-label={`Progress: ${formatStatusLabel(status)}`}>
      {progressSteps.map((step, index) => {
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
            <span>{formatStatusLabel(step)}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<TradeTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<StatusTabValue>("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPurchases = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await transactionService.getMyPurchases();
      setPurchases(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your purchases right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPurchases();
  }, [loadPurchases]);

  const summary = useMemo(() => {
    const activeStatuses: TradeTransaction["status"][] = [
      TransactionStatus.FUNDS_HELD,
      TransactionStatus.SELLER_ACCEPTED,
      TransactionStatus.SHIPPED,
    ];
    const escrowStatuses: TradeTransaction["status"][] = [
      ...activeStatuses,
      TransactionStatus.DISPUTED,
    ];

    const activePurchases = purchases.filter((purchase) =>
      activeStatuses.includes(purchase.status)
    ).length;

    const fundsInEscrow = purchases
      .filter((purchase) => escrowStatuses.includes(purchase.status))
      .reduce((sum, purchase) => sum + purchase.agreedPrice, 0);

    const completedOrders = purchases.filter(
      (purchase) => purchase.status === TransactionStatus.FUNDS_RELEASED
    ).length;

    const openDisputes = purchases.filter(
      (purchase) => purchase.status === TransactionStatus.DISPUTED
    ).length;

    return {
      activePurchases,
      fundsInEscrow,
      completedOrders,
      openDisputes,
    };
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    if (activeTab === "ALL") {
      return purchases;
    }

    return purchases.filter((purchase) => purchase.status === activeTab);
  }, [activeTab, purchases]);

  const handleConfirmReceipt = async (transactionId: string) => {
    setConfirmingId(transactionId);

    try {
      const updatedTransaction = await transactionService.confirmReceipt(transactionId);
      setPurchases((current) =>
        current.map((purchase) =>
          purchase.id === transactionId ? updatedTransaction : purchase
        )
      );
      void loadPurchases();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't confirm receipt right now.")
      );
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <section className="purchases-hero ui-card">
        <div className="purchases-hero__copy">
          <Badge variant="info">My Purchases</Badge>
          <h1>Track every protected purchase in one place</h1>
          <p>
            Follow escrow progress, confirm receipt when items arrive, and keep your
            buyer protection within reach.
          </p>
        </div>
      </section>

      <section className="metrics-grid">
        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="active" />
            <Badge variant={SUMMARY_CARD_VARIANTS.active}>Active Purchases</Badge>
          </div>
          <strong>{String(summary.activePurchases).padStart(2, "0")}</strong>
          <span className="metric-card__detail">
            Orders currently moving through escrow
          </span>
        </Card>

        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="escrow" />
            <Badge variant={SUMMARY_CARD_VARIANTS.escrow}>Funds in Escrow</Badge>
          </div>
          <strong>{formatCurrency(summary.fundsInEscrow)}</strong>
          <span className="metric-card__detail">
            Protected until delivery or dispute resolution
          </span>
        </Card>

        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="completed" />
            <Badge variant={SUMMARY_CARD_VARIANTS.completed}>Completed Orders</Badge>
          </div>
          <strong>{String(summary.completedOrders).padStart(2, "0")}</strong>
          <span className="metric-card__detail">
            Purchases with released escrow funds
          </span>
        </Card>

        <Card className="metric-card metric-card--enhanced">
          <div className="metric-card__top">
            <SummaryIcon tone="disputes" />
            <Badge variant={SUMMARY_CARD_VARIANTS.disputes}>Open Disputes</Badge>
          </div>
          <strong>{String(summary.openDisputes).padStart(2, "0")}</strong>
          <span className="metric-card__detail">
            Purchases currently under review
          </span>
        </Card>
      </section>

      <section className="panel-card purchases-panel ui-card">
        <div className="panel-card__header">
          <div>
            <h3>Purchase Activity</h3>
            <p>Filter purchases by their live escrow state.</p>
          </div>
        </div>

        <div className="purchases-tabs" role="tablist" aria-label="Purchase statuses">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              className={[
                "purchases-tab",
                activeTab === tab.value ? "purchases-tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {errorMessage ? (
          <div className="purchases-feedback">
            <Alert variant="error" title="Purchases unavailable">
              {errorMessage}
            </Alert>
            <Button onClick={() => void loadPurchases()} variant="secondary">
              Retry
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="transaction-list">
            {Array.from({ length: 4 }).map((_, index) => (
              <PurchaseSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredPurchases.length === 0 ? (
          <Card className="marketplace-empty-state purchases-empty-state">
            <Badge variant="info">
              {purchases.length === 0 ? "No purchases yet" : "No matches"}
            </Badge>
            <h3>
              {purchases.length === 0
                ? "You haven't made a purchase yet."
                : "No purchases match this status."}
            </h3>
            <p>
              {purchases.length === 0
                ? "Browse protected listings and your purchases will appear here once escrow starts."
                : "Try another status tab or review all purchases."}
            </p>
            <div className="purchases-empty-state__actions">
              <Button to="/products">Browse Products</Button>
            </div>
          </Card>
        ) : null}

        {!isLoading && filteredPurchases.length > 0 ? (
          <div className="transaction-list">
            {filteredPurchases.map((purchase) => {
              const isExpanded = expandedId === purchase.id;
              const canConfirmReceipt = purchase.status === TransactionStatus.SHIPPED;
              const canRaiseDispute = [
                TransactionStatus.FUNDS_HELD,
                TransactionStatus.SELLER_ACCEPTED,
                TransactionStatus.SHIPPED,
              ] as TradeTransaction["status"][];
              const canRaiseDisputeForStatus = canRaiseDispute.includes(purchase.status);
              const isDisputed = purchase.status === TransactionStatus.DISPUTED;

              return (
                <article key={purchase.id} className="purchases-card">
                  <img
                    src={getPurchaseImage(purchase.product)}
                    alt={purchase.productName}
                    className="purchases-card__image"
                  />

                  <div className="purchases-card__content">
                    <div className="transaction-card__top">
                      <div className="purchases-card__headline">
                        <div className="purchases-card__badges">
                          <Badge variant="success">{getEscrowStateLabel(purchase.status)}</Badge>
                          <StatusBadge
                            label={formatStatusLabel(purchase.status)}
                            variant={getStatusVariant(purchase.status)}
                          />
                        </div>
                        <strong>{purchase.productName}</strong>
                        <span>
                          Seller: {purchase.seller?.username ?? `seller-${purchase.sellerId.slice(-4)}`}
                        </span>
                      </div>

                      <div className="transaction-card__meta">
                        <strong>{formatCurrency(purchase.agreedPrice)}</strong>
                        <span>Purchased {formatDate(purchase.createdAt)}</span>
                      </div>
                    </div>

                    <div className="purchases-card__meta">
                      <span>Transaction ID: {purchase.id}</span>
                      <span>
                        Location: {purchase.product?.location ?? "Protected local listing"}
                      </span>
                    </div>

                    <TransactionProgress status={purchase.status} />

                    <div className="purchases-card__actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setExpandedId((current) =>
                            current === purchase.id ? null : purchase.id
                          )
                        }
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </Button>

                      {canConfirmReceipt ? (
                        <Button
                          size="sm"
                          onClick={() => void handleConfirmReceipt(purchase.id)}
                          disabled={confirmingId === purchase.id}
                        >
                          {confirmingId === purchase.id
                            ? "Confirming..."
                            : "Confirm Receipt"}
                        </Button>
                      ) : null}

                      {canRaiseDisputeForStatus ? (
                        <Button
                          to="/buyer/dashboard#disputes"
                          state={{ transactionId: purchase.id }}
                          variant="ghost"
                          size="sm"
                        >
                          Raise Dispute
                        </Button>
                      ) : null}

                      {isDisputed ? (
                        <Button
                          to="/buyer/dashboard#disputes"
                          state={{ transactionId: purchase.id }}
                          variant="ghost"
                          size="sm"
                        >
                          View Dispute
                        </Button>
                      ) : null}
                    </div>

                    {isExpanded ? (
                      <div className="purchases-card__details">
                        <div>
                          <span>Seller email</span>
                          <strong>{purchase.seller?.email ?? "Not available"}</strong>
                        </div>
                        <div>
                          <span>Buyer confirmed</span>
                          <strong>{formatDate(purchase.buyerConfirmedAt)}</strong>
                        </div>
                        <div>
                          <span>Funds released</span>
                          <strong>{formatDate(purchase.releasedAt)}</strong>
                        </div>
                        <div>
                          <span>Refunded</span>
                          <strong>{formatDate(purchase.refundedAt)}</strong>
                        </div>
                        {purchase.product?.id ? (
                          <div className="purchases-card__details-link">
                            <Link to={`/products/${purchase.product.id}`}>
                              View product listing
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
