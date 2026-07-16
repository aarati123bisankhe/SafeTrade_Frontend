import { useCallback, useEffect, useMemo, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import disputeService from "../../services/dispute.service";
import productService from "../../services/product.service";
import transactionService from "../../services/transaction.service";
import { DisputeStatus, type Dispute } from "../../types/dispute.types";
import type { Product } from "../../types/product.types";
import {
  TransactionStatus,
  type TradeTransaction,
} from "../../types/transaction.types";
import { getApiErrorMessage } from "../../utils/apiError";
import TransactionStatusBadge from "../../components/transactions/TransactionStatusBadge";
import { formatTransactionCurrency } from "../../components/transactions/transactionUtils";

export default function SellerDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<TradeTransaction[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [productData, salesData, disputesData] = await Promise.all([
        productService.getSellerProducts(),
        transactionService.getMySales(),
        disputeService.getMyDisputes(),
      ]);

      setProducts(productData);
      setSales(salesData);
      setDisputes(disputesData);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your seller dashboard right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summary = useMemo(() => {
    const protectedStatuses: TradeTransaction["status"][] = [
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
      activeListings: products.filter((product) => product.status === "AVAILABLE").length,
      ordersToAccept: sales.filter((sale) => sale.status === TransactionStatus.FUNDS_HELD).length,
      ordersToShip: sales.filter((sale) => sale.status === TransactionStatus.SELLER_ACCEPTED)
        .length,
      fundsHeld: sales
        .filter((sale) => protectedStatuses.includes(sale.status))
        .reduce((sum, sale) => sum + sale.agreedPrice, 0),
      completedSales: sales.filter((sale) => sale.status === TransactionStatus.FUNDS_RELEASED)
        .length,
      openDisputes: disputes.filter((dispute) => openDisputeStatuses.includes(dispute.status))
        .length,
    };
  }, [disputes, products, sales]);

  const recentListings = products.slice(0, 3);
  const acceptOrders = sales.filter((sale) => sale.status === TransactionStatus.FUNDS_HELD).slice(0, 3);
  const shipOrders = sales
    .filter((sale) => sale.status === TransactionStatus.SELLER_ACCEPTED)
    .slice(0, 3);
  const completedOrders = sales
    .filter((sale) => sale.status === TransactionStatus.FUNDS_RELEASED)
    .slice(0, 3);

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Manage listings, orders, and protected payouts"
        description="See what needs attention across reservations, shipments, escrow, and seller disputes."
        actions={
          <div className="page-header__button-row">
            <Button to="/seller/sales">View Sales</Button>
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
        <Card className="metric-card">
          <span>Active Listings</span>
          <strong>{String(summary.activeListings).padStart(2, "0")}</strong>
          <Badge variant="info">Seller workspace</Badge>
        </Card>
        <Card className="metric-card">
          <span>Orders to Accept</span>
          <strong>{String(summary.ordersToAccept).padStart(2, "0")}</strong>
          <Badge variant="warning">Funds held</Badge>
        </Card>
        <Card className="metric-card">
          <span>Orders to Ship</span>
          <strong>{String(summary.ordersToShip).padStart(2, "0")}</strong>
          <Badge variant="info">Accepted</Badge>
        </Card>
        <Card className="metric-card">
          <span>Funds Held in Escrow</span>
          <strong>{formatTransactionCurrency(summary.fundsHeld)}</strong>
          <Badge variant="success">Protected</Badge>
        </Card>
        <Card className="metric-card">
          <span>Completed Sales</span>
          <strong>{String(summary.completedSales).padStart(2, "0")}</strong>
          <Badge variant="success">Released</Badge>
        </Card>
        <Card className="metric-card">
          <span>Open Disputes</span>
          <strong>{String(summary.openDisputes).padStart(2, "0")}</strong>
          <Badge variant="danger">Needs review</Badge>
        </Card>
      </section>

      <section className="dashboard-grid">
        <Card className="panel-card" id="products">
          <div className="panel-card__header">
            <div>
              <h3>Manage Products</h3>
              <p>Keep your listings current so buyers can discover and purchase them.</p>
            </div>
            <Button to="/seller/products" variant="secondary" size="sm">
              Manage Products
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
                  <Badge variant="info">{product.status}</Badge>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="panel-card" id="orders-accept">
          <div className="panel-card__header">
            <div>
              <h3>Orders to Accept</h3>
              <p>Buyer funds are held safely until you accept these orders.</p>
            </div>
            <Button to="/seller/sales?status=FUNDS_HELD" variant="ghost" size="sm">
              Review Orders
            </Button>
          </div>

          <div className="list-stack">
            {(acceptOrders.length > 0 ? acceptOrders : sales.slice(0, 3)).map((sale) => (
              <div key={sale.id} className="list-row">
                <div>
                  <strong>{sale.productName}</strong>
                  <span>Buyer: {sale.buyer?.username ?? "Not available"}</span>
                </div>
                <TransactionStatusBadge status={sale.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card" id="orders-ship">
          <div className="panel-card__header">
            <div>
              <h3>Orders to Ship</h3>
              <p>Accepted orders ready for the next seller shipping update.</p>
            </div>
            <Button to="/seller/sales?status=SELLER_ACCEPTED" variant="ghost" size="sm">
              View Shipping Queue
            </Button>
          </div>

          <div className="list-stack">
            {(shipOrders.length > 0 ? shipOrders : sales.slice(0, 3)).map((sale) => (
              <div key={sale.id} className="list-row">
                <div>
                  <strong>{sale.productName}</strong>
                  <span>{formatTransactionCurrency(sale.agreedPrice)}</span>
                </div>
                <TransactionStatusBadge status={sale.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="panel-card" id="sales">
          <div className="panel-card__header">
            <div>
              <h3>Completed Sales</h3>
              <p>Escrow released orders that have fully completed.</p>
            </div>
            <Button to="/seller/sales?status=FUNDS_RELEASED" variant="ghost" size="sm">
              View Sales
            </Button>
          </div>

          <div className="list-stack">
            {(completedOrders.length > 0 ? completedOrders : sales.slice(0, 3)).map((sale) => (
              <div key={sale.id} className="list-row">
                <div>
                  <strong>{sale.productName}</strong>
                  <span>Buyer: {sale.buyer?.username ?? "Not available"}</span>
                </div>
                <TransactionStatusBadge status={sale.status} />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
