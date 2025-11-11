import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../__mocks__/mock-ai-provider';
import type { AIConfig } from '../types';

describe('MockAIProvider', () => {
  const config: AIConfig = {
    provider: 'openai',
    apiKey: 'test-key',
  };

  it('should generate workflow analysis response', async () => {
    const provider = new MockAIProvider(config);
    const prompt = 'Analyze this workflow...';
    const response = await provider.generateText(prompt);

    expect(response).toBeDefined();
    const parsed = JSON.parse(response);
    expect(parsed.features).toBeDefined();
    expect(parsed.journey).toBeDefined();
  });

  it('should generate script generation response', async () => {
    const provider = new MockAIProvider(config);
    const prompt = 'Generate a script for this workflow...';
    const response = await provider.generateText(prompt);

    expect(response).toBeDefined();
    const parsed = JSON.parse(response);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toHaveProperty('startTime');
    expect(parsed[0]).toHaveProperty('text');
  });

  it('should support streaming text generation', async () => {
    const provider = new MockAIProvider(config);
    const prompt = 'Test streaming';
    const chunks: string[] = [];

    for await (const chunk of provider.generateStreamingText(prompt)) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.join('')).toBeDefined();
  });
});

