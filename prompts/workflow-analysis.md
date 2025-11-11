# Workflow Analysis Prompt

You are analyzing a user workflow captured from a web application or website. Your task is to identify key features, user journey steps, and important moments that should be highlighted in a marketing video.

## Workflow Data:
- URL: {url}
- Duration: {duration} seconds
- Steps: {stepCount}
- Actions: {actions}

## Your Analysis Should Include:

1. **Key Features Identified**: List the main features or functionality demonstrated
2. **User Journey**: Describe the flow from start to finish
3. **Important Moments**: Identify timestamps and actions that are most significant
4. **UI Elements**: Note important buttons, forms, or interface elements
5. **Value Propositions**: What benefits or value does this workflow demonstrate?

## Output Format:
Provide a structured JSON response with:
- features: array of key features
- journey: array of journey steps with timestamps
- highlights: array of important moments with timestamps and descriptions
- uiElements: array of important UI elements
- valueProps: array of value propositions

## Guidelines:
- Focus on what makes this workflow valuable or interesting
- Identify moments that would be compelling in a marketing video
- Note any unique or standout features
- Consider the user's perspective and what they're trying to accomplish

