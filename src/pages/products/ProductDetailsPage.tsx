import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import DashboardFooter from "../../components/layout/DashboardFooter";
import DashboardHeader from "../../components/layout/DashboardHeader";
import useAuth from "../../hooks/useAuth";
import productService from "../../services/product.service";
import transactionService from "../../services/transaction.service";
import {
  ProductStatus,
  type Product,
  type ProductStatus as ProductStatusType,
} from "../../types/product.types";
import { getApiErrorMessage } from "../../utils/apiError";

const FAVORITES_STORAGE_KEY = "safetrade-browse-favorites";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function formatCategoryLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatConditionLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getStatusBadgeVariant(status: ProductStatusType) {
  switch (status) {
    case ProductStatus.AVAILABLE:
      return "success";
    case ProductStatus.RESERVED:
      return "warning";
    case ProductStatus.SOLD:
      return "info";
    default:
      return "default";
  }
}

function resolveProductImage(imageUrl: string) {
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

function getProductArt(product: Product) {
  if (product.imageUrl?.trim()) {
    return resolveProductImage(product.imageUrl);
  }

  const accentByCategory: Record<string, { start: string; end: string; accent: string; label: string }> = {
    BOOKS: { start: "#eff6ff", end: "#dbeafe", accent: "#1d4ed8", label: "BOOKS" },
    ELECTRONICS: { start: "#ecfeff", end: "#cffafe", accent: "#0891b2", label: "TECH" },
    CLOTHING: { start: "#fdf2f8", end: "#fce7f3", accent: "#db2777", label: "STYLE" },
    FURNITURE: { start: "#fef3c7", end: "#fde68a", accent: "#b45309", label: "HOME" },
    HANDMADE: { start: "#ecfccb", end: "#d9f99d", accent: "#65a30d", label: "CRAFT" },
    OTHER: { start: "#f8fafc", end: "#e2e8f0", accent: "#475569", label: "SAFE" },
  };

  const art = accentByCategory[product.category] ?? accentByCategory.OTHER;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${art.start}" />
          <stop offset="100%" stop-color="${art.end}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="36" fill="url(#bg)" />
      <circle cx="536" cy="92" r="88" fill="${art.accent}" fill-opacity="0.16" />
      <circle cx="120" cy="372" r="96" fill="${art.accent}" fill-opacity="0.1" />
      <rect x="96" y="70" width="448" height="316" rx="36" fill="#ffffff" fill-opacity="0.86" />
      <rect x="152" y="128" width="336" height="164" rx="28" fill="${art.accent}" fill-opacity="0.14" />
      <text x="320" y="224" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="52" font-weight="800" fill="${art.accent}">${art.label}</text>
      <rect x="154" y="326" width="200" height="18" rx="9" fill="${art.accent}" fill-opacity="0.24" />
      <rect x="154" y="356" width="142" height="14" rx="7" fill="${art.accent}" fill-opacity="0.16" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function getSellerName(product: Product) {
  if (product.seller?.username) {
    return product.seller.username;
  }

  return `seller-${product.sellerId.slice(-4)}`;
}

function getSellerRatingLabel(product: Product) {
  if (typeof product.seller?.rating === "number") {
    return product.seller.rating.toFixed(1);
  }

  return "Not rated yet";
}

export default function ProductDetailsPage() {
  const { productId = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await productService.getProductById(productId);
      setProduct(data);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load this product right now.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  useEffect(() => {
    const storedFavorites = sessionStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!storedFavorites) {
      return;
    }

    try {
      const parsedFavorites = JSON.parse(storedFavorites) as unknown;

      if (Array.isArray(parsedFavorites)) {
        setFavoriteIds(
          parsedFavorites.filter((value): value is string => typeof value === "string")
        );
      }
    } catch {
      sessionStorage.removeItem(FAVORITES_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  const isFavorite = product ? favoriteIds.includes(product.id) : false;

  const purchaseState = useMemo(() => {
    if (!product) {
      return {
        canPurchase: false,
        helperText: "",
      };
    }

    if (!user) {
      return {
        canPurchase: false,
        helperText: "Sign in as a buyer to purchase this item with SafeTrade escrow.",
      };
    }

    if (user.role !== "BUYER") {
      return {
        canPurchase: false,
        helperText: "Only buyer accounts can purchase protected listings.",
      };
    }

    if (user.id === product.sellerId) {
      return {
        canPurchase: false,
        helperText: "You cannot buy your own listing.",
      };
    }

    if (product.status !== ProductStatus.AVAILABLE) {
      return {
        canPurchase: false,
        helperText: "This listing is not currently available for purchase.",
      };
    }

    return {
      canPurchase: true,
      helperText: "Escrow protection will hold funds until delivery is confirmed.",
    };
  }, [product, user]);

  const handleFavoriteToggle = () => {
    if (!product) {
      return;
    }

    setFavoriteIds((current) =>
      current.includes(product.id)
        ? current.filter((id) => id !== product.id)
        : [...current, product.id]
    );
  };

  const handlePurchase = async () => {
    if (!product || !purchaseState.canPurchase) {
      return;
    }

    setIsPurchasing(true);
    setErrorMessage("");

    try {
      await transactionService.createTransaction(product.id);
      setSuccessMessage("Purchase created successfully. Redirecting to My Purchases...");
      setTimeout(() => {
        navigate("/my-purchases");
      }, 700);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't start this protected purchase right now.")
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="marketplace-page">
      <DashboardHeader />

      <main className="marketplace-main">
        <div className="marketplace-main__inner">
          {isLoading ? (
            <Card className="product-details-card product-details-card--loading">
              <p>Loading product details...</p>
            </Card>
          ) : null}

          {!isLoading && errorMessage && !product ? (
            <Card className="marketplace-empty-state">
              <Badge variant="danger">Product unavailable</Badge>
              <h3>We couldn't load this product.</h3>
              <p>{errorMessage}</p>
              <div className="purchases-empty-state__actions">
                <Button variant="secondary" onClick={() => void loadProduct()}>
                  Retry
                </Button>
                <Button to="/products" variant="ghost">
                  Back to Browse Products
                </Button>
              </div>
            </Card>
          ) : null}

          {!isLoading && !errorMessage && !product ? (
            <Card className="marketplace-empty-state">
              <Badge variant="info">Not found</Badge>
              <h3>Product not found.</h3>
              <p>This listing may have been removed or is no longer available.</p>
              <div className="purchases-empty-state__actions">
                <Button to="/products">Back to Browse Products</Button>
              </div>
            </Card>
          ) : null}

          {!isLoading && product ? (
            <>
              <section className="product-details-shell">
                <Card className="product-details-card product-details-card--media">
                  <div className="product-details-card__media">
                    <img src={getProductArt(product)} alt={product.name} />
                    <button
                      type="button"
                      className={[
                        "marketplace-product-card__favorite",
                        isFavorite ? "marketplace-product-card__favorite--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={handleFavoriteToggle}
                      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      ♥
                    </button>
                  </div>
                </Card>

                <Card className="product-details-card product-details-card--content">
                  <div className="product-details-card__top">
                    <div className="product-details-card__copy">
                      <div className="product-details-card__actions-row">
                        <Link to="/products" className="product-details-back-link">
                          ← Back to Browse Products
                        </Link>
                      </div>
                      <div className="purchases-card__badges">
                        <Badge variant="success">Escrow Protected</Badge>
                        <Badge variant="default">
                          {formatConditionLabel(product.condition)}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(product.status)}>
                          {product.status}
                        </Badge>
                      </div>
                      <h1>{product.name}</h1>
                      <p>{product.description}</p>
                    </div>

                    <div className="product-details-price">
                      <strong>Rs. {product.price.toLocaleString()}</strong>
                      <span>Protected checkout with SafeTrade escrow</span>
                    </div>
                  </div>

                  {successMessage ? (
                    <Alert variant="success" title="Purchase created">
                      {successMessage}
                    </Alert>
                  ) : null}

                  {errorMessage && product ? (
                    <Alert variant="error" title="Purchase unavailable">
                      {errorMessage}
                    </Alert>
                  ) : null}

                  <div className="product-details-grid">
                    <div>
                      <span>Category</span>
                      <strong>{formatCategoryLabel(product.category)}</strong>
                    </div>
                    <div>
                      <span>Condition</span>
                      <strong>{formatConditionLabel(product.condition)}</strong>
                    </div>
                    <div>
                      <span>Location</span>
                      <strong>{product.location}</strong>
                    </div>
                    <div>
                      <span>Status</span>
                      <strong>{product.status}</strong>
                    </div>
                  </div>

                  <div className="product-details-seller">
                    <div className="panel-card__header">
                      <div>
                        <h3>Seller Information</h3>
                        <p>Protected local seller details for this listing.</p>
                      </div>
                    </div>
                    <div className="product-details-grid">
                      <div>
                        <span>Seller</span>
                        <strong>{getSellerName(product)}</strong>
                      </div>
                      <div>
                        <span>Rating</span>
                        <strong>{getSellerRatingLabel(product)}</strong>
                      </div>
                      <div>
                        <span>Email</span>
                        <strong>{product.seller?.email ?? "Not available"}</strong>
                      </div>
                      <div>
                        <span>Role</span>
                        <strong>{product.seller?.role ?? "SELLER"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="product-details-purchase">
                    <div className="product-details-purchase__copy">
                      <strong>Buy with Escrow Protection</strong>
                      <span>{purchaseState.helperText}</span>
                    </div>
                    <div className="product-details-purchase__actions">
                      {!user ? (
                        <Button to="/login">Sign in to Buy</Button>
                      ) : (
                        <Button
                          onClick={() => void handlePurchase()}
                          disabled={!purchaseState.canPurchase || isPurchasing}
                        >
                          {isPurchasing
                            ? "Starting Purchase..."
                            : "Buy with Escrow Protection"}
                        </Button>
                      )}
                      <Button variant="ghost" onClick={handleFavoriteToggle}>
                        {isFavorite ? "Remove Favorite" : "Favorite"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </section>

              <section className="product-details-description">
                <Card className="panel-card">
                  <div className="panel-card__header">
                    <div>
                      <h3>Full Description</h3>
                      <p>Everything the seller has shared about this listing.</p>
                    </div>
                  </div>
                  <p className="disputes-card__description">{product.description}</p>
                </Card>
              </section>
            </>
          ) : null}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
}
