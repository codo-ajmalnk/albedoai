import { useState } from 'react';
import { Copy, Check, Webhook, Shield, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const webhookEvents = [
  {
    name: 'user.created',
    description: 'Triggered when a new user is created',
    payload: {
      type: 'user.created',
      data: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Doe',
        created_at: '2024-01-15T10:30:00Z'
      }
    }
  },
  {
    name: 'user.updated',
    description: 'Triggered when a user is updated',
    payload: {
      type: 'user.updated',
      data: {
        id: 'user_123',
        email: 'user@example.com',
        name: 'John Smith',
        updated_at: '2024-01-15T11:30:00Z'
      }
    }
  },
  {
    name: 'user.deleted',
    description: 'Triggered when a user is deleted',
    payload: {
      type: 'user.deleted',
      data: {
        id: 'user_123',
        deleted_at: '2024-01-15T12:30:00Z'
      }
    }
  },
  {
    name: 'payment.succeeded',
    description: 'Triggered when a payment is successful',
    payload: {
      type: 'payment.succeeded',
      data: {
        id: 'payment_123',
        user_id: 'user_123',
        amount: 2999,
        currency: 'usd',
        created_at: '2024-01-15T10:30:00Z'
      }
    }
  },
  {
    name: 'payment.failed',
    description: 'Triggered when a payment fails',
    payload: {
      type: 'payment.failed',
      data: {
        id: 'payment_123',
        user_id: 'user_123',
        amount: 2999,
        currency: 'usd',
        failure_reason: 'insufficient_funds',
        created_at: '2024-01-15T10:30:00Z'
      }
    }
  }
];

const webhookExamples = {
  nodejs: `const express = require('express');
const crypto = require('crypto');

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
    case 'payment.succeeded':
      handlePaymentSucceeded(event.data);
      break;
    case 'payment.failed':
      handlePaymentFailed(event.data);
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
}

function handleUserUpdated(userData) {
  console.log('User updated:', userData);
  // Add your logic here
}

function handleUserDeleted(userData) {
  console.log('User deleted:', userData);
  // Add your logic here
}

function handlePaymentSucceeded(paymentData) {
  console.log('Payment succeeded:', paymentData);
  // Add your logic here
}

function handlePaymentFailed(paymentData) {
  console.log('Payment failed:', paymentData);
  // Add your logic here
}

app.listen(port, () => {
  console.log(\`Webhook server running on port \${port}\`);
});`,
  python: `from flask import Flask, request, jsonify
import hmac
import hashlib
import os

app = Flask(__name__)

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

@app.route('/webhooks/albedo', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Albedo-Signature')
    payload = request.get_data(as_text=True)
    secret = os.getenv('ALBEDO_WEBHOOK_SECRET')
    
    # Verify webhook signature
    if not verify_webhook_signature(payload, signature, secret):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.get_json()
    
    # Handle different event types
    if event['type'] == 'user.created':
        handle_user_created(event['data'])
    elif event['type'] == 'user.updated':
        handle_user_updated(event['data'])
    elif event['type'] == 'user.deleted':
        handle_user_deleted(event['data'])
    elif event['type'] == 'payment.succeeded':
        handle_payment_succeeded(event['data'])
    elif event['type'] == 'payment.failed':
        handle_payment_failed(event['data'])
    else:
        print(f"Unknown event type: {event['type']}")
    
    return jsonify({'received': True})

def handle_user_created(user_data):
    print(f"New user created: {user_data}")
    # Add your logic here

def handle_user_updated(user_data):
    print(f"User updated: {user_data}")
    # Add your logic here

def handle_user_deleted(user_data):
    print(f"User deleted: {user_data}")
    # Add your logic here

def handle_payment_succeeded(payment_data):
    print(f"Payment succeeded: {payment_data}")
    # Add your logic here

def handle_payment_failed(payment_data):
    print(f"Payment failed: {payment_data}")
    # Add your logic here

if __name__ == '__main__':
    app.run(debug=True)`,
  curl: `# Test webhook endpoint with curl
curl -X POST https://your-domain.com/webhooks/albedo \\
  -H "Content-Type: application/json" \\
  -H "X-Albedo-Signature: your-signature-here" \\
  -d '{
    "type": "user.created",
    "data": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-15T10:30:00Z"
    }
  }'`
};

export default function Webhooks() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, language: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(language);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Webhooks</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Receive real-time notifications about events in your Albedo AI account. 
          Webhooks allow you to build integrations that respond to changes instantly.
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Overview
          </CardTitle>
          <CardDescription>
            How webhooks work and what you need to know
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Webhooks are HTTP callbacks that are triggered by events in your Albedo AI account. 
            When an event occurs, we send a POST request to your specified URL with event data.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Security</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• HMAC-SHA256 signature verification</li>
                <li>• HTTPS required for production</li>
                <li>• Secret key authentication</li>
                <li>• IP whitelisting available</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Reliability</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic retries with exponential backoff</li>
                <li>• 3 retry attempts by default</li>
                <li>• Dead letter queue for failed deliveries</li>
                <li>• Webhook delivery logs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Events */}
      <Card>
        <CardHeader>
          <CardTitle>Available Events</CardTitle>
          <CardDescription>
            Events that can trigger webhooks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhookEvents.map((event) => (
              <div key={event.name} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{event.name}</h4>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </div>
                  <Badge variant="outline">Event</Badge>
                </div>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                  <code>{JSON.stringify(event.payload, null, 2)}</code>
                </pre>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Examples</CardTitle>
          <CardDescription>
            Code examples for handling webhooks in different languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="nodejs" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
            </TabsList>
            
            {Object.entries(webhookExamples).map(([language, code]) => (
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

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
          <CardDescription>
            Important security considerations for webhook implementations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">Signature Verification</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Always verify webhook signatures</li>
                <li>• Use constant-time comparison</li>
                <li>• Store webhook secret securely</li>
                <li>• Never trust unsigned webhooks</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">HTTPS & TLS</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Use HTTPS for all webhook endpoints</li>
                <li>• Validate SSL certificates</li>
                <li>• Use TLS 1.2 or higher</li>
                <li>• Consider IP whitelisting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Troubleshooting
          </CardTitle>
          <CardDescription>
            Common issues and how to resolve them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">Webhook Not Receiving Events</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Check that your endpoint is accessible via HTTPS</li>
                <li>• Verify that your endpoint returns a 2xx status code</li>
                <li>• Check your webhook delivery logs</li>
                <li>• Ensure your endpoint responds within 30 seconds</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Signature Verification Failing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure you're using the correct webhook secret</li>
                <li>• Verify you're computing the signature correctly</li>
                <li>• Check that you're using the raw request body</li>
                <li>• Make sure you're using HMAC-SHA256</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <strong>Need help with webhooks?</strong> Check out our{' '}
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
