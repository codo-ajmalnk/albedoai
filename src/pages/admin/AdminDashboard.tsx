import { useState, useEffect } from "react";
import {
  BarChart3,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TableSkeleton, CardSkeleton } from "@/components/SkeletonLoader";

const mockMetrics = {
  totalFeedback: 247,
  openTickets: 23,
  totalArticles: 156,
  totalUsers: 1240,
  avgResponseTime: "2.5 hours",
  resolutionRate: "94%",
};

const recentFeedback = [
  {
    id: 1,
    subject: "Unable to reset password",
    user: "john@example.com",
    category: "Technical",
    status: "open",
    created: "2 hours ago",
  },
  {
    id: 2,
    subject: "Billing question about subscription",
    user: "sarah@example.com",
    category: "Billing",
    status: "resolved",
    created: "4 hours ago",
  },
  {
    id: 3,
    subject: "Feature request: Dark mode",
    user: "mike@example.com",
    category: "Feature Request",
    status: "in_progress",
    created: "1 day ago",
  },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-destructive";
      case "in_progress":
        return "bg-warning";
      case "resolved":
        return "bg-success";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "Open";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header - Add padding-top on mobile to avoid sidebar button overlap */}
      <div className="pt-12 lg:pt-0">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-foreground-muted">
          Overview of your support documentation and feedback system
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardSkeleton />
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Feedback
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMetrics.totalFeedback}
                </div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Open Tickets
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMetrics.openTickets}
                </div>
                <p className="text-xs text-muted-foreground">
                  -8% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Documentation Articles
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMetrics.totalArticles}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5 new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {mockMetrics.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  +23% from last month
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Feedback</CardTitle>
          <CardDescription>
            Latest support requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={3} />
          ) : (
            <div className="space-y-4">
              {recentFeedback.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{item.subject}</div>
                    <div className="text-sm text-foreground-muted">
                      {item.user} • {item.category} • {item.created}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusText(item.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Response Time</CardTitle>
            <CardDescription>Average time to first response</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton />
            ) : (
              <div className="text-2xl font-bold">
                {mockMetrics.avgResponseTime}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Rate</CardTitle>
            <CardDescription>Percentage of resolved tickets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton />
            ) : (
              <div className="text-2xl font-bold">
                {mockMetrics.resolutionRate}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
