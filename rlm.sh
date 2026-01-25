#!/bin/bash

# rlm.sh - Modular Recursive LLM Harness
# Usage: ./rlm.sh "Your initial task description"

# --- Source Modular Components ---
SOURCE_DIR="src"
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' missing."
    exit 1
fi

source "$SOURCE_DIR/llm_adapter.sh"
source "$SOURCE_DIR/tools.sh"
source "$SOURCE_DIR/core.sh"

# --- Configuration ---
CONTEXT_FILE="context.md"
MAX_ITERATIONS=10

# --- Initialization ---
PROMPT=$1
if [ -z "$PROMPT" ]; then
    echo "Usage: $0 <prompt>"
    exit 1
fi

# Verify dependencies
check_llm_dependency || exit 1

echo "TASK: $PROMPT" > "$CONTEXT_FILE"
echo "Starting RLM loop for task: $PROMPT"

# --- Execution ---
run_rlm_loop "$CONTEXT_FILE" "$MAX_ITERATIONS"

echo "RLM loop finished. See '$CONTEXT_FILE' for details."
