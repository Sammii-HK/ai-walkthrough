import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * End-to-end test of the full pipeline
 * Tests the complete flow: record → script → voiceover → video
 * Uses test endpoints with mocks - zero API costs
 */
test.describe('Full Pipeline E2E Test', () => {
  test('should complete full pipeline using test endpoints', async ({ request }) => {
    // Step 1: Get sample workflow
    const workflowResponse = await request.get(`${BASE_URL}/api/test/workflow`);
    expect(workflowResponse.ok()).toBeTruthy();
    const { workflow } = await workflowResponse.json();
    expect(workflow.id).toBeDefined();

    // Step 2: Generate script
    const scriptResponse = await request.post(`${BASE_URL}/api/test/script`, {
      data: {
        workflow,
        tone: 'professional',
        style: 'informative',
      },
    });
    expect(scriptResponse.ok()).toBeTruthy();
    const { script } = await scriptResponse.json();
    expect(script.length).toBeGreaterThan(0);

    // Step 3: Generate voiceover
    const voiceoverResponse = await request.post(`${BASE_URL}/api/test/voiceover`, {
      data: {
        script,
        voice: 'alloy',
        provider: 'openai',
      },
    });
    expect(voiceoverResponse.ok()).toBeTruthy();
    const { audio } = await voiceoverResponse.json();
    expect(audio.data).toBeDefined();

    // Step 4: Process video
    const videoResponse = await request.post(`${BASE_URL}/api/test/video/process`, {
      data: {
        workflow,
        script,
      },
    });
    expect(videoResponse.ok()).toBeTruthy();
    const videoData = await videoResponse.json();
    expect(videoData.success).toBe(true);
    expect(videoData.overlays).toBeInstanceOf(Array);
  });

  test('should complete full pipeline using pipeline endpoint', async ({ request }) => {
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

    // Verify all pipeline steps completed
    expect(data.success).toBe(true);
    expect(data.pipeline.workflow.id).toBeDefined();
    expect(data.pipeline.script.segments).toBeGreaterThan(0);
    expect(data.pipeline.voiceover.length).toBeGreaterThan(0);
    expect(data.pipeline.overlays.count).toBeGreaterThan(0);
    expect(data.pipeline.video.outputPath).toBeDefined();
  });

  test('should handle different tone and style combinations', async ({ request }) => {
    const tones = ['professional', 'casual', 'energetic'];
    const styles = ['informative', 'demonstrative', 'persuasive'];

    for (const tone of tones) {
      for (const style of styles) {
        const response = await request.post(`${BASE_URL}/api/test/pipeline`, {
          data: {
            options: { tone, style },
          },
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.pipeline.script.segments).toBeGreaterThan(0);
      }
    }
  });
});

