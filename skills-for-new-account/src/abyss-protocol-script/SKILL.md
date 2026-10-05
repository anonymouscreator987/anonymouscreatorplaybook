---
name: abyss-protocol-script
description: Write and fact-check episodes for The Abyss Protocol, a LEMMiNO-style YouTube science documentary channel - topic choice, second-person narrative scripts, beat sheets (beats.json), verified numbers, titles, thumbnails concepts, descriptions with credits and chapters. Use when planning a new episode, writing or editing VO, building beats.json, or packaging an episode for upload.
---

# The Abyss Protocol: Scriptwriting

The channel's promise is **"every second, exactly."** Scripts are precise, eerie, restrained and true. Each episode puts the viewer inside an extreme physical situation, in second person, and walks through it in time order until the physics runs out.

## Voice

- **Second person, present tense** for the experience ("Your feet are being pulled harder than your head."). Switch to first-person plural ("we") for what science knows and doesn't know.
- Keep sentences short. Use a long sentence only to build dread, then follow it with a short one.
- Keep a calm, unhurried narrator. Horror comes from the facts, never from adjectives. Cut "insane", "mind-blowing", "terrifying", "crazy" and "literally".
- **Zero fluff:** no "in this video we will", no channel plugs before the end, no sponsor-style tangents, no rhetorical "have you ever wondered".
- **Honest uncertainty is a feature.** When physicists disagree, say so plainly and name who disagrees ("Physics is still arguing."). Never present speculation as fact.
- Name real people and dates when it helps the viewer (Penrose 1965, AMPS 2012). Use one name per idea, not a citation dump.
- Plan for about **150 spoken words per minute**. A 45 s beat holds roughly 100 to 115 words, which leaves room for silence.

## Episode structure (about 11 min, 15 beats)

| Beat | Job |
|---|---|
| 1 (30 s) | **Hook:** drop the viewer mid-situation with one shocking, exact number and the promise ("every instant"). |
| 2 | **Rules:** dismantle the popular myth in plain language. Establish scale. |
| 3–6 | **Escalation:** each beat adds one new physical effect, with a number that gets worse. |
| 7 | **Twist:** the expectation flips ("you would feel nothing"). Change the scenario. |
| 8–12 | **Second descent:** deeper, stranger, more intimate (down to the atoms). |
| 13 | **The limit:** where the equations end. Awe, not gore. |
| 14 | **Open question:** what physics still argues about. |
| 15 | **Answer and loop:** a three-line summary, the next episode teased by name, one quiet subscribe line. |

Each beat has **one emotion** (shock, logic, awe, fear, horror, wonder, twist, dread, panic, beauty, irony, intimacy, doubt, resolution) and **one visual idea**. If a beat needs two visuals, split it.

## Fact-checking protocol (mandatory)

1. **Compute every number yourself.** Write the formula and inputs in a `script/facts.md` table: claim, formula, inputs, result, rounding used in VO, source. Example: tidal acceleration across 2 m, `a = 2GML/r³`.
2. Cross-check each derived number against at least one authoritative source (NASA, ESA, ESO, peer-reviewed papers, university pages). Wikipedia is fine for finding sources, not as the final source.
3. Round honestly. "About thirty milliseconds" is fine; don't promote 66 s to "exactly a minute".
4. Names, dates and prizes must be checked against the primary source.
5. When the visuals show a number, it must match the VO and `facts.md` exactly.

## beats.json schema

```json
{
  "id": 1, "start": 0, "end": 30, "title": "THE BRUTAL HOOK",
  "scene": "HorizonField", "mode": "hook", "emotion": "shock",
  "vo": "verbatim narration...",
  "visual": "what is on screen, beat by beat",
  "sfx": [{"at": 0, "cue": "silence, then 30 Hz sub hit, 1.5 s tail"}],
  "padSeconds": 0
}
```
`start`/`end` are in seconds; the timeline adds `padSeconds` cumulatively. The SFX plan describes **real recorded sounds** (see `abyss-protocol-audio`), for example "real heartbeat, stethoscope, low-passed".

## Packaging

**Title:** a second-person scenario with a time promise, under 70 characters. No clickbait the video doesn't pay off.
- "You Fall Into a Black Hole. Here's Every Second Until You Stop Existing."
- Pattern: "You [extreme situation]. Here's [exact progression]."
- Write 5 variants and pick the one a smart 14-year-old would click *and* not feel tricked by.

**Thumbnail concept:** one image, at most 3 words, the scariest true number or the single strongest visual. See `abyss-protocol-style`.

**Description:**
```
<two sentences: the scenario and the promise>

CHAPTERS
00:00 <Beat 1 title in sentence case>
00:30 ...

SOURCES
- <claim> - <source title, URL>

CREDITS
- Imagery: <exact credit lines from LICENSES.csv>
- Sound: <only those requiring attribution>
- Music: <track - artist - license>

Next: <next episode>
```
- Chapters start at 00:00, list at least 3 entries, and each lasts at least 10 s. Use beat start times *after* padSeconds.
- Disclose AI narration if one was used (see `abyss-protocol-audio`).

## Next-episode pipeline

Keep a running `ideas.md` of extreme-environment scenarios that work in second person with a clear timeline and hard numbers: the surface of Venus, falling into Jupiter, a neutron star's surface, standing at ground zero of a gamma-ray burst, the last star in the universe, the bottom of the Mariana Trench, inside the Sun's core. Each one must allow "every second, exactly", or it isn't an Abyss Protocol episode.
