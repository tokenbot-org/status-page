'use client';

import { useState } from 'react';

interface DayStatus {
  date: string;
  uptime: number; // 0-100
  incidents: number;
}

interface UptimeBarProps {
  serviceName: string;
  days: DayStatus[];
  totalUptime: number;
}

export default function UptimeBar({ serviceName, days, totalUptime }: UptimeBarProps) {
  const [hoveredDay, setHoveredDay] = useState<DayStatus | null>(null);

  const getBarColor = (uptime: number) => {
    if (uptime >= 99.9) return '#22c55e';
    if (uptime >= 99) return '#4ade80';
    if (uptime >= 95) return '#eab308';
    if (uptime >= 90) return '#f97316';
    return '#ef4444';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div 
      className="rounded-xl p-5"
      style={{ 
        background: '#111111', 
        border: '1px solid #1f1f1f',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-white">{serviceName}</h3>
        <span 
          className="text-sm font-medium"
          style={{ color: totalUptime >= 99 ? '#22c55e' : totalUptime >= 95 ? '#eab308' : '#ef4444' }}
        >
          {totalUptime.toFixed(2)}% uptime
        </span>
      </div>
      
      <div className="relative">
        <div className="flex gap-0.5">
          {days.map((day, index) => (
            <div
              key={index}
              className="flex-1 h-10 rounded cursor-pointer transition-all hover:opacity-80 hover:scale-y-105"
              style={{ 
                background: getBarColor(day.uptime),
                minWidth: '3px',
              }}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </div>
        
        {hoveredDay && (
          <div 
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-xs rounded-lg px-4 py-3 shadow-xl z-10"
            style={{ 
              background: '#1f1f1f', 
              border: '1px solid #2a2a2a',
            }}
          >
            <div className="font-medium text-white">{formatDate(hoveredDay.date)}</div>
            <div style={{ color: '#888888' }}>{hoveredDay.uptime.toFixed(2)}% uptime</div>
            {hoveredDay.incidents > 0 && (
              <div style={{ color: '#eab308' }}>{hoveredDay.incidents} incident(s)</div>
            )}
            <div 
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2.5 h-2.5"
              style={{ background: '#1f1f1f', borderRight: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a' }}
            />
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-3 text-xs" style={{ color: '#555555' }}>
        <span>90 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

// Generate mock uptime data for demo purposes
export function generateMockUptimeData(days: number = 90): DayStatus[] {
  const data: DayStatus[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic uptime (mostly 100%, occasional dips)
    const random = Math.random();
    let uptime = 100;
    let incidents = 0;
    
    if (random < 0.02) {
      // 2% chance of major incident
      uptime = 85 + Math.random() * 10;
      incidents = 1;
    } else if (random < 0.05) {
      // 3% chance of minor incident
      uptime = 95 + Math.random() * 4.5;
      incidents = 1;
    } else if (random < 0.1) {
      // 5% chance of brief degradation
      uptime = 99 + Math.random() * 0.9;
    }
    
    data.push({
      date: date.toISOString().split('T')[0],
      uptime: Math.round(uptime * 100) / 100,
      incidents,
    });
  }
  
  return data;
}

export function calculateTotalUptime(days: DayStatus[]): number {
  if (days.length === 0) return 100;
  const sum = days.reduce((acc, day) => acc + day.uptime, 0);
  return Math.round((sum / days.length) * 100) / 100;
}
