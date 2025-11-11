import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const configPath = join(homedir(), '.ai-walkthrough', 'config.json');

interface Config {
  ai?: {
    provider: string;
    apiKey: string;
  };
  voiceover?: {
    provider: string;
    voice: string;
  };
}

/**
 * GET /api/config
 * Get current configuration
 */
export async function GET() {
  try {
    if (!existsSync(configPath)) {
      return NextResponse.json({
        success: true,
        config: {},
      });
    }

    const config = JSON.parse(readFileSync(configPath, 'utf-8'));
    
    // Don't expose API keys in response
    const safeConfig = {
      ...config,
      ai: config.ai ? { provider: config.ai.provider } : undefined,
      voiceover: config.voiceover,
    };

    return NextResponse.json({
      success: true,
      config: safeConfig,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/config
 * Update configuration
 * Body: { ai?, voiceover? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ai, voiceover } = body;

    // Load existing config
    let config: Config = {};
    if (existsSync(configPath)) {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
    }

    // Update config
    if (ai) {
      config.ai = ai;
    }
    if (voiceover) {
      config.voiceover = voiceover;
    }

    // Save config
    const dir = join(homedir(), '.ai-walkthrough');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(configPath, JSON.stringify(config, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Configuration updated',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

