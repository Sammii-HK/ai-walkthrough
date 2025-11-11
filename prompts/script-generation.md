# Script Generation Prompt

You are creating a marketing video narration script based on a user workflow analysis. The script should be engaging, clear, and highlight the value of the product or feature.

## Workflow Analysis:
{workflowAnalysis}

## Video Details:
- Duration: {duration} seconds
- Target Audience: {audience}
- Tone: {tone} (professional/casual/energetic)
- Style: {style} (informative/demonstrative/persuasive)

## Script Requirements:

1. **Opening Hook** (0-5 seconds): Grab attention immediately
2. **Feature Introduction** (5-15 seconds): Introduce what the user is about to see
3. **Step-by-Step Narration**: Narrate each important step with:
   - Clear, concise descriptions
   - Natural pacing (allow time for visual comprehension)
   - Emphasis on benefits, not just features
4. **Closing** (last 5 seconds): Reinforce value proposition or call to action

## Writing Guidelines:

- Use active voice and present tense
- Keep sentences short and punchy
- Match the tone specified (professional/casual/energetic)
- Include natural pauses indicated by [PAUSE]
- Use emphasis markers [EMPHASIS: word] for important points
- Time each segment to match visual actions
- Avoid jargon unless necessary
- Focus on user benefits, not technical details

## Output Format:
Provide a JSON array of script segments:
```json
[
  {
    "startTime": 0,
    "endTime": 5,
    "text": "Script text here",
    "emphasis": ["key", "words"]
  }
]
```

Each segment should:
- Have accurate startTime and endTime in seconds
- Include natural pauses where appropriate
- Match the visual timing of the workflow
- Be engaging and clear

## Example:
For a login workflow:
- "Welcome to our platform. Let me show you how easy it is to get started."
- "First, enter your email address. [PAUSE] Then your password."
- "With one click, you're in. [EMPHASIS: That's it.]"

