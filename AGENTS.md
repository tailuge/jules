Before committing, run ./test.sh to check for lint errors.

Shell scripting — quick tips and best practices

- Use a portable shebang:
  - #!/usr/bin/env bash
- Enable strict mode:
  - set -euo pipefail
  - IFS=$'\n\t'
- Run shellcheck and shfmt in CI and locally to catch issues and keep formatting consistent.
- Quote variables:
  - Always use "$var" unless you intentionally want splitting/expansion.
- Prefer $(...) over backticks:
  - cmd_output=$(command)
- Check commands exist with command -v, not which:
  - if ! command -v git >/dev/null; then ...
- Use printf instead of echo for predictable output:
  - printf '%s\n' "$value"
- Avoid eval when possible (it's dangerous).
- Use trap for cleanup and error reporting:
  - trap 'rc=$?; [ $rc -ne 0 ] && echo "Error at line $LINENO"; cleanup' EXIT
- Use mktemp for temporary files/dirs:
  - tmpdir=$(mktemp -d) || exit
- Use getopts for option parsing and provide a usage() function.
- Forward arguments with "$@" and only use "$*" when appropriate.
- Read lines safely while preserving whitespace:
  - while IFS= read -r line; do ...; done < file
- Use arrays only when using bash; avoid arrays for /bin/sh portability.
- Validate required environment variables and document them.
- Prefer machine-readable command outputs (avoid parsing ls/ps).
- Add tests where useful (bats for bash) and run bash -n to check syntax.
- Make scripts executable and include a -h/--help usage text.
- Use CI checks to run shellcheck, shfmt, and bash -n on changed scripts before merging.

Minimal script template

#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

usage() {
  cat <<EOF
Usage: $(basename "$0") [-h] -f <file>
EOF
}

cleanup() {
  # remove temp files, etc.
  :
}

trap 'rc=$?; cleanup; [ $rc -ne 0 ] && echo "Failed on line $LINENO"; exit $rc' EXIT

main() {
  local file=""
  while getopts ":hf:" opt; do
    case $opt in
      h) usage; exit 0 ;;
      f) file=$OPTARG ;;
      \?) printf 'Invalid option: -%s\n' "$OPTARG"; usage; exit 2 ;;
      :) printf 'Option -%s requires an argument.\n' "$OPTARG"; usage; exit 2 ;;
    esac
  done
  shift $((OPTIND - 1))

  printf 'Processing %s\n' "${file:-<none>}"
}

main "$@"

Example test.sh (basic lint/run checks)

#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Run shellcheck/shfmt and syntax checks on tracked .sh files
FILES=$(git ls-files '*.sh' || true)
if [ -n "$FILES" ]; then
  shellcheck $FILES || true
  shfmt -l $FILES || true
  for f in $FILES; do
    bash -n "$f"
  done
fi
