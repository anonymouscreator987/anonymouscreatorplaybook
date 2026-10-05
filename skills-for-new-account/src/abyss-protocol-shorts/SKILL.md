---
name: abyss-protocol-shorts
description: Turn an Abyss Protocol long-form episode (Remotion project) into native vertical 9:16 cuts for YouTube Shorts, TikTok and Instagram Reels - picking moments, re-composing scenes for 1080x1920 (not cropping), vertical captions and safe zones, hooks, loops and per-platform posting. Use when making Shorts/TikToks/Reels/vertical clips from an episode or planning short-form promotion for the channel.
---

# The Abyss Protocol: Vertical Cuts (Shorts / TikTok / Reels)

Short-form is how a new documentary channel gets discovered. Because every episode is code, vertical versions are **re-composed, not cropped**: the same scenes render natively at 1080×1920 with layouts made for a phone.

Also use `abyss-protocol-style` for the look and `yt-shorts` (if installed) to find candidate moments from the transcript.

## 1. Pick the moments (3 to 5 per episode)

A good cut is **one complete idea** in 35 to 60 s with a number that lands. Example cuts from the black-hole episode:
- "Your feet are pulled 500× harder than your head" (hook + tide graph)
- "She never sees you cross" (time dilation)
- "Bigger black holes are gentler" (20,000,000 g vs 0.0001 g)
- "Don't fight it: struggling shortens your life"

Rules:
- **The first 1.5 s must contain the hook,** stated or shown. No title card and no "did you know".
- The cut must make sense without the long video.
- End on a line that **loops** back into the first line, or on a hard, quiet cut. Never end on "subscribe".
- Use VO lines verbatim, or tighten them while keeping every fact identical.

## 2. Build it in Remotion

Add a `src/shorts/` folder and register one composition per cut:
```tsx
<Composition id="Short01-Tide" component={Short01} width={1080} height={1920} fps={30}
  durationInFrames={Math.round(52 * 30)} />
```
- **Reuse the scene components** with a `layout="vertical"` prop rather than copying them. Scenes read `useVideoConfig()` and position elements relative to `width`/`height`.
- Re-compose for a phone: stack elements vertically, scale graphs up so they fill about 80% of the width, and use bigger type (Bebas 140 to 220 px, mono readouts 64 px or more).
- Audio: reuse the episode's VO files with `<Audio startFrom>` / `endAt` and the same SFX. Music starts within the first second.
- Render: `npx remotion render Short01-Tide out/short01.mp4 --codec=h264 --crf=17`

## 3. Vertical layout and safe zones (1080×1920)

| Zone | Use |
|---|---|
| y 0 to 220 | Keep empty. Platform UI and the status bar sit here. |
| y 220 to 1150 | **Main graphic.** Key numbers live here. |
| y 1150 to 1450 | **Captions:** Inter SemiBold 64 to 72 px, at most 4 words visible, current word cyan |
| y 1450 to 1920 | Keep empty of key info. Title, description and buttons cover it. |
| x > 900 | Avoid key info here. Like, comment and share buttons cover the right edge. |

Keep the palette, grain and vignette identical to the long-form episode, so the brand is recognizable in the feed.

## 4. Platform notes

| | YouTube Shorts | TikTok | Instagram Reels |
|---|---|---|---|
| Length | up to 3 min (aim for 35 to 60 s) | long allowed (aim for 35 to 60 s) | up to 3 min (aim for 35 to 60 s) |
| Link to the long video | Use the **"Related video"** field in Studio. This is the main conversion path. | Pin a comment ("Full 11-min fall: link in bio") | "Full video on YouTube: link in bio" |
| Text | Title ≤ 60 characters, written as a hook | 2 to 4 relevant hashtags (#space #physics #blackhole) | Same as TikTok, plus a cover frame chosen in-app |
| AI label | Same disclosure rules as long-form | Turn on the "AI-generated content" label if the voice is AI | Same: use the "AI info" label |

- Upload natively to each platform. Don't upload a TikTok file with its watermark to Reels or Shorts.
- Only use music you have a license for **outside YouTube** too. YouTube-Audio-Library-only tracks are licensed for YouTube only, so TikTok and Reels versions need CC0 or Pixabay music, or the platform's own commercial library.

## 5. Checklist per cut

- [ ] The hook lands in the first 1.5 s, with no intro
- [ ] One idea, 35 to 60 s, and it makes sense without the episode
- [ ] Nothing important in the top 220 px, the bottom 470 px or the right 180 px
- [ ] Captions are readable on a real phone at arm's length
- [ ] Facts match `facts.md` exactly
- [ ] The ending loops or cuts cleanly, with no subscribe plea
- [ ] The music license covers every platform you post to
- [ ] Related video (YouTube) or link-in-bio mention is set
