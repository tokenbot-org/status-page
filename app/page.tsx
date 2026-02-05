'use client';

import { useEffect, useState, useCallback } from 'react';
import OverallStatus from '@/components/OverallStatus';
import ServiceList from '@/components/ServiceList';
import IncidentFeed from '@/components/IncidentFeed';
import UptimeBar, { generateMockUptimeData, calculateTotalUptime } from '@/components/UptimeBar';
import { SystemStatus } from '@/lib/health-checker';
import { Incident } from '@/lib/incidents';

interface StatusData {
  status: SystemStatus;
  activeIncidents: Incident[];
}

const REFRESH_INTERVAL = 60000; // 60 seconds

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/status', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch status');
      const result = await response.json();
      setData(result);
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Generate mock uptime data for demonstration
  const uptimeData = generateMockUptimeData(90);
  const totalUptime = calculateTotalUptime(uptimeData);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">TokenBot Status</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">System Status Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <a
                href="https://tokenbot.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Back to TokenBot
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error loading status: {error}</span>
            </div>
          </div>
        )}

        {/* Overall Status Banner */}
        {data && (
          <OverallStatus
            status={data.status.overall}
            uptimePercentage={data.status.uptimePercentage}
            lastUpdated={data.status.lastUpdated}
          />
        )}

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Services</h2>
              {data && <ServiceList services={data.status.services} />}
            </div>

            {/* Uptime History */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">90-Day Uptime</h2>
              <UptimeBar
                serviceName="All Services"
                days={uptimeData}
                totalUptime={totalUptime}
              />
            </div>
          </div>

          {/* Incidents Column */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h2>
            {data && <IncidentFeed incidents={data.activeIncidents} />}
          </div>
        </div>

        {/* Footer Info */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Auto-refreshes every 60 seconds • Last refresh: {lastRefresh.toLocaleTimeString()}
          </p>
          <p className="mt-2">
            <a href="/incidents" className="text-blue-600 dark:text-blue-400 hover:underline">
              View incident history
            </a>
            {' • '}
            <a href="/api/status" className="text-blue-600 dark:text-blue-400 hover:underline">
              API
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
