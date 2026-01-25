#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# test.sh - run shellcheck, shfmt, and syntax checks on tracked .sh files
# Make executable (chmod +x test.sh) after pulling if needed.

# Collect tracked .sh files into an array (works with bash)
mapfile -t FILES < <(git ls-files '*.sh' || true)
if [ "${#FILES[@]}" -gt 0 ]; then
  printf 'Found %d shell script(s) to check\n' "${#FILES[@]}"
  # Run shellcheck (does not fail the script to allow reporting in CI)
shellcheck "${FILES[@]}" || true
  # Show any files that need shfmt (non-zero exit indicates formatting issues)
shfmt -l "${FILES[@]}" || true
  # Check syntax
  for f in "${FILES[@]}"; do
    bash -n "$f"
  done
else
  printf 'No shell scripts found to check.\n'
fi
