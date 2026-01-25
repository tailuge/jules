#!/bin/bash
# This script accepts a single argument named 'prompt'.

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <prompt>"
    exit 1
fi
