#!/bin/bash
# tests/test_structure.sh

echo "Checking project structure..."

if [ -d "src" ]; then
    echo "[PASS] src/ directory exists"
else
    echo "[FAIL] src/ directory missing"
    exit 1
fi

if [ -d "prompts" ]; then
    echo "[PASS] prompts/ directory exists"
else
    echo "[FAIL] prompts/ directory missing"
    exit 1
fi

echo "All structure checks passed!"
exit 0
