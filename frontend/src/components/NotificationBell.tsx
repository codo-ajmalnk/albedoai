import React, { useState } from "react";
import { Bell, Check, CheckCheck, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/contexts/NotificationContext";
import { NotificationList } from "./NotificationList";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { unreadCount, recentNotifications, markAllAsRead } =
    useNotifications();
  const { setOpenMobile } = useSidebar();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleNavigateToAllNotifications = () => {
    // Close the popover
    setOpen(false);
    // Close the mobile sidebar if it's open
    setOpenMobile(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-sm font-semibold">Recent Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 px-2 text-xs"
            >
              <Link
                to="/admin/notifications"
                onClick={handleNavigateToAllNotifications}
              >
                <Eye className="h-3 w-3 mr-1" />
                View All
              </Link>
            </Button>
          </div>
        </div>
        <NotificationList notifications={recentNotifications} />
        {recentNotifications.length === 15 && (
          <div className="p-3 border-t bg-muted/50">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="w-full text-xs"
            >
              <Link
                to="/admin/notifications"
                onClick={handleNavigateToAllNotifications}
              >
                View All Notifications ({recentNotifications.length}+)
              </Link>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
