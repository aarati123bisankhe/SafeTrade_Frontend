import { useEffect, useState } from "react";

import Alert from "../../components/common/Alert";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import PageHeader from "../../components/common/PageHeader";
import SecurityNotificationCard from "../../components/security/SecurityNotificationCard";
import securityNotificationService from "../../services/security-notification.service";
import type { SecurityNotification } from "../../types/security-notification.types";
import { getApiErrorMessage } from "../../utils/apiError";

const PAGE_SIZE = 20;
const POLLING_INTERVAL_MS = 45000;

export default function SecurityNotificationsPage() {
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingNotificationId, setUpdatingNotificationId] = useState<string | null>(
    null,
  );

  const loadNotifications = async () => {
    try {
      const [listResponse, unreadResponse] = await Promise.all([
        securityNotificationService.getNotifications(1, PAGE_SIZE),
        securityNotificationService.getUnreadCount(),
      ]);

      setNotifications(listResponse.notifications);
      setUnreadCount(unreadResponse.unreadCount);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't load your security notifications."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleMarkRead = async (notificationId: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setUpdatingNotificationId(notificationId);

    try {
      const updated = await securityNotificationService.markRead(notificationId);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId ? updated : notification,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
      setSuccessMessage("Notification marked as read.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't update that notification."),
      );
    } finally {
      setUpdatingNotificationId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsMarkingAll(true);

    try {
      await securityNotificationService.markAllRead();
      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        })),
      );
      setUnreadCount(0);
      setSuccessMessage("All security notifications have been marked as read.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't mark all notifications as read."),
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setUpdatingNotificationId(notificationId);

    try {
      const deleted = notifications.find(
        (notification) => notification.id === notificationId,
      );
      await securityNotificationService.deleteNotification(notificationId);
      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId),
      );
      if (deleted && !deleted.isRead) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
      setSuccessMessage("Security notification deleted.");
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "We couldn't delete that notification."),
      );
    } finally {
      setUpdatingNotificationId(null);
    }
  };

  return (
    <div className="dashboard-page">
      <PageHeader
        title="Security Notifications"
        description="Review important security events for your SafeTrade account."
        actions={
          <div className="page-header__button-row">
            <Badge variant={unreadCount > 0 ? "warning" : "default"}>
              {unreadCount} unread
            </Badge>
            <Button variant="secondary" onClick={() => void loadNotifications()}>
              Refresh
            </Button>
            <Button
              variant="ghost"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll || unreadCount === 0}
            >
              {isMarkingAll ? "Updating..." : "Mark all as read"}
            </Button>
          </div>
        }
      />

      {errorMessage ? (
        <Alert variant="error" title="Notifications unavailable">
          {errorMessage}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert variant="success" title="Notifications updated">
          {successMessage}
        </Alert>
      ) : null}

      {isLoading ? (
        <Card className="panel-card">
          <Loader label="Loading security notifications..." />
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="panel-card profile-panel">
          <div className="panel-card__header">
            <div>
              <h3>No security notifications yet</h3>
              <p>Important login and account protection alerts will appear here.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="profile-stack">
          {notifications.map((notification) => (
            <SecurityNotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              isUpdating={updatingNotificationId === notification.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
