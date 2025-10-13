// Auto-increment this version on each deployment to force cache refresh
const VERSION = "v" + Date.now();
const CACHE_NAME = `albedo-ai-${VERSION}`;
const STATIC_CACHE = `albedo-static-${VERSION}`;
const DYNAMIC_CACHE = `albedo-dynamic-${VERSION}`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
};

// API routes that should use network-first strategy
const API_ROUTES = ["/api/", "/auth/"];

// Message handler for skip waiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("SW: Received SKIP_WAITING message");
    self.skipWaiting();
  }
});

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("SW: Installing service worker", VERSION);

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("SW: Caching static assets");
        // Cache offline page only - let other assets be cached on demand
        return cache.add("/offline.html").catch(() => {
          console.log("SW: Offline page not available, skipping");
        });
      })
      .then(() => {
        console.log("SW: Static assets cached successfully");
        // Force the waiting service worker to become active
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("SW: Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("SW: Activating service worker");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete all old caches that don't match current version
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            ) {
              console.log("SW: Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("SW: Service worker activated and old caches cleared");
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) URLs
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // For HTML pages, always use network-first to get fresh content
  if (
    request.headers.get("accept")?.includes("text/html") ||
    url.pathname === "/"
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Determine cache strategy based on request
  let strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;

  if (isApiRequest(url.pathname)) {
    strategy = CACHE_STRATEGIES.NETWORK_FIRST;
  } else if (isStaticAsset(url.pathname)) {
    strategy = CACHE_STRATEGIES.CACHE_FIRST;
  }

  event.respondWith(handleRequest(request, strategy));
});

// Cache-first strategy for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error("SW: Cache-first fetch failed:", error);
    // Return offline fallback if available
    return caches.match("/offline.html") || new Response("Offline");
  }
}

// Network-first strategy for API calls
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log("SW: Network failed, trying cache:", request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy for pages
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        // Clone immediately before the body is consumed by the browser
        const responseClone = response.clone();
        try {
          const cache = await caches.open(DYNAMIC_CACHE);
          await cache.put(request, responseClone);
        } catch (e) {
          // Cache put failures should not block the network response
          console.warn("SW: Failed to cache (SWR):", e);
        }
      }
      return response;
    })
    .catch(() => {
      // Network failed, return cached version if available
      return cached;
    });

  return cached || networkPromise;
}

// Main request handler
async function handleRequest(request, strategy) {
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
    default:
      return staleWhileRevalidate(request);
  }
}

// Helper functions
function isApiRequest(pathname) {
  return API_ROUTES.some((route) => pathname.startsWith(route));
}

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/.test(
    pathname
  );
}

// Background sync for offline form submissions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-feedback") {
    event.waitUntil(processPendingFeedback());
  }
});

async function processPendingFeedback() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    // Process any pending feedback submissions stored in IndexedDB
    console.log("SW: Processing pending feedback submissions");
  } catch (error) {
    console.error("SW: Failed to process pending feedback:", error);
  }
}

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const title = data.title || "Albedo AI";
  const options = {
    body: data.body || "You have a new notification",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: data.tag || "general",
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    handleNotificationAction(event.action, event.notification.data);
  } else {
    // Default click - open app
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});

function handleNotificationAction(action, data) {
  switch (action) {
    case "view-feedback":
      clients.openWindow(`/support/track/${data.token}`);
      break;
    case "admin-dashboard":
      clients.openWindow("/admin");
      break;
    default:
      clients.openWindow("/");
  }
}
