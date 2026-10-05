---
name: abyss-protocol-style
description: Visual identity and production bible for The Abyss Protocol, a LEMMiNO-style YouTube science documentary channel (dark, restrained, precise, never cheesy, zero fluff) built 100% in Remotion. Use for ANY Abyss Protocol episode work - building scenes, the silent build, 4K renders, thumbnails, overlays/masks, reviewing frames, or starting a new episode project.
---

# The Abyss Protocol: Style & Production Bible

Every episode is code-generated motion graphics in Remotion (React + TypeScript). The look must stay identical from episode to episode, so treat this file as the source of truth. When an episode handoff conflicts with it, the handoff wins for that episode only; record the deviation in the episode README.

Load `remotion-best-practices` for Remotion API details. Load `abyss-protocol-script` for writing and `abyss-protocol-audio` for the audio pass.

## The feel, in one paragraph

Quiet authority. The viewer should feel they are being shown something true and slightly terrifying by someone who doesn't need to shout. That means a dark frame, one idea per shot, numbers that are exact, and motion that is slow and deliberate until the one moment that isn't. No emoji, no memes, no stock-footage montage, no "SMASH THAT LIKE BUTTON", no exclamation marks on screen.

## Palette (exact; never invent new colors)

| Token | Hex | Use |
|---|---|---|
| `void` | `#05060A` | Background, always |
| `abyss` | `#0B1220` | Panels, graph backgrounds |
| `bone` | `#E8E6E1` | All text. **Never pure white.** |
| `signal` | `#FF3B2F` | Danger, the horizon, "you". Sparingly: one red thing per frame. |
| `cyan` | `#3FD0E0` | Data, physics, measurements, the current caption word |
| `ember` | `#FFB020` | Heat and fire **only** (also the "NEXT:" teaser crescent) |

Opacity variants of these are fine (`bone` at 40% for secondary labels). Gradients may only run between a token and `void`.

## Typography

- **Bebas Neue** for headlines and kinetic words. Uppercase, letter-spacing 0.02em.
- **Inter** for captions and body labels: SemiBold 54px captions at 1080p.
- **JetBrains Mono** for every number, unit, readout, equation and scale bar.
- Load all three through `@remotion/google-fonts`. Never use system fonts.
- Write numbers with real separators and units: `20,000,000 g`, `12.7 million km`, `R = ∞`. Use true symbols (×, →, ∞, ≈, ⁻), not ASCII approximations.

## Motion

- **Deterministic only.** All motion comes from `useCurrentFrame()` with `interpolate`, `spring` or `Easing`. Never use `Math.random` (use `random(seed)`), CSS transitions or animations, `setTimeout`, or `Date`.
- Entrances: `Easing.bezier(0.16, 1, 0.3, 1)`. Transitions: `Easing.inOut(Easing.cubic)`. **Never linear** on anything noticeable.
- **Camera push on every beat:** scale 1.00 → 1.08 across the beat. Opening hook: 1.0 → 1.25.
- **Crossfades:** 12 frames, a true overlap with no dip to black. Hard cuts only where the script calls for a shock.
- **Kinetic type:** words slam in with a scale settle (1.15 → 1.0) plus blur (8px → 0) over about 10 frames. Use one accent color per beat.
- Hold important frames. Let a finished graphic sit for 2 to 3 seconds; don't keep moving just because you can.

## Atmosphere stack (z-order)

1. Scene, wrapped in the camera push (and chromatic aberration where approved)
2. Captions: unscaled
3. Grain at 6% + vignette: unscaled, topmost

Code for grain, vignette, chromatic aberration and SVG masks (iris, wipe, text-window) is in `references/overlays-and-masks.md`. Generate overlays in code; don't download overlay packs.

Use chromatic aberration only on moments of physical stress (hook, spaghettification, atom collapse, singularity). Never use it as a constant effect.

## Layout

