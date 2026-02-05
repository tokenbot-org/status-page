'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import OverallStatus from '@/components/OverallStatus';
import ServiceList from '@/components/ServiceList';
import IncidentFeed from '@/components/IncidentFeed';
import UptimeBar, { generateMockUptimeData, calculateTotalUptime } from '@/components/UptimeBar';
import { ServiceStatus, ServiceHealth } from '@/lib/health-checker';
import { Incident } from '@/lib/incidents';

interface StatusResponse {
  overall: ServiceStatus;
  services: ServiceHealth[];
  lastUpdated: string;
}

const REFRESH_INTERVAL = 60000; // 60 seconds

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/status', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to fetch status');
      const result = await response.json();
      setStatus(result);
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

  // Mock incidents (will be replaced with real data)
  const activeIncidents: Incident[] = [];

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#ffd60a] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#888888]">Checking services...</p>
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
              <Image 
                src="/tokenbot-logo.svg" 
                alt="TokenBot" 
                width={40} 
                height={40}
                className="rounded-xl"
              />
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
                className="text-sm transition-colors hover:underline"
                style={{ color: '#ffd60a' }}
              >
                ← Back to TokenBot
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border" style={{ background: '#1a0d0d', borderColor: '#3d1f1f' }}>
            <p className="text-sm" style={{ color: '#ef4444' }}>
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}

        {/* Overall Status */}
        <OverallStatus 
          status={status?.overall || 'operational'} 
          uptimePercentage={totalUptime}
          lastUpdated={lastRefresh.toISOString()} 
        />

        {/* Active Incidents */}
        {activeIncidents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4">Active Incidents</h2>
            <IncidentFeed incidents={activeIncidents} />
          </div>
        )}

        {/* 90-Day Uptime */}
        <div className="mt-8">
          <UptimeBar 
            serviceName="All Systems"
            days={uptimeData}
            totalUptime={totalUptime}
          />
        </div>

        {/* Services by Group */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-white mb-4">Services</h2>
          <ServiceList services={status?.services || []} />
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center">
          <p className="text-sm" style={{ color: '#555555' }}>
            Last checked: {lastRefresh.toLocaleTimeString()} 
            {' • '}
            <button 
              onClick={fetchStatus}
              className="transition-colors hover:underline"
              style={{ color: '#888888' }}
            >
              Refresh now
            </button>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ background: '#0d0d0d', borderColor: '#1a1a1a' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image 
                src="/tokenbot-logo.svg" 
                alt="TokenBot" 
                width={24} 
                height={24}
              />
              <span className="text-sm" style={{ color: '#888888' }}>
                Powered by <span className="text-white">TokenBot</span>
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://tokenbot.com"
                className="text-sm transition-colors hover:text-white"
                style={{ color: '#888888' }}
              >
                Home
              </a>
              <a
                href="https://app.tokenbot.com"
                className="text-sm transition-colors hover:text-white"
                style={{ color: '#888888' }}
              >
                Dashboard
              </a>
              <a
                href="https://docs.tokenbot.com"
                className="text-sm transition-colors hover:text-white"
                style={{ color: '#888888' }}
              >
                Docs
              </a>
              <a
                href="/incidents"
                className="text-sm transition-colors hover:text-white"
                style={{ color: '#888888' }}
              >
                Incident History
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
