// Incident system - loads and parses incident markdown files

import fs from 'fs';
import path from 'path';

export type IncidentSeverity = 'minor' | 'major' | 'critical';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface IncidentUpdate {
  timestamp: string;
  status: IncidentStatus;
  message: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedServices: string[];
  createdAt: string;
  resolvedAt: string | null;
  updates: IncidentUpdate[];
}

// Simple frontmatter parser
function parseFrontmatter(content: string): { data: Record<string, string | string[]>; body: string } {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { data: {}, body: content };
  }

  const frontmatter = match[1];
  const body = match[2];
  const data: Record<string, string | string[]> = {};

  for (const line of frontmatter.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      
      // Handle arrays (comma-separated)
      if (value.startsWith('[') && value.endsWith(']')) {
        data[key] = value.slice(1, -1).split(',').map(v => v.trim());
      } else {
        data[key] = value;
      }
    }
  }

  return { data, body };
}

// Parse updates from markdown body
function parseUpdates(body: string): IncidentUpdate[] {
  const updates: IncidentUpdate[] = [];
  const updateRegex = /### (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z?) - (\w+)\n([\s\S]*?)(?=### |$)/g;
  
  let match;
  while ((match = updateRegex.exec(body)) !== null) {
    updates.push({
      timestamp: match[1],
      status: match[2].toLowerCase() as IncidentStatus,
      message: match[3].trim(),
    });
  }

  return updates.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export async function loadIncidents(): Promise<Incident[]> {
  const incidentsDir = path.join(process.cwd(), 'incidents');
  
  // Create incidents directory if it doesn't exist
  if (!fs.existsSync(incidentsDir)) {
    fs.mkdirSync(incidentsDir, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(incidentsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse(); // Most recent first

  const incidents: Incident[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(incidentsDir, file), 'utf-8');
      const { data, body } = parseFrontmatter(content);
      
      const updates = parseUpdates(body);
      const latestUpdate = updates[0];

      incidents.push({
        id: file.replace('.md', ''),
        title: data.title as string || 'Untitled Incident',
        severity: (data.severity as IncidentSeverity) || 'minor',
        status: latestUpdate?.status || (data.status as IncidentStatus) || 'investigating',
        affectedServices: Array.isArray(data.affected) 
          ? data.affected 
          : (data.affected as string)?.split(',').map(s => s.trim()) || [],
        createdAt: data.created as string || new Date().toISOString(),
        resolvedAt: data.resolved as string || null,
        updates,
      });
    } catch (error) {
      console.error(`Error parsing incident file ${file}:`, error);
    }
  }

  return incidents;
}

export async function getActiveIncidents(): Promise<Incident[]> {
  const incidents = await loadIncidents();
  return incidents.filter(i => i.status !== 'resolved');
}

export async function getRecentIncidents(limit: number = 10): Promise<Incident[]> {
  const incidents = await loadIncidents();
  return incidents.slice(0, limit);
}

export function getSeverityColor(severity: IncidentSeverity): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'major':
      return 'orange';
    case 'minor':
      return 'yellow';
    default:
      return 'gray';
  }
}

export function getStatusBadgeColor(status: IncidentStatus): string {
  switch (status) {
    case 'resolved':
      return 'green';
    case 'monitoring':
      return 'blue';
    case 'identified':
      return 'yellow';
    case 'investigating':
      return 'orange';
    default:
      return 'gray';
  }
}
