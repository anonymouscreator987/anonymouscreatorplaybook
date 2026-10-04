import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, Easing} from 'remotion';

const INK = '#10131f';
const PAPER = '#F6D9B8';
const SKIN = '#F7E9C2';
const SIL = '#0a1020';
const RIM = '#6C93C6';
const G = 1450;
export const GAG9_FRAMES = 450;
const FPS = 30;
const TX = 760; // teen rest x
const T_END = 15;

type P = [number, number];
const EIO = Easing.bezier(0.45, 0, 0.25, 1);
const LIN = (x: number) => x;
const sm = (x: number) => x * x * (3 - 2 * x);
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a: number, b: number, w: number) => a + (b - a) * w;
const lerpP = (a: P, b: P, w: number): P => [lerp(a[0], b[0], w), lerp(a[1], b[1], w)];
const K = (t: number, keys: [number, number][], ease: (x: number) => number = EIO) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return v0 + (v1 - v0) * ease((t - t0) / Math.max(1e-6, t1 - t0));
    }
  }
  return keys[keys.length - 1][1];
};
const KP = (t: number, keys: [number, P][], ease: (x: number) => number = EIO): P => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return lerpP(v0, v1, ease((t - t0) / Math.max(1e-6, t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};
const RING = (t: number, times: number[], amp: number, freq = 3.4, damp = 6) => {
  let s = 0;
  for (const ti of times) {
    const d = t - ti;
    if (d >= 0 && d < 2) s += amp * Math.exp(-damp * d) * Math.sin(2 * Math.PI * freq * d);
  }
  return s;
};
const ik = (S: P, T: P, bend: number, L1: number, L2: number): {e: P; h: P} => {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  const d = Math.max(20, Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5));
  const base = Math.atan2(dy, dx);
  const A = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = base + bend * A;
  const e: P = [S[0] + Math.cos(a1) * L1, S[1] + Math.sin(a1) * L1];
  const a2 = Math.atan2(T[1] - e[1], T[0] - e[0]);
  return {e, h: [e[0] + Math.cos(a2) * L2, e[1] + Math.sin(a2) * L2]};
};
const Limb: React.FC<{S: P; T: P; bend: number; L1: number; L2: number; w: number; col?: string; ink: string}> = ({S, T, bend, L1, L2, w, col, ink}) => {
  const {e, h} = ik(S, T, bend, L1, L2);
  const c: P = [2 * e[0] - (S[0] + h[0]) / 2, 2 * e[1] - (S[1] + h[1]) / 2];
  const d = `M${S[0]} ${S[1]} Q${c[0]} ${c[1]} ${h[0]} ${h[1]}`;
  return (
    <g>
      <path d={d} fill="none" stroke={ink} strokeWidth={w + 12} strokeLinecap="round" />
      {col && <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" />}
    </g>
  );
};
const Burst: React.FC<{x: number; y: number; r: number; rot?: number; fill?: string}> = ({x, y, r, rot = 0, fill = '#FFF3A8'}) => {
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rr = i % 2 ? r * 0.62 : r;
    pts.push(`${Math.cos(a) * rr},${Math.sin(a) * rr}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={INK} strokeWidth={8} strokeLinejoin="round" transform={`translate(${x} ${y}) rotate(${rot})`} />;
};

/* ===================== FACE ===================== */
type FaceP = {eo: number; er: number; px: number; py: number; ps: number; brow: number; tilt: number; mw: number; mh: number; mc: number; sweat: number; happy: number};
const F0: FaceP = {eo: 0.8, er: 1, px: 14, py: 6, ps: 1, brow: 4, tilt: 0, mw: 40, mh: 0, mc: 6, sweat: 0, happy: 0};
const Eye: React.FC<{cx: number; fp: FaceP; id: string; skin: string}> = ({cx, fp, id, skin}) => {
  const R = 31 * fp.er;
  const lid = cl(1 - fp.eo, 0, 1);
  if (fp.happy > 0.5) {
    return <path d={`M${cx - R} 0 Q${cx} ${-R * 1.1} ${cx + R} 0`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />;
  }
  return (
    <g>
      <clipPath id={id}><ellipse cx={cx} cy={-10} rx={R} ry={R * 1.12} /></clipPath>
      <ellipse cx={cx} cy={-10} rx={R} ry={R * 1.12} fill="#fff" stroke={INK} strokeWidth={6} />
      <g clipPath={`url(#${id})`}>
        <circle cx={cx + fp.px * (R / 31)} cy={-10 + fp.py * (R / 31)} r={R * 0.42 * fp.ps + 3} fill={INK} />
        <circle cx={cx + fp.px * (R / 31) + 7} cy={-10 + fp.py * (R / 31) - 8} r={R * 0.12 * fp.ps + 2} fill="#fff" />
        {lid > 0 && <rect x={cx - R - 4} y={-10 - R * 1.12 - 4} width={2 * R + 8} height={(R * 2.24 + 8) * Math.min(1, lid) * 0.92} fill={skin} />}
      </g>
      {lid > 0.02 && <line x1={cx - R} y1={-10 - R * 1.12 + R * 2.24 * lid * 0.92} x2={cx + R} y2={-10 - R * 1.12 + R * 2.24 * lid * 0.92} stroke={INK} strokeWidth={6} strokeLinecap="round" />}
    </g>
  );
};
const Face: React.FC<{fp: FaceP; skin: string; uid: string; nomouth?: boolean}> = ({fp, skin, uid, nomouth}) => {
  const ex = 44, mcx = 18, mcy = 66, bw = 28;
  return (
    <g>
      <Eye cx={18 - ex} fp={fp} id={`${uid}L`} skin={skin} />
      <Eye cx={18 + ex} fp={fp} id={`${uid}R`} skin={skin} />
      {[-1, 1].map((s) => {
        const cx = 18 + s * ex;
        const by = -10 - 31 * fp.er * 1.12 - 16 + fp.brow;
        const a = (s * fp.tilt * Math.PI) / 180;
        return <line key={s} x1={cx - Math.cos(a) * bw} y1={by + Math.sin(a) * bw} x2={cx + Math.cos(a) * bw} y2={by - Math.sin(a) * bw} stroke={INK} strokeWidth={8} strokeLinecap="round" />;
      })}
      {!nomouth && (fp.mh < 5 ? (
        <path d={`M${mcx - fp.mw / 2} ${mcy} Q${mcx} ${mcy + fp.mc * 2} ${mcx + fp.mw / 2} ${mcy}`} fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
      ) : (
        <g>
          <ellipse cx={mcx} cy={mcy + fp.mh * 0.3} rx={fp.mw / 2} ry={fp.mh / 2} fill="#51111c" stroke={INK} strokeWidth={6} />
          <ellipse cx={mcx} cy={mcy + fp.mh * 0.3 + fp.mh * 0.25} rx={fp.mw * 0.28} ry={fp.mh * 0.18} fill="#EE7A88" />
        </g>
      ))}
      {fp.sweat > 0 && [0, 1].map((i) => (
        <path key={i} d="M0 -18 Q13 4 0 14 Q-13 4 0 -18Z" fill="#8FD3F4" stroke={INK} strokeWidth={4} opacity={fp.sweat}
          transform={`translate(${i ? 118 : -88} ${-60 + ((fp.sweat * 0 + (i * 17)) % 30)})`} />
      ))}
    </g>
  );
};

/* ===================== PERSON RIG ===================== */
type PP = {
  kind: 'teen' | 'mum'; x: number; s: number; hip: number; sy: number;
  lf: P; rf: P; lh: P; rh: P; fpl: number; fpr: number;
  fp: FaceP; tilt: number; silh?: boolean; bob?: number; uid: string;
};
const Person: React.FC<PP> = (q) => {
  const teen = q.kind === 'teen';
  const si = !!q.silh;
  const ink = si ? RIM : INK;
  const fill = (c: string) => (si ? SIL : c);
  const sx = 1 + (1 - q.sy) * 0.5;
  const sxx = q.s * sx, syy = q.s * q.sy;
  const loc = (p: P): P => [(p[0] - q.x) / sxx, (p[1] - G) / syy];
  const L = teen ? 170 : 160, AL = teen ? 135 : 120;
  const hip = q.hip, torso = teen ? 270 : 250, neckY = hip - torso;
  const skin = fill(SKIN);
  const pants = fill(teen ? '#7886B0' : '#C57FCB');
  const shoe = fill(teen ? '#F58FBA' : '#7DB8E8');
  const top = fill(teen ? '#A4AAB5' : '#C57FCB');
  const top2 = fill(teen ? '#8E95A1' : '#A965B3');
  const lf = loc(q.lf), rf = loc(q.rf), lh = loc(q.lh), rh = loc(q.rh);
  const legL = ik([-14, hip], [lf[0], lf[1] - 22], -1, L, L);
  const legR = ik([14, hip], [rf[0], rf[1] - 22], -1, L, L);
  const shS: P[] = [[-20, neckY + 46], [24, neckY + 46]];
  const slipper = (h: P, pitch: number, key: string) => (
    <g key={key} transform={`translate(${h[0] - 6} ${h[1] + 10}) rotate(${pitch})`}>
      <ellipse cx={26} cy={6} rx={62} ry={28} fill={shoe} stroke={ink} strokeWidth={7} />
      {!si && [0, 1, 2].map((i) => <circle key={i} cx={52 + i * 6} cy={-6 + i * 8} r={11} fill={teen ? '#FFC2DA' : '#BFE0FA'} stroke={INK} strokeWidth={3} />)}
    </g>
  );
  const hand = (T: P, key: string) => {
    const a = ik(shS[key === 'l' ? 0 : 1], T, 1, AL, AL);
    return (
      <g key={key}>
        <Limb S={shS[key === 'l' ? 0 : 1]} T={T} bend={1} L1={AL} L2={AL} w={teen ? 20 : 24} col={top} ink={ink} />
        <circle cx={a.h[0]} cy={a.h[1]} r={teen ? 19 : 18} fill={skin} stroke={ink} strokeWidth={6} />
      </g>
    );
  };
  const hw = teen ? 46 : 62;
  const headY = neckY - 108 + (q.bob || 0);
  return (
    <g transform={`translate(${q.x} ${G}) scale(${sxx} ${syy})`}>
      <ellipse cx={0} cy={4} rx={110} ry={11} fill="#000" opacity={0.25} />
      {/* legs */}
      <Limb S={[-14, hip]} T={[lf[0], lf[1] - 22]} bend={-1} L1={L} L2={L} w={teen ? 26 : 30} col={pants} ink={ink} />
      {slipper(legL.h, q.fpl, 'sl')}
      <Limb S={[14, hip]} T={[rf[0], rf[1] - 22]} bend={-1} L1={L} L2={L} w={teen ? 26 : 30} col={pants} ink={ink} />
      {slipper(legR.h, q.fpr, 'sr')}
      {/* hood ring */}
      {teen && <path d={`M-70 ${neckY + 20} Q-92 ${neckY - 50} 0 ${neckY - 62} Q92 ${neckY - 50} 70 ${neckY + 20}Z`} fill={top2} stroke={ink} strokeWidth={8} strokeLinejoin="round" />}
      {/* torso */}
      {teen ? (
        <path d={`M-${hw} ${neckY + 10} Q-${hw + 12} ${hip - 120} -${hw - 6} ${hip + 14} Q0 ${hip + 36} ${hw - 6} ${hip + 14} Q${hw + 12} ${hip - 120} ${hw} ${neckY + 10} Q0 ${neckY - 26} -${hw} ${neckY + 10}Z`} fill={top} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
      ) : (
        <path d={`M-${hw} ${neckY + 10} Q-${hw + 6} ${hip - 100} -${hw + 4} ${hip + 24} L-96 ${hip + 150} Q0 ${hip + 176} 96 ${hip + 150} L${hw + 4} ${hip + 24} Q${hw + 6} ${hip - 100} ${hw} ${neckY + 10} Q0 ${neckY - 26} -${hw} ${neckY + 10}Z`} fill={top} stroke={ink} strokeWidth={8} strokeLinejoin="round" />
      )}
      {!si && teen && <g>
        <rect x={-26} y={hip - 70} width={60} height={46} rx={14} fill="none" stroke={INK} strokeWidth={5} opacity={0.5} />
        <path d={`M-10 ${neckY + 6} L-14 ${neckY + 90} M12 ${neckY + 6} L16 ${neckY + 80}`} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      </g>}
      {!si && !teen && <g>
        <path d={`M-${hw} ${hip - 18} Q0 ${hip + 4} ${hw} ${hip - 18}`} stroke="#7d3f86" strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d={`M-20 ${neckY + 4} L10 ${hip - 20} L30 ${neckY + 2}`} stroke="#8E4A98" strokeWidth={6} fill="none" strokeLinejoin="round" />
      </g>}
      {/* neck + head */}
      <path d={`M6 ${neckY + 10} L6 ${headY + 70}`} stroke={ink} strokeWidth={teen ? 34 : 38} strokeLinecap="round" />
      <path d={`M6 ${neckY + 10} L6 ${headY + 70}`} stroke={skin} strokeWidth={teen ? 20 : 24} strokeLinecap="round" />
      <g transform={`translate(0 ${headY}) rotate(${q.tilt})`}>
        {!teen && !si && <ellipse cx={0} cy={6} rx={118} ry={118} fill="#6B3B2A" stroke={INK} strokeWidth={8} />}
        {!teen && si && <ellipse cx={0} cy={6} rx={118} ry={118} fill={SIL} stroke={ink} strokeWidth={8} />}
        <ellipse cx={0} cy={0} rx={teen ? 104 : 100} ry={teen ? 124 : 112} fill={skin} stroke={ink} strokeWidth={8} />
        {teen ? (
          <path d="M-96 -30 Q-110 -120 -20 -122 Q60 -140 98 -60 Q60 -78 20 -66 Q-30 -88 -60 -52 Q-80 -50 -96 -30Z" fill={fill('#3B2A24')} stroke={ink} strokeWidth={7} strokeLinejoin="round" />
        ) : (
          <g>
            {['#F7A6C8', '#8FD3F4', '#F7E27A', '#A7E3A0', '#F7A6C8'].map((c, i) => (
              <rect key={i} x={-36} y={-18} width={72} height={34} rx={17} fill={fill(c)} stroke={ink} strokeWidth={6} transform={`translate(${-70 + i * 36} ${-112 + Math.abs(i - 2) * 18}) rotate(${-50 + i * 25})`} />
            ))}
            <path d="M-100 -20 Q-60 -64 0 -58 Q60 -64 100 -20 Q50 -34 0 -30 Q-50 -34 -100 -20Z" fill={fill('#6B3B2A')} stroke={ink} strokeWidth={6} />
          </g>
        )}
        {!si && <Face fp={q.fp} skin={SKIN} uid={q.uid} />}
      </g>
      {/* arms on top */}
      {hand(lh, 'l')}
      {hand(rh, 'r')}
    </g>
  );
};

/* ===================== TIMELINE ===================== */
const T_OPEN = 4.0, T_FACE = 5.0, T_SHELF = 6.2, T_REACH = 8.7, T_FREEZE = 9.8, T_TWIST = 10.8, T_SIT = 12.2, T_WIDE = 13.0;
const T_BOWL = 7.7;

const tipFeet = (t: number) => {
  let A = 100, B = 160, ay = 0, by = 0, act = 0;
  for (let k = 0; k < 6; k++) {
    const ts = 0.25 + 0.6 * k;
    if (t < ts) continue;
    const u = cl((t - ts) / 0.6);
    const d = 210 * sm(u);
    const lift = Math.sin(Math.PI * u) * 70;
    if (k % 2 === 0) { A = 100 + 210 * (k / 2) + d; if (u < 1) { ay = lift; act = u; } }
    else { B = 160 + 210 * ((k - 1) / 2) + d; if (u < 1) { by = lift; act = u; } }
  }
  return {A, B, ay, by, act};
};
const mouthOpenAt = (t: number, off: number) => {
  const ph = (((t - 12.9) / 0.9 + off) % 1 + 1) % 1;
  return ph > 0.45 && ph < 0.62 ? 1 : 0;
};
const eatHand = (t: number, off: number, bowl: P, mouth: P): P => {
  const ph = (((t - 12.9) / 0.9 + off) % 1 + 1) % 1;
  if (ph < 0.3) return [bowl[0], bowl[1] - 6 * Math.sin(ph * 20)];
  if (ph < 0.5) return lerpP(bowl, mouth, sm((ph - 0.3) / 0.2));
  if (ph < 0.62) return mouth;
  return lerpP(mouth, bowl, sm((ph - 0.62) / 0.38));
};
const SITB: P = [700, 1338];

const teenAt = (t: number): PP => {
  const fe = tipFeet(t);
  let x = TX, hip = -335, sy = 1, tilt = 0, bob = 0, fpl = 6, fpr = 6;
  let lf: P = [x - 28, G - 6], rf: P = [x + 30, G - 6];
  let lh: P = [x - 10, 1160], rh: P = [x + 36, 1160];
  let fp: FaceP = {...F0};
  if (t < 3.9) {
    x = (fe.A + fe.B) / 2;
    const act = fe.act;
    hip = -335 - 14 * Math.sin(Math.PI * act) * (fe.ay > 0 || fe.by > 0 ? 1 : 0);
    sy = 1 + 0.05 * Math.sin(Math.PI * act) * (fe.ay > 0 || fe.by > 0 ? 1 : 0);
    lf = [fe.A, G - 20 - fe.ay]; rf = [fe.B, G - 20 - fe.by];
    fpl = fe.ay > 0 ? 8 : 38; fpr = fe.by > 0 ? 8 : 38;
    lh = [x + 40, 1100 + Math.sin(t * 3) * 6]; rh = [x + 86, 1066 - Math.sin(t * 3) * 6];
    tilt = 4 + 3 * Math.sin(t * 2);
    // squeak wince just after each landing
    let wince = 0;
    for (let k = 0; k < 6; k++) { const d = t - (0.85 + 0.6 * k); if (d >= 0 && d < 0.2) wince = 1; }
    fp = {...F0, eo: wince ? 0.25 : 0.6, px: 20, py: 8, mw: wince ? 22 : 38, mc: wince ? -4 : 3, brow: wince ? -2 : 2, tilt: wince ? -12 : 0, sweat: 0};
    if (t < 0.25) { x = (100 + 160) / 2; }
  } else if (t < T_OPEN) {
    fp = {...F0, eo: 0.7, px: 20, py: 6};
    lh = [x + 40, 1100]; rh = [x + 86, 1066];
  } else if (t < T_REACH) {
    const blind = K(t, [[T_OPEN, 0], [T_OPEN + 0.12, 1], [4.65, 1], [5.0, 0.2]], EIO);
    rh = KP(t, [[T_OPEN + 0.1, [x + 86, 1066]], [T_OPEN + 0.3, [x + 24, 925]], [4.65, [x + 24, 925]], [5.0, [x + 36, 1150]]], EIO);
    lh = KP(t, [[T_OPEN, [x + 40, 1100]], [5.0, [x - 10, 1160]]], EIO);
    fp = {...F0, eo: K(t, [[T_OPEN, 0.7], [T_OPEN + 0.12, 0.08], [4.6, 0.1], [5.0, 1.15]], EIO), er: K(t, [[4.8, 1], [5.2, 1.3]], EIO),
      px: 24, py: 4, ps: K(t, [[5.0, 0.5], [5.4, 0.45]], EIO),
      brow: K(t, [[4.8, 4], [5.1, -30]], EIO), mw: K(t, [[4.9, 40], [5.2, 34]], EIO), mh: K(t, [[4.9, 0], [5.2, 46]], EIO), mc: 0, sweat: 0, happy: 0};
    if (t < 4.6) fp = {...fp, eo: 0.08, brow: 12, tilt: 0, mw: 46, mh: 0, mc: -8};
    void blind;
    tilt = t >= 5.0 ? -3 : 5;
    if (t >= T_SHELF) { fp = {...fp, eo: 1, px: 26, py: 8}; }
  } else if (t < T_FREEZE) {
    const r = sm(cl((t - T_REACH) / 0.5));
    lh = [x + 40, 1110];
    rh = lerpP([x + 36, 1150], [880, 1080], r);
    const turn = t > 9.62 ? 1 : 0;
    fp = {...F0, eo: 1.05, er: 1.1, px: turn ? -22 : 28, py: turn ? 4 : 8, ps: turn ? 0.45 : 1, brow: turn ? -34 : -8, mw: turn ? 30 : 46, mh: turn ? 60 : 0, mc: turn ? 0 : 8, sweat: turn ? 1 : 0};
    tilt = turn ? -6 : -2;
  } else if (t < T_TWIST) {
    fp = {...F0, eo: 1.4, er: 1.4, px: -18, py: 4, ps: 0.35, brow: -40, mw: 30, mh: 56, mc: 0, sweat: 1};
    lh = [800, 1110]; rh = [800, 1106];
  } else if (t < T_SIT) {
    const mt = t;
    lh = KP(mt, [[T_TWIST, [790, 1112]], [11.35, [790, 1112]], [11.7, [770, 1150]]], EIO);
    rh = KP(mt, [[T_TWIST, [792, 1104]], [11.35, [792, 1104]], [11.7, [776, 1140]], [11.95, [776, 1090]], [12.1, [815, 1070]]], EIO);
    const stun = t < 11.9;
    fp = {...F0, eo: stun ? 1.4 : 1.1, er: stun ? 1.4 : 1.2, px: stun ? -18 : 6, py: 4, ps: stun ? 0.35 : 0.8, brow: stun ? -40 : -20, mw: stun ? 30 : 36, mh: stun ? 56 : 0, mc: stun ? 0 : 4, sweat: stun ? 1 : 0};
    if (t >= 11.95) fp = {...fp, brow: -26, mw: 30, mh: 0, mc: 8};
    lf = [x - 28, G - 6]; rf = [x + 30, G - 6];
  } else {
    // sitting
    const q = sm(cl((t - T_SIT) / 0.7));
    x = lerp(TX, 785, q);
    hip = lerp(-335, -55, q);
    sy = 1 - 0.04 * Math.sin(Math.PI * q);
    lf = lerpP([TX - 28, G - 6], [x + 125, G - 8], q); rf = lerpP([TX + 30, G - 6], [x + 165, G - 8], q);
    const mouth: P = [x + 18, 1190];
    const eat = t > 12.95;
    rh = eat ? eatHand(t, 0, SITB, mouth) : lerpP([815, 1070], SITB, q);
    lh = lerpP([770, 1150], [x - 40, 1340], q);
    const open = eat ? mouthOpenAt(t, 0) : 0;
    const happy = t > 13.1 ? 1 : 0;
    const chew = Math.sin(t * 13) * 0.5 + 0.5;
    fp = {...F0, eo: happy ? 0 : 0.9, happy, px: 8, py: 6, brow: -4, mw: open ? 36 : 44, mh: open ? 34 : 0, mc: 14, sweat: 0};
    if (eat && !open && t > 13.3) fp = {...fp, mw: 38, mh: 0, mc: 12 + chew * 6};
    tilt = t > 13.3 ? Math.sin(t * 6.5) * 2.5 : 0;
    bob = t > 13.3 ? Math.sin(t * 6.5) * 3 : 0;
  }
  return {kind: 'teen', x, s: 0.8, hip, sy, lf, rf, lh, rh, fpl: fpl, fpr: fpr, fp, tilt, bob, uid: 'tn'};
};

const MS = 0.68;
const mumAt = (t: number): PP => {
  let x = 500, hip = -250 * 1.0 - 0, sy = 1, tilt = 0, bob = 0;
  hip = -300;
  let lf: P = [x - 30, G - 4], rf: P = [x + 30, G - 4];
  const crossL = (xx: number): P => [xx + 50, 1086];
  const crossR = (xx: number): P => [xx - 40, 1100];
  let lh = crossL(x), rh = crossR(x);
  let fp: FaceP = {...F0, eo: 0.5, px: 10, py: 2, brow: 8, tilt: 16, mw: 56, mh: 0, mc: -10};
  let silh = t < T_TWIST;
  if (t < T_TWIST) {
    x = 520;
    lf = [x - 30, G - 4]; rf = [x + 30, G - 4];
    lh = crossL(x); rh = crossR(x);
  } else if (t < T_SIT) {
    const w = cl((t - T_TWIST) / 0.6);
    x = lerp(520, 630, sm(w));
    const ph = w * 3.2 * Math.PI * 2 / 2;
    const walking = w > 0 && w < 1;
    lf = walking ? [x - 24 + 40 * Math.sin(ph), G - 4 - 18 * Math.max(0, Math.cos(ph))] : [x - 30, G - 4];
    rf = walking ? [x + 24 - 40 * Math.sin(ph), G - 4 - 18 * Math.max(0, -Math.cos(ph))] : [x + 30, G - 4];
    bob = walking ? Math.abs(Math.sin(ph)) * -6 : 0;
    hip = -300 + (walking ? Math.abs(Math.sin(ph)) * -8 : 0);
    // arms
    lh = KP(t, [[T_TWIST, crossL(x)], [11.1, crossL(x)], [11.3, [790, 1100]], [11.6, [790, 1104]], [11.9, [700, 1118]]], EIO);
    rh = KP(t, [[T_TWIST, crossR(x)], [11.1, crossR(x)], [11.3, [792, 1112]], [11.6, [792, 1108]], [11.9, [716, 1126]], [12.05, [800, 1086]], [12.2, [722, 1130]]], EIO);
    // 'wait, what' stern then softening
    const soft = t > 11.9;
    fp = {...F0, eo: soft ? 0.8 : 0.55, px: 12, py: 4, brow: soft ? 2 : 6, tilt: soft ? 2 : 16, mw: soft ? 44 : 56, mh: 0, mc: soft ? 10 : -12};
    if (t > 12.05) fp = {...fp, mc: 14, mw: 50};
    tilt = soft ? -4 : 0;
  } else {
    const q = sm(cl((t - T_SIT) / 0.7));
    x = lerp(630, 600, q);
    hip = lerp(-300, -52, q);
    sy = 1 - 0.04 * Math.sin(Math.PI * q);
    lf = lerpP([x - 30, G - 4], [x + 130, G - 8], q); rf = lerpP([x + 30, G - 4], [x + 168, G - 8], q);
    const mouth: P = [x + 14, 1198];
    const eat = t > 12.95;
    lh = lerpP([700, 1118], [x + 30, 1300], q);
    rh = eat ? eatHand(t, 0.45, SITB, mouth) : lerpP([722, 1130], SITB, q);
    const open = eat ? mouthOpenAt(t, 0.45) : 0;
    const happy = t > 13.5 ? 1 : 0;
    fp = {...F0, eo: happy ? 0 : 0.85, happy, px: 8, py: 6, brow: 2, tilt: 0, mw: open ? 34 : 50, mh: open ? 30 : 0, mc: 14};
    tilt = t > 13.3 ? Math.sin(t * 6.5 + 1) * 2.5 : 0;
    bob = t > 13.3 ? Math.sin(t * 6.5 + 1) * 3 : 0;
  }
  return {kind: 'mum', x, s: MS, hip, sy, lf, rf, lh, rh, fpl: 0, fpr: 0, fp, tilt, silh, bob, uid: 'mm'};
};

const bowlAt = (t: number): P => {
  if (t < 9.6) return [880, 1090];
  if (t < T_TWIST) return KP(t, [[9.6, [880, 1090]], [9.75, [790, 1106]]], EIO);
  if (t < 11.3) return [790, 1106];
  if (t < 11.9) return KP(t, [[11.3, [790, 1106]], [11.9, [708, 1122]]], EIO);
  if (t < T_SIT) return [708, 1122];
  const q = sm(cl((t - T_SIT) / 0.7));
  return lerpP([708, 1122], SITB, q);
};
const spoonAt = (t: number): {p: P; show: boolean} => {
  if (t < 11.9) return {p: [0, 0], show: false};
  const m = mumAt(t), te = teenAt(t);
  if (t < 12.1) return {p: m.rh, show: true};
  if (t < 12.95) return {p: te.rh, show: true};
  return {p: te.rh, show: true};
};

/* ===================== DOOR / FRIDGE ===================== */
const doorState = (t: number) => {
  // returns signed width: + covering fridge to the right of hinge, - slab swung out to the left (face-on)
  if (t < T_OPEN) return 320;
  if (t < T_OPEN + 0.35) return K(t, [[T_OPEN, 320], [T_OPEN + 0.35, 0]], EIO);
  if (t < T_OPEN + 0.9) return K(t, [[T_OPEN + 0.35, 0], [T_OPEN + 0.9, -240]], EIO);
  if (t < T_REACH + 0.2) return -240;
  if (t < 9.75) return K(t, [[T_REACH + 0.2, -240], [9.75, -16]], EIO);
  return -16;
};
const glowAt = (t: number) => (t < T_OPEN ? 0 : t < 4.9 ? K(t, [[T_OPEN, 0.1], [T_OPEN + 0.12, 1]], EIO) : 1);

/* ===================== SHOTS ===================== */
const ShelfBg: React.FC<{u: number}> = ({u}) => (
  <g>
    <rect x={-50} y={-50} width={1180} height={2020} fill="url(#fridgeBg)" />
    <rect x={-50} y={1360} width={1180} height={30} fill="#9CC7E6" stroke={INK} strokeWidth={6} />
    <rect x={-50} y={1390} width={1180} height={600} fill="#B6D8EE" opacity={0.7} />
    <path d="M60 60 L60 700 M1020 60 L1020 700" stroke="#fff" strokeWidth={14} opacity={0.5} strokeLinecap="round" />
    <path d={`M0 ${200 + u * 0} L1080 ${340}`} stroke="#fff" strokeWidth={4} opacity={0.0} />
  </g>
);
const Lettuce: React.FC<{u: number}> = ({u}) => {
  const droop = Math.sin(u * 5) * 4;
  return (
    <g transform={`translate(540 1330) scale(${1 + u * 0.05})`}>
      <ellipse cx={0} cy={10} rx={330} ry={26} fill="#000" opacity={0.15} />
      {[-1, 1].map((s) => (
        <path key={s} d={`M${s * 40} -40 Q${s * 330} -260 ${s * 300} -20 Q${s * 330} ${60 + droop} ${s * 190} 10 Z`} fill="#A9C46C" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      ))}
      <path d="M-210 -10 Q-250 40 -190 10 M210 -10 Q250 40 190 10" stroke="#8A6B3A" strokeWidth={14} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-190} rx={210} ry={230} fill="#C8DB8A" stroke={INK} strokeWidth={9} />
      <path d="M-140 -330 Q-60 -200 -120 -60 M20 -400 Q60 -240 10 -80 M140 -330 Q100 -200 150 -60" stroke="#8FA85A" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M-90 -400 Q-10 -460 80 -410 Q${130 + droop} -330 120 -250`} fill="#B6CE78" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <circle cx={-70} cy={-170} r={16} fill={INK} /><circle cx={70} cy={-170} r={16} fill={INK} />
      <path d="M-60 -90 Q0 -130 60 -90" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M-100 -215 L-40 -200 M100 -215 L40 -200" stroke={INK} strokeWidth={8} strokeLinecap="round" />
      <path d={`M-98 ${-150 + ((u * 3) % 1) * 90} q-12 18 0 26 q12 -8 0 -26Z`} fill="#8FD3F4" stroke={INK} strokeWidth={4} />
    </g>
  );
};
const Yogurt: React.FC<{u: number}> = ({u}) => (
  <g transform={`translate(540 1330) scale(${1 + u * 0.05})`}>
    <ellipse cx={0} cy={10} rx={200} ry={20} fill="#000" opacity={0.15} />
    <path d="M-130 -330 L130 -330 L100 0 L-100 0 Z" fill="#fff" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M-124 -250 L124 -250 L108 -90 L-108 -90 Z" fill="#F29BB1" stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={-170} r={42} fill="#E8445F" stroke={INK} strokeWidth={6} />
    <path d="M-12 -208 l12 -14 l12 14" stroke="#4F9A55" strokeWidth={8} fill="none" strokeLinecap="round" />
    <ellipse cx={0} cy={-330} rx={130} ry={26} fill="#C9CED6" stroke={INK} strokeWidth={8} />
    <path d="M60 -340 q70 -30 100 20 q-10 -20 -60 -4Z" fill="#C9CED6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-20 -50 Q0 -30 20 -50" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.6} />
    <path d="M-440 -1100 L-300 -1000 M-440 -1060 L-330 -990 M-420 -1120 L-280 -1030" stroke="#fff" strokeWidth={0} />
    <g transform="translate(-380 -980)" stroke={INK} strokeWidth={3} fill="none" opacity={0.45}>
      <path d="M-60 -200 L60 100 M-60 -200 L120 -60 M-60 -200 L-50 80 M-30 -120 Q10 -120 0 -80 M20 -20 Q60 -30 50 10" />
    </g>
    <text x={-250} y={-250} fontFamily="PH" fontSize={64} fill={INK} opacity={0.65} transform="rotate(-8)">just one.</text>
  </g>
);
const Bowl: React.FC<{u: number; hand: number}> = ({u, hand}) => (
  <g>
    <g transform={`translate(540 960) rotate(${u * 40})`} opacity={0.5}>
      {Array.from({length: 14}).map((_, i) => (
        <line key={i} x1={Math.cos((i / 14) * 6.2832) * 380} y1={Math.sin((i / 14) * 6.2832) * 380} x2={Math.cos((i / 14) * 6.2832) * 520} y2={Math.sin((i / 14) * 6.2832) * 520} stroke="#FFE9A6" strokeWidth={14} strokeLinecap="round" />
      ))}
    </g>
    <g transform={`translate(540 1330) scale(${1 + u * 0.06})`}>
      <ellipse cx={0} cy={10} rx={360} ry={26} fill="#000" opacity={0.15} />
      <path d="M-300 -230 Q-290 0 0 0 Q290 0 300 -230Z" fill="#E7F3FA" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M-250 -200 Q-240 -40 0 -40" stroke="#fff" strokeWidth={10} fill="none" opacity={0.7} strokeLinecap="round" />
      <ellipse cx={0} cy={-236} rx={320} ry={46} fill="#fff" stroke={INK} strokeWidth={9} />
      <ellipse cx={0} cy={-244} rx={230} ry={26} fill="none" stroke="#D7E2EA" strokeWidth={6} />
      <g transform="translate(0 -110) rotate(-4)">
        <rect x={-215} y={-100} width={430} height={230} rx={8} fill="#FFE766" stroke={INK} strokeWidth={8} />
        <rect x={-60} y={-122} width={120} height={34} fill="#fff" opacity={0.7} stroke={INK} strokeWidth={3} transform="rotate(3)" />
        <text x={0} y={-12} textAnchor="middle" fontFamily="PH" fontSize={92} fill={INK}>DO NOT</text>
        <text x={0} y={90} textAnchor="middle" fontFamily="PH" fontSize={100} fill="#D2342B">TOUCH</text>
        <path d="M-170 108 Q-60 128 40 104 Q120 92 170 110" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    </g>
    {hand > 0 && (
      <g transform={`translate(${lerp(-260, 130, sm(hand))} ${lerp(1180, 1000, sm(hand))}) rotate(25)`}>
        <path d="M-400 40 L-40 0" stroke={INK} strokeWidth={64} strokeLinecap="round" />
        <path d="M-400 40 L-40 0" stroke="#A4AAB5" strokeWidth={50} strokeLinecap="round" />
        <circle cx={0} cy={0} r={52} fill={SKIN} stroke={INK} strokeWidth={9} />
        {[-34, -12, 12].map((dy, i) => <ellipse key={i} cx={46} cy={dy} rx={30} ry={13} fill={SKIN} stroke={INK} strokeWidth={7} />)}
      </g>
    )}
  </g>
);
const EyePanel: React.FC<{who: 'teen' | 'mum'; u: number}> = ({who, u}) => {
  const teen = who === 'teen';
  const fp: FaceP = teen
    ? {...F0, eo: 1.5, er: 1.35, px: -14, py: 20, ps: 0.32, brow: -44, tilt: -4, sweat: 0}
    : {...F0, eo: u > 0.5 ? 0.5 : 0.62, er: 1.1, px: 0, py: -14, ps: 1, brow: u > 0.5 ? 18 : 10, tilt: u > 0.5 ? 22 : 16};
  const z = 4.0 + u * 0.35;
  return (
    <g>
      <rect x={0} y={0} width={1080} height={960} fill={teen ? '#DCEEFF' : '#3A2E55'} />
      <g transform={`translate(540 ${teen ? 520 : 470}) scale(${z})`}>
        <rect x={-200} y={-200} width={400} height={400} fill={SKIN} />
        <Face fp={fp} skin={SKIN} uid={teen ? 'ept' : 'epm'} nomouth />
      </g>
      {teen ? (
        <path d="M0 0 L1080 0 L1080 90 Q800 170 540 110 Q260 60 0 130Z" fill="#3B2A24" stroke={INK} strokeWidth={10} />
      ) : (
        <g>
          <path d="M0 0 L1080 0 L1080 70 Q540 130 0 70Z" fill="#6B3B2A" stroke={INK} strokeWidth={8} />
          {['#F7A6C8', '#8FD3F4', '#F7E27A', '#A7E3A0'].map((c, i) => (
            <rect key={i} x={40 + i * 260} y={-40 + (i % 2) * 14} width={200} height={110} rx={55} fill={c} stroke={INK} strokeWidth={8} transform={`rotate(${(i - 1.5) * 8} ${140 + i * 260} 20)`} />
          ))}
        </g>
      )}
      {teen && <path d="M830 560 q-26 40 0 62 q26 -22 0 -62Z" fill="#8FD3F4" stroke={INK} strokeWidth={6} transform={`translate(0 ${((u * 2) % 1) * 40})`} />}
    </g>
  );
};

/* ===================== CAMERA ===================== */
const camAt = (t: number): {cx: number; cy: number; z: number; sh: number} => {
  if (t < T_OPEN) return {cx: K(t, [[0, 470], [T_OPEN, 600]], EIO), cy: 1070, z: 1.1, sh: 0};
  if (t < T_FACE) return {cx: 660, cy: 1090, z: K(t, [[T_OPEN, 1.22], [T_FACE, 1.3]], EIO), sh: t < 4.3 ? 6 * (1 - (t - T_OPEN) / 0.3) : 0};
  if (t < T_SHELF) { const h = teenAt(t); void h; return {cx: 790, cy: K(t, [[T_FACE, 905], [T_SHELF, 890]], EIO), z: K(t, [[T_FACE, 2.9], [T_SHELF, 3.15]], EIO), sh: 0}; }
  if (t < T_REACH) return {cx: 540, cy: 960, z: 1, sh: 0};
  if (t < T_FREEZE) return {cx: 650, cy: 1085, z: K(t, [[T_REACH, 1.2], [T_FREEZE, 1.34]], EIO), sh: 0};
  if (t < T_TWIST) return {cx: 540, cy: 960, z: 1, sh: 0};
  if (t < T_WIDE) return {cx: 710, cy: 1120, z: K(t, [[T_TWIST, 1.4], [T_WIDE, 1.5]], EIO), sh: t > T_SIT + 0.6 && t < T_SIT + 0.8 ? 5 : 0};
  return {cx: 650, cy: 1110, z: 1.2, sh: 0};
};

/* ===================== SCENE ===================== */
export const Gag9: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const boil = Math.floor(f / 2) % 3;
  const cam = camAt(t);
  const shk = cam.sh * (f % 2 ? 1 : -1);
  const camT = `translate(540 960) scale(${cam.z}) translate(${-cam.cx + shk * 0.6} ${-cam.cy + shk * (f % 3 ? 0.5 : -0.5)})`;
  const teen = teenAt(t);
  const mum = mumAt(t);
  const dw = doorState(t);
  const glow = glowAt(t);
  const bowl = bowlAt(t);
  const sp = spoonAt(t);
  const foil = t < 11.9;

  const shot = t >= T_FACE && t < T_SHELF ? 'face' : t >= T_SHELF && t < T_REACH ? 'shelf' : t >= T_FREEZE && t < T_TWIST ? 'eyes' : 'wide';

  // impact flash + dust
  let flash = 0;
  for (const it of [T_OPEN + 0.05, 9.75]) {
    const d = Math.round((t - it) * FPS);
    if (d === 0 || d === 1) flash = Math.max(flash, d === 0 ? 1 : 0.6);
  }
  const puffs: React.ReactNode[] = [];
  [[T_SIT + 0.62, 800], [T_SIT + 0.62, 600], [9.75, 640]].forEach(([lt, bx], i) => {
    const d = t - lt;
    if (d >= 0 && d < 0.45) {
      const q = d / 0.45;
      for (const s of [-1, 1]) puffs.push(<circle key={`${i}${s}`} cx={bx + s * (60 + q * 90)} cy={G - 14 - q * 26} r={14 + q * 24} fill="none" stroke="#C9DDF5" strokeWidth={5 * (1 - q)} opacity={0.9 * (1 - q)} />);
    }
  });
  // squeak marks
  const eeks: React.ReactNode[] = [];
  if (t < 4) for (let k = 0; k < 6; k++) {
    const d = t - (0.85 + 0.6 * k);
    if (d >= 0 && d < 0.4) {
      const fe = tipFeet(0.85 + 0.6 * k + 0.01);
      const fx = k % 2 === 0 ? fe.A : fe.B;
      eeks.push(<text key={k} x={fx + 30 + d * 40} y={G - 90 - d * 120} fontFamily="PH" fontSize={44} fill="#fff" stroke={INK} strokeWidth={8} paintOrder="stroke" opacity={1 - d / 0.4} transform={`rotate(-10 ${fx} ${G})`}>eek</text>);
    }
  }
  const spoon = sp.show ? (
    <g transform={`translate(${sp.p[0]} ${sp.p[1]}) rotate(-35)`}>
      <line x1={0} y1={0} x2={70} y2={0} stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <line x1={0} y1={0} x2={70} y2={0} stroke="#E5E9EF" strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={86} cy={0} rx={22} ry={15} fill="#E5E9EF" stroke={INK} strokeWidth={6} />
    </g>
  ) : null;
  const bowlView = (
    <g transform={`translate(${bowl[0]} ${bowl[1] + (t >= T_SIT ? 0 : 0)})`}>
      <path d="M-70 -50 Q-66 0 0 0 Q66 0 70 -50Z" fill="#E7F3FA" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {foil ? (
        <g>
          <path d="M-78 -50 Q0 -118 78 -50Z" fill="#D3D8E0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-36 -70 L-18 -90 M10 -76 L28 -92" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <ellipse cx={0} cy={-50} rx={70} ry={12} fill="#E0904A" stroke={INK} strokeWidth={5} />
          <path d="M-30 -56 q10 -12 20 0 M10 -54 q10 -12 22 0" stroke="#B8651F" strokeWidth={4} fill="none" />
        </g>
      )}
    </g>
  );
  const fridgeItems = (
    <g>
      {[[690, 800, 50, 120], [760, 780, 36, 140], [830, 790, 60, 130], [900, 800, 40, 110]].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y + (860 - y - h) + 0} width={w} height={h} rx={10} fill={['#BFD9EC', '#CFE3F0', '#B4D2E6', '#C8DDEC'][i]} stroke={INK} strokeWidth={4} opacity={0.75} />
      ))}
      <rect x={700} y={1160} width={70} height={100} rx={8} fill="#CFE3F0" stroke={INK} strokeWidth={4} opacity={0.7} />
      <rect x={800} y={1170} width={60} height={90} rx={8} fill="#BFD9EC" stroke={INK} strokeWidth={4} opacity={0.7} />
      <rect x={680} y={1340} width={120} height={80} rx={8} fill="#B4D2E6" stroke={INK} strokeWidth={4} opacity={0.7} />
    </g>
  );

  const wide = (
    <g transform={camT}>
      <g filter="url(#wob)">
        {/* room */}
        <rect x={-700} y={-200} width={2600} height={G + 204} fill="#17264A" />
        <rect x={-700} y={G + 4} width={2600} height={900} fill="#0F1A36" />
        <path d={`M-300 ${G + 4} Q540 ${G - 8} 1500 ${G + 6}`} stroke={INK} strokeWidth={6} fill="none" />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={-300} y1={G + 70 + i * 90} x2={1500} y2={G + 70 + i * 90} stroke="#fff" strokeWidth={3} opacity={0.06} />)}
        {/* window with moon */}
        <rect x={80} y={560} width={230} height={290} rx={10} fill="#2A4585" stroke={INK} strokeWidth={8} />
        <line x1={195} y1={560} x2={195} y2={850} stroke={INK} strokeWidth={6} /><line x1={80} y1={705} x2={310} y2={705} stroke={INK} strokeWidth={6} />
        <circle cx={250} cy={620} r={26} fill="#E8F0FF" stroke={INK} strokeWidth={4} />
        {/* wall cabinets */}
        <rect x={-100} y={230} width={500} height={250} rx={12} fill="#223566" stroke={INK} strokeWidth={7} />
        <line x1={150} y1={230} x2={150} y2={480} stroke={INK} strokeWidth={5} />
        <circle cx={130} cy={360} r={9} fill="#7D93C9" /><circle cx={170} cy={360} r={9} fill="#7D93C9" />
        {/* counter + microwave */}
        <rect x={-300} y={1150} width={700} height={G - 1150} fill="#22366B" stroke={INK} strokeWidth={8} />
        <rect x={-300} y={1128} width={720} height={36} rx={8} fill="#31497F" stroke={INK} strokeWidth={7} />
        <line x1={110} y1={1170} x2={110} y2={G} stroke={INK} strokeWidth={5} opacity={0.6} />
        <rect x={20} y={960} width={240} height={166} rx={14} fill="#2C3C66" stroke={INK} strokeWidth={7} />
        <rect x={40} y={980} width={140} height={120} rx={8} fill="#18233F" stroke={INK} strokeWidth={5} />
        <rect x={196} y={982} width={52} height={36} rx={5} fill="#0C1A14" stroke={INK} strokeWidth={4} />
        <text x={222} y={1010} textAnchor="middle" fontFamily="PH" fontSize={26} fill="#7CFF9A">12:03</text>
        {/* fridge body */}
        <rect x={640} y={650} width={320} height={G - 650} rx={14} fill={glow > 0 ? '#EAF6FF' : '#3E5C80'} stroke={INK} strokeWidth={8} />
        {glow > 0 && <g>
          {[860, 1060, 1260].map((y) => <rect key={y} x={646} y={y} width={308} height={14} fill="#B6D8EE" stroke={INK} strokeWidth={4} />)}
          {fridgeItems}
        </g>}
        {/* light spill */}
        {glow > 0 && <g opacity={glow}>
          <polygon points={`640,680 -400,980 -400,1920 640,${G}`} fill="url(#cone)" />
          <ellipse cx={420} cy={G + 40} rx={560} ry={90} fill="#CFE6FF" opacity={0.22} />
        </g>}
        {/* bowl on shelf */}
        {t < 9.6 && glow > 0 && <g transform="translate(0 0)">{bowlView}</g>}
        {/* mum behind slab */}
        {t >= 4.9 && <Person {...mum} />}
        {/* door */}
        {dw > 0 ? (
          <g>
            <rect x={640} y={650} width={dw} height={G - 650} rx={14} fill="#D6E2EC" stroke={INK} strokeWidth={8} />
            {dw > 150 && <rect x={640 + dw - 34} y={870} width={14} height={160} rx={6} fill="#8FA6BA" stroke={INK} strokeWidth={4} />}
            {dw > 150 && <line x1={640} y1={900} x2={640 + dw} y2={900} stroke={INK} strokeWidth={5} opacity={0.5} />}
          </g>
        ) : (
          <g>
            <polygon points={`640,650 ${640 + dw},${650 + dw * 0.06} ${640 + dw},${G - dw * 0.06} 640,${G}`} fill="#EAF4FB" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            {dw < -60 && [880, 1080, 1280].map((y) => <line key={y} x1={640} y1={y} x2={640 + dw} y2={y + (dw * -0.06) * 0 } stroke="#9CC7E6" strokeWidth={10} />)}
            {dw < -60 && [[940, 60], [1140, 80], [1340, 50]].map(([y, h], i) => <rect key={i} x={640 + dw * 0.8} y={y - h} width={Math.abs(dw) * 0.5} height={h} rx={8} fill="#C8DDEC" stroke={INK} strokeWidth={4} />)}
          </g>
        )}
        {puffs}
        {t < T_REACH || t >= T_TWIST ? null : null}
        <Person {...teen} />
        {t >= 9.6 && t < T_SIT + 0.0 && bowlView}
        {t >= T_SIT && bowlView}
        {spoon}
        {eeks}
        {flash > 0 && null}
      </g>
      {/* glow wash */}
      {glow > 0 && <circle cx={800} cy={1050} r={900} fill="url(#halo)" opacity={glow * (shot === 'face' ? 0.9 : 0.8)} />}
    </g>
  );

  const shelfU = t < 7.0 ? (t - T_SHELF) / 0.8 : t < T_BOWL ? (t - 7.0) / 0.7 : (t - T_BOWL) / 1.0;
  const shelfView = (
    <g filter="url(#wob)">
      <ShelfBg u={shelfU} />
      {t < 7.0 && <Lettuce u={shelfU} />}
      {t >= 7.0 && t < T_BOWL && <Yogurt u={shelfU} />}
      {t >= T_BOWL && <Bowl u={shelfU} hand={K(t, [[8.2, 0], [8.62, 1]], EIO)} />}
    </g>
  );
  const eyesView = (
    <g filter="url(#wob)">
      <g><EyePanel who="teen" u={cl((t - T_FREEZE) / 1.0)} /></g>
      <g transform="translate(0 960)"><EyePanel who="mum" u={t > 10.3 ? 1 : 0} /></g>
      <rect x={0} y={950} width={1080} height={20} fill={INK} />
    </g>
  );

  const titleOp = t < 1.0 ? 1 : K(t, [[1.0, 1], [1.2, 0]], (x) => x);
  const bannerT = t - (T_END - 1.2);

  return (
    <AbsoluteFill style={{background: '#0F1A36'}}>
      <style>{`@font-face{font-family:'PH';src:url(${staticFile('fonts/PatrickHand.woff2')}) format('woff2');}`}</style>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <defs>
          <filter id="wob" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="2" seed={boil + 3} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={f % 4} result="n" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer><feFuncA type="linear" slope="0.06" /></feComponentTransfer>
          </filter>
          <linearGradient id="cone" x1="640" y1="0" x2="-400" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#E6F3FF" stopOpacity="0.55" /><stop offset="1" stopColor="#CFE6FF" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="halo"><stop offset="0" stopColor="#E6F3FF" stopOpacity="0.22" /><stop offset="1" stopColor="#E6F3FF" stopOpacity="0" /></radialGradient>
          <linearGradient id="fridgeBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F4FBFF" /><stop offset="1" stopColor="#CFE6F7" /></linearGradient>
          <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#050A18" stopOpacity="0" /><stop offset="1" stopColor="#050A18" stopOpacity="0.5" /></radialGradient>
        </defs>
        {shot === 'wide' || shot === 'face' ? wide : null}
        {shot === 'shelf' ? shelfView : null}
        {shot === 'eyes' ? eyesView : null}
        {(shot === 'wide' || shot === 'face') && <rect x={0} y={0} width={1080} height={1920} fill="url(#vig)" />}
        {flash > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#fff" opacity={flash} />}
        {titleOp > 0 && (
          <g filter="url(#wob)" opacity={titleOp}>
            <text x={540} y={200} textAnchor="middle" fontFamily="PH" fontSize={112} fill={INK} stroke={PAPER} strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">Fridge at midnight</text>
          </g>
        )}
        {/* watermark */}
        <text x={36} y={1872} fontFamily="PH" fontSize={46} fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" paintOrder="stroke" opacity={0.35}>Wobbly Gags</text>
        {/* end card banner */}
        {bannerT >= 0 && (
          <g transform={`translate(540 1720) scale(${K(bannerT, [[0, 0.6], [0.2, 1.06], [0.32, 1]], EIO)})`} opacity={cl(bannerT / 0.12)}>
            <rect x={-300} y={-52} width={600} height={104} rx={52} fill={INK} stroke="#fff" strokeWidth={5} />
            <text x={-26} y={22} textAnchor="middle" fontFamily="PH" fontSize={58} fill="#fff">Subscribe for more</text>
            <g transform={`translate(236 0) rotate(${RING(bannerT, [0.3], 18, 3, 3)})`}>
              <path d="M0 -34 C-22 -34 -26 -14 -26 4 L-26 14 L-38 26 L38 26 L26 14 L26 4 C26 -14 22 -34 0 -34Z" fill="#F2D54A" stroke="#fff" strokeWidth={3} />
              <circle cx={0} cy={34} r={8} fill="#F2D54A" />
            </g>
          </g>
        )}
        <rect x={0} y={0} width={1080} height={1920} filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
