#!/bin/bash
# test.sh - Run rlm.sh in mock mode for testing

echo "Running rlm.sh in mock mode..."
rm -f context.md
MOCK=1 ./rlm.sh "Find the version in package.json"