import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AppSidebar } from "@/components/layout/Sidebar";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";

// Pages
import DocsIndex from "./pages/DocsIndex";
import Installation from "./pages/docs/Installation";
import ArticleView from "./pages/ArticleView";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="albedo-docs-theme">
      <TooltipProvider>
        <PerformanceMonitor />
        <Toaster />
        <Sonner />
        <SidebarProvider>
          <BrowserRouter>
            <div className="min-h-screen flex w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col cursor-docs-content">
                {/* Mobile/Tablet sidebar trigger - positioned on the right, hidden on desktop */}
                <div className="fixed top-4 right-4 z-50 lg:hidden">
                  <SidebarTrigger aria-label="Toggle navigation" />
                </div>
                <main className="cursor-docs-main">
                  <Routes>
                    <Route path="/" element={<DocsIndex />} />
                    <Route path="/docs" element={<DocsIndex />} />
                    
                    
                    {/* Dynamic article route - must come after specific routes */}
                    <Route path="/docs/:slug" element={<ArticleView />} />
                    {/* removed deprecated docs routes */}
                    <Route path="/support" element={<Support />} />
                    <Route
                      path="/support/track/:token"
                      element={<FeedbackTrack />}
                    />
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
              <PWAInstallPrompt />
            </div>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
