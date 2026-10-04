# Wobbly Gags: cloud render batch

Rendered in a Claude Code cloud session while the Cowork session was rate-limited.
Each file in `renders/` is a finished 1080x1920 30fps Short with sound, ready to upload.

## Upload queue
Upload in this order (3 per day). Title is the YouTube title; use the channel upload-default description/tags.

| # | File | Title | Length |
|---|---|---|---|
| 1 | renders/WG_pushpull.mp4 | 🚪 Push or pull? (funny cartoon) | 13s |
| 2 | renders/WG_wetsocks.mp4 | 🧦 Stepped in water. In socks. (funny cartoon) | 12s |
| 3 | renders/WG_spider.mp4 | 🕷️ Spider in my room (funny cartoon) | 13s |
| 4 | renders/WG_microwave.mp4 | ⏱️ Stopping the microwave at 0:01 (funny cartoon) | 12s |

## Rebuilding
`project/` is a Remotion 4 project (`npm i`; font: Patrick Hand woff2 in `public/fonts/PatrickHand.woff2`).
`final.sh GagN name seconds` renders, synthesizes SFX with `sfx/sfx.py` and muxes the result.
