import api from "./api";
import type {
  SecurityNotification,
  SecurityNotificationListResponse,
  SecurityNotificationUnreadCountResponse,
} from "../types/security-notification.types";

export const securityNotificationService = {
  async getNotifications(page = 1, limit = 20): Promise<SecurityNotificationListResponse> {
    const { data } = await api.get<{
      success: boolean;
      message: string;
      notifications: SecurityNotification[];
      pagination: SecurityNotificationListResponse["pagination"];
    }>("/security-notifications", {
      params: { page, limit },
    });

    return {
      notifications: data.notifications,
      pagination: data.pagination,
    };
  },

  async getUnreadCount(): Promise<SecurityNotificationUnreadCountResponse> {
    const { data } = await api.get<{
      success: boolean;
      unreadCount: number;
    }>("/security-notifications/unread-count");

    return { unreadCount: data.unreadCount };
  },

  async markRead(notificationId: string): Promise<SecurityNotification> {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      notification: SecurityNotification;
    }>(`/security-notifications/${notificationId}/read`);

    return data.notification;
  },

  async markAllRead(): Promise<number> {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      updatedCount: number;
    }>("/security-notifications/read-all");

    return data.updatedCount;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/security-notifications/${notificationId}`);
  },
};

export default securityNotificationService;
