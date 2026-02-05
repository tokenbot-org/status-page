// Service configuration for health checks

export interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  healthUrl: string;
  group: 'core' | 'api' | 'frontend' | 'infrastructure';
}

// Environment variables with localhost fallbacks for development
const getEnvUrl = (envVar: string, fallback: string): string => {
  return process.env[envVar] || fallback;
};

export const services: ServiceConfig[] = [
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'Main TokenBot REST API for token operations',
    healthUrl: `${getEnvUrl('SERVICE_REST_API_URL', 'http://localhost:3001')}/v1/health`,
    group: 'api',
  },
  {
    id: 'graphql',
    name: 'GraphQL API',
    description: 'GraphQL API for advanced queries and subscriptions',
    healthUrl: `${getEnvUrl('SERVICE_GRAPHQL_URL', 'http://localhost:4000')}/health`,
    group: 'api',
  },
  {
    id: 'dashboard',
    name: 'User Dashboard',
    description: 'Web application for managing tokens and settings',
    healthUrl: `${getEnvUrl('SERVICE_DASHBOARD_URL', 'http://localhost:3000')}/api/health`,
    group: 'frontend',
  },
  {
    id: 'monitor-v2',
    name: 'Monitor V2',
    description: 'Real-time blockchain monitoring service',
    healthUrl: `${getEnvUrl('SERVICE_MONITOR_URL', 'http://localhost:3002')}/health`,
    group: 'core',
  },
  {
    id: 'webhooks',
    name: 'Webhooks Service',
    description: 'Webhook delivery and management service',
    healthUrl: `${getEnvUrl('SERVICE_WEBHOOKS_URL', 'http://localhost:3003')}/health`,
    group: 'core',
  },
  {
    id: 'mcp-server',
    name: 'MCP Server',
    description: 'Message Control Protocol server for integrations',
    healthUrl: `${getEnvUrl('SERVICE_MCP_URL', 'http://localhost:3004')}/health`,
    group: 'infrastructure',
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Public marketing website',
    healthUrl: `${getEnvUrl('SERVICE_LANDING_URL', 'http://localhost:3005')}/api/health`,
    group: 'frontend',
  },
];

export const serviceGroups = {
  core: { name: 'Core Services', order: 1 },
  api: { name: 'API Services', order: 2 },
  frontend: { name: 'Frontend', order: 3 },
  infrastructure: { name: 'Infrastructure', order: 4 },
};

export function getServicesByGroup(): Record<string, ServiceConfig[]> {
  const grouped: Record<string, ServiceConfig[]> = {};
  
  for (const service of services) {
    if (!grouped[service.group]) {
      grouped[service.group] = [];
    }
    grouped[service.group].push(service);
  }
  
  return grouped;
}
