import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Clock, CheckCircle, AlertCircle, User, Calendar, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  subject: string;
  message: string;
  email: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  replies: Reply[];
}

interface Reply {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
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
      const response = await fetch(`/api/feedback/token/${token}`);
      
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      } else if (response.status === 404) {
        setError('Feedback not found. Please check your tracking link.');
      } else {
        setError('Failed to load feedback. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'destructive';
      case 'IN_PROGRESS': return 'default';
      case 'CLOSED': return 'secondary';
      case 'RESOLVED': return 'success';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      case 'CLOSED': return <CheckCircle className="h-4 w-4" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
          <Button onClick={() => window.location.href = '/support'}>
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
          <p className="text-foreground-muted mb-6">The feedback you're looking for doesn't exist.</p>
          <Button onClick={() => window.location.href = '/support'}>
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Request Status</h1>
        <p className="text-foreground-muted">
          Track the progress of your support request
        </p>
      </div>

      {/* Feedback Details */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {feedback.subject}
              </CardTitle>
              <CardDescription>
                Submitted on {formatDate(feedback.createdAt)}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor(feedback.status)} className="flex items-center gap-1">
                {getStatusIcon(feedback.status)}
                {feedback.status.replace('_', ' ')}
              </Badge>
              <Badge variant={getPriorityColor(feedback.priority)}>
                {feedback.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Original Message:</h4>
              <div className="p-4 bg-secondary rounded-lg">
                <p className="whitespace-pre-wrap">{feedback.message}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Email:</span>
                <span>{feedback.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Last Updated:</span>
                <span>{formatDate(feedback.updatedAt)}</span>
              </div>
              {feedback.category && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge 
                    variant="outline"
                    style={{ 
                      borderColor: feedback.category.color,
                      color: feedback.category.color 
                    }}
                  >
                    {feedback.category.name}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
          <CardDescription>
            All replies and updates to your support request
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.replies.length > 0 ? (
            <div className="space-y-4">
              {feedback.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-lg border ${
                    reply.isInternal 
                      ? 'bg-muted/50 border-muted' 
                      : 'bg-background border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {reply.isInternal ? 'Internal Note' : reply.user.name}
                      </span>
                      {reply.isInternal && (
                        <Badge variant="outline" className="text-xs">
                          Internal
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No replies yet. Our support team will respond soon.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => window.location.href = '/support'}
        >
          Submit New Request
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.href = '/docs'}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Browse Documentation
        </Button>
      </div>
    </div>
  );
}
