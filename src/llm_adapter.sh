#!/bin/bash
# src/llm_adapter.sh

# Function to check for dependencies
check_llm_dependency() {
    if ! command -v llm &> /dev/null; then
        echo "Error: 'llm' command not found." >&2
        echo "Please install it using 'pipx install llm' or 'pip install llm'." >&2
        return 1
    fi
}

# Core function to query the LLM
llm_query() {
    local prompt="$1"
    local model="${LLM_MODEL:-}"
    
    check_llm_dependency || return 1
    
    if [ -n "$model" ]; then
        llm prompt "$prompt" -m "$model"
    else
        llm prompt "$prompt"
    fi
}
