import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";
import disputeService from "../../services/dispute.service";
import productService from "../../services/product.service";
import transactionService from "../../services/transaction.service";
import {
  DisputeStatus,
  type Dispute,
} from "../../types/dispute.types";
import type { Product } from "../../types/product.types";
import {
  TransactionStatus,
  type TradeTransaction,
} from "../../types/transaction.types";
import { getApiErrorMessage } from "../../utils/apiError";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
  variant: "info" | "success" | "default" | "warning";
  icon: "bag" | "shield" | "check" | "alert";
};

type DashboardTransaction = {
  id: string;
  item: string;
  seller: string;
  price: string;
  image: string;
  status: "Payment Held" | "Seller Accepted" | "Shipped" | "Delivered";
  badge: "warning" | "info" | "success";
};

type DashboardProduct = {
  id: string;
  title: string;
  price: string;
  location: string;
  rating: string;
  condition: string;
  image: string;
};

type DashboardDispute = {
  id: string;
  item: string;
  reason: string;
  status: string;
  opened: string;
  image: string;
  badge: "warning" | "danger";
};

type Category = {
  name: string;
  image: string;
  hash: string;
};

type Activity = {
  title: string;
  time: string;
  tone: "info" | "success" | "warning";
};

const categories: Category[] = [
  {
    name: "Books",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=420&q=80",
    hash: "#books",
  },
  {
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=420&q=80",
    hash: "#electronics",
  },
  {
    name: "Clothing",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=420&q=80",
    hash: "#clothing",
  },
  {
    name: "Furniture",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=420&q=80",
    hash: "#furniture",
  },
  {
    name: "Handmade",
    image: "http://localhost:5005/uploads/products/handmade-dashboard.png",
    hash: "#handmade",
  },
];

const progressStages = [
  "Payment Held",
  "Seller Accepted",
  "Shipped",
  "Delivered",
] as const;

