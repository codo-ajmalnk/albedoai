import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface Feedback {
  id: number;
  subject: string;
  message: string;
  email: string;
  name?: string;
  token: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  admin_response?: string;
  category_id?: number;
  created_at: string;
  updated_at: string;
}

export default function FeedbackTrack() {
  const { token } = useParams<{ token: string }>();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      fetchFeedback(token);
    }
  }, [token]);

  const fetchFeedback = async (token: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/feedback/${token}`);

      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      } else if (response.status === 404) {
        setError("Feedback not found. Please check your tracking link.");
      } else {
        setError("Failed to load feedback. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "destructive";
      case "in_progress":
        return "default";
      case "resolved":
        return "secondary";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="text-center">
            <Skeleton className="h-8 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-foreground-muted mb-6">{error}</p>
          <Button onClick={() => (window.location.href = "/support")}>
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No Feedback Found</h1>
          <p className="text-foreground-muted mb-6">
            The feedback you're looking for doesn't exist.
          </p>
          <Button onClick={() => (window.location.href = "/support")}>
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Support Request Status</h1>
        <p className="text-lg text-muted-foreground">
          Track the progress of your support request
        </p>
      </div>

      {/* Feedback Details */}
      <Card className="mb-8 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-3 text-xl mb-2">
                <MessageSquare className="h-6 w-6 flex-shrink-0" />
                <span className="break-words">{feedback.subject}</span>
              </CardTitle>
              <CardDescription className="text-base">
                Submitted on {formatDate(feedback.created_at)}
              </CardDescription>
            </div>
            <Badge
              variant={getStatusColor(feedback.status)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm w-fit"
            >
              {getStatusIcon(feedback.status)}
              {feedback.status.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-3 text-base">Original Message:</h4>
            <div className="p-5 bg-secondary/50 rounded-lg">
              <p className="whitespace-pre-wrap leading-relaxed">
                {feedback.message}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-4 text-base">Request Details:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:gap-2 min-w-0">
                  <span className="text-muted-foreground font-medium">
                    Email:
                  </span>
                  <span className="break-all">{feedback.email}</span>
                </div>
              </div>
              {feedback.name && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col sm:flex-row sm:gap-2">
                    <span className="text-muted-foreground font-medium">
                      Name:
                    </span>
                    <span>{feedback.name}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="text-muted-foreground font-medium">
                    Last Updated:
                  </span>
                  <span>{formatDate(feedback.updated_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:gap-2 min-w-0">
                  <span className="text-muted-foreground font-medium">
                    Tracking ID:
                  </span>
                  <code className="text-xs bg-muted px-3 py-1.5 rounded break-all">
                    {feedback.token}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Response */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl">Support Team Response</CardTitle>
          <CardDescription className="text-base">
            Response from our support team
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.admin_response ? (
            <div className="p-6 rounded-lg border-2 bg-primary/5 border-primary/20">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-base">Support Team</span>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    Response
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDate(feedback.updated_at)}
                </span>
              </div>
              <p className="text-base whitespace-pre-wrap leading-relaxed">
                {feedback.admin_response}
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
              <p className="text-lg text-muted-foreground mb-2">
                No response yet. Our support team will respond soon.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive an email notification when we respond.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          size="lg"
          className="min-w-[200px]"
          onClick={() => (window.location.href = "/support")}
        >
          Submit New Request
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="min-w-[200px]"
          onClick={() => (window.location.href = "/docs")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Browse Documentation
        </Button>
      </div>
    </div>
  );
}
