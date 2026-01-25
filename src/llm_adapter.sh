#!/bin/bash
# src/llm_adapter.sh

# Define log file location
LLM_LOG_FILE="${LLM_LOG_FILE:-/tmp/jules_llm.log}"

# Function to check for dependencies
check_llm_dependency() {
    if [ "${MOCK:-0}" = "1" ]; then
        return 0
    fi
    if ! command -v llm &> /dev/null; then
        echo "Error: 'llm' command not found." >&2
        echo "Please install it using 'pipx install llm' or 'pip install llm'." >&2
        return 1
    fi
}

# Wrapper function for the 'llm' command to support mocking
if [ "${MOCK:-0}" = "1" ] || [ "$(type -t llm)" != "function" ]; then
    llm() {
        if [ "${MOCK:-0}" = "1" ]; then
            # Ensure SCRIPT_DIR is available, otherwise default to current dir
            local base_dir="${SCRIPT_DIR:-.}"
            "${base_dir}/tests/mock_llm.sh" "$@"
        else
            command llm "$@"
        fi
    }
fi

# Helper function to log LLM invocations
log_llm_invocation() {
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $*" >> "$LLM_LOG_FILE"
}

# Core function to query the LLM
llm_query() {
    local prompt="$1"
    local model="${LLM_MODEL:-}"
    
    check_llm_dependency || return 1
    
    if [ -n "$model" ]; then
        log_llm_invocation "llm -m \"$model\" \"$prompt\""
        llm -m "$model" "$prompt"
    else
        log_llm_invocation "llm \"$prompt\""
        llm "$prompt"
    fi
}

# Function to run llm prompt with a system prompt, supporting piped input
llm_prompt_with_system() {
    local system_prompt="$1"
    local model="${LLM_MODEL:-}"

    check_llm_dependency || return 1

    local stderr_temp
    stderr_temp=$(mktemp)
    local exit_code=0

    if [ -n "$model" ]; then
        log_llm_invocation "llm -m \"$model\" -s \"$system_prompt\" (input from stdin)"
        llm -m "$model" -s "$system_prompt" 2> "$stderr_temp"
        exit_code=$?
    else
        log_llm_invocation "llm -s \"$system_prompt\" (input from stdin)"
        llm -s "$system_prompt" 2> "$stderr_temp"
        exit_code=$?
    fi

    if [ $exit_code -ne 0 ]; then
        echo "[RLM] LLM ERROR (Exit Code $exit_code):" >&2
        sed 's/^/  /' "$stderr_temp" >&2
        rm "$stderr_temp"
        return $exit_code
    fi

    rm "$stderr_temp"
}