function DashboardIcon({ name }: { name: SummaryCard["icon"] }) {
  const paths = {
    bag: (
      <path d="M8 10V8a4 4 0 1 1 8 0v2m-9 0h10l1 10H6l1-10Z" />
    ),
    shield: (
      <path d="M12 3l7 3v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Z" />
    ),
    check: <path d="m7 12 3 3 7-7m-5-5a9 9 0 1 1 0 18 9 9 0 0 1 0-18Z" />,
    alert: (
      <path d="M12 8v4m0 4h.01M10.3 4.9 3.6 16.2A1.4 1.4 0 0 0 4.8 18h14.4a1.4 1.4 0 0 0 1.2-1.8L13.7 4.9a1.4 1.4 0 0 0-2.4 0Z" />
    ),
  };

  return (
    <span className="metric-card__icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        {paths[name]}
      </svg>
    </span>
  );
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString()}`;
}

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  const diffMs = Date.now() - timestamp;
  const diffHours = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60)));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  return `${diffDays} days ago`;
}

function resolveImageUrl(imageUrl: string) {
  if (
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  const apiOrigin = API_BASE_URL ? new URL(API_BASE_URL).origin : "http://localhost:5005";
  return new URL(imageUrl, apiOrigin).toString();
}

function getProductImage(product?: Product) {
  if (product?.imageUrl?.trim()) {
    return resolveImageUrl(product.imageUrl);
  }

  const category = product?.category ?? "OTHER";
  const labelMap: Record<string, string> = {
    BOOKS: "BOOKS",
    ELECTRONICS: "TECH",
    CLOTHING: "STYLE",
    FURNITURE: "HOME",
    HANDMADE: "CRAFT",
    OTHER: "SAFE",
  };
  const palette: Record<string, { start: string; end: string; accent: string }> = {
    BOOKS: { start: "#eff6ff", end: "#dbeafe", accent: "#2563eb" },
    ELECTRONICS: { start: "#ecfeff", end: "#cffafe", accent: "#0891b2" },
    CLOTHING: { start: "#fdf2f8", end: "#fce7f3", accent: "#db2777" },
    FURNITURE: { start: "#fef3c7", end: "#fde68a", accent: "#b45309" },
    HANDMADE: { start: "#ecfccb", end: "#d9f99d", accent: "#65a30d" },
    OTHER: { start: "#f8fafc", end: "#e2e8f0", accent: "#475569" },
  };

  const art = palette[category] ?? palette.OTHER;
  const label = labelMap[category] ?? labelMap.OTHER;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 280">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${art.start}" />
          <stop offset="100%" stop-color="${art.end}" />
        </linearGradient>
      </defs>
      <rect width="420" height="280" rx="28" fill="url(#bg)" />
      <rect x="70" y="52" width="280" height="176" rx="28" fill="#fff" fill-opacity="0.82" />
      <rect x="108" y="90" width="204" height="88" rx="20" fill="${art.accent}" fill-opacity="0.14" />
      <text x="210" y="145" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800" fill="${art.accent}">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mapTransactionStatus(
  status: TradeTransaction["status"]
): DashboardTransaction["status"] {
  switch (status) {
    case TransactionStatus.FUNDS_RELEASED:
      return "Delivered";
    case TransactionStatus.SHIPPED:
      return "Shipped";
    case TransactionStatus.SELLER_ACCEPTED:
      return "Seller Accepted";
    default:
      return "Payment Held";
  }
}

function mapTransactionBadge(
  status: DashboardTransaction["status"]
): DashboardTransaction["badge"] {
  switch (status) {
    case "Delivered":
      return "success";
    case "Seller Accepted":
    case "Shipped":
      return "info";
    default:
      return "warning";
  }
}

function formatConditionLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function createActivityFeed(
  purchases: TradeTransaction[],
  disputes: Dispute[],
): Activity[] {
  const purchaseActivities = purchases.slice(0, 3).map((purchase) => ({
    title:
      purchase.status === TransactionStatus.FUNDS_RELEASED
        ? `You confirmed receipt for ${purchase.productName}`
        : purchase.status === TransactionStatus.SHIPPED
          ? `${purchase.productName} was marked as shipped`
          : purchase.status === TransactionStatus.SELLER_ACCEPTED
            ? `Seller accepted your ${purchase.productName} order`
            : `Escrow started for ${purchase.productName}`,
    time: formatRelativeDate(purchase.updatedAt),
    tone:
      purchase.status === TransactionStatus.FUNDS_RELEASED
        ? ("success" as const)
        : ("info" as const),
  }));

  const disputeActivities = disputes.slice(0, 2).map((dispute) => ({
    title:
      dispute.status === DisputeStatus.OPEN
        ? `Dispute opened for ${dispute.transaction?.productName ?? "your order"}`
        : `Dispute update for ${dispute.transaction?.productName ?? "your order"}`,
    time: formatRelativeDate(dispute.updatedAt),
    tone:
      dispute.status === DisputeStatus.RESOLVED_BUYER
        ? ("success" as const)
        : ("warning" as const),
  }));

  return [...purchaseActivities, ...disputeActivities]
    .sort((a, b) => {
      const rank = (value: string) => {
        if (value === "Yesterday") return 24;
        if (value.endsWith("days ago")) return Number(value.split(" ")[0]) * 24;
        return Number(value.split(" ")[0]);
      };

      return rank(a.time) - rank(b.time);
    })
    .slice(0, 4);
}

function TransactionProgress({
  currentStatus,
}: {
  currentStatus: DashboardTransaction["status"];
}) {
  const activeIndex = progressStages.indexOf(currentStatus);

  return (
    <div className="transaction-progress" aria-label={`Progress: ${currentStatus}`}>
      {progressStages.map((stage, index) => {
        const isActive = index <= activeIndex;

        return (
          <div
            key={stage}
            className={[
              "transaction-progress__step",
              isActive ? "transaction-progress__step--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="transaction-progress__dot" />
            <span>{stage}</span>
          </div>
        );
      })}
    </div>
  );
}

function handleCardKeyDown(
  event: KeyboardEvent<HTMLElement>,
  onActivate: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onActivate();
  }
}

export default function BuyerDashboardPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<TradeTransaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [purchaseData, disputeData, productData] = await Promise.all([
        transactionService.getMyPurchases(),
        disputeService.getMyDisputes(),
        productService.getAllProducts({ limit: 4, sortBy: "NEWEST" }),
      ]);

      setPurchases(purchaseData);
      setDisputes(disputeData);
      setRecommendedProducts(productData.items);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your buyer dashboard right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summaryCards = useMemo<SummaryCard[]>(() => {
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
    const openDisputes = disputes.filter(
      (dispute) =>
        dispute.status === DisputeStatus.OPEN ||
        dispute.status === DisputeStatus.UNDER_REVIEW
    ).length;

    return [
      {
        label: "Active Purchases",
        value: String(activePurchases).padStart(2, "0"),
        detail: "Orders currently moving through escrow",
        variant: "info",
        icon: "bag",
      },
      {
        label: "Funds in Escrow",
        value: formatCurrency(fundsInEscrow),
        detail: "Secured until delivery confirmation",
        variant: "success",
        icon: "shield",
      },
      {
        label: "Completed Orders",
        value: String(completedOrders).padStart(2, "0"),
        detail: "Purchases with released escrow funds",
        variant: "default",
        icon: "check",
      },
      {
        label: "Open Disputes",
        value: String(openDisputes).padStart(2, "0"),
        detail: "Cases that still need follow-up",
        variant: "warning",
        icon: "alert",
      },
    ];
  }, [disputes, purchases]);

  const dashboardTransactions = useMemo<DashboardTransaction[]>(
    () =>
      purchases.slice(0, 6).map((purchase) => {
        const status = mapTransactionStatus(purchase.status);
        return {
          id: purchase.id,
          item: purchase.productName,
          seller: purchase.seller?.username ?? `seller-${purchase.sellerId.slice(-4)}`,
          price: formatCurrency(purchase.agreedPrice),
          image: getProductImage(purchase.product),
          status,
          badge: mapTransactionBadge(status),
        };
      }),
    [purchases]
  );

  const dashboardDisputes = useMemo<DashboardDispute[]>(
    () =>
      disputes
        .filter(
          (dispute) =>
            dispute.status === DisputeStatus.OPEN ||
            dispute.status === DisputeStatus.UNDER_REVIEW
        )
        .slice(0, 2)
        .map((dispute) => ({
          id: dispute.id,
          item: dispute.transaction?.productName ?? "Protected transaction",
          reason: dispute.reason
            .toLowerCase()
            .split("_")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" "),
          status:
            dispute.status === DisputeStatus.UNDER_REVIEW ? "Under Review" : "Open",
          opened: `Opened ${formatRelativeDate(dispute.createdAt)}`,
          image: getProductImage(dispute.transaction?.product),
          badge:
            dispute.status === DisputeStatus.UNDER_REVIEW ? "warning" : "danger",
        })),
    [disputes]
  );

  const dashboardProducts = useMemo<DashboardProduct[]>(
    () =>
      recommendedProducts.map((product) => ({
        id: product.id,
        title: product.name,
        price: formatCurrency(product.price),
        location: product.location,
        rating:
          typeof product.seller?.rating === "number"
            ? product.seller.rating.toFixed(1)
            : "New",
        condition: formatConditionLabel(product.condition),
        image: getProductImage(product),
      })),
    [recommendedProducts]
  );

  const escrowSummary = useMemo(() => {
    const protectedStatuses: TradeTransaction["status"][] = [
      TransactionStatus.FUNDS_HELD,
      TransactionStatus.SELLER_ACCEPTED,
      TransactionStatus.SHIPPED,
      TransactionStatus.DISPUTED,
    ];
    const activeTransactions = purchases.filter((purchase) =>
      protectedStatuses.includes(purchase.status)
    );
    const protectedFunds = activeTransactions.reduce(
      (sum, purchase) => sum + purchase.agreedPrice,
      0
    );
    const completed = purchases.filter(
      (purchase) =>
        purchase.buyerConfirmedAt && purchase.releasedAt
    );
    const averageReleaseDays =
      completed.length > 0
        ? (
            completed.reduce((sum, purchase) => {
              const createdAt = new Date(purchase.createdAt).getTime();
              const releasedAt = new Date(purchase.releasedAt ?? purchase.createdAt).getTime();
              return sum + (releasedAt - createdAt) / (1000 * 60 * 60 * 24);
            }, 0) / completed.length
          ).toFixed(1)
        : "0.0";

    return {
      activeTransactions: activeTransactions.length,
      protectedFunds,
      averageReleaseDays,
    };
  }, [purchases]);

  const activities = useMemo(
    () => createActivityFeed(purchases, disputes),
    [disputes, purchases]
  );

  return (
    <div className="dashboard-page">
      <section className="buyer-hero ui-card">
        <div className="buyer-hero__content">
          <Badge variant="success">Escrow protection active</Badge>
          <h1>Buy confidently with protected local transactions</h1>
          <p>
            Track every order, see exactly where escrow funds are held, and
            continue shopping from trusted sellers across your local marketplace.
          </p>
          <div className="buyer-hero__actions">
            <Button to="/products">Browse Products</Button>
            <Button to="/my-purchases" variant="secondary">
              View Purchases
            </Button>
          </div>
        </div>

        <div className="buyer-hero__visual" aria-hidden="true">
          <div className="buyer-hero__orb buyer-hero__orb--one" />
          <div className="buyer-hero__orb buyer-hero__orb--two" />
          <div className="buyer-hero__scene">
            <div className="buyer-hero__window">
              <img
                src="/buyer-hero-person.png"
                alt=""
                className="buyer-hero__image"
              />
            </div>
          </div>
        </div>
      </section>

      {errorMessage ? (
        <Alert variant="error" title="Buyer dashboard unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      <section className="metrics-grid">
        {summaryCards.map((card) => (
          <Card key={card.label} className="metric-card metric-card--enhanced">
            <div className="metric-card__top">
              <DashboardIcon name={card.icon} />
              <Badge variant={card.variant}>{card.label}</Badge>
            </div>
            <strong>{card.value}</strong>
            <span className="metric-card__detail">{card.detail}</span>
          </Card>
        ))}
      </section>

      <section className="buyer-main-grid">
        <Card className="panel-card buyer-panel buyer-panel--transactions">
          <div className="panel-card__header">
            <div>
              <h3>Recent Transactions</h3>
              <p>Follow the escrow workflow from payment to delivery.</p>
            </div>
            <Button to="/my-purchases" variant="ghost" size="sm">
              View All
            </Button>
          </div>

          {!isLoading && dashboardTransactions.length === 0 ? (
            <Card className="marketplace-empty-state purchases-empty-state">
              <Badge variant="info">No purchases yet</Badge>
              <h3>You haven't made a protected purchase yet.</h3>
              <p>Once you buy a product, your escrow timeline will appear here.</p>
              <div className="purchases-empty-state__actions">
                <Button to="/products">Browse Products</Button>
              </div>
            </Card>
          ) : null}

          <div className="transaction-list">
            {dashboardTransactions.map((transaction) => (
              <article
                key={transaction.id}
                className="transaction-card"
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/transactions/${transaction.id}`)}
                onKeyDown={(event) =>
                  handleCardKeyDown(event, () => navigate(`/transactions/${transaction.id}`))
                }
              >
                <img src={transaction.image} alt={transaction.item} />
                <div className="transaction-card__content">
                  <div className="transaction-card__top">
                    <div>
                      <strong>{transaction.item}</strong>
                      <span>Seller: {transaction.seller}</span>
                    </div>
                    <div className="transaction-card__meta">
                      <StatusBadge
                        label={transaction.status}
                        variant={transaction.badge}
                      />
                      <strong>{transaction.price}</strong>
                    </div>
                  </div>
                  <TransactionProgress currentStatus={transaction.status} />
                </div>
              </article>
            ))}
          </div>
        </Card>

        <Card className="panel-card buyer-panel buyer-panel--escrow">
          <div className="panel-card__header">
            <div>
              <h3>Your Escrow Protection</h3>
              <p>Your protected transactions and held funds at a glance.</p>
            </div>
          </div>

          <div className="escrow-protection">
            <div className="escrow-protection__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l7 3v5c0 4.5-2.9 8.6-7 10-4.1-1.4-7-5.5-7-10V6l7-3Z" />
                <path d="M9.5 12.5 11 14l3.5-3.5" />
              </svg>
            </div>
            <strong>
              {escrowSummary.activeTransactions} active transaction
              {escrowSummary.activeTransactions === 1 ? "" : "s"} are currently protected.
            </strong>
            <p>
              {formatCurrency(escrowSummary.protectedFunds)} is securely held until
              you confirm delivery or a dispute is resolved.
            </p>
            <div className="escrow-protection__stats">
              <div>
                <span>Protected funds</span>
                <strong>{formatCurrency(escrowSummary.protectedFunds)}</strong>
              </div>
              <div>
                <span>Average release time</span>
                <strong>{escrowSummary.averageReleaseDays} days</strong>
              </div>
            </div>
            <Button to="/my-purchases" variant="secondary">
              View Protected Transactions
            </Button>
          </div>
        </Card>

        <Card className="panel-card buyer-panel buyer-panel--disputes">
          <div className="panel-card__header">
            <div>
              <h3>Open Disputes</h3>
              <p>Keep an eye on cases that still need follow-up.</p>
            </div>
          </div>

          {dashboardDisputes.length === 0 ? (
            <Card className="marketplace-empty-state purchases-empty-state">
              <Badge variant="success">No active disputes</Badge>
              <h3>Your recent purchases look healthy.</h3>
              <p>Open and under-review disputes will appear here when needed.</p>
              <div className="purchases-empty-state__actions">
                <Button to="/disputes" variant="secondary">
                  View Disputes
                </Button>
              </div>
            </Card>
          ) : (
            <div className="dispute-list">
              {dashboardDisputes.map((dispute) => (
                <article key={dispute.id} className="dispute-card">
                  <img src={dispute.image} alt={dispute.item} />
                  <div className="dispute-card__content">
                    <div className="dispute-card__header">
                      <strong>{dispute.item}</strong>
                      <StatusBadge label={dispute.status} variant={dispute.badge} />
                    </div>
                    <span>Reason: {dispute.reason}</span>
                    <span>{dispute.opened}</span>
                    <Button to={`/disputes/${dispute.id}`} variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Card className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>Recommended Products</h3>
            <p>Real listings from nearby sellers with escrow protection enabled.</p>
          </div>
        </div>

        {dashboardProducts.length === 0 ? (
          <Card className="marketplace-empty-state purchases-empty-state">
            <Badge variant="info">No recommendations yet</Badge>
            <h3>Fresh protected listings will appear here soon.</h3>
            <p>Browse the marketplace to explore all currently available products.</p>
          </Card>
        ) : (
          <div className="product-showcase">
            {dashboardProducts.map((product) => (
              <article
                key={product.id}
                className="product-card"
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/products/${product.id}`)}
                onKeyDown={(event) =>
                  handleCardKeyDown(event, () => navigate(`/products/${product.id}`))
                }
              >
                <img src={product.image} alt={product.title} />
                <div className="product-card__content">
                  <div className="product-card__header">
                    <strong>{product.title}</strong>
                    <span>{product.price}</span>
                  </div>
                  <div className="product-card__meta">
                    <span>{product.location}</span>
                    <span>★ {product.rating}</span>
                  </div>
                  <div className="product-card__badges">
                    <Badge variant="default">{product.condition}</Badge>
                    <Badge variant="success">Escrow Protected</Badge>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>

      <section className="dashboard-lower-grid">
        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Continue Shopping</h3>
              <p>Jump back into categories you browse most often.</p>
            </div>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <article
                key={category.name}
                className="category-card"
                style={{ backgroundImage: `url(${category.image})` }}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`/products${category.hash}`)}
                onKeyDown={(event) =>
                  handleCardKeyDown(event, () =>
                    navigate(`/products${category.hash}`)
                  )
                }
              >
                <div className="category-card__overlay" />
                <strong>{category.name}</strong>
              </article>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Recent Activity</h3>
              <p>A quick timeline of your latest marketplace updates.</p>
            </div>
          </div>

          {activities.length === 0 ? (
            <Card className="marketplace-empty-state purchases-empty-state">
              <Badge variant="info">No activity yet</Badge>
              <h3>Your buyer timeline is still quiet.</h3>
              <p>Recent purchase and dispute updates will appear here automatically.</p>
            </Card>
          ) : (
            <div className="activity-timeline">
              {activities.map((activity) => (
                <article key={`${activity.title}-${activity.time}`} className="activity-item">
                  <span
                    className={[
                      "activity-item__dot",
                      `activity-item__dot--${activity.tone}`,
                    ].join(" ")}
                  />
                  <div>
                    <strong>{activity.title}</strong>
                    <span>{activity.time}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
