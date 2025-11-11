/**
 * Core type definitions
 */

export interface WorkflowStep {
  timestamp: number;
  action: 'click' | 'scroll' | 'input' | 'navigate' | 'wait' | 'hover';
  target?: string;
  value?: string;
  coordinates?: { x: number; y: number };
  domSnapshot?: string;
  screenshot?: string;
}

export interface Workflow {
  id: string;
  url: string;
  steps: WorkflowStep[];
  duration: number;
  metadata: {
    browser: string;
    viewport: { width: number; height: number };
    recordedAt: string;
  };
}

export interface ScriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  emphasis?: string[];
}

export interface VideoConfig {
  width: number;
  height: number;
  fps: number;
  format: 'mp4' | 'webm';
}

export interface TextOverlay {
  text: string;
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    color: string;
    backgroundColor?: string;
    fontFamily: string;
  };
}

export interface VoiceoverConfig {
  provider: 'openai' | 'elevenlabs' | 'google';
  voice: string;
  speed?: number;
  tone?: 'professional' | 'casual' | 'energetic';
}

export interface AIConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
}

