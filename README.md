# AI-Walkthrough

AI-powered product video automation tool that captures user workflows and generates marketing videos with automated scripts, voiceovers, and text overlays.

## Features

- **Browser Automation**: Record workflows using Playwright
- **Screen Recording**: Capture user interactions via browser or native screen recording
- **AI Script Generation**: Automatically generate marketing narration from workflows
- **Voiceover Generation**: Create professional voiceovers using AI TTS services
- **Video Composition**: Combine recordings with voiceovers and text overlays
- **Web & CLI**: Access via web interface or command-line tool

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: Node.js/TypeScript
- **Frontend**: Next.js 14+ (App Router)
- **CLI**: Commander.js
- **Browser Automation**: Playwright
- **Video Processing**: FFmpeg
- **AI Providers**: OpenAI, Anthropic Claude

## Getting Started

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development servers
pnpm dev

# Run CLI
pnpm --filter @ai-walkthrough/cli dev
```

## Project Structure

```
ai-walkthrough/
├── packages/
│   ├── core/          # Core libraries
│   └── shared/         # Shared utilities
├── apps/
│   ├── web/           # Next.js web application
│   └── cli/           # CLI tool
└── prompts/           # AI prompt templates
```

## License

MIT

