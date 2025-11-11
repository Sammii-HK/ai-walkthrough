import { NextResponse } from 'next/server';
import { MockAIProvider } from '@ai-walkthrough/core/__mocks__/mock-ai-provider';
import { ScriptGenerator } from '@ai-walkthrough/core';
import type { Workflow } from '@ai-walkthrough/core';

/**
 * POST /api/test/script
 * Generate script using mocked AI provider
 * Body: { workflow, tone?, style? }
 * Uses mocks - no API costs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workflow, tone, style } = body;

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow is required' },
        { status: 400 }
      );
    }

    // Use mock AI provider
    const mockAIProvider = new MockAIProvider({
      provider: 'openai',
      apiKey: 'test-key',
    });

    const scriptGenerator = new ScriptGenerator(mockAIProvider);
    const script = await scriptGenerator.generateScript(workflow as Workflow, {
      tone,
      style,
    });

    return NextResponse.json({
      success: true,
      script,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

