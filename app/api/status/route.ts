import { NextResponse } from 'next/server';
import { checkAllServices, SystemStatus } from '@/lib/health-checker';
import { getActiveIncidents, Incident } from '@/lib/incidents';

export interface StatusResponse {
  status: SystemStatus;
  activeIncidents: Incident[];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [status, activeIncidents] = await Promise.all([
      checkAllServices(),
      getActiveIncidents(),
    ]);

    const response: StatusResponse = {
      status,
      activeIncidents,
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}
