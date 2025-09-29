import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

const rateLimitTiers = [
  {
    name: 'Free',
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 10,
    price: '$0',
  },
  {
    name: 'Pro',
    requestsPerMinute: 300,
    requestsPerHour: 10000,
    requestsPerDay: 100000,
    burstLimit: 50,
    price: '$29/month',
  },
  {
    name: 'Business',
    requestsPerMinute: 1000,
    requestsPerHour: 50000,
    requestsPerDay: 500000,
    burstLimit: 100,
    price: '$99/month',
  },
  {
    name: 'Enterprise',
    requestsPerMinute: 5000,
    requestsPerHour: 200000,
    requestsPerDay: 2000000,
    burstLimit: 500,
    price: 'Custom',
  },
];

const rateLimitHeaders = [
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
  'X-RateLimit-Retry-After',
];

const errorCodes = [
  {
    code: 429,
    name: 'Too Many Requests',
    description: 'Rate limit exceeded',
    retryAfter: 'Yes',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    description: 'Temporary server overload',
    retryAfter: 'Yes',
  },
];

export default function RateLimits() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Rate Limits</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Understand our rate limiting policies and how to handle them in your applications. 
          Rate limits help ensure fair usage and system stability.
        </p>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Rate Limiting Overview
          </CardTitle>
          <CardDescription>
            How rate limiting works and what you need to know
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Rate limiting is applied per API key and resets every minute. When you exceed your rate limit, 
            you'll receive a 429 status code with information about when you can retry.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Rate Limit Windows</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Per minute: Primary limit</li>
                <li>• Per hour: Secondary limit</li>
                <li>• Per day: Daily limit</li>
                <li>• Burst: Short-term spike allowance</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Rate Limit Headers</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• X-RateLimit-Limit: Your limit</li>
                <li>• X-RateLimit-Remaining: Requests left</li>
                <li>• X-RateLimit-Reset: Reset timestamp</li>
                <li>• X-RateLimit-Retry-After: Seconds to wait</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limit Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Tiers</CardTitle>
          <CardDescription>
            Different rate limits based on your subscription plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Per Minute</TableHead>
                  <TableHead>Per Hour</TableHead>
                  <TableHead>Per Day</TableHead>
                  <TableHead>Burst Limit</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateLimitTiers.map((tier) => (
                  <TableRow key={tier.name}>
                    <TableCell className="font-medium">{tier.name}</TableCell>
                    <TableCell>{tier.requestsPerMinute.toLocaleString()}</TableCell>
                    <TableCell>{tier.requestsPerHour.toLocaleString()}</TableCell>
                    <TableCell>{tier.requestsPerDay.toLocaleString()}</TableCell>
                    <TableCell>{tier.burstLimit}</TableCell>
                    <TableCell>
                      <Badge variant={tier.name === 'Free' ? 'secondary' : 'default'}>
                        {tier.price}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limit Headers */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Headers</CardTitle>
          <CardDescription>
            HTTP headers included in API responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rateLimitHeaders.map((header) => (
              <div key={header} className="flex items-center justify-between p-3 border rounded-lg">
                <code className="font-mono text-sm">{header}</code>
                <Badge variant="outline">Response Header</Badge>
              </div>
            ))}
          </div>
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
            How to handle rate limit errors in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Retry After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorCodes.map((error) => (
                  <TableRow key={error.code}>
                    <TableCell className="font-mono">{error.code}</TableCell>
                    <TableCell>{error.name}</TableCell>
                    <TableCell>{error.description}</TableCell>
                    <TableCell>
                      <Badge variant={error.retryAfter === 'Yes' ? 'default' : 'secondary'}>
                        {error.retryAfter}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Best Practices
          </CardTitle>
          <CardDescription>
            Tips for working with rate limits effectively
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">Implementing Retry Logic</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Use exponential backoff for retries</li>
                <li>• Respect the Retry-After header</li>
                <li>• Implement jitter to avoid thundering herd</li>
                <li>• Set maximum retry attempts</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Monitoring Usage</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Track your API usage regularly</li>
                <li>• Set up alerts for high usage</li>
                <li>• Monitor rate limit headers</li>
                <li>• Consider upgrading your plan if needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Example Implementation
          </CardTitle>
          <CardDescription>
            JavaScript example showing how to handle rate limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code className="text-sm">{`// Rate limit handling example
async function makeApiCall(url, options = {}) {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Rate limited
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, retryCount) * 1000;
        
        console.log(\`Rate limited. Retrying after \${delay}ms...\`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retryCount++;
        continue;
      }
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      if (retryCount === maxRetries - 1) {
        throw error;
      }
      
      retryCount++;
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}`}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Alert */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Need higher rate limits?</strong> Contact our sales team to discuss 
          custom rate limits for your enterprise needs.
        </AlertDescription>
      </Alert>
    </div>
  );
}
