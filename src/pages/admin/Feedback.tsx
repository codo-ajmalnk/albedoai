import { useState, useEffect } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableSkeleton } from "@/components/SkeletonLoader";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: number;
  subject: string;
  message: string;
  email: string;
  name?: string;
  category_id?: number;
  token: string;
  status: "pending" | "in_progress" | "resolved" | "closed";
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

export default function Feedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(
    null
  );
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/feedback`);

      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      toast({
        title: "Error",
        description: "Failed to load feedback. Please try again.",
        variant: "destructive",
      });
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

  const filteredFeedback = feedback.filter((item) => {
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesSearch =
      searchQuery === "" ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (feedbackId: number, newStatus: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/feedback/${feedbackId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        const updatedFeedback = await response.json();
        setFeedback((prev) =>
          prev.map((item) => (item.id === feedbackId ? updatedFeedback : item))
        );
        toast({
          title: "Status updated",
          description: `Feedback status changed to ${newStatus}`,
        });
      } else {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReply = async () => {
    if (!selectedFeedback || !replyMessage.trim()) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(
        `${baseUrl}/api/feedback/${selectedFeedback.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_response: replyMessage,
            status: "in_progress",
          }),
        }
      );

      if (response.ok) {
        const updatedFeedback = await response.json();
        setFeedback((prev) =>
          prev.map((item) =>
            item.id === selectedFeedback.id ? updatedFeedback : item
          )
        );

        setReplyMessage("");
        setIsReplyDialogOpen(false);
        toast({
          title: "Reply sent",
          description: "Your reply has been sent to the user.",
        });
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header - Add padding-top on mobile to avoid sidebar button overlap */}
      <div className="pt-12 lg:pt-0">
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <p className="text-foreground-muted">
          View and respond to user feedback and support requests
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by subject or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Requests</CardTitle>
          <CardDescription>
            All feedback and support requests from users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No feedback found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-secondary/50"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{item.subject}</div>
                            <div className="text-sm text-foreground-muted truncate max-w-xs">
                              {item.message}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-foreground-muted" />
                            <span className="text-sm">{item.email}</span>
                          </div>
                          {item.name && (
                            <span className="text-xs text-muted-foreground ml-6">
                              {item.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.status}
                          onValueChange={(value) =>
                            handleStatusChange(item.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <Badge variant={getStatusColor(item.status)}>
                              {item.status.replace("_", " ")}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-foreground-muted">
                          <Calendar className="h-4 w-4" />
                          {formatDate(item.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(item);
                            setReplyMessage(item.admin_response || "");
                            setIsReplyDialogOpen(true);
                          }}
                        >
                          {item.admin_response ? "View/Edit Reply" : "Reply"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to: {selectedFeedback?.subject}</DialogTitle>
            <DialogDescription>
              Send a response to {selectedFeedback?.email}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* User Details */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span>{" "}
                    {selectedFeedback.email}
                  </div>
                  {selectedFeedback.name && (
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedFeedback.name}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Status:</span>{" "}
                    <Badge variant={getStatusColor(selectedFeedback.status)}>
                      {selectedFeedback.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Token:</span>{" "}
                    <code className="text-xs">{selectedFeedback.token}</code>
                  </div>
                </div>
              </div>

              {/* Original Message */}
              <div className="p-4 bg-secondary rounded-lg">
                <div className="text-sm font-medium mb-2">
                  Original Message:
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {selectedFeedback.message}
                </div>
              </div>

              {/* Admin Response Form */}
              <div className="space-y-2">
                <label htmlFor="reply" className="text-sm font-medium">
                  {selectedFeedback.admin_response
                    ? "Update Response"
                    : "Your Response"}
                </label>
                <Textarea
                  id="reply"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  rows={8}
                />
                {selectedFeedback.admin_response && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {formatDate(selectedFeedback.updated_at)}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReplyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReply} disabled={!replyMessage.trim()}>
              {selectedFeedback?.admin_response
                ? "Update Response"
                : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
