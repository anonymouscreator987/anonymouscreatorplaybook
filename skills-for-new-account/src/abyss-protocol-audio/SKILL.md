---
name: abyss-protocol-audio
description: Audio pass for The Abyss Protocol (LEMMiNO-style science documentary channel built in Remotion) - realistic voiceover, Whisper word-timed captions, REAL recorded sound effects (never synthesized), music, ducking and YouTube loudness. Use when adding voiceover, SFX, music or captions to an Abyss Protocol video, sourcing sounds, or mixing/mastering an episode.
---

# The Abyss Protocol: Audio Pass

The audio pass turns a silent Remotion build into a finished episode. It is a **data-only edit**: you fill `src/audioManifest.ts` and `script/beats.json` and drop files into `public/vo`, `public/music` and `public/sfx`. You never rewrite scenes to fit audio. If the VO runs long, raise that beat's `padSeconds`.

For Remotion mechanics (`<Audio>`, volume callbacks, Whisper with `@remotion/install-whisper-cpp`), also load the `remotion-best-practices` skill.

## Non-negotiable rules

1. **SFX are real recordings.** Use field recordings, Foley and real space audio. Never generate SFX with code oscillators or noise synths: they sound fake and musical, and the channel owner has rejected them. Shaping a real recording is fine and encouraged (pitch-down, filtering, reverse, layering, time-stretch).
2. **Every external file gets a row in `LICENSES.csv`** (file, source, url, author, license, attribution_required, notes) at the moment you add it. If a sound's license is unknown, don't use it.
3. **Restraint.** LEMMiNO-style sound is sparse. Silence is a tool, so one well-placed sound beats five. Nothing comedic, cartoonish or "trailer BRAAAM".
4. **Final mix targets:** -14 LUFS integrated, true peak at or below -1.0 dBTP, with dialogue always intelligible.

## 1. Voiceover

Ranked by how well each option holds up for monetization and realism:

| Rank | Option | License | Notes |
|---|---|---|---|
| 1 | **Your own recorded voice** | yours | Strongest against YouTube's "inauthentic content" policy. Use a quiet closet, a dynamic mic 10 cm away, and record each beat as its own file. |
| 2 | **Chatterbox** (Resemble AI), cloned from *your own* voice | MIT | Most natural free model. Zero-shot cloning from 5 to 10 s of clean reference audio. Outputs carry an inaudible Perth watermark. Only clone a voice you own or have written permission for. |
| 3 | **Kokoro-82M** | Apache-2.0 | Fast and runs on CPU, but flatter. Good for drafts and timing passes. Narration voices that suit the channel: `bm_george`, `bm_lewis`, `am_michael`, `am_onyx`. |

Avoid models whose weights are non-commercial: XTTS-v2 (Coqui Public Model License) and F5-TTS's released weights (CC-BY-NC). ElevenLabs' free tier does not grant a commercial license, so you need a paid plan to monetize.

**Chatterbox** (check the repo README for the current API before running):
```python
# pip install chatterbox-tts
import torchaudio
from chatterbox.tts import ChatterboxTTS
model = ChatterboxTTS.from_pretrained(device="cuda")  # or "cpu" / "mps"
wav = model.generate(text, audio_prompt_path="voice_ref.wav",
                     exaggeration=0.35,   # 0.3-0.4 = calm documentary delivery
                     cfg_weight=0.4)      # lower = slower, more deliberate pacing
torchaudio.save("public/vo/beat-01.wav", wav, model.sr)
```

**Kokoro:**
```python
# pip install kokoro soundfile   (also needs espeak-ng installed)
import soundfile as sf, numpy as np
from kokoro import KPipeline
pipe = KPipeline(lang_code="b")            # "b" = British English, "a" = American
chunks = [audio for _, _, audio in pipe(text, voice="bm_george", speed=0.92)]
sf.write("public/vo/beat-01.wav", np.concatenate(chunks), 24000)
```

**Generation rules**
- Generate **one file per beat** (`public/vo/beat-NN.wav`), using the VO text from `beats.json` verbatim.
- Split long beats into sentences, generate each one, and join them with 0.25 to 0.45 s gaps. Leave longer gaps (0.8 to 1.5 s) where the SFX plan calls for silence.
- Spell numbers the way they should be spoken ("thirty milliseconds", "A star" for A*).
- Listen to every file. Regenerate any take that has mispronunciations, odd emphasis or artifacts, and don't ship one you haven't heard.
- VO cleanup chain:
  `ffmpeg -i in.wav -af "highpass=f=70,lowpass=f=14000,afftdn=nf=-30,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=7" -ar 48000 out.wav`

## 2. Captions from real timings

After the VO is final, regenerate `public/captions.json` from word-level Whisper timestamps. Use `@remotion/install-whisper-cpp` (`installWhisperCpp`, `downloadWhisperModel` with `medium.en` or better, `transcribe` with `tokenLevelTimestamps: true`, then `toCaptions`). Then:
- Offset each beat's words by that beat's start time on the timeline (including padSeconds).
- **Replace Whisper's spelling with the script's spelling.** Align Whisper's words to the beat's VO text, keep the timings, and keep the script's text. This keeps names, numbers and symbols (Sagittarius A*, 20,000,000 g) exact.
- Write the same `[{start,end,text}]` format the silent build used.

## 3. Sound effects: real recordings only

### Sources (all allow monetized YouTube use)

