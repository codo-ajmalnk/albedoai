import { useState } from 'react';
import { Copy, Check, ExternalLink, Code, BookOpen, Zap, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const apiEndpoints = [
  {
    method: 'GET',
    path: '/v1/users',
    description: 'List all users',
    parameters: [
      { name: 'limit', type: 'integer', required: false, description: 'Number of users to return (max 100)' },
      { name: 'offset', type: 'integer', required: false, description: 'Number of users to skip' },
      { name: 'status', type: 'string', required: false, description: 'Filter by user status' },
    ],
    response: {
      status: 200,
      body: {
        data: [
          {
            id: 'user_123',
            email: 'user@example.com',
            name: 'John Doe',
            status: 'active',
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T10:30:00Z'
          }
        ],
        pagination: {
          limit: 20,
          offset: 0,
          total: 1
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/v1/users',
    description: 'Create a new user',
    parameters: [
      { name: 'email', type: 'string', required: true, description: 'User email address' },
      { name: 'name', type: 'string', required: true, description: 'User full name' },
      { name: 'preferences', type: 'object', required: false, description: 'User preferences' },
    ],
    response: {
      status: 201,
      body: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        status: 'active',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      }
    }
  },
  {
    method: 'GET',
    path: '/v1/users/{id}',
    description: 'Get a specific user',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'User ID' },
    ],
    response: {
      status: 200,
      body: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        status: 'active',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      }
    }
  },
  {
    method: 'PUT',
    path: '/v1/users/{id}',
    description: 'Update a user',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'User ID' },
      { name: 'email', type: 'string', required: false, description: 'User email address' },
      { name: 'name', type: 'string', required: false, description: 'User full name' },
      { name: 'preferences', type: 'object', required: false, description: 'User preferences' },
    ],
    response: {
      status: 200,
      body: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        status: 'active',
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T11:30:00Z'
      }
    }
  },
  {
    method: 'DELETE',
    path: '/v1/users/{id}',
    description: 'Delete a user',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'User ID' },
    ],
    response: {
      status: 204,
      body: null
    }
  }
];

