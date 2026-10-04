import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame, Easing} from 'remotion';
export const INK = '#10131f';
export const PAPER = '#F6D9B8';
export const SKIN = '#F7E9C2';
export const SIL = '#0a1020';
export const RIM = '#6C93C6';
export const G = 1450;
export type P = [number, number];
export const EIO = Easing.bezier(0.45, 0, 0.25, 1);
export const LIN = (x: number) => x;
export const sm = (x: number) => x * x * (3 - 2 * x);
export const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, w: number) => a + (b - a) * w;
export const lerpP = (a: P, b: P, w: number): P => [lerp(a[0], b[0], w), lerp(a[1], b[1], w)];
export const K = (t: number, keys: [number, number][], ease: (x: number) => number = EIO) => {
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
export const KP = (t: number, keys: [number, P][], ease: (x: number) => number = EIO): P => {
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
export const RING = (t: number, times: number[], amp: number, freq = 3.4, damp = 6) => {
  let s = 0;
  for (const ti of times) {
    const d = t - ti;
    if (d >= 0 && d < 2) s += amp * Math.exp(-damp * d) * Math.sin(2 * Math.PI * freq * d);
  }
  return s;
};
export const ik = (S: P, T: P, bend: number, L1: number, L2: number): {e: P; h: P} => {
  const dx = T[0] - S[0], dy = T[1] - S[1];
  const d = Math.max(20, Math.min(Math.hypot(dx, dy), L1 + L2 - 0.5));
  const base = Math.atan2(dy, dx);
  const A = Math.acos(cl((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
  const a1 = base + bend * A;
  const e: P = [S[0] + Math.cos(a1) * L1, S[1] + Math.sin(a1) * L1];
  const a2 = Math.atan2(T[1] - e[1], T[0] - e[0]);
  return {e, h: [e[0] + Math.cos(a2) * L2, e[1] + Math.sin(a2) * L2]};
};
export const Limb: React.FC<{S: P; T: P; bend: number; L1: number; L2: number; w: number; col?: string; ink: string}> = ({S, T, bend, L1, L2, w, col, ink}) => {
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
export const Burst: React.FC<{x: number; y: number; r: number; rot?: number; fill?: string}> = ({x, y, r, rot = 0, fill = '#FFF3A8'}) => {
  const pts: string[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const rr = i % 2 ? r * 0.62 : r;
    pts.push(`${Math.cos(a) * rr},${Math.sin(a) * rr}`);
  }
  return <polygon points={pts.join(' ')} fill={fill} stroke={INK} strokeWidth={8} strokeLinejoin="round" transform={`translate(${x} ${y}) rotate(${rot})`} />;
};

/* ===================== FACE ===================== */
export type FaceP = {eo: number; er: number; px: number; py: number; ps: number; brow: number; tilt: number; mw: number; mh: number; mc: number; sweat: number; happy: number};
export const F0: FaceP = {eo: 0.8, er: 1, px: 14, py: 6, ps: 1, brow: 4, tilt: 0, mw: 40, mh: 0, mc: 6, sweat: 0, happy: 0};
export const Eye: React.FC<{cx: number; fp: FaceP; id: string; skin: string}> = ({cx, fp, id, skin}) => {
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
export const Face: React.FC<{fp: FaceP; skin: string; uid: string; nomouth?: boolean}> = ({fp, skin, uid, nomouth}) => {
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
export type PP = {
  kind: 'teen' | 'mum'; x: number; s: number; hip: number; sy: number;
  lf: P; rf: P; lh: P; rh: P; fpl: number; fpr: number;
  fp: FaceP; tilt: number; silh?: boolean; bob?: number; uid: string; flip?: boolean; socks?: [string, string]; look?: {top?: string; top2?: string; pants?: string; shoe?: string; hair?: string; skin?: string; tie?: string; shades?: boolean; cap?: string};
};
export const Person: React.FC<PP> = (q) => {
  const teen = q.kind === 'teen';
  const si = !!q.silh;
  const ink = si ? RIM : INK;
  const fill = (c: string) => (si ? SIL : c);
  const sx = 1 + (1 - q.sy) * 0.5;
  const sxx = q.s * sx, syy = q.s * q.sy;
  const fx = q.flip ? -1 : 1;
  const loc = (p: P): P => [((p[0] - q.x) / sxx) * fx, (p[1] - G) / syy];
  const L = teen ? 170 : 160, AL = teen ? 135 : 120;
  const hip = q.hip, torso = teen ? 270 : 250, neckY = hip - torso;
  const L0 = q.look || {};
  const skin = fill(L0.skin || SKIN);
  const pants = fill(L0.pants || (teen ? '#7886B0' : '#C57FCB'));
  const shoe = fill(L0.shoe || (teen ? '#F58FBA' : '#7DB8E8'));
  const top = fill(L0.top || (teen ? '#A4AAB5' : '#C57FCB'));
  const top2 = fill(L0.top2 || (teen ? '#8E95A1' : '#A965B3'));
  const lf = loc(q.lf), rf = loc(q.rf), lh = loc(q.lh), rh = loc(q.rh);
  const legL = ik([-14, hip], [lf[0], lf[1] - 22], -1, L, L);
  const legR = ik([14, hip], [rf[0], rf[1] - 22], -1, L, L);
  const shS: P[] = [[-20, neckY + 46], [24, neckY + 46]];
  const slipper = (h: P, pitch: number, key: string) => (
    <g key={key} transform={`translate(${h[0] - 6} ${h[1] + 10}) rotate(${pitch})`}>
      <ellipse cx={26} cy={6} rx={62} ry={28} fill={q.socks ? fill(q.socks[key === 'sl' ? 0 : 1]) : shoe} stroke={ink} strokeWidth={7} />
      {q.socks && !si && <path d="M-20 -14 L-20 22 M-6 -18 L-6 24" stroke="#fff" strokeWidth={6} opacity={0.6} />}
      {!si && !q.socks && [0, 1, 2].map((i) => <circle key={i} cx={52 + i * 6} cy={-6 + i * 8} r={11} fill={teen ? '#FFC2DA' : '#BFE0FA'} stroke={INK} strokeWidth={3} />)}
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
    <g transform={`translate(${q.x} ${G}) scale(${sxx * fx} ${syy})`}>
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
      {!si && L0.tie && <path d={`M4 ${neckY + 4} L-10 ${neckY + 40} L4 ${hip - 60} L18 ${neckY + 40}Z`} fill={L0.tie} stroke={INK} strokeWidth={5} strokeLinejoin="round" />}
      {!si && teen && !L0.tie && <g>
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
          <path d="M-96 -30 Q-110 -120 -20 -122 Q60 -140 98 -60 Q60 -78 20 -66 Q-30 -88 -60 -52 Q-80 -50 -96 -30Z" fill={fill(L0.hair || '#3B2A24')} stroke={ink} strokeWidth={7} strokeLinejoin="round" />
        ) : (
          <g>
            {['#F7A6C8', '#8FD3F4', '#F7E27A', '#A7E3A0', '#F7A6C8'].map((c, i) => (
              <rect key={i} x={-36} y={-18} width={72} height={34} rx={17} fill={fill(c)} stroke={ink} strokeWidth={6} transform={`translate(${-70 + i * 36} ${-112 + Math.abs(i - 2) * 18}) rotate(${-50 + i * 25})`} />
            ))}
            <path d="M-100 -20 Q-60 -64 0 -58 Q60 -64 100 -20 Q50 -34 0 -30 Q-50 -34 -100 -20Z" fill={fill('#6B3B2A')} stroke={ink} strokeWidth={6} />
          </g>
        )}
        {!si && <Face fp={q.fp} skin={L0.skin || SKIN} uid={q.uid} />}
        {!si && L0.shades && <g><rect x={-50} y={-44} width={60} height={40} rx={12} fill={INK} /><rect x={30} y={-44} width={60} height={40} rx={12} fill={INK} /><line x1={10} y1={-30} x2={30} y2={-30} stroke={INK} strokeWidth={6} /></g>}
        {!si && L0.cap && <g><path d="M-100 -60 Q-90 -150 10 -150 Q100 -146 104 -60Z" fill={L0.cap} stroke={INK} strokeWidth={7} /><path d="M60 -66 Q150 -70 170 -50 L100 -50Z" fill={L0.cap} stroke={INK} strokeWidth={6} /></g>}
      </g>
      {/* arms on top */}
      {hand(lh, 'l')}
      {hand(rh, 'r')}
    </g>
  );
};

export const FPS = 30;

/* ===================== POSE HELPERS ===================== */
// Standing pose for a person at x. Teen scale 0.8, mum 0.68.
export const stand = (kind: 'teen' | 'mum', x: number, uid: string, o: Partial<PP> = {}): PP => {
  const teen = kind === 'teen';
  const s = teen ? 0.8 : 0.68;
  const hy = teen ? 1160 : 1250;
  return {
    kind, x, s, hip: teen ? -335 : -300, sy: 1,
    lf: [x - 28, G - 6], rf: [x + 30, G - 6], lh: [x - 14, hy], rh: [x + 40, hy],
    fpl: 0, fpr: 0, fp: {...F0}, tilt: 0, bob: 0, uid, ...o,
  };
};
// Walking pose: x0->x1 between t0..t1, step rate in steps/sec.
export const walkPose = (p: PP, t: number, t0: number, t1: number, x0: number, x1: number, rate = 3.2): PP => {
  const w = cl((t - t0) / Math.max(1e-6, t1 - t0));
  const x = lerp(x0, x1, w);
  const walking = t > t0 && t < t1;
  const ph = (t - t0) * rate * Math.PI;
  const dir = Math.sign(x1 - x0) || 1;
  const lf: P = walking ? [x - 24 + dir * 40 * Math.sin(ph), G - 6 - 22 * Math.max(0, Math.cos(ph))] : [x - 28, G - 6];
  const rf: P = walking ? [x + 24 - dir * 40 * Math.sin(ph), G - 6 - 22 * Math.max(0, -Math.cos(ph))] : [x + 30, G - 6];
  const dx = x - p.x;
  return {
    ...p, x, lf, rf,
    lh: [p.lh[0] + dx + (walking ? -dir * 26 * Math.sin(ph) : 0), p.lh[1]],
    rh: [p.rh[0] + dx + (walking ? dir * 26 * Math.sin(ph) : 0), p.rh[1]],
    bob: (p.bob || 0) + (walking ? -Math.abs(Math.sin(ph)) * 8 : 0),
    hip: p.hip + (walking ? -Math.abs(Math.sin(ph)) * 8 : 0),
  };
};
// head centre in world coords (approx) for a pose
export const headOf = (p: PP): P => {
  const teen = p.kind === 'teen';
  const torso = teen ? 270 : 250;
  const sx = 1 + (1 - p.sy) * 0.5;
  return [p.x, G + (p.hip - torso - 108 + (p.bob || 0)) * p.s * p.sy];
  void sx;
};
export const blinkAt = (t: number, seed = 0) => {
  const ph = ((t + seed * 1.37) % 3.1);
  return ph > 2.95 ? 0.05 : 1;
};

/* ===================== CHROME ===================== */
export const Defs: React.FC<{f: number}> = ({f}) => {
  const boil = Math.floor(f / 2) % 3;
  return (
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
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stopColor="#050A18" stopOpacity="0" /><stop offset="1" stopColor="#050A18" stopOpacity="0.45" /></radialGradient>
    </defs>
  );
};
// Wraps a scene: font, defs, camera, title card, watermark, subscribe banner, grain.
export const Shell: React.FC<{
  title: string; dur: number; bg: string; cam?: {cx: number; cy: number; z: number; sh?: number};
  children: React.ReactNode; overlay?: React.ReactNode; flash?: number; vig?: boolean;
}> = ({title, dur, bg, cam = {cx: 540, cy: 960, z: 1}, children, overlay, flash = 0, vig = true}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const sh = (cam.sh || 0) * (f % 2 ? 1 : -1);
  const camT = `translate(540 960) scale(${cam.z}) translate(${-cam.cx + sh * 0.6} ${-cam.cy + sh * (f % 3 ? 0.5 : -0.5)})`;
  const titleOp = t < 1.0 ? 1 : K(t, [[1.0, 1], [1.2, 0]], (x) => x);
  const bannerT = t - (dur - 1.2);
  const fs = title.length > 22 ? 84 : title.length > 17 ? 96 : 112;
  return (
    <AbsoluteFill style={{background: bg}}>
      <style>{`@font-face{font-family:'PH';src:url(${staticFile('fonts/PatrickHand.woff2')}) format('woff2');}`}</style>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute'}}>
        <Defs f={f} />
        <g transform={camT}><g filter="url(#wob)">{children}</g></g>
        {overlay}
        {vig && <rect x={0} y={0} width={1080} height={1920} fill="url(#vig)" />}
        {flash > 0 && <rect x={0} y={0} width={1080} height={1920} fill="#fff" opacity={flash} />}
        {titleOp > 0 && (
          <g filter="url(#wob)" opacity={titleOp}>
            <text x={540} y={200} textAnchor="middle" fontFamily="PH" fontSize={fs} fill={INK} stroke={PAPER} strokeWidth={18} strokeLinejoin="round" paintOrder="stroke">{title}</text>
          </g>
        )}
        <text x={36} y={1872} fontFamily="PH" fontSize={46} fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" paintOrder="stroke" opacity={0.35}>Wobbly Gags</text>
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
// Pop text ("BONK", "zzz", etc.) that scales in then fades
export const Pop: React.FC<{t: number; at: number; x: number; y: number; text: string; size?: number; rot?: number; col?: string; life?: number}> = ({t, at, x, y, text, size = 90, rot = -8, col = '#fff', life = 0.8}) => {
  const d = t - at;
  if (d < 0 || d > life) return null;
  const sc = K(d, [[0, 0.4], [0.12, 1.15], [0.22, 1]], EIO);
  const op = d > life - 0.2 ? (life - d) / 0.2 : 1;
  return (
    <g transform={`translate(${x} ${y - d * 30}) rotate(${rot}) scale(${sc})`} opacity={op}>
      <text x={0} y={0} textAnchor="middle" fontFamily="PH" fontSize={size} fill={col} stroke={INK} strokeWidth={10} strokeLinejoin="round" paintOrder="stroke">{text}</text>
    </g>
  );
};
// Motion lines
export const Whoosh: React.FC<{x: number; y: number; dir?: number; op?: number; n?: number}> = ({x, y, dir = 1, op = 1, n = 3}) => (
  <g opacity={op}>
    {Array.from({length: n}).map((_, i) => (
      <line key={i} x1={x - dir * 30} y1={y - 40 + i * 40} x2={x - dir * (110 + (i % 2) * 40)} y2={y - 40 + i * 40} stroke={INK} strokeWidth={7} strokeLinecap="round" />
    ))}
  </g>
);
// Simple interior: wall + floor with baseboard
export const Room: React.FC<{wall: string; floor: string; trim?: string}> = ({wall, floor, trim = '#00000022'}) => (
  <g>
    <rect x={-800} y={-400} width={2700} height={G + 404} fill={wall} />
    <rect x={-800} y={G + 4} width={2700} height={1000} fill={floor} />
    <rect x={-800} y={G - 30} width={2700} height={34} fill={trim} />
    <path d={`M-300 ${G + 4} Q540 ${G - 8} 1500 ${G + 6}`} stroke={INK} strokeWidth={6} fill="none" />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-300} y1={G + 70 + i * 90} x2={1500} y2={G + 70 + i * 90} stroke="#000" strokeWidth={3} opacity={0.08} />)}
  </g>
);
