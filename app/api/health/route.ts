import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthResponse = {
    status: 'healthy',
    service: 'status-page',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      server: 'up',
    },
  };

  return NextResponse.json(healthResponse, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
