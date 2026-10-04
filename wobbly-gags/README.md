# Wobbly Gags: cloud render batch

Rendered in a Claude Code cloud session while the Cowork session was rate-limited.
Each file in `renders/` is a finished 1080x1920 30fps Short with sound, ready to upload.

## Upload queue
Upload in this order (3 per day). Title is the YouTube title; use the channel upload-default description/tags.

| # | File | Title | Length |
|---|---|---|---|
| 1 | renders/WG_surpriseparty.mp4 | 🚽 The bathroom lock broke... at MY surprise party 💀 | 20s |
| 2 | renders/WG_examchoir.mp4 | 🤫 My stomach growled in a SILENT exam... and it answered 😭 | 24s |
| 3 | renders/WG_selfcheckout.mp4 | 🍌 Self checkout vs ONE banana 🚨 | 24s |

## Rebuilding
`project/` is a Remotion 4 project (`npm i`; font: Patrick Hand woff2 in `public/fonts/PatrickHand.woff2`).
`final.sh GagN name seconds` renders, synthesizes SFX with `sfx/sfx.py` and muxes the result.
