import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ContentBlock {
  title: string;
  description: string;
  images?: string[] | null;
  videos?: string[] | null;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  content?: ContentBlock[] | null;
  excerpt?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
  category: {
    name: string;
    color?: string;
  };
}

export default function ArticleView() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        setError(null);
        const baseUrl = import.meta.env.VITE_API_URL || "";

        // Fetch article by slug (also increments view count)
        const response = await fetch(`${baseUrl}/api/articles/slug/${slug}`);

        if (response.status === 404) {
          setError("Article not found");
          setArticle(null);
        } else if (!response.ok) {
          throw new Error("Failed to fetch article");
        } else {
          const data = await response.json();
          setArticle(data);
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-3xl font-bold">Article Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link to="/docs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documentation
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/docs">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Documentation
        </Link>
      </Button>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            style={{
              borderColor: article.category.color || undefined,
              color: article.category.color || undefined,
            }}
          >
            {article.category.name}
          </Badge>
        </div>

        <h1 className="text-4xl font-bold tracking-tight">{article.title}</h1>

        {article.excerpt && (
          <p className="text-xl text-muted-foreground">{article.excerpt}</p>
        )}

        {/* Meta Information */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.created_at)}</span>
          </div>
          {/* <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{article.view_count} views</span>
          </div> */}
        </div>
      </div>

      {/* Content Blocks */}
      {article.content && article.content.length > 0 ? (
        <div className="space-y-12">
          {article.content.map((block, index) => (
            <div key={index} className="space-y-6">
              {/* Block Title */}
              {block.title && (
                <h2 className="text-2xl mt-12 font-semibold leading-none tracking-tight">
                  {block.title}
                </h2>
              )}

              {/* Block Description */}
              {block.description && (
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p className="text-base whitespace-pre-wrap leading-relaxed">
                    {block.description}
                  </p>
                </div>
              )}

              {/* Block Images */}
              {block.images && block.images.length > 0 && (
                <div className="space-y-4">
                  {block.images.map((imageUrl, imgIndex) => (
                    <Card
                      key={imgIndex}
                      className="overflow-hidden max-w-lg border-0 pt-9"
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL || ""}${imageUrl}`}
                        alt={`${block.title} - Image ${imgIndex + 1}`}
                        className="w-full h-auto max-h-96 object-contain rounded-xl"
                      />
                    </Card>
                  ))}
                </div>
              )}

              {/* Block Videos */}
              {block.videos && block.videos.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {block.videos.map((videoUrl, vidIndex) => (
                    <Card key={vidIndex} className="overflow-hidden">
                      <video
                        src={`${import.meta.env.VITE_API_URL || ""}${videoUrl}`}
                        controls
                        className="w-full h-auto"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground">
          <p>No content available for this article.</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-8 border-t">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(article.updated_at)}
        </p>
      </div>
    </div>
  );
}
