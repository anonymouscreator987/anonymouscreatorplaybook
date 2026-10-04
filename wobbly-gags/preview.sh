#!/bin/bash
# preview.sh GagN fps  -> /home/user/wg/out/GagN_sheet.png
cd /home/user/wg/el/proj
ID=$1; R=${2:-2}
npx remotion render $ID /home/user/wg/out/${ID}_prev.mp4 --scale=0.25 --concurrency=4 --browser-executable=$(cat ../bin.txt) --log=error >/home/user/wg/out/${ID}_prev.log 2>&1 || { tail -30 /home/user/wg/out/${ID}_prev.log; exit 1; }
ffmpeg -v error -y -i /home/user/wg/out/${ID}_prev.mp4 -vf "fps=$R,tile=9x3" -frames:v 1 /home/user/wg/out/${ID}_sheet.png && echo /home/user/wg/out/${ID}_sheet.png
