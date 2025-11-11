# Video Editing Instructions Prompt

You are generating instructions for adding text overlays to a marketing video based on a workflow and script. The overlays should enhance understanding and highlight key points.

## Workflow Data:
{workflowData}

## Script Segments:
{scriptSegments}

## Overlay Requirements:

1. **Text Overlays**: Add text overlays that:
   - Highlight important UI elements or actions
   - Reinforce key messages from the script
   - Appear at the right moment to match narration
   - Don't obstruct important visual elements

2. **Positioning**: Determine optimal positions based on:
   - Where the user's attention should be focused
   - Avoiding overlap with important UI elements
   - Maintaining visual balance

3. **Styling**: Use consistent styling:
   - Font size: readable but not overwhelming
   - Colors: high contrast, brand-appropriate
   - Animation: subtle entrance/exit effects
   - Duration: match the timing of the related script segment

## Output Format:
Provide a JSON array of overlay instructions:
```json
[
  {
    "text": "Overlay text",
    "startTime": 2.5,
    "endTime": 5.0,
    "position": { "x": 50, "y": 20 },
    "style": {
      "fontSize": 32,
      "color": "#FFFFFF",
      "backgroundColor": "#00000080",
      "fontFamily": "Arial"
    },
    "animation": "fadeIn"
  }
]
```

## Guidelines:

- Overlays should appear 0.5-1 second before related narration
- Keep text concise (max 5-7 words per overlay)
- Use overlays sparingly - only for key moments
- Ensure text is readable against any background
- Position overlays in the upper or lower third of the screen
- Avoid center positions that block the main action

## Quality Checks:

- Does each overlay enhance understanding?
- Is the timing synchronized with narration?
- Are overlays visually balanced?
- Do they follow a consistent style?
- Will they work across different screen sizes?

