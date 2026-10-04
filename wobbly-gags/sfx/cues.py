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

# Gag13 microwave
CUES['Gag13'] = [
    (1.2, 'beep', 0.15, dict(d=0.08, pitch=1.4)), (1.25, 'rumble', 0.35, dict(d=3.6, pitch=2.5)),
    *[(1.2 + 0.75 * i, 'tick', 0.3) for i in range(5)],
    (3.2, 'riser', 0.3, dict(d=1.6)), (4.85, 'tick', 0.8, dict(pitch=0.6)), (4.86, 'pop', 0.3),
    (5.3, 'hum', 0.2, dict(d=0.6, pitch=1.5)), (5.9, 'tada', 0.2, dict(pitch=0.8)),
    (6.4, 'beep', 0.9, dict(d=0.35)), (6.75, 'tick', 0.8, dict(pitch=0.5)), (6.8, 'thud', 0.4, dict(pitch=1.5)),
    (7.6, 'riser', 0.15, dict(d=0.8, pitch=0.5)), (8.7, 'gulp', 0.5),
    (10.6, 'beep', 0.9, dict(d=0.35)), (11.0, 'stinger', 0.35),
]
AMB['Gag13'] = 'night'

# Gag14 when mum calls you
CUES['Gag14'] = [
    *[(0.2 + 0.11 * i, 'tick', 0.18, dict(pitch=0.5 + (i % 4) * 0.15)) for i in range(21)],
    *[(0.3 + 0.5 * i, 'beep', 0.08, dict(d=0.08, pitch=0.6 + (i % 3) * 0.3)) for i in range(5)],
    (2.6, 'hum', 0.9, dict(d=0.7, pitch=0.9)), (2.62, 'bonk', 0.3, dict(pitch=0.5)),
    (3.3, 'riser', 0.3, dict(d=1.3)), (4.6, 'whoosh', 0.9, dict(d=0.25, pitch=1.6)), (5.0, 'thud', 0.6, dict(pitch=1.3)),
    (5.05, 'whoosh', 0.6, dict(d=0.2, pitch=1.8)), (5.15, 'hum', 0.3, dict(d=0.5, pitch=1.6)),
    (6.6, 'hum', 0.4, dict(d=0.4, pitch=0.9)), (6.7, 'thud', 0.3, dict(pitch=1.6)),
    *[(8.0 + 0.5 * i, 'step', 0.22) for i in range(5)],
    (10.4, 'stinger', 0.45), (10.4, 'buzz', 0.2, dict(d=0.6, pitch=0.6)),
]
AMB['Gag14'] = 'room'

# Gag15 charger cable
CUES['Gag15'] = [
    *[(0.3 + 0.35 * i, 'tick', 0.12, dict(pitch=1.4)) for i in range(4)],
    (1.8, 'hum', 0.2, dict(d=0.4, pitch=1.3)), *steps(2.4, 3.1, 3.0, 0.2),
    (3.1, 'boing', 0.8), (3.15, 'whoosh', 0.4), (3.5, 'bonk', 0.5, dict(pitch=1.5)),
    (3.8, 'gasp', 0.3), (5.0, 'slide_down', 0.3, dict(d=0.6)), (5.6, 'thud', 0.4, dict(pitch=1.3)),
    (6.0, 'tada', 0.2, dict(pitch=0.8)),
    *steps(7.4, 8.4, 3.0, 0.2, 1.2),
    (9.0, 'pop', 0.8), (9.1, 'gasp', 0.4),
    (9.6, 'buzz', 0.6, dict(d=3.0, pitch=0.8)), (10.4, 'stinger', 0.35),
]
AMB['Gag15'] = 'room'

# Gag16 bus on time
CUES['Gag16'] = [
    *[(0.9 + 0.8 * i, 'beep', 0.18, dict(d=0.1, pitch=1.2)) for i in range(5)],
    *[(0.5 + 0.77 * i, 'drip', 0.25) for i in range(6)],
    (4.6, 'rumble', 0.6, dict(d=1.6, pitch=1.6)), (4.7, 'hum', 0.25, dict(d=0.5, pitch=1.7)),
    (5.55, 'splat', 1.0, dict(d=0.6, pitch=0.7)), (5.6, 'whoosh', 0.7, dict(d=0.5, pitch=0.6)),
    (6.6, 'stinger', 0.35),
    (8.2, 'chime', 0.5), (8.5, 'squeak', 0.15, dict(pitch=2.2)), (8.8, 'squeak', 0.15, dict(pitch=2.5)), (9.1, 'squeak', 0.15, dict(pitch=2.3)),
    (9.4, 'rumble', 0.6, dict(d=1.0, pitch=1.6)), (10.0, 'buzz', 0.2, dict(d=0.3, pitch=2)), (10.4, 'whoosh', 0.3, dict(d=0.4, pitch=0.6)),
    (11.0, 'pop', 0.4), *steps(11.3, 13.5, 2.6, 0.2),
]
AMB['Gag16'] = 'rain:8.2'

