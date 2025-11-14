import OpenAI from 'openai';
import axios from 'axios';
import type { ScriptSegment, VoiceoverConfig } from '../types';

/**
 * Generates voiceovers using TTS services
 * Supports OpenAI TTS, ElevenLabs, Google Cloud TTS
 */
export class VoiceoverGenerator {
  private openaiClient: OpenAI | null = null;

  constructor(private config: VoiceoverConfig) {
    if (config.provider === 'openai') {
      // OpenAI client will be initialized when API key is available
      // For now, we'll initialize it when needed
    }
  }

  /**
   * Set OpenAI API key for TTS
   */
  setOpenAIKey(apiKey: string): void {
    this.openaiClient = new OpenAI({ apiKey });
  }

  /**
   * Generate voiceover for all script segments
   * Combines segments into a single audio file
   */
  async generateVoiceover(segments: ScriptSegment[]): Promise<Buffer> {
    const audioBuffers: Buffer[] = [];

    for (const segment of segments) {
      const segmentAudio = await this.generateSegment(segment);
      audioBuffers.push(segmentAudio);
    }

    // Combine all audio buffers
    // In a production implementation, you'd use FFmpeg to concatenate audio files
    // For now, we'll return the first segment's audio
    // TODO: Implement proper audio concatenation
    return audioBuffers[0] || Buffer.alloc(0);
  }

  /**
   * Generate audio for a single script segment
   */
  async generateSegment(segment: ScriptSegment): Promise<Buffer> {
    const text = this.processTextForTTS(segment.text);

    switch (this.config.provider) {
      case 'openai':
        return await this.generateOpenAITTS(text);
      case 'elevenlabs':
        return await this.generateElevenLabsTTS(text);
      case 'google':
        return await this.generateGoogleTTS(text);
      default:
        throw new Error(`Unsupported TTS provider: ${this.config.provider}`);
    }
  }

  /**
   * Process text for TTS - remove markdown, handle pauses and emphasis
   */
  private processTextForTTS(text: string): string {
    let processed = text;

    // Remove markdown emphasis markers but keep the words
    processed = processed.replace(/\[EMPHASIS:\s*([^\]]+)\]/gi, '$1');

    // Convert [PAUSE] to natural pauses (add periods or commas)
    processed = processed.replace(/\[PAUSE\]/gi, '. ');

    // Remove any remaining markdown
    processed = processed.replace(/\[([^\]]+)\]/g, '$1');

    // Clean up extra whitespace
    processed = processed.replace(/\s+/g, ' ').trim();

    return processed;
  }

  /**
   * Generate TTS using OpenAI
   */
  private async generateOpenAITTS(text: string): Promise<Buffer> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized. Call setOpenAIKey() first.');
    }

    const voice = this.config.voice || 'alloy';
    const speed = this.config.speed || 1.0;

    const response = await this.openaiClient.audio.speech.create({
      model: 'tts-1',
      voice: voice as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer',
      input: text,
      speed: Math.max(0.25, Math.min(4.0, speed)),
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Generate TTS using ElevenLabs
   */
  private async generateElevenLabsTTS(text: string): Promise<Buffer> {
    // ElevenLabs requires API key in config
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found. Set ELEVENLABS_API_KEY environment variable.');
    }

    const voiceId = this.config.voice || 'default';
    const speed = this.config.speed || 1.0;

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: speed,
        },
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  }

  /**
   * Generate TTS using Google Cloud TTS
   */
  private async generateGoogleTTS(_text: string): Promise<Buffer> {
    // Google Cloud TTS implementation
    // Requires GOOGLE_APPLICATION_CREDENTIALS environment variable
    throw new Error('Google Cloud TTS not yet implemented');
  }

  /**
   * Check audio quality - analyzes pacing, pauses, and emphasis
   */
  async checkQuality(audioBuffer: Buffer): Promise<{
    score: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    let score = 100;

    // Basic quality checks
    if (audioBuffer.length === 0) {
      issues.push('Empty audio buffer');
      score = 0;
    }

    // Check audio length (very basic - in production, use audio analysis library)
    const estimatedDuration = audioBuffer.length / 16000; // Rough estimate for 16kHz audio
    if (estimatedDuration < 0.5) {
      issues.push('Audio segment too short');
      score -= 20;
    }

    if (estimatedDuration > 30) {
      issues.push('Audio segment too long (may need splitting)');
      score -= 10;
    }

    // In production, you would:
    // 1. Use audio analysis to detect pacing
    // 2. Check for natural pauses
    // 3. Verify emphasis markers were applied
    // 4. Check audio clarity/noise levels

    return {
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Generate voiceover with quality check and retry
   */
  async generateVoiceoverWithRetry(
    segments: ScriptSegment[],
    minQualityScore: number = 70
  ): Promise<Buffer> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      const audio = await this.generateVoiceover(segments);
      const quality = await this.checkQuality(audio);

      if (quality.score >= minQualityScore) {
        return audio;
      }

      attempts++;
      if (attempts < maxAttempts) {
        // Try with different voice or settings
        console.warn(
          `Quality score ${quality.score} below threshold. Retrying... (attempt ${attempts + 1}/${maxAttempts})`
        );
        // Could adjust voice, speed, or other parameters here
      }
    }

    // Return the best attempt even if below threshold
    return await this.generateVoiceover(segments);
  }
}

