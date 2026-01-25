#!/bin/bash

# rlm.sh - Modular Recursive LLM Harness
# Usage: ./rlm.sh "Your initial task description"

# --- Source Modular Components ---
export SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/src"
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory '$SOURCE_DIR' missing."
    exit 1
fi

# shellcheck source=src/llm_adapter.sh
source "$SOURCE_DIR/llm_adapter.sh"
# shellcheck source=src/tools.sh
source "$SOURCE_DIR/tools.sh"
# shellcheck source=src/core.sh
source "$SOURCE_DIR/core.sh"

# --- Initialization ---
MODEL=""
CONTEXT_FILE="context.md"
MAX_ITERATIONS=10

usage() {
    echo "Usage: $0 [options] <prompt>"
    echo ""
    echo "Options:"
    echo "  -m, --model <model>    Specify the LLM model to use (e.g., gemini-preview)"
    echo "  -c, --context <file>   Specify the context file (default: context.md)"
    echo "  -h, --help             Show this help message"
    exit 0
}

while [[ $# -gt 0 ]]; do
    case $1 in
        -m|--model)
            MODEL="$2"
            shift 2
            ;;
        -c|--context)
            CONTEXT_FILE="$2"
            shift 2
            ;;
        -h|--help)
            usage
            ;;
        -*)
            echo "Unknown option: $1"
            usage
            ;;
        *)
            PROMPT="$1"
            shift
            ;;
    esac
done

if [ -z "$PROMPT" ]; then
    usage
fi

# Export MODEL for use in other scripts
export LLM_MODEL="$MODEL"

# Verify dependencies
check_llm_dependency || exit 1

echo "TASK: $PROMPT" > "$CONTEXT_FILE"
echo "Starting RLM loop for task: $PROMPT"

# --- Execution ---
run_rlm_loop "$CONTEXT_FILE" "$MAX_ITERATIONS"

echo "RLM loop finished. See '$CONTEXT_FILE' for details."
