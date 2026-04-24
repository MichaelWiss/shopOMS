# shopOMS — Shopify Order Management System

A middleware OMS connecting a headless **Shopify** storefront to **Odoo** ERP for Press & Co, a bespoke letterpress business card company.

## Architecture

```
┌─────────────────┐     Webhooks      ┌─────────────────┐
│     Shopify      │ ───────────────▶ │   Next.js App   │
│   (Storefront)   │                  │  /api/webhooks   │
└─────────────────┘                   └────────┬────────┘
                                               │
                                               ▼
┌─────────────────┐                   ┌─────────────────┐
│    Supabase      │ ◀──── Logs ───── │    Inngest       │
│  (Event Logs)    │                  │  (Job Queue)     │
└─────────────────┘                   └────────┬────────┘
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │      Odoo        │
                                      │     (ERP)        │
                                      └─────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Storefront | Next.js 16 (App Router) | Headless commerce frontend |
| API | Next.js API Routes | Webhook handlers, auth, health checks |
| Queue | Inngest | Serverless job queue with retries |
| Database | Supabase (PostgreSQL) | Sync event logs, order mappings |
| ERP | Odoo (XML-RPC) | Order management, inventory, customers |
| Hosting | Vercel | Production deployment |

## Features

### Storefront
- [x] Product listing via Shopify Storefront API
- [x] Product detail pages with variants
- [x] Cart management (add, update, remove)
- [x] Shopify Checkout integration
- [x] Static pages (About, FAQ, Shipping, Privacy, Terms, Contact)

### Middleware
- [x] Webhook receiver (orders/create, orders/cancelled, inventory/update)
- [x] HMAC-SHA256 webhook signature verification
- [x] Data transformation (Shopify → Odoo format)
- [x] Retry logic (built into Inngest, 3–5 retries per function)
- [x] Rate limiting on webhooks, login, and API endpoints
- [x] Order customization extraction (line item properties → Odoo notes)

### Integrations
- [x] Odoo order creation (`sale.order`)
- [x] Odoo customer sync (`res.partner` — get or create)
- [x] Odoo order cancellation
- [x] Shopify Admin API (client credentials token with auto-refresh)
- [x] Inventory sync (SKU resolved via Shopify Admin API → Odoo `product.product` + inventory snapshots)
- [ ] Fulfillment sync (logs against order mapping; Odoo `stock.picking` integration pending)

### Observability
- [x] Sync event logging to Supabase
- [x] Admin dashboard with real-time stats
- [x] Health check endpoint (`/api/health`)
- [x] Monitoring cron (Inngest, every 15 min — checks Odoo + failed sync backlog)
- [x] Alert system (console/Vercel logs + optional Slack)
- [x] Manual retry from admin UI (single event or all failed)
- [x] Live sync event stream via SSE (`/api/sync/stream`, with polling fallback)

## Project Structure

```
src/
├── app/
│   ├── (storefront)/           # Customer-facing pages
│   │   ├── page.tsx            # Homepage with product grid
│   │   ├── product/[handle]/   # Product detail page
│   │   ├── cart/               # Cart page
│   │   └── ...                 # About, FAQ, Shipping, etc.
│   ├── admin/                  # OMS admin dashboard
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── orders/             # Order management
│   │   ├── products/           # Product sync status
│   │   ├── inventory/          # Inventory levels
│   │   ├── sync/               # Sync event logs
│   │   └── settings/           # API connections
│   ├── actions/                # Server actions (cart, sync retry)
│   └── api/
│       ├── auth/               # Shopify OAuth + admin session
│       │   ├── install/        # OAuth initiation
│       │   ├── callback/       # OAuth completion
│       │   ├── login/          # Admin password → session cookie
│       │   └── logout/         # Session revocation
│       ├── cart/               # Cart CRUD (Shopify Storefront API)
│       ├── health/             # Health check (Odoo + sync stats)
│       ├── inngest/            # Inngest serve route
│       ├── inventory/          # Inventory snapshots (admin)
│       ├── products/mappings/  # SKU ↔ Odoo product mapping (admin)
│       ├── sync/
│       │   ├── events/         # Sync event log + stats (polling)
│       │   └── stream/         # SSE live event stream
│       └── webhooks/           # Shopify webhook handlers
│           ├── orders/create/
│           ├── orders/cancelled/
│           └── inventory/update/
├── components/                 # React components
├── lib/
│   ├── alerts.ts               # Alert dispatcher (console + Slack)
│   ├── rate-limit.ts           # Rate limiting
│   ├── env.ts                  # Validated env vars (Zod)
│   ├── shopify/                # Storefront + Admin API clients
│   ├── odoo/                   # XML-RPC client, orders, partners, products
│   ├── supabase/               # DB client, sync events, order mappings
│   ├── inngest/                # Job queue functions
│   └── transforms/             # Shopify → Odoo data transforms
├── types/                      # TypeScript types
└── proxy.ts                    # Auth protection for admin + API routes (Next.js 16 convention)
supabase/
└── schema.sql                  # Database schema (sync_events, order_mappings)
```

## Getting Started

### Prerequisites
- Node.js 22+ (see `.nvmrc`)
- Shopify store with Storefront API access
- Odoo instance with API key
- Supabase project
- Inngest account (or use `npx inngest-cli@latest dev` locally)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start Next.js dev server
npm run dev

# Start Inngest dev server (separate terminal)
npx inngest-cli@latest dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all values. See the example file for required variable names and descriptions.

## Webhook Flow

```
Shopify Event (e.g. Order Created)
        │
        ▼
POST /api/webhooks/orders/create
        │
        ▼
┌───────────────────┐
│ Rate Limit Check  │──── Exceeded ──▶ 429
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Verify HMAC       │──── Invalid ───▶ 401
│ Signature         │
└────────┬──────────┘
         │ Valid
         ▼
┌───────────────────┐
│ Log to Supabase   │
│ (status: pending) │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Dispatch to       │
│ Inngest Queue     │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Transform Data    │
│ Shopify → Odoo    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Create Odoo Order │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
 Success    Fail
    │         │
    ▼         ▼
 Update    Retry (up to 5x)
 Supabase  then alert
```

## Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

## Deployment

Deployed on **Vercel** with Inngest integration. Webhooks are registered via Shopify Admin → Settings → Notifications.

## License

MIT
