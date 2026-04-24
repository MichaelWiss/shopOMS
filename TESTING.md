# Testing Strategy

## Testing Pyramid

### Unit Tests (70%)
**Tools**: Vitest + Testing Library  
**Location**: `*.test.ts` / `*.test.tsx` next to source files (pattern: `**/*.{test,spec}.{ts,tsx}`)  
**Run**: `npm test`  
**Coverage Target**: 80% (policy goal; scope: `src/lib/**` only — not yet enforced in CI)

**What to test:**
- Business logic functions
- Utility functions
- Data transformations
- Validation logic
- Pure live-stream helpers such as merge/cap behavior (`useSyncEventsLive.test.ts`)

**Example:**
```typescript
describe('calculateDiscount', () => {
  it('should apply 20% discount for premium users', () => {
    const result = calculateDiscount(100, 'PREMIUM');
    expect(result).toBe(80);
  });
});
```

### Integration Tests (20%)
**Tools**: Vitest + HTTP route tests + React Testing Library (UI integration)  
**Location**: Currently colocated next to source files; dedicated `tests/integration/` directory is still planned  
**Run**: `npm run test:run` (current), `npm run test:integration` (planned; script not present yet)

**What to test:**
- API endpoints
- Database interactions
- Component integration
- External service mocks

**Current examples:**
- `src/app/api/sync/stream/route.test.ts` validates SSE headers plus initial snapshot/retry framing
- `src/components/SyncEventsLive/SyncEventsLive.test.tsx` validates degraded polling UI and reconnect action wiring

### E2E Tests (10%)
**Tools**: Playwright (not yet installed — not in `devDependencies`)  
**Location**: `e2e/` (not yet created)  
**Run**: `npm run test:e2e` (script not yet configured)

**What to test:**
- Critical user flows
- Checkout and order submission flow
- Authentication flows
- Multi-step workflows

## Running Tests

### Locally
```bash
# All tests (watch)
npm test

# Single run (CI-style)
npm run test:run

# Coverage report
npm run test:coverage

# Available aliases
npm run test:unit       # vitest run (src/lib coverage scope)
npm run test:watch      # vitest watch mode

# Not yet configured
# npm run test:integration
# npm run test:e2e
```

### In CI/CD
Tests run automatically on every PR and push to `main` via `.github/workflows/ci.yml`.

The workflow runs: install → lint → `npm run test:run` → `npm run build`.

## Test Data
**Fixtures**: `tests/fixtures/` (planned)  
**Factories**: Use deterministic builders first; add `@faker-js/faker` when richer randomized fixtures are needed  
**Database**: Use isolated test data and mock external dependencies by default; add dedicated integration DB setup when integration suite is introduced

## Mocking Strategy
- **External APIs**: Mock Shopify, Odoo, Supabase boundaries in test setup (current pattern in `vitest.setup.ts`)
- **Database**: Prefer mocked Supabase client for unit tests; use isolated integration database for future integration suite
- **Time**: Use Vitest fake timers (`vi.useFakeTimers()`) where time-dependent behavior is tested
- **Next.js client routing**: Mock App Router-dependent UI boundaries (or isolate them behind mocked child components) when component tests do not need to exercise router behavior directly
- **File system**: Use in-memory fs mocks (for example, `memfs`) when file operations are introduced

## Coverage Requirements
- `src/lib/**` modules: 80% minimum (policy goal — not yet enforced in CI)
- Critical paths (auth, webhook verification, sync orchestration): 95% target
- New code: 90% target

Current enforcement notes:
- Coverage is generated via `npm run test:coverage` (Vitest v8 provider)
- **Scope**: `src/lib/**/*.ts` only — API routes, components, hooks, and server actions are excluded from measurement
- **Thresholds**: not configured in `vitest.config.ts`; CI enforcement is a planned follow-up

## Performance Testing
**Tool**: k6 (planned)  
**Location**: `tests/performance/` (planned)  
**Run**: `npm run test:performance` (planned)

**Scenarios:**
- Load test: baseline sustained traffic
- Stress test: ramp to system limits
- Spike test: sudden traffic surge

## Security Testing
- Dependency scanning: `npm audit`
- Static analysis: Add CI SAST stage when CI workflow is added
- Dynamic testing: Add staged DAST checks for critical endpoints

## Test Best Practices
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests focused and deterministic
- Use descriptive test names: `it('should reject invalid email format')`
- Use `beforeEach` for setup, `afterEach` for cleanup
- No test interdependencies (tests must run in any order)
- Keep unit tests fast and integration tests bounded

## Flaky Test Policy
- Flaky tests must be fixed within 48 hours or temporarily disabled
- Track flaky tests in GitHub Issues with `flaky-test` label
- Root cause analysis is required for repeated flakiness
