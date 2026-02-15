# Product Guidelines - loopy

## Prose and Voice
- **Tone:** Technical and Concise.
- **Style:** Communication should be direct, efficient, and data-focused. Avoid conversational filler or excessive politeness. Prioritize clarity and information density.

## Visual Identity
- **Aesthetic:** Data-Rich and Dense.
- **UI Design:** Maximize information density across the four panels (Memory, Goals, Self, Activity). Use clear headers, consistent spacing, and functional glyphs to organize information without wasting screen real estate.
- **Responsiveness:** The layout must adapt using flex-like logic to provide a usable experience on both vertical (portrait) and horizontal (landscape) terminal windows.

## User Interaction
- **Error Handling:** Use non-intrusive error reporting. System notifications and errors should primarily appear within the 'Activity' panel.
- **Continuity:** The agent's loop should remain uninterrupted by minor errors. Only halt the process if an error prevents further safe or logical execution.
- **Transparency:** Every action taken by the agent (tool calls, thoughts, results) must be clearly logged in the 'Activity' panel to ensure the user can audit the agentic loop.

## Design Principles
1. **Efficiency First:** The interface is built for power users who value speed and density.
2. **Contextual Awareness:** The multi-panel layout ensures that the most important context (Memory, Goals, Identity) is always visible during the agentic loop.
3. **Model Independence:** The UI should remain consistent regardless of which AI model is currently driving the agent.