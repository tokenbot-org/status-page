'use client';

import { ServiceStatus } from '@/lib/health-checker';

interface OverallStatusProps {
  status: ServiceStatus;
  uptimePercentage: number;
  lastUpdated: string;
}

const statusConfig = {
  operational: {
    bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    text: 'All Systems Operational',
    icon: '✓',
    description: 'All services are running smoothly.',
    dotColor: '#22c55e',
  },
  degraded: {
    bg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
    text: 'Degraded Performance',
    icon: '⚠',
    description: 'Some services are experiencing issues.',
    dotColor: '#eab308',
  },
  outage: {
    bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    text: 'Service Outage',
    icon: '✕',
    description: 'One or more services are currently unavailable.',
    dotColor: '#ef4444',
  },
  unknown: {
    bg: 'linear-gradient(135deg, #555555 0%, #444444 100%)',
    text: 'Status Unknown',
    icon: '?',
    description: 'Unable to determine system status.',
    dotColor: '#555555',
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
    <div 
      className="rounded-xl p-8 text-white shadow-lg animate-fade-in"
      style={{ background: config.bg }}
    >
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{config.text}</h1>
              <span 
                className="w-3 h-3 rounded-full animate-pulse-dot"
                style={{ background: '#fff', boxShadow: `0 0 12px ${config.dotColor}` }}
              />
            </div>
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
