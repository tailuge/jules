#!/bin/bash
# tests/test_tools.sh

# shellcheck source=src/tools.sh
if [ -f "src/tools.sh" ]; then
    source src/tools.sh
else
    echo "[FAIL] src/tools.sh missing"
    exit 1
fi

echo "Testing tool wrappers..."

# Create a dummy context file
echo -e "line1\nline2\nmatch me\nline4" > tests/dummy_context.md

# Test grep_context
result=$(grep_context "match me" "tests/dummy_context.md")
if [[ "$result" == *"match me"* ]]; then
    echo "[PASS] grep_context works"
else
    echo "[FAIL] grep_context failed: $result"
    exit 1
fi

# Test peek_context (head)
result=$(peek_context "head" 1 "tests/dummy_context.md")
if [[ "$result" == "line1" ]]; then
    echo "[PASS] peek_context head works"
else
    echo "[FAIL] peek_context head failed: $result"
    exit 1
fi

# Cleanup
rm tests/dummy_context.md

echo "All tool tests passed!"
exit 0
