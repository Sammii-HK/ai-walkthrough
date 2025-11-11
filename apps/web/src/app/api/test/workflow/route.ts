import { NextResponse } from 'next/server';
import { TestDataFactory } from '@ai-walkthrough/core/test/test-data-factory';

/**
 * GET /api/test/workflow
 * Returns a sample workflow JSON for testing
 * Uses mock data - no API costs
 */
export async function GET() {
  const workflow = TestDataFactory.createSampleWorkflow();

  return NextResponse.json({
    success: true,
    workflow,
  });
}

