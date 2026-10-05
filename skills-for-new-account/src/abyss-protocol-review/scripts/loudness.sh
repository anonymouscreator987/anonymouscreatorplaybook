#!/usr/bin/env bash
# Integrated loudness, loudness range, true peak (target: I -14 LUFS, TP <= -1 dBTP).
# Usage: loudness.sh video.mp4
set -euo pipefail
ffmpeg -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|LRA|Peak):" | tr -s ' '
