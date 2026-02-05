// Health checker that works client-side

export type ServiceStatus = 'operational' | 'degraded' | 'down' | 'unknown';

export interface ServiceHealth {
  id: string;
  name: string;
  description: string;
  status: ServiceStatus;
  latency?: number;
  lastCheck: string;
  group: string;
}

export interface SystemStatus {
  overall: ServiceStatus;
  services: ServiceHealth[];
  lastUpdated: string;
}

// Service configuration with production URLs
export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  healthUrl: string;
  group: string;
}

// Production service URLs - these should match your deployed services
export const services: ServiceConfig[] = [
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'External API for trading bot management',
    healthUrl: 'https://rest-api.tokenbot.com/v1/health',
    group: 'API Services',
  },
  {
    id: 'graphql',
    name: 'GraphQL API',
    description: 'GraphQL backend for dashboards',
    healthUrl: 'https://gql-api.tokenbot.com/health',
    group: 'API Services',
  },
  {
    id: 'dashboard',
    name: 'User Dashboard',
    description: 'Web application for users',
    healthUrl: 'https://app.tokenbot.com/api/health',
    group: 'Frontend',
  },
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    description: 'Admin panel for management',
    healthUrl: 'https://admin.tokenbot.com/api/health',
    group: 'Frontend',
  },
  {
    id: 'webhooks',
    name: 'Webhooks Service',
    description: 'Webhook delivery service',
    healthUrl: 'https://webhooks.tokenbot.com/health',
    group: 'Core Services',
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Marketing website',
    healthUrl: 'https://tokenbot.com',
    group: 'Frontend',
  },
];

// Check health of a single service
async function checkServiceHealth(service: ServiceConfig): Promise<ServiceHealth> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(service.healthUrl, {
      method: 'GET',
      signal: controller.signal,
      mode: 'cors',
      cache: 'no-store',
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        status: 'operational',
        latency,
        lastCheck: new Date().toISOString(),
        group: service.group,
      };
    } else {
      return {
        id: service.id,
        name: service.name,
        description: service.description,
        status: response.status >= 500 ? 'down' : 'degraded',
        latency,
        lastCheck: new Date().toISOString(),
        group: service.group,
      };
    }
  } catch (error) {
    // CORS errors or network failures
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      status: 'unknown',
      lastCheck: new Date().toISOString(),
      group: service.group,
    };
  }
}

// Check all services
export async function checkAllServices(): Promise<SystemStatus> {
  const results = await Promise.all(services.map(checkServiceHealth));
  
  // Determine overall status
  const hasDown = results.some(s => s.status === 'down');
  const hasDegraded = results.some(s => s.status === 'degraded');
  const allUnknown = results.every(s => s.status === 'unknown');
  
  let overall: ServiceStatus = 'operational';
  if (hasDown) overall = 'down';
  else if (hasDegraded) overall = 'degraded';
  else if (allUnknown) overall = 'unknown';
  
  return {
    overall,
    services: results,
    lastUpdated: new Date().toISOString(),
  };
}

// Demo data for when real checks aren't available
export function getDemoStatus(): SystemStatus {
  return {
    overall: 'operational',
    services: services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      status: 'operational' as ServiceStatus,
      latency: Math.floor(Math.random() * 100) + 20,
      lastCheck: new Date().toISOString(),
      group: s.group,
    })),
    lastUpdated: new Date().toISOString(),
  };
}
