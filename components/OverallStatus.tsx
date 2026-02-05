'use client';

import { ServiceStatus } from '@/lib/health-checker';

interface OverallStatusProps {
  status: ServiceStatus;
  uptimePercentage: number;
  lastUpdated: string;
}

const statusConfig = {
  operational: {
    bg: 'bg-green-500',
    text: 'All Systems Operational',
    icon: '✓',
    description: 'All services are running smoothly.',
  },
  degraded: {
    bg: 'bg-yellow-500',
    text: 'Degraded Performance',
    icon: '⚠',
    description: 'Some services are experiencing issues.',
  },
  outage: {
    bg: 'bg-red-500',
    text: 'Service Outage',
    icon: '✕',
    description: 'One or more services are currently unavailable.',
  },
  unknown: {
    bg: 'bg-gray-500',
    text: 'Status Unknown',
    icon: '?',
    description: 'Unable to determine system status.',
  },
};

export default function OverallStatus({ status, uptimePercentage, lastUpdated }: OverallStatusProps) {
  const config = statusConfig[status] || statusConfig.unknown;
  
  const formattedTime = new Date(lastUpdated).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return (
    <div className={`${config.bg} rounded-xl p-8 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
            {config.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{config.text}</h1>
            <p className="text-white/80 mt-1">{config.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{uptimePercentage}%</div>
          <div className="text-white/80 text-sm">Current Uptime</div>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-white/20 text-sm text-white/70">
        Last updated: {formattedTime}
      </div>
    </div>
  );
}
