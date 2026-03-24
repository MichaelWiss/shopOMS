# Architecture Overview

## System Context
This system is an OMS middleware that connects Shopify storefront operations with Odoo ERP workflows for Press & Co. It solves cross-system synchronization problems for orders, cancellations, inventory events, and fulfillment updates by validating incoming webhooks, processing sync logic asynchronously, and persisting operational state for auditability and retries.

## High-Level Architecture
```text
+--------------------+       Webhooks        +-------------------------------+
| Shopify            | ---------------------> | Next.js App Router            |
| - Storefront API   |                        | - API route handlers          |
| - Admin Webhooks   |                        | - Admin dashboard + actions   |
+--------------------+                        +---------------+---------------+
                                                              |
                                                              | Emits events
                                                              v
                                             +-------------------------------+
                                             | Inngest Functions             |
                                             | - order-sync                  |
                                             | - inventory-sync              |
                                             | - fulfillment-sync            |
                                             | - health-check + cleanup cron |
                                             +---------------+---------------+
                                                             / \
                                                            /   \
                                                           v     v
                                  +-------------------+          +-------------------------+
                                  | Supabase Postgres |          | Odoo ERP (XML-RPC)      |
                                  | - sync_events     |          | - sale.order            |
                                  | - order_mappings  |          | - res.partner           |
                                  | - admin_sessions  |          | - stock/product updates |
                                  | - rate_limit_*    |          +-------------------------+
                                  +-------------------+
```

This is a serverless event-driven architecture where Next.js acts as the application boundary, Inngest provides async orchestration and retry behavior, Supabase stores system state and audit trails, and Odoo is the downstream ERP system.

## Technology Stack
### Frontend
- Next.js 16.x (App Router) - Full-stack React framework for storefront and admin UI
- React 19.x - Component and rendering model
- TypeScript 5.x - Type safety
- Tailwind CSS 3.x - UI styling
- Testing Library - Component and DOM-level testing support

### Backend
- Next.js Route Handlers (Node.js runtime) - HTTP API endpoints and webhook intake
- Inngest 3.x - Async job orchestration, retries, and cron jobs
- Supabase PostgreSQL - Primary persistence for events, mappings, sessions, and rate-limit state
- xmlrpc 1.x - Odoo API transport layer
- Zod 3.x - Schema validation for payloads and environment configuration

### Infrastructure
- Docker (multi-stage Node 20-alpine build) - Containerization for portable runtime
- Vercel - Primary application hosting and runtime platform
- Supabase - Managed PostgreSQL and access control policies
- Inngest Cloud + local Inngest CLI - Workflow execution in production and development

## Core Components

### Webhook Intake Service
**Responsibility**: Receive Shopify webhook events, enforce security and request validation, and enqueue async processing work.
**Technology**: Next.js Route Handlers, HMAC verification, Zod validation.
**Interfaces**:
- POST /api/webhooks/orders/create
- POST /api/webhooks/orders/cancelled
- POST /api/webhooks/inventory/update

### Sync Orchestration Service
**Responsibility**: Execute sync workflows with retries, status transitions, and failure handling.
**Technology**: Inngest functions and steps.
**Interfaces**:
- Event: shop-oms/order.sync
- Event: shop-oms/inventory.sync
- Event: shop-oms/fulfillment.sync
- Cron: health-check (15-minute interval)
- Cron: retention-cleanup (daily)

### Odoo Integration Service
**Responsibility**: Translate synchronized operations into Odoo entities and updates.
**Technology**: xmlrpc client and domain modules for orders, partners, and products.
**Interfaces**:
- createSaleOrder(...)
- findOrderByShopifyId(...)
- cancelSaleOrder(...)
- findProductBySku(...)
- updateProductInventory(...)

### Sync Event Store
**Responsibility**: Persist event lifecycle, retry/error data, payload snapshots, and system mappings.
**Technology**: Supabase PostgreSQL.
**Interfaces**:
- sync_events table operations
- order_mappings table operations
- sync_stats view for aggregate reporting

