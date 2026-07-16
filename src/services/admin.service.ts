import api from "./api";
import type {
  AdminAuditLog,
  AdminAuditLogPagination,
  AdminDashboardData,
  AdminDashboardPeriod,
} from "../types/admin.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type PaginatedApiResponse<T> = ApiResponse<T> & {
  pagination: AdminAuditLogPagination;
};

const adminService = {
  async getDashboard(period: AdminDashboardPeriod = "7d") {
    const { data } = await api.get<ApiResponse<AdminDashboardData>>(
      `/admin/dashboard?period=${period}`
    );

    return data.data;
  },

  async getAuditLogs(params: {
    page?: number;
    limit?: number;
  } = {}) {
    const { data } = await api.get<PaginatedApiResponse<AdminAuditLog[]>>(
      "/admin/audit-logs",
      {
        params: {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
        },
      }
    );

    return {
      items: data.data,
      pagination: data.pagination,
    };
  },
};

export default adminService;
