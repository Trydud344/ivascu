#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INPUT_DIR="${PHOTO_DIR:-$SCRIPT_DIR}"
GENERATED_DIR="$INPUT_DIR/generated"
JSON_OUTPUT="$INPUT_DIR/photos.json"
URL_PREFIX="${PHOTO_URL_PREFIX:-/photos}"

THUMB_WIDTH=600
FULL_WIDTH=1920

if ! command -v identify &>/dev/null || ! command -v convert &>/dev/null; then
  echo "Error: ImageMagick not found. Install it:" >&2
  echo "  sudo apt install imagemagick" >&2
  exit 1
fi

mkdir -p "$GENERATED_DIR"

echo "Photo directory: $INPUT_DIR"

PHOTOS_JSON="["
FIRST=true
TOTAL=0
PROCESSED=0
CACHED=0

while IFS=$'\t' read -r -d '' _mtime file; do
  basename=$(basename "$file")
  name="${basename%.*}"
  id=$(echo "$name" | sed 's/[^a-zA-Z0-9_-]/_/g')

  thumb="$GENERATED_DIR/${id}-thumb.webp"
  full="$GENERATED_DIR/${id}-full.webp"

  UP_TO_DATE=false
  if [ -f "$thumb" ] && [ -f "$full" ] && [ "$thumb" -nt "$file" ]; then
    UP_TO_DATE=true
  fi

  if [ "$UP_TO_DATE" = true ]; then
    DIMS=$(identify -format '%w %h' "$full" 2>/dev/null || echo "0 0")
    CACHED=$((CACHED + 1))
  else
    DIMS=$(identify -format '%w %h' "$file" 2>/dev/null || echo "0 0")
  fi

  read -r W H <<< "$DIMS"

  if [ "$W" -eq 0 ] || [ "$H" -eq 0 ]; then
    echo "  Skipped $basename (could not read dimensions)" >&2
    continue
  fi

  if [ "$UP_TO_DATE" = false ]; then
    if ! convert "$file" -resize "${THUMB_WIDTH}x" -quality 75 "$thumb" 2>/dev/null; then
      echo "  Skipped $basename (conversion failed)" >&2
      continue
    fi
    convert "$file" -resize "${FULL_WIDTH}x" -quality 85 "$full" 2>/dev/null || true
    PROCESSED=$((PROCESSED + 1))
  fi

  ASPECT=$(awk "BEGIN { printf \"%.2f\", $W / $H }")
  THUMB_URL="${URL_PREFIX}/generated/${id}-thumb.webp"
  FULL_URL="${URL_PREFIX}/generated/${id}-full.webp"

  if [ "$FIRST" = true ]; then
    FIRST=false
  else
    PHOTOS_JSON+=","
  fi
  PHOTOS_JSON+=$'\n  '
  PHOTOS_JSON+="{\"id\":\"${id}\",\"thumb\":\"${THUMB_URL}\",\"full\":\"${FULL_URL}\",\"aspectRatio\":${ASPECT}}"

  TOTAL=$((TOTAL + 1))
done < <(find "$INPUT_DIR" -maxdepth 1 -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.avif" -o -iname "*.heic" -o -iname "*.heif" \) -printf "%T@\t%p\0" | sort -z -t $'\t' -k 1 -n)

PHOTOS_JSON+=$'\n]'

echo "$PHOTOS_JSON" > "$JSON_OUTPUT"

echo ""
echo "Done. $PROCESSED processed, $CACHED cached."
echo "Wrote $TOTAL entries to $JSON_OUTPUT"
