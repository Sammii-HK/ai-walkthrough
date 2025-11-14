import { NextResponse } from 'next/server';
import { 
  createAIProvider,
  ScriptGenerator,
  MockAIProvider,
  useMocks
} from '@ai-walkthrough/core';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * POST /api/workflows/[id]/script
 * Generate script for a workflow
 * Body: { tone?, style?, audience? }
 * Supports mock mode via USE_MOCKS env variable
 */
export async function POST(
  request: Request,
  { params: _params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { tone, style, audience } = body;
    const { id } = await _params;

    // Load workflow (in production, this would be from database/storage)
    const workflowPath = join(process.cwd(), 'recordings', `${id}.json`);
    
    if (!existsSync(workflowPath)) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflow = JSON.parse(readFileSync(workflowPath, 'utf-8'));

    // Use mock or real AI provider
    let aiProvider;
    if (useMocks()) {
      aiProvider = new MockAIProvider({
        provider: 'openai',
        apiKey: 'test-key',
      });
    } else {
      // Load config from environment or config file
      const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
      const provider = process.env.AI_PROVIDER || 'openai';
      
      if (!apiKey) {
        return NextResponse.json(
          { error: 'AI API key not configured' },
          { status: 500 }
        );
      }

      aiProvider = createAIProvider({
        provider: provider as 'openai' | 'anthropic',
        apiKey,
      });
    }

    const scriptGenerator = new ScriptGenerator(aiProvider);
    const script = await scriptGenerator.generateScript(workflow, {
      tone,
      style,
      audience,
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

