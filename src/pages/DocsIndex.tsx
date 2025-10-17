import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Zap, Shield, CreditCard, FileText, ArrowRight, Github, ExternalLink, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Spotlight } from '@/components/ui/spotlight';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const quickStart = [
  {
    title: 'Installation',
    description: 'Get started with Albedo AI in minutes',
    href: '/docs/installation',
    icon: Zap,
    new: true,
  },
  {
    title: 'Authentication',
    description: 'Set up API keys and authentication',
    href: '/docs/auth',
    icon: Shield,
  },
  {
    title: 'First API Call',
    description: 'Make your first request to our API',
    href: '/docs/first-api-call',
    icon: FileText,
  },
];

const categories = [
  {
    title: 'Getting Started',
    description: 'Quick start guides and basic setup instructions',
    icon: Zap,
    articles: [
      { title: 'Installation Guide', href: '/docs/installation', new: true },
      { title: 'First API Call', href: '/docs/first-api-call' },
      { title: 'Configuration', href: '/docs/configuration' },
    ],
  },
  {
    title: 'Help & Guides',
    description: 'FAQs and helpful guidance',
    icon: FileText,
    articles: [
      { title: 'FAQ', href: '/docs/faq' },
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
    <div className="cursor-docs-main">
      {/* Hero Section */}
      <div className="mb-16">
        <Spotlight className="p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Albedo AI Documentation
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl">
              Everything you need to know about using Albedo AI. From quick starts to advanced features and API reference.
            </p>
            {/* Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base w-full"
              />
            </div>
          </div>
          {/* Feature highlights */}
          <BentoGrid>
            <BentoCard>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Get started</div>
                <div className="text-xl font-semibold">Install in minutes</div>
                <p className="text-sm text-muted-foreground">Follow our step-by-step guide to integrate quickly.</p>
              </div>
            </BentoCard>
            <BentoCard>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Performance</div>
                <div className="text-xl font-semibold">Fast and reliable</div>
                <p className="text-sm text-muted-foreground">Optimized components and best practices out of the box.</p>
              </div>
            </BentoCard>
            <BentoCard colSpan="md:col-span-6">
              <div className="flex items-center justify-between gap-4 flex-col md:flex-row">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Open Source</div>
                  <div className="text-xl font-semibold">Contribute on GitHub</div>
                  <p className="text-sm text-muted-foreground">Explore examples and contribute improvements.</p>
                </div>
                <a href="https://github.com/albedoedu" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary">
                  <span>View repo</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </BentoCard>
          </BentoGrid>
        </Spotlight>

        {/* Quick Start */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight mb-6">Quick Start</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickStart.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="cursor-docs-card hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        {item.new && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {item.description}
                      </p>
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
      </div>

      {/* Documentation Sections */}
      <div className="space-y-12">
        <h2 className="text-2xl font-semibold tracking-tight">Documentation</h2>
        
        <div className="grid gap-8 md:grid-cols-2">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.title} className="group hover:shadow-md transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.articles.map((article) => (
                      <Link
                        key={article.href}
                        to={article.href}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{article.title}</span>
                          {article.new && (
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-semibold tracking-tight mb-8">Need Help?</h2>
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
                <div className="font-semibold group-hover:text-primary transition-colors">Contact Support</div>
                <div className="text-sm text-muted-foreground">Get help from our team</div>
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
                <div className="font-semibold group-hover:text-primary transition-colors">GitHub</div>
                <div className="text-sm text-muted-foreground">View source code and examples</div>
              </div>
            </div>
          </a>
          
          
        </div>
      </div>
    </div>
  );
}