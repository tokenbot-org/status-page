'use client';

import { Incident, IncidentStatus, IncidentSeverity } from '@/lib/incidents';
import Link from 'next/link';

interface IncidentFeedProps {
  incidents: Incident[];
  showAll?: boolean;
}

const severityStyles: Record<IncidentSeverity, { border: string; badge: string; badgeBorder: string }> = {
  critical: {
    border: '#ef4444',
    badge: 'rgba(239, 68, 68, 0.1)',
    badgeBorder: 'rgba(239, 68, 68, 0.3)',
  },
  major: {
    border: '#f97316',
    badge: 'rgba(249, 115, 22, 0.1)',
    badgeBorder: 'rgba(249, 115, 22, 0.3)',
  },
  minor: {
    border: '#eab308',
    badge: 'rgba(234, 179, 8, 0.1)',
    badgeBorder: 'rgba(234, 179, 8, 0.3)',
  },
};

const statusStyles: Record<IncidentStatus, { bg: string; border: string; text: string }> = {
  investigating: {
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.3)',
    text: '#f97316',
  },
  identified: {
    bg: 'rgba(234, 179, 8, 0.1)',
    border: 'rgba(234, 179, 8, 0.3)',
    text: '#eab308',
  },
  monitoring: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#3b82f6',
  },
  resolved: {
    bg: 'rgba(34, 197, 94, 0.1)',
    border: 'rgba(34, 197, 94, 0.3)',
    text: '#22c55e',
  },
};

const statusLabels: Record<IncidentStatus, string> = {
  investigating: 'Investigating',
  identified: 'Identified',
  monitoring: 'Monitoring',
  resolved: 'Resolved',
};

export default function IncidentFeed({ incidents, showAll = false }: IncidentFeedProps) {
  const displayIncidents = showAll ? incidents : incidents.slice(0, 5);
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(isoString);
  };

  if (incidents.length === 0) {
    return (
      <div 
        className="rounded-xl p-8 text-center"
        style={{ 
          background: '#111111', 
          border: '1px solid #1f1f1f',
        }}
      >
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-medium text-white mb-1">No incidents reported</h3>
        <p style={{ color: '#888888' }}>All systems have been running smoothly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeIncidents.length > 0 && (
        <div 
          className="rounded-xl p-4 mb-6"
          style={{ 
            background: 'rgba(234, 179, 8, 0.1)', 
            border: '1px solid rgba(234, 179, 8, 0.3)',
          }}
        >
          <div className="flex items-center gap-2 font-medium" style={{ color: '#eab308' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {displayIncidents.map((incident) => {
        const severity = severityStyles[incident.severity] || severityStyles.minor;
        const status = statusStyles[incident.status];
        const latestUpdate = incident.updates[0];

        return (
          <div
            key={incident.id}
            className="rounded-xl overflow-hidden"
            style={{ 
              background: '#111111', 
              border: '1px solid #1f1f1f',
              borderLeft: `4px solid ${severity.border}`,
            }}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">{incident.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        background: status.bg, 
                        color: status.text,
                        border: `1px solid ${status.border}`,
                      }}
                    >
                      {statusLabels[incident.status]}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-medium capitalize"
                      style={{ 
                        background: severity.badge, 
                        color: severity.border,
                        border: `1px solid ${severity.badgeBorder}`,
                      }}
                    >
                      {incident.severity}
                    </span>
                    <span className="text-xs" style={{ color: '#555555' }}>
                      {formatRelativeTime(incident.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {incident.affectedServices.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {incident.affectedServices.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ 
                        background: '#1f1f1f', 
                        color: '#888888',
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              )}

              {latestUpdate && (
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid #1f1f1f' }}>
                  <p className="text-sm" style={{ color: '#888888' }}>{latestUpdate.message}</p>
                  <p className="text-xs mt-1" style={{ color: '#555555' }}>{formatDate(latestUpdate.timestamp)}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!showAll && incidents.length > 5 && (
        <Link
          href="/incidents"
          className="block text-center py-3 font-medium transition-colors"
          style={{ color: '#ffd60a' }}
        >
          View all {incidents.length} incidents →
        </Link>
      )}
    </div>
  );
}
