'use client';

import { ServiceHealth, ServiceStatus } from '@/lib/health-checker';

interface StatusCardProps {
  service: ServiceHealth;
}

const statusStyles: Record<ServiceStatus, { dot: string; bg: string; text: string }> = {
  operational: {
    dot: 'bg-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
  },
  degraded: {
    dot: 'bg-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
  },
  outage: {
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
  },
  unknown: {
    dot: 'bg-gray-400',
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
  },
};

const statusLabels: Record<ServiceStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  outage: 'Outage',
  unknown: 'Unknown',
};

export default function StatusCard({ service }: StatusCardProps) {
  const style = statusStyles[service.status] || statusStyles.unknown;
  
  const formatLatency = (ms: number | null) => {
    if (ms === null) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${style.dot} animate-pulse`} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
          {statusLabels[service.status]}
        </span>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatLatency(service.latency)}</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Last check: {formatTime(service.lastChecked)}</span>
        </div>
      </div>

      {service.error && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
          {service.error}
        </div>
      )}
    </div>
  );
}
