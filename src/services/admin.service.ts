import api from "./api";

type AdminDashboardPeriod = "24h" | "7d" | "30d";

export type AdminDashboardData = {
  period: AdminDashboardPeriod;
  since: string;
  users: {
    total: number;
    buyers: number;
    sellers: number;
    admins: number;
    currentlyLocked: number;
  };
  products: {
    total: number;
    available: number;
    reserved: number;
    sold: number;
    removed: number;
  };
  transactions: {
    total: number;
    fundsHeld: number;
    sellerAccepted: number;
    shipped: number;
    disputed: number;
    fundsReleased: number;
    buyerRefunded: number;
    cancelled: number;
  };
  disputes: {
    total: number;
    open: number;
    underReview: number;
    resolvedForBuyer: number;
    resolvedForSeller: number;
    rejected: number;
  };
  security: {
    failedLoginsLastPeriod: number;
    lockedAccounts: number;
    lockedEventsLastPeriod: number;
    unauthorizedAttemptsLastPeriod: number;
    evidenceUploadsLastPeriod: number;
  };
  recentActivity: Array<{
    id: string;
    eventType: string;
    actorId: string | null;
    targetType: string | null;
    targetId: string | null;
    description: string;
    createdAt: string;
  }>;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const adminService = {
  async getDashboard(period: AdminDashboardPeriod = "7d") {
    const { data } = await api.get<ApiResponse<AdminDashboardData>>(
      `/admin/dashboard?period=${period}`
    );

    return data.data;
  },
};

export default adminService;
