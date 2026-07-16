import { useCallback, useEffect, useMemo, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import ProductStatusBadge from "../../components/products/ProductStatusBadge";
import productService from "../../services/product.service";
import type { Product } from "../../types/product.types";
import { getApiErrorMessage } from "../../utils/apiError";

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString()}`;
}

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await productService.getSellerProducts();
      setProducts(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your seller dashboard right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const summaryCards = useMemo(() => {
    const activeListings = products.filter((product) => product.status === "AVAILABLE").length;
    const reservedProducts = products.filter((product) => product.status === "RESERVED").length;
    const soldProducts = products.filter((product) => product.status === "SOLD").length;
    const fundsInEscrow = products
      .filter((product) => product.status === "RESERVED")
      .reduce((sum, product) => sum + product.price, 0);

    return [
      { label: "Active Listings", value: String(activeListings).padStart(2, "0") },
      { label: "Reserved Products", value: String(reservedProducts).padStart(2, "0") },
      { label: "Orders to Accept", value: String(reservedProducts).padStart(2, "0") },
      { label: "Orders to Ship", value: String(reservedProducts).padStart(2, "0") },
      { label: "Funds in Escrow", value: formatCurrency(fundsInEscrow) },
      { label: "Completed Sales", value: String(soldProducts).padStart(2, "0") },
    ];
  }, [products]);

  const recentListings = products.slice(0, 3);
  const reservedListings = products.filter((product) => product.status === "RESERVED").slice(0, 3);
  const soldListings = products.filter((product) => product.status === "SOLD").slice(0, 3);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Manage listings, orders, and protected payouts"
        description="See what needs attention across reservations, shipments, escrow, and product management."
        actions={
          <div className="page-header__button-row">
            <Button to="/seller/products">Manage Products</Button>
            <Button to="/seller/products/new" variant="secondary">
              Add New Product
            </Button>
          </div>
        }
      />

      {errorMessage ? (
        <Alert variant="error" title="Seller dashboard unavailable">
          {errorMessage}
        </Alert>
      ) : null}

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
        <Card className="panel-card" id="products">
          <div className="panel-card__header">
            <div>
              <h3>Manage Products</h3>
              <p>Open your seller listings and keep them updated for buyers.</p>
            </div>
            <Button to="/seller/products" variant="secondary" size="sm">
              Open My Products
            </Button>
          </div>

          {isLoading ? <p>Loading your latest listings...</p> : null}

          {!isLoading && recentListings.length === 0 ? (
            <div className="list-stack">
              <div className="list-row">
                <div>
                  <strong>No listings yet</strong>
                  <span>Create your first protected product listing.</span>
                </div>
                <Button to="/seller/products/new" size="sm">
                  Add Product
                </Button>
              </div>
            </div>
          ) : null}

          {!isLoading && recentListings.length > 0 ? (
            <div className="list-stack">
              {recentListings.map((product) => (
                <div key={product.id} className="list-row">
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.location}</span>
                  </div>
                  <ProductStatusBadge status={product.status} />
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="panel-card" id="orders-accept">
          <div className="panel-card__header">
            <div>
              <h3>Orders to Accept</h3>
              <p>Reserved products likely need your attention next.</p>
            </div>
            <Button to="/seller/products?status=RESERVED" variant="ghost" size="sm">
              Review Reserved
            </Button>
          </div>
          <div className="list-stack">
            {(reservedListings.length > 0 ? reservedListings : recentListings).slice(0, 3).map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>Buyer payment remains protected through SafeTrade escrow.</span>
                </div>
                <ProductStatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card" id="orders-ship">
          <div className="panel-card__header">
            <div>
              <h3>Orders to Ship</h3>
              <p>Keep reserved listings moving toward successful completion.</p>
            </div>
            <Button to="/seller/products?status=RESERVED" variant="ghost" size="sm">
              View Shipping Queue
            </Button>
          </div>
          <div className="list-stack">
            {(reservedListings.length > 0 ? reservedListings : recentListings).slice(0, 3).map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>Dispatch after acceptance to keep escrow activity moving.</span>
                </div>
                <Badge variant="warning">Ready to ship</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card" id="sales">
          <div className="panel-card__header">
            <div>
              <h3>View Sales</h3>
              <p>Track recent completed or active listing outcomes.</p>
            </div>
            <Button to="/seller/products" variant="ghost" size="sm">
              View Sales
            </Button>
          </div>
          <div className="list-stack">
            {(soldListings.length > 0 ? soldListings : recentListings).slice(0, 3).map((item) => (
              <div key={item.id} className="list-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{formatCurrency(item.price)}</span>
                </div>
                <ProductStatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
