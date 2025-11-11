import type { TextOverlay, VideoConfig } from '../types';

/**
 * Mock Video Editor for testing
 * Validates FFmpeg commands without executing them
 * No FFmpeg execution - zero cost, fast tests
 */
export class MockVideoEditor {
  private recordedCommands: string[] = [];
  private shouldFail = false;
  private failReason = '';

  constructor(private config: VideoConfig) {}

  /**
   * Set failure mode for testing error handling
   */
  setShouldFail(shouldFail: boolean, reason = ''): void {
    this.shouldFail = shouldFail;
    this.failReason = reason;
  }

  /**
   * Get recorded FFmpeg commands for validation
   */
  getRecordedCommands(): string[] {
    return this.recordedCommands;
  }

  /**
   * Clear recorded commands
   */
  clearRecordedCommands(): void {
    this.recordedCommands = [];
  }

  async addTextOverlay(
    videoPath: string,
    overlay: TextOverlay,
    outputPath: string
  ): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.failReason || 'Mock FFmpeg error');
    }

    // Validate overlay data
    this.validateOverlay(overlay);

    // Record command
    const command = `ffmpeg -i ${videoPath} -vf "drawtext=text='${overlay.text}':x=${overlay.position.x}:y=${overlay.position.y}" ${outputPath}`;
    this.recordedCommands.push(command);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async addTextOverlays(
    videoPath: string,
    overlays: TextOverlay[],
    outputPath: string
  ): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.failReason || 'Mock FFmpeg error');
    }

    // Validate all overlays
    overlays.forEach((overlay) => this.validateOverlay(overlay));

    // Build filter complex
    const filters = overlays.map((overlay) => {
      const escapedText = overlay.text.replace(/'/g, "\\'");
      return `drawtext=text='${escapedText}':x=${overlay.position.x}:y=${overlay.position.y}:enable='between(t,${overlay.startTime},${overlay.endTime})'`;
    });

    const command = `ffmpeg -i ${videoPath} -vf "${filters.join(',')}" ${outputPath}`;
    this.recordedCommands.push(command);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  async addAudioTrack(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.failReason || 'Mock FFmpeg error');
    }

    const command = `ffmpeg -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest ${outputPath}`;
    this.recordedCommands.push(command);

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async applyTransitions(
    videoPath: string,
    transitions: Array<{ type: string; time: number; duration?: number }>,
    outputPath: string
  ): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.failReason || 'Mock FFmpeg error');
    }

    const filters = transitions.map((t) => {
      const duration = t.duration || 0.5;
      if (t.type === 'fadeIn') {
        return `fade=t=in:st=${t.time}:d=${duration}`;
      }
      if (t.type === 'fadeOut') {
        return `fade=t=out:st=${t.time}:d=${duration}`;
      }
      return '';
    }).filter(Boolean);

    if (filters.length > 0) {
      const command = `ffmpeg -i ${videoPath} -vf "${filters.join(',')}" ${outputPath}`;
      this.recordedCommands.push(command);
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  async getVideoDuration(videoPath: string): Promise<number> {
    // Mock duration - return a fixed value
    return 15.5;
  }

  async resizeVideo(videoPath: string, outputPath: string): Promise<void> {
    if (this.shouldFail) {
      throw new Error(this.failReason || 'Mock FFmpeg error');
    }

    const command = `ffmpeg -i ${videoPath} -s ${this.config.width}x${this.config.height} ${outputPath}`;
    this.recordedCommands.push(command);

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  private validateOverlay(overlay: TextOverlay): void {
    if (!overlay.text || overlay.text.length === 0) {
      throw new Error('Overlay text cannot be empty');
    }
    if (overlay.startTime < 0) {
      throw new Error('Overlay startTime cannot be negative');
    }
    if (overlay.endTime <= overlay.startTime) {
      throw new Error('Overlay endTime must be greater than startTime');
    }
    if (overlay.position.x < 0 || overlay.position.x > 100) {
      throw new Error('Overlay position x must be between 0 and 100');
    }
    if (overlay.position.y < 0 || overlay.position.y > 100) {
      throw new Error('Overlay position y must be between 0 and 100');
    }
  }
}

