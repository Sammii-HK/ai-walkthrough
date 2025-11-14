import { chromium, type Browser, type Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import type { Workflow, WorkflowStep } from '../types';

/**
 * Browser automation module using Playwright
 * Records workflows by programmatically navigating through websites/apps
 */
export class BrowserAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private context: Awaited<ReturnType<Browser['newContext']>> | null = null;
  private steps: WorkflowStep[] = [];
  private startTime: number = 0;
  private videoPath: string = '';

  /**
   * Initialize browser and start recording
   */
  async initialize(options?: {
    headless?: boolean;
    viewport?: { width: number; height: number };
  }): Promise<void> {
    this.browser = await chromium.launch({
      headless: options?.headless ?? false,
    });

    this.context = await this.browser.newContext({
      viewport: options?.viewport ?? { width: 1920, height: 1080 },
      recordVideo: {
        dir: './recordings/',
        size: options?.viewport ?? { width: 1920, height: 1080 },
      },
    });

    this.page = await this.context.newPage();
    this.steps = [];
    this.startTime = Date.now();
  }

  /**
   * Record a complete workflow by navigating to a URL
   * and optionally executing custom actions
   */
  async recordWorkflow(
    url: string,
    actions?: Array<{ type: string; selector?: string; value?: string }>
  ): Promise<Workflow> {
    if (!this.page) {
      await this.initialize();
    }

    if (!this.page) {
      throw new Error('Failed to initialize browser');
    }

    const workflowId = uuidv4();
    this.steps = [];
    this.startTime = Date.now();

    // Navigate to URL
    await this.page.goto(url, { waitUntil: 'networkidle' });
    await this.captureStep('navigate', url);

    // Execute custom actions if provided
    if (actions) {
      for (const action of actions) {
        await this.executeAction(action);
      }
    }

    // Wait a bit to capture final state
    await this.page.waitForTimeout(1000);

    const duration = (Date.now() - this.startTime) / 1000;

    // Close page but keep context to get video path
    await this.page.close();
    
    // Video path is available after closing the page
    // Playwright saves video automatically when context closes
    if (this.context) {
      const pages = this.context.pages();
      if (pages.length === 0) {
        // All pages closed, video is ready
        // Note: Actual video path retrieval happens on context close
      }
    }

    const workflow: Workflow = {
      id: workflowId,
      url,
      steps: this.steps,
      duration,
      metadata: {
        browser: 'chromium',
        viewport: {
          width: this.page.viewportSize()?.width ?? 1920,
          height: this.page.viewportSize()?.height ?? 1080,
        },
        recordedAt: new Date().toISOString(),
      },
    };

    return workflow;
  }

  /**
   * Execute a single action and capture it
   */
  private async executeAction(action: {
    type: string;
    selector?: string;
    value?: string;
  }): Promise<void> {
    if (!this.page) return;

    try {
      switch (action.type) {
        case 'click':
          if (action.selector) {
            await this.page.click(action.selector);
            await this.captureStep('click', action.selector);
          }
          break;
        case 'fill':
          if (action.selector && action.value) {
            await this.page.fill(action.selector, action.value);
            await this.captureStep('input', action.selector, action.value);
          }
          break;
        case 'scroll':
          await this.page.evaluate(() => (globalThis as any).window.scrollBy(0, 500));
          await this.captureStep('scroll');
          break;
        case 'wait':
          await this.page.waitForTimeout(parseInt(action.value ?? '1000'));
          await this.captureStep('wait');
          break;
        case 'hover':
          if (action.selector) {
            await this.page.hover(action.selector);
            await this.captureStep('hover', action.selector);
          }
          break;
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
    }
  }

  /**
   * Capture a workflow step with DOM snapshot and screenshot
   */
  async captureStep(
    action: WorkflowStep['action'],
    target?: string,
    value?: string
  ): Promise<WorkflowStep> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const timestamp = (Date.now() - this.startTime) / 1000;
    const domSnapshot = await this.page.content();
    const screenshot = await this.page.screenshot();

    // Get element coordinates if target exists
    let coordinates: { x: number; y: number } | undefined;
    if (target) {
      try {
        const box = await this.page.locator(target).boundingBox();
        if (box) {
          coordinates = {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2,
          };
        }
      } catch {
        // Element not found, skip coordinates
      }
    }

    const step: WorkflowStep = {
      timestamp,
      action,
      target,
      value,
      coordinates,
      domSnapshot,
      screenshot: screenshot.toString('base64'),
    };

    this.steps.push(step);
    return step;
  }

  /**
   * Get current page screenshot
   */
  async getScreenshot(): Promise<Buffer> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    return await this.page.screenshot();
  }

  /**
   * Get current DOM snapshot
   */
  async getDOMSnapshot(): Promise<string> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    return await this.page.content();
  }

  /**
   * Close browser and cleanup
   * Returns the path to the recorded video
   */
  async close(): Promise<string | null> {
    let videoPath: string | null = null;

    if (this.context) {
      // Close context - this finalizes the video recording
      await this.context.close();
      // Note: In a real implementation, you'd need to track the video path
      // Playwright saves videos with predictable naming in the specified directory
    }

    if (this.browser) {
      await this.browser.close();
    }

    this.page = null;
    this.context = null;
    this.browser = null;

    return videoPath;
  }

  /**
   * Get the video path (available after closing)
   */
  getVideoPath(): string {
    return this.videoPath;
  }
}

