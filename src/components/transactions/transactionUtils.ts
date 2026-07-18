import type { Product } from "../../types/product.types";
import { TransactionStatus, type TradeTransaction } from "../../types/transaction.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sellerTransactionProgressSteps = [
  TransactionStatus.FUNDS_HELD,
  TransactionStatus.SELLER_ACCEPTED,
  TransactionStatus.SHIPPED,
  TransactionStatus.FUNDS_RELEASED,
] as const;

export function formatTransactionCurrency(value: number) {
  return `Rs. ${value.toLocaleString()}`;
}

export function formatTransactionDate(value: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function formatTransactionStatusLabel(value: string) {
  if (value === TransactionStatus.BUYER_REFUNDED) {
    return "Refunded";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTransactionStatusVariant(status: TradeTransaction["status"]) {
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

export function normalizeTransactionProgressStatus(status: TradeTransaction["status"]) {
  if (status === TransactionStatus.READY_FOR_COLLECTION) {
    return TransactionStatus.SHIPPED;
  }

  if (status === TransactionStatus.BUYER_CONFIRMED) {
    return TransactionStatus.FUNDS_RELEASED;
  }

  return status;
}

function resolveImage(imageUrl: string) {
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

export function getTransactionImage(product?: Product) {
  if (product?.imageUrl?.trim()) {
    return resolveImage(product.imageUrl);
  }

  const category = product?.category ?? "OTHER";
  const palette: Record<string, { start: string; end: string; accent: string; label: string }> = {
    BOOKS: { start: "#eff6ff", end: "#dbeafe", accent: "#2563eb", label: "BOOKS" },
    ELECTRONICS: { start: "#ecfeff", end: "#cffafe", accent: "#0891b2", label: "TECH" },
    CLOTHING: { start: "#fdf2f8", end: "#fce7f3", accent: "#db2777", label: "STYLE" },
    FURNITURE: { start: "#fef3c7", end: "#fde68a", accent: "#b45309", label: "HOME" },
    HANDMADE: { start: "#ecfccb", end: "#d9f99d", accent: "#65a30d", label: "CRAFT" },
    OTHER: { start: "#f8fafc", end: "#e2e8f0", accent: "#475569", label: "SAFE" },
  };

  const art = palette[category] ?? palette.OTHER;
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
