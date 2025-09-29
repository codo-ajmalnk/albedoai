import { useState } from 'react';
import { Search, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const faqCategories = [
  {
    id: 'general',
    title: 'General',
    icon: HelpCircle,
  },
  {
    id: 'billing',
    title: 'Billing',
    icon: HelpCircle,
  },
  {
    id: 'technical',
    title: 'Technical',
    icon: HelpCircle,
  },
  {
    id: 'api',
    title: 'API',
    icon: HelpCircle,
  },
];

const faqData = {
  general: [
    {
      question: 'What is Albedo AI?',
      answer: 'Albedo AI is a comprehensive artificial intelligence platform that provides advanced machine learning capabilities, natural language processing, and data analysis tools. Our platform is designed to help developers and businesses integrate AI functionality into their applications with ease.',
    },
    {
      question: 'How do I get started with Albedo AI?',
      answer: 'Getting started is simple! First, create an account on our platform, then generate your API key from the dashboard. Install our SDK for your preferred programming language, and you\'re ready to make your first API call. Check out our Getting Started guide for detailed instructions.',
    },
    {
      question: 'Is there a free tier available?',
      answer: 'Yes! We offer a generous free tier that includes 1,000 API calls per month, basic support, and access to our core features. This is perfect for developers who want to test our platform or build small applications.',
    },
    {
      question: 'What programming languages are supported?',
      answer: 'We provide official SDKs for JavaScript/Node.js, Python, Java, C#, and Go. We also support direct REST API calls from any language that can make HTTP requests. Community-contributed SDKs are available for additional languages.',
    },
  ],
  billing: [
    {
      question: 'How does billing work?',
      answer: 'We use a usage-based billing model. You pay only for what you use, with no upfront costs or long-term commitments. Billing is calculated based on the number of API calls, data processing volume, and storage used.',
    },
    {
      question: 'Can I change my plan at any time?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any charges. You can also set usage alerts to monitor your consumption.',
    },
    {
      question: 'Do you offer enterprise pricing?',
      answer: 'Yes, we offer custom enterprise pricing for high-volume users and organizations with specific requirements. Contact our sales team to discuss your needs and get a personalized quote.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise customers. All payments are processed securely through our payment partners.',
    },
  ],
  technical: [
    {
      question: 'What is the API response time?',
      answer: 'Our API typically responds within 100-500ms for most requests. Response times may vary based on the complexity of the request, current load, and your geographic location. We provide real-time monitoring of API performance in your dashboard.',
    },
    {
      question: 'How do I handle rate limits?',
      answer: 'Rate limits are enforced per API key and reset every minute. If you hit a rate limit, you\'ll receive a 429 status code with retry-after headers. We recommend implementing exponential backoff in your applications.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Security is our top priority. All data is encrypted in transit using TLS 1.3 and at rest using AES-256. We\'re SOC 2 Type II compliant and follow industry best practices for data protection.',
    },
    {
      question: 'Do you offer webhooks?',
      answer: 'Yes! We support webhooks for real-time notifications about various events in your account. You can configure webhooks for user actions, billing events, system alerts, and more.',
    },
  ],
  api: [
    {
      question: 'How do I authenticate API requests?',
      answer: 'Authentication is done using API keys. Include your API key in the Authorization header as "Bearer your-api-key-here". You can generate and manage API keys from your dashboard.',
    },
    {
      question: 'What is the API versioning strategy?',
      answer: 'We use semantic versioning for our API. The current version is v1, and we maintain backward compatibility for at least 12 months when introducing breaking changes. We\'ll provide migration guides for major updates.',
    },
    {
      question: 'How do I handle errors?',
      answer: 'Our API returns standard HTTP status codes and detailed error messages in JSON format. Each error includes an error code, message, and additional context to help you resolve issues quickly.',
    },
    {
      question: 'Can I test the API before going live?',
      answer: 'Yes! We provide a sandbox environment where you can test all API endpoints with test data. Use the sandbox API key and base URL to experiment without affecting your production data.',
    },
  ],
};

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(itemId)) {
      newOpenItems.delete(itemId);
    } else {
      newOpenItems.add(itemId);
    }
    setOpenItems(newOpenItems);
  };

  const filteredFAQs = faqData[selectedCategory as keyof typeof faqData].filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Find answers to common questions about Albedo AI. Can't find what you're looking for? 
          <a href="/support" className="text-primary hover:underline ml-1">Contact our support team</a>.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2">
        {faqCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.title}
            </Button>
          );
        })}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No FAQs found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse a different category.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq, index) => {
            const itemId = `${selectedCategory}-${index}`;
            const isOpen = openItems.has(itemId);
            
            return (
              <Card key={itemId}>
                <Collapsible open={isOpen} onOpenChange={() => toggleItem(itemId)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-left">{faq.question}</CardTitle>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })
        )}
      </div>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardContent className="text-center py-8">
          <HelpCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Still need help?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <a href="/support">Contact Support</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/docs/api">API Documentation</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
