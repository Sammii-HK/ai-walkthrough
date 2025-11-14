#!/bin/bash

# Script to create your first video using production APIs
# Make sure you have API keys configured!

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
URL="${1:-https://example.com}"
OUTPUT_DIR="${OUTPUT_DIR:-./recordings}"

echo "🎬 Creating video for: $URL"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL" > /dev/null; then
  echo "❌ Server not running at $BASE_URL"
  echo "   Start it with: cd apps/web && pnpm dev"
  exit 1
fi

# Step 1: Record workflow
echo "📹 Step 1: Recording workflow..."
RECORD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/workflows/record" \
  -H "Content-Type: application/json" \
  -d "{
    \"url\": \"$URL\",
    \"options\": {
      \"headless\": true
    }
  }")

WORKFLOW_ID=$(echo "$RECORD_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$WORKFLOW_ID" ]; then
  echo "❌ Failed to record workflow"
  echo "$RECORD_RESPONSE"
  exit 1
fi

echo "✅ Workflow recorded: $WORKFLOW_ID"

# Step 2: Generate script
echo ""
echo "📝 Step 2: Generating script..."
SCRIPT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/workflows/$WORKFLOW_ID/script" \
  -H "Content-Type: application/json" \
  -d '{
    "tone": "professional",
    "style": "informative"
  }')

echo "✅ Script generated"

# Step 3: Generate voiceover
echo ""
echo "🎤 Step 3: Generating voiceover..."
VOICEOVER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/workflows/$WORKFLOW_ID/voiceover" \
  -H "Content-Type: application/json" \
  -d "$SCRIPT_RESPONSE")

AUDIO_DATA=$(echo "$VOICEOVER_RESPONSE" | grep -o '"data":"[^"]*' | cut -d'"' -f4)

if [ -n "$AUDIO_DATA" ]; then
  echo "$AUDIO_DATA" | base64 -d > "$OUTPUT_DIR/$WORKFLOW_ID-audio.mp3"
  echo "✅ Voiceover saved: $OUTPUT_DIR/$WORKFLOW_ID-audio.mp3"
fi

echo ""
echo "✅ Pipeline complete!"
echo ""
echo "📁 Files created:"
echo "   - Workflow: $OUTPUT_DIR/$WORKFLOW_ID.json"
echo "   - Audio: $OUTPUT_DIR/$WORKFLOW_ID-audio.mp3"
echo ""
echo "💡 Next: Process the video with CLI:"
echo "   ai-walkthrough process $OUTPUT_DIR/$WORKFLOW_ID.json -o output.mp4"



