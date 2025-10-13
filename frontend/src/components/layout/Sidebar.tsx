import { useState, useEffect } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Home,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  FileText,
  Search,
  MessageCircle,
  ChevronRight,
  LogOut,
  User,
  Heart,
  Bell,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { SidebarFooter, SidebarSeparator } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchModal } from "@/components/SearchModal";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/NotificationBell";

// Custom hook to check if device is mobile or tablet (for sidebar purposes)
function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return isMobileOrTablet;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  category_id: string;
}

const adminItems = [
  {
    title: "Analytics",
    url: "/admin",
    icon: BarChart3,
  },
  {
    title: "Content",
    url: "/admin/categories",
    icon: BookOpen,
  },
  {
    title: "Articles",
    url: "/admin/articles",
    icon: FileText,
  },
  {
    title: "Support Requests",
    url: "/admin/support-request",
    icon: MessageSquare,
  },
  {
    title: "Feedback",
    url: "/admin/feedback",
    icon: Heart,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

// Mobile Menu Component - Removed since we're using SidebarTrigger in Header

// Mobile Overlay Component
function MobileOverlay() {
  const { openMobile, setOpenMobile } = useSidebar();
  const isMobileOrTablet = useIsMobileOrTablet();

  if (!isMobileOrTablet || !openMobile) return null;

  return (
    <div
      className="sidebar-mobile-overlay"
      onClick={(e) => {
        e.stopPropagation();
        setOpenMobile(false);
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        setOpenMobile(false);
      }}
      aria-hidden="true"
    />
  );
}

// Cursor-style Navigation Item Component
function NavItem({
  item,
  isActive,
  collapsed,
  isMobile = false,
  onClick,
}: {
  item: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
  collapsed: boolean;
  isMobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={collapsed ? item.title : undefined}
        className="group"
      >
        <NavLink
          to={item.url}
          end={item.url === "/"}
          data-active={isActive}
          onClick={onClick}
          className={cn(
            "cursor-docs-nav-item",
            "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5",
            "text-sm font-medium transition-all duration-200"
          )}
        >
          <item.icon
            className={cn(
              "h-4 w-4 flex-shrink-0",
              isActive
                ? "text-sidebar-primary-foreground"
                : "text-muted-foreground group-hover:text-foreground"
            )}
          />

          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate font-medium text-sm sm:text-sm">
                {item.title}
              </span>
              {!isMobile && (
                <span
                  className={cn(
                    "text-xs truncate transition-opacity duration-150 mt-0.5",
                    isActive
                      ? "text-sidebar-primary-foreground/70"
                      : "text-muted-foreground/60 group-hover:text-muted-foreground"
                  )}
                ></span>
              )}
            </div>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar();
  const isMobileOrTablet = useIsMobileOrTablet();
  const location = useLocation();
  const currentPath = location.pathname;
  const isAdminRoute = currentPath.startsWith("/admin");
  const collapsed = state === "collapsed";
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Auth hook - must be called at top level
  const { user, logout } = useAuth();

  // Fetch categories and articles
  const fetchDocsData = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";

      // Fetch categories
      const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(
          categoriesData.map((cat: any) => ({
            id: cat.id.toString(),
            name: cat.name,
            description: cat.description,
            color: cat.color,
          }))
        );
      }

      // Fetch articles
      const articlesResponse = await fetch(
        `${baseUrl}/api/articles?is_published=true`
      );
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        setArticles(
          articlesData.map((art: any) => ({
            id: art.id.toString(),
            title: art.title,
            slug: art.slug,
            category_id: art.category_id.toString(),
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching docs data:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocsData();

    // Listen for custom events to refresh sidebar data
    const handleRefresh = () => {
      fetchDocsData();
    };

    window.addEventListener("sidebar-refresh", handleRefresh);
    return () => {
      window.removeEventListener("sidebar-refresh", handleRefresh);
    };
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  // Handle closing sidebar on mobile/tablet after navigation
  const handleNavClick = () => {
    if (isMobileOrTablet) {
      // Small delay to allow navigation to complete smoothly
      setTimeout(() => {
        setOpenMobile(false);
      }, 100);
    }
  };

  // Group articles by category
  const getArticlesByCategory = (categoryId: string) => {
    return articles.filter((article) => article.category_id === categoryId);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <MobileOverlay />

      <Sidebar
        className={cn(
          "cursor-docs-sidebar",
          collapsed ? "w-16" : "w-64 lg:w-72",
          "transition-all duration-300 ease-in-out",
          // Ensure desktop sidebar is visible
          "lg:block"
        )}
        collapsible={isMobileOrTablet ? "offcanvas" : "icon"}
        variant="sidebar"
      >
        {/* Sticky header (outside scrollable content) */}
        {!collapsed && (
          <SidebarHeader className="px-3 sm:px-4 pt-4 sm:pt-6 pb-3 sm:pb-4 sticky top-0 z-10 bg-sidebar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm sm:text-base">
                    A
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">
                    Albedo AI
                  </h1>
                  <p className="text-xs text-muted-foreground truncate">
                    Documentation
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </SidebarHeader>
        )}

        <SidebarContent className="px-3 sm:px-4 py-4 sm:py-6">
          {/* Documentation Section */}
          <SidebarGroup className="mb-6 sm:mb-8">
            <SidebarGroupLabel
              className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 px-2",
                "text-muted-foreground",
                "transition-all duration-200",
                collapsed && "opacity-0 -mt-2"
              )}
            >
              Documentation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {loadingDocs ? (
                  // Loading skeleton
                  <>
                    {[1, 2, 3].map((i) => (
                      <SidebarMenuItem key={i}>
                        <div className="h-9 bg-sidebar-accent/50 rounded-md animate-pulse" />
                      </SidebarMenuItem>
                    ))}
                  </>
                ) : (
                  categories.map((category) => {
                    const categoryArticles = getArticlesByCategory(category.id);
                    const hasArticles = categoryArticles.length > 0;

                    return (
                      <Collapsible
                        key={category.id}
                        defaultOpen={false}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              tooltip={collapsed ? category.name : undefined}
                              className="group"
                            >
                              {/* <BookOpen
                                className={cn(
                                  "h-4 w-4 flex-shrink-0",
                                  "text-muted-foreground group-hover:text-foreground"
                                )}
                                style={{ color: category.color || undefined }}
                              /> */}
                              {!collapsed && (
                                <span className="truncate font-medium text-sm">
                                  {category.name}
                                </span>
                              )}
                              {!collapsed && hasArticles && (
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              )}
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          {!collapsed && hasArticles && (
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {categoryArticles.map((article) => (
                                  <SidebarMenuSubItem key={article.id}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={currentPath.includes(
                                        article.slug
                                      )}
                                    >
                                      <NavLink
                                        to={`/docs/${article.slug}`}
                                        onClick={handleNavClick}
                                        className="text-xs px-2 py-1"
                                      >
                                        {article.title}
                                      </NavLink>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          )}
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin Section - Show only if accessing admin routes */}
          {isAdminRoute && (
            <SidebarGroup>
              <SidebarGroupLabel
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 px-2",
                  "text-muted-foreground",
                  "transition-all duration-200",
                  collapsed && "opacity-0 -mt-2"
                )}
              >
                <div className="flex items-center justify-between">
                  <span>Administration</span>
                  {!collapsed && <NotificationBell />}
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminItems.map((item) => (
                    <NavItem
                      key={item.title}
                      item={item}
                      isActive={isActive(item.url)}
                      collapsed={collapsed}
                      isMobile={isMobileOrTablet}
                      onClick={handleNavClick}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {/* Footer actions */}
          <SidebarSeparator />
          <SidebarFooter className={cn("mt-auto", collapsed && "items-center")}>
            {/* User info and logout (only on admin routes) */}
            {isAdminRoute && user && (
              <>
                <div
                  className={cn(
                    "px-3 py-2 mb-2 rounded-md bg-secondary/50",
                    collapsed && "px-2"
                  )}
                >
                  {!collapsed ? (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.username}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className={cn(
                    "h-9 w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10",
                    collapsed && "w-9 p-0 justify-center"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!collapsed && <span className="ml-2">Logout</span>}
                </Button>
              </>
            )}

            {/* Search trigger */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className={cn(
                "h-9 w-full justify-start",
                collapsed && "w-9 p-0 justify-center"
              )}
            >
              <Search className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Search</span>}
            </Button>

            {/* Support Request link */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "h-9 w-full justify-start",
                collapsed && "w-9 p-0 justify-center"
              )}
            >
              <Link
                to="/support"
                onClick={handleNavClick}
                className="flex items-center"
              >
                <MessageCircle className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Support Request</span>}
              </Link>
            </Button>

            {/* Feedback link */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "h-9 w-full justify-start",
                collapsed && "w-9 p-0 justify-center"
              )}
            >
              <Link
                to="/feedback"
                onClick={handleNavClick}
                className="flex items-center"
              >
                <Heart className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Feedback</span>}
              </Link>
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
