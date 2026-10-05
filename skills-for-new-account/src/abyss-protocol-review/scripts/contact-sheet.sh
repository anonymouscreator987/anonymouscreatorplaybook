#!/usr/bin/env bash
# Tiled contact sheet: one frame every N seconds, for critics to scan a whole beat at a glance.
# Usage: contact-sheet.sh video.mp4 out.jpg [every_seconds=1] [cols=6] [rows=5] [start=0] [duration=]
# Adapted from echris6/motion-video-kit (MIT).
set -euo pipefail
f="$1"; o="$2"; e="${3:-1}"; c="${4:-6}"; r="${5:-5}"; ss="${6:-0}"; d="${7:-}"
ffmpeg -loglevel error -y -ss "$ss" ${d:+-t "$d"} -i "$f" \
  -vf "fps=1/$e,scale=480:-1,drawtext=text='%{pts\:hms}':x=8:y=8:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.6,tile=${c}x${r}" \
  -frames:v 1 "$o"
echo "$o"
