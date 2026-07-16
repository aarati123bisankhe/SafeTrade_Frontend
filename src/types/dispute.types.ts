import type { PublicUser } from "./transaction.types";
import type {
  TradeTransaction,
  TransactionStatus,
} from "./transaction.types";

export const DisputeStatus = {
  OPEN: "OPEN",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED_BUYER: "RESOLVED_BUYER",
  RESOLVED_SELLER: "RESOLVED_SELLER",
  REJECTED: "REJECTED",
} as const;

export type DisputeStatus =
  (typeof DisputeStatus)[keyof typeof DisputeStatus];

export const DisputeReason = {
  ITEM_NOT_RECEIVED: "ITEM_NOT_RECEIVED",
  ITEM_DAMAGED: "ITEM_DAMAGED",
  ITEM_NOT_AS_DESCRIBED: "ITEM_NOT_AS_DESCRIBED",
  WRONG_ITEM: "WRONG_ITEM",
  SELLER_UNRESPONSIVE: "SELLER_UNRESPONSIVE",
  OTHER: "OTHER",
} as const;

export type DisputeReason =
  (typeof DisputeReason)[keyof typeof DisputeReason];

export type DisputeEvidence = {
  id: string;
  disputeId: string;
  uploadedById: string;
  originalName: string;
  storedName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  createdAt: string;
  uploadedBy?: PublicUser;
};

export type Dispute = {
  id: string;
  transactionId: string;
  raisedById: string;
  reason: DisputeReason;
  description: string;
  status: DisputeStatus;
  previousTransactionStatus: TransactionStatus;
  adminNote: string | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  transaction?: TradeTransaction;
  raisedBy?: PublicUser;
  resolvedBy?: PublicUser | null;
  evidence?: DisputeEvidence[];
};

export type CreateDisputeRequest = {
  transactionId: string;
  reason: DisputeReason;
  description: string;
};

export type ResolveDisputeRequest = {
  decision: "REFUND_BUYER" | "RELEASE_SELLER" | "REJECT_DISPUTE";
  adminNote: string;
};
