import { useState } from 'react';
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
} from 'lucide-react';

const publicItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Getting Started', url: '/docs/getting-started', icon: Zap },
  { title: 'Documentation', url: '/docs', icon: BookOpen },
  { title: 'API Reference', url: '/docs/api', icon: FileText },
  { title: 'Authentication', url: '/docs/auth', icon: Shield },
  { title: 'Billing', url: '/docs/billing', icon: CreditCard },
  { title: 'Support', url: '/support', icon: MessageSquare },
];

const adminItems = [
  { title: 'Dashboard', url: '/admin', icon: BarChart3 },
  { title: 'Categories', url: '/admin/categories', icon: BookOpen },
  { title: 'Articles', url: '/admin/articles', icon: FileText },
  { title: 'Feedback', url: '/admin/feedback', icon: MessageSquare },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isAdminRoute = currentPath.startsWith('/admin');
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-accent hover:text-accent-foreground transition-colors';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Documentation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/'} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section - Show only if accessing admin routes */}
        {isAdminRoute && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}