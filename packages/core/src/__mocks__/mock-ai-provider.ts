import type { AIProvider, AIProviderOptions } from '../ai/ai-provider';
import type { AIConfig } from '../types';

/**
 * Mock AI Provider for testing
 * Returns predefined responses based on prompt patterns
 * No real API calls - zero cost
 */
export class MockAIProvider implements AIProvider {
  constructor(_config: AIConfig) {}

  async generateText(prompt: string, _options?: AIProviderOptions): Promise<string> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Pattern matching for different prompt types
    if (prompt.includes('workflow analysis') || prompt.includes('Workflow Analysis')) {
      return this.getWorkflowAnalysisResponse();
    }

    if (prompt.includes('script generation') || prompt.includes('Script Generation')) {
      return this.getScriptGenerationResponse();
    }

    if (prompt.includes('video editing') || prompt.includes('Video Editing')) {
      return this.getVideoEditingResponse();
    }

    // Default response
    return JSON.stringify({
      result: 'Mock AI response',
      prompt: prompt.substring(0, 100),
    });
  }

  async *generateStreamingText(
    prompt: string,
    options?: AIProviderOptions
  ): AsyncGenerator<string> {
    const response = await this.generateText(prompt, options);
    const words = response.split(' ');
    
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      yield word + ' ';
    }
  }

  private getWorkflowAnalysisResponse(): string {
    return JSON.stringify({
      features: [
        'User authentication',
        'Dashboard navigation',
        'Data visualization',
      ],
      journey: [
        { timestamp: 0, description: 'User lands on homepage' },
        { timestamp: 2, description: 'User clicks login button' },
        { timestamp: 5, description: 'User enters credentials' },
        { timestamp: 8, description: 'User views dashboard' },
      ],
      highlights: [
        { timestamp: 2, description: 'Login button click - key interaction' },
        { timestamp: 8, description: 'Dashboard load - main feature' },
      ],
      uiElements: ['Login button', 'Email input', 'Password input', 'Dashboard'],
      valueProps: [
        'Quick and easy authentication',
        'Intuitive dashboard interface',
        'Clear data visualization',
      ],
    });
  }

  private getScriptGenerationResponse(): string {
    return JSON.stringify([
      {
        startTime: 0,
        endTime: 3,
        text: 'Welcome to our platform. Let me show you how easy it is to get started.',
        emphasis: ['easy', 'started'],
      },
      {
        startTime: 3,
        endTime: 6,
        text: 'First, click the login button in the top right corner.',
        emphasis: ['login'],
      },
      {
        startTime: 6,
        endTime: 10,
        text: 'Enter your email address and password.',
        emphasis: [],
      },
      {
        startTime: 10,
        endTime: 15,
        text: "Once logged in, you'll see your personalized dashboard with all your data.",
        emphasis: ['personalized', 'dashboard'],
      },
    ]);
  }

  private getVideoEditingResponse(): string {
    return JSON.stringify([
      {
        text: 'Click to Login',
        startTime: 3,
        endTime: 6,
        position: { x: 80, y: 15 },
        style: {
          fontSize: 28,
          color: '#FFFFFF',
          backgroundColor: '#00000080',
          fontFamily: 'Arial',
        },
        animation: 'fadeIn',
      },
      {
        text: 'Enter Credentials',
        startTime: 6,
        endTime: 10,
        position: { x: 50, y: 50 },
        style: {
          fontSize: 32,
          color: '#FFFFFF',
          backgroundColor: '#00000080',
          fontFamily: 'Arial',
        },
        animation: 'fadeIn',
      },
      {
        text: 'Dashboard View',
        startTime: 10,
        endTime: 15,
        position: { x: 50, y: 20 },
        style: {
          fontSize: 36,
          color: '#FFFFFF',
          backgroundColor: '#00000080',
          fontFamily: 'Arial',
        },
        animation: 'fadeIn',
      },
    ]);
  }
}

