#!/bin/bash
# tests/test_final_e2e.sh

# Mock the 'llm' command
# shellcheck disable=SC2329
llm() {
    if ! grep -q "OBSERVATION:" context_final.md; then
        echo "THOUGHT: I need to read the test context. ACTION: grep -E 'RLM_TEST_STRING' tests/context.md"
    else
        echo "THOUGHT: I found the test string. ACTION: exit"
    fi
}
export -f llm

echo "Running final end-to-end test against tests/context.md..."

# Create a test context if it doesn't exist
echo "This is a RLM_TEST_STRING for the final integration test." > tests/context.md

# Clean up previous runs
rm -f context_final.md

# Run rlm.sh
./rlm.sh "Find the test string in tests/context.md" context_final.md > /dev/null

if grep -q "RLM_TEST_STRING" context_final.md; then
    echo "[PASS] Final end-to-end test passed: Test string found in context"
else
    echo "[FAIL] Final end-to-end test failed: Test string not found in context"
    cat context_final.md
    exit 1
fi

# Cleanup
rm -f context_final.md

echo "Final integration test complete!"
exit 0
