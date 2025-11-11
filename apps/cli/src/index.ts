#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { BrowserAutomation } from '@ai-walkthrough/core';
import { createAIProvider } from '@ai-walkthrough/core';
import { ScriptGenerator } from '@ai-walkthrough/core';
import { VoiceoverGenerator } from '@ai-walkthrough/core';
import { VideoEditor, CompositionEngine } from '@ai-walkthrough/core';
import type { AIConfig, VoiceoverConfig, VideoConfig } from '@ai-walkthrough/core';

const program = new Command();
const configPath = join(homedir(), '.ai-walkthrough', 'config.json');

interface Config {
  ai?: AIConfig;
  voiceover?: VoiceoverConfig;
}

function loadConfig(): Config {
  if (existsSync(configPath)) {
    try {
      return JSON.parse(readFileSync(configPath, 'utf-8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveConfig(config: Config): void {
  const dir = join(homedir(), '.ai-walkthrough');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(configPath, JSON.stringify(config, null, 2));
}

program
  .name('ai-walkthrough')
  .description('AI-powered product video automation tool')
  .version('0.1.0');

program
  .command('record')
  .description('Record a workflow using browser automation')
  .argument('<url>', 'URL to record')
  .option('-o, --output <path>', 'Output directory for recording', './recordings')
  .option('--headless', 'Run browser in headless mode', false)
  .option('--actions <json>', 'JSON array of actions to perform', '[]')
  .action(async (url, options) => {
    console.log(`🎬 Recording workflow for: ${url}`);
    
    const automation = new BrowserAutomation();
    
    try {
      await automation.initialize({
        headless: options.headless,
      });

      let actions;
      try {
        actions = JSON.parse(options.actions);
      } catch {
        actions = [];
      }

      const workflow = await automation.recordWorkflow(url, actions);
      
      // Save workflow
      const outputDir = options.output;
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }
      
      const workflowPath = join(outputDir, `${workflow.id}.json`);
      writeFileSync(workflowPath, JSON.stringify(workflow, null, 2));
      
      console.log(`✅ Workflow recorded: ${workflowPath}`);
      console.log(`   Duration: ${workflow.duration.toFixed(2)}s`);
      console.log(`   Steps: ${workflow.steps.length}`);
      
      await automation.close();
    } catch (error) {
      console.error('❌ Error recording workflow:', error);
      await automation.close();
      process.exit(1);
    }
  });

program
  .command('process')
  .description('Generate video from recording')
  .argument('<workflow>', 'Path to workflow JSON file')
  .option('-o, --output <path>', 'Output video path', './output.mp4')
  .option('--tone <tone>', 'Script tone (professional/casual/energetic)', 'professional')
  .option('--style <style>', 'Script style (informative/demonstrative/persuasive)', 'informative')
  .action(async (workflowPath, options) => {
    console.log(`🎥 Processing workflow: ${workflowPath}`);
    
    if (!existsSync(workflowPath)) {
      console.error(`❌ Workflow file not found: ${workflowPath}`);
      process.exit(1);
    }

    try {
      await processWorkflow(workflowPath, options.output, options.tone, options.style);
    } catch (error) {
      console.error('❌ Error processing workflow:', error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Configure AI provider credentials')
  .option('--ai-provider <provider>', 'AI provider (openai/anthropic)', 'openai')
  .option('--ai-key <key>', 'AI provider API key')
  .option('--tts-provider <provider>', 'TTS provider (openai/elevenlabs)', 'openai')
  .option('--voice <voice>', 'TTS voice (for OpenAI: alloy/echo/fable/onyx/nova/shimmer)')
  .action((options) => {
    console.log('⚙️  Configuring AI Walkthrough...');
    
    const config = loadConfig();
    
    if (options.aiProvider && options.aiKey) {
      config.ai = {
        provider: options.aiProvider as 'openai' | 'anthropic',
        apiKey: options.aiKey,
      };
      console.log(`✅ AI provider set: ${options.aiProvider}`);
    }
    
    if (options.ttsProvider) {
      config.voiceover = {
        provider: options.ttsProvider as 'openai' | 'elevenlabs' | 'google',
        voice: options.voice || 'alloy',
      };
      console.log(`✅ TTS provider set: ${options.ttsProvider}`);
    }
    
    if (!options.aiProvider && !options.ttsProvider) {
      // Interactive mode
      console.log('\nCurrent configuration:');
      console.log(JSON.stringify(config, null, 2));
      console.log('\nUse --ai-provider, --ai-key, --tts-provider, --voice to configure.');
      console.log('Example:');
      console.log('  ai-walkthrough config --ai-provider openai --ai-key sk-...');
    } else {
      saveConfig(config);
      console.log(`✅ Configuration saved to: ${configPath}`);
    }
  });

async function processWorkflow(
  workflowPath: string,
  outputPath: string,
  tone: string,
  style: string
): Promise<void> {
  const config = loadConfig();
  if (!config.ai) {
    throw new Error('AI provider not configured. Run "ai-walkthrough config" first.');
  }

  // Load workflow
  const workflow = JSON.parse(readFileSync(workflowPath, 'utf-8'));
  
  // Initialize AI provider
  const aiProvider = createAIProvider(config.ai);
  const scriptGenerator = new ScriptGenerator(aiProvider);
  
  // Generate script
  console.log('📝 Generating script...');
  const script = await scriptGenerator.generateScript(workflow, { tone, style });
  console.log(`✅ Generated ${script.length} script segments`);

  // Generate voiceover
  console.log('🎤 Generating voiceover...');
  const voiceoverConfig: VoiceoverConfig = config.voiceover || {
    provider: 'openai',
    voice: 'alloy',
  };
  const voiceoverGenerator = new VoiceoverGenerator(voiceoverConfig);
  
  if (voiceoverConfig.provider === 'openai' && config.ai.provider === 'openai') {
    voiceoverGenerator.setOpenAIKey(config.ai.apiKey);
  }
  
  const audioBuffer = await voiceoverGenerator.generateVoiceover(script);
  const audioPath = workflowPath.replace('.json', '-audio.mp3');
  writeFileSync(audioPath, audioBuffer);
  console.log(`✅ Voiceover saved: ${audioPath}`);

  // Generate overlays
  console.log('🎨 Generating text overlays...');
  const videoConfig: VideoConfig = {
    width: workflow.metadata.viewport.width,
    height: workflow.metadata.viewport.height,
    fps: 30,
    format: 'mp4',
  };
  const videoEditor = new VideoEditor(videoConfig);
  const compositionEngine = new CompositionEngine(
    videoEditor,
    voiceoverGenerator,
    aiProvider
  );
  
  const overlays = await compositionEngine.generateOverlays(workflow, script);
  console.log(`✅ Generated ${overlays.length} text overlays`);

  // Get video path from workflow (if available)
  const videoPath = workflow.videoPath || workflowPath.replace('.json', '.webm');
  if (!existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  // Compose final video
  console.log('🎬 Composing final video...');
  await compositionEngine.composeVideo(
    videoPath,
    workflow,
    script,
    overlays,
    outputPath
  );

  console.log(`✅ Video created: ${outputPath}`);
}

program
  .command('batch')
  .description('Process multiple recordings')
  .argument('<directory>', 'Directory containing workflow JSON files')
  .option('-o, --output <dir>', 'Output directory for videos', './output')
  .option('--tone <tone>', 'Script tone', 'professional')
  .option('--style <style>', 'Script style', 'informative')
  .action(async (directory, options) => {
    console.log(`📦 Batch processing workflows in: ${directory}`);
    
    if (!existsSync(directory)) {
      console.error(`❌ Directory not found: ${directory}`);
      process.exit(1);
    }

    const { readdirSync } = await import('fs');
    const files = readdirSync(directory).filter((f) => f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('No workflow files found.');
      return;
    }

    console.log(`Found ${files.length} workflow files`);

    if (!existsSync(options.output)) {
      mkdirSync(options.output, { recursive: true });
    }

    for (const file of files) {
      const workflowPath = join(directory, file);
      const outputPath = join(options.output, file.replace('.json', '.mp4'));
      
      console.log(`\n📄 Processing: ${file}`);
      
      try {
        await processWorkflow(workflowPath, outputPath, options.tone, options.style);
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error);
        // Continue with next file
      }
    }

    console.log(`\n✅ Batch processing complete! Output: ${options.output}`);
  });

program.parse();

