#!/usr/bin/env bash
# Find stretches where the picture barely changes (holds), sampled at 10 fps.
# In this channel holds are a TOOL, so this lists them for a human/critic to judge:
# a hold is fine if the VO is landing a point; a hold longer than ~4 s with nothing new is a defect.
# Usage: holds.sh video.mp4 [threshold=0.35] [min_seconds=2]
# Adapted from echris6/motion-video-kit (MIT).
set -euo pipefail
f="$1"; th="${2:-0.35}"; min="${3:-2}"
ffmpeg -hide_banner -i "$f" -vf "fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -an -f null - 2>&1 \
 | grep -o "YAVG=[0-9.]*" | awk -F= -v th="$th" -v min="$min" '
   function flush(){ if(start>=0 && (t-start)>=min) { printf "%6.1fs - %6.1fs  (%.1fs)\n", start, t, t-start; total+=t-start } start=-1 }
   BEGIN{start=-1}
   { t=NR/10; if($2<th){ if(start<0) start=t } else flush() }
   END{ flush(); printf "total hold time >= %ss: %.1fs\n", min, total }'
