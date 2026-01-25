#!/bin/bash
# tests/test_recursion.sh

# Mock the 'llm' command to perform a recursive call
# shellcheck disable=SC2329
llm() {
    # If this is the root call
    if ! grep -q "RECURSIVE_CALL" context_recursive.md; then
        echo "THOUGHT: I need help. ACTION: echo 'RECURSIVE_CALL' && ./rlm.sh 'Sub-task' context_sub.md"
    else
        echo "THOUGHT: Done. ACTION: exit"
    fi
}
export -f llm

echo "Testing recursive sub-calls..."

# Clean up previous runs
rm -f context_recursive.md context_sub.md

# Run root rlm.sh
./rlm.sh "Main task" context_recursive.md > /dev/null

if grep -q "RECURSIVE_CALL" context_recursive.md && [ -f "context_sub.md" ]; then
    echo "[PASS] Recursive call was initiated and captured"
else
    echo "[FAIL] Recursive call failed or was not captured"
    exit 1
fi

# Cleanup
rm -f context_recursive.md context_sub.md

echo "Recursion test passed!"
exit 0
