# TokenBot Status Page

Public status page for TokenBot services, displaying real-time health status, uptime history, and incident communication.

## Features

- ✅ Real-time service health monitoring
- 📊 90-day uptime visualization
- 🚨 Incident management system (markdown-based)
- 🔄 Auto-refresh every 60 seconds
- 🌙 Dark mode support
- 📱 Mobile responsive design
- 🚀 Ready for Vercel deployment

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd status-page
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the status page.

### Build

```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Service URLs (with fallbacks to localhost)
SERVICE_REST_API_URL=https://api.tokenbot.com
SERVICE_GRAPHQL_URL=https://graphql.tokenbot.com
SERVICE_DASHBOARD_URL=https://app.tokenbot.com
SERVICE_MONITOR_URL=https://monitor.tokenbot.com
SERVICE_WEBHOOKS_URL=https://webhooks.tokenbot.com
SERVICE_MCP_URL=https://mcp.tokenbot.com
SERVICE_LANDING_URL=https://tokenbot.com

# Optional: Alert webhooks
SLACK_WEBHOOK_URL=
DISCORD_WEBHOOK_URL=
```

### Adding Services

Edit `lib/services.ts` to add or modify monitored services:

```typescript
export const services: ServiceConfig[] = [
  {
    id: 'my-service',
    name: 'My Service',
    description: 'Description of the service',
    healthUrl: 'https://my-service.com/health',
    group: 'api', // core | api | frontend | infrastructure
  },
  // ...
];
```

## Incident Management

### Creating an Incident

1. Create a markdown file in the `incidents/` directory
2. Use the naming format: `YYYY-MM-DD-slug.md`
3. Include frontmatter and updates

Example incident file:

```markdown
---
title: API Service Degradation
severity: major
affected: [REST API, GraphQL]
created: 2025-01-15T10:00:00Z
---

### 2025-01-15T10:30:00Z - Investigating

We are investigating reports of increased latency on API endpoints.

### 2025-01-15T11:00:00Z - Identified

Root cause identified as database connection issues.

### 2025-01-15T12:00:00Z - Resolved

The issue has been resolved. All services operating normally.
```

### Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Incident title |
| `severity` | `minor` \| `major` \| `critical` | Severity level |
| `affected` | string[] | List of affected services |
| `created` | ISO date | When the incident started |
| `resolved` | ISO date | When resolved (optional) |

### Status Types

- `investigating` - Initial discovery
- `identified` - Root cause found
- `monitoring` - Fix deployed, watching
- `resolved` - Issue resolved

## API Endpoints

### GET /api/status

Returns aggregated health status of all services.

```json
{
  "status": {
    "overall": "operational",
    "services": [...],
    "lastUpdated": "2025-01-15T12:00:00Z",
    "uptimePercentage": 100
  },
  "activeIncidents": []
}
```

### GET /api/health

Health check endpoint for the status page itself.

```json
{
  "status": "healthy",
  "service": "status-page",
  "version": "1.0.0",
  "timestamp": "2025-01-15T12:00:00Z"
}
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

The `vercel.json` includes:
- Cron job for health checks (every minute)
- No-cache headers for API routes
- Optimized region selection

### Domain Setup

Configure `status.tokenbot.com` in Vercel:
1. Go to Project Settings → Domains
2. Add `status.tokenbot.com`
3. Update DNS records as instructed

## Health Endpoint Format

All monitored services should return this format:

```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "service": "service-name",
  "version": "1.0.0",
  "timestamp": "2025-01-15T12:00:00Z",
  "uptime": 86400,
  "checks": {
    "database": "up",
    "cache": "up"
  }
}
```

## Project Structure

```
status-page/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main status page
│   ├── api/
│   │   ├── status/route.ts # Aggregated status API
│   │   └── health/route.ts # Health endpoint
│   └── incidents/
│       └── page.tsx        # Incident history
├── components/
│   ├── OverallStatus.tsx   # Status banner
│   ├── ServiceList.tsx     # Service grid
│   ├── StatusCard.tsx      # Service card
│   ├── UptimeBar.tsx       # 90-day uptime
│   └── IncidentFeed.tsx    # Incident timeline
├── lib/
│   ├── services.ts         # Service config
│   ├── health-checker.ts   # Health fetch logic
│   └── incidents.ts        # Incident parser
├── incidents/              # Incident markdown files
├── vercel.json            # Vercel config
└── README.md
```

## Future Improvements (V2)

- [ ] Email/webhook subscriptions
- [ ] RSS feed for incidents
- [ ] Historical uptime data persistence (Vercel KV)
- [ ] Scheduled maintenance announcements
- [ ] Multi-region health checks

## License

MIT
