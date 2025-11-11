import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Loads and processes prompt templates
 */
export class PromptLoader {
  private promptsDir: string;

  constructor(promptsDir?: string) {
    this.promptsDir = promptsDir ?? join(__dirname, '../../../prompts');
  }

  /**
   * Load a prompt template and replace variables
   */
  loadPrompt(
    templateName: string,
    variables: Record<string, string | number>
  ): string {
    const templatePath = join(this.promptsDir, `${templateName}.md`);
    let template: string;
    
    try {
      template = readFileSync(templatePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load prompt template: ${templateName}`);
    }

    // Replace variables in format {variableName}
    let processed = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processed = processed.replace(regex, String(value));
    }

    return processed;
  }

  /**
   * Load workflow analysis prompt
   */
  loadWorkflowAnalysisPrompt(workflow: {
    url: string;
    duration: number;
    stepCount: number;
    actions: string[];
  }): string {
    return this.loadPrompt('workflow-analysis', {
      url: workflow.url,
      duration: workflow.duration,
      stepCount: workflow.stepCount,
      actions: JSON.stringify(workflow.actions),
    });
  }

  /**
   * Load script generation prompt
   */
  loadScriptGenerationPrompt(data: {
    workflowAnalysis: string;
    duration: number;
    audience?: string;
    tone?: string;
    style?: string;
  }): string {
    return this.loadPrompt('script-generation', {
      workflowAnalysis: data.workflowAnalysis,
      duration: data.duration,
      audience: data.audience ?? 'general users',
      tone: data.tone ?? 'professional',
      style: data.style ?? 'informative',
    });
  }

  /**
   * Load video editing instructions prompt
   */
  loadVideoEditingPrompt(data: {
    workflowData: string;
    scriptSegments: string;
  }): string {
    return this.loadPrompt('video-editing', {
      workflowData: data.workflowData,
      scriptSegments: data.scriptSegments,
    });
  }
}

