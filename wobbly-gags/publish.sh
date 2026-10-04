#!/bin/bash
# publish.sh "commit msg" : sync renders+source into repo, rebuild README queue, push
R=/home/user/anonymouscreatorplaybook/wobbly-gags; S=/home/user/wg/el; mkdir -p $R/renders
cp -u /home/user/wg/WG/*.mp4 $R/renders/; cp $S/proj/src/styles/*.tsx $R/project/src/styles/; cp $S/proj/src/Root.tsx $R/project/src/
cp $S/sfx/*.py $R/sfx/; cp $S/*.sh $R/; cp $S/titles.tsv $R/
python3 - <<'PY'
R='/home/user/anonymouscreatorplaybook/wobbly-gags'
rows=[l.rstrip('\n').split('\t') for l in open(R+'/titles.tsv') if l.strip()]
s=open(R+'/README.md').read()
a=s.index('## Upload queue'); b=s.index('## Rebuilding')
q='## Upload queue\nUpload in this order (3 per day). Title is the YouTube title; use the channel upload-default description/tags.\n\n| # | File | Title | Length |\n|---|---|---|---|\n'
q+=''.join(f'| {i+1} | renders/WG_{r[0]}.mp4 | {r[1]} | {r[2]}s |\n' for i,r in enumerate(rows))
open(R+'/README.md','w').write(s[:a]+q+'\n'+s[b:])
PY
cd /home/user/anonymouscreatorplaybook && git add wobbly-gags && git commit -qm "$1

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01H489yFZryRoXo2RyXyYLnn" && for i in 1 2 3 4; do git push -q -u origin claude/determined-galileo-8no6z9 && break; sleep $((2**i)); done; git log --oneline -1
