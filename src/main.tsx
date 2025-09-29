import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadCriticalResources, addResourceHints, inlineCriticalCSS } from "./utils/performance";

// Initialize performance optimizations
inlineCriticalCSS();
addResourceHints();
preloadCriticalResources();

// Use React 18 concurrent features
const root = createRoot(document.getElementById("root")!);
root.render(<App />);
