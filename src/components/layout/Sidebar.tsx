import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
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
  Shield,
  CreditCard,
  Zap,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Mobile Menu Component
function MobileMenuButton() {
  const { openMobile, setOpenMobile } = useSidebar();
  
  return (
    <button
      onClick={() => setOpenMobile(!openMobile)}
      className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-md bg-background border border-border shadow-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200"
      aria-label="Toggle navigation menu"
    >
      {openMobile ? (
        <X className="h-4 w-4" />
      ) : (
        <Menu className="h-4 w-4" />
      )}
    </button>
  );
}

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
            "flex items-center gap-3 px-3 py-2.5",
            "text-sm font-medium transition-all duration-200"
          )}
        >
          <item.icon className={cn(
            "h-4 w-4 flex-shrink-0",
            isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate font-medium">
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
      {/* Mobile Menu Button */}
      <MobileMenuButton />
      
      {/* Mobile Overlay */}
      <MobileOverlay />
      
      <Sidebar 
        className={cn(
          "cursor-docs-sidebar",
          collapsed ? 'w-16' : 'w-72',
          "transition-all duration-300 ease-in-out"
        )} 
        collapsible="icon"
        variant="sidebar"
      >
        <SidebarContent className="px-4 py-6">
          {/* Header Section */}
          {!collapsed && (
            <div className="mb-8 px-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">A</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Albedo AI</h1>
                  <p className="text-xs text-muted-foreground">Documentation</p>
                </div>
              </div>
            </div>
          )}

          {/* Documentation Section */}
          <SidebarGroup className="mb-8">
            <SidebarGroupLabel className={cn(
              "text-xs font-semibold uppercase tracking-wider mb-4 px-2",
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
                "text-xs font-semibold uppercase tracking-wider mb-4 px-2",
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
        </SidebarContent>
      </Sidebar>
    </>
  );
}