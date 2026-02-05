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
    if (uptime >= 99.9) return 'bg-green-500';
    if (uptime >= 99) return 'bg-green-400';
    if (uptime >= 95) return 'bg-yellow-500';
    if (uptime >= 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 dark:text-white">{serviceName}</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalUptime.toFixed(2)}% uptime
        </span>
      </div>
      
      <div className="relative">
        <div className="flex gap-0.5">
          {days.map((day, index) => (
            <div
              key={index}
              className={`flex-1 h-8 rounded-sm ${getBarColor(day.uptime)} cursor-pointer hover:opacity-80 transition-opacity`}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </div>
        
        {hoveredDay && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg z-10">
            <div className="font-medium">{formatDate(hoveredDay.date)}</div>
            <div>{hoveredDay.uptime.toFixed(2)}% uptime</div>
            {hoveredDay.incidents > 0 && (
              <div className="text-yellow-400">{hoveredDay.incidents} incident(s)</div>
            )}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-gray-400">
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