# Gag17 toilet surprise party
CUES['Gag17'] = [
    (0.1, 'tick', 0.9, dict(pitch=0.7)), (0.15, 'ding', 0.25, dict(d=0.4, pitch=1.6)), (1.25, 'whoosh', 0.3), (1.7, 'bonk', 0.4, dict(pitch=1.8)),
    *steps(1.8, 2.7, 3.0, 0.22), (3.0, 'thud', 0.3, dict(pitch=1.4)),
    *[(3.2 + 0.4 * i, 'tick', 0.12, dict(pitch=1.5)) for i in range(4)], (3.3, 'hum', 0.15, dict(d=1.2, pitch=1.4)),
    *[(4.6 + 0.07 * i, 'tick', 0.5, dict(pitch=0.5 + (i % 2) * 0.3)) for i in range(10)],
    (4.9, 'gasp', 0.5), (5.4, 'slide_up', 0.5, dict(d=0.6, pitch=0.8)), (6.0, 'thud', 0.4, dict(pitch=1.3)),
    (6.5, 'hum', 0.6, dict(d=0.7, pitch=1.8)),
    *[(k, 'thud', 0.7, dict(pitch=1.2)) for k in (7.2, 7.8, 8.4, 8.8)],
    (9.2, 'crash', 0.9), (9.25, 'boing', 0.6, dict(pitch=0.8)), (9.4, 'tada', 0.6), (9.7, 'hum', 0.4, dict(d=0.5, pitch=1.2)),
    (10.1, 'stinger', 0.4), (11.1, 'hum', 0.25, dict(d=0.3, pitch=1.6)),
    (11.9, 'pop', 0.6, dict(pitch=0.5)), (11.92, 'whoosh', 0.3, dict(d=0.2, pitch=2)),
    (12.3, 'whoosh', 0.4), (15.2, 'chime', 0.4), (16.0, 'hum', 0.15, dict(d=2.0, pitch=0.9)),
]
AMB['Gag17'] = 'room'

# Gag18 exam stomach choir
_mel = [1.0, 1.0, 1.5, 1.5, 1.68, 1.68, 1.5, 1.33, 1.33, 1.26, 1.26, 1.12, 1.12, 1.0, 1.5, 1.5, 1.33, 1.33, 1.26, 1.26, 1.12]
CUES['Gag18'] = [
    (0.0, 'growl', 1.0, dict(d=1.3, pitch=0.9)), (0.6, 'gasp', 0.25),
    *[(1.6 + 0.5 * i, 'tick', 0.12, dict(pitch=1.3)) for i in range(3)],
    (3.0, 'buzz', 0.4, dict(d=0.25, pitch=0.9)), (3.05, 'hum', 0.5, dict(d=0.3, pitch=1.4)),
    (4.6, 'growl', 1.0, dict(d=1.0, pitch=1.2)),
    (6.2, 'growl', 0.8, dict(d=0.9, pitch=1.6)), (7.6, 'growl', 0.8, dict(d=0.6, pitch=1.1)), (8.1, 'growl', 0.7, dict(d=0.5, pitch=1.4)), (8.5, 'growl', 0.7, dict(d=0.5, pitch=1.8)),
    (9.4, 'thud', 0.4, dict(pitch=1.4)), (9.6, 'riser', 0.25, dict(d=1.0, pitch=0.6)),
    (10.6, 'growl', 1.0, dict(d=1.1, pitch=0.55)), (11.7, 'stinger', 0.25),
    *[(12.5 + 0.4545 * i, 'note', 0.7, dict(d=0.42, pitch=p)) for i, p in enumerate(_mel)],
    *[(12.5 + 0.909 * i, 'thud', 0.3, dict(pitch=0.7)) for i in range(8)],
    (19.6, 'tada', 0.6), (19.8, 'hum', 0.3, dict(d=3.5, pitch=0.7)),
    *[(19.9 + 0.12 * i, 'tick', 0.15, dict(pitch=0.5 + (i % 5) * 0.1)) for i in range(25)],
]
AMB['Gag18'] = 'room'

