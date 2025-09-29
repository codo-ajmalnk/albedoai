import { useState } from 'react';
import { Copy, Check, Code, ExternalLink, Play, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const examples = [
  {
    id: 'basic-integration',
    title: 'Basic Integration',
    description: 'Simple example of integrating Albedo AI into a web application',
    difficulty: 'beginner',
    language: 'javascript',
    code: `// Basic integration example
import { AlbedoClient } from '@albedoai/sdk';

const client = new AlbedoClient({
  apiKey: process.env.ALBEDO_API_KEY,
  environment: 'production'
});

// Create a new user
async function createUser(userData) {
  try {
    const user = await client.users.create({
      email: userData.email,
      name: userData.name,
      preferences: {
        language: 'en',
        notifications: true
      }
    });
    
    console.log('User created successfully:', user);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Get user by ID
async function getUser(userId) {
  try {
    const user = await client.users.get(userId);
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

// Update user
async function updateUser(userId, updates) {
  try {
    const user = await client.users.update(userId, updates);
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}`,
  },
  {
    id: 'react-component',
    title: 'React Component',
    description: 'React component that uses Albedo AI for user management',
    difficulty: 'intermediate',
    language: 'javascript',
    code: `import React, { useState, useEffect } from 'react';
import { AlbedoClient } from '@albedoai/sdk';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const client = new AlbedoClient({
    apiKey: process.env.REACT_APP_ALBEDO_API_KEY,
    environment: 'production'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await client.users.list();
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    try {
      const newUser = await client.users.create(userData);
      setUsers(prev => [...prev, newUser]);
    } catch (err) {
      setError(err.message);
    }
  };

  const updateUser = async (userId, updates) => {
    try {
      const updatedUser = await client.users.update(userId, updates);
      setUsers(prev => 
        prev.map(user => user.id === userId ? updatedUser : user)
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>User Management</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserManagement;`,
  },
  {
    id: 'python-flask',
    title: 'Python Flask API',
    description: 'Flask API server that integrates with Albedo AI',
    difficulty: 'intermediate',
    language: 'python',
    code: `from flask import Flask, request, jsonify
from albedoai import AlbedoClient
import os

app = Flask(__name__)

# Initialize Albedo AI client
client = AlbedoClient(
    api_key=os.getenv('ALBEDO_API_KEY'),
    environment='production'
)

@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('email') or not data.get('name'):
            return jsonify({'error': 'Email and name are required'}), 400
        
        # Create user via Albedo AI
        user = client.users.create({
            'email': data['email'],
            'name': data['name'],
            'preferences': data.get('preferences', {})
        })
        
        return jsonify({
            'success': True,
            'user': user
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = client.users.get(user_id)
        return jsonify({
            'success': True,
            'user': user
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404

@app.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.get_json()
        user = client.users.update(user_id, data)
        
        return jsonify({
            'success': True,
            'user': user
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)`,
  },
  {
    id: 'webhook-handler',
    title: 'Webhook Handler',
    description: 'Handle webhooks from Albedo AI in your application',
    difficulty: 'advanced',
    language: 'javascript',
    code: `const express = require('express');
const crypto = require('crypto');
const { AlbedoClient } = require('@albedoai/sdk');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Verify webhook signature
function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

// Webhook endpoint
app.post('/webhooks/albedo', (req, res) => {
  const signature = req.headers['x-albedo-signature'];
  const payload = JSON.stringify(req.body);
  const secret = process.env.ALBEDO_WEBHOOK_SECRET;
  
  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = req.body;
  
  // Handle different event types
  switch (event.type) {
    case 'user.created':
      handleUserCreated(event.data);
      break;
    case 'user.updated':
      handleUserUpdated(event.data);
      break;
    case 'user.deleted':
      handleUserDeleted(event.data);
      break;
    default:
      console.log('Unknown event type:', event.type);
  }
  
  res.status(200).json({ received: true });
});

// Event handlers
function handleUserCreated(userData) {
  console.log('New user created:', userData);
  // Add your logic here
  // e.g., send welcome email, create local user record, etc.
}

function handleUserUpdated(userData) {
  console.log('User updated:', userData);
  // Add your logic here
  // e.g., update local user record, sync data, etc.
}

function handleUserDeleted(userData) {
  console.log('User deleted:', userData);
  // Add your logic here
  // e.g., cleanup local data, send notification, etc.
}

app.listen(port, () => {
  console.log(\`Webhook server running on port \${port}\`);
});`,
  },
  {
    id: 'error-handling',
    title: 'Error Handling',
    description: 'Robust error handling patterns for Albedo AI integration',
    difficulty: 'intermediate',
    language: 'javascript',
    code: `import { AlbedoClient, AlbedoError } from '@albedoai/sdk';

const client = new AlbedoClient({
  apiKey: process.env.ALBEDO_API_KEY,
  environment: 'production'
});

// Retry configuration
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

// Exponential backoff retry function
async function withRetry(fn, config = retryConfig) {
  let lastError;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt),
        config.maxDelay
      );
      
      console.log(\`Attempt \${attempt + 1} failed, retrying in \${delay}ms...\`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

// Wrapper function with error handling
async function safeApiCall(apiCall) {
  try {
    return await withRetry(apiCall);
  } catch (error) {
    if (error instanceof AlbedoError) {
      // Handle Albedo AI specific errors
      switch (error.code) {
        case 'RATE_LIMITED':
          console.error('Rate limit exceeded:', error.message);
          break;
        case 'INVALID_API_KEY':
          console.error('Invalid API key:', error.message);
          break;
        case 'VALIDATION_ERROR':
          console.error('Validation error:', error.message);
          break;
        default:
          console.error('Albedo AI error:', error.message);
      }
    } else {
      // Handle network or other errors
      console.error('Network error:', error.message);
    }
    
    throw error;
  }
}

// Usage examples
async function createUserWithRetry(userData) {
  return safeApiCall(() => client.users.create(userData));
}

async function getUserWithRetry(userId) {
  return safeApiCall(() => client.users.get(userId));
}

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});`,
  },
];

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

export default function Examples() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedExample, setSelectedExample] = useState(examples[0].id);

  const copyToClipboard = (code: string, exampleId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(exampleId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const selectedExampleData = examples.find(ex => ex.id === selectedExample);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Code Examples</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Learn how to integrate Albedo AI into your applications with these practical examples. 
          Copy the code and adapt it to your needs.
        </p>
      </div>

      {/* Example Selector */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {examples.map((example) => (
          <Card 
            key={example.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedExample === example.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedExample(example.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{example.title}</CardTitle>
                <Badge className={difficultyColors[example.difficulty as keyof typeof difficultyColors]}>
                  {example.difficulty}
                </Badge>
              </div>
              <CardDescription>{example.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Code Display */}
      {selectedExampleData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {selectedExampleData.title}
                </CardTitle>
                <CardDescription>{selectedExampleData.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedExampleData.code, selectedExampleData.id)}
                >
                  {copiedCode === selectedExampleData.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copiedCode === selectedExampleData.id ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{selectedExampleData.code}</code>
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Alert>
        <ExternalLink className="h-4 w-4" />
        <AlertDescription>
          <strong>Need more examples?</strong> Check out our{' '}
          <a href="/docs/api" className="underline hover:no-underline">
            API Reference
          </a>{' '}
          for detailed endpoint documentation, or explore our{' '}
          <a href="/docs/sdks" className="underline hover:no-underline">
            SDK documentation
          </a>{' '}
          for language-specific guides.
        </AlertDescription>
      </Alert>
    </div>
  );
}