### Admin Access and Session Service
**Responsibility**: Authenticate admin users and protect dashboard and sensitive APIs.
**Technology**: Cookie-based session token with SHA-256 hashed persistence in Supabase.
**Interfaces**:
- POST /api/auth/login
- POST /api/auth/logout
- Session validation in middleware for /admin/*

### Platform Guardrails Service
**Responsibility**: Enforce API access policy, rate limits, and alerting.
**Technology**: Middleware auth checks, per-key/IP rate limiting with Supabase durability, alert fan-out.
**Interfaces**:
- GET /api/health
- GET /api/sync/events
- GET /api/sync/stream
- sendAlert(...)
- rateLimiters.{webhook,login,api,storefront}

### Admin Live Stream Service
**Responsibility**: Deliver low-latency sync event updates to the admin dashboard without requiring a separate Supabase browser auth model.
**Technology**: Next.js Route Handler SSE endpoint, browser-native EventSource reconnect, client-side animation-frame batching, degraded polling fallback.
**Interfaces**:
- GET /api/sync/stream
- useSyncEventsLive(...)
- SyncEventsLive

## Data Model
High-level entity relationships:
- sync_events: canonical event log for each inbound/outbound synchronization operation.
- order_mappings: links Shopify order identifiers to Odoo order identifiers and sync status.
- admin_sessions: stores hashed admin session tokens and creation time.
- rate_limit_entries: stores distributed rate-limit counters and reset timestamps.

Relationship overview:
```text
Shopify webhook --> sync_events --(successful order sync)--> order_mappings
Admin login -----> admin_sessions
Incoming request -> rate_limit_entries
Admin dashboard -> reads sync_events + order_mappings + sync_stats
Admin dashboard -> subscribes to /api/sync/stream (SSE) -> falls back to /api/sync/events polling on disconnect
```

## Security Architecture
- Authentication: Admin session cookie flow with random token issuance and SHA-256 token-hash storage.
- Authorization: Middleware guards for admin routes and protected APIs using bearer token or x-api-key checks.
- Data encryption:
  - In transit: TLS provided by platform endpoints.
  - Secret handling: environment-driven secret validation and constant-time comparisons for critical values.
- API security:
  - HMAC webhook signature verification for Shopify webhooks.
  - Per-IP/per-key rate limiting with configurable windows.
  - Input validation with Zod schemas on critical payload boundaries.

## Scalability & Performance
- Horizontal runtime scaling through stateless Next.js route handlers and externalized state in Supabase.
- Async decoupling through Inngest to prevent webhook request paths from blocking on downstream ERP operations.
- Retry resilience through Inngest retry policies and explicit event status transitions.
- Database indexing for common event status and temporal query patterns.
- Distributed rate-limit durability via Supabase-backed rate_limit_entries with in-memory fast path.
- Admin live streaming uses browser-native SSE reconnect with a 3-second retry hint, animation-frame batched client merges, and a bounded 200-row retained window to prevent UI thrash and memory growth.
- Degraded-mode polling via `/api/sync/events` preserves admin visibility when SSE cannot remain connected.
- Multi-stage Docker builds to minimize production image size and startup overhead.
- Periodic retention cleanup to control event-table growth.

## Deployment Architecture
```text
Developer Machine
  |- npm run dev (Next.js)
  |- inngest-cli dev (workflow runtime)
  `- Supabase project (local/remote)

Production
  Shopify Webhooks
      |
      v
  Vercel-hosted Next.js app
      |
      +--> Inngest cloud functions
      |
      +--> Supabase PostgreSQL
      |
      `--> Odoo XML-RPC endpoint
```

Deployment model notes:
- Primary production hosting is Vercel.
- Docker image is available for containerized/self-hosted deployment paths.
- Secrets are injected through environment variables in each environment.

## Development Workflow
- Feature branches -> PR -> Review -> Merge to main.
- Local workflow:
  - npm install
  - cp .env.example .env.local
  - npm run db:push
  - npm run dev
  - npx inngest-cli@latest dev
- Testing workflow:
  - npm test (watch)
  - npm run test:run (single run)
  - npm run test:coverage
- CI/CD note: No repository-level .github/workflows pipeline is currently present; Vercel deployment automation provides production rollout.

## Monitoring & Observability
- Logs: Application logs emitted to console and captured by hosting platform logs.
- Metrics: Derived operational metrics from sync_events and sync_stats.
- Error tracking: Structured failure details in sync_events (error_message, stack, retry_count) and optional alert channels.
- Alerting and ops visibility:
  - Optional Slack webhook notifications.
  - Optional SendGrid email notifications.
  - Admin dashboard visibility for sync status, backlog, and retry actions.
  - Admin sync screen exposes stream state to operators: live, connecting, or degraded polling mode.
  - Protected health endpoint for service connectivity checks.

## Future Considerations
- Complete inventory sync with robust SKU/product mapping strategy.
- Expand fulfillment sync from logging to full Odoo delivery-order integration.
- Evaluate Supabase Realtime only if the admin auth model is redesigned to support secure browser subscriptions; current production path is SSE-first.
- Introduce explicit repository CI workflows for test/build checks on PRs.
- Add formal security headers baseline and hardening checklist for production.
- Add architecture decision records (ADR) for major integration and scaling choices.
