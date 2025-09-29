import { useState } from 'react';
import { Copy, Check, Shield, Key, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const authMethods = [
  {
    name: 'API Key',
    description: 'Simple authentication using API keys',
    security: 'High',
    useCase: 'Server-to-server communication',
    icon: Key,
  },
  {
    name: 'JWT Token',
    description: 'JSON Web Token based authentication',
    security: 'High',
    useCase: 'User authentication and authorization',
    icon: Lock,
  },
  {
    name: 'OAuth 2.0',
    description: 'Industry standard authorization framework',
    security: 'Very High',
    useCase: 'Third-party integrations',
    icon: Shield,
  },
];

const apiKeyExamples = {
  curl: `# Using API Key in Authorization header
curl -X GET "https://api.albedoai.com/v1/users" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"

# Using API Key in query parameter (not recommended for production)
curl -X GET "https://api.albedoai.com/v1/users?api_key=your-api-key-here" \\
  -H "Content-Type: application/json"`,
  javascript: `// Using fetch API with API key
const apiKey = 'your-api-key-here';
const baseURL = 'https://api.albedoai.com/v1';

async function makeAuthenticatedRequest(endpoint) {
  const response = await fetch(\`\${baseURL}\${endpoint}\`, {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return await response.json();
}

// Example usage
makeAuthenticatedRequest('/users')
  .then(data => console.log(data))
  .catch(error => console.error(error));`,
  python: `import requests

# Using API key in headers
API_KEY = 'your-api-key-here'
BASE_URL = 'https://api.albedoai.com/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

def make_authenticated_request(endpoint):
    response = requests.get(f'{BASE_URL}{endpoint}', headers=headers)
    response.raise_for_status()
    return response.json()

# Example usage
try:
    data = make_authenticated_request('/users')
    print(data)
except requests.exceptions.RequestException as error:
    print(f"Error: {error}")`,
};

const jwtExamples = {
  javascript: `// JWT Token authentication
const jwt = require('jsonwebtoken');

// Generate JWT token (server-side)
function generateJWT(userId, secret) {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  };
  
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

// Use JWT token in API requests
async function makeJWTRequest(token) {
  const response = await fetch('https://api.albedoai.com/v1/users', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}`,
  python: `import jwt
import requests
from datetime import datetime, timedelta

# Generate JWT token (server-side)
def generate_jwt(user_id, secret):
    payload = {
        'sub': user_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=1)
    }
    
    return jwt.encode(payload, secret, algorithm='HS256')

# Use JWT token in API requests
def make_jwt_request(token):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get('https://api.albedoai.com/v1/users', headers=headers)
    response.raise_for_status()
    return response.json()`,
};

const oauthExamples = {
  javascript: `// OAuth 2.0 Authorization Code Flow
const express = require('express');
const axios = require('axios');

const app = express();

// OAuth configuration
const OAUTH_CONFIG = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  redirectUri: 'http://localhost:3000/callback',
  authorizationUrl: 'https://api.albedoai.com/oauth/authorize',
  tokenUrl: 'https://api.albedoai.com/oauth/token'
};

// Step 1: Redirect user to authorization URL
app.get('/auth', (req, res) => {
  const authUrl = \`\${OAUTH_CONFIG.authorizationUrl}?client_id=\${OAUTH_CONFIG.clientId}&redirect_uri=\${OAUTH_CONFIG.redirectUri}&response_type=code&scope=read write\`;
  res.redirect(authUrl);
});

// Step 2: Handle callback and exchange code for token
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  
  try {
    const tokenResponse = await axios.post(OAUTH_CONFIG.tokenUrl, {
      grant_type: 'authorization_code',
      client_id: OAUTH_CONFIG.clientId,
      client_secret: OAUTH_CONFIG.clientSecret,
      redirect_uri: OAUTH_CONFIG.redirectUri,
      code: code
    });
    
    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Store tokens securely
    // Use access_token for API requests
    res.json({ success: true, access_token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Step 3: Use access token for API requests
async function makeOAuthRequest(accessToken) {
  const response = await fetch('https://api.albedoai.com/v1/users', {
    method: 'GET',
    headers: {
      'Authorization': \`Bearer \${accessToken}\`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}`,
  python: `# OAuth 2.0 Authorization Code Flow
import requests
from flask import Flask, redirect, request, jsonify

app = Flask(__name__)

# OAuth configuration
OAUTH_CONFIG = {
    'client_id': 'your-client-id',
    'client_secret': 'your-client-secret',
    'redirect_uri': 'http://localhost:5000/callback',
    'authorization_url': 'https://api.albedoai.com/oauth/authorize',
    'token_url': 'https://api.albedoai.com/oauth/token'
}

# Step 1: Redirect user to authorization URL
@app.route('/auth')
def auth():
    auth_url = f"{OAUTH_CONFIG['authorization_url']}?client_id={OAUTH_CONFIG['client_id']}&redirect_uri={OAUTH_CONFIG['redirect_uri']}&response_type=code&scope=read write"
    return redirect(auth_url)

# Step 2: Handle callback and exchange code for token
@app.route('/callback')
def callback():
    code = request.args.get('code')
    
    try:
        token_response = requests.post(OAUTH_CONFIG['token_url'], data={
            'grant_type': 'authorization_code',
            'client_id': OAUTH_CONFIG['client_id'],
            'client_secret': OAUTH_CONFIG['client_secret'],
            'redirect_uri': OAUTH_CONFIG['redirect_uri'],
            'code': code
        })
        
        token_data = token_response.json()
        access_token = token_data['access_token']
        refresh_token = token_data['refresh_token']
        
        # Store tokens securely
        # Use access_token for API requests
        return jsonify({'success': True, 'access_token': access_token})
    except Exception as error:
        return jsonify({'error': str(error)}), 400

# Step 3: Use access token for API requests
def make_oauth_request(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get('https://api.albedoai.com/v1/users', headers=headers)
    response.raise_for_status()
    return response.json()`,
};

const securityBestPractices = [
  {
    title: 'API Key Security',
    practices: [
      'Store API keys securely (environment variables, secret management)',
      'Never expose API keys in client-side code',
      'Rotate API keys regularly',
      'Use different keys for different environments',
      'Monitor API key usage and set up alerts',
    ],
  },
  {
    title: 'JWT Token Security',
    practices: [
      'Use strong, unique secrets for signing',
      'Set appropriate expiration times',
      'Implement token refresh mechanisms',
      'Validate token signatures on every request',
      'Use HTTPS for all token transmission',
    ],
  },
  {
    title: 'OAuth 2.0 Security',
    practices: [
      'Use HTTPS for all OAuth flows',
      'Validate state parameters to prevent CSRF',
      'Store client secrets securely',
      'Implement proper scope validation',
      'Use PKCE for public clients',
    ],
  },
];

export default function Auth() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getSecurityColor = (security: string) => {
    switch (security) {
      case 'Very High': return 'bg-green-100 text-green-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Authentication</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn how to authenticate with the Albedo AI API. Choose the authentication 
          method that best fits your use case and security requirements.
        </p>
      </div>

      {/* Authentication Methods */}
      <div className="grid gap-6 md:grid-cols-3">
        {authMethods.map((method) => {
          const Icon = method.icon;
          return (
            <Card key={method.name}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Security Level</span>
                  <Badge className={getSecurityColor(method.security)}>
                    {method.security}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium">Best For</span>
                  <p className="text-sm text-muted-foreground">{method.useCase}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API Key Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Authentication
          </CardTitle>
          <CardDescription>
            Simple and secure authentication using API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">How it works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Generate an API key from your dashboard</li>
              <li>Include the API key in the Authorization header of your requests</li>
              <li>Use the format: <code>Authorization: Bearer your-api-key-here</code></li>
            </ol>
          </div>

          <Tabs defaultValue="curl" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            {Object.entries(apiKeyExamples).map(([language, code]) => (
              <TabsContent key={language} value={language} className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{code}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code, `api-key-${language}`)}
                  >
                    {copiedCode === `api-key-${language}` ? (
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

      {/* JWT Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            JWT Token Authentication
          </CardTitle>
          <CardDescription>
            JSON Web Token based authentication for user sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">How it works</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Authenticate with username/password to get a JWT token</li>
              <li>Include the JWT token in the Authorization header</li>
              <li>Tokens expire after a set time and need to be refreshed</li>
            </ol>
          </div>

          <Tabs defaultValue="javascript" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            {Object.entries(jwtExamples).map(([language, code]) => (
              <TabsContent key={language} value={language} className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{code}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code, `jwt-${language}`)}
                  >
                    {copiedCode === `jwt-${language}` ? (
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

      {/* OAuth 2.0 Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            OAuth 2.0 Authentication
          </CardTitle>
          <CardDescription>
            Industry standard authorization framework for third-party integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Authorization Code Flow</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Redirect user to authorization URL</li>
              <li>User authorizes your application</li>
              <li>Exchange authorization code for access token</li>
              <li>Use access token for API requests</li>
            </ol>
          </div>

          <Tabs defaultValue="javascript" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
            
            {Object.entries(oauthExamples).map(([language, code]) => (
              <TabsContent key={language} value={language} className="space-y-4">
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm">{code}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(code, `oauth-${language}`)}
                  >
                    {copiedCode === `oauth-${language}` ? (
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

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
          <CardDescription>
            Important security considerations for each authentication method
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {securityBestPractices.map((section) => (
            <div key={section.title} className="space-y-3">
              <h4 className="font-semibold">{section.title}</h4>
              <ul className="space-y-2">
                {section.practices.map((practice, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Handling
          </CardTitle>
          <CardDescription>
            Common authentication errors and how to handle them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status Code</TableHead>
                <TableHead>Error</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Solution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">401</TableCell>
                <TableCell>Unauthorized</TableCell>
                <TableCell>Invalid or missing API key</TableCell>
                <TableCell>Check your API key and ensure it's included in the Authorization header</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">403</TableCell>
                <TableCell>Forbidden</TableCell>
                <TableCell>Valid API key but insufficient permissions</TableCell>
                <TableCell>Check your API key permissions and upgrade if necessary</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">429</TableCell>
                <TableCell>Too Many Requests</TableCell>
                <TableCell>Rate limit exceeded</TableCell>
                <TableCell>Implement exponential backoff and respect rate limits</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Need help with authentication?</strong> Check out our{' '}
          <a href="/docs/examples" className="underline hover:no-underline">
            code examples
          </a>{' '}
          or contact our{' '}
          <a href="/support" className="underline hover:no-underline">
            support team
          </a>{' '}
          for assistance.
        </AlertDescription>
      </Alert>
    </div>
  );
}
