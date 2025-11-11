import { NextResponse } from 'next/server';
import { VoiceoverGenerator } from '@ai-walkthrough/core';
import { MockVoiceoverGenerator } from '@ai-walkthrough/core/__mocks__/mock-voiceover-generator';
import { useMocks } from '@ai-walkthrough/core/test/test-env';
import type { ScriptSegment, VoiceoverConfig } from '@ai-walkthrough/core';

/**
 * POST /api/workflows/[id]/voiceover
 * Generate voiceover for a script
 * Body: { script, voice?, provider? }
 * Supports mock mode via USE_MOCKS env variable
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Use mock or real voiceover generator
    let voiceoverGenerator;
    if (useMocks()) {
      voiceoverGenerator = new MockVoiceoverGenerator(voiceoverConfig);
    } else {
      voiceoverGenerator = new VoiceoverGenerator(voiceoverConfig);
      
      // Set API key if using OpenAI
      if (voiceoverConfig.provider === 'openai') {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          return NextResponse.json(
            { error: 'OpenAI API key not configured' },
            { status: 500 }
          );
        }
        voiceoverGenerator.setOpenAIKey(apiKey);
      }
    }

    const audioBuffer = await voiceoverGenerator.generateVoiceover(
      script as ScriptSegment[]
    );

    // In production, save to storage and return URL
    // For now, return base64
    const base64Audio = audioBuffer.toString('base64');

    return NextResponse.json({
      success: true,
      audio: {
        data: base64Audio,
        format: 'mp3',
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

