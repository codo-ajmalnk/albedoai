import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/Sidebar";
import { ChatWidget } from "@/components/chat/ChatWidget";

// Pages
import DocsIndex from "./pages/DocsIndex";
import Installation from "./pages/docs/Installation";
import Support from "./pages/Support";
import FeedbackTrack from "./pages/FeedbackTrack";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Categories from "./pages/admin/Categories";
import Articles from "./pages/admin/Articles";
import Feedback from "./pages/admin/Feedback";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import GettingStarted from "./pages/docs/GettingStarted";
import FAQ from "./pages/docs/FAQ";
import Examples from "./pages/docs/Examples";
import RateLimits from "./pages/docs/RateLimits";
import Webhooks from "./pages/docs/Webhooks";
import SDKs from "./pages/docs/SDKs";
import API from "./pages/docs/API";
import Auth from "./pages/docs/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="albedo-docs-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col cursor-docs-content">
                <Header />
                <main className="cursor-docs-main">
                  <Routes>
                    <Route path="/" element={<DocsIndex />} />
                    <Route path="/docs" element={<DocsIndex />} />
                    <Route path="/docs/installation" element={<Installation />} />
                    <Route path="/docs/getting-started" element={<GettingStarted />} />
                    <Route path="/docs/faq" element={<FAQ />} />
                    <Route path="/docs/examples" element={<Examples />} />
                    <Route path="/docs/rate-limits" element={<RateLimits />} />
                    <Route path="/docs/webhooks" element={<Webhooks />} />
                    <Route path="/docs/sdks" element={<SDKs />} />
                    <Route path="/docs/api" element={<API />} />
                    <Route path="/docs/auth" element={<Auth />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/support/track/:token" element={<FeedbackTrack />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/categories" element={<Categories />} />
                    <Route path="/admin/articles" element={<Articles />} />
                    <Route path="/admin/feedback" element={<Feedback />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/settings" element={<Settings />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              <ChatWidget />
            </div>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
