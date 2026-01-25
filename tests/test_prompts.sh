#!/bin/bash
# tests/test_prompts.sh

PROMPT_FILE="prompts/system_prompt.txt"

echo "Checking externalized prompts..."

if [ -f "$PROMPT_FILE" ]; then
    echo "[PASS] system_prompt.txt exists"
    
    CONTENT=$(cat "$PROMPT_FILE")
    if [[ "$CONTENT" == *"THOUGHT:"* && "$CONTENT" == *"ACTION:"* ]]; then
        echo "[PASS] system_prompt.txt contains expected protocol tags"
    else
        echo "[FAIL] system_prompt.txt content mismatch"
        exit 1
    fi
else
    echo "[FAIL] system_prompt.txt missing"
    exit 1
fi

echo "All prompt checks passed!"
exit 0
