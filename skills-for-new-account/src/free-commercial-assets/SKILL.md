---
name: free-commercial-assets
description: Vetted list of FREE assets that are safe for monetized YouTube videos - real recorded sound effects, music, voiceover models, 4K space/science images and video, fonts - with the exact license, attribution rule, and a LICENSES.csv ledger workflow. Use whenever sourcing any external image, video, sound, music, voice or font for a video, or checking whether an asset is allowed commercially.
---

# Free assets for commercial (monetized) YouTube use

**Golden rule:** if you can't point to a written license that allows commercial use, don't use the asset. "Found it on Google" and "no copyright intended" are not licenses.

Log every external file in `LICENSES.csv` the moment you add it to a project:
```
file,source,url,author,license,attribution_required,notes
public/img/sgra.jpg,ESO,https://www.eso.org/public/images/eso2208-eht-mwa/,EHT Collaboration,CC BY 4.0,yes,"credit: EHT Collaboration"
```
Every `attribution_required=yes` row goes into the video description's CREDITS section.

## License cheat sheet

| License | Monetized YouTube? | Credit needed? |
|---|---|---|
| Public domain / CC0 | Yes | No (still courteous) |
| CC BY 4.0 | Yes | **Yes, exact credit line** |
| CC BY-SA | Yes, but derivative-work obligations get murky | Yes. Avoid for core visuals. |
| **CC BY-NC (any NC)** | **No** | n/a. Never use. |
| Pixabay / Unsplash / Pexels content license | Yes (not as standalone resale) | No |
| "Royalty-free" | Read the actual terms; it varies | Varies |

## 4K images & video: space and science

| Source | What | License | Credit line format |
|---|---|---|---|
| **NASA** (images.nasa.gov, science.nasa.gov, svs.gsfc.nasa.gov) | Hubble/JWST releases, mission imagery, **Scientific Visualization Studio** 4K/8K renders (incl. the 2024 black-hole plunge visualization) | Generally not copyrighted | "NASA" / "NASA/JPL-Caltech" etc. as given. No NASA logo, no implied endorsement. Check each page: some images are third-party. |
| **ESO** (eso.org/public/images, /videos) | Huge-resolution telescope images, the EHT black-hole images, artist impressions, 4K fulldome video | CC BY 4.0 | "ESO" / "EHT Collaboration" / "ESO/M. Kornmesser" as given |
| **ESA/Webb** (esawebb.org), **ESA/Hubble** (esahubble.org) | Full-res JWST/Hubble images and videos | CC BY 4.0 | "ESA/Webb, NASA & CSA, …" exactly as on the page |
| **NOIRLab** (noirlab.edu/public/images) | Observatory images, artist concepts | CC BY 4.0 | "NOIRLab/NSF/AURA/…" as given |
| **NASA SVS** (svs.gsfc.nasa.gov) | Frame sequences for scientific animation, 4K | NASA guidelines | "NASA's Goddard Space Flight Center/…" |
| **Wikimedia Commons** | Mixed | **Per file**. Read each file's license box. | As stated on the file page |
| **Unsplash / Pexels / Pixabay** | Earth/nature/texture photos, some 4K video | Their own licenses (commercial OK) | Not required |

Tips:
- ESO and ESA/Hubble offer "Original" or "Fullsize" downloads that are often 10,000+ px, so pick those for 4K.
- Search the ESO/ESA archives by keyword ("black hole", "Venus", "accretion disc artist impression"). Artist impressions are CC BY too.
- NASA's image API is easy to call from code: `https://images-api.nasa.gov/search?q=venus&media_type=image`
- Don't use EHT or other images that are "© someone" on a news site; download from the observatory's own page.

## Sound effects (REAL recordings)

| Source | License | Credit |
|---|---|---|
| **Sonniss GDC Game Audio Bundles**: gdc.sonniss.com (all years) | Royalty-free, commercial, unlimited projects | No |
| **Freesound**: freesound.org, **filter license = Creative Commons 0** | CC0 | No |
| **Pixabay Sound Effects** | Pixabay Content License | No |
| **YouTube Audio Library** → Sound effects | YouTube license (Content-ID safe) | No, unless marked CC BY |
| **NASA audio**: nasa.gov sounds, Chandra sonifications (chandra.si.edu/sound), Voyager/Cassini plasma-wave audio | NASA guidelines | Credit NASA (+ CXC/SAO for Chandra) |
| **ZapSplat** | Free tier commercial-OK | **Yes, "Sound effects from ZapSplat.com"** |
| **Mixkit** | Mixkit license | No |

**Not allowed:** BBC Sound Effects (RemArc = non-commercial), Freesound CC BY-NC, rips from films, games or YouTube.

## Music

| Source | License | Credit |
|---|---|---|
| **YouTube Audio Library** (filter "Attribution not required") | YouTube license | No |
| **Pixabay Music** | Pixabay Content License | No (a rare Content-ID false claim can happen; dispute it with the license link) |
| **Free Music Archive**: only CC0 / CC BY tracks | as tagged | CC BY needs a credit |
| **Kevin MacLeod / incompetech** | CC BY 4.0 | Yes |

For this channel's sound, search: "dark ambient", "drone", "cinematic tension minimal", "neo-classical piano sparse", "space ambient".

## Voiceover models

| Model | License | Commercial |
|---|---|---|
| **Chatterbox** (Resemble AI) | MIT | Yes. Clone only your own (or licensed) voice. |
| **Kokoro-82M** | Apache-2.0 | Yes |
| Piper | MIT code; **voice licenses vary per voice** | Check each voice's model card |
| XTTS-v2 | Coqui Public Model License | **No** (non-commercial) |
| F5-TTS released weights | CC BY-NC | **No** |
| ElevenLabs free tier | Not licensed for commercial use | **No.** Needs a paid plan. |

## Fonts

Google Fonts (via `@remotion/google-fonts`) use the SIL Open Font License, so commercial use is OK with no credit. The channel uses Bebas Neue, Inter and JetBrains Mono.

## Overlays (grain, dust, light leaks, masks)

Generate them in code (see `abyss-protocol-style` → references/overlays-and-masks.md). Most free overlay packs are 1080p and carry unclear licenses; code-generated overlays are 4K-clean and have no licensing risk.

## Before publishing

- [ ] Every external file in the project appears in LICENSES.csv
- [ ] No NC licenses, and no "unknown" rows
- [ ] All CC BY / NASA / ZapSplat credits are in the description
- [ ] No agency logos used; nothing implies NASA/ESA endorsement
