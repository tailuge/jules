#!/bin/bash
# src/tools.sh

# Wrapper for grep
grep_context() {
    local pattern="$1"
    local file_path="$2"
    grep -E "$pattern" "$file_path"
}

# Wrapper for head/tail/sed (peeking)
peek_context() {
    local tool="$1" # head, tail, or sed
    local lines="$2"
    local file_path="$3"
    
    case "$tool" in
        head)
            head -n "$lines" "$file_path"
            ;;
        tail)
            tail -n "$lines" "$file_path"
            ;;
        sed)
            sed -n "$lines" "$file_path"
            ;;
        *)
            echo "Error: Unknown peek tool '$tool'" >&2
            return 1
            ;;
    esac
}
