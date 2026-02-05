'use client';

import { ServiceHealth, ServiceStatus } from '@/lib/health-checker';

interface StatusCardProps {
  service: ServiceHealth;
}

const statusStyles: Record<ServiceStatus, { dot: string; bg: string; text: string; border: string }> = {
  operational: {
    dot: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.1)',
    text: '#22c55e',
    border: 'rgba(34, 197, 94, 0.3)',
  },
  degraded: {
    dot: '#eab308',
    bg: 'rgba(234, 179, 8, 0.1)',
    text: '#eab308',
    border: 'rgba(234, 179, 8, 0.3)',
  },
  outage: {
    dot: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  unknown: {
    dot: '#555555',
    bg: 'rgba(85, 85, 85, 0.1)',
    text: '#888888',
    border: 'rgba(85, 85, 85, 0.3)',
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
    <div 
      className="rounded-xl p-4 card-hover"
      style={{ 
        background: '#111111', 
        border: '1px solid #1f1f1f',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-3 h-3 rounded-full animate-pulse-dot"
            style={{ 
              background: style.dot,
              boxShadow: `0 0 8px ${style.dot}`,
            }} 
          />
          <div>
            <h3 className="font-semibold text-white">{service.name}</h3>
            <p className="text-sm" style={{ color: '#888888' }}>{service.description}</p>
          </div>
        </div>
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            background: style.bg, 
            color: style.text,
            border: `1px solid ${style.border}`,
          }}
        >
          {statusLabels[service.status]}
        </span>
      </div>
      
      <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: '#555555' }}>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{formatLatency(service.latency)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Last check: {formatTime(service.lastChecked)}</span>
        </div>
      </div>

      {service.error && (
        <div 
          className="mt-3 p-3 rounded-lg text-sm"
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {service.error}
        </div>
      )}
    </div>
  );
}
