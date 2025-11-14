import { NextResponse } from 'next/server';
import { 
  BrowserAutomation,
  MockBrowserAutomation,
  useMocks
} from '@ai-walkthrough/core';

/**
 * POST /api/workflows/record
 * Record a workflow using browser automation
 * Body: { url, actions?, options? }
 * Supports mock mode via USE_MOCKS env variable
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, actions, options } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Use mocks if in test mode
    const automation = useMocks()
      ? new MockBrowserAutomation()
      : new BrowserAutomation();

    await automation.initialize(options);

    const workflow = await automation.recordWorkflow(url, actions);
    await automation.close();

    return NextResponse.json({
      success: true,
      workflow,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

