import { NextResponse } from 'next/server';
import { 
  MockAIProvider,
  MockVoiceoverGenerator,
  MockVideoEditor,
  ScriptGenerator,
  CompositionEngine,
  TestDataFactory,
  type Workflow
} from '@ai-walkthrough/core';

/**
 * POST /api/test/pipeline
 * Test complete pipeline with all mocks
 * Body: { workflow?, options? }
 * Uses all mocks - zero API costs, zero execution costs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflow: providedWorkflow, options } = body;

    // Use provided workflow or create sample
    const workflow =
      providedWorkflow || TestDataFactory.createSampleWorkflow();

    const { tone = 'professional', style = 'informative' } = options || {};

    // Step 1: Generate script using mock AI
    const mockAIProvider = new MockAIProvider({
      provider: 'openai',
      apiKey: 'test-key',
    });
    const scriptGenerator = new ScriptGenerator(mockAIProvider);
    const script = await scriptGenerator.generateScript(workflow as Workflow, {
      tone,
      style,
    });

    // Step 2: Generate voiceover using mock TTS
    const mockVoiceoverGenerator = new MockVoiceoverGenerator({
      provider: 'openai',
      voice: 'alloy',
    });
    const audioBuffer = await mockVoiceoverGenerator.generateVoiceover(script);

    // Step 3: Generate overlays
    const mockVideoEditor = new MockVideoEditor({
      width: workflow.metadata.viewport.width,
      height: workflow.metadata.viewport.height,
      fps: 30,
      format: 'mp4',
    });

    const compositionEngine = new CompositionEngine(
      mockVideoEditor as any,
      mockVoiceoverGenerator as any,
      mockAIProvider
    );

    const overlays = await compositionEngine.generateOverlays(workflow, script);

    // Step 4: Simulate video composition (mocked)
    const mockVideoPath = './test-video.webm';
    const outputPath = './test-output.mp4';

    // Record that composition would happen
    await mockVideoEditor.addTextOverlays(mockVideoPath, overlays, outputPath);
    await mockVideoEditor.addAudioTrack(mockVideoPath, './test-audio.wav', outputPath);

    const commands = mockVideoEditor.getRecordedCommands();

    return NextResponse.json({
      success: true,
      pipeline: {
        workflow: {
          id: workflow.id,
          url: workflow.url,
          duration: workflow.duration,
          steps: workflow.steps.length,
        },
        script: {
          segments: script.length,
          totalDuration: Math.max(...script.map((s) => s.endTime), 0),
        },
        voiceover: {
          length: audioBuffer.length,
          format: 'wav',
        },
        overlays: {
          count: overlays.length,
        },
        video: {
          outputPath,
          ffmpegCommands: commands.length,
        },
      },
      commands,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