# Gag19 self checkout
CUES['Gag19'] = [
    (0.0, 'beep', 0.8, dict(d=0.5, pitch=0.7)), (0.6, 'hum', 0.4, dict(d=0.8, pitch=0.6)),
    (1.5, 'beep', 0.4, dict(d=0.1, pitch=1.5)), (2.0, 'beep', 0.8, dict(d=0.5, pitch=0.7)), (3.3, 'beep', 0.8, dict(d=0.5, pitch=0.7)),
    (4.0, 'whoosh', 0.3), (5.6, 'thud', 0.3, dict(pitch=1.5)),
    *steps(6.0, 8.0, 3.0, 0.15), (7.0, 'hum', 0.2, dict(d=0.5, pitch=0.9)),
    *steps(7.6, 8.8, 3.0, 0.2, 1.2), *[(8.8 + 0.035 * i, 'tick', 0.3, dict(pitch=1.2)) for i in range(45)],
    (10.4, 'beep', 0.8, dict(d=0.5, pitch=0.7)), (10.6, 'stinger', 0.25),
    *[(11.2 + 0.5 * i, 'slide_up', 0.4, dict(d=0.25, pitch=1.0 + (i % 2) * 0.3)) for i in range(10)], *steps(11.5, 12.3, 5, 0.3, 0.8),
    (12.8, 'rumble', 0.6, dict(d=3.6, pitch=3)), (14.6, 'gasp', 0.6), (16.4, 'chime', 0.6),
    *[(16.6 + 0.06 * i, 'tick', 0.15, dict(pitch=1.8)) for i in range(45)],
    (19.4, 'tada', 0.5), (19.9, 'hum', 0.3, dict(d=3.5, pitch=1.2)),
]
AMB['Gag19'] = 'room'

# Gag20 waving
CUES['Gag20'] = [
    (0.1, 'hum', 0.4, dict(d=0.8, pitch=1.6)), *steps(1.2, 3.2, 2.6, 0.2), *steps(2.0, 3.2, 5, 0.25, 1.2),
    (3.2, 'tada', 0.3), (3.4, 'hum', 0.3, dict(d=0.5, pitch=1.9)), (4.6, 'stinger', 0.35), (4.8, 'gasp', 0.4),
    (5.8, 'whoosh', 0.2), (6.8, 'hum', 0.4, dict(d=0.8, pitch=0.8)), (8.0, 'whoosh', 0.3),
    (8.6, 'slide_down', 0.6, dict(d=0.4, pitch=2)), (8.65, 'rumble', 0.4, dict(d=1.2, pitch=2)),
    (10.1, 'thud', 0.4, dict(pitch=1.4)), (10.9, 'thud', 0.6, dict(pitch=1.3)), (11.0, 'rumble', 0.5, dict(d=1.0, pitch=2.2)),
    *[(12.0 + 0.11 * i, 'tick', 0.25, dict(pitch=1.5)) for i in range(22)],
    (14.4, 'slide_down', 0.6, dict(d=0.4, pitch=2)), (15.5, 'thud', 0.4, dict(pitch=1.4)), (15.8, 'rumble', 0.5, dict(d=0.8, pitch=2.2)),
    (16.8, 'hum', 0.3, dict(d=0.5, pitch=1.9)), (17.4, 'whoosh', 0.2), (18.4, 'hum', 0.3, dict(d=0.3, pitch=1.4)),
    (19.4, 'whoosh', 0.2), (20.0, 'stinger', 0.3), (20.6, 'slide_down', 0.6, dict(d=0.4, pitch=2)), (21.2, 'thud', 0.3, dict(pitch=1.4)),
]
AMB['Gag20'] = 'outdoor'

# Gag21 hand dryer
CUES['Gag21'] = [
    (0.0, 'rumble', 0.9, dict(d=7.4, pitch=4)), (0.0, 'whoosh', 0.6, dict(d=2.0, pitch=0.5)),
    (0.4, 'hum', 0.3, dict(d=1.5, pitch=0.8)), (3.4, 'hum', 0.4, dict(d=1.6, pitch=1.2)),
    (5.2, 'riser', 0.6, dict(d=2.2, pitch=1.4)), (5.2, 'beep', 0.4, dict(d=0.3, pitch=1.4)), (5.4, 'gasp', 0.6),
    (7.4, 'crash', 1.0), (7.45, 'thud', 0.8, dict(pitch=0.7)),
    (8.0, 'whoosh', 0.7, dict(d=3.0, pitch=0.4)), (9.2, 'hum', 0.6, dict(d=1.6, pitch=2.2)), (9.6, 'rumble', 0.5, dict(d=1.4, pitch=1.2)),
    (11.0, 'chime', 0.3, dict(d=2.0, pitch=0.5)), (12.3, 'hum', 0.25, dict(d=0.4, pitch=0.9)), (13.0, 'pop', 0.2),
    (15.4, 'chime', 0.2), *steps(15.4, 16.8, 3.0, 0.2), (17.0, 'gulp', 0.4), (18.2, 'whoosh', 0.2, dict(d=0.2, pitch=2)),
]
AMB['Gag21'] = 'room'
