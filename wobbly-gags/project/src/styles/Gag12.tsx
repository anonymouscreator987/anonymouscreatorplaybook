import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, cl, sm, lerp, lerpP, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, FPS} from './kit';

// "Spider" - teen panics onto a chair, mum calmly removes it... it comes back.
export const GAG12_DUR = 13;
export const GAG12_FRAMES = GAG12_DUR * FPS;

const SP: P = [760, 860]; // spider on wall
const CH = 300; // chair x
const CHH = 210; // seat height
const SEE = 1.4, JUMP = 2.7, MUM0 = 4.4, GRAB = 6.0, OUT = 7.4, DOWN = 8.6, DROP = 9.6, FAINT = 10.4;

const Spider: React.FC<{x: number; y: number; s?: number; t: number; wave?: boolean}> = ({x, y, s = 1, t, wave}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((d) => [0, 1, 2, 3].map((i) => {
      const a = (-50 + i * 33) * (Math.PI / 180);
      const wig = Math.sin(t * 14 + i) * 4;
      return <path key={`${d}${i}`} d={`M0 0 Q${d * 34} ${-30 + i * 18 + wig} ${d * 52} ${Math.sin(a) * 40 + 20}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    }))}
    <ellipse cx={0} cy={0} rx={26} ry={22} fill="#2A2A35" stroke={INK} strokeWidth={5} />
    <circle cx={-9} cy={-4} r={8} fill="#fff" /><circle cx={9} cy={-4} r={8} fill="#fff" />
    <circle cx={-8} cy={-3} r={4} fill={INK} /><circle cx={10} cy={-3} r={4} fill={INK} />
    <path d="M-6 8 Q0 13 6 8" stroke="#fff" strokeWidth={3} fill="none" />
    {wave && <path d={`M22 -6 Q46 ${-40 + Math.sin(t * 16) * 10} 60 -56`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />}
  </g>
);

const teenAt = (t: number): PP => {
  let p = stand('teen', 120, 'tn');
  if (t < SEE) {
    p = walkPose(p, t, 0.1, SEE, 120, 470, 3.0);
    return {...p, fp: {...F0, eo: 0.7, px: 20, py: 10, mc: 10}};
  }
  const x = 470;
  if (t < JUMP) {
    const fp: FaceP = {...F0, eo: 1.35, er: 1.35, ps: 0.3, px: 26, py: -12, brow: -38, mw: 36, mh: t > 2.2 ? 70 : 0, mc: -12, sweat: 1};
    return {...p, x, fp, lh: [x - 40, 1080], rh: [x + 60, 1070], tilt: Math.sin(t * 50) * 2};
  }
  // jump onto chair
  const ju = cl((t - JUMP) / 0.45);
  const cx = lerp(x, CH + 10, sm(ju));
  const arc = Math.sin(Math.PI * ju) * 160;
  const lift = CHH * sm(ju) + arc;
  const up = (q: PP): PP => ({...q, hip: q.hip - lift / 0.8, lf: [q.lf[0], q.lf[1] - lift], rf: [q.rf[0], q.rf[1] - lift], lh: [q.lh[0], q.lh[1] - lift], rh: [q.rh[0], q.rh[1] - lift]});
  if (t < DOWN) {
    const tremble = Math.sin(t * 46) * 3;
    const relieved = t > OUT + 0.3;
    const fp: FaceP = relieved
      ? {...F0, eo: 0.1, brow: 6, mw: 40, mh: 0, mc: 8}
      : {...F0, eo: 1.3, er: 1.3, ps: 0.35, px: 30, py: -4, brow: -34, mw: 36, mh: t < JUMP + 0.6 ? 70 : 20, mc: -10, sweat: 1};
    return up({...p, x: cx + tremble, lf: [cx - 30, G - 6], rf: [cx + 30, G - 6], lh: [cx - 50, 1020], rh: [cx + 40, 1010], fp, tilt: tremble, hip: -320});
  }
  // climb down and step forward
  const du = cl((t - DOWN) / 0.5);
  const lift2 = CHH * (1 - sm(du));
  const nx = lerp(CH + 10, 470, sm(du));
  const base = {...p, x: nx, lf: [nx - 28, G - 6 - lift2] as P, rf: [nx + 30, G - 6 - lift2] as P, hip: -335 - lift2 / 0.8, lh: [nx - 14, 1160 - lift2] as P, rh: [nx + 40, 1160 - lift2] as P};
  if (t < FAINT) {
    const see = t > DROP + 0.4;
    const fp: FaceP = see ? {...F0, eo: 1.5, er: 1.5, ps: 0.25, px: 10, py: -20, brow: -44, mw: 30, mh: 30, mc: 0, sweat: 1} : {...F0, eo: 0.6, happy: 1, mc: 14};
    return {...base, fp, tilt: see ? -4 : 4};
  }
  // faint backwards
  const fu = cl((t - FAINT) / 0.4);
  const bx = 470 - 140 * sm(fu);
  if (fu < 1) return {...base, x: bx, hip: lerp(-335, -120, fu), lf: [bx + 110 * fu, G - 6 - 100 * fu], rf: [bx + 150 * fu, G - 6 - 60 * fu], lh: [bx - 60, 1000], rh: [bx + 100, 1000], tilt: -40 * fu, fp: {...F0, eo: 0.05, brow: 0, mw: 30, mh: 30}};
  return {...base, x: bx, hip: -60, sy: 0.92, lf: [bx + 170, G - 30], rf: [bx + 220, G - 10], lh: [bx - 70, G - 20], rh: [bx + 120, G - 40], tilt: -20, bob: 40,
    fp: {...F0, eo: 0.05, mw: 30, mh: 0, mc: -4, happy: 0}};
};

const mumAt = (t: number): PP => {
  let p = stand('mum', 1300, 'mm', {flip: true});
  p = walkPose(p, t, MUM0, MUM0 + 1.4, 1300, 860, 3.0);
  if (t >= OUT) p = walkPose({...p, x: 860}, t, OUT + 0.5, OUT + 1.8, 860, 1350, 3.0);
  const x = p.x;
  let fp: FaceP = {...F0, eo: 0.55, px: 12, py: 2, brow: 8, tilt: 16, mw: 50, mh: 0, mc: -6};
  let lh = p.lh, rh = p.rh;
  if (t > GRAB - 0.5 && t < OUT + 0.5) {
    const cup: P = [SP[0] + 20, SP[1] + 30];
    lh = KP(t, [[GRAB - 0.5, p.lh], [GRAB, cup], [GRAB + 0.5, cup], [GRAB + 1.0, [x - 40, 1120]]], EIO);
    rh = KP(t, [[GRAB - 0.5, p.rh], [GRAB, [cup[0] + 10, cup[1] + 20]], [GRAB + 0.5, [cup[0] + 10, cup[1] + 20]], [GRAB + 1.0, [x - 30, 1140]]], EIO);
    fp = {...fp, eo: 0.6, px: -14, py: -10, mc: 2};
  }
  if (t > GRAB + 1.0 && t < OUT + 0.5) fp = {...fp, px: -24, py: 0, eo: 0.5, brow: 10, tilt: 18, mc: -8}; // deadpan at teen
  return {...p, lh, rh, fp};
};

export const Gag12: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const teen = teenAt(t);
  const mum = mumAt(t);
  const closeUp = t > SEE + 0.2 && t < 2.1;
  const faceCU = t > DROP + 0.4 && t < FAINT;
  const cam = closeUp
    ? {cx: SP[0], cy: SP[1], z: 3.2}
    : faceCU
      ? {cx: 470, cy: 880, z: 2.2}
      : {cx: 570, cy: 1020, z: 1.0, sh: t > JUMP && t < JUMP + 0.3 ? 6 : t > FAINT + 0.4 && t < FAINT + 0.6 ? 8 : 0};
  // spider location
  const inHand = t >= GRAB && t < OUT + 0.5;
  const spOnWall = t < GRAB;
  const dropY = K(t, [[DROP, 300], [DROP + 0.5, 830]], EIO) + Math.sin(t * 3) * 6;
  return (
    <Shell title="Spider in my room" dur={GAG12_DUR} bg="#E8D6F0" cam={cam}>
      <Room wall="#E8D6F0" floor="#9C7A5C" />
      {/* poster + window */}
      <rect x={60} y={520} width={220} height={300} rx={8} fill="#F6EEDC" stroke={INK} strokeWidth={7} transform="rotate(-3 170 670)" />
      <circle cx={170} cy={640} r={60} fill="#F2D54A" stroke={INK} strokeWidth={6} />
      <rect x={1000} y={560} width={260} height={340} rx={12} fill="#BFE6FA" stroke={INK} strokeWidth={8} />
      {/* bed */}
      <rect x={640} y={1230} width={560} height={G - 1230} rx={20} fill="#6C93C6" stroke={INK} strokeWidth={8} />
      <rect x={660} y={1180} width={170} height={80} rx={30} fill="#fff" stroke={INK} strokeWidth={7} />
      {/* chair */}
      <rect x={CH - 90} y={G - CHH - 20} width={180} height={28} rx={8} fill="#E0904A" stroke={INK} strokeWidth={7} />
      <rect x={CH + 60} y={G - CHH - 240} width={28} height={250} rx={8} fill="#E0904A" stroke={INK} strokeWidth={7} />
      {[CH - 80, CH + 64].map((x) => <rect key={x} x={x} y={G - CHH + 6} width={20} height={CHH} fill="#C47835" stroke={INK} strokeWidth={6} />)}
      {spOnWall && <Spider x={SP[0]} y={SP[1]} t={t} wave={closeUp} />}
      {t > DROP && t < DROP + 3 && (
        <g>
          <line x1={470 + 60} y1={-200} x2={470 + 60} y2={dropY - 20} stroke={INK} strokeWidth={3} />
          <Spider x={470 + 60} y={dropY} s={1.2} t={t} wave={t > DROP + 0.6} />
        </g>
      )}
      <Person {...teen} />
      <Person {...mum} />
      {inHand && t > GRAB + 1.0 && <Spider x={mum.lh[0]} y={mum.lh[1] - 20} s={0.7} t={t} />}
      <Pop t={t} at={2.2} x={teen.x + 120} y={760} text="AAAA!" size={110} rot={-10} col="#FFF3A8" life={1.0} />
      <Pop t={t} at={JUMP + 0.5} x={CH + 150} y={780} text="AAAAAA" size={90} rot={8} col="#FFF3A8" life={1.2} />
      <Pop t={t} at={GRAB + 1.3} x={980} y={760} text="..." size={110} rot={0} />
      <Pop t={t} at={OUT + 0.5} x={CH + 120} y={760} text="phew" size={80} rot={-6} />
      <Pop t={t} at={FAINT + 0.45} x={380} y={1290} text="THUD" size={100} />
      <Pop t={t} at={DROP + 0.8} x={620} y={700} text="hi" size={70} rot={6} life={0.7} />
    </Shell>
  );
};
