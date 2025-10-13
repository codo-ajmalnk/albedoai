import { useState, useEffect } from "react";
import { MessageSquare, FileText, Users, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TableSkeleton, CardSkeleton } from "@/components/SkeletonLoader";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FeedbackItem {
  id: number;
  subject: string;
  message: string;
  email: string;
  name?: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

interface DashboardMetrics {
  totalSupportRequests: number;
  openTickets: number;
  totalArticles: number;
  totalUsers: number;
  avgResponseTime: string;
  resolutionRate: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSupportRequests: 0,
    openTickets: 0,
    totalArticles: 0,
    totalUsers: 0,
    avgResponseTime: "N/A",
    resolutionRate: "N/A",
  });
  const [recentSupportRequests, setRecentSupportRequests] = useState<
    FeedbackItem[]
  >([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || "";

      // Fetch all data in parallel
      const [supportRequestRes, articlesRes, usersRes] = await Promise.all([
        fetch(`${baseUrl}/api/support-request`),
        fetch(`${baseUrl}/api/articles`),
        fetch(`${baseUrl}/api/users`),
      ]);

      if (!supportRequestRes.ok || !articlesRes.ok || !usersRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const supportRequestData: FeedbackItem[] = await supportRequestRes.json();
      const articlesData = await articlesRes.json();
      const usersData = await usersRes.json();

      // Calculate metrics
      const totalSupportRequests = supportRequestData.length;
      const openTickets = supportRequestData.filter(
        (f) => f.status === "pending" || f.status === "in_progress"
      ).length;
      const totalArticles = articlesData.length;
      const totalUsers = usersData.length;

      // Calculate average response time (for resolved/closed tickets)
      const resolvedFeedback = supportRequestData.filter(
        (f) => f.status === "resolved" || f.status === "closed"
      );
      let avgResponseTime = "N/A";
      if (resolvedFeedback.length > 0) {
        const totalHours = resolvedFeedback.reduce((sum, f) => {
          const created = new Date(f.created_at).getTime();
          const updated = new Date(f.updated_at).getTime();
          const hours = (updated - created) / (1000 * 60 * 60);
          return sum + hours;
        }, 0);
        const avgHours = totalHours / resolvedFeedback.length;
        avgResponseTime =
          avgHours < 1
            ? `${Math.round(avgHours * 60)} minutes`
            : `${avgHours.toFixed(1)} hours`;
      }

      // Calculate resolution rate
      const resolvedCount = resolvedFeedback.length;
      const resolutionRate =
        totalSupportRequests > 0
          ? `${Math.round((resolvedCount / totalSupportRequests) * 100)}%`
          : "N/A";

      setMetrics({
        totalSupportRequests,
        openTickets,
        totalArticles,
        totalUsers,
        avgResponseTime,
        resolutionRate,
      });

      // Get recent support requests (last 5)
      setRecentSupportRequests(supportRequestData.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-destructive";
      case "in_progress":
        return "bg-warning";
      case "resolved":
        return "bg-success";
      case "closed":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return "Unknown";
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return new Date(dateString).toLocaleDateString();
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
                  Total Tickets
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {metrics.totalSupportRequests}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total support requests
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
                <div className="text-2xl font-bold">{metrics.openTickets}</div>
                <p className="text-xs text-muted-foreground">
                  Pending & In Progress
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
                  {metrics.totalArticles}
                </div>
                <p className="text-xs text-muted-foreground">
                  Published & Draft
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Administrators
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Registered accounts
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Support Requests</CardTitle>
          <CardDescription>
            Latest support requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={3} />
          ) : recentSupportRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No support requests yet
            </div>
          ) : (
            <div
              onClick={() => navigate("/admin/support-request")}
              className="space-y-4 cursor-pointer"
            >
              {recentSupportRequests.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="font-medium truncate">{item.subject}</div>
                    <div className="text-sm text-foreground-muted truncate">
                      {item.email} • {formatRelativeTime(item.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
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
            <CardDescription>Average time to resolution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <CardSkeleton />
            ) : (
              <div className="text-2xl font-bold">
                {metrics.avgResponseTime}
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
              <div className="text-2xl font-bold">{metrics.resolutionRate}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
