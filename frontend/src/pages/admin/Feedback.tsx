import { useState, useEffect } from "react";
import {
  Heart,
  Star,
  MessageCircle,
  Mail,
  User,
  Calendar,
  TrendingUp,
  Users,
  Star as StarIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { TableSkeleton, CardSkeleton } from "@/components/SkeletonLoader";

interface Feedback {
  id: number;
  email: string;
  name: string | null;
  message: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
}

interface FeedbackStats {
  total_feedback: number;
  average_rating: number | null;
  rating_count: number;
  rating_distribution: Record<string, number>;
  feedback_without_rating: number;
}

export default function FeedbackAdmin() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { token } = useAuth();

  const fetchFeedback = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

      const [feedbackRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/api/feedback`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${baseUrl}/api/feedback/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!feedbackRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch feedback data");
      }

      const feedbackData = await feedbackRes.json();
      const statsData = await statsRes.json();

      setFeedback(feedbackData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [token]);

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name &&
        item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number | null) => {
    if (!rating)
      return <span className="text-muted-foreground">No rating</span>;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon
            key={index}
            className={`h-4 w-4 ${
              index < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">{rating}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Experience Feedback</h1>
          <p className="text-muted-foreground">
            View and analyze user feedback about the platform experience
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-pink-500" />
          User Experience Feedback
        </h1>
        <p className="text-muted-foreground">
          View and analyze user feedback about the platform experience
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Feedback
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.total_feedback || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              User experience feedback entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.average_rating ? stats.average_rating.toFixed(1) : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5 stars ({stats?.rating_count || 0} ratings)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Ratings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.rating_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_feedback
                ? Math.round((stats.rating_count / stats.total_feedback) * 100)
                : 0}
              % of total feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Without Ratings
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.feedback_without_rating || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Text-only feedback entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      {stats?.rating_distribution && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
            <CardDescription>
              Breakdown of ratings from 1 to 5 stars
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(stats.rating_distribution).map(
                ([rating, count]) => (
                  <div key={rating} className="text-center">
                    <div className="flex justify-center mb-2">
                      {Array.from({ length: parseInt(rating) }, (_, index) => (
                        <StarIcon
                          key={index}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">
                      {rating} star{parseInt(rating) !== 1 ? "s" : ""}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Feedback Entries</CardTitle>
              <CardDescription>
                All user experience feedback submissions
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No feedback found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms."
                  : "No user experience feedback has been submitted yet."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {item.name || "Anonymous"}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {item.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(item.rating)}</TableCell>
                    <TableCell className="max-w-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-pointer">
                              <p className="text-sm line-clamp-2 truncate">
                                {item.message}
                              </p>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-md">
                            <p className="text-sm whitespace-pre-wrap">
                              {item.message}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
