import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AIConfig } from '../types';

export interface AIProviderOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Unified interface for multiple AI providers
 * Supports OpenAI and Anthropic Claude
 */
export interface AIProvider {
  generateText(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<string>;
  generateStreamingText(
    prompt: string,
    options?: AIProviderOptions
  ): AsyncGenerator<string>;
}

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(private config: AIConfig) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  async generateText(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<string> {
    const model = options?.model ?? this.config.model ?? 'gpt-4-turbo-preview';
    
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  }

  async *generateStreamingText(
    prompt: string,
    options?: AIProviderOptions
  ): AsyncGenerator<string> {
    const model = options?.model ?? this.config.model ?? 'gpt-4-turbo-preview';

    const stream = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor(private config: AIConfig) {
    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async generateText(
    prompt: string,
    options?: AIProviderOptions
  ): Promise<string> {
    const model = options?.model ?? this.config.model ?? 'claude-3-opus-20240229';

    const response = await this.client.messages.create({
      model,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return content.text;
  }

  async *generateStreamingText(
    prompt: string,
    options?: AIProviderOptions
  ): AsyncGenerator<string> {
    const model = options?.model ?? this.config.model ?? 'claude-3-opus-20240229';

    const stream = await this.client.messages.stream({
      model,
      max_tokens: options?.maxTokens ?? 4096,
      temperature: options?.temperature ?? 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}

export function createAIProvider(config: AIConfig): AIProvider {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config);
    case 'anthropic':
      return new AnthropicProvider(config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

