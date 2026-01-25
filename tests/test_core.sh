#!/bin/bash
# tests/test_core.sh

# Mock dependencies
mkdir -p tests/tmp
CONTEXT_FILE="tests/tmp/test_context.md"
rm -f "$CONTEXT_FILE"

# Mock the 'llm' command
llm() {
    # Simulate a two-step process: first, grep, then exit.
    if ! grep -q "ACTION: grep" "$CONTEXT_FILE"; then
        echo "THOUGHT: I should look for the secret. ACTION: grep -E 'SECRET' tests/test_core.sh"
    else
        echo "THOUGHT: I found it. ACTION: exit"
    fi
}
export -f llm

# Source components (we'll need to make core.sh source-able or call it)
# For testing core.sh, we'll implement it such that it can be tested.

if [ ! -f "src/core.sh" ]; then
    echo "[FAIL] src/core.sh missing"
    exit 1
fi

echo "Testing modular core loop..."

# Run core loop with a small max iterations
# We'll need to pass the context file and other params
source src/llm_adapter.sh
source src/tools.sh
source src/core.sh

# Initial prompt
echo "TASK: Find the SECRET" > "$CONTEXT_FILE"

# Run one iteration of the core loop logic (we'll need to define this function in core.sh)
# SECRET: This is the hidden string for the test.

# We'll expect the loop to eventually create an observation with the secret.
# Let's run a simplified version of the loop for testing.

run_rlm_loop "$CONTEXT_FILE" 2

if grep -q "SECRET: This is the hidden string" "$CONTEXT_FILE"; then
    echo "[PASS] Core loop executed action and captured observation"
else
    echo "[FAIL] Core loop failed to capture expected observation"
    cat "$CONTEXT_FILE"
    exit 1
fi

if grep -q "Task completed" "$CONTEXT_FILE" || grep -q "ACTION: exit" "$CONTEXT_FILE"; then
    echo "[PASS] Core loop handled exit condition"
else
    echo "[FAIL] Core loop did not handle exit"
    exit 1
fi

echo "All core loop tests passed!"
rm -rf tests/tmp
exit 0
