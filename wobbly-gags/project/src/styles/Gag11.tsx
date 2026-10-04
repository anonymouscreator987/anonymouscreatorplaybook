import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, cl, sm, lerp, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, FPS} from './kit';

// "Wet socks" - steps in the cat's spilled water, hops away... into another puddle.
export const GAG11_DUR = 12;
export const GAG11_FRAMES = GAG11_DUR * FPS;

const P1 = 500, P2 = 900;
const STEP1 = 2.3, HOP0 = 4.7, STEP2 = 6.5, OFF = 8.2;
const DRY = '#F4F4F4', WET = '#7FA7D6';

const teenAt = (t: number): PP => {
  let p = stand('teen', 110, 'tn', {socks: [DRY, DRY]});
  if (t < STEP1) {
    p = walkPose(p, t, 0.15, STEP1, 110, P1 - 30, 3.0);
    const x = p.x;
    return {...p, fp: {...F0, eo: 0.6, happy: 1, mc: 12, mw: 30, mh: 14}, lh: [x - 30 + Math.sin(t * 9.4) * 20, 1170], rh: [x + 60 - Math.sin(t * 9.4) * 20, 1170], tilt: Math.sin(t * 6) * 3};
  }
  const x = P1 - 30;
  if (t < HOP0) {
    // frozen, right foot in puddle
    const shock = t > STEP1 + 0.25;
    const fp: FaceP = shock
      ? {...F0, eo: 1.35, er: 1.35, ps: 0.35, px: 16, py: 20, brow: -36, mw: 40, mh: 0, mc: -14, sweat: t > 3.6 ? 1 : 0}
      : {...F0, eo: 0.6, happy: 1, mc: 12};
    const quiver = shock ? Math.sin(t * 50) * 2 : 0;
    return {...p, x, socks: [DRY, WET], lf: [x - 28, G - 6], rf: [P1 + 20, G - 6], lh: [x - 50, 1120 + quiver], rh: [x + 90, 1110 - quiver], fp, tilt: shock ? -4 + quiver : 0, hip: -330};
  }
  if (t < STEP2) {
    // hops on left foot, holding the wet one up
    const u = (t - HOP0) / (STEP2 - HOP0);
    const hx = lerp(x, P2 - 10, sm(u));
    const hop = Math.abs(Math.sin(((t - HOP0) * Math.PI) / 0.3)) * 60;
    const fp: FaceP = {...F0, eo: 0.15, brow: 14, mw: 44, mh: 0, mc: -12, tilt: -10, sweat: 1};
    return {...p, x: hx, socks: [DRY, WET], hip: -335 - hop, lf: [hx - 6, G - 6 - hop], rf: [hx + 70, G - 150 - hop], lh: [hx + 60, 1150 - hop], rh: [hx + 90, 1170 - hop], fp, tilt: Math.sin(t * 20) * 6, bob: 0};
  }
  const hx = P2 - 10;
  if (t < OFF) {
    // second foot lands in puddle 2
    const land = t > STEP2;
    const dead = t > STEP2 + 0.5;
    const fp: FaceP = dead
      ? {...F0, eo: 0.42, px: 0, py: 0, ps: 0.6, brow: 10, mw: 46, mh: 0, mc: 0}
      : {...F0, eo: 1.4, er: 1.4, ps: 0.3, brow: -40, mw: 30, mh: 50, mc: 0};
    return {...p, x: hx, socks: [land ? WET : DRY, WET], lf: [P2 - 30, G - 6], rf: [hx + 40, G - 6], lh: [hx - 30, 1170], rh: [hx + 50, 1175], fp, tilt: dead ? 3 : -6};
  }
  // squelch walk away, defeated
  p = {...p, socks: [WET, WET]};
  p = walkPose({...p, x: hx, lh: [hx - 20, 1185], rh: [hx + 40, 1190]}, t, OFF, GAG11_DUR, hx, hx + 330, 2.2);
  return {...p, fp: {...F0, eo: 0.42, px: 0, py: 4, ps: 0.6, brow: 10, mw: 46, mh: 0, mc: -4}, tilt: 6, hip: p.hip + 10};
};

