import { NextResponse } from 'next/server';
import { getUptimeHistory, calculateUptimePercentage } from '@/lib/uptime-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '90', 10);
  
  // Limit to 365 days max
  const limitedDays = Math.min(Math.max(days, 1), 365);

  try {
    const history = await getUptimeHistory(limitedDays);
    const totalUptime = calculateUptimePercentage(history);
    
    return NextResponse.json({
      days: history,
      totalUptime: Math.round(totalUptime * 100) / 100,
      period: limitedDays,
    });
  } catch (error) {
    console.error('[uptime-api] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load uptime data' },
      { status: 500 }
    );
  }
}
