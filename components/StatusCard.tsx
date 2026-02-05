'use client';

import { ServiceHealth, ServiceStatus } from '@/lib/health-checker';

interface StatusCardProps {
  service: ServiceHealth;
}

const statusConfig: Record<ServiceStatus, { color: string; bgColor: string; label: string }> = {
  operational: { color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Operational' },
  degraded: { color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)', label: 'Degraded' },
  down: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Down' },
  unknown: { color: '#888888', bgColor: 'rgba(136, 136, 136, 0.1)', label: 'Unknown' },
};

export default function StatusCard({ service }: StatusCardProps) {
  const config = statusConfig[service.status] || statusConfig.unknown;

  return (
    <div 
      className="p-4 rounded-xl border transition-all hover:border-[#2a2a2a]"
      style={{ 
        background: '#111111',
        borderColor: '#1f1f1f',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Status indicator dot */}
            <span 
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 status-dot"
              style={{ 
                background: config.color,
                boxShadow: `0 0 8px ${config.color}`,
              }}
            />
            <h3 className="font-medium text-white truncate">{service.name}</h3>
          </div>
          <p className="text-sm mt-1 truncate" style={{ color: '#888888' }}>
            {service.description}
          </p>
        </div>
        
        <div className="flex flex-col items-end ml-4">
          <span 
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ 
              color: config.color,
              background: config.bgColor,
            }}
          >
            {config.label}
          </span>
          {service.latency !== undefined && (
            <span className="text-xs mt-2" style={{ color: '#555555' }}>
              {service.latency}ms
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
