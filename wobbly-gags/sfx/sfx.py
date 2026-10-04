"""Procedural cartoon SFX for Wobbly Gags. Usage: python3 sfx.py <gag_id> <dur> <out.wav>
Cues come from cues.py: CUES[gag_id] = [(time, kind, gain, **kw), ...]"""
import numpy as np, wave, sys
SR = 44100
rng = np.random.default_rng(7)

def env(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return e
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def lpf(x, fc):  # fast FFT lowpass
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X[fr > fc] *= 0; return np.fft.irfft(X, len(x))
def bpf(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X[(fr < lo) | (fr > hi)] = 0; return np.fft.irfft(X, len(x))
def noise(d): return rng.standard_normal(int(d * SR))
def sweep(f0, f1, d, shape='sin'):
    n = int(d * SR); f = np.geomspace(max(f0, 1), max(f1, 1), n); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) if shape == 'sin' else np.sign(np.sin(ph)) * 0.6
def norm(x): m = np.abs(x).max(); return x / m if m > 0 else x

# ---- sound kinds ----
def thud(d=0.35, pitch=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (90 * pitch) * t * (1 - t * 0.8)) * np.exp(-t * 14)
    click = lpf(noise(d), 1800 * pitch) * np.exp(-t * 60)
    return norm(body + 0.6 * click)
def bonk(d=0.4, pitch=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    x = sum(np.sin(2 * np.pi * f * pitch * t) * np.exp(-t * k) for f, k in [(520, 18), (1340, 26), (2210, 34)])
    return norm(x + 0.4 * thud(d, 1.4 * pitch))
def boing(d=0.6, pitch=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    f = 180 * pitch * (1 + 0.35 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4))
def whoosh(d=0.35, pitch=1.0):
    x = bpf(noise(d), 400 * pitch, 3000 * pitch); n = len(x)
    return norm(x * np.sin(np.pi * np.arange(n) / n) ** 2)
def pop(d=0.12, pitch=1.0):
    return norm(sweep(900 * pitch, 300 * pitch, d) * env(int(d * SR), 0.001, 0.08))
def squeak(d=0.18, pitch=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    f = 1500 * pitch * (1 + 0.25 * np.sin(np.pi * t / d))
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d))
def slide_up(d=0.5, pitch=1.0): return norm(sweep(400 * pitch, 1600 * pitch, d) * env(int(d * SR), 0.02, 0.1))
def slide_down(d=0.6, pitch=1.0): return norm(sweep(1400 * pitch, 250 * pitch, d) * env(int(d * SR), 0.02, 0.1))
def ding(d=1.0, pitch=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    return norm(sum(a * np.sin(2 * np.pi * f * pitch * t) for f, a in [(1320, 1), (2640, 0.3), (3960, 0.12)]) * np.exp(-t * 5))
def beep(d=0.25, pitch=1.0): return norm(np.sign(np.sin(2 * np.pi * 1000 * pitch * np.arange(int(d * SR)) / SR)) * 0.5 * env(int(d * SR), 0.002, 0.01))
def step(d=0.12, pitch=1.0):
    t = np.arange(int(d * SR)) / SR
    return norm(lpf(noise(d), 900 * pitch) * np.exp(-t * 45))
def tick(d=0.05, pitch=1.0):
    t = np.arange(int(d * SR)) / SR
    return norm(bpf(noise(d), 2500 * pitch, 7000) * np.exp(-t * 160))
def splat(d=0.3, pitch=1.0):
    t = np.arange(int(d * SR)) / SR
    return norm(lpf(noise(d), 1400 * pitch) * np.exp(-t * 12) * (1 + np.sin(2 * np.pi * 30 * t)))
def drip(d=0.15, pitch=1.0): return norm(sweep(600 * pitch, 1800 * pitch, d) * env(int(d * SR), 0.002, 0.1))
def crash(d=0.9, pitch=1.0):
    t = np.arange(int(d * SR)) / SR
    x = bpf(noise(d), 1500 * pitch, 9000) * np.exp(-t * 5)
    return norm(x + 0.5 * thud(d, 0.8))
def buzz(d=0.4, pitch=1.0):
    t = np.arange(int(d * SR)) / SR
    return norm(np.sign(np.sin(2 * np.pi * 150 * pitch * t)) * (0.6 + 0.4 * np.sin(2 * np.pi * 30 * t)) * env(len(t), 0.01, 0.05))
def gulp(d=0.25, pitch=1.0): return norm(sweep(300 * pitch, 120 * pitch, d) * env(int(d * SR), 0.01, 0.1))
def rumble(d=1.0, pitch=1.0): return norm(lpf(noise(d), 160 * pitch) * env(int(d * SR), 0.1, 0.3))
def chime(d=1.4, pitch=1.0):
    out = np.zeros(int(d * SR))
    for i, f in enumerate([1046, 1318, 1568]):
        s = int(i * 0.12 * SR); seg = ding(d - i * 0.12, pitch * f / 1320)
        out[s:s + len(seg)] += seg[:len(out) - s]
    return norm(out)
def hum(d=1.0, pitch=1.0):  # mumble "voice" blob
    t = np.arange(int(d * SR)) / SR
    f = 160 * pitch * (1 + 0.15 * np.sin(2 * np.pi * 5 * t))
    x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * (0.5 + 0.5 * np.sin(2 * np.pi * 7 * t) ** 2)
    return norm(lpf(x, 1600) * env(len(t), 0.03, 0.1))
def gasp(d=0.35, pitch=1.0):
    x = bpf(noise(d), 600 * pitch, 2600 * pitch); n = len(x)
    return norm(x * np.linspace(0.2, 1, n) * env(n, 0.05, 0.05))
def snore(d=1.2, pitch=1.0):
    t = np.arange(int(d * SR)) / SR
    return norm(lpf(noise(d), 400 * pitch) * np.sin(np.pi * t / d) ** 2 * (1 + np.sin(2 * np.pi * 40 * pitch * t)))
def riser(d=1.0, pitch=1.0): return norm(sweep(200 * pitch, 900 * pitch, d) * np.linspace(0, 1, int(d * SR)))
def stinger(d=1.2, pitch=1.0):  # "wah wah" sad trombone-ish
    out = []
    for i, f in enumerate([392, 370, 349, 330]):
        dd = 0.28 if i < 3 else 0.6; t = np.arange(int(dd * SR)) / SR
        ff = f * pitch * (1 + (0.03 * np.sin(2 * np.pi * 6 * t) if i == 3 else 0))
        x = np.sign(np.sin(2 * np.pi * np.cumsum(ff * np.ones_like(t)) / SR)) * 0.5
        out.append(lpf(x, 1200) * env(len(t), 0.02, 0.05))
    return norm(np.concatenate(out)[:int(d * SR * 2)])
def tada(d=1.0, pitch=1.0):
    out = np.zeros(int(d * SR))
    for i, f in enumerate([523, 659, 784, 1046]):
        s = int(i * 0.08 * SR); t = np.arange(len(out) - s) / SR
        out[s:] += np.sign(np.sin(2 * np.pi * f * pitch * t)) * 0.3 * np.exp(-t * 3)
    return norm(lpf(out, 3000))

KINDS = {k: v for k, v in globals().items() if callable(v) and k not in ('env', 'lp', 'lpf', 'bpf', 'noise', 'sweep', 'norm')}

def render(cues, dur, path, amb=None):
    N = int(dur * SR); out = np.zeros(N)
    if amb == 'room': out += lpf(noise(dur), 200) * 0.025
    if amb == 'night': out += lpf(noise(dur), 140) * 0.02
    if amb == 'outdoor': out += bpf(noise(dur), 300, 2500) * 0.015
    for c in cues:
        t, kind, g = c[0], c[1], c[2]; kw = c[3] if len(c) > 3 else {}
        x = KINDS[kind](**kw) * g; s = int(t * SR)
        if s >= N: continue
        out[s:s + len(x)] += x[:N - s]
    out = np.tanh(out * 1.2) / np.tanh(1.2); out = out / max(1e-6, np.abs(out).max()) * 0.89
    w = wave.open(path, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes()); w.close()

if __name__ == '__main__':
    from cues import CUES, AMB
    gid, dur, path = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    render(CUES[gid], dur, path, AMB.get(gid))
    print('ok', path)
