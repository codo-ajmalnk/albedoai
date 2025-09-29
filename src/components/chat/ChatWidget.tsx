import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      content: 'Hello! I\'m here to help you with Albedo documentation. What can I assist you with today?',
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

  const searchArticles = async (query: string): Promise<SearchResult[]> => {
    try {
      const response = await fetch('/api/search/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 3 }),
      });
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
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
    setIsTyping(true);

    try {
      // Search for relevant articles
      const searchResults = await searchArticles(query);
      
      let responseContent = '';
      let searchResultsToShow: SearchResult[] = [];

      if (searchResults.length > 0) {
        const highRelevanceResults = searchResults.filter(r => r.relevance === 'high');
        const mediumRelevanceResults = searchResults.filter(r => r.relevance === 'medium');
        
        if (highRelevanceResults.length > 0) {
          responseContent = `I found some relevant information about "${query}":\n\n`;
          searchResultsToShow = highRelevanceResults;
        } else if (mediumRelevanceResults.length > 0) {
          responseContent = `Here are some related articles that might help with "${query}":\n\n`;
          searchResultsToShow = mediumRelevanceResults;
        } else {
          responseContent = `I found some articles that might be related to "${query}":\n\n`;
          searchResultsToShow = searchResults.slice(0, 2);
        }
      } else {
        responseContent = `I couldn't find specific information about "${query}" in our documentation. However, I can help you in other ways:\n\n• Try rephrasing your question\n• Check our main documentation sections\n• Contact our support team for personalized help\n\nWould you like me to search for something else?`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseContent,
        sender: 'assistant',
        timestamp: new Date(),
        searchResults: searchResultsToShow,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I'm having trouble searching our documentation right now. Please try again in a moment, or contact our support team directly for immediate assistance.`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-primary hover:scale-105"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-96 max-w-[calc(100vw-2rem)] transition-all duration-300 ${
        isMinimized ? 'h-14' : 'h-[500px]'
      } flex flex-col shadow-xl border-0 bg-chat-background`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-chat-border">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-sm">Support Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
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
                                  <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium text-sm truncate">{result.title}</span>
                                    <Badge 
                                      variant="outline" 
                                      className="text-xs"
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
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  onClick={() => window.open(`/docs/${result.slug}`, '_blank')}
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
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="chat-bubble chat-bubble-assistant">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-chat-border">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about our documentation..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="sm" disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}