const errorCodes = [
  { code: 400, name: 'Bad Request', description: 'The request was invalid or cannot be served' },
  { code: 401, name: 'Unauthorized', description: 'Authentication credentials were missing or incorrect' },
  { code: 403, name: 'Forbidden', description: 'The request was valid but the server is refusing action' },
  { code: 404, name: 'Not Found', description: 'The requested resource was not found' },
  { code: 409, name: 'Conflict', description: 'The request conflicts with the current state of the resource' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request was well-formed but contains semantic errors' },
  { code: 429, name: 'Too Many Requests', description: 'Rate limit exceeded' },
  { code: 500, name: 'Internal Server Error', description: 'An unexpected error occurred on the server' },
  { code: 503, name: 'Service Unavailable', description: 'The server is temporarily unavailable' },
];

const codeExamples = {
  curl: `# List users
curl -X GET "https://api.albedoai.com/v1/users" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"

# Create a user
curl -X POST "https://api.albedoai.com/v1/users" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "preferences": {
      "language": "en",
      "notifications": true
    }
  }'

# Get a specific user
curl -X GET "https://api.albedoai.com/v1/users/user_123" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"

# Update a user
curl -X PUT "https://api.albedoai.com/v1/users/user_123" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Smith",
    "preferences": {
      "language": "en",
      "notifications": false
    }
  }'

# Delete a user
curl -X DELETE "https://api.albedoai.com/v1/users/user_123" \\
  -H "Authorization: Bearer your-api-key-here" \\
  -H "Content-Type: application/json"`,
  javascript: `// Using fetch API
const apiKey = 'your-api-key-here';
const baseURL = 'https://api.albedoai.com/v1';

// List users
async function listUsers() {
  const response = await fetch(\`\${baseURL}/users\`, {
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

// Create a user
async function createUser(userData) {
  const response = await fetch(\`\${baseURL}/users\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return await response.json();
}

// Get a specific user
async function getUser(userId) {
  const response = await fetch(\`\${baseURL}/users/\${userId}\`, {
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

// Update a user
async function updateUser(userId, userData) {
  const response = await fetch(\`\${baseURL}/users/\${userId}\`, {
    method: 'PUT',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return await response.json();
}

// Delete a user
async function deleteUser(userId) {
  const response = await fetch(\`\${baseURL}/users/\${userId}\`, {
    method: 'DELETE',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return response.status === 204;
}`,
  python: `import requests
import json

# Configuration
API_KEY = 'your-api-key-here'
BASE_URL = 'https://api.albedoai.com/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# List users
def list_users():
    response = requests.get(f'{BASE_URL}/users', headers=headers)
    response.raise_for_status()
    return response.json()

# Create a user
def create_user(user_data):
    response = requests.post(
        f'{BASE_URL}/users',
        headers=headers,
        data=json.dumps(user_data)
    )
    response.raise_for_status()
    return response.json()

# Get a specific user
def get_user(user_id):
    response = requests.get(f'{BASE_URL}/users/{user_id}', headers=headers)
    response.raise_for_status()
    return response.json()

# Update a user
def update_user(user_id, user_data):
    response = requests.put(
        f'{BASE_URL}/users/{user_id}',
        headers=headers,
        data=json.dumps(user_data)
    )
    response.raise_for_status()
    return response.json()

# Delete a user
def delete_user(user_id):
    response = requests.delete(f'{BASE_URL}/users/{user_id}', headers=headers)
    response.raise_for_status()
    return response.status_code == 204`
};

export default function API() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(apiEndpoints[0]);

  const copyToClipboard = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">API Reference</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Complete API documentation for Albedo AI. Explore endpoints, parameters, 
          responses, and code examples for all available operations.
        </p>
      </div>

      {/* Base URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Base URL
          </CardTitle>
          <CardDescription>
            All API requests should be made to this base URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="text-lg font-mono bg-muted p-3 rounded block">
            https://api.albedoai.com
          </code>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication
          </CardTitle>
          <CardDescription>
            How to authenticate your API requests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            All API requests must include your API key in the Authorization header. 
            You can find your API key in your dashboard settings.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold">Header Format</h4>
            <code className="text-sm bg-muted p-2 rounded block">
              Authorization: Bearer your-api-key-here
            </code>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Available endpoints and their parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {apiEndpoints.map((endpoint, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getMethodColor(endpoint.method)}>
                    {endpoint.method}
                  </Badge>
                  <code className="text-sm font-mono">{endpoint.path}</code>
                  <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                </div>
                
                {endpoint.parameters.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Parameters</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {endpoint.parameters.map((param, paramIndex) => (
                          <TableRow key={paramIndex}>
                            <TableCell className="font-mono text-sm">{param.name}</TableCell>
                            <TableCell className="text-sm">{param.type}</TableCell>
                            <TableCell>
                              <Badge variant={param.required ? 'default' : 'secondary'}>
                                {param.required ? 'Yes' : 'No'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{param.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                <div className="space-y-2 mt-4">
                  <h4 className="font-semibold text-sm">Response</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Status {endpoint.response.status}</Badge>
                    </div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      <code>{JSON.stringify(endpoint.response.body, null, 2)}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Code Examples</CardTitle>
          <CardDescription>
            Example code for different programming languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
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

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Error Codes
          </CardTitle>
          <CardDescription>
            HTTP status codes and their meanings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorCodes.map((error) => (
                <TableRow key={error.code}>
                  <TableCell className="font-mono">{error.code}</TableCell>
                  <TableCell>{error.name}</TableCell>
                  <TableCell>{error.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          <strong>Need more help?</strong> Check out our{' '}
          <a href="/docs/examples" className="underline hover:no-underline">
            code examples
          </a>{' '}
          or explore our{' '}
          <a href="/docs/sdks" className="underline hover:no-underline">
            SDK documentation
          </a>{' '}
          for your preferred programming language.
        </AlertDescription>
      </Alert>
    </div>
  );
}
