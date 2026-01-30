# shopOMS - Shopify Order Management System

A real-world middleware architecture connecting a headless Shopify storefront to Odoo ERP.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js       │     │   Middleware    │     │     Odoo        │
│   Storefront    │────▶│   (API Routes)  │────▶│     ERP         │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                        ┌────────▼────────┐
                        │    Supabase     │
                        │  (Sync Logs)    │
                        └─────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Storefront | Next.js 15 | Headless commerce frontend |
| API | Next.js API Routes | Webhook handlers, data transforms |
| Queue | BullMQ + Redis | Job queue for reliable syncs |
| Database | Supabase (PostgreSQL) | Sync logs, analytics, caching |
| OMS/ERP | Odoo | Order management, inventory |
| Auth | Shopify OAuth | Store authentication |

## Features

### Storefront
- [ ] Product listing with Shopify Storefront API
- [ ] Product detail pages
- [ ] Cart management
- [ ] Shopify Checkout integration
- [ ] Customer account pages

### Middleware
- [ ] Webhook receiver (orders, inventory, fulfillments)
- [ ] Webhook signature verification
- [ ] Data transformation (Shopify → Odoo format)
- [ ] Retry logic with exponential backoff
- [ ] Dead letter queue for failed syncs
- [ ] Rate limit handling

### Integrations
- [ ] Odoo order creation
- [ ] Odoo inventory sync
- [ ] Odoo customer sync
- [ ] Fulfillment status sync (Odoo → Shopify)

### Observability
- [ ] Sync event logging
- [ ] Error tracking
- [ ] Analytics dashboard
- [ ] Health checks

## Project Structure

```
shopOMS/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (storefront)/       # Customer-facing pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── products/       # Product pages
│   │   │   ├── cart/           # Cart page
│   │   │   └── account/        # Customer account
│   │   ├── api/                # API Routes (Middleware)
│   │   │   ├── webhooks/       # Shopify webhook handlers
│   │   │   │   ├── orders/
│   │   │   │   ├── inventory/
│   │   │   │   └── fulfillments/
│   │   │   ├── sync/           # Manual sync endpoints
│   │   │   └── health/         # Health checks
│   │   └── admin/              # Admin dashboard
│   ├── lib/
│   │   ├── shopify/            # Shopify API client
│   │   ├── odoo/               # Odoo XML-RPC client
│   │   ├── supabase/           # Supabase client
│   │   ├── queue/              # BullMQ job definitions
│   │   └── transforms/         # Data transformers
│   ├── components/             # React components
│   └── types/                  # TypeScript types
├── prisma/                     # Local schema (optional)
├── docker-compose.yml          # Redis for local dev
└── .env.example
```

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Docker (for Redis)
- Shopify Partner account
- Odoo account (free tier)
- Supabase account (free tier)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start Redis
docker-compose up -d

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

See `.env.example` for required variables.

## Webhook Flow

```
Shopify Order Created
        │
        ▼
┌───────────────────┐
│ POST /api/webhooks│
│ /orders/create    │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Verify Signature  │──── Invalid ────▶ 401
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
│ Add to BullMQ     │
│ Queue             │
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
 Update    Retry with
 Log       Backoff
```

## License

MIT
