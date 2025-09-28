import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Zap, Shield, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const categories = [
  {
    title: 'Getting Started',
    description: 'Quick start guides and basic setup instructions',
    icon: Zap,
    articles: [
      { title: 'Installation Guide', href: '/docs/installation', new: true },
      { title: 'First Steps', href: '/docs/first-steps' },
      { title: 'Configuration', href: '/docs/configuration' },
    ],
  },
  {
    title: 'API Reference',
    description: 'Complete API documentation and examples',
    icon: FileText,
    articles: [
      { title: 'Authentication API', href: '/docs/api/auth' },
      { title: 'User Management', href: '/docs/api/users' },
      { title: 'Data Operations', href: '/docs/api/data' },
    ],
  },
  {
    title: 'Authentication',
    description: 'User authentication and security features',
    icon: Shield,
    articles: [
      { title: 'OAuth Setup', href: '/docs/auth/oauth' },
      { title: 'JWT Tokens', href: '/docs/auth/jwt' },
      { title: 'Two-Factor Auth', href: '/docs/auth/2fa' },
    ],
  },
  {
    title: 'Billing & Payments',
    description: 'Subscription management and payment processing',
    icon: CreditCard,
    articles: [
      { title: 'Subscription Plans', href: '/docs/billing/plans' },
      { title: 'Payment Methods', href: '/docs/billing/payments' },
      { title: 'Invoicing', href: '/docs/billing/invoices' },
    ],
  },
];

export default function DocsIndex() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Albedo Documentation
        </h1>
        <p className="text-xl text-foreground-muted mb-8 max-w-2xl mx-auto">
          Everything you need to know about using Albedo. From quick starts to advanced features.
        </p>
        
        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-8 md:grid-cols-2">
        {filteredCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card key={category.title} className="group hover:shadow-md transition-all duration-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-subtle">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.articles.map((article) => (
                    <Link
                      key={article.href}
                      to={article.href}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-foreground-muted" />
                        <span className="font-medium">{article.title}</span>
                        {article.new && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-foreground-muted group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-16 p-8 rounded-xl bg-gradient-subtle border">
        <h2 className="text-2xl font-semibold mb-6 text-center">Need Help?</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            to="/support"
            className="flex items-center gap-3 p-4 rounded-lg bg-background hover:bg-secondary transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary-subtle">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">Contact Support</div>
              <div className="text-sm text-foreground-muted">Get help from our team</div>
            </div>
          </Link>
          
          <a
            href="https://github.com/albedoedu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-4 rounded-lg bg-background hover:bg-secondary transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary-subtle">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">GitHub</div>
              <div className="text-sm text-foreground-muted">View source code</div>
            </div>
          </a>
          
          <Link
            to="/docs/api"
            className="flex items-center gap-3 p-4 rounded-lg bg-background hover:bg-secondary transition-colors"
          >
            <div className="p-2 rounded-lg bg-primary-subtle">
              <Zap className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">API Reference</div>
              <div className="text-sm text-foreground-muted">Explore our API</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}