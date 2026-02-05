'use client';

import { Incident, IncidentStatus, IncidentSeverity } from '@/lib/incidents';
import Link from 'next/link';

interface IncidentFeedProps {
  incidents: Incident[];
  showAll?: boolean;
}

const severityStyles: Record<IncidentSeverity, { border: string; badge: string }> = {
  critical: {
    border: 'border-l-red-500',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  major: {
    border: 'border-l-orange-500',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
  minor: {
    border: 'border-l-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
};

const statusStyles: Record<IncidentStatus, string> = {
  investigating: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  identified: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  monitoring: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
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
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No incidents reported</h3>
        <p className="text-gray-500 dark:text-gray-400">All systems have been running smoothly.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeIncidents.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400 font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}
          </div>
        </div>
      )}

      {displayIncidents.map((incident) => {
        const severity = severityStyles[incident.severity] || severityStyles.minor;
        const latestUpdate = incident.updates[0];

        return (
          <div
            key={incident.id}
            className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 border-l-4 ${severity.border} overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{incident.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[incident.status]}`}>
                      {statusLabels[incident.status]}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${severity.badge}`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(incident.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {incident.affectedServices.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {incident.affectedServices.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              )}

              {latestUpdate && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{latestUpdate.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(latestUpdate.timestamp)}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {!showAll && incidents.length > 5 && (
        <Link
          href="/incidents"
          className="block text-center py-3 text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          View all {incidents.length} incidents →
        </Link>
      )}
    </div>
  );
}
