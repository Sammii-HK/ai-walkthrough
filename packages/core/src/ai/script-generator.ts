import type { Workflow, ScriptSegment } from '../types';
import type { AIProvider } from './ai-provider';
import { PromptLoader } from './prompt-loader';

/**
 * Generates marketing-focused narration scripts from workflow data
 */
export class ScriptGenerator {
  private promptLoader: PromptLoader;

  constructor(private aiProvider: AIProvider) {
    this.promptLoader = new PromptLoader();
  }

  /**
   * Analyze workflow to understand key features and user journey
   */
  async analyzeWorkflow(workflow: Workflow): Promise<{
    features: string[];
    journey: Array<{ timestamp: number; description: string }>;
    highlights: Array<{ timestamp: number; description: string }>;
    uiElements: string[];
    valueProps: string[];
  }> {
    const actions = workflow.steps.map((step) => step.action);
    const prompt = this.promptLoader.loadWorkflowAnalysisPrompt({
      url: workflow.url,
      duration: workflow.duration,
      stepCount: workflow.steps.length,
      actions,
    });

    const analysisText = await this.aiProvider.generateText(prompt);
    
    try {
      // Try to parse JSON response
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      // Fallback: return structured object from text
      return this.parseAnalysisText(analysisText);
    } catch (error) {
      // If parsing fails, return a basic structure
      console.error('Failed to parse workflow analysis:', error);
      return {
        features: [],
        journey: [],
        highlights: [],
        uiElements: [],
        valueProps: [],
      };
    }
  }

  /**
   * Generate script segments from workflow analysis
   */
  async generateScript(
    workflow: Workflow,
    options?: { tone?: string; style?: string; audience?: string }
  ): Promise<ScriptSegment[]> {
    // First analyze the workflow
    const analysis = await this.analyzeWorkflow(workflow);
    
    // Generate script using the analysis
    const prompt = this.promptLoader.loadScriptGenerationPrompt({
      workflowAnalysis: JSON.stringify(analysis, null, 2),
      duration: workflow.duration,
      audience: options?.audience,
      tone: options?.tone,
      style: options?.style,
    });

    const scriptText = await this.aiProvider.generateText(prompt);

    try {
      // Try to parse JSON response
      const jsonMatch = scriptText.match(/```json\n([\s\S]*?)\n```/) || 
                       scriptText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const segments = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        return this.validateAndNormalizeSegments(segments, workflow.duration);
      }
      // Fallback: parse from text format
      return this.parseScriptText(scriptText, workflow.duration);
    } catch (error) {
      console.error('Failed to parse script:', error);
      // Return basic segments based on workflow steps
      return this.generateBasicSegments(workflow);
    }
  }

  /**
   * Parse analysis text into structured format
   */
  private parseAnalysisText(_text: string): {
    features: string[];
    journey: Array<{ timestamp: number; description: string }>;
    highlights: Array<{ timestamp: number; description: string }>;
    uiElements: string[];
    valueProps: string[];
  } {
    // Basic parsing - can be enhanced
    return {
      features: [],
      journey: [],
      highlights: [],
      uiElements: [],
      valueProps: [],
    };
  }

  /**
   * Parse script text into segments
   */
  private parseScriptText(text: string, duration: number): ScriptSegment[] {
    // Basic parsing - split by lines and create segments
    const lines = text.split('\n').filter((line) => line.trim());
    const segmentDuration = duration / lines.length;
    
    return lines.map((line, index) => ({
      startTime: index * segmentDuration,
      endTime: (index + 1) * segmentDuration,
      text: line.trim(),
      emphasis: [],
    }));
  }

  /**
   * Validate and normalize script segments
   */
  private validateAndNormalizeSegments(
    segments: unknown[],
    maxDuration: number
  ): ScriptSegment[] {
    if (!Array.isArray(segments)) {
      return [];
    }

    return segments
      .filter((seg): seg is ScriptSegment => {
        return (
          typeof seg === 'object' &&
          seg !== null &&
          'startTime' in seg &&
          'endTime' in seg &&
          'text' in seg
        );
      })
      .map((seg) => ({
        startTime: Math.max(0, Math.min(seg.startTime, maxDuration)),
        endTime: Math.max(seg.startTime, Math.min(seg.endTime, maxDuration)),
        text: String(seg.text || ''),
        emphasis: Array.isArray(seg.emphasis) ? seg.emphasis : [],
      }))
      .sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Generate basic script segments from workflow steps
   */
  private generateBasicSegments(workflow: Workflow): ScriptSegment[] {
    const keySteps = workflow.steps.filter(
      (step) => step.action === 'click' || step.action === 'navigate'
    );

    if (keySteps.length === 0) {
      return [
        {
          startTime: 0,
          endTime: workflow.duration,
          text: 'Watch as we demonstrate this workflow.',
          emphasis: [],
        },
      ];
    }

    const segmentDuration = workflow.duration / keySteps.length;
    
    return keySteps.map((step, index) => ({
      startTime: step.timestamp,
      endTime: Math.min(step.timestamp + segmentDuration, workflow.duration),
      text: `Step ${index + 1}: ${step.action}${step.target ? ` on ${step.target}` : ''}`,
      emphasis: [],
    }));
  }
}

