#!/bin/bash
# tests/test_llm_adapter.sh

# Source the file under test
if [ -f "src/llm_adapter.sh" ]; then
    source src/llm_adapter.sh
else
    echo "[FAIL] src/llm_adapter.sh missing"
    exit 1
fi

echo "Testing llm_query function..."

# Mock the 'llm' command if it exists, or just ensure we check for it
# For this test, we want to see if llm_query calls 'llm' correctly.
# We can mock it by creating a function in this test script.

llm() {
    echo "MOCK_RESPONSE: Received prompt: $*"
}

export -f llm

response=$(llm_query "Hello world")

if [[ "$response" == *"MOCK_RESPONSE"* ]]; then
    echo "[PASS] llm_query correctly called llm"
else
    echo "[FAIL] llm_query did not call llm or returned unexpected response: $response"
    exit 1
fi

echo "All LLM adapter tests passed!"
exit 0
