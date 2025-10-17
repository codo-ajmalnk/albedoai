import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  BookOpen,
  BookA,
  Zap,
  Shield,
  FileText,
  ChevronRight,
  Github,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  isFeatured: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
  articles: Article[];
}

const categoryIcons: Record<string, any> = {
  "Getting Started": Zap,
  Installation: Zap,
  FAQ: FileText,
  Troubleshooting: Shield,
};

export default function DocsIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and articles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || "";

        // Fetch all categories
        const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
        const categoriesData = await categoriesResponse.json();

        // Fetch all published articles
        const articlesResponse = await fetch(
          `${baseUrl}/api/articles?is_published=true`
        );
        const articlesData = await articlesResponse.json();

        // Group articles by category
        const categoriesWithArticles: Category[] = categoriesData.map(
          (cat: any) => {
            const categoryArticles = articlesData
              .filter((art: any) => art.category_id === cat.id)
              .map((art: any) => ({
                id: art.id.toString(),
                title: art.title,
                slug: art.slug,
                excerpt: art.excerpt,
                isFeatured: art.is_featured,
              }))
              .sort((a: Article, b: Article) => {
                // Featured articles first
                if (a.isFeatured && !b.isFeatured) return -1;
                if (!a.isFeatured && b.isFeatured) return 1;
                return 0;
              });

            return {
              id: cat.id.toString(),
              name: cat.name,
              description: cat.description,
              color: cat.color,
              articles: categoryArticles,
            };
          }
        );

        // Filter out categories with no articles
        const finalCategories = categoriesWithArticles.filter(
          (cat) => cat.articles.length > 0
        );

        console.log("Total categories fetched:", categoriesData.length);
        console.log("Categories with articles:", finalCategories.length);
        console.log("Categories:", finalCategories);

        setCategories(finalCategories);
      } catch (error) {
        console.error("Error fetching documentation data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter based on search query
  const filteredCategories = categories.filter(
    (category) =>
      !searchQuery ||
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.articles.some(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  console.log("Filtered categories count:", filteredCategories.length);
  console.log("Search query:", searchQuery);

  // Get featured articles for Quick Start section
  const quickStartArticles = categories
    .flatMap((cat) => cat.articles)
    .filter((article) => article.isFeatured)
    .slice(0, 3);

  return (
    <div className="cursor-docs-main">
      {/* Hero Section - Add padding-top on mobile to avoid sidebar button overlap */}
      <div className="mb-16 pt-12 lg:pt-0">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            Albedo AI Documentation
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            Everything you need to know about using Albedo AI. From quick starts
            to advanced features and API reference.
          </p>

          {/* Search */}
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base w-full"
            />
          </div>
        </div>
      </div>

      {/* Documentation Sections - Now Above Quick Start */}
      {loading ? (
        <div className="space-y-12 mb-16">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      ) : filteredCategories.length > 0 ? (
        <div className="space-y-12 mb-16">
          <h2 className="text-2xl font-semibold tracking-tight">
            Documentation
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {filteredCategories.map((category) => {
              const Icon = Zap;
              return (
                <Card
                  key={category.id}
                  className="group hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{
                          backgroundColor: category.color
                            ? `${category.color}20`
                            : undefined,
                        }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{
                            color: category.color || undefined,
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">
                          {category.name}
                        </CardTitle>
                        {category.description && (
                          <CardDescription className="line-clamp-1">
                            {category.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2">
                      {category.articles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/docs/${article.slug}`}
                          className="flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm truncate">
                                  {article.title}
                                </span>
                                {article.isFeatured && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs flex-shrink-0"
                                  >
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              {article.excerpt && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {article.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 mt-0.5" />
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 mb-16">
          <p className="text-muted-foreground">
            {searchQuery
              ? "No documentation found matching your search."
              : "No documentation available yet."}
          </p>
        </div>
      )}

      {/* Quick Start - Now Below Documentation */}
      {!searchQuery && quickStartArticles.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">
            Quick Start
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickStartArticles.map((article) => {
              const Icon = Zap;
              return (
                <Link
                  key={article.id}
                  to={`/docs/${article.slug}`}
                  className="cursor-docs-card hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      </div>
                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center text-sm text-primary group-hover:gap-2 transition-all">
                        <span>Get started</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-8">
          Need Help?
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/support"
            className="cursor-docs-card hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold group-hover:text-primary transition-colors">
                  Contact Support
                </div>
                <div className="text-sm text-muted-foreground">
                  Get help from our team
                </div>
              </div>
            </div>
          </Link>

          <a
            href="https://github.com/albedoedu"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-docs-card hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Github className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold group-hover:text-primary transition-colors">
                  GitHub
                </div>
                <div className="text-sm text-muted-foreground">
                  View source code and examples
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
