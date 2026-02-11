import { NextResponse } from 'next/server';
import { getActiveIncidents, getScheduledMaintenance, getRecentIncidents } from '@/lib/incidents';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'active';
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    switch (type) {
      case 'active':
        const activeIncidents = await getActiveIncidents();
        return NextResponse.json({ incidents: activeIncidents });
      
      case 'maintenance':
        const maintenance = await getScheduledMaintenance();
        return NextResponse.json({ maintenance });
      
      case 'recent':
        const recentIncidents = await getRecentIncidents(limit);
        return NextResponse.json({ incidents: recentIncidents });
      
      case 'all':
        const [active, scheduled, recent] = await Promise.all([
          getActiveIncidents(),
          getScheduledMaintenance(),
          getRecentIncidents(limit),
        ]);
        return NextResponse.json({
          activeIncidents: active,
          scheduledMaintenance: scheduled,
          recentIncidents: recent,
        });
      
      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[incidents-api] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load incidents' },
      { status: 500 }
    );
  }
}
