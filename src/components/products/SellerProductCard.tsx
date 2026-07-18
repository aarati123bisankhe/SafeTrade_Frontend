import Button from "../common/Button";
import Card from "../common/Card";
import Badge from "../common/Badge";
import ProductStatusBadge from "./ProductStatusBadge";
import type { Product } from "../../types/product.types";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function resolveProductImage(imageUrl: string) {
  if (
    imageUrl.startsWith("data:") ||
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  const apiOrigin = API_BASE_URL ? new URL(API_BASE_URL).origin : "https://localhost:5005";
  return new URL(imageUrl, apiOrigin).toString();
}

function getProductImage(product: Product) {
  if (product.imageUrl?.trim()) {
    return resolveProductImage(product.imageUrl);
  }

  const palette: Record<string, { start: string; end: string; accent: string; label: string }> = {
    BOOKS: { start: "#eff6ff", end: "#dbeafe", accent: "#1d4ed8", label: "BOOKS" },
    ELECTRONICS: { start: "#ecfeff", end: "#cffafe", accent: "#0891b2", label: "TECH" },
    CLOTHING: { start: "#fdf2f8", end: "#fce7f3", accent: "#db2777", label: "STYLE" },
    FURNITURE: { start: "#fef3c7", end: "#fde68a", accent: "#b45309", label: "HOME" },
    HANDMADE: { start: "#ecfccb", end: "#d9f99d", accent: "#65a30d", label: "CRAFT" },
    OTHER: { start: "#f8fafc", end: "#e2e8f0", accent: "#475569", label: "SAFE" },
  };

  const art = palette[product.category] ?? palette.OTHER;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${art.start}" />
          <stop offset="100%" stop-color="${art.end}" />
        </linearGradient>
      </defs>
      <rect width="360" height="260" rx="28" fill="url(#bg)" />
      <rect x="56" y="44" width="248" height="172" rx="26" fill="#ffffff" fill-opacity="0.84" />
      <rect x="86" y="76" width="188" height="84" rx="18" fill="${art.accent}" fill-opacity="0.16" />
      <text x="180" y="126" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="32" font-weight="800" fill="${art.accent}">${art.label}</text>
      <rect x="88" y="176" width="132" height="12" rx="6" fill="${art.accent}" fill-opacity="0.24" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

type SellerProductCardProps = {
  product: Product;
  onRemove: (product: Product) => void;
};

export default function SellerProductCard({
  product,
  onRemove,
}: SellerProductCardProps) {
  return (
    <Card className="seller-product-card">
      <div className="seller-product-card__media">
        <img src={getProductImage(product)} alt={product.name} />
      </div>

      <div className="seller-product-card__body">
        <div className="seller-product-card__header">
          <div>
            <div className="seller-product-card__badges">
              <Badge variant="default">{formatCategoryLabel(product.category)}</Badge>
              <Badge variant="info">{formatConditionLabel(product.condition)}</Badge>
              <ProductStatusBadge status={product.status} />
            </div>
            <h3>{product.name}</h3>
            <p>{product.location}</p>
          </div>
          <strong>Rs. {product.price.toLocaleString()}</strong>
        </div>

        <p className="seller-product-card__description">{product.description}</p>

        <div className="seller-product-card__meta">
          <span>Category: {formatCategoryLabel(product.category)}</span>
          <span>Condition: {formatConditionLabel(product.condition)}</span>
          <span>Created: {formatDate(product.createdAt)}</span>
        </div>

        <div className="seller-product-card__actions">
          <Button to={`/products/${product.id}`} variant="ghost" size="sm">
            View Details
          </Button>
          <Button to={`/seller/products/${product.id}/edit`} variant="secondary" size="sm">
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRemove(product)}>
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}
