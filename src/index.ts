import { createCliRenderer, Box, Text } from '@opentui/core';
import { createProvider } from './agent/provider';
import { agentLoop } from './agent/loop';
import { loadConfig } from './config/loader';

export async function main() {
  console.log('🤖 TUI Agent CLI - Starting...\n');

  // Load configuration
  const config = await loadConfig();

  // Initialize provider
  const provider = createProvider(config.model);

  // Create TUI renderer
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
  });

  // Main layout
  renderer.root.add(
    Box(
      {
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        padding: 1,
      },
      // Header
      Box(
        {
          borderStyle: 'rounded',
          borderColor: '#00FF00',
          padding: 1,
          marginBottom: 1,
        },
        Text({ content: '🤖 TUI Agent CLI', fg: '#00FF00', bold: true }),
        Text({ content: `  |  Model: ${config.model.name}`, fg: '#888888' }),
      ),
      // Main content area
      Box(
        {
          flexGrow: 1,
          borderStyle: 'rounded',
          borderColor: '#444444',
          padding: 1,
        },
        Text({ content: 'Type your message below. Press Ctrl+C to exit.', fg: '#888888' }),
      ),
      // Input area
      Box(
        {
          borderStyle: 'rounded',
          borderColor: '#0088FF',
          padding: 1,
          marginTop: 1,
        },
        Text({ content: '> ', fg: '#0088FF' }),
        Text({ content: 'Waiting for input...', fg: '#AAAAAA' }),
      ),
    ),
  );

  console.log('TUI initialized. Ready for messages.');
}
