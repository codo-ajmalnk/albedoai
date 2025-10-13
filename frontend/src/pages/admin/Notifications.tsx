import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, Check, CheckCheck, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Memoized notification item component for better performance
const NotificationItem = React.memo<{
  notification: any;
  index: number;
  totalLength: number;
  onMarkAsRead: (id: number) => void;
  getNotificationIcon: (type: string) => string;
  getNotificationColor: (type: string) => string;
  getNotificationTypeLabel: (type: string) => string;
  formatNotificationTime: (createdAt: string) => string;
}>(
  ({
    notification,
    index,
    totalLength,
    onMarkAsRead,
    getNotificationIcon,
    getNotificationColor,
    getNotificationTypeLabel,
    formatNotificationTime,
  }) => {
    const handleMarkAsRead = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onMarkAsRead(notification.id);
      },
      [notification.id, onMarkAsRead]
    );

    return (
      <div>
        <div
          className={`p-3 sm:p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
            !notification.is_read ? "bg-blue-50 dark:bg-blue-950/20" : ""
          }`}
          onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
        >
          <div className="flex items-start space-x-2 sm:space-x-3">
            <div className="text-xl sm:text-2xl flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              {/* Mobile-optimized header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 space-y-1 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <h4 className="text-sm sm:text-sm font-medium truncate">
                    {notification.title}
                  </h4>

                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationTypeLabel(notification.type)}
                    </Badge>

                    {!notification.is_read && (
                      <Badge variant="destructive" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {formatNotificationTime(notification.created_at)}
                  </span>

                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAsRead}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {notification.message}
              </p>

              {notification.notification_data && (
                <div className="mt-2">
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground py-1">
                      View Details
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(notification.notification_data, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          </div>
        </div>

        {index < totalLength - 1 && <Separator className="mx-3 sm:mx-4" />}
      </div>
    );
  }
);

NotificationItem.displayName = "NotificationItem";

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [localNotifications, setLocalNotifications] = useState(notifications);

  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const handleMarkAsRead = useCallback(
    async (notificationId: number) => {
      await markAsRead(notificationId);
      setLocalNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllAsRead();
    setLocalNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true }))
    );
  }, [markAllAsRead]);

  const getNotificationIcon = useCallback((type: string) => {
    switch (type) {
      case "support_request":
        return "🔔";
      case "user_created":
        return "👤";
      default:
        return "📢";
    }
  }, []);

  const getNotificationColor = useCallback((type: string) => {
    switch (type) {
      case "support_request":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "user_created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  }, []);

  const formatNotificationTime = useCallback((createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch (error) {
      return "Unknown time";
    }
  }, []);

  const getNotificationTypeLabel = useCallback((type: string) => {
    switch (type) {
      case "support_request":
        return "Support Request";
      case "user_created":
        return "User Created";
      default:
        return "Notification";
    }
  }, []);

  if (loading && notifications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[50vh] sm:min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
            <span className="text-sm sm:text-base">
              Loading notifications...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Mobile-first header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
            Manage your system notifications
          </p>
        </div>

        {/* Mobile-optimized action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="text-sm self-start sm:self-center"
            >
              {unreadCount} unread
            </Badge>
          )}

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchNotifications}
              disabled={loading}
              className="flex-1 sm:flex-none"
            >
              <RefreshCw
                className={`h-4 w-4 sm:mr-2 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="flex-1 sm:flex-none"
              >
                <CheckCheck className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Mark All Read</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <BellOff className="h-5 w-5" />
              <span>Error loading notifications: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {localNotifications.length === 0 ? (
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">
                No notifications
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                You don't have any notifications yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>All Notifications ({localNotifications.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[70vh] sm:h-[600px]">
              <div className="space-y-0">
                {localNotifications.map((notification, index) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    index={index}
                    totalLength={localNotifications.length}
                    onMarkAsRead={handleMarkAsRead}
                    getNotificationIcon={getNotificationIcon}
                    getNotificationColor={getNotificationColor}
                    getNotificationTypeLabel={getNotificationTypeLabel}
                    formatNotificationTime={formatNotificationTime}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
