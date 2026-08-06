#!/bin/bash

# Usage: bash fuse.sh [directory]
# Output: all-features.txt

DIR="${1:-.}"
OUTPUT="$DIR/all-features.txt"

true >"$OUTPUT"

for txt in "$DIR"/*.txt; do
  [ "$txt" = "$OUTPUT" ] && continue
  cat "$txt" >>"$OUTPUT"
  echo "fused $txt"
done

echo "→ $OUTPUT"