const Puddle: React.FC<{x: number; t: number; at: number}> = ({x, t, at}) => {
  const d = t - at;
  const ring = d > 0 && d < 0.6 ? d / 0.6 : -1;
  return (
    <g>
      <ellipse cx={x} cy={G + 22} rx={110} ry={24} fill="#9FD3F2" stroke={INK} strokeWidth={5} opacity={0.9} />
      <ellipse cx={x - 30} cy={G + 16} rx={30} ry={6} fill="#fff" opacity={0.7} />
      {ring >= 0 && <ellipse cx={x} cy={G + 22} rx={110 + ring * 90} ry={24 + ring * 18} fill="none" stroke="#9FD3F2" strokeWidth={8 * (1 - ring)} />}
      {d > 0 && d < 0.5 && [-1, 1, -0.5, 0.6].map((s, i) => (
        <circle key={i} cx={x + s * (40 + d * 260)} cy={G - 10 - Math.sin((d / 0.5) * Math.PI) * (80 + i * 20)} r={12} fill="#9FD3F2" stroke={INK} strokeWidth={4} />
      ))}
    </g>
  );
};

export const Gag11: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const teen = teenAt(t);
  // shots: foot close-up, face close-up, then wide
  const footShot = t > STEP1 + 0.3 && t < 3.4;
  const faceShot = t >= 3.4 && t < HOP0;
  const face2 = t > STEP2 + 0.5 && t < OFF;
  const cam = footShot
    ? {cx: P1 + 10, cy: G - 30, z: 2.6}
    : faceShot
      ? {cx: P1 - 20, cy: 880, z: K(t, [[3.4, 2.2], [HOP0, 2.5]], (x) => x)}
      : face2
        ? {cx: P2 - 10, cy: 900, z: K(t, [[STEP2 + 0.5, 1.9], [OFF, 2.1]], (x) => x)}
        : {cx: Math.max(540, teen.x - 40), cy: 1060, z: 1.05, sh: (t > STEP1 && t < STEP1 + 0.15) || (t > STEP2 && t < STEP2 + 0.15) ? 7 : 0};
  const drips = footShot || (t > STEP2 && t < OFF);
  return (
    <Shell title="Wet socks" dur={GAG11_DUR} bg="#CDE7D7" cam={cam}>
      <Room wall="#CDE7D7" floor="#E9D9B8" />
      {/* checker tiles */}
      {Array.from({length: 14}).map((_, i) => <rect key={i} x={-300 + i * 140} y={G + 4} width={70} height={500} fill="#000" opacity={0.04} />)}
      {/* kitchen counter + window */}
      <rect x={-200} y={1120} width={420} height={G - 1120} fill="#F3EFE6" stroke={INK} strokeWidth={8} />
      <rect x={-210} y={1096} width={440} height={34} rx={8} fill="#B98A5A" stroke={INK} strokeWidth={7} />
      <rect x={640} y={520} width={300} height={320} rx={12} fill="#BFE6FA" stroke={INK} strokeWidth={8} />
      <line x1={790} y1={520} x2={790} y2={840} stroke={INK} strokeWidth={6} /><line x1={640} y1={680} x2={940} y2={680} stroke={INK} strokeWidth={6} />
      {/* tipped cat bowl */}
      <g transform={`translate(${P1 + 150} ${G - 6}) rotate(-70)`}>
        <path d="M-40 -34 L40 -34 L30 0 L-30 0Z" fill="#E86A5C" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <text x={0} y={-8} textAnchor="middle" fontFamily="PH" fontSize={28} fill="#fff">CAT</text>
      </g>
      <Puddle x={P1 + 20} t={t} at={STEP1} />
      <Puddle x={P2 - 30} t={t} at={STEP2} />
      <Person {...teen} />
      {drips && [0, 1, 2].map((i) => {
        const ph = ((t * 1.6 + i / 3) % 1);
        const fx = t < STEP2 ? P1 + 20 : P2 - 30;
        return <path key={i} d="M0 -14 Q10 2 0 10 Q-10 2 0 -14Z" transform={`translate(${fx - 30 + i * 30} ${G - 40 + ph * 50})`} fill="#7FA7D6" stroke={INK} strokeWidth={3} opacity={1 - ph} />;
      })}
      <Pop t={t} at={STEP1} x={P1 + 160} y={G - 150} text="SPLSH" size={80} rot={10} col="#BFE6FA" />
      <Pop t={t} at={STEP2} x={P2 + 120} y={G - 160} text="SPLSH" size={96} rot={-10} col="#BFE6FA" />
      {t > OFF && [0, 1, 2, 3].map((i) => <Pop key={i} t={t} at={OFF + 0.2 + i * 0.42} x={teen.x + (i % 2 ? 60 : -40)} y={G - 60} text="squish" size={54} rot={i % 2 ? 8 : -8} col="#BFE6FA" life={0.5} />)}
    </Shell>
  );
};
