import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { Workflow, TextOverlay, ScriptSegment } from '../types';
import { VideoEditor } from './video-editor';
import { VoiceoverGenerator } from '../ai/voiceover-generator';
import { PromptLoader } from '../ai/prompt-loader';
import type { AIProvider } from '../ai/ai-provider';

/**
 * Combines screen recording + voiceover + overlays
 * Handles timing synchronization
 */
export class CompositionEngine {
  private promptLoader: PromptLoader;

  constructor(
    private videoEditor: VideoEditor,
    private voiceoverGenerator: VoiceoverGenerator,
    private aiProvider?: AIProvider
  ) {
    this.promptLoader = new PromptLoader();
  }

  /**
   * Compose final video with all elements
   */
  async composeVideo(
    videoPath: string,
    _workflow: Workflow,
    script: ScriptSegment[],
    overlays: TextOverlay[],
    outputPath: string
  ): Promise<void> {
    const tempDir = tmpdir();
    const tempAudioPath = join(tempDir, `voiceover-${Date.now()}.mp3`);
    const tempVideoWithOverlays = join(tempDir, `video-overlays-${Date.now()}.mp4`);

    try {
      // Step 1: Generate voiceover from script
      console.log('Generating voiceover...');
      const audioBuffer = await this.voiceoverGenerator.generateVoiceover(script);
      writeFileSync(tempAudioPath, audioBuffer);

      // Step 2: Add text overlays to video
      console.log('Adding text overlays...');
      await this.videoEditor.addTextOverlays(videoPath, overlays, tempVideoWithOverlays);

      // Step 3: Add audio track and synchronize
      console.log('Adding audio track...');
      await this.videoEditor.addAudioTrack(tempVideoWithOverlays, tempAudioPath, outputPath);

      console.log('Video composition complete!');
    } finally {
      // Cleanup temp files
      try {
        unlinkSync(tempAudioPath);
        unlinkSync(tempVideoWithOverlays);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Generate overlays using AI analysis
   */
  async generateOverlays(
    workflow: Workflow,
    script: ScriptSegment[]
  ): Promise<TextOverlay[]> {
    if (!this.aiProvider) {
      // Fallback to basic overlay generation
      return this.generateBasicOverlays(workflow, script);
    }

    try {
      const prompt = this.promptLoader.loadVideoEditingPrompt({
        workflowData: JSON.stringify(workflow, null, 2),
        scriptSegments: JSON.stringify(script, null, 2),
      });

      const response = await this.aiProvider.generateText(prompt);

      // Try to parse JSON response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                       response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const overlays = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return this.validateOverlays(overlays, workflow);
      }

      // Fallback to basic generation
      return this.generateBasicOverlays(workflow, script);
    } catch (error) {
      console.error('Failed to generate AI overlays, using basic generation:', error);
      return this.generateBasicOverlays(workflow, script);
    }
  }

  /**
   * Generate basic overlays based on script segments
   */
  private generateBasicOverlays(
    _workflow: Workflow,
    script: ScriptSegment[]
  ): TextOverlay[] {
    const overlays: TextOverlay[] = [];

    script.forEach((segment, index) => {
      // Place overlay in upper third of screen
      const y = 20 + (index % 3) * 100; // Stagger vertically
      const x = 50; // Center horizontally (percentage)

      overlays.push({
        text: segment.text.substring(0, 50), // Limit text length
        startTime: segment.startTime,
        endTime: segment.endTime,
        position: { x, y },
        style: {
          fontSize: 32,
          color: '#FFFFFF',
          backgroundColor: '#00000080',
          fontFamily: 'Arial',
        },
      });
    });

    return overlays;
  }

  /**
   * Validate and normalize overlay data
   */
  private validateOverlays(
    overlays: unknown[],
    workflow: Workflow
  ): TextOverlay[] {
    if (!Array.isArray(overlays)) {
      return [];
    }

    return overlays
      .filter((overlay): overlay is TextOverlay => {
        return (
          typeof overlay === 'object' &&
          overlay !== null &&
          'text' in overlay &&
          'startTime' in overlay &&
          'endTime' in overlay &&
          'position' in overlay &&
          'style' in overlay
        );
      })
      .map((overlay) => ({
        text: String(overlay.text || ''),
        startTime: Math.max(0, Math.min(overlay.startTime, workflow.duration)),
        endTime: Math.max(
          overlay.startTime,
          Math.min(overlay.endTime, workflow.duration)
        ),
        position: {
          x: typeof overlay.position === 'object' && overlay.position !== null
            ? Number((overlay.position as { x?: number }).x ?? 50)
            : 50,
          y: typeof overlay.position === 'object' && overlay.position !== null
            ? Number((overlay.position as { y?: number }).y ?? 20)
            : 20,
        },
        style: {
          fontSize: typeof overlay.style === 'object' && overlay.style !== null
            ? Number((overlay.style as { fontSize?: number }).fontSize ?? 32)
            : 32,
          color: typeof overlay.style === 'object' && overlay.style !== null
            ? String((overlay.style as { color?: string }).color ?? '#FFFFFF')
            : '#FFFFFF',
          backgroundColor:
            typeof overlay.style === 'object' && overlay.style !== null
              ? String(
                  (overlay.style as { backgroundColor?: string }).backgroundColor ??
                    'transparent'
                )
              : 'transparent',
          fontFamily:
            typeof overlay.style === 'object' && overlay.style !== null
              ? String(
                  (overlay.style as { fontFamily?: string }).fontFamily ?? 'Arial'
                )
              : 'Arial',
        },
      }));
  }
}

