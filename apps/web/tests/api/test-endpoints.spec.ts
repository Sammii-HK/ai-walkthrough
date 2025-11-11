import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Tests for test API endpoints (/api/test/*)
 * These endpoints use mocks - zero API costs
 */
test.describe('Test API Endpoints', () => {
  test('GET /api/test/workflow - should return sample workflow', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/test/workflow`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.workflow).toBeDefined();
    expect(data.workflow.id).toBeDefined();
    expect(data.workflow.url).toBeDefined();
    expect(data.workflow.steps).toBeInstanceOf(Array);
    expect(data.workflow.metadata).toBeDefined();
  });

  test('POST /api/test/script - should generate script using mocks', async ({ request }) => {
    // First get a workflow
    const workflowResponse = await request.get(`${BASE_URL}/api/test/workflow`);
    const { workflow } = await workflowResponse.json();

    // Generate script
    const response = await request.post(`${BASE_URL}/api/test/script`, {
      data: {
        workflow,
        tone: 'professional',
        style: 'informative',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.script).toBeInstanceOf(Array);
    expect(data.script.length).toBeGreaterThan(0);
    expect(data.script[0]).toHaveProperty('startTime');
    expect(data.script[0]).toHaveProperty('endTime');
    expect(data.script[0]).toHaveProperty('text');
  });

  test('POST /api/test/voiceover - should generate voiceover using mocks', async ({ request }) => {
    // Get workflow and script
    const workflowResponse = await request.get(`${BASE_URL}/api/test/workflow`);
    const { workflow } = await workflowResponse.json();

    const scriptResponse = await request.post(`${BASE_URL}/api/test/script`, {
      data: { workflow },
    });
    const { script } = await scriptResponse.json();

    // Generate voiceover
    const response = await request.post(`${BASE_URL}/api/test/voiceover`, {
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
    expect(data.audio.data).toBeDefined(); // base64 audio
    expect(data.audio.format).toBe('wav');
    expect(data.audio.length).toBeGreaterThan(0);
  });

  test('POST /api/test/video/process - should process video with mocks', async ({ request }) => {
    // Get workflow and script
    const workflowResponse = await request.get(`${BASE_URL}/api/test/workflow`);
    const { workflow } = await workflowResponse.json();

    const scriptResponse = await request.post(`${BASE_URL}/api/test/script`, {
      data: { workflow },
    });
    const { script } = await scriptResponse.json();

    // Process video
    const response = await request.post(`${BASE_URL}/api/test/video/process`, {
      data: {
        workflow,
        script,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.message).toContain('simulated');
    expect(data.overlays).toBeInstanceOf(Array);
    expect(data.ffmpegCommands).toBeInstanceOf(Array);
  });

  test('POST /api/test/pipeline - should test full pipeline with mocks', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/test/pipeline`, {
      data: {
        options: {
          tone: 'professional',
          style: 'informative',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.pipeline).toBeDefined();
    expect(data.pipeline.workflow).toBeDefined();
    expect(data.pipeline.script).toBeDefined();
    expect(data.pipeline.voiceover).toBeDefined();
    expect(data.pipeline.overlays).toBeDefined();
    expect(data.pipeline.video).toBeDefined();
    expect(data.commands).toBeInstanceOf(Array);
  });

  test('POST /api/test/pipeline - should work with provided workflow', async ({ request }) => {
    // Get a workflow first
    const workflowResponse = await request.get(`${BASE_URL}/api/test/workflow`);
    const { workflow } = await workflowResponse.json();

    const response = await request.post(`${BASE_URL}/api/test/pipeline`, {
      data: {
        workflow,
        options: {
          tone: 'casual',
          style: 'energetic',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.pipeline.workflow.id).toBe(workflow.id);
  });
});

