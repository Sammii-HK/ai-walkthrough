# Setting Up Production API Testing

This guide will help you test the production endpoints and create your first video.

## Prerequisites

1. **API Keys Required:**
   - OpenAI API key (for script generation and TTS)
   - OR Anthropic API key (for script generation only)

2. **Install FFmpeg** (for video processing):
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt-get install ffmpeg
   
   # Windows
   # Download from https://ffmpeg.org/download.html
   ```

## Step 1: Configure API Keys

### Option A: Environment Variables (Recommended)

Create a `.env.local` file in `apps/web/`:

```bash
# For OpenAI (script + TTS)
OPENAI_API_KEY=sk-your-key-here

# OR for Anthropic (script only)
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_PROVIDER=anthropic

# Use real APIs (not mocks)
USE_MOCKS=false
```

### Option B: Use Config API

```bash
# Set config via API
curl -X POST http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "ai": {
      "provider": "openai",
      "apiKey": "sk-your-key-here"
    },
    "voiceover": {
      "provider": "openai",
      "voice": "alloy"
    }
  }'
```

## Step 2: Start the Dev Server

```bash
cd apps/web
pnpm dev
```

The server will start on `http://localhost:3000`

## Step 3: Run the Production Test

```bash
# Make sure USE_MOCKS is not set or is false
unset USE_MOCKS
# or
export USE_MOCKS=false

# Run the test
npx playwright test tests/api/create-first-video.spec.ts --headed
```

## Step 4: Test with Your Own Website

Edit `tests/api/create-first-video.spec.ts` and change:

```typescript
url: 'https://your-website.com', // Your actual website
```

Or set environment variable:

```bash
TEST_URL=https://your-website.com npx playwright test tests/api/create-first-video.spec.ts
```

## Step 5: Complete Video Generation

After the test runs, you'll have:
- Workflow JSON file
- Script segments
- Audio file (voiceover)

To create the final video, use the CLI:

```bash
# From project root
ai-walkthrough process recordings/workflow-id.json -o my-first-video.mp4
```

## Troubleshooting

### "AI API key not configured"
- Make sure your API key is set in `.env.local` or via config API
- Check that `USE_MOCKS=false` or not set

### "Video file not found"
- The workflow recording creates a video file automatically
- Check the `recordings/` directory for `.webm` files
- The video path should be in the workflow JSON

### FFmpeg errors
- Make sure FFmpeg is installed: `ffmpeg -version`
- Check that FFmpeg is in your PATH

### API Rate Limits
- OpenAI has rate limits on free tier
- Consider using mocks for development/testing
- Use production APIs only when ready to create final videos

## Cost Estimation

- **OpenAI GPT-4**: ~$0.01-0.03 per script generation
- **OpenAI TTS**: ~$0.015 per 1000 characters
- **Anthropic Claude**: Similar pricing

For a typical 30-second video:
- Script generation: ~$0.02
- Voiceover: ~$0.01
- **Total: ~$0.03 per video**

## Next Steps

1. Test with a simple website first (like example.com)
2. Try different tones and styles
3. Experiment with different voices
4. Process the final video using CLI
5. Share your results!



