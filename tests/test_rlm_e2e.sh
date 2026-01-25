#!/bin/bash
# tests/test_rlm_e2e.sh

# Mock the 'llm' command
# shellcheck disable=SC2329
llm() {
    echo "THOUGHT: I am testing. ACTION: echo 'SUCCESS'"
    echo "THOUGHT: Done. ACTION: exit"
}
export -f llm

echo "Testing rlm.sh end-to-end..."

# Run rlm.sh with a test prompt
./rlm.sh "Test prompt" > /dev/null

if grep -q "ACTION: echo 'SUCCESS'" context.md && grep -q "OBSERVATION: SUCCESS" context.md; then
    echo "[PASS] rlm.sh successfully executed modular components and captured output"
else
    echo "[FAIL] rlm.sh failed to execute as expected"
    cat context.md
    exit 1
fi

# Cleanup
rm context.md

echo "End-to-end test passed!"
exit 0
