import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Zap, Shield, Code, BookOpen, ExternalLink, Copy, Check, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const steps = [
  {
    id: 1,
    title: 'Create an Account',
    description: 'Sign up for a free Albedo AI account to get started',
    icon: Shield,
    completed: true,
  },
  {
    id: 2,
    title: 'Get Your API Key',
    description: 'Generate your API key from the dashboard',
    icon: Key,
    completed: true,
  },
  {
    id: 3,
    title: 'Install the SDK',
    description: 'Add the Albedo AI SDK to your project',
    icon: Code,
    completed: false,
  },
  {
    id: 4,
    title: 'Make Your First Call',
    description: 'Send your first request to the API',
    icon: Zap,
    completed: false,
  },
];

const codeExamples = {
  javascript: `// Install the SDK
npm install @albedoai/sdk

// Initialize the client
import { AlbedoClient } from '@albedoai/sdk';

const client = new AlbedoClient({
  apiKey: 'your-api-key-here',
  environment: 'production' // or 'sandbox'
});

// Make your first API call
async function createUser() {
  try {
    const user = await client.users.create({
      email: 'user@example.com',
      name: 'John Doe'
    });
    console.log('User created:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}`,
  python: `# Install the SDK
pip install albedoai

# Initialize the client
from albedoai import AlbedoClient

client = AlbedoClient(
    api_key="your-api-key-here",
    environment="production"  # or "sandbox"
)

# Make your first API call
def create_user():
    try:
        user = client.users.create(
            email="user@example.com",
            name="John Doe"
        )
        print("User created:", user)
    except Exception as error:
        print("Error:", error)`,
  curl: `# Make a direct API call with curl
curl -X POST https://api.albedoai.com/v1/users \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "name": "John Doe"
  }'`
};

const quickLinks = [
  {
    title: 'API Reference',
    description: 'Complete API documentation',
    href: '/docs/api',
    icon: BookOpen,
  },
  {
    title: 'Authentication',
    description: 'Learn about API authentication',
    href: '/docs/auth',
    icon: Shield,
  },
  {
    title: 'SDKs & Libraries',
    description: 'Client libraries for your language',
    href: '/docs/sdks',
    icon: Code,
  },
  {
    title: 'Examples',
    description: 'Code examples and tutorials',
    href: '/docs/examples',
    icon: ExternalLink,
  },
];

export default function GettingStarted() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(language);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="mb-4">
          <Zap className="h-3 w-3 mr-1" />
          Quick Start Guide
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight">Getting Started with Albedo AI</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Get up and running with Albedo AI in minutes. Follow our step-by-step guide to integrate our powerful AI platform into your application.
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started Checklist</CardTitle>
          <CardDescription>
            Follow these steps to complete your setup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-medium ${
                      step.completed ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm ${
                      step.completed ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            Choose your preferred language and start coding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="javascript" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            
            {Object.entries(codeExamples).map(([language, code]) => (
              <TabsContent key={language} value={language} className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{code}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code, language)}
                  >
                    {copiedCode === language ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              to={link.href}
              className="group cursor-docs-card hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
                    {link.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {link.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Next Steps */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Ready to dive deeper?</strong> Check out our{' '}
          <Link to="/docs/api" className="underline hover:no-underline">
            API Reference
          </Link>{' '}
          for detailed endpoint documentation, or explore our{' '}
          <Link to="/docs/examples" className="underline hover:no-underline">
            Examples
          </Link>{' '}
          for real-world use cases.
        </AlertDescription>
      </Alert>
    </div>
  );
}
