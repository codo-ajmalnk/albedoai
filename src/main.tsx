import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
  preloadCriticalResources,
  addResourceHints,
  inlineCriticalCSS,
} from "./utils/performance";

// Initialize performance optimizations
inlineCriticalCSS();
addResourceHints();
preloadCriticalResources();

// Service Worker Update Handler
if ("serviceWorker" in navigator) {
  let refreshing = false;

  // Reload page when new service worker takes control
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    console.log("New service worker activated, reloading page...");
    window.location.reload();
  });

  // Check for updates every 60 seconds in production
  if (import.meta.env.PROD) {
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update().catch((err) => {
            console.log("Service worker update check failed:", err);
          });
        }
      });
    }, 60000); // Check every minute
  }

  // Check for updates on visibility change (when user returns to tab)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg) {
          reg.update().catch((err) => {
            console.log("Service worker update check failed:", err);
          });
        }
      });
    }
  });
}

// Use React 18 concurrent features
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
