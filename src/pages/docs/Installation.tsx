import { Link } from 'react-router-dom';
import { Copy, Check, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';

const codeBlocks = [
  {
    id: 'npm',
    title: 'npm',
    content: 'npm install @albedoai/sdk',
    description: 'Install via npm package manager'
  },
  {
    id: 'yarn',
    title: 'yarn',
    content: 'yarn add @albedoai/sdk',
    description: 'Install via yarn package manager'
  },
  {
    id: 'pnpm',
    title: 'pnpm',
    content: 'pnpm add @albedoai/sdk',
    description: 'Install via pnpm package manager'
  },
  {
    id: 'bun',
    title: 'bun',
    content: 'bun add @albedoai/sdk',
    description: 'Install via bun package manager'
  }
];

const setupSteps = [
  {
    title: 'Install the SDK',
    content: 'Install the Albedo AI SDK using your preferred package manager.',
    code: 'npm install @albedoai/sdk'
  },
  {
    title: 'Get your API key',
    content: 'Sign up for an account and get your API key from the dashboard.',
    code: 'https://dashboard.albedoai.com/api-keys'
  },
  {
    title: 'Initialize the client',
    content: 'Create a new client instance with your API key.',
    code: `import { AlbedoClient } from '@albedoai/sdk';

const client = new AlbedoClient({
  apiKey: 'your-api-key-here'
});`
  },
  {
    title: 'Make your first request',
    content: 'Test the connection by making a simple API call.',
    code: `// Test the connection
const response = await client.health.check();
console.log(response); // { status: 'ok' }`
  }
];

export default function Installation() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="cursor-docs-main">
      <div className="cursor-docs-prose">
        <h1>Installation</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Get started with Albedo AI in minutes. Follow these simple steps to install and configure the SDK.
        </p>

        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Prerequisites:</strong> Node.js 16+ or browser environment with modern JavaScript support.
          </AlertDescription>
        </Alert>

        <h2>Package Managers</h2>
        <p>Choose your preferred package manager to install the Albedo AI SDK:</p>

        <div className="grid gap-4 md:grid-cols-2 my-8">
          {codeBlocks.map((block) => (
            <div key={block.id} className="cursor-docs-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{block.title}</h3>
                  <p className="text-sm text-muted-foreground">{block.description}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(block.content, block.id)}
                  className="shrink-0"
                >
                  {copiedCode === block.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <pre className="cursor-docs-prose pre">
                <code className="cursor-docs-prose code">{block.content}</code>
              </pre>
            </div>
          ))}
        </div>

        <h2>Quick Start Guide</h2>
        <p>Follow these steps to get up and running with Albedo AI:</p>

        <div className="space-y-8 my-8">
          {setupSteps.map((step, index) => (
            <div key={index} className="cursor-docs-card">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-4">{step.content}</p>
                  <div className="relative">
                    <pre className="cursor-docs-prose pre">
                      <code className="cursor-docs-prose code">{step.code}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(step.code, `step-${index}`)}
                      className="absolute top-2 right-2"
                    >
                      {copiedCode === `step-${index}` ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2>Environment Variables</h2>
        <p>For production applications, store your API key in environment variables:</p>

        <pre className="cursor-docs-prose pre">
          <code className="cursor-docs-prose code">{`# .env
ALBEDO_API_KEY=your-api-key-here

# .env.local (for local development)
ALBEDO_API_KEY=your-development-api-key`}</code>
        </pre>

        <div className="cursor-docs-card mt-8">
          <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
          <div className="space-y-3">
            <Link 
              to="/docs/auth" 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <span>Authentication & API Keys</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link 
              to="/docs/first-api-call" 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <span>Making Your First API Call</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
            <Link 
              to="/docs/api" 
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <span>API Reference</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
