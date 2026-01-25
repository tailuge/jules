#!/bin/bash

# rlm.sh - Minimal Recursive LLM Harness
# Usage: ./rlm.sh "Your initial task description"

# --- Configuration ---
CONTEXT_FILE="context.md"
MAX_ITERATIONS=10
ITERATION=0
SYSTEM_PROMPT="You are a recursive LLM agent running in a bash environment.
The user will provide a task. You must respond with your thought process and an action.
PROTOCOL:
THOUGHT: <your reasoning>
ACTION: <bash command to execute>

If the task is complete, use 'ACTION: exit'.
Keep actions concise. You have access to standard linux tools.
Your output will be appended to a context file and fed back to you."

# --- Initialization ---
PROMPT=$1
if [ -z "$PROMPT" ]; then
    echo "Usage: $0 <prompt>"
    exit 1
fi

if [ "$MOCK" != "1" ] && ! command -v llm &> /dev/null; then
    echo "Error: 'llm' CLI not found. Please install it or use MOCK=1."
    echo "See: https://llm.datasette.io/en/stable/setup.html"
    exit 1
fi

echo "TASK: $PROMPT" > "$CONTEXT_FILE"

# --- Main Loop ---
while [ $ITERATION -lt $MAX_ITERATIONS ]; do
    ((ITERATION++))
    echo "--- Iteration $ITERATION ---"

    # 1. Get LLM response
    # Use 'tail' to keep context manageable
    if [ "$MOCK" = "1" ]; then
        RESPONSE=$(tail -n 50 "$CONTEXT_FILE" | ./mock_llm.sh)
    else
        # TODO: Ensure 'llm' CLI is installed and configured
        RESPONSE=$(tail -n 50 "$CONTEXT_FILE" | llm -s "$SYSTEM_PROMPT")
    fi

    echo "$RESPONSE" >> "$CONTEXT_FILE"

    # 2. Parse Thought and Action
    # TODO: Improve parsing robustness (e.g., handling multi-line thoughts or complex commands)
    # TODO: Consider using a more structured format like JSON or YAML if parsing becomes brittle
    THOUGHT=$(echo "$RESPONSE" | grep "THOUGHT:" | sed 's/THOUGHT: //')
    ACTION=$(echo "$RESPONSE" | grep "ACTION:" | sed 's/ACTION: //')

    echo "LLM THOUGHT: $THOUGHT"
    echo "LLM ACTION: $ACTION"

    # 3. Handle Exit
    if [[ "$ACTION" == "exit" ]]; then
        echo "Task completed or LLM requested exit."
        break
    fi

    # 4. Execute Action
    if [ -n "$ACTION" ]; then
        echo "Executing: $ACTION"
        # TODO: Implement a safer 'eval' or a restricted execution environment.
        # Currently, this is a dangerous operation if used with untrusted models.
        # TODO: Capture stderr separately and provide it as context.
        OBSERVATION=$(eval "$ACTION" 2>&1)
        # TODO: Implement output truncation if OBSERVATION is too long.
        echo "OBSERVATION: $OBSERVATION" >> "$CONTEXT_FILE"
    else
        echo "No action found in LLM response."
        # TODO: Decide how to handle cases where the LLM doesn't follow the protocol.
        echo "OBSERVATION: No action provided. Please follow the PROTOCOL." >> "$CONTEXT_FILE"
    fi

    echo "" >> "$CONTEXT_FILE"
done

if [ $ITERATION -ge $MAX_ITERATIONS ]; then
    echo "Reached maximum iterations ($MAX_ITERATIONS)."
fi