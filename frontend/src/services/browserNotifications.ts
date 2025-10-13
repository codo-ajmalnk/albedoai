/**
 * Browser Notification Service
 * Handles Web Push Notifications for the browser
 */

export interface NotificationPermission {
    granted: boolean;
    denied: boolean;
    default: boolean;
}

export interface BrowserNotificationData {
    title: string;
    message: string;
    type: 'support_request' | 'user_created' | 'general';
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
}

class BrowserNotificationService {
    private isSupported: boolean = false;
    private permission: NotificationPermission = {
        granted: false,
        denied: false,
        default: true
    };

    constructor() {
        this.checkSupport();
        this.updatePermission();
    }

    private checkSupport(): void {
        this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
        console.log('[BrowserNotifications] Support check:', this.isSupported);
    }

    private updatePermission(): void {
        if (!this.isSupported) return;

        const permission = Notification.permission;
        this.permission = {
            granted: permission === 'granted',
            denied: permission === 'denied',
            default: permission === 'default'
        };
        console.log('[BrowserNotifications] Permission:', this.permission);
    }

    /**
     * Check if browser notifications are supported
     */
    public isNotificationSupported(): boolean {
        return this.isSupported;
    }

    /**
     * Get current notification permission status
     */
    public getPermission(): NotificationPermission {
        return { ...this.permission };
    }

    /**
     * Request notification permission from user
     */
    public async requestPermission(): Promise<boolean> {
        if (!this.isSupported) {
            console.warn('[BrowserNotifications] Notifications not supported');
            return false;
        }

        if (this.permission.granted) {
            console.log('[BrowserNotifications] Permission already granted');
            return true;
        }

        if (this.permission.denied) {
            console.warn('[BrowserNotifications] Permission denied by user');
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.updatePermission();
            
            if (permission === 'granted') {
                console.log('[BrowserNotifications] Permission granted by user');
                return true;
            } else {
                console.log('[BrowserNotifications] Permission denied by user');
                return false;
            }
        } catch (error) {
            console.error('[BrowserNotifications] Error requesting permission:', error);
            return false;
        }
    }

  /**
   * Show a browser notification
   */
  public async showNotification(data: BrowserNotificationData): Promise<void> {
    console.log('[BrowserNotifications] Attempting to show notification:', data);
    
    if (!this.isSupported) {
      console.warn('[BrowserNotifications] Notifications not supported');
      return;
    }

    if (!this.permission.granted) {
      console.warn('[BrowserNotifications] Permission not granted');
      return;
    }

    try {
      const options: NotificationOptions = {
        body: data.message,
        icon: data.icon || '/icon-192.png',
        badge: data.badge || '/icon-192.png',
        tag: data.tag || 'albedo-notification',
        data: data.data || {},
        vibrate: [100, 50, 100],
        requireInteraction: false,
        silent: false,
        // Remove actions for direct notifications (they only work with service worker)
      };

      const notification = new Notification(data.title, options);

            notification.onclick = (event) => {
                event.preventDefault();
                notification.close();
                
                // Focus the window if it exists
                if (window) {
                    window.focus();
                }
                
                // Navigate to notifications or admin dashboard
                const currentPath = window.location.pathname;
                if (currentPath.includes('/admin')) {
                    // Already in admin area, just focus
                    window.focus();
                } else {
                    // Navigate to admin dashboard
                    window.location.href = '/admin';
                }
            };

      notification.onshow = () => {
        console.log('[BrowserNotifications] Notification shown successfully:', data.title);
      };

            notification.onerror = (error) => {
                console.error('[BrowserNotifications] Notification error:', error);
            };

            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);

        } catch (error) {
            console.error('[BrowserNotifications] Error showing notification:', error);
        }
    }

  /**
   * Show notification for support request
   */
  public async showSupportRequestNotification(supportRequest: any): Promise<void> {
    console.log('[BrowserNotifications] Showing support request notification:', supportRequest);
    await this.showNotification({
      title: 'New Support Request',
      message: `New support request from ${supportRequest.name || supportRequest.email}: ${supportRequest.subject}`,
      type: 'support_request',
      tag: `support-request-${supportRequest.id}`,
      data: {
        support_request_id: supportRequest.id,
        email: supportRequest.email,
        subject: supportRequest.subject
      }
    });
  }

  /**
   * Show notification for user creation
   */
  public async showUserCreatedNotification(user: any): Promise<void> {
    console.log('[BrowserNotifications] Showing user created notification:', user);
    await this.showNotification({
      title: 'New User Created',
      message: `New user '${user.username}' (${user.email}) has been created`,
      type: 'user_created',
      tag: `user-created-${user.id}`,
      data: {
        user_id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  }

    /**
     * Test notification (for testing purposes)
     */
    public async testNotification(): Promise<void> {
        await this.showNotification({
            title: 'Test Notification',
            message: 'This is a test notification from AlbedoAI',
            type: 'general',
            tag: 'test-notification'
        });
    }

    /**
     * Close all notifications with a specific tag
     */
    public closeNotifications(tag?: string): void {
        if (!this.isSupported) return;

        // Get all open notifications and close them
        // Note: There's no direct way to close all notifications, but we can close by tag
        if (tag) {
            // This is a limitation of the Notification API
            // We can only close notifications that we have references to
            console.log('[BrowserNotifications] Cannot close notifications by tag directly');
        }
    }
}

// Create singleton instance
export const browserNotificationService = new BrowserNotificationService();

// Export the class for testing
export default BrowserNotificationService;
