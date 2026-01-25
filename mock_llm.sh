#!/bin/bash
# mock_llm.sh - A drop-in replacement for the 'llm' command for testing.

INPUT=$(cat -)

# Basic logic to simulate an agent's progress
if [[ "$INPUT" == *"OBSERVATION: "*"version"* || "$INPUT" == *"OBSERVATION:  "*"version"* ]]; then
  echo "THOUGHT: I found the version. Task complete."
  echo "ACTION: exit"
elif [[ "$INPUT" == *"OBSERVATION: {"* ]]; then
  echo "THOUGHT: I have read the package.json. Now I will search for the version."
  echo "ACTION: grep '"version"' package.json"
elif [[ "$INPUT" == *"Find the version in package.json"* ]]; then
  echo "THOUGHT: I see a reference to package.json. I will check its content."
  echo "ACTION: cat package.json"
else
  # Default response if no specific trigger is found
  echo "THOUGHT: I need to explore the environment."
  echo "ACTION: ls -F"
fi
