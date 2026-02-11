import { kv } from '@vercel/kv';

export interface DailyUptime {
  date: string;
  uptime: number;
  checks: number;
  failures: number;
}

/**
 * Check if Vercel KV is configured
 */
function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

/**
 * Record a health check result
 */
export async function recordCheck(isUp: boolean): Promise<DailyUptime | null> {
  if (!isKVConfigured()) {
    console.log('[uptime-store] KV not configured, skipping check recording');
    return null;
  }

  const today = new Date().toISOString().split('T')[0];
  const key = `uptime:${today}`;
  
  try {
    const current = await kv.get<DailyUptime>(key) || {
      date: today,
      uptime: 100,
      checks: 0,
      failures: 0,
    };
    
    current.checks++;
    if (!isUp) current.failures++;
    current.uptime = ((current.checks - current.failures) / current.checks) * 100;
    
    // 95 day TTL
    await kv.set(key, current, { ex: 60 * 60 * 24 * 95 });
    return current;
  } catch (error) {
    console.error('[uptime-store] Failed to record check:', error);
    return null;
  }
}

/**
 * Get uptime history for the specified number of days
 */
export async function getUptimeHistory(days: number = 90): Promise<DailyUptime[]> {
  const results: DailyUptime[] = [];
  const today = new Date();
  
  if (!isKVConfigured()) {
    console.log('[uptime-store] KV not configured, returning default uptime data');
    // Return default data when KV is not configured
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      results.push({ date: dateStr, uptime: 100, checks: 0, failures: 0 });
    }
    return results.reverse();
  }

  try {
    // Batch fetch keys for better performance
    const keys: string[] = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      keys.push(`uptime:${dateStr}`);
    }
    
    // Fetch all at once using mget
    const values = await kv.mget<DailyUptime[]>(...keys);
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      results.push(values[i] || { 
        date: dateStr, 
        uptime: 100, 
        checks: 0, 
        failures: 0 
      });
    }
    
    return results.reverse();
  } catch (error) {
    console.error('[uptime-store] Failed to get uptime history:', error);
    // Return default data on error
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      results.push({ date: dateStr, uptime: 100, checks: 0, failures: 0 });
    }
    return results.reverse();
  }
}

/**
 * Calculate total uptime percentage from history
 */
export function calculateUptimePercentage(history: DailyUptime[]): number {
  const withChecks = history.filter(d => d.checks > 0);
  if (withChecks.length === 0) return 100;
  
  const totalChecks = withChecks.reduce((sum, d) => sum + d.checks, 0);
  const totalFailures = withChecks.reduce((sum, d) => sum + d.failures, 0);
  
  return ((totalChecks - totalFailures) / totalChecks) * 100;
}
