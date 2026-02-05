---
title: Increased API Latency
severity: minor
affected: [REST API, GraphQL]
created: 2025-01-15T10:30:00Z
resolved: 2025-01-15T11:45:00Z
---

### 2025-01-15T11:45:00Z - Resolved

The issue has been resolved. API response times are back to normal levels. We identified the root cause as a database connection pool exhaustion due to a traffic spike. We've increased the pool size to prevent future occurrences.

### 2025-01-15T11:15:00Z - Monitoring

A fix has been deployed. We are monitoring the situation to ensure stability.

### 2025-01-15T10:45:00Z - Identified

We've identified the issue as database connection pool exhaustion. Working on increasing capacity.

### 2025-01-15T10:30:00Z - Investigating

We are investigating reports of increased latency on the REST API and GraphQL endpoints. Some users may experience slower response times.
