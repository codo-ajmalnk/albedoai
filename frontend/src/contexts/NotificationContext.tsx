import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { browserNotificationService } from "../services/browserNotifications";

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

interface NotificationSettings {
  id: number;
  user_id: number;
  email_support_requests: boolean;
  email_user_created: boolean;
  system_support_requests: boolean;
  system_user_created: boolean;
  browser_support_requests: boolean;
  browser_user_created: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  recentNotifications: Notification[]; // Last 15 notifications for the bar
  unreadCount: number;
  notificationSettings: NotificationSettings | null;
  loading: boolean;
  error: string | null;
  browserNotificationPermission: "granted" | "denied" | "default";

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateNotificationSettings: (
    settings: Partial<NotificationSettings>
  ) => Promise<void>;
  fetchNotificationSettings: () => Promise<void>;

  // Browser Notifications
  requestBrowserNotificationPermission: () => Promise<boolean>;
  testBrowserNotification: () => Promise<void>;
  isBrowserNotificationSupported: () => boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [browserNotificationPermission, setBrowserNotificationPermission] =
    useState<"granted" | "denied" | "default">("default");
  const { token, isAuthenticated } = useAuth();

  const baseUrl = import.meta.env.VITE_API_URL || "";

  const fetchNotifications = async () => {
    if (!isAuthenticated || !token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${baseUrl}/api/notifications?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Check for new notifications (not read)
        const newNotifications = data.filter((n: Notification) => !n.is_read);
        if (newNotifications.length > 0) {
          showBrowserNotifications(newNotifications);
        }

        setNotifications(data);

        // Set recent notifications (last 15)
        setRecentNotifications(data.slice(0, 15));

        // Calculate unread count
        const unread = data.filter((n: Notification) => !n.is_read).length;
        setUnreadCount(unread);
      } else {
        throw new Error("Failed to fetch notifications");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/notifications/${notificationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_read: true }),
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        throw new Error("Failed to mark notification as read");
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(
        `${baseUrl}/api/notifications/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update local state
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      } else {
        const errorData = await response.text();
        console.error("Mark all read error response:", errorData);
        throw new Error(
          `Failed to mark all notifications as read: ${response.status} ${errorData}`
        );
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const fetchNotificationSettings = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(`${baseUrl}/api/notifications/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data);
      } else {
        const errorData = await response.text();
        console.error("Fetch settings error response:", errorData);
        throw new Error(
          `Failed to fetch notification settings: ${response.status} ${errorData}`
        );
      }
    } catch (err) {
      console.error("Error fetching notification settings:", err);
    }
  };

  const updateNotificationSettings = async (
    settings: Partial<NotificationSettings>
  ) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await fetch(`${baseUrl}/api/notifications/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        const data = await response.json();
        setNotificationSettings(data);
      } else {
        const errorData = await response.text();
        console.error("Update settings error response:", errorData);
        throw new Error(
          `Failed to update notification settings: ${response.status} ${errorData}`
        );
      }
    } catch (err) {
      console.error("Error updating notification settings:", err);
    }
  };

  // Browser Notification Methods
  const requestBrowserNotificationPermission = async (): Promise<boolean> => {
    const granted = await browserNotificationService.requestPermission();
    setBrowserNotificationPermission(granted ? "granted" : "denied");
    return granted;
  };

  const testBrowserNotification = async (): Promise<void> => {
    await browserNotificationService.testNotification();
  };

  const isBrowserNotificationSupported = (): boolean => {
    return browserNotificationService.isNotificationSupported();
  };

  // Show browser notifications for new notifications
  const showBrowserNotifications = (newNotifications: Notification[]) => {
    if (!browserNotificationService.isNotificationSupported()) return;
    if (browserNotificationPermission !== "granted") return;

    console.log("[NotificationContext] Checking for browser notifications:", {
      newNotificationsCount: newNotifications.length,
      notificationSettings,
      browserNotificationPermission,
    });

    newNotifications.forEach((notification) => {
      console.log("[NotificationContext] Processing notification:", {
        id: notification.id,
        type: notification.type,
        is_read: notification.is_read,
        browserSupportRequests: notificationSettings?.browser_support_requests,
        browserUserCreated: notificationSettings?.browser_user_created,
      });

      if (
        notificationSettings?.browser_support_requests &&
        notification.type === "support_request"
      ) {
        console.log(
          "[NotificationContext] Showing support request browser notification"
        );
        const data = notification.notification_data;
        if (data) {
          browserNotificationService.showSupportRequestNotification(data);
        }
      }

      if (
        notificationSettings?.browser_user_created &&
        notification.type === "user_created"
      ) {
        console.log(
          "[NotificationContext] Showing user created browser notification"
        );
        const data = notification.notification_data;
        if (data) {
          browserNotificationService.showUserCreatedNotification(data);
        }
      }
    });
  };

  // Initialize browser notification permission on mount
  useEffect(() => {
    if (browserNotificationService.isNotificationSupported()) {
      const permission = browserNotificationService.getPermission();
      setBrowserNotificationPermission(
        permission.granted
          ? "granted"
          : permission.denied
          ? "denied"
          : "default"
      );
      console.log(
        "[NotificationContext] Browser notification permission initialized:",
        permission
      );
    }
  }, []);

  // Fetch notifications and settings when user logs in
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchNotifications();
      fetchNotificationSettings();
    } else {
      // Clear data when user logs out
      setNotifications([]);
      setRecentNotifications([]);
      setUnreadCount(0);
      setNotificationSettings(null);
    }
  }, [isAuthenticated, token]);

  // Poll for new notifications every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  const value: NotificationContextType = {
    notifications,
    recentNotifications,
    unreadCount,
    notificationSettings,
    loading,
    error,
    browserNotificationPermission,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    updateNotificationSettings,
    fetchNotificationSettings,
    requestBrowserNotificationPermission,
    testBrowserNotification,
    isBrowserNotificationSupported,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
