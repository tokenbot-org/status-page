'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import OverallStatus from '@/components/OverallStatus';
import ServiceList from '@/components/ServiceList';
import IncidentFeed from '@/components/IncidentFeed';
import UptimeBar, { calculateTotalUptime } from '@/components/UptimeBar';
import { ServiceStatus, ServiceHealth } from '@/lib/health-checker';
import { Incident } from '@/lib/incidents';
import { DailyUptime } from '@/lib/uptime-store';

interface StatusResponse {
  overall: ServiceStatus;
  services: ServiceHealth[];
  lastUpdated: string;
}

interface UptimeResponse {
  days: DailyUptime[];
  totalUptime: number;
  period: number;
}

interface IncidentsResponse {
  activeIncidents: Incident[];
  scheduledMaintenance: Incident[];
  recentIncidents: Incident[];
}

const REFRESH_INTERVAL = 60000; // 60 seconds

// Helper to format countdown
function formatCountdown(scheduledStart: string): string {
  const now = new Date();
  const start = new Date(scheduledStart);
  const diff = start.getTime() - now.getTime();
  
  if (diff < 0) return 'In Progress';
  
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
  const days = Math.floor(diff / 1000 / 60 / 60 / 24);
  
  if (days > 0) return `in ${days}d ${hours}h`;
  if (hours > 0) return `in ${hours}h ${minutes}m`;
  return `in ${minutes}m`;
}

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [incidents, setIncidents] = useState<IncidentsResponse | null>(null);
  const [uptimeData, setUptimeData] = useState<UptimeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [statusRes, incidentsRes, uptimeRes] = await Promise.all([
        fetch('/api/status', { cache: 'no-store' }),
        fetch('/api/incidents?type=all', { cache: 'no-store' }),
        fetch('/api/uptime?days=90', { cache: 'no-store' }),
      ]);
      
      if (!statusRes.ok) throw new Error('Failed to fetch status');
      
      const statusData = await statusRes.json();
      setStatus(statusData);
      
      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setIncidents(incidentsData);
      }
      
      if (uptimeRes.ok) {
        const uptimeResult = await uptimeRes.json();
        setUptimeData(uptimeResult);
      }
      
      setError(null);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate uptime - use API data if available, otherwise default to 100%
  const totalUptime = uptimeData?.totalUptime ?? 100;
  
  // Convert uptime data to the format expected by UptimeBar
  const uptimeDays = uptimeData?.days.map(d => ({
    date: d.date,
    uptime: d.uptime,
    incidents: d.failures > 0 ? 1 : 0,
  })) ?? [];

  // Get active incidents and scheduled maintenance
  const activeIncidents = incidents?.activeIncidents ?? [];
  const scheduledMaintenance = incidents?.scheduledMaintenance ?? [];

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
                onClick={fetchData}
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

        {/* Scheduled Maintenance */}
        {scheduledMaintenance.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scheduled Maintenance
            </h2>
            <div className="space-y-4">
              {scheduledMaintenance.map((maintenance) => (
                <div 
                  key={maintenance.id}
                  className="p-4 rounded-xl border"
                  style={{ background: '#0d1a2d', borderColor: '#1e3a5f' }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-white">{maintenance.title}</h3>
                      {maintenance.scheduledStart && (
                        <p className="text-sm mt-1" style={{ color: '#3b82f6' }}>
                          Starts {formatCountdown(maintenance.scheduledStart)}
                          {' • '}
                          {new Date(maintenance.scheduledStart).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                      {maintenance.affectedServices.length > 0 && (
                        <p className="text-xs mt-2" style={{ color: '#888888' }}>
                          Affected: {maintenance.affectedServices.join(', ')}
                        </p>
                      )}
                    </div>
                    <span 
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ background: '#1e3a5f', color: '#60a5fa' }}
                    >
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
            days={uptimeDays.length > 0 ? uptimeDays : Array.from({ length: 90 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (89 - i));
              return { date: date.toISOString().split('T')[0], uptime: 100, incidents: 0 };
            })}
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
              onClick={fetchData}
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
