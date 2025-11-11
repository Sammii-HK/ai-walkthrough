import { NextResponse } from 'next/server';
import { MockVideoEditor } from '@ai-walkthrough/core/__mocks__/mock-video-editor';
import { MockVoiceoverGenerator } from '@ai-walkthrough/core/__mocks__/mock-voiceover-generator';
import { CompositionEngine } from '@ai-walkthrough/core';
import type { Workflow, ScriptSegment, TextOverlay, VideoConfig } from '@ai-walkthrough/core';

/**
 * POST /api/test/video/process
 * Test video composition with mocked FFmpeg
 * Body: { workflow, script, overlays }
 * Uses mocks - no FFmpeg execution, no costs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflow, script, overlays } = body;

    if (!workflow || !script) {
      return NextResponse.json(
        { error: 'Workflow and script are required' },
        { status: 400 }
      );
    }

    // Use mock video editor
    const videoConfig: VideoConfig = {
      width: workflow.metadata?.viewport?.width || 1920,
      height: workflow.metadata?.viewport?.height || 1080,
      fps: 30,
      format: 'mp4',
    };

    const mockVideoEditor = new MockVideoEditor(videoConfig);
    const mockVoiceoverGenerator = new MockVoiceoverGenerator({
      provider: 'openai',
      voice: 'alloy',
    });

    const compositionEngine = new CompositionEngine(
      mockVideoEditor as any,
      mockVoiceoverGenerator as any
    );

    // Generate overlays if not provided
    const finalOverlays =
      overlays ||
      (await compositionEngine.generateOverlays(
        workflow as Workflow,
        script as ScriptSegment[]
      ));

    // Mock video path
    const mockVideoPath = './test-video.webm';
    const outputPath = './test-output.mp4';

    // This would normally compose the video, but with mocks it just validates
    // In a real scenario, you'd call composeVideo here
    const commands = mockVideoEditor.getRecordedCommands();

    return NextResponse.json({
      success: true,
      message: 'Video processing simulated (mocked)',
      videoPath: outputPath,
      overlays: finalOverlays,
      ffmpegCommands: commands,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

