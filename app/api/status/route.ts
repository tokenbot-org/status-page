import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type ServiceStatus = 'operational' | 'degraded' | 'down' | 'unknown';

interface ServiceHealth {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  latency?: number;
  lastCheck: string;
  group: string;
  error?: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  healthUrl: string;
  group: string;
}

// Production service URLs
const services: ServiceConfig[] = [
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'External API for trading bot management',
    healthUrl: process.env.REST_API_HEALTH_URL || 'https://rest-api.tokenbot.com/v1/health',
    group: 'API Services',
  },
  {
    id: 'graphql',
    name: 'GraphQL API',
    description: 'GraphQL backend for dashboards',
    healthUrl: process.env.GRAPHQL_HEALTH_URL || 'https://gql-api.tokenbot.com/health',
    group: 'API Services',
  },
  {
    id: 'dashboard',
    name: 'User Dashboard',
    description: 'Web application for users',
    healthUrl: process.env.DASHBOARD_HEALTH_URL || 'https://app.tokenbot.com/api/health',
    group: 'Frontend',
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Admin panel for management',
    healthUrl: process.env.ADMIN_HEALTH_URL || 'https://admin.tokenbot.com/api/health',
    group: 'Frontend',
  },
  {
    id: 'webhooks',
    name: 'Webhooks Service',
    description: 'Webhook delivery service',
    healthUrl: process.env.WEBHOOKS_HEALTH_URL || 'https://webhooks.tokenbot.com/health',
    group: 'Core Services',
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Marketing website',
    healthUrl: process.env.LANDING_HEALTH_URL || 'https://tokenbot.com',
    group: 'Frontend',
  },
];

async function checkService(service: ServiceConfig): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(service.healthUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'TokenBot-StatusPage/1.0',
      },
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    let status: ServiceStatus = 'operational';
    if (!response.ok) {
      status = response.status >= 500 ? 'down' : 'degraded';
    }
    
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      status,
      latency,
      lastCheck: new Date().toISOString(),
      group: service.group,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      status: errorMessage.includes('abort') ? 'down' : 'unknown',
      latency,
      lastCheck: new Date().toISOString(),
      group: service.group,
      error: errorMessage,
    };
  }
}

export async function GET() {
  try {
    const results = await Promise.all(services.map(checkService));
    
    // Determine overall status
    const hasDown = results.some(s => s.status === 'down');
    const hasDegraded = results.some(s => s.status === 'degraded');
    
    let overall: ServiceStatus = 'operational';
    if (hasDown) overall = 'down';
    else if (hasDegraded) overall = 'degraded';
    
    return NextResponse.json({
      overall,
      services: results,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check services' },
      { status: 500 }
    );
  }
}
