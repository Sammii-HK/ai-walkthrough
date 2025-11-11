import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Tests for production API endpoints (/api/workflows/*)
 * These can use mocks if USE_MOCKS=true is set
 */
test.describe('Production API Endpoints', () => {
  test('POST /api/workflows/record - should record workflow', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/workflows/record`, {
      data: {
        url: 'https://example.com',
        options: {
          headless: true,
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.workflow).toBeDefined();
    expect(data.workflow.id).toBeDefined();
    expect(data.workflow.url).toBe('https://example.com');
    expect(data.workflow.steps).toBeInstanceOf(Array);
  });

  test('POST /api/workflows/record - should handle actions', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/workflows/record`, {
      data: {
        url: 'https://example.com',
        actions: [
          { type: 'click', selector: 'button.login' },
          { type: 'input', selector: 'input.email', value: 'test@example.com' },
        ],
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.workflow.steps.length).toBeGreaterThan(2); // navigate + actions
  });

  test('POST /api/workflows/[id]/script - should generate script', async ({ request }) => {
    // First record a workflow
    const recordResponse = await request.post(`${BASE_URL}/api/workflows/record`, {
      data: {
        url: 'https://example.com',
      },
    });
    const { workflow } = await recordResponse.json();

    // Generate script
    const response = await request.post(`${BASE_URL}/api/workflows/${workflow.id}/script`, {
      data: {
        tone: 'professional',
        style: 'informative',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.script).toBeInstanceOf(Array);
    expect(data.script.length).toBeGreaterThan(0);
  });

  test('POST /api/workflows/[id]/voiceover - should generate voiceover', async ({ request }) => {
    // Record workflow and generate script
    const recordResponse = await request.post(`${BASE_URL}/api/workflows/record`, {
      data: { url: 'https://example.com' },
    });
    const { workflow } = await recordResponse.json();

    const scriptResponse = await request.post(`${BASE_URL}/api/workflows/${workflow.id}/script`);
    const { script } = await scriptResponse.json();

    // Generate voiceover
    const response = await request.post(`${BASE_URL}/api/workflows/${workflow.id}/voiceover`, {
      data: {
        script,
        voice: 'alloy',
        provider: 'openai',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.audio).toBeDefined();
    expect(data.audio.data).toBeDefined();
  });

  test('GET /api/config - should return configuration', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/config`);

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.config).toBeDefined();
  });

  test('POST /api/config - should update configuration', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/config`, {
      data: {
        ai: {
          provider: 'openai',
          apiKey: 'test-key-123',
        },
        voiceover: {
          provider: 'openai',
          voice: 'alloy',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('updated');
  });

  test('POST /api/workflows/record - should handle errors gracefully', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/workflows/record`, {
      data: {
        // Missing required URL
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });
});