- 1920×1080 composition, 30 fps.
- **Caption band:** y ≈ 850 to 1010. Keep every key graphic above y ≈ 800.
- Captions are word-by-word: at most 7 words visible across 1 to 2 lines, with the current word in cyan. They fade out in silences and are driven only by `public/captions.json`.
- Stay inside a title-safe margin of 96px on each side.
- Data labels sit next to what they label, never in a legend box.

## Performance budgets

- Prefer SVG, with at most one `<canvas>` per scene.
- Limits: 1,500 stars and 400 lattice nodes per frame.
- Test with `npx remotion render <Comp> --scale=0.25 --concurrency=4` before full renders.

## 4K output

Author everything at 1920×1080, which is faster to preview, and render the final at **4K with `--scale=2`**:
```bash
npx remotion render Video1 out/final_4k.mp4 --scale=2 --codec=h264 --crf=16 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=320k
```
- Because everything is vector or SVG, `--scale=2` is a true 4K render, not an upscale.
- YouTube gives 4K uploads its higher-bitrate VP9/AV1 encode, which keeps dark gradients far cleaner (less banding). This is the real reason to upload 4K even if most viewers watch at 1080p.
- Dark-gradient banding: grain at 6% already dithers it. Never remove grain from the final.
- Any raster image used must be ≥ 3840 px wide or kept small on screen.

## Real imagery ("evidence plates")

The default is **100% code-generated, with no stock footage.** Real imagery is allowed only as evidence: a short, clearly framed plate when the real thing is the point (the EHT image of Sagittarius A*, a JWST field, NASA's black-hole plunge visualization).
- Frame it as a document: an `abyss`-colored panel, a thin `bone` 1px border, and a mono credit line underneath (`IMAGE: EHT COLLABORATION / ESO, CC BY 4.0`).
- Grade it into the palette: desaturate slightly, and crush blacks to `void`.
- Use at most 3 plates per episode, each on screen for no more than 8 s.
- Get images only from sources listed in the `free-commercial-assets` skill, and log each one in `LICENSES.csv`.

## Standard project structure (every episode)

```
abyss-protocol-<slug>/
  script/beats.json        id,start,end,title,scene,mode,vo,sfx,visual,padSeconds
  scripts/make-captions.mjs   estimated captions from beats.json (replaced by Whisper later)
  public/captions.json  public/vo/  public/music/  public/sfx/  LICENSES.csv
  src/theme.ts  src/lib/easing.ts  src/audioManifest.ts (typed, data-only)
  src/scenes/*.tsx  (every scene takes `mode` + `durationInFrames`)
  src/components/Captions.tsx Atmosphere.tsx EndCard.tsx
  src/Video.tsx  (one <Sequence> per beat, crossfades, captions, atmosphere, audio from manifest)
```
Register the full video plus one composition per beat (`Beat01`…). Reuse scenes across episodes by adding `mode`s rather than copying files.

## Production pipeline

1. **Script** (`abyss-protocol-script`): beats.json with VO, visuals and SFX plan, all facts verified.
2. **Silent build:** scenes, estimated captions, render, verify, push.
3. **Audio pass** (`abyss-protocol-audio`): VO, Whisper captions, real SFX, music, mix.
4. **Publish:** 4K render, title, thumbnail, description with credits, chapters.

## Quality gate (run before every push)

1. `npx tsc --noEmit` reports zero errors.
2. Render a still of the middle frame of every beat and **look at each image**. Reject any that is blank, cropped, unreadable at phone size, off-palette, has more than one red element, or puts a graphic in the caption band.
3. Render a 15 s low-res preview of the most complex beats and check that motion is smooth with no popping.
4. Run `ffprobe` on the render and confirm the exact intended duration.
5. Check for cheese: no exclamation marks, no comic easing (bouncy overshoot), no decorative motion that carries no information.

## Thumbnails (1280×720, rendered from a Remotion `<Still>`)

- One subject, one idea, and at most 3 words in Bebas (often zero words).
- Use the palette: mostly `void`, one `signal` or `ember` focal element, `bone` text.
- Make it the most striking frame of the episode, re-composed for 1280×720, not a random screenshot.
- Check it at 168×94 px (the size in search results). If it doesn't read there, redesign it.