| Source | What it is | License | Attribution |
|---|---|---|---|
| **Sonniss GDC bundles**: gdc.sonniss.com | 200+ GB of professional field recordings and Foley, released free each year. **Best quality; start here.** | Royalty-free commercial | No |
| **Freesound** filtered to **CC0**: freesound.org | Huge library of real recordings | CC0 | No (use only CC0; skip CC-BY-NC entirely) |
| **Pixabay Sound Effects**: pixabay.com/sound-effects | Curated recordings | Pixabay Content License | No |
| **YouTube Audio Library** (YouTube Studio → Audio Library → Sound effects) | Clean, Content-ID-safe | YouTube license | No, unless the item says CC-BY |
| **NASA audio** (nasa.gov sounds, Chandra sonifications, Voyager/Cassini plasma-wave recordings) | **Real space data turned into sound.** Perfect for this channel. | NASA media guidelines; generally not copyrighted | Credit NASA (and e.g. NASA/CXC/SAO for Chandra); never imply endorsement |
| **ZapSplat** | Large library | Free tier is commercial-OK | **Yes, credit "ZapSplat"** (Premium removes this) |

**Do not use** BBC Sound Effects (RemArc license is non-commercial), random YouTube rips, "free SFX packs" without a written license, or Freesound CC-BY-NC.

Search Freesound from code (CC0 only, logs licenses automatically):
`python3 scripts/freesound_cc0.py "metal creak" --min 2 --max 20 --limit 8`

### The beat vocabulary, translated to real recordings

| Spec says | Search for / build from (real) | Shaping |
|---|---|---|
| Sub hit / sub pulse | distant thunder, large door slam, kick drum (acoustic), dropped steel plate in a big room | Pitch down 1 to 2 octaves, low-pass at 120 Hz, keep the natural tail |
| Heartbeat | "heartbeat stethoscope" (real) | Low-pass at 200 Hz; time-stretch to the BPM, never loop an obviously identical beat |
| Metal creak / cables | ship hull creak, rope creak, steel cable tension, old door hinge | Slow 50%, pan automation L→R |
| Drone | wind howl, large empty hall room tone, power-station hum, NASA plasma-wave audio | Pitch down, long reverb, very low level |
| Whoosh | real air swish (stick or cloth swung past the mic), passing car or train | Short fade-in, pan across |
| Geiger ticking | real Geiger counter recording | Speed the click density up as the value climbs (edit, don't synthesize) |
| Clock tick | mechanical clock, pocket watch | One clean tick, re-spaced in the edit |
| Bone crack | Foley: celery snap, thick branch snap, knuckle crack | Pitch down a little, long dark reverb, quiet. **Restrained.** |
| Thruster | rocket launch rumble, blowtorch, jet flyby | Low-pass so it sounds "swallowed" |
| Fire / firewall | campfire crackle, burning paper, gas burner | Build by crossfading layers |
| Shimmer / cosmic pad | wine-glass rub, bowed cymbal, NASA sonifications | Reverse, long reverb |
| Silence | Not digital zero: use 1 to 2 s of very quiet real room tone so it feels like a held breath |

Shaping with ffmpeg (keeps the recording real):
```bash
# pitch down one octave, keep length roughly by tempo correction
ffmpeg -i in.wav -af "asetrate=48000*0.5,aresample=48000,atempo=2.0" out.wav
# pitch down one octave AND slow down (heavier, longer)
ffmpeg -i in.wav -af "asetrate=48000*0.5,aresample=48000" out.wav
# low-pass + long tail
ffmpeg -i in.wav -af "lowpass=f=150,aecho=0.8:0.7:120|400:0.4|0.25" out.wav
# reverse
ffmpeg -i in.wav -af areverse out.wav
```

Name files by what they are (`sfx/heartbeat-real-60bpm.wav`, `sfx/hull-creak-slow.wav`), not by the beat number, so they can be reused across episodes. Build a growing channel library at `~/abyss-sfx-library/` with a `LICENSES.csv` alongside it.

## 4. Music

- Prefer sparse, dark ambient or neo-classical beds: low strings, piano, analog pads. No drums under narration.
- Sources: YouTube Audio Library (filter to "no attribution required"), Pixabay Music, and Free Music Archive tracks marked CC0 or CC-BY (credit them). Avoid CC-BY-NC.
- After uploading, check YouTube Studio's "Copyright" tab. If a claim appears on a supposedly free track, dispute it and include its license URL from `LICENSES.csv`.

## 5. Mix

- **Ducking:** music sits at full bed volume and drops to **0.18** under VO, with a 0.4 s attack and 0.8 s release. Use a Remotion `volume={(f) => ...}` callback keyed to the VO ranges from the manifest.
- **Typical levels** (relative to VO at 1.0): music bed 0.25 to 0.35 (ducked to 0.18), ambience 0.15 to 0.3, hits 0.6 to 0.9. **Never let an SFX mask a word.**
- **Master check** after the final render:
  `ffmpeg -i out/final.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12`
  Aim for I ≈ -14 LUFS and true peak ≤ -1 dBTP. If the render misses, adjust the gains in the manifest; don't add a limiter that squashes the dynamics.
- Listen to the full episode once on headphones and once on a phone speaker before publishing.

## 6. Checklist before you say "done"

- [ ] Every beat has a VO file, and you've listened to all of them
- [ ] captions.json is regenerated from Whisper, with the script's spelling and words in sync
- [ ] Every SFX and music file is in LICENSES.csv with a commercial-OK license
- [ ] The required credits are in the video description (NASA/ESO/ZapSplat/CC-BY music)
- [ ] Master measures about -14 LUFS with true peak ≤ -1 dBTP
- [ ] Silences in the SFX plan are actually silent (room tone, not music)
- [ ] YouTube "altered or synthetic content" checkbox: tick it when the narration is a realistic AI voice (cloned or not). YouTube's own examples include "synthetically generating a person's voice to narrate a video". The label does not hurt monetization; hiding it can.
