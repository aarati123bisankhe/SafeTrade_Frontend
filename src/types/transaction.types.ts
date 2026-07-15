import type { User } from "./auth.types";
import type { Product } from "./product.types";

export const TransactionStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  FUNDS_HELD: "FUNDS_HELD",
  SELLER_ACCEPTED: "SELLER_ACCEPTED",
  SHIPPED: "SHIPPED",
  READY_FOR_COLLECTION: "READY_FOR_COLLECTION",
  BUYER_CONFIRMED: "BUYER_CONFIRMED",
  DISPUTED: "DISPUTED",
  FUNDS_RELEASED: "FUNDS_RELEASED",
  BUYER_REFUNDED: "BUYER_REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export type PublicUser = Pick<
  User,
  "id" | "username" | "email" | "role" | "createdAt" | "updatedAt"
>;

export type TradeTransaction = {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  productName: string;
  agreedPrice: number;
  status: TransactionStatus;
  buyerConfirmedAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  buyer?: PublicUser;
  seller?: PublicUser;
  product?: Product;
};
