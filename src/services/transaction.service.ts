import api from "./api";
import type { ApiResponse } from "../types/auth.types";
import type { TradeTransaction } from "../types/transaction.types";

const transactionService = {
  async createTransaction(productId: string): Promise<TradeTransaction> {
    const { data } = await api.post<ApiResponse<TradeTransaction>>("/transactions", {
      productId,
    });

    return data.data;
  },

  async getMyPurchases(): Promise<TradeTransaction[]> {
    const { data } = await api.get<ApiResponse<TradeTransaction[]>>(
      "/transactions/my-purchases"
    );

    return data.data;
  },

  async confirmReceipt(transactionId: string): Promise<TradeTransaction> {
    const { data } = await api.patch<ApiResponse<TradeTransaction>>(
      `/transactions/${transactionId}/confirm-receipt`
    );

    return data.data;
  },
};

export default transactionService;
