#!/bin/bash
# src/core.sh

# Main RLM loop logic
run_rlm_loop() {
    local context_file="$1"
    local max_iterations="${2:-10}"
    local iteration=0
    
    local system_prompt_file="prompts/system_prompt.txt"
    if [ ! -f "$system_prompt_file" ]; then
        echo "Error: System prompt file missing at $system_prompt_file" >&2
        return 1
    fi
    local system_prompt
    system_prompt=$(cat "$system_prompt_file")

    while [ "$iteration" -lt "$max_iterations" ]; do
        ((iteration++))
        echo "--- Iteration $iteration ---"

        # 1. Get LLM response
        # Using a fixed context window for simplicity in this version
        local response
        response=$(tail -n 50 "$context_file" | llm prompt -s "$system_prompt")
        
        echo "$response" >> "$context_file"

        # 2. Parse Thought and Action
        local thought
        thought=$(echo "$response" | grep "THOUGHT:" | head -n 1 | sed 's/.*THOUGHT: //')
        local action
        action=$(echo "$response" | grep "ACTION:" | head -n 1 | sed 's/.*ACTION: //')

        echo "LLM THOUGHT: $thought"
        echo "LLM ACTION: $action"

        # 3. Handle Exit
        if [[ "$action" == "exit" ]]; then
            echo "Task completed or LLM requested exit." >> "$context_file"
            break
        fi

        # 4. Execute Action
        if [ -n "$action" ]; then
            echo "Executing: $action"
            # In modular version, we assume tools are sourced or in path.
            # We use eval for now as per original rlm.sh but aware of safety TODO.
            local observation
            observation=$(eval "$action" 2>&1)
            echo "OBSERVATION: $observation" >> "$context_file"
        else
            echo "No action found in LLM response."
            echo "OBSERVATION: No action provided. Please follow the PROTOCOL." >> "$context_file"
        fi

        echo "" >> "$context_file"
    done
}
