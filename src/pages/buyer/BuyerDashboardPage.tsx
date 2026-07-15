import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/common/StatusBadge";

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
  variant: "info" | "success" | "default" | "warning";
  icon: "bag" | "shield" | "check" | "alert";
};

type Transaction = {
  item: string;
  seller: string;
  price: string;
  image: string;
  status: "Payment Held" | "Seller Accepted" | "Shipped" | "Delivered";
  badge: "warning" | "info" | "success";
};

type Product = {
  title: string;
  price: string;
  location: string;
  rating: string;
  condition: string;
  image: string;
};

type Dispute = {
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
};

type Activity = {
  title: string;
  time: string;
  tone: "info" | "success" | "warning";
};

const summaryCards: SummaryCard[] = [
  {
    label: "Active Purchases",
    value: "08",
    detail: "+2 this week",
    variant: "info",
    icon: "bag",
  },
  {
    label: "Funds in Escrow",
    value: "Rs. 1,240",
    detail: "Secured until delivery confirmation",
    variant: "success",
    icon: "shield",
  },
  {
    label: "Completed Orders",
    value: "24",
    detail: "6 completed this month",
    variant: "default",
    icon: "check",
  },
  {
    label: "Open Disputes",
    value: "02",
    detail: "1 awaiting seller response",
    variant: "warning",
    icon: "alert",
  },
];

const transactions: Transaction[] = [
  {
    item: "MacBook Air M2",
    seller: "techstore",
    price: "Rs. 145,000",
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=320&q=80",
    status: "Payment Held",
    badge: "warning",
  },
  {
    item: "Algorithms Textbook",
    seller: "bookbarn",
    price: "Rs. 1,850",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=320&q=80",
    status: "Seller Accepted",
    badge: "info",
  },
  {
    item: "Desk Lamp",
    seller: "lightliving",
    price: "Rs. 3,200",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=320&q=80",
    status: "Shipped",
    badge: "info",
  },
  {
    item: "Wireless Mouse",
    seller: "gadgethub",
    price: "Rs. 2,300",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=320&q=80",
    status: "Payment Held",
    badge: "warning",
  },
  {
    item: "Bluetooth Speaker",
    seller: "soundspot",
    price: "Rs. 6,700",
    image:
      "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=320&q=80",
    status: "Seller Accepted",
    badge: "info",
  },
  {
    item: 'Mountain Bike Helmet',
    seller: "ridegear",
    price: "Rs. 5,900",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=320&q=80",
    status: "Shipped",
    badge: "info",
  },
];

const recommendedProducts: Product[] = [
  {
    title: "Gaming Keyboard",
    price: "Rs. 4,500",
    location: "Kathmandu",
    rating: "4.8",
    condition: "Like New",
    image:
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "Mirrorless Camera",
    price: "Rs. 72,000",
    location: "Pokhara",
    rating: "4.9",
    condition: "Excellent",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "Study Desk",
    price: "Rs. 12,800",
    location: "Lalitpur",
    rating: "4.7",
    condition: "Good",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=420&q=80",
  },
  {
    title: "Wireless Headphones",
    price: "Rs. 8,900",
    location: "Bhaktapur",
    rating: "4.6",
    condition: "Sealed",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=420&q=80",
  },
];

const disputes: Dispute[] = [
  {
    item: "Wireless Headphones",
    reason: "Item not received",
    status: "Under Review",
    opened: "Opened 2 days ago",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=240&q=80",
    badge: "warning",
  },
  {
    item: "Study Table",
    reason: "Condition does not match listing",
    status: "Open",
    opened: "Opened yesterday",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=240&q=80",
    badge: "danger",
  },
];

const categories: Category[] = [
  {
    name: "Books",
    image:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=420&q=80",
  },
  {
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=420&q=80",
  },
  {
    name: "Clothing",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=420&q=80",
  },
  {
    name: "Furniture",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=420&q=80",
  },
  {
    name: "Handmade",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=420&q=80",
  },
];

const activities: Activity[] = [
  {
    title: "Seller accepted your MacBook Air M2 order",
    time: "2 hours ago",
    tone: "success",
  },
  {
    title: "Your Algorithms Textbook was shipped",
    time: "Yesterday",
    tone: "info",
  },
  {
    title: "Dispute opened for Wireless Headphones",
    time: "2 days ago",
    tone: "warning",
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

function TransactionProgress({
  currentStatus,
}: {
  currentStatus: Transaction["status"];
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

export default function BuyerDashboardPage() {
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
            <Button to="/buyer/dashboard#purchases" variant="secondary">
              View Purchases
            </Button>
          </div>
        </div>

        <div className="buyer-hero__visual" aria-hidden="true">
          <div className="buyer-hero__orb buyer-hero__orb--one" />
          <div className="buyer-hero__orb buyer-hero__orb--two" />
          <div className="buyer-hero__scene">
            <div className="buyer-hero__window">
              <span className="buyer-hero__label">SafeTrade Marketplace</span>
              <div className="buyer-hero__illustration">
                <div className="buyer-hero__shield">Protected</div>
                <div className="buyer-hero__parcel" />
                <div className="buyer-hero__cards">
                  <div className="buyer-hero__mini-card">
                    <strong>Buyer paid</strong>
                    <span>Funds secured in escrow</span>
                  </div>
                  <div className="buyer-hero__mini-card">
                    <strong>Seller ships</strong>
                    <span>Release after delivery confirmation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            <Button to="/buyer/dashboard#purchases" variant="ghost" size="sm">
              View All
            </Button>
          </div>

          <div className="transaction-list">
            {transactions.map((transaction) => (
              <article key={transaction.item} className="transaction-card">
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
            <strong>2 active transactions are currently protected.</strong>
            <p>
              Rs. 1,240 is securely held until you confirm delivery for your
              ongoing orders.
            </p>
            <div className="escrow-protection__stats">
              <div>
                <span>Protected funds</span>
                <strong>Rs. 1,240</strong>
              </div>
              <div>
                <span>Average release time</span>
                <strong>2.4 days</strong>
              </div>
            </div>
            <Button to="/buyer/dashboard#purchases" variant="secondary">
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

          <div className="dispute-list">
            {disputes.map((dispute) => (
              <article key={dispute.item} className="dispute-card">
                <img src={dispute.image} alt={dispute.item} />
                <div className="dispute-card__content">
                  <div className="dispute-card__header">
                    <strong>{dispute.item}</strong>
                    <StatusBadge label={dispute.status} variant={dispute.badge} />
                  </div>
                  <span>Reason: {dispute.reason}</span>
                  <span>{dispute.opened}</span>
                  <Button to="/buyer/dashboard#disputes" variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <Card className="panel-card">
        <div className="panel-card__header">
          <div>
            <h3>Recommended Products</h3>
            <p>Real listings from nearby sellers with escrow protection enabled.</p>
          </div>
        </div>

        <div className="product-showcase">
          {recommendedProducts.map((product) => (
            <article key={product.title} className="product-card">
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

          <div className="activity-timeline">
            {activities.map((activity) => (
              <article key={activity.title} className="activity-item">
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
        </Card>
      </section>
    </div>
  );
}
