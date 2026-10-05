---
name: abyss-protocol-review
description: Independent-critic quality loop for The Abyss Protocol episodes (LEMMiNO-style Remotion science documentaries) - builder never grades its own work; fresh critics judge rendered frames, holds, caption collisions, facts and loudness, then a verification critic checks every fix. Use before pushing a silent build, after the audio pass, before publishing, or when asked to review, critique, QA or "make it perfect".
---

# The Abyss Protocol: Review Loop ("builder ≠ judge")

The agent that built a video is the worst judge of it: it sees what it *meant* to make. This loop separates building from judging, so episodes reach a consistent bar.

Adapted from the Gauntlet loop in echris6/motion-video-kit (MIT), tuned for a restrained documentary instead of a commercial. In this channel, **stillness is often correct** and "more motion" is not automatically better.

## The loop

1. **Render the artifact.** Use a low-res full render for structure (`--scale=0.25`) and a 1080p render of the beats under review for detail.
2. **Spawn a fresh critic.** In Claude Code, use a new subagent; elsewhere, start a new chat. Give it **only**:
   - the render path (or the frames it extracts itself),
   - `script/beats.json` and `script/facts.md`,
   - the `abyss-protocol-style` rules,
   - the previous critic's report, for verification rounds.
   Never pass your own reasoning or a list of what you think you fixed.
3. **Fix the biggest gap first.** Don't let strong beats average away a weak hook.
4. **Run a verification round with a new critic.** It marks every prior item FIXED / PARTLY / STILL PRESENT, hunts for regressions, and ends with **SHIP** or **ONE MORE PASS** (at most 3 fixes).
5. **Keep a ledger** in `review/ledger.md`: round → artifact → top findings → changes → measured result.
6. **Stop** at SHIP, when only sub-frame or cosmetic issues remain, or when the user says stop.

## Measurement tools (`scripts/`)

| Script | What it gives the critic |
|---|---|
| `beat-stills.sh [15] [out/stills]` | The middle frame of every `BeatNN` as a PNG (run from the project root) |
| `contact-sheet.sh video.mp4 out.jpg 1 6 5 <start> <dur>` | Timestamped tile of one frame per second, so a whole beat is visible at a glance |
| `holds.sh video.mp4 [0.35] [2]` | Every stretch where the picture barely changes, with its length |
| `loudness.sh video.mp4` | Integrated LUFS, LRA and true peak (target -14 LUFS, ≤ -1 dBTP) |

Around every transition, also pull dense 1/30 s windows:
`ffmpeg -ss <t-0.4> -t 0.8 -i v.mp4 -vf "scale=640:-1,tile=6x4" -frames:v 1 trans.jpg`

## Critic prompts (fill the `<>` slots and send to a FRESH agent)

### Visual critic
```
You are an independent critic. You did NOT build this video; judge only rendered pixels.
Artifact: <path> (<duration>, 1920x1080, 30fps). Channel: The Abyss Protocol, a LEMMiNO-style
science documentary: dark, restrained, precise, never cheesy. Style rules: <paste abyss-protocol-style
palette, typography, motion, layout sections>. Beat sheet: <path to beats.json>.
Method: extract a contact sheet every 1 s per beat, mid-frames per beat, and dense 1/30 s windows
around each transition (<times>). Run holds.sh. Crop into details.
Check: off-palette colors; more than one red element per frame; pure white; text unreadable at
phone size (view frames at 480 px wide); any key graphic in the caption band (y > 800); captions
overlapping graphics; one-frame pops, flashes or blank frames at transitions; linear or bouncy
easing; decorative motion that carries no information; holds over 4 s with nothing new; visuals
that contradict the VO at that moment; anything that feels cheap, comic or "AI-generated".
Report (under 800 words), also written to review/round-<n>-visual.md:
- Verdict: SHIP / REVISE
- Defects ranked by severity, each with timestamp + screen region + concrete code-level fix
- Top 5 fixes by impact
```

### Fact critic
```
You are an independent science fact-checker. You did not write this.
Inputs: <beats.json> (VO + on-screen numbers) and <facts.md> (claimed derivations).
Recompute every number from first principles and check it against an authoritative source
(NASA/ESA/ESO, peer-reviewed papers, university pages). Check that names, dates and prizes are
correct, that the VO and on-screen numbers match exactly, that rounding is honest, and that
speculation is labeled as such.
Report each claim as CORRECT / IMPRECISE (suggested wording) / WRONG (correction + source).
Write to review/round-<n>-facts.md.
```

### Audio critic (after the audio pass)
```
You are an independent sound critic. You did not mix this.
Artifact: <path>. SFX plan: <beats.json sfx fields>. Run loudness.sh and extract the audio
waveform per beat (ffmpeg showwavespic).
Check: integrated loudness about -14 LUFS, true peak ≤ -1 dBTP; is the VO always intelligible
(music ducked, no SFX masking words); do hits land on the visual event (±2 frames); are the
planned silences actually silent; does any SFX sound synthetic, musical, cartoonish or "stock
trailer"; are there clicks or abrupt cuts; is the music emotionally restrained.
Report with timestamps and fixes to review/round-<n>-audio.md. Verdict: SHIP / REVISE.
```

### Verification critic
```
You are an independent critic; you did NOT build this. New render: <path>.
Previous reports: <paths>. Timings may have moved by about <x>s.
For every item in the previous reports, give FIXED / PARTLY / STILL PRESENT with a timestamp.
Then list NEW defects (regressions, glitch frames, overlaps, clipped text).
End with SHIP or ONE MORE PASS (at most 3 fixes). Write to review/round-<n>-verify.md.
```

### Packaging critic (before publish)
```
You are a skeptical YouTube viewer and editor. Title: <title>. Thumbnail: <path>.
Look at the thumbnail at 168x94 px and at 1280x720. Would you click? Does the video actually pay
off the title within the first 30 s? Is anything clickbait the video does not deliver? Is the
title under 70 characters? Give 3 better title options and 1 thumbnail fix.
```

## What "SHIP" means for this channel

- Zero WRONG facts, and every IMPRECISE item resolved.
- No defect rated high severity by the visual or audio critic.
- Every beat's mid-frame reads clearly on a phone.
- Measured loudness is about -14 LUFS with true peak ≤ -1 dBTP (once audio exists).
- The first 30 seconds deliver the title's promise.
