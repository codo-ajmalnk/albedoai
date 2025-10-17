import { useState, useEffect, useRef } from "react";
import {
  Search,
  FileText,
  BookOpen,
  ExternalLink,
  ArrowRight,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  category: Category;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: typeof BookOpen | typeof FileText;
  type: "category" | "article";
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch categories and articles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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
          setArticles(articlesData);
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform categories and articles into search results
  const searchData: SearchResult[] = [
    // Add categories as search results
    ...categories.map((cat) => ({
      id: `category-${cat.id}`,
      title: cat.name,
      description: cat.description || `Browse ${cat.name} documentation`,
      url: "/docs",
      category: "Category",
      icon: BookOpen,
      type: "category" as const,
    })),
    // Add articles as search results
    ...articles.map((article) => ({
      id: `article-${article.id}`,
      title: article.title,
      description: article.excerpt || "Documentation article",
      url: `/docs/${article.slug}`,
      category: article.category.name,
      icon: FileText,
      type: "article" as const,
    })),
  ];

  const filteredResults = searchData.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        window.location.href = filteredResults[selectedIndex].url;
        onClose();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] p-0 overflow-hidden sm:w-full sm:max-h-[90vh] [&>button]:hidden">
        <div className="sr-only">
          <DialogTitle>Search Documentation</DialogTitle>
          <DialogDescription>
            Search through Albedo AI documentation. Use arrow keys to navigate
            results, Enter to select, and Escape to close.
          </DialogDescription>
        </div>
        <div className="p-4 sm:p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-10 sm:h-12 text-sm sm:text-base border-0 focus:ring-0"
            />
            <DialogClose
              aria-label="Close search"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
        </div>

        <div className="max-h-60 sm:max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 sm:p-6 text-center text-muted-foreground">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 opacity-50 animate-pulse" />
              <p className="text-sm sm:text-base">Loading documentation...</p>
            </div>
          ) : query === "" ? (
            <div className="p-4 sm:p-6 text-center text-muted-foreground">
              <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm sm:text-base">
                Start typing to search documentation...
              </p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-4 sm:p-6 text-center text-muted-foreground">
              <p className="text-sm sm:text-base">
                No results found for "{query}"
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredResults.map((result, index) => {
                const Icon = result.icon;
                return (
                  <a
                    key={result.id}
                    href={result.url}
                    className={cn(
                      "flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg transition-colors cursor-pointer",
                      index === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/50"
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs sm:text-sm">
                        {result.title}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                        {result.category}
                      </div>
                    </div>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 sm:px-1.5 py-0.5 text-xs bg-background border rounded">
                  ↑↓
                </kbd>
                <span className="hidden sm:inline">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 sm:px-1.5 py-0.5 text-xs bg-background border rounded">
                  ↵
                </kbd>
                <span className="hidden sm:inline">to select</span>
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1 sm:px-1.5 py-0.5 text-xs bg-background border rounded">
                esc
              </kbd>
              <span className="hidden sm:inline">to close</span>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
