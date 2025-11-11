import type { ScriptSegment, VoiceoverConfig } from '../types';

/**
 * Mock Voiceover Generator for testing
 * Returns sample audio buffers without real TTS calls
 * No API costs - zero cost
 */
export class MockVoiceoverGenerator {
  constructor(private config: VoiceoverConfig) {}

  /**
   * Generate mock audio buffer
   * Creates a minimal valid audio file structure
   */
  async generateVoiceover(segments: ScriptSegment[]): Promise<Buffer> {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Calculate total duration
    const totalDuration = Math.max(...segments.map((s) => s.endTime), 0);
    
    // Generate mock audio buffer
    // This is a minimal WAV file header + silent audio data
    const sampleRate = 16000;
    const channels = 1;
    const bitsPerSample = 16;
    const duration = Math.ceil(totalDuration);
    const dataSize = sampleRate * channels * (bitsPerSample / 8) * duration;

    // WAV file header
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20); // audio format (PCM)
    header.writeUInt16LE(channels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * channels * (bitsPerSample / 8), 28);
    header.writeUInt16LE(channels * (bitsPerSample / 8), 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);

    // Generate silent audio data
    const audioData = Buffer.alloc(dataSize, 0);

    return Buffer.concat([header, audioData]);
  }

  async generateSegment(segment: ScriptSegment): Promise<Buffer> {
    return this.generateVoiceover([segment]);
  }

  async checkQuality(audioBuffer: Buffer): Promise<{
    score: number;
    issues: string[];
  }> {
    // Mock quality check - always returns good quality
    return {
      score: 85,
      issues: [],
    };
  }

  async generateVoiceoverWithRetry(
    segments: ScriptSegment[],
    minQualityScore: number = 70
  ): Promise<Buffer> {
    const audio = await this.generateVoiceover(segments);
    const quality = await this.checkQuality(audio);

    if (quality.score >= minQualityScore) {
      return audio;
    }

    // If quality is low, return anyway (it's a mock)
    return audio;
  }

  setOpenAIKey(_apiKey: string): void {
    // Mock - no-op
  }
}

