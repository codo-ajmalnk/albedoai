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
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import DocsIndex from "./pages/DocsIndex";
import ArticleView from "./pages/ArticleView";
import SupportRequest from "./pages/SupportRequest";
import FeedbackTrack from "./pages/FeedbackTrack";
import Feedback from "./pages/Feedback";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Categories from "./pages/admin/Categories";
import Articles from "./pages/admin/Articles";
import SupportRequestAdmin from "./pages/admin/SupportRequest";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import FeedbackAdmin from "./pages/admin/Feedback";
import NotificationsPage from "./pages/admin/Notifications";
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
            <AuthProvider>
              <NotificationProvider>
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
                        <Route path="/support" element={<SupportRequest />} />
                        <Route
                          path="/support/track/:token"
                          element={<FeedbackTrack />}
                        />
                        <Route path="/feedback" element={<Feedback />} />

                        {/* Login route */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Admin routes */}
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/categories"
                          element={
                            <ProtectedRoute>
                              <Categories />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/articles"
                          element={
                            <ProtectedRoute>
                              <Articles />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/support-request"
                          element={
                            <ProtectedRoute>
                              <SupportRequestAdmin />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/users"
                          element={
                            <ProtectedRoute>
                              <Users />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/feedback"
                          element={
                            <ProtectedRoute>
                              <FeedbackAdmin />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/settings"
                          element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin/notifications"
                          element={
                            <ProtectedRoute>
                              <NotificationsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                  </div>
                  <ChatWidget />
                  {/* <PWAInstallPrompt /> */}
                </div>
              </NotificationProvider>
            </AuthProvider>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
