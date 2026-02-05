// Health checker utility for fetching service health

import { services, ServiceConfig } from './services';

export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'unknown';

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  service?: string;
  version?: string;
  timestamp?: string;
  uptime?: number;
  checks?: Record<string, 'up' | 'down'>;
}

export interface ServiceHealth {
  serviceId: string;
  name: string;
  description: string;
  group: string;
  status: ServiceStatus;
  latency: number | null;
  lastChecked: string;
  healthData: HealthCheck | null;
  error: string | null;
}

export interface SystemStatus {
  overall: ServiceStatus;
  services: ServiceHealth[];
  lastUpdated: string;
  uptimePercentage: number;
}

const TIMEOUT_MS = 10000; // 10 second timeout

async function checkServiceHealth(service: ServiceConfig): Promise<ServiceHealth> {
  const startTime = Date.now();
  const lastChecked = new Date().toISOString();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(service.healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;

    if (!response.ok) {
      return {
        serviceId: service.id,
        name: service.name,
        description: service.description,
        group: service.group,
        status: 'outage',
        latency,
        lastChecked,
        healthData: null,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const healthData: HealthCheck = await response.json();
    
    // Map health status to our status
    let status: ServiceStatus = 'operational';
    if (healthData.status === 'degraded') {
      status = 'degraded';
    } else if (healthData.status === 'unhealthy') {
      status = 'outage';
    }

    return {
      serviceId: service.id,
      name: service.name,
      description: service.description,
      group: service.group,
      status,
      latency,
      lastChecked,
      healthData,
      error: null,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      serviceId: service.id,
      name: service.name,
      description: service.description,
      group: service.group,
      status: 'outage',
      latency: latency < TIMEOUT_MS ? latency : null,
      lastChecked,
      healthData: null,
      error: errorMessage.includes('abort') ? 'Request timeout' : errorMessage,
    };
  }
}

export async function checkAllServices(): Promise<SystemStatus> {
  const healthChecks = await Promise.all(
    services.map(service => checkServiceHealth(service))
  );

  // Calculate overall status
  const statuses = healthChecks.map(h => h.status);
  let overall: ServiceStatus = 'operational';
  
  if (statuses.some(s => s === 'outage')) {
    overall = statuses.every(s => s === 'outage') ? 'outage' : 'degraded';
  } else if (statuses.some(s => s === 'degraded')) {
    overall = 'degraded';
  }

  // Calculate uptime percentage (operational services)
  const operationalCount = statuses.filter(s => s === 'operational').length;
  const uptimePercentage = Math.round((operationalCount / statuses.length) * 100);

  return {
    overall,
    services: healthChecks,
    lastUpdated: new Date().toISOString(),
    uptimePercentage,
  };
}

export function getStatusColor(status: ServiceStatus): string {
  switch (status) {
    case 'operational':
      return 'green';
    case 'degraded':
      return 'yellow';
    case 'outage':
      return 'red';
    default:
      return 'gray';
  }
}

export function getStatusLabel(status: ServiceStatus): string {
  switch (status) {
    case 'operational':
      return 'Operational';
    case 'degraded':
      return 'Degraded Performance';
    case 'outage':
      return 'Outage';
    default:
      return 'Unknown';
  }
}
