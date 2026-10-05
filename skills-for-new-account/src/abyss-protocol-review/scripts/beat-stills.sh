#!/usr/bin/env bash
# Render the middle frame of every BeatNN composition as a PNG for review.
# Usage (from the Remotion project root): beat-stills.sh [count=15] [outdir=out/stills] [scale=0.5]
set -euo pipefail
n="${1:-15}"; out="${2:-out/stills}"; s="${3:-0.5}"; mkdir -p "$out"
comps=$(npx remotion compositions 2>/dev/null)   # columns: id fps WxH frames (duration)
for i in $(seq -w 1 "$n"); do
  comp="Beat$(printf %02d "$((10#$i))")"
  dur=$(echo "$comps" | awk -v c="$comp" '$1==c{print $4}')
  mid=$(( ${dur:-1350} / 2 ))
  npx remotion still "$comp" "$out/$comp-mid.png" --frame="$mid" --scale="$s" >/dev/null && echo "$out/$comp-mid.png"
done
