import { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  BarChart3,
  FileText,
  Zap,
  Search,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SidebarFooter, SidebarSeparator } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchModal } from '@/components/SearchModal';

const publicItems = [
  { 
    title: 'Getting Started', 
    url: '/docs/getting-started', 
    icon: Zap,
  },
  { 
    title: 'Installation', 
    url: '/docs/installation', 
    icon: Home,
  },
  { 
    title: 'FAQ', 
    url: '/docs/faq', 
    icon: Settings,
  },
];

const adminItems = [
  { 
    title: 'Analytics', 
    url: '/admin', 
    icon: BarChart3,
  },
  { 
    title: 'Content', 
    url: '/admin/categories', 
    icon: BookOpen,
  },
  { 
    title: 'Articles', 
    url: '/admin/articles', 
    icon: FileText,
  },
  { 
    title: 'Feedback', 
    url: '/admin/feedback', 
    icon: MessageSquare,
  },
  { 
    title: 'Users', 
    url: '/admin/users', 
    icon: Users,
  },
  { 
    title: 'Settings', 
    url: '/admin/settings', 
    icon: Settings,
  },
];

// Mobile Menu Component - Removed since we're using SidebarTrigger in Header

// Mobile Overlay Component
function MobileOverlay() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  
  if (!isMobile || !openMobile) return null;
  
  return (
    <div 
      className="sidebar-mobile-overlay"
      onClick={() => setOpenMobile(false)}
      aria-hidden="true"
    />
  );
}

// Cursor-style Navigation Item Component
function NavItem({ 
  item, 
  isActive, 
  collapsed, 
  isMobile = false 
}: { 
  item: typeof publicItems[0]; 
  isActive: boolean; 
  collapsed: boolean;
  isMobile?: boolean;
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
          end={item.url === '/'}
          data-active={isActive}
          className={cn(
            "cursor-docs-nav-item",
            "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5",
            "text-sm font-medium transition-all duration-200"
          )}
        >
          <item.icon className={cn(
            "h-4 w-4 flex-shrink-0",
            isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate font-medium text-sm sm:text-sm">
                {item.title}
              </span>
              {!isMobile && (
                <span className={cn(
                  "text-xs truncate transition-opacity duration-150 mt-0.5",
                  isActive ? "text-sidebar-primary-foreground/70" : "text-muted-foreground/60 group-hover:text-muted-foreground"
                )}>
                </span>
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
  const location = useLocation();
  const currentPath = location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin');
  const collapsed = state === 'collapsed';
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  }, [currentPath, isMobile, openMobile, setOpenMobile]);

  return (
    <>
      {/* Mobile Overlay */}
      <MobileOverlay />
      
      <Sidebar 
        className={cn(
          "cursor-docs-sidebar",
          collapsed ? 'w-16' : 'w-64 lg:w-72',
          "transition-all duration-300 ease-in-out"
        )} 
        collapsible={isMobile ? "offcanvas" : "icon"}
        variant="sidebar"
      >
        {/* Sticky header (outside scrollable content) */}
        {!collapsed && (
          <SidebarHeader className="px-3 sm:px-4 pt-4 sm:pt-6 pb-3 sm:pb-4 sticky top-0 z-10 bg-sidebar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm sm:text-base">A</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">Albedo AI</h1>
                  <p className="text-xs text-muted-foreground truncate">Documentation</p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </SidebarHeader>
        )}

        <SidebarContent className="px-3 sm:px-4 py-4 sm:py-6">
          {/* Documentation Section */}
          <SidebarGroup className="mb-6 sm:mb-8">
            <SidebarGroupLabel className={cn(
              "text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 px-2",
              "text-muted-foreground",
              "transition-all duration-200",
              collapsed && "opacity-0 -mt-2"
            )}>
              Documentation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {publicItems.map((item) => (
                  <NavItem
                    key={item.title}
                    item={item}
                    isActive={isActive(item.url)}
                    collapsed={collapsed}
                    isMobile={isMobile}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin Section - Show only if accessing admin routes */}
          {isAdminRoute && (
            <SidebarGroup>
              <SidebarGroupLabel className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 px-2",
                "text-muted-foreground",
                "transition-all duration-200",
                collapsed && "opacity-0 -mt-2"
              )}>
                Administration
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminItems.map((item) => (
                    <NavItem
                      key={item.title}
                      item={item}
                      isActive={isActive(item.url)}
                      collapsed={collapsed}
                      isMobile={isMobile}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
          {/* Footer actions */}
          <SidebarSeparator />
          <SidebarFooter className={cn("mt-auto", collapsed && "items-center")}> 
            {/* Search trigger */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSearchOpen(true)}
              className={cn("h-9 w-full justify-start", collapsed && "w-9 p-0 justify-center")}
            >
              <Search className="h-4 w-4" />
              {!collapsed && <span className="ml-2">Search</span>}
            </Button>

            {/* Support link */}
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className={cn("h-9 w-full justify-start", collapsed && "w-9 p-0 justify-center")}
            >
              <Link to="/support" className="flex items-center">
                <MessageCircle className="h-4 w-4" />
                {!collapsed && <span className="ml-2">Support</span>}
              </Link>
            </Button>

          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}