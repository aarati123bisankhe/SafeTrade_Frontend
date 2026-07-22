import api from "./api";
import type {
  SecurityActivity,
  SecurityActivityFilters,
  SecurityActivityListResponse,
} from "../types/security-activity.types";

export const securityActivityService = {
  async getActivities(
    page = 1,
    limit = 20,
    filters: SecurityActivityFilters = {},
  ): Promise<SecurityActivityListResponse> {
    const { data } = await api.get<{
      success: boolean;
      activities: SecurityActivity[];
      pagination: SecurityActivityListResponse["pagination"];
    }>("/security-activity", {
      params: {
        page,
        limit,
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.severity ? { severity: filters.severity } : {}),
        ...(filters.outcome ? { outcome: filters.outcome } : {}),
      },
    });

    return {
      activities: data.activities,
      pagination: data.pagination,
    };
  },
};

export default securityActivityService;
