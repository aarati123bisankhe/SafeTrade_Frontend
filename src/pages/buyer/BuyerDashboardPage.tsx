import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

const summaryCards = [
  { label: "Active Purchases", value: "08", variant: "info" as const },
  { label: "Funds in Escrow", value: "$1,240", variant: "success" as const },
  { label: "Completed Orders", value: "24", variant: "default" as const },
  { label: "Open Disputes", value: "02", variant: "warning" as const },
];

const transactions = [
  { item: "MacBook Air M2", status: "Payment Held", badge: "warning" as const },
  { item: "Algorithms Textbook", status: "Seller Accepted", badge: "info" as const },
  { item: "Desk Lamp", status: "Shipped", badge: "info" as const },
  { item: "Office Chair", status: "Funds Released", badge: "success" as const },
];

export default function BuyerDashboardPage() {
  return (
    <div className="dashboard-page">
      <PageHeader
        title="Buy confidently with protected local transactions"
        description="Track your purchases, escrow status, disputes, and recommendations in one place."
        actions={
          <Button to="/products" variant="secondary">
            Browse Products
          </Button>
        }
      />

      <section className="metrics-grid">
        {summaryCards.map((card) => (
          <Card key={card.label} className="metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <Badge variant={card.variant}>Updated today</Badge>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid dashboard-grid--buyer">
        <Card className="panel-card">
          <h3>Recent Transactions</h3>
          <div className="list-stack">
            {transactions.map((transaction) => (
              <div key={transaction.item} className="list-row">
                <div>
                  <strong>{transaction.item}</strong>
                  <span>Protected checkout in progress</span>
                </div>
                <StatusBadge
                  label={transaction.status}
                  variant={transaction.badge}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <h3>Recommended Products</h3>
          <div className="recommendation-grid">
            {["Vintage Bookshelf", "Gaming Keyboard", "Winter Jacket"].map(
              (item) => (
                <div key={item} className="mini-product-card">
                  <span className="mini-product-card__visual" />
                  <strong>{item}</strong>
                  <span>Verified seller nearby</span>
                </div>
              )
            )}
          </div>
        </Card>

        <Card className="panel-card">
          <h3>Open Disputes</h3>
          <div className="list-stack">
            <div className="list-row">
              <div>
                <strong>Wireless Headphones</strong>
                <span>Evidence review in progress</span>
              </div>
              <StatusBadge label="Under Review" variant="warning" />
            </div>
            <div className="list-row">
              <div>
                <strong>Study Table</strong>
                <span>Waiting for seller response</span>
              </div>
              <StatusBadge label="Open" variant="danger" />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
