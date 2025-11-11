# API Testing with Playwright

This directory contains Playwright tests for the AI-Walkthrough API endpoints.

## Test Structure

- `api/test-endpoints.spec.ts` - Tests for `/api/test/*` endpoints (use mocks, zero cost)
- `api/production-endpoints.spec.ts` - Tests for production endpoints (can use mocks)
- `api/full-pipeline.spec.ts` - End-to-end pipeline tests

## Running Tests

### Run all API tests
```bash
pnpm test:e2e
```

### Run tests in UI mode
```bash
pnpm test:e2e:ui
```

### Run specific test file
```bash
npx playwright test tests/api/test-endpoints.spec.ts
```

### Run tests in headed mode (see browser)
```bash
pnpm test:e2e:headed
```

## Environment Variables

Set these environment variables to control test behavior:

```bash
# Use mocks for production endpoints (recommended for testing)
USE_MOCKS=true

# Base URL for API (defaults to http://localhost:3000)
BASE_URL=http://localhost:3000
```

## Test Endpoints (Zero Cost)

The `/api/test/*` endpoints use mocks and don't make real API calls:

- `GET /api/test/workflow` - Get sample workflow
- `POST /api/test/script` - Generate script with mocks
- `POST /api/test/voiceover` - Generate voiceover with mocks
- `POST /api/test/video/process` - Process video with mocks
- `POST /api/test/pipeline` - Test full pipeline with mocks

## Production Endpoints

The production endpoints (`/api/workflows/*`) can use mocks if `USE_MOCKS=true`:

- `POST /api/workflows/record` - Record workflow
- `POST /api/workflows/[id]/script` - Generate script
- `POST /api/workflows/[id]/voiceover` - Generate voiceover
- `GET/POST /api/config` - Manage configuration

## Example Test

```typescript
import { test, expect } from '@playwright/test';

test('should generate script', async ({ request }) => {
  const response = await request.post('http://localhost:3000/api/test/script', {
    data: {
      workflow: { /* workflow data */ },
      tone: 'professional',
    },
  });

  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(data.script).toBeInstanceOf(Array);
});
```

## CI/CD

Tests are configured to:
- Run in parallel
- Retry on failure (2 retries in CI)
- Generate HTML reports
- Start dev server automatically

