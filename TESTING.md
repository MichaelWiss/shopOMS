# Testing Strategy

## Testing Pyramid

### Unit Tests (70%)
**Tools**: Vitest + Testing Library  
**Location**: `*.test.ts` / `*.test.tsx` next to source files (pattern: `**/*.{test,spec}.{ts,tsx}`)  
**Run**: `npm test`  
**Coverage Target**: 80% minimum (policy target)

**What to test:**
- Business logic functions
- Utility functions
- Data transformations
- Validation logic

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
**Tools**: Vitest + HTTP route tests (planned) + React Testing Library (UI integration)  
**Location**: `tests/integration/` (planned; not present yet)  
**Run**: `npm run test:integration` (planned; script not present yet)

**What to test:**
- API endpoints
- Database interactions
- Component integration
- External service mocks

### E2E Tests (10%)
**Tools**: Playwright (planned)  
**Location**: `e2e/` (planned; not present yet)  
**Run**: `npm run test:e2e` (planned; script not present yet)

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

# Planned aliases (not yet configured)
# npm run test:unit
# npm run test:integration
# npm run test:e2e
# npm run test:watch
```

### In CI/CD
Tests should run automatically on every PR once a repository workflow is added under `.github/workflows/`.

Current status: no repository CI workflow file is present yet, so test automation is currently driven by local runs and deployment platform checks.

## Test Data
**Fixtures**: `tests/fixtures/` (planned)  
**Factories**: Use deterministic builders first; add `@faker-js/faker` when richer randomized fixtures are needed  
**Database**: Use isolated test data and mock external dependencies by default; add dedicated integration DB setup when integration suite is introduced

## Mocking Strategy
- **External APIs**: Mock Shopify, Odoo, Supabase boundaries in test setup (current pattern in `vitest.setup.ts`)
- **Database**: Prefer mocked Supabase client for unit tests; use isolated integration database for future integration suite
- **Time**: Use Vitest fake timers (`vi.useFakeTimers()`) where time-dependent behavior is tested
- **File system**: Use in-memory fs mocks (for example, `memfs`) when file operations are introduced

## Coverage Requirements
- Overall: 80% minimum (policy target)
- Critical paths (auth, webhook verification, sync orchestration): 95% target
- New code: 90% target

Current enforcement notes:
- Coverage is generated via `npm run test:coverage` (Vitest v8 provider)
- Current coverage scope is configured for `src/lib/**/*.ts`
- Threshold enforcement in CI is planned

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
