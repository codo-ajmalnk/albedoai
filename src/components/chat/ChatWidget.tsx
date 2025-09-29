import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOCAL_DOCS } from '@/data/local-docs';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  searchResults?: SearchResult[];
}

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  url?: string;
  category: {
    name: string;
    color: string;
  };
  relevance: 'high' | 'medium' | 'low';
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m here to help you with Albedo documentation.',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lightweight local docs index as a fallback when API is unavailable
  // Kept in a separate module for easier maintenance

  const localSearch = (query: string, limit = 5): SearchResult[] => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = LOCAL_DOCS.map((d) => {
      const title = d.title.toLowerCase();
      const excerpt = d.excerpt.toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 3;
      if (excerpt.includes(q)) score += 1;
      const relevance: SearchResult['relevance'] = score >= 3 ? 'high' : score === 2 ? 'medium' : score > 0 ? 'low' : 'low';
      // Adapt LocalDocItem to SearchResult
      const doc: SearchResult = {
        id: d.id,
        title: d.title,
        excerpt: d.excerpt,
        slug: d.slug,
        url: d.url,
        category: d.category,
        relevance,
      };
      return { doc, score };
    })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.doc);
    return scored;
  };

  const searchArticles = async (query: string, timeoutMs = 2000): Promise<SearchResult[]> => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const baseUrl = import.meta.env.VITE_API_URL || ''
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), timeoutMs);
      const response = await fetch(`${baseUrl}/api/search/articles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 5 }),
        signal: controller.signal,
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      const results = Array.isArray(data) ? data : (data.results || []);
      const parsed = (results as SearchResult[]) || [];
      return parsed.length > 0 ? parsed : localSearch(query);
    } catch (error: unknown) {
      // Swallow aborts quietly to keep UI snappy without noisy errors
      if (error && typeof error === 'object' && (error as any).name === 'AbortError') {
        // Timeout: try local fallback
        return localSearch(query);
      }
      console.error('Search error:', error);
      // Network error: try local fallback so user still gets a response
      const local = localSearch(query);
      return local;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');

    // Immediate assistant placeholder; will be updated when results arrive
    const assistantId = `${Date.now()}-assistant`;
    const placeholder: Message = {
      id: assistantId,
      content: `Searching for "${query}"...`,
      sender: 'assistant',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, placeholder]);

    // Fire-and-forget; allows the user to ask another question immediately
    (async () => {
      try {
        const searchResults = await searchArticles(query);

        let responseContent = '';
        let searchResultsToShow: SearchResult[] = [];

        if (searchResults.length > 0) {
          const highRelevanceResults = searchResults.filter(r => r.relevance === 'high');
          const mediumRelevanceResults = searchResults.filter(r => r.relevance === 'medium');

          if (highRelevanceResults.length > 0) {
            responseContent = `I found relevant documentation for "${query}":\n\n`;
            searchResultsToShow = highRelevanceResults;
          } else if (mediumRelevanceResults.length > 0) {
            responseContent = `Here are related articles that might help with "${query}":\n\n`;
            searchResultsToShow = mediumRelevanceResults;
          } else {
            responseContent = `I found some articles that might be related to "${query}":\n\n`;
            searchResultsToShow = searchResults.slice(0, 2);
          }
        } else {
          responseContent = `I couldn't find a direct match for "${query}".`;
        }

        setMessages(prev => prev.map(m => m.id === assistantId ? {
          ...m,
          content: responseContent,
          searchResults: searchResultsToShow,
        } : m));
      } catch (error) {
        setMessages(prev => prev.map(m => m.id === assistantId ? {
          ...m,
          content: `I'm having trouble searching our documentation right now. Please try again later.`,
        } : m));
      }
    })();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-primary hover:scale-105 touch-manipulation"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
      <Card className={`w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-sm md:w-96 transition-all duration-300 ${
        isMinimized ? 'h-12 sm:h-14' : 'h-[70vh] sm:h-[60vh] md:h-[500px]'
      } flex flex-col shadow-xl border-0 bg-chat-background`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-chat-border">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-xs sm:text-sm">Support Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 sm:h-8 sm:w-8 p-0"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`chat-bubble ${
                        message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {/* Search Results */}
                      {message.searchResults && message.searchResults.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.searchResults.map((result) => (
                            <div
                              key={result.id}
                              className="p-3 bg-background/50 rounded-lg border border-border/50 hover:bg-background/80 transition-colors"
                            >
                           <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                    <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium text-xs sm:text-sm truncate">{result.title}</span>
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs hidden sm:inline-flex"
                                      style={{ 
                                        borderColor: result.category.color,
                                        color: result.category.color 
                                      }}
                                    >
                                      {result.category.name}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {result.excerpt}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 flex-shrink-0"
                                  onClick={() => window.open(result.url || `/docs/${result.slug}`, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Loading indicator intentionally removed for instant replies */}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-chat-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything"
                  className="flex-1 text-sm"
                />
                <Button onClick={handleSendMessage} size="sm" disabled={!inputValue.trim()} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}