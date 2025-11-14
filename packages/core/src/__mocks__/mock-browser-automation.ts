import { v4 as uuidv4 } from 'uuid';
import type { Workflow, WorkflowStep } from '../types';

/**
 * Mock Browser Automation for testing
 * Returns predefined workflow data without real browser launches
 * No browser costs - zero cost
 */
export class MockBrowserAutomation {
  private steps: WorkflowStep[] = [];
  private startTime: number = 0;

  async initialize(_options?: {
    headless?: boolean;
    viewport?: { width: number; height: number };
  }): Promise<void> {
    // Mock initialization - just set up state
    this.steps = [];
    this.startTime = Date.now();
  }

  async recordWorkflow(
    url: string,
    actions?: Array<{ type: string; selector?: string; value?: string }>
  ): Promise<Workflow> {
    // Simulate recording delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const workflowId = uuidv4();
    this.steps = [];
    this.startTime = Date.now();

    // Generate mock steps based on URL and actions
    this.steps.push({
      timestamp: 0,
      action: 'navigate',
      target: url,
      domSnapshot: '<html><body>Mock HTML</body></html>',
      screenshot: 'base64encodedmockimage',
    });

    if (actions && actions.length > 0) {
      actions.forEach((action, index) => {
        const timestamp = (index + 1) * 2;
        this.steps.push({
          timestamp,
          action: action.type as WorkflowStep['action'],
          target: action.selector,
          value: action.value,
          coordinates: { x: 100 + index * 50, y: 100 + index * 50 },
          domSnapshot: `<html><body>Mock HTML after ${action.type}</body></html>`,
          screenshot: 'base64encodedmockimage',
        });
      });
    } else {
      // Default workflow steps
      this.steps.push(
        {
          timestamp: 2,
          action: 'click',
          target: 'button.login',
          coordinates: { x: 200, y: 50 },
          domSnapshot: '<html><body>Login clicked</body></html>',
          screenshot: 'base64encodedmockimage',
        },
        {
          timestamp: 5,
          action: 'input',
          target: 'input.email',
          value: 'user@example.com',
          coordinates: { x: 300, y: 150 },
          domSnapshot: '<html><body>Email entered</body></html>',
          screenshot: 'base64encodedmockimage',
        },
        {
          timestamp: 8,
          action: 'click',
          target: 'button.submit',
          coordinates: { x: 400, y: 250 },
          domSnapshot: '<html><body>Submitted</body></html>',
          screenshot: 'base64encodedmockimage',
        }
      );
    }

    const duration = Math.max(...this.steps.map((s) => s.timestamp), 0) + 2;

    return {
      id: workflowId,
      url,
      steps: this.steps,
      duration,
      metadata: {
        browser: 'chromium',
        viewport: {
          width: 1920,
          height: 1080,
        },
        recordedAt: new Date().toISOString(),
      },
    };
  }

  async captureStep(
    action: WorkflowStep['action'],
    target?: string,
    value?: string
  ): Promise<WorkflowStep> {
    const timestamp = (Date.now() - this.startTime) / 1000;
    const step: WorkflowStep = {
      timestamp,
      action,
      target,
      value,
      coordinates: target ? { x: 100, y: 100 } : undefined,
      domSnapshot: '<html><body>Mock DOM</body></html>',
      screenshot: 'base64encodedmockimage',
    };

    this.steps.push(step);
    return step;
  }

  async getScreenshot(): Promise<Buffer> {
    return Buffer.from('mock screenshot data');
  }

  async getDOMSnapshot(): Promise<string> {
    return '<html><body>Mock DOM Snapshot</body></html>';
  }

  async close(): Promise<string | null> {
    // Mock cleanup
    this.steps = [];
    return './recordings/mock-video.webm';
  }

  getVideoPath(): string {
    return './recordings/mock-video.webm';
  }
}

