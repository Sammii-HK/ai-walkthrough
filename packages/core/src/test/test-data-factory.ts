import { v4 as uuidv4 } from 'uuid';
import type { Workflow, WorkflowStep, ScriptSegment, TextOverlay } from '../types';

/**
 * Test Data Factory
 * Generates test data for workflows, scripts, overlays, etc.
 */
export class TestDataFactory {
  /**
   * Create a sample workflow for testing
   */
  static createSampleWorkflow(overrides?: Partial<Workflow>): Workflow {
    const baseWorkflow: Workflow = {
      id: uuidv4(),
      url: 'https://example.com',
      duration: 15,
      steps: [
        {
          timestamp: 0,
          action: 'navigate',
          target: 'https://example.com',
          domSnapshot: '<html><body>Homepage</body></html>',
          screenshot: 'base64image1',
        },
        {
          timestamp: 2,
          action: 'click',
          target: 'button.login',
          coordinates: { x: 200, y: 50 },
          domSnapshot: '<html><body>Login page</body></html>',
          screenshot: 'base64image2',
        },
        {
          timestamp: 5,
          action: 'input',
          target: 'input.email',
          value: 'test@example.com',
          coordinates: { x: 300, y: 150 },
          domSnapshot: '<html><body>Email entered</body></html>',
          screenshot: 'base64image3',
        },
        {
          timestamp: 8,
          action: 'click',
          target: 'button.submit',
          coordinates: { x: 400, y: 250 },
          domSnapshot: '<html><body>Submitted</body></html>',
          screenshot: 'base64image4',
        },
        {
          timestamp: 12,
          action: 'navigate',
          target: '/dashboard',
          domSnapshot: '<html><body>Dashboard</body></html>',
          screenshot: 'base64image5',
        },
      ],
      metadata: {
        browser: 'chromium',
        viewport: { width: 1920, height: 1080 },
        recordedAt: new Date().toISOString(),
      },
    };

    return { ...baseWorkflow, ...overrides };
  }

  /**
   * Create sample script segments
   */
  static createSampleScript(segmentCount = 4): ScriptSegment[] {
    const segments: ScriptSegment[] = [];
    const duration = 15;
    const segmentDuration = duration / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      segments.push({
        startTime: i * segmentDuration,
        endTime: (i + 1) * segmentDuration,
        text: `This is segment ${i + 1} of the script.`,
        emphasis: i % 2 === 0 ? ['segment'] : [],
      });
    }

    return segments;
  }

  /**
   * Create sample text overlays
   */
  static createSampleOverlays(count = 3): TextOverlay[] {
    const overlays: TextOverlay[] = [];
    const duration = 15;
    const overlayDuration = duration / count;

    for (let i = 0; i < count; i++) {
      overlays.push({
        text: `Overlay ${i + 1}`,
        startTime: i * overlayDuration,
        endTime: (i + 1) * overlayDuration,
        position: { x: 50, y: 20 + i * 30 },
        style: {
          fontSize: 32,
          color: '#FFFFFF',
          backgroundColor: '#00000080',
          fontFamily: 'Arial',
        },
      });
    }

    return overlays;
  }

  /**
   * Create sample workflow steps
   */
  static createSampleSteps(count = 5): WorkflowStep[] {
    const steps: WorkflowStep[] = [];
    const actions: WorkflowStep['action'][] = ['navigate', 'click', 'input', 'scroll', 'hover'];

    for (let i = 0; i < count; i++) {
      steps.push({
        timestamp: i * 2,
        action: actions[i % actions.length],
        target: `element-${i}`,
        value: i % 2 === 0 ? `value-${i}` : undefined,
        coordinates: { x: 100 + i * 50, y: 100 + i * 50 },
        domSnapshot: `<html><body>Step ${i}</body></html>`,
        screenshot: `base64image${i}`,
      });
    }

    return steps;
  }
}

