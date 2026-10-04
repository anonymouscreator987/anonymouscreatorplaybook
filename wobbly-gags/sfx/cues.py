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

# Gag11 wet socks
CUES['Gag11'] = steps(0.2, 2.3, 3.0, 0.2) + [
    (0.3, 'hum', 0.2, dict(d=1.8, pitch=1.6)),
    (2.3, 'splat', 0.9), (2.32, 'drip', 0.4),
    (2.6, 'gasp', 0.45), (3.4, 'riser', 0.25, dict(d=1.2)),
    *[(4.7 + 0.3 * i, 'boing', 0.25, dict(d=0.25, pitch=1.4 + 0.05 * i)) for i in range(6)],
    (6.5, 'splat', 1.0, dict(pitch=0.8)), (6.55, 'drip', 0.4),
    (7.0, 'stinger', 0.4),
    *[(8.4 + 0.45 * i, 'splat', 0.35, dict(d=0.18, pitch=1.6)) for i in range(8)],
]
AMB['Gag11'] = 'room'

# Gag12 spider
CUES['Gag12'] = steps(0.15, 1.4, 3.0, 0.2) + [
    (1.4, 'gasp', 0.5), (1.6, 'riser', 0.25, dict(d=0.5)), (1.65, 'squeak', 0.3, dict(pitch=1.3)),
    (2.2, 'slide_up', 0.6, dict(d=0.5, pitch=1.2)),
    (2.7, 'whoosh', 0.6), (3.15, 'thud', 0.7), (3.2, 'slide_up', 0.5, dict(d=0.8, pitch=1.4)),
    *steps(4.4, 5.8, 3.0, 0.2, 1.2),
    (6.0, 'pop', 0.4), (6.5, 'whoosh', 0.3),
    (7.0, 'hum', 0.2, dict(d=0.4, pitch=0.9)),
    *steps(7.9, 9.2, 3.0, 0.2, 1.2),
    (8.0, 'hum', 0.25, dict(d=0.5, pitch=1.6)),
    (8.6, 'step', 0.4), (9.0, 'step', 0.4),
    (9.6, 'slide_down', 0.35, dict(d=0.5, pitch=1.6)), (10.0, 'boing', 0.3, dict(pitch=2)), (10.2, 'squeak', 0.3, dict(pitch=1.6)),
    (10.4, 'gasp', 0.5), (10.8, 'thud', 1.0, dict(pitch=0.8)), (11.2, 'stinger', 0.4),
]
AMB['Gag12'] = 'room'
