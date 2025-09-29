import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, MessageCircle, Github, ExternalLink } from 'lucide-react';
import { SearchModal } from '@/components/SearchModal';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const isDocsPage = location.pathname === '/' || location.pathname.startsWith('/docs');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="cursor-docs-header">
      <div className="container flex h-14 md:h-16 items-center justify-between px-3 md:px-4">
        {/* Left side - Logo and navigation */}
        <div className="flex items-center gap-3 md:gap-6">
          <SidebarTrigger className="md:hidden" />
          
          
          {/* Navigation for docs pages */}
          {isDocsPage && (
            <nav className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className={cn(
                  "text-sm font-medium px-3 py-2 rounded-md transition-colors",
                  location.pathname === '/' ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                  Documentation
                </Link>
              </Button>
            </nav>
          )}
        </div>

        {/* Center - Search */}
        <div className="hidden sm:flex flex-1 max-w-md mx-4 md:mx-8">
          <div className="cursor-docs-search w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="cursor-docs-search-input text-left cursor-pointer w-full"
            >
              Search documentation...
            </button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1 md:gap-3">
          <Button variant="ghost" size="sm" className="sm:hidden h-8 w-8 p-0" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" asChild>
            <Link to="/support" className="flex items-center gap-2 text-sm">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden lg:inline">Support</span>
            </Link>
          </Button>
          
          <ThemeToggle />
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}