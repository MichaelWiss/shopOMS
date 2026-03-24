# Project Context

## Stack
- Frontend: Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS
- Backend: Next.js Route Handlers (Node.js runtime) + Supabase (PostgreSQL)
- Testing: Vitest + Testing Library
- Deployment: Docker + Vercel

## Architecture
This project is a full-stack Next.js OMS middleware between Shopify and Odoo: storefront and admin UI live in App Router pages, API/webhook handlers live under `src/app/api`, async processing is handled by Inngest functions, and sync events/mappings are stored in Supabase PostgreSQL.

## Development Workflow

### Setup
```bash
npm install
cp .env.example .env.local
npm run db:push
```

### Running locally
```bash
npm run dev                   # starts the Next.js app on localhost:3000
npx inngest-cli@latest dev    # run in a second terminal for async jobs
npm test                      # runs test suite (Vitest)
```

### Building
```bash
npm run build                 # production build
docker build -t shop-oms .    # containerize
```

## Code Conventions

### TypeScript
- Use strict mode
- Explicit return types on exported functions
- Prefer `type` for object shapes, `interface` for contracts
- No `any` - use `unknown` or proper typing

### React
- Functional components only
- Hooks for state management
- Prefer server components by default; use client components only when needed
- File structure for new shared components:
```
  ComponentName/
    ComponentName.tsx
    ComponentName.test.tsx
    index.ts
```

### API Design
- Use Next.js route handlers under `src/app/api/**/route.ts`
- Validate request/response payloads with Zod schemas
- Keep a consistent JSON error shape with actionable messages

### Testing
- AAA pattern (Arrange, Act, Assert)
- Focus coverage on business logic in `src/lib/**`
- Mock external dependencies (Shopify, Odoo, Supabase, Inngest)

## Common Tasks

### Adding a new API endpoint
1. Create route handler in `src/app/api/<feature>/route.ts`
2. Add domain logic in `src/lib/<domain>/` (or `src/app/actions/` for server actions)
3. Add/update Zod schemas in `src/lib/schemas/` when applicable
4. Add tests
5. Update README or PROJECT docs if behavior/contracts changed

### Database Changes
```bash
# Update SQL in supabase/schema.sql
npm run db:push
npm run db:generate
```

## Gotchas & Known Issues
- Shopify webhook signing secret must come from Shopify Notifications webhook settings
- Odoo integration requires API key usage and correct XML-RPC connectivity
- Rate limiting is per-IP (see `src/lib/rate-limit.ts`)
- Inngest must run locally in a separate terminal for async workflows

## What NOT to Do
- Never commit `.env`, `.env.local`, or secrets
- No console logs in production paths unless intentionally structured for alerting
- Do not use `var`; use `const`/`let`
- Do not bypass webhook HMAC verification for Shopify endpoints