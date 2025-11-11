import ffmpeg from 'fluent-ffmpeg';
import type { TextOverlay, VideoConfig } from '../types';

/**
 * FFmpeg wrapper for video manipulation
 * Handles text overlays, audio synchronization, transitions
 */
export class VideoEditor {
  constructor(private config: VideoConfig) {}

  /**
   * Add a single text overlay to video
   */
  async addTextOverlay(
    videoPath: string,
    overlay: TextOverlay,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = overlay.startTime;
      const duration = overlay.endTime - overlay.startTime;
      const x = overlay.position.x;
      const y = overlay.position.y;
      const fontSize = overlay.style.fontSize;
      const fontColor = overlay.style.color;
      const bgColor = overlay.style.backgroundColor || 'transparent';
      const fontFamily = overlay.style.fontFamily || 'Arial';

      // Escape text for FFmpeg
      const escapedText = overlay.text.replace(/'/g, "\\'").replace(/:/g, '\\:');

      // Build FFmpeg filter for text overlay
      let textFilter = `drawtext=text='${escapedText}':fontfile=/System/Library/Fonts/Helvetica.ttc:fontsize=${fontSize}:fontcolor=${fontColor}`;
      
      if (bgColor !== 'transparent') {
        textFilter += `:box=1:boxcolor=${bgColor}@0.8:boxborderw=5`;
      }

      textFilter += `:x=${x}:y=${y}`;

      ffmpeg(videoPath)
        .videoFilters(textFilter)
        .setStartTime(startTime)
        .setDuration(duration)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * Add multiple text overlays to video
   */
  async addTextOverlays(
    videoPath: string,
    overlays: TextOverlay[],
    outputPath: string
  ): Promise<void> {
    if (overlays.length === 0) {
      // Just copy video if no overlays
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });
    }

    // Build complex filter for multiple overlays
    const filters: string[] = [];
    
    overlays.forEach((overlay, index) => {
      const startTime = overlay.startTime;
      const duration = overlay.endTime - overlay.startTime;
      const x = overlay.position.x;
      const y = overlay.position.y;
      const fontSize = overlay.style.fontSize;
      const fontColor = overlay.style.color;
      const bgColor = overlay.style.backgroundColor || 'transparent';
      const fontFamily = overlay.style.fontFamily || 'Arial';
      const escapedText = overlay.text.replace(/'/g, "\\'").replace(/:/g, '\\:');

      let filter = `drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${fontColor}`;
      
      if (bgColor !== 'transparent') {
        filter += `:box=1:boxcolor=${bgColor}@0.8:boxborderw=5`;
      }

      filter += `:x=${x}:y=${y}:enable='between(t,${startTime},${overlay.endTime})'`;

      filters.push(filter);
    });

    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath);
      
      if (filters.length > 0) {
        command = command.videoFilters(filters.join(','));
      }

      command
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * Add audio track to video and synchronize
   */
  async addAudioTrack(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .input(audioPath)
        .outputOptions(['-c:v copy', '-c:a aac', '-map 0:v:0', '-map 1:a:0', '-shortest'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * Apply transition effects
   */
  async applyTransitions(
    videoPath: string,
    transitions: Array<{ type: string; time: number; duration?: number }>,
    outputPath: string
  ): Promise<void> {
    if (transitions.length === 0) {
      // No transitions, just copy
      return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
          .output(outputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .run();
      });
    }

    // For now, implement basic fade transitions
    // More complex transitions would require video segmentation and re-composition
    return new Promise((resolve, reject) => {
      const filters: string[] = [];

      transitions.forEach((transition) => {
        const time = transition.time;
        const duration = transition.duration || 0.5;

        switch (transition.type) {
          case 'fadeIn':
            filters.push(`fade=t=in:st=${time}:d=${duration}`);
            break;
          case 'fadeOut':
            filters.push(`fade=t=out:st=${time}:d=${duration}`);
            break;
          // Add more transition types as needed
        }
      });

      let command = ffmpeg(videoPath);
      if (filters.length > 0) {
        command = command.videoFilters(filters.join(','));
      }

      command
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * Get video duration in seconds
   */
  async getVideoDuration(videoPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        const duration = metadata.format?.duration;
        if (duration === undefined) {
          reject(new Error('Could not determine video duration'));
          return;
        }
        resolve(duration);
      });
    });
  }

  /**
   * Resize video to match config dimensions
   */
  async resizeVideo(videoPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .size(`${this.config.width}x${this.config.height}`)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }
}

