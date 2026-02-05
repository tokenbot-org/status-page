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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#ffd60a] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#888888]">Loading status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="border-b" style={{ background: '#0d0d0d', borderColor: '#1a1a1a' }}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ffd60a' }}>
                <span className="text-black font-bold text-lg">TB</span>
              </div>
              <div>
                <h1 className="font-semibold text-white text-lg">
                  Token<span style={{ color: '#ffd60a' }}>Bot</span> Status
                </h1>
                <p className="text-xs" style={{ color: '#555555' }}>System Status Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={fetchStatus}
                disabled={loading}
                className="p-2 rounded-lg transition-colors disabled:opacity-50 hover:bg-[#1f1f1f]"
                style={{ color: '#888888' }}
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
                className="text-sm transition-colors link-underline"
                style={{ color: '#ffd60a' }}
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
          <div className="rounded-xl p-4" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div className="flex items-center gap-2" style={{ color: '#ef4444' }}>
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
              <h2 className="text-xl font-semibold text-white mb-4">Services</h2>
              {data && <ServiceList services={data.status.services} />}
            </div>

            {/* Uptime History */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">90-Day Uptime</h2>
              <UptimeBar
                serviceName="All Services"
                days={uptimeData}
                totalUptime={totalUptime}
              />
            </div>
          </div>

          {/* Incidents Column */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Incidents</h2>
            {data && <IncidentFeed incidents={data.activeIncidents} />}
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t text-center text-sm" style={{ borderColor: '#1f1f1f', color: '#555555' }}>
          <p>
            Auto-refreshes every 60 seconds • Last refresh: {lastRefresh.toLocaleTimeString()}
          </p>
          <p className="mt-2">
            <a href="/incidents" className="transition-colors hover:text-[#ffd60a]" style={{ color: '#888888' }}>
              View incident history
            </a>
            {' • '}
            <a href="/api/status" className="transition-colors hover:text-[#ffd60a]" style={{ color: '#888888' }}>
              API
            </a>
          </p>
          <p className="mt-4 text-xs" style={{ color: '#555555' }}>
            Powered by <span style={{ color: '#ffd60a' }}>TokenBot</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
