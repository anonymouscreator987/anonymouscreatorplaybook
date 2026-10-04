CUES = {}
AMB = {}
def steps(t0, t1, rate=3.2, g=0.25, pitch=1.0):
    out = []; t = t0
    while t < t1: out.append((t, 'step', g, dict(pitch=pitch))); t += 1 / rate
    return out

# Gag10 push or pull
CUES['Gag10'] = steps(0.3, 2.2) + [
    (2.7, 'bonk', 0.8), (2.72, 'thud', 0.5),
    (3.9, 'bonk', 1.0, dict(pitch=0.8)), (3.92, 'thud', 0.7), (4.1, 'boing', 0.3, dict(pitch=1.6)),
    (5.0, 'whoosh', 0.3), (5.95, 'ding', 0.35),
    *[(6.6 + 0.12 * i, 'tick', 0.35, dict(pitch=0.6 + (i % 3) * 0.2)) for i in range(22)],
    (7.4, 'hum', 0.25, dict(d=0.6, pitch=1.3)),
    *steps(7.6, 8.3, 4, 0.15, 1.3),
    (8.6, 'gasp', 0.3),
    (9.2, 'whoosh', 0.6, dict(d=0.3, pitch=1.5)), (9.25, 'chime', 0.4),
    (9.45, 'slide_down', 0.5, dict(d=0.45)), (9.9, 'thud', 1.0, dict(pitch=0.8)),
    (11.6, 'stinger', 0.45),
]
AMB['Gag10'] = 'outdoor'
