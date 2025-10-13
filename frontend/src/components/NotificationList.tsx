import React from "react";
import { Check, MessageSquare, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  notification_data?: Record<string, any>;
  created_at: string;
}

interface NotificationListProps {
  notifications?: Notification[];
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications: propNotifications,
}) => {
  const {
    notifications: contextNotifications,
    markAsRead,
    loading,
  } = useNotifications();
  const notifications = propNotifications || contextNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "support_request":
        return <MessageSquare className="h-4 w-4" />;
      case "user_created":
        return <User className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "support_request":
        return "text-blue-600";
      case "user_created":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96">
      <div className="p-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
              !notification.is_read ? "bg-blue-50/50 border-blue-200" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 ${getNotificationColor(notification.type)}`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-medium ${
                      !notification.is_read
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>

                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
