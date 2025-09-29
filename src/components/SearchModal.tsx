import { useState, useEffect, useRef } from 'react';
import { Search, FileText, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const searchData = [
  {
    id: 'installation',
    title: 'Installation',
    description: 'Get started with Albedo AI in minutes',
    url: '/docs/installation',
    category: 'Getting Started',
    icon: BookOpen
  },
  {
    id: 'authentication',
    title: 'Authentication',
    description: 'Set up API keys and authentication',
    url: '/docs/auth',
    category: 'Getting Started',
    icon: BookOpen
  },
  {
    id: 'first-api-call',
    title: 'First API Call',
    description: 'Make your first request to our API',
    url: '/docs/first-api-call',
    category: 'Getting Started',
    icon: FileText
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Complete API documentation and examples',
    url: '/docs/api',
    category: 'API Reference',
    icon: FileText
  },
  {
    id: 'javascript-sdk',
    title: 'JavaScript SDK',
    description: 'Client library for JavaScript and Node.js',
    url: '/docs/sdks/javascript',
    category: 'SDKs & Libraries',
    icon: BookOpen
  },
  {
    id: 'python-sdk',
    title: 'Python SDK',
    description: 'Client library for Python applications',
    url: '/docs/sdks/python',
    category: 'SDKs & Libraries',
    icon: BookOpen
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    description: 'Real-time event notifications',
    url: '/docs/webhooks',
    category: 'API Reference',
    icon: ExternalLink
  },
  {
    id: 'examples',
    title: 'Examples',
    description: 'Code examples and tutorials',
    url: '/docs/examples',
    category: 'Examples',
    icon: FileText
  },
  {
    id: 'rate-limits',
    title: 'Rate Limits',
    description: 'API usage and limits',
    url: '/docs/rate-limits',
    category: 'API Reference',
    icon: FileText
  },
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Frequently asked questions',
    url: '/docs/faq',
    category: 'Help',
    icon: BookOpen
  }
];

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredResults = searchData.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        window.location.href = filteredResults[selectedIndex].url;
        onClose();
      }
    } else if (e.key === 'Escape') {
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
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search documentation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-12 text-base border-0 focus:ring-0"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {query === '' ? (
            <div className="p-6 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p>Start typing to search documentation...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No results found for "{query}"</p>
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
                      "flex items-center gap-4 p-3 rounded-lg transition-colors cursor-pointer",
                      index === selectedIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/50"
                    )}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{result.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.description}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {result.category}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/30 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">↑↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-background border rounded">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
