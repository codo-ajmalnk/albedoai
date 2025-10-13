import { useState, useEffect } from "react";
import {
  Send,
  MessageCircle,
  Clock,
  CheckCircle,
  ExternalLink,
  Search,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  color: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: Category;
}

const defaultCategories = [
  { value: "general", label: "General Question" },
  { value: "technical", label: "Technical Issue" },
  { value: "billing", label: "Billing Support" },
  { value: "feature", label: "Feature Request" },
  { value: "bug", label: "Bug Report" },
];

export default function SupportRequest() {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    category: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [submittedToken, setSubmittedToken] = useState<string | null>(null);
  const { toast } = useToast();

  const [allArticles, setAllArticles] = useState<Article[]>([]);

  // Load categories and articles on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "";

        // Fetch categories
        const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Fetch published articles
        const articlesResponse = await fetch(
          `${baseUrl}/api/articles?is_published=true`
        );
        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json();
          setAllArticles(articlesData);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  // Search articles (client-side filtering)
  const searchArticles = (query: string) => {
    if (!query.trim()) {
      setArticles([]);
      setShowSearchResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allArticles
      .filter(
        (article) =>
          article.title.toLowerCase().includes(lowerQuery) ||
          article.excerpt?.toLowerCase().includes(lowerQuery) ||
          article.category.name.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 5); // Limit to 5 results

    setArticles(filtered);
    setShowSearchResults(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/support-request/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          subject: formData.subject,
          message: formData.message,
          categoryId: formData.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedToken(data.feedback.token);
        toast({
          title: "Support request submitted",
          description:
            "We'll get back to you within 24 hours. Check your email for confirmation.",
        });
        setFormData({
          email: "",
          name: "",
          category: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Get Support</h1>
        <p className="text-xl text-foreground-muted max-w-2xl mx-auto">
          Need help? We're here to assist you. Submit a support request and our
          team will get back to you quickly.
        </p>
      </div>

      {/* Search Articles Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Documentation
          </CardTitle>
          <CardDescription>
            Before submitting a support request, try searching our documentation
            for existing solutions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchArticles(e.target.value);
                }}
                className="pl-10"
              />
            </div>

            {showSearchResults && (
              <div className="space-y-2">
                {articles.length > 0 ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Found {articles.length} related articles:
                    </p>
                    {articles.map((article) => (
                      <div
                        key={article.id}
                        className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() =>
                          window.open(`/docs/${article.slug}`, "_blank")
                        }
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {article.title}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{
                                  borderColor: article.category.color,
                                  color: article.category.color,
                                }}
                              >
                                {article.category.name}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No articles found. Try a different search term.
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Support Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Support Request</CardTitle>
              <CardDescription>
                Fill out the form below and we'll respond as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Name (Optional)
                    </label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange("category", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0
                        ? categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))
                        : defaultCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                            >
                              {category.label}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Please provide as much detail as possible about your issue or question..."
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Support Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Response Times
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-success" />
                <div>
                  <div className="font-medium text-sm">General Questions</div>
                  <div className="text-sm text-foreground-muted">
                    Usually within 4 hours
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <div>
                  <div className="font-medium text-sm">Technical Issues</div>
                  <div className="text-sm text-foreground-muted">
                    Usually within 2 hours
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-destructive" />
                <div>
                  <div className="font-medium text-sm">Critical Issues</div>
                  <div className="text-sm text-foreground-muted">
                    Usually within 1 hour
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="font-medium text-sm">WhatsApp</div>
                <div className="text-sm text-foreground-muted">
                  +91 0000000000
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">Email Support</div>
                <div className="text-sm text-foreground-muted">
                  support@albedoedu.com
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">Community Forum</div>
                <div className="text-sm text-foreground-muted">
                  Join our community for peer support
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">Documentation</div>
                <div className="text-sm text-foreground-muted">
                  Check our comprehensive docs first
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Tracking Section */}
        {submittedToken && (
          <div className="lg:col-span-2">
            <Card className="border-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  Request Submitted Successfully
                </CardTitle>
                <CardDescription>
                  Your support request has been received.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We've sent a confirmation email to{" "}
                  <strong>{formData.email}</strong> with a tracking link to
                  monitor the status of your request.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
