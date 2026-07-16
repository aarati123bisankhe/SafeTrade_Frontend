import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import DeleteProductModal from "../../components/products/DeleteProductModal";
import SellerProductCard from "../../components/products/SellerProductCard";
import productService from "../../services/product.service";
import type { Product, ProductStatus } from "../../types/product.types";
import { getApiErrorMessage } from "../../utils/apiError";

const statusTabs: Array<{ label: string; value: "ALL" | ProductStatus }> = [
  { label: "All", value: "ALL" },
  { label: "Available", value: "AVAILABLE" },
  { label: "Reserved", value: "RESERVED" },
  { label: "Sold", value: "SOLD" },
  { label: "Removed", value: "REMOVED" },
];

type FlashState = {
  successMessage?: string;
};

function ProductSkeleton() {
  return <div className="seller-product-skeleton ui-card" />;
}

export default function SellerProductsPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeStatus, setActiveStatus] = useState<"ALL" | ProductStatus>(() => {
    const status = searchParams.get("status");
    return status && statusTabs.some((tab) => tab.value === status)
      ? (status as ProductStatus)
      : "ALL";
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    (location.state as FlashState | null)?.successMessage ?? ""
  );
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await productService.getSellerProducts(
        activeStatus === "ALL" ? undefined : activeStatus
      );
      setProducts(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your product listings right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
      window.history.replaceState({}, document.title);
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  useEffect(() => {
    const status = searchParams.get("status");
    const normalizedStatus =
      status && statusTabs.some((tab) => tab.value === status)
        ? (status as ProductStatus)
        : "ALL";
    setActiveStatus(normalizedStatus);
  }, [searchParams]);

  const summary = useMemo(
    () => ({
      available: products.filter((product) => product.status === "AVAILABLE").length,
      reserved: products.filter((product) => product.status === "RESERVED").length,
      sold: products.filter((product) => product.status === "SOLD").length,
      removed: products.filter((product) => product.status === "REMOVED").length,
    }),
    [products]
  );

  const handleDeleteConfirm = async () => {
    if (!productToDelete) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await productService.deleteProduct(productToDelete.id);
      setProductToDelete(null);
      setSuccessMessage("Product removed successfully.");
      await loadProducts();
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't remove this product right now.")
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Manage your protected listings"
        description="Create, review, update, and remove products while keeping the SafeTrade seller flow consistent."
        actions={
          <Button to="/seller/products/new">Add New Product</Button>
        }
      />

      {successMessage ? (
        <Alert variant="success" title="Seller products updated">
          {successMessage}
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="error" title="Seller products unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      <section className="metrics-grid">
        <Card className="metric-card">
          <span>Available Listings</span>
          <strong>{String(summary.available).padStart(2, "0")}</strong>
          <Badge variant="success">Live for buyers</Badge>
        </Card>
        <Card className="metric-card">
          <span>Reserved Products</span>
          <strong>{String(summary.reserved).padStart(2, "0")}</strong>
          <Badge variant="warning">Awaiting completion</Badge>
        </Card>
        <Card className="metric-card">
          <span>Sold Products</span>
          <strong>{String(summary.sold).padStart(2, "0")}</strong>
          <Badge variant="info">Finished listings</Badge>
        </Card>
        <Card className="metric-card">
          <span>Removed Listings</span>
          <strong>{String(summary.removed).padStart(2, "0")}</strong>
          <Badge variant="default">Hidden from buyers</Badge>
        </Card>
      </section>

      <section className="panel-card seller-products-panel ui-card">
        <div className="panel-card__header">
          <div>
            <h3>Your listings</h3>
            <p>Filter products by their current availability and sales state.</p>
          </div>
          <Button to="/seller/products/new" variant="secondary" size="sm">
            Create Product
          </Button>
        </div>

        <div className="seller-products-tabs" role="tablist" aria-label="Seller product statuses">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeStatus === tab.value}
              className={[
                "seller-products-tab",
                activeStatus === tab.value ? "seller-products-tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                setActiveStatus(tab.value);
                setSearchParams(tab.value === "ALL" ? {} : { status: tab.value });
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="seller-products-grid">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : null}

        {!isLoading && products.length === 0 ? (
          <Card className="marketplace-empty-state purchases-empty-state">
            <Badge variant="info">
              {activeStatus === "ALL" ? "No products yet" : "No products in this status"}
            </Badge>
            <h3>
              {activeStatus === "ALL"
                ? "You haven't created any listings yet."
                : "No listings match this status."}
            </h3>
            <p>
              {activeStatus === "ALL"
                ? "Create your first product to make it available in SafeTrade buyer browsing."
                : "Try another status filter or create a new listing."}
            </p>
            <div className="purchases-empty-state__actions">
              <Button to="/seller/products/new">Create Product</Button>
            </div>
          </Card>
        ) : null}

        {!isLoading && products.length > 0 ? (
          <div className="seller-products-grid">
            {products.map((product) => (
              <SellerProductCard
                key={product.id}
                product={product}
                onRemove={setProductToDelete}
              />
            ))}
          </div>
        ) : null}
      </section>

      {productToDelete ? (
        <DeleteProductModal
          productName={productToDelete.name}
          isDeleting={isDeleting}
          onCancel={() => setProductToDelete(null)}
          onConfirm={() => void handleDeleteConfirm()}
        />
      ) : null}
    </div>
  );
}
