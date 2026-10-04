import sys; sys.path.insert(0, '/home/user/wg/el/sfx')
from cues import CUES
from notes import NOTES
order = [l.split('\t')[0] for l in open('/home/user/wg/el/titles.tsv') if l.strip()]
byname = {v[0]: (k, v) for k, v in NOTES.items()}
out = ['# Audio handoff: add real SFX, then upload', '',
 'These videos were animated in a cloud session that could not download sound packs. Each `silent/WG_<name>_silent.mp4` is the master with no audio.',
 'For each video: build a soundtrack from REAL recorded sounds (Kenney impact/foley packs, real human voices for screams, gasps, talking, crowd, laughs) following the direction and timing below, mux it onto the silent master (AAC 160k stereo, `-shortest`, `+faststart`), keep loudness around -16 to -20 dB mean, and save it as `WG_<name>.mp4`.',
 'The `renders/` copies have placeholder synth audio for preview only: do not upload those.', '']
for n in order:
    if n not in byname: continue
    gid, (name, title, notes) = byname[n]
    out += [f'## {title}', f'File: `silent/WG_{name}_silent.mp4`', '', f'**Direction:** {notes}', '', '<details><summary>Exact hit timings (seconds)</summary>', '', '| t | cue | gain |', '|---|---|---|']
    out += [f'| {c[0]:.2f} | {c[1]} | {c[2]} |' for c in sorted(CUES[gid], key=lambda c: c[0])]
    out += ['', '</details>', '']
open('/home/user/anonymouscreatorplaybook/wobbly-gags/AUDIO-HANDOFF.md', 'w').write('\n'.join(out))
print('handoff ok', len(order))
