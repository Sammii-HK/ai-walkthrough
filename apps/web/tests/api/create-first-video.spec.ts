import { test, expect } from '@playwright/test';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Test to create your first video using production endpoints
 * This uses REAL APIs - make sure you have API keys configured!
 * 
 * Set these environment variables:
 * - OPENAI_API_KEY=sk-... (for script generation and TTS)
 * - Or ANTHROPIC_API_KEY=sk-ant-... (for script generation)
 * - USE_MOCKS=false (or don't set it)
 */
test.describe('Create First Video - Production', () => {
  test('should create a complete video from workflow to final output', async ({ request }) => {
    // Check if we're using mocks
    const useMocks = process.env.USE_MOCKS === 'true';
    if (useMocks) {
      console.log('⚠️  Warning: USE_MOCKS is set to true. Set USE_MOCKS=false to use real APIs.');
    }

    // Step 1: Record a workflow
    console.log('📹 Step 1: Recording workflow...');
    const recordResponse = await request.post(`${BASE_URL}/api/workflows/record`, {
      data: {
        url: 'https://example.com', // Change this to your website/app URL
        options: {
          headless: true, // Set to false to see the browser
        },
        // Optional: Add actions to perform
        // actions: [
        //   { type: 'click', selector: 'button.login' },
        //   { type: 'input', selector: 'input.email', value: 'test@example.com' },
        // ],
      },
    });

    expect(recordResponse.ok()).toBeTruthy();
    const { workflow } = await recordResponse.json();
    console.log(`✅ Workflow recorded: ${workflow.id}`);
    console.log(`   Duration: ${workflow.duration.toFixed(2)}s`);
    console.log(`   Steps: ${workflow.steps.length}`);

    // Save workflow for reference
    const outputDir = join(process.cwd(), 'recordings');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    writeFileSync(
      join(outputDir, `${workflow.id}.json`),
      JSON.stringify(workflow, null, 2)
    );

    // Step 2: Generate script
    console.log('📝 Step 2: Generating script...');
    const scriptResponse = await request.post(
      `${BASE_URL}/api/workflows/${workflow.id}/script`,
      {
        data: {
          tone: 'professional', // or 'casual', 'energetic'
          style: 'informative', // or 'demonstrative', 'persuasive'
        },
      }
    );

    expect(scriptResponse.ok()).toBeTruthy();
    const { script } = await scriptResponse.json();
    console.log(`✅ Script generated: ${script.length} segments`);
    console.log(`   First segment: "${script[0]?.text?.substring(0, 50)}..."`);

    // Step 3: Generate voiceover
    console.log('🎤 Step 3: Generating voiceover...');
    const voiceoverResponse = await request.post(
      `${BASE_URL}/api/workflows/${workflow.id}/voiceover`,
      {
        data: {
          script,
          voice: 'alloy', // OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
          provider: 'openai',
        },
      }
    );

    expect(voiceoverResponse.ok()).toBeTruthy();
    const { audio } = await voiceoverResponse.json();
    console.log(`✅ Voiceover generated: ${audio.length} bytes`);

    // Save audio file
    const audioBuffer = Buffer.from(audio.data, 'base64');
    const audioPath = join(outputDir, `${workflow.id}-audio.mp3`);
    writeFileSync(audioPath, audioBuffer);
    console.log(`   Audio saved: ${audioPath}`);

    // Step 4: Note about video processing
    console.log('\n📹 Step 4: Video processing');
    console.log('   Note: Video composition requires FFmpeg and the recorded video file.');
    console.log('   The workflow video should be at:', workflow.videoPath || 'recordings/*.webm');
    console.log('\n✅ Pipeline complete! You now have:');
    console.log(`   - Workflow: ${join(outputDir, `${workflow.id}.json`)}`);
    console.log(`   - Script: ${script.length} segments`);
    console.log(`   - Voiceover: ${audioPath}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Use the CLI to process the workflow:');
    console.log(`      ai-walkthrough process ${join(outputDir, `${workflow.id}.json`)} -o output.mp4`);
    console.log('   2. Or use the video processing API endpoint');
  });

  test('should create video with custom URL and actions', async ({ request }) => {
    // Example: Test with a real website
    const testUrl = process.env.TEST_URL || 'https://example.com';

    console.log(`🎬 Testing with URL: ${testUrl}`);

    const recordResponse = await request.post(`${BASE_URL}/api/workflows/record`, {
      data: {
        url: testUrl,
        options: {
          headless: true,
        },
        actions: [
          { type: 'wait', value: '2000' }, // Wait 2 seconds
          { type: 'scroll' }, // Scroll down
        ],
      },
    });

    expect(recordResponse.ok()).toBeTruthy();
    const { workflow } = await recordResponse.json();
    expect(workflow.url).toBe(testUrl);
    expect(workflow.steps.length).toBeGreaterThan(0);

    console.log(`✅ Recorded ${workflow.steps.length} steps`);
  });
});



