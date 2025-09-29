import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Search, MessageCircle, Zap } from 'lucide-react';
import { SearchModal } from '@/components/SearchModal';
import { cn } from '@/lib/utils';

export function Header() {
  const location = useLocation();
  const isDocsPage = location.pathname === '/' || location.pathname.startsWith('/docs');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="cursor-docs-header">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side - Logo and navigation */}
        <div className="flex items-center gap-6">
          {/* Mobile menu trigger */}
          <SidebarTrigger className="lg:hidden flex-shrink-0" />
          
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3 group cursor-docs-focus-ring">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center flex-shrink-0 cursor-docs-shadow-sm group-hover:cursor-docs-shadow-md transition-all duration-200">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary/90 transition-colors">Albedo AI</h1>
              {isDocsPage && (
                <p className="text-xs text-muted-foreground font-medium">Documentation</p>
              )}
            </div>
          </Link>
          
          {/* Navigation for docs pages */}
          {isDocsPage && (
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              <Button variant="ghost" size="sm" asChild className="h-9 cursor-docs-nav-button">
                <Link to="/" className={cn(
                  "text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 cursor-docs-focus-ring",
                  location.pathname === '/' 
                    ? "bg-primary text-primary-foreground cursor-docs-shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}>
                  Documentation
                </Link>
              </Button>
            </nav>
          )}
        </div>

        {/* Center - Search */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="cursor-docs-search w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="cursor-docs-search-input text-left cursor-pointer w-full h-10 pl-11 pr-4"
            >
              Search documentation...
            </button>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden h-9 w-9 p-0" 
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </Button>
          
          {/* Support button */}
          <Button variant="ghost" size="sm" asChild className="h-9 cursor-docs-focus-ring">
            <Link to="/support" className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden lg:inline">Support</span>
            </Link>
          </Button>
          
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}