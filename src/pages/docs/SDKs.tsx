import { useState } from 'react';
import { Copy, Check, Download, ExternalLink, Code, BookOpen, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const sdks = [
  {
    name: 'JavaScript/Node.js',
    language: 'javascript',
    package: '@albedoai/sdk',
    version: '1.2.0',
    install: 'npm install @albedoai/sdk',
    description: 'Official JavaScript SDK for browser and Node.js environments',
    features: ['TypeScript support', 'Promise-based API', 'Automatic retries', 'Request/response interceptors'],
    status: 'stable',
    documentation: 'https://docs.albedoai.com/sdks/javascript',
    github: 'https://github.com/albedoai/sdk-javascript',
  },
  {
    name: 'Python',
    language: 'python',
    package: 'albedoai',
    version: '1.1.5',
    install: 'pip install albedoai',
    description: 'Official Python SDK with async support',
    features: ['Async/await support', 'Type hints', 'Automatic retries', 'Custom HTTP client'],
    status: 'stable',
    documentation: 'https://docs.albedoai.com/sdks/python',
    github: 'https://github.com/albedoai/sdk-python',
  },
  {
    name: 'Java',
    language: 'java',
    package: 'com.albedoai.sdk',
    version: '1.0.8',
    install: 'implementation "com.albedoai.sdk:albedoai-java:1.0.8"',
    description: 'Official Java SDK for JVM-based applications',
    features: ['Maven/Gradle support', 'Builder pattern', 'Custom HTTP client', 'Comprehensive logging'],
    status: 'stable',
    documentation: 'https://docs.albedoai.com/sdks/java',
    github: 'https://github.com/albedoai/sdk-java',
  },
  {
    name: 'C#',
    language: 'csharp',
    package: 'AlbedoAI.SDK',
    version: '1.0.5',
    install: 'Install-Package AlbedoAI.SDK',
    description: 'Official C# SDK for .NET applications',
    features: ['.NET 6+ support', 'Async/await', 'Dependency injection', 'Configuration binding'],
    status: 'stable',
    documentation: 'https://docs.albedoai.com/sdks/csharp',
    github: 'https://github.com/albedoai/sdk-csharp',
  },
  {
    name: 'Go',
    language: 'go',
    package: 'github.com/albedoai/sdk-go',
    version: '1.0.3',
    install: 'go get github.com/albedoai/sdk-go',
    description: 'Official Go SDK with context support',
    features: ['Context support', 'Interface-based design', 'Custom HTTP client', 'Structured logging'],
    status: 'stable',
    documentation: 'https://docs.albedoai.com/sdks/go',
    github: 'https://github.com/albedoai/sdk-go',
  },
  {
    name: 'PHP',
    language: 'php',
    package: 'albedoai/sdk-php',
    version: '1.0.2',
    install: 'composer require albedoai/sdk-php',
    description: 'Official PHP SDK with PSR-7 support',
    features: ['PSR-7 HTTP messages', 'PSR-3 logging', 'Guzzle HTTP client', 'Composer support'],
    status: 'stable',
    documentation: 'https://docs.albedoai.com/sdks/php',
    github: 'https://github.com/albedoai/sdk-php',
  },
];

const quickStartExamples = {
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
  java: `// Add to your build.gradle
implementation "com.albedoai.sdk:albedoai-java:1.0.8"

// Initialize the client
import com.albedoai.sdk.AlbedoClient;
import com.albedoai.sdk.models.User;

AlbedoClient client = AlbedoClient.builder()
    .apiKey("your-api-key-here")
    .environment("production")
    .build();

// Make your first API call
try {
    User user = client.users().create(User.builder()
        .email("user@example.com")
        .name("John Doe")
        .build());
    System.out.println("User created: " + user);
} catch (Exception error) {
    System.err.println("Error: " + error.getMessage());
}`,
  csharp: `// Install the package
Install-Package AlbedoAI.SDK

// Initialize the client
using AlbedoAI.SDK;

var client = new AlbedoClient(new AlbedoClientOptions
{
    ApiKey = "your-api-key-here",
    Environment = "production"
});

// Make your first API call
try
{
    var user = await client.Users.CreateAsync(new CreateUserRequest
    {
        Email = "user@example.com",
        Name = "John Doe"
    });
    Console.WriteLine("User created: " + user);
}
catch (Exception error)
{
    Console.WriteLine("Error: " + error.Message);
}`,
  go: `// Install the SDK
go get github.com/albedoai/sdk-go

// Initialize the client
import "github.com/albedoai/sdk-go"

client := albedoai.NewClient(&albedoai.Config{
    APIKey:     "your-api-key-here",
    Environment: "production",
})

// Make your first API call
user, err := client.Users.Create(context.Background(), &albedoai.CreateUserRequest{
    Email: "user@example.com",
    Name:  "John Doe",
})
if err != nil {
    log.Fatal(err)
}
fmt.Println("User created:", user)`,
  php: `// Install via Composer
composer require albedoai/sdk-php

// Initialize the client
use AlbedoAI\\SDK\\AlbedoClient;

$client = new AlbedoClient([
    'api_key' => 'your-api-key-here',
    'environment' => 'production'
]);

// Make your first API call
try {
    $user = $client->users()->create([
        'email' => 'user@example.com',
        'name' => 'John Doe'
    ]);
    echo "User created: " . json_encode($user);
} catch (Exception $error) {
    echo "Error: " . $error->getMessage();
}`,
};

const statusColors = {
  stable: 'bg-green-100 text-green-800',
  beta: 'bg-yellow-100 text-yellow-800',
  deprecated: 'bg-red-100 text-red-800',
};

export default function SDKs() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedSDK, setSelectedSDK] = useState(sdks[0].language);

  const copyToClipboard = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(language);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedSDKData = sdks.find(sdk => sdk.language === selectedSDK);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">SDKs & Libraries</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Official SDKs and client libraries for popular programming languages. 
          Choose your preferred language and start building with Albedo AI.
        </p>
      </div>

      {/* SDK Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sdks.map((sdk) => (
          <Card 
            key={sdk.language}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSDK === sdk.language ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedSDK(sdk.language)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{sdk.name}</CardTitle>
                <Badge className={statusColors[sdk.status as keyof typeof statusColors]}>
                  {sdk.status}
                </Badge>
              </div>
              <CardDescription>{sdk.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Installation</h4>
                <code className="text-xs bg-muted p-2 rounded block">{sdk.install}</code>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Features</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {sdk.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={sdk.documentation} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="h-3 w-3 mr-1" />
                    Docs
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href={sdk.github} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    GitHub
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start */}
      {selectedSDKData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Start - {selectedSDKData.name}
            </CardTitle>
            <CardDescription>
              Get started with the {selectedSDKData.name} SDK in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Installation</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted p-2 rounded text-sm">{selectedSDKData.install}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedSDKData.install, 'install')}
                >
                  {copiedCode === 'install' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold">Example Code</h4>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{quickStartExamples[selectedSDK as keyof typeof quickStartExamples]}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(quickStartExamples[selectedSDK as keyof typeof quickStartExamples], 'code')}
                >
                  {copiedCode === 'code' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Community SDKs */}
      <Card>
        <CardHeader>
          <CardTitle>Community SDKs</CardTitle>
          <CardDescription>
            Community-contributed SDKs for additional languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Ruby</h4>
              <p className="text-sm text-muted-foreground">
                Community-maintained Ruby gem
              </p>
              <code className="text-xs bg-muted p-2 rounded block">gem install albedoai-ruby</code>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Swift</h4>
              <p className="text-sm text-muted-foreground">
                iOS and macOS SDK
              </p>
              <code className="text-xs bg-muted p-2 rounded block">pod install AlbedoAI</code>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Kotlin</h4>
              <p className="text-sm text-muted-foreground">
                Android SDK
              </p>
              <code className="text-xs bg-muted p-2 rounded block">implementation 'com.albedoai:android-sdk:1.0.0'</code>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Rust</h4>
              <p className="text-sm text-muted-foreground">
                Rust crate
              </p>
              <code className="text-xs bg-muted p-2 rounded block">cargo add albedoai</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Alert>
        <Code className="h-4 w-4" />
        <AlertDescription>
          <strong>Need help with an SDK?</strong> Check out our{' '}
          <a href="/docs/examples" className="underline hover:no-underline">
            code examples
          </a>{' '}
          or visit the{' '}
          <a href="https://github.com/albedoai" className="underline hover:no-underline">
            GitHub repository
          </a>{' '}
          for your language.
        </AlertDescription>
      </Alert>
    </div>
  );
}
