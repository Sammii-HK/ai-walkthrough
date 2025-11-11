import { NextResponse } from 'next/server';
import { MockVoiceoverGenerator } from '@ai-walkthrough/core/__mocks__/mock-voiceover-generator';
import type { ScriptSegment, VoiceoverConfig } from '@ai-walkthrough/core';

/**
 * POST /api/test/voiceover
 * Generate voiceover using mocked TTS
 * Body: { script, voice?, provider? }
 * Uses mocks - no API costs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { script, voice, provider } = body;

    if (!script || !Array.isArray(script)) {
      return NextResponse.json(
        { error: 'Script array is required' },
        { status: 400 }
      );
    }

    const voiceoverConfig: VoiceoverConfig = {
      provider: provider || 'openai',
      voice: voice || 'alloy',
    };

    const mockVoiceoverGenerator = new MockVoiceoverGenerator(voiceoverConfig);
    const audioBuffer = await mockVoiceoverGenerator.generateVoiceover(
      script as ScriptSegment[]
    );

    // Convert buffer to base64 for JSON response
    const base64Audio = audioBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      audio: {
        data: base64Audio,
        format: 'wav',
        length: audioBuffer.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

