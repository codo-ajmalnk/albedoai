import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Search,
  MoveUp,
  MoveDown,
  X,
  Upload,
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
  DialogTrigger,
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
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeleton } from "@/components/SkeletonLoader";
import { useToast } from "@/hooks/use-toast";

interface ContentBlock {
  title: string;
  description: string;
  images?: string[] | null;
  videos?: string[] | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content?: ContentBlock[] | null;
  excerpt?: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    categoryId: "",
    isPublished: false,
    isFeatured: false,
    order: 0,
  });
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Fetch articles from API
  const fetchArticles = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/articles`);

      if (!response.ok) {
        throw new Error("Failed to fetch articles");
      }

      const data = await response.json();

      // Transform API response to match our Article interface
      const transformedArticles: Article[] = data.map((art: any) => ({
        id: art.id.toString(),
        title: art.title,
        slug: art.slug,
        content: art.content || null,
        excerpt: art.excerpt,
        isPublished: art.is_published,
        isFeatured: art.is_featured,
        viewCount: art.view_count,
        order: art.order,
        createdAt: new Date(art.created_at).toISOString(),
        updatedAt: new Date(art.updated_at).toISOString(),
        category: {
          id: art.category_id.toString(),
          name: art.category.name,
          color: art.category.color || "#gray",
        },
      }));

      setArticles(transformedArticles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast({
        title: "Error",
        description: "Failed to load articles.",
        variant: "destructive",
      });
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/categories`);

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();

      const transformedCategories: Category[] = data.map((cat: any) => ({
        id: cat.id.toString(),
        name: cat.name,
        color: cat.color || "#gray",
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      const latestArticle =
        articles.find((a) => a.id === article.id) || article;

      setEditingArticle(latestArticle);
      setFormData({
        title: latestArticle.title,
        slug: latestArticle.slug,
        excerpt: latestArticle.excerpt || "",
        categoryId: latestArticle.category.id,
        isPublished: latestArticle.isPublished,
        isFeatured: latestArticle.isFeatured,
        order: latestArticle.order,
      });
      setContentBlocks(latestArticle.content || []);
    } else {
      setEditingArticle(null);
      setFormData({
        title: "",
        slug: "",
        excerpt: "",
        categoryId: "",
        isPublished: false,
        isFeatured: false,
        order: 0,
      });
      setContentBlocks([]);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingArticle(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      categoryId: "",
      isPublished: false,
      isFeatured: false,
      order: 0,
    });
    setContentBlocks([]);
  };

  // Content Block Management
  const addContentBlock = () => {
    setContentBlocks([
      ...contentBlocks,
      { title: "", description: "", images: null, videos: null },
    ]);
  };

  const removeContentBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  const updateContentBlock = (
    index: number,
    field: keyof ContentBlock,
    value: any
  ) => {
    const updated = [...contentBlocks];
    updated[index] = { ...updated[index], [field]: value };
    setContentBlocks(updated);
  };

  const moveContentBlock = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === contentBlocks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...contentBlocks];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setContentBlocks(updated);
  };

  // File upload for content block
  const handleFileUpload = async (
    files: FileList | null,
    fileType: "image" | "video",
    blockIndex: number
  ) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const baseUrl = import.meta.env.VITE_API_URL || "";
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        const response = await fetch(
          `${baseUrl}/api/upload?file_type=${fileType}`,
          {
            method: "POST",
            body: formDataUpload,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to upload file");
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      // Update the content block with uploaded files
      const updated = [...contentBlocks];
      if (fileType === "image") {
        updated[blockIndex].images = [
          ...(updated[blockIndex].images || []),
          ...uploadedUrls,
        ];
      } else {
        updated[blockIndex].videos = [
          ...(updated[blockIndex].videos || []),
          ...uploadedUrls,
        ];
      }
      setContentBlocks(updated);

      toast({
        title: "Upload successful",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // Remove file from content block
  const handleRemoveFile = (
    blockIndex: number,
    fileType: "image" | "video",
    fileUrl: string
  ) => {
    const updated = [...contentBlocks];
    if (fileType === "image") {
      updated[blockIndex].images = (updated[blockIndex].images || []).filter(
        (url) => url !== fileUrl
      );
    } else {
      updated[blockIndex].videos = (updated[blockIndex].videos || []).filter(
        (url) => url !== fileUrl
      );
    }
    setContentBlocks(updated);

    toast({
      title: "File removed",
      description: `${fileType === "image" ? "Image" : "Video"} removed.`,
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in title and category.",
        variant: "destructive",
      });
      return;
    }

    // Auto-generate slug from title if empty
    const slug =
      formData.slug.trim() ||
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const baseUrl = import.meta.env.VITE_API_URL || "";

    if (editingArticle) {
      // Update existing article
      try {
        const updatePayload = {
          title: formData.title,
          slug: slug,
          excerpt: formData.excerpt,
          content: contentBlocks.length > 0 ? contentBlocks : null,
          is_published: formData.isPublished,
          is_featured: formData.isFeatured,
          order: formData.order,
          category_id: parseInt(formData.categoryId),
        };

        const response = await fetch(
          `${baseUrl}/api/articles/${editingArticle.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatePayload),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to update article");
        }

        toast({
          title: "Article updated",
          description: "The article has been updated successfully.",
        });

        await fetchArticles();
        window.dispatchEvent(new Event("sidebar-refresh"));
        handleCloseDialog();
      } catch (error) {
        console.error("Error updating article:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to update article",
          variant: "destructive",
        });
      }
    } else {
      // Create new article
      try {
        const createPayload = {
          title: formData.title,
          slug: slug,
          excerpt: formData.excerpt,
          content: contentBlocks.length > 0 ? contentBlocks : null,
          is_published: formData.isPublished,
          is_featured: formData.isFeatured,
          view_count: 0,
          order: formData.order,
          category_id: parseInt(formData.categoryId),
        };

        const response = await fetch(`${baseUrl}/api/articles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(createPayload),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to create article");
        }

        toast({
          title: "Article created",
          description: "The new article has been created successfully.",
        });

        await fetchArticles();
        window.dispatchEvent(new Event("sidebar-refresh"));
        handleCloseDialog();
      } catch (error) {
        console.error("Error creating article:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to create article",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/articles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ detail: "Failed to delete article" }));
        throw new Error(error.detail || "Failed to delete article");
      }

      toast({
        title: "Article deleted",
        description: "The article has been removed successfully.",
      });

      await fetchArticles();
      window.dispatchEvent(new Event("sidebar-refresh"));
    } catch (error) {
      console.error("Error deleting article:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete article",
        variant: "destructive",
      });
    }
  };

  const handleTogglePublish = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_published: !article.isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update publish status");
      }

      toast({
        title: "Status updated",
        description: "Article publish status has been updated.",
      });

      await fetchArticles();
      window.dispatchEvent(new Event("sidebar-refresh"));
    } catch (error) {
      console.error("Error updating publish status:", error);
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive",
      });
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${baseUrl}/api/articles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_featured: !article.isFeatured,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update featured status");
      }

      toast({
        title: "Featured status updated",
        description: "Article featured status has been updated.",
      });

      await fetchArticles();
      window.dispatchEvent(new Event("sidebar-refresh"));
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast({
        title: "Error",
        description: "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || article.category.id === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "published" && article.isPublished) ||
      (statusFilter === "draft" && !article.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-12 lg:pt-0">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-foreground-muted">
            Manage your documentation articles with structured content blocks
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Article" : "Create New Article"}
              </DialogTitle>
              <DialogDescription>
                {editingArticle
                  ? "Update the article information and content blocks below."
                  : "Create a new article with structured content blocks."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Article title"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="slug" className="text-sm font-medium">
                    Slug (Optional)
                  </label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    placeholder="article-url-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty to auto-generate from title (No auto-generation
                    for articles with a slug already in use, You can still
                    manually edit the slug)
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="order" className="text-sm font-medium">
                    Order
                  </label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order: parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="excerpt" className="text-sm font-medium">
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the article..."
                  rows={2}
                />
              </div>

              {/* Content Blocks */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Content Blocks</h3>
                    <p className="text-sm text-muted-foreground">
                      Add structured content sections with optional media
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addContentBlock}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                </div>

                {contentBlocks.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      No content blocks yet. Click "Add Block" to create one.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contentBlocks.map((block, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          {/* Block Header */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">
                              Block {index + 1}
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveContentBlock(index, "up")}
                                disabled={index === 0}
                              >
                                <MoveUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => moveContentBlock(index, "down")}
                                disabled={index === contentBlocks.length - 1}
                              >
                                <MoveDown className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeContentBlock(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Block Content */}
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium">
                                Block Title
                              </label>
                              <Input
                                value={block.title}
                                onChange={(e) =>
                                  updateContentBlock(
                                    index,
                                    "title",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Introduction, Installation Steps..."
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Description
                              </label>
                              <Textarea
                                value={block.description}
                                onChange={(e) =>
                                  updateContentBlock(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Block content..."
                                rows={4}
                              />
                            </div>

                            {/* Images */}
                            <div>
                              <label className="text-sm font-medium">
                                Images (Optional)
                              </label>
                              <Input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) =>
                                  handleFileUpload(
                                    e.target.files,
                                    "image",
                                    index
                                  )
                                }
                                disabled={uploading}
                              />
                              {block.images && block.images.length > 0 && (
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                  {block.images.map((url, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="relative group"
                                    >
                                      <img
                                        src={`${
                                          import.meta.env.VITE_API_URL || ""
                                        }${url}`}
                                        alt={`Block ${index + 1} img ${
                                          imgIdx + 1
                                        }`}
                                        className="w-full h-20 object-cover rounded"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                        onClick={() =>
                                          handleRemoveFile(index, "image", url)
                                        }
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Videos */}
                            <div>
                              <label className="text-sm font-medium">
                                Videos (Optional)
                              </label>
                              <Input
                                type="file"
                                accept="video/*"
                                multiple
                                onChange={(e) =>
                                  handleFileUpload(
                                    e.target.files,
                                    "video",
                                    index
                                  )
                                }
                                disabled={uploading}
                              />
                              {block.videos && block.videos.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {block.videos.map((url, vidIdx) => (
                                    <div
                                      key={vidIdx}
                                      className="flex items-center justify-between bg-secondary p-2 rounded"
                                    >
                                      <span className="text-sm truncate">
                                        Video {vidIdx + 1}:{" "}
                                        {url.split("/").pop()}
                                      </span>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          handleRemoveFile(index, "video", url)
                                        }
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Publish Options */}
              <div className="flex items-center space-x-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isPublished: !!checked,
                      }))
                    }
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium">
                    Published
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isFeatured: !!checked,
                      }))
                    }
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium">
                    Featured
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={uploading}>
                {uploading
                  ? "Uploading..."
                  : editingArticle
                  ? "Update"
                  : "Create"}{" "}
                Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>
            Manage and organize your documentation articles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Blocks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {article.isFeatured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          <span className="font-medium">{article.title}</span>
                        </div>
                        {article.excerpt && (
                          <div className="text-sm text-foreground-muted truncate max-w-xs">
                            {article.excerpt}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: article.category.color,
                          color: article.category.color,
                        }}
                      >
                        {article.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {article.content?.length || 0} blocks
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            article.isPublished ? "default" : "secondary"
                          }
                        >
                          {article.isPublished ? "Published" : "Draft"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(article.id)}
                        >
                          {article.isPublished ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground-muted">
                        {article.viewCount.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground-muted">
                        {formatDate(article.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFeatured(article.id)}
                        >
                          {article.isFeatured ? (
                            <StarOff className="h-4 w-4" />
                          ) : (
                            <Star className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(article.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
