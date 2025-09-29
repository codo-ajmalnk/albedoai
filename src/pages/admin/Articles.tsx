import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, StarOff, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { TableSkeleton } from '@/components/SkeletonLoader';
import { useToast } from '@/hooks/use-toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags: string[];
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

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Welcome to Albedo - Your First Steps',
    slug: 'welcome-to-albedo-first-steps',
    content: 'Full article content here...',
    excerpt: 'Get started with Albedo by learning the basics of account creation, dashboard navigation, and key features.',
    tags: ['getting-started', 'basics', 'tutorial'],
    isPublished: true,
    isFeatured: true,
    viewCount: 1247,
    order: 1,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-20T14:45:00Z',
    category: {
      id: '1',
      name: 'Getting Started',
      color: '#3b82f6'
    }
  },
  {
    id: '2',
    title: 'How to Reset Your Password',
    slug: 'how-to-reset-password',
    content: 'Password reset instructions...',
    excerpt: 'Learn how to reset your password using email or account settings, including troubleshooting tips.',
    tags: ['password', 'security', 'account'],
    isPublished: true,
    isFeatured: false,
    viewCount: 892,
    order: 2,
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-03-18T11:20:00Z',
    category: {
      id: '2',
      name: 'Account & Billing',
      color: '#10b981'
    }
  },
  {
    id: '3',
    title: 'Troubleshooting Login Issues',
    slug: 'troubleshooting-login-issues',
    content: 'Comprehensive troubleshooting guide...',
    excerpt: 'Comprehensive guide to troubleshooting common login issues including browser problems and network issues.',
    tags: ['login', 'troubleshooting', 'browser'],
    isPublished: false,
    isFeatured: true,
    viewCount: 0,
    order: 3,
    createdAt: '2024-03-10T16:30:00Z',
    updatedAt: '2024-03-10T16:30:00Z',
    category: {
      id: '3',
      name: 'Technical Issues',
      color: '#f59e0b'
    }
  }
];

const mockCategories: Category[] = [
  { id: '1', name: 'Getting Started', color: '#3b82f6' },
  { id: '2', name: 'Account & Billing', color: '#10b981' },
  { id: '3', name: 'Technical Issues', color: '#f59e0b' },
  { id: '4', name: 'Features & Usage', color: '#8b5cf6' },
  { id: '5', name: 'API & Integration', color: '#06b6d4' }
];

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    categoryId: '',
    isPublished: false,
    isFeatured: false,
    order: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDialog = (article?: Article) => {
    if (article) {
      setEditingArticle(article);
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        tags: article.tags.join(', '),
        categoryId: article.category.id,
        isPublished: article.isPublished,
        isFeatured: article.isFeatured,
        order: article.order
      });
    } else {
      setEditingArticle(null);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        tags: '',
        categoryId: '',
        isPublished: false,
        isFeatured: false,
        order: 0
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingArticle(null);
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      categoryId: '',
      isPublished: false,
      isFeatured: false,
      order: 0
    });
  };

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (editingArticle) {
      // Update existing article
      setArticles(prev =>
        prev.map(article =>
          article.id === editingArticle.id
            ? {
                ...article,
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                updatedAt: new Date().toISOString(),
                category: mockCategories.find(cat => cat.id === formData.categoryId) || article.category
              }
            : article
        )
      );
      toast({
        title: 'Article updated',
        description: 'The article has been updated successfully.',
      });
    } else {
      // Create new article
      const newArticle: Article = {
        id: (articles.length + 1).toString(),
        ...formData,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: mockCategories.find(cat => cat.id === formData.categoryId) || mockCategories[0]
      };
      setArticles(prev => [...prev, newArticle]);
      toast({
        title: 'Article created',
        description: 'The new article has been created successfully.',
      });
    }
    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    setArticles(prev => prev.filter(article => article.id !== id));
    toast({
      title: 'Article deleted',
      description: 'The article has been removed successfully.',
    });
  };

  const handleTogglePublish = (id: string) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === id
          ? { ...article, isPublished: !article.isPublished, updatedAt: new Date().toISOString() }
          : article
      )
    );
    toast({
      title: 'Status updated',
      description: 'Article publish status has been updated.',
    });
  };

  const handleToggleFeatured = (id: string) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === id
          ? { ...article, isFeatured: !article.isFeatured, updatedAt: new Date().toISOString() }
          : article
      )
    );
    toast({
      title: 'Status updated',
      description: 'Article featured status has been updated.',
    });
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || article.category.id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && article.isPublished) ||
      (statusFilter === 'draft' && !article.isPublished);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-foreground-muted">
            Manage your documentation articles and content
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? 'Edit Article' : 'Create New Article'}
              </DialogTitle>
              <DialogDescription>
                {editingArticle
                  ? 'Update the article information below.'
                  : 'Create a new article for your documentation.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title *
                  </label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Article title"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCategories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="excerpt" className="text-sm font-medium">
                  Excerpt
                </label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the article..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content *
                </label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Article content (supports Markdown)..."
                  rows={12}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="tags" className="text-sm font-medium">
                    Tags
                  </label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="order" className="text-sm font-medium">
                    Order
                  </label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: !!checked }))}
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium">
                    Published
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: !!checked }))}
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
              <Button onClick={handleSubmit}>
                {editingArticle ? 'Update' : 'Create'} Article
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
                {mockCategories.map(category => (
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
                          {article.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          <span className="font-medium">{article.title}</span>
                        </div>
                        <div className="text-sm text-foreground-muted truncate max-w-xs">
                          {article.excerpt}
                        </div>
                        {article.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {article.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{article.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        style={{ borderColor: article.category.color, color: article.category.color }}
                      >
                        {article.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={article.isPublished ? 'default' : 'secondary'}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(article.id)}
                        >
                          {article.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                          {article.isFeatured ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
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
