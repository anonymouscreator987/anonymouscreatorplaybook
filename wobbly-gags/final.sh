#!/bin/bash
# final.sh GagN name dur  -> /home/user/wg/WG/WG_name.mp4
set -e
ID=$1; NAME=$2; DUR=$3; O=/home/user/wg/out; mkdir -p /home/user/wg/WG
cd /home/user/wg/el/proj
npx remotion render $ID $O/${ID}_silent.mp4 --concurrency=4 --browser-executable=$(cat ../bin.txt) --log=error > $O/${ID}_render.log 2>&1
cd ../sfx && python3 sfx.py $ID $DUR $O/${ID}.wav >/dev/null
F=/home/user/wg/WG/WG_$NAME.mp4
ffmpeg -y -v error -i $O/${ID}_silent.mp4 -i $O/${ID}.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -preset medium -crf 25 -pix_fmt yuv420p -c:a aac -b:a 160k -ac 2 -shortest -movflags +faststart $F
mkdir -p /home/user/anonymouscreatorplaybook/wobbly-gags/silent; cp $O/${ID}_silent.mp4 /home/user/anonymouscreatorplaybook/wobbly-gags/silent/WG_${NAME}_silent.mp4
echo "$F $(du -h $F | cut -f1) $(ffprobe -v error -show_entries format=duration -of csv=p=0 $F)s"
