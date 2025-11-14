import type { WorkflowStep } from '../types';

/**
 * Screen recording module
 * Web: Uses MediaRecorder API
 * CLI: Uses native screen capture
 */
export class ScreenRecorder {
  // TODO: Implement screen recording
  // Web: MediaRecorder API
  // CLI: Native screen capture (macOS/Windows/Linux)

  async startRecording(): Promise<void> {
    // TODO: Implement recording start
    throw new Error('Not implemented');
  }

  async stopRecording(): Promise<Blob> {
    // TODO: Implement recording stop and return video blob
    throw new Error('Not implemented');
  }

  async extractMetadata(_videoBlob: Blob): Promise<WorkflowStep[]> {
    // TODO: Extract interaction metadata from recording
    throw new Error('Not implemented');
  }
}

