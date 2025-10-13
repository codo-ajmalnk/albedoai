// Notification Service Worker for Browser Push Notifications
self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push received:", event);

  const options = {
    body: event.data ? event.data.text() : "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icon-192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192.png",
      },
    ],
    tag: "albedo-notification",
    renotify: true,
    requireInteraction: false,
    silent: false,
  };

  if (event.data) {
    try {
      const data = event.data.json();
      options.title = data.title || "AlbedoAI Notification";
      options.body = data.message || options.body;
      options.data = { ...options.data, ...data };

      // Customize notification based on type
      if (data.type === "support_request") {
        options.icon = "/icon-192.png";
        options.badge = "/icon-192.png";
        options.tag = "support-request";
      } else if (data.type === "user_created") {
        options.icon = "/icon-192.png";
        options.badge = "/icon-192.png";
        options.tag = "user-created";
      }
    } catch (e) {
      console.error("[Service Worker] Error parsing push data:", e);
    }
  }

  const promiseChain = self.registration.showNotification("AlbedoAI", options);

  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification click received:", event);

  event.notification.close();

  if (event.action === "explore") {
    // Open the app and focus on notifications
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(function (clientList) {
          // Check if there's already a window/tab open with the app
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (
              client.url.includes(self.location.origin) &&
              "focus" in client
            ) {
              client.postMessage({
                type: "NOTIFICATION_CLICK",
                action: "focus_notifications",
              });
              return client.focus();
            }
          }

          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow("/");
          }
        })
    );
  } else if (event.action === "close") {
    // Just close the notification
    return;
  } else {
    // Default click action - open the app
    event.waitUntil(
      clients
        .matchAll({ type: "window", includeUncontrolled: true })
        .then(function (clientList) {
          // Check if there's already a window/tab open with the app
          for (let i = 0; i < clientList.length; i++) {
            const client = clientList[i];
            if (
              client.url.includes(self.location.origin) &&
              "focus" in client
            ) {
              client.postMessage({
                type: "NOTIFICATION_CLICK",
                action: "focus_notifications",
              });
              return client.focus();
            }
          }

          // If no window is open, open a new one
          if (clients.openWindow) {
            return clients.openWindow("/");
          }
        })
    );
  }
});

// Handle background sync for offline notifications
self.addEventListener("sync", function (event) {
  if (event.tag === "notification-sync") {
    event.waitUntil(
      // Sync notifications when back online
      fetch("/api/notifications/sync")
        .then((response) => response.json())
        .then((data) => {
          console.log("[Service Worker] Synced notifications:", data);
        })
        .catch((error) => {
          console.error("[Service Worker] Sync failed:", error);
        })
    );
  }
});

// Listen for messages from the main thread
self.addEventListener("message", function (event) {
  console.log("[Service Worker] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
