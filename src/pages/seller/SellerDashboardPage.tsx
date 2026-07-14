import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";

const summaryCards = [
  { label: "Active Listings", value: "18" },
  { label: "Reserved Products", value: "04" },
  { label: "Orders to Accept", value: "03" },
  { label: "Orders to Ship", value: "06" },
  { label: "Funds in Escrow", value: "$2,860" },
  { label: "Completed Sales", value: "51" },
];

export default function SellerDashboardPage() {
  return (
    <div className="dashboard-page">
      <PageHeader
        title="Manage listings, orders, and protected payouts"
        description="See what needs attention across reservations, shipments, escrow, and disputes."
        actions={
          <Button variant="primary">Add Product</Button>
        }
      />

      <section className="metrics-grid">
        {summaryCards.map((card) => (
          <Card key={card.label} className="metric-card">
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <Badge variant="info">Seller workspace</Badge>
          </Card>
        ))}
      </section>

      <section className="dashboard-grid">
        <Card className="panel-card">
          <h3>Orders waiting for acceptance</h3>
          <div className="list-stack">
            {["Mountain Bike", "Graphic Tablet", "Bluetooth Speaker"].map(
              (item) => (
                <div key={item} className="list-row">
                  <div>
                    <strong>{item}</strong>
                    <span>Buyer payment already protected in escrow</span>
                  </div>
                  <StatusBadge label="Awaiting action" variant="warning" />
                </div>
              )
            )}
          </div>
        </Card>

        <Card className="panel-card">
          <h3>Orders to ship</h3>
          <div className="list-stack">
            {["Camera Lens", "Bean Bag", "Classic Novel Set"].map((item) => (
              <div key={item} className="list-row">
                <div>
                  <strong>{item}</strong>
                  <span>Dispatch after acceptance to keep flow moving</span>
                </div>
                <StatusBadge label="Ready to ship" variant="info" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card">
          <h3>Funds held in escrow</h3>
          <div className="escrow-summary">
            <strong>$2,860</strong>
            <p>
              Funds will release automatically after confirmed delivery or
              manual resolution.
            </p>
            <Badge variant="success">12 protected transactions</Badge>
          </div>
        </Card>
      </section>
    </div>
  );
}
