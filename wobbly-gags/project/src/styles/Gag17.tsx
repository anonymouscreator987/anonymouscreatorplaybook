import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, RING, cl, sm, lerp, lerpP, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, FPS, Burst} from './kit';

// "Bathroom lock broke... at my own surprise party" (~20s). Opens on the lock coming off in his hand.
export const GAG17_DUR = 20;
export const GAG17_FRAMES = GAG17_DUR * FPS;

const DL = 150, DR = 470; // doorway
const TX = 880; // toilet x
const SIT = 3.0, JIG = 4.6, LEG = 5.4, BURST = 9.2, WAVE = 11.0, FLASH = 11.9, POLA = 12.3, FRIDGE = 15.2;

const teenAt = (t: number): {p: PP; phone: P | null} => {
  const look = {top: '#6CB7A0', top2: '#559A86'};
  if (t < 1.8) {
    const x = 520;
    const p = stand('teen', x, 'tn', {flip: true, look});
    const fp: FaceP = t < 1.2 ? {...F0, eo: 1.2, er: 1.2, px: 20, py: 16, ps: 0.5, brow: -14, mw: 36, mh: 0, mc: -10} : {...F0, eo: 0.5, px: 0, py: 0, brow: 6, mw: 44, mc: 0};
    const lh: P = t < 1.2 ? [DR + 20, 1120] : KP(t, [[1.2, [DR + 20, 1120]], [1.4, [x - 60, 1000]], [1.8, [x - 20, 1160]]], EIO);
    return {p: {...p, lh, rh: t > 1.2 && t < 1.6 ? [x + 60, 1010] : [x + 40, 1160], fp, tilt: t > 1.2 && t < 1.6 ? 8 : 0}, phone: null};
  }
  if (t < SIT) {
    let p = stand('teen', 520, 'tn', {flip: true, look});
    p = walkPose(p, t, 1.8, 2.7, 520, TX - 40, 3.0);
    return {p: {...p, fp: {...F0, eo: 0.6, px: 20, py: 4, mc: 6}}, phone: null};
  }
  // seated facing the door (left)
  const x = TX;
  const base = stand('teen', x, 'tn', {flip: true, look});
  const sd = sm(cl((t - SIT) / 0.4));
  const seat: PP = {...base, hip: lerp(-335, -270, sd), lf: [x - 120, G - 6], rf: [x - 70, G - 6]};
  const phone: P = [x - 90, 1090];
  if (t < JIG) {
    const fp: FaceP = {...F0, eo: 0.6, px: 20, py: 22, mc: 14, mw: 40};
    return {p: {...seat, lh: [x - 70, 1110], rh: [phone[0] + Math.sin(t * 9) * 4, phone[1] + 10], fp}, phone};
  }
  const legU = cl((t - LEG) / 0.6);
  const legBack = cl((t - BURST) / 0.25);
  const foot: P = lerpP([x - 70, G - 6], [DR - 10, 1250], sm(legU) * (1 - legBack));
  const knock = RING(t, [7.2, 7.8, 8.4, 8.8], 18, 6, 9);
  const legK = 1 + 1.9 * sm(legU) * (1 - legBack);
  const fpFreeze: FaceP = {...F0, eo: 1.35, er: 1.3, ps: 0.3, px: 30, py: 0, brow: -38, mw: 34, mh: 0, mc: -12, sweat: 1};
  let fp: FaceP = fpFreeze;
  if (t > 6.4 && t < 7.0) fp = {...F0, eo: 0.15, brow: 16, mw: 60, mh: 54, mc: 0, sweat: 1};
  if (t > BURST + 0.3) fp = {...F0, eo: 1.5, er: 1.5, ps: 0.25, px: 30, py: 0, brow: -44, mw: 40, mh: 0, mc: -16, sweat: 1};
  if (t > WAVE) fp = {...F0, eo: 0.8, px: 30, py: 0, brow: -6, mw: 50, mh: 0, mc: 4, sweat: 1};
  const phoneFly: P | null = t < BURST ? phone : t < BURST + 0.8 ? [phone[0] + (t - BURST) * 200, phone[1] - Math.sin(Math.PI * (t - BURST) / 0.8) * 400] : null;
  const rh: P = t > WAVE ? [x - 120, 860 + Math.sin(t * 14) * 20] : [phone[0], phone[1] + 10];
  return {p: {...seat, rf: [foot[0] + knock, foot[1]], legK, lh: [x - 70, 1110], rh, fp, tilt: -knock * 0.3}, phone: phoneFly};
};

const GUESTS: {kind: 'teen' | 'mum'; x: number; s: number; look: object; hat: string}[] = [
  {kind: 'mum', x: 210, s: 0.62, look: {nocurl: true, hair: '#E0B04A', top: '#E86A5C', top2: '#C9574B'}, hat: '#6CB7E0'},
  {kind: 'teen', x: 300, s: 0.72, look: {top: '#5DAA5A', top2: '#4E9A4B', hair: '#1B1B1B', cap: '#F2D54A'}, hat: ''},
  {kind: 'mum', x: 380, s: 0.6, look: {}, hat: '#E86A5C'},
  {kind: 'teen', x: 440, s: 0.7, look: {top: '#6C93C6', top2: '#5A7FB0', hair: '#B5651D'}, hat: '#F2D54A'},
];

const scene = (t: number, f: number) => {
  const {p: teen, phone} = teenAt(t);
  const open = cl((t - BURST) / 0.2);
  const doorW = lerp(DR - DL, 40, sm(open));
  const bulge = RING(t, [7.2, 7.8, 8.4, 8.8], 10, 6, 9) + (t > JIG && t < LEG ? Math.sin(t * 40) * 2 : 0);
  const singing = t > BURST + 0.2 && t < BURST + 0.9;
  return (
    <g>
      <Room wall="#BFE3E8" floor="#E9E9EE" trim="#ffffff66" />
      {/* tiles */}
      {Array.from({length: 7}).map((_, i) => <line key={i} x1={-300} y1={1000 + i * 70} x2={1500} y2={1000 + i * 70} stroke="#fff" strokeWidth={4} opacity={0.6} />)}
      {/* mirror + sink */}
      <rect x={600} y={620} width={160} height={210} rx={70} fill="#E6F6FA" stroke={INK} strokeWidth={7} />
      <rect x={560} y={1060} width={240} height={50} rx={20} fill="#fff" stroke={INK} strokeWidth={7} />
      <rect x={650} y={1110} width={60} height={G - 1110} fill="#fff" stroke={INK} strokeWidth={6} />
      {/* hallway seen through doorway */}
      <rect x={DL} y={680} width={DR - DL} height={G - 680} fill="#F2D8A8" stroke={INK} strokeWidth={8} />
      <g>
        <clipPath id="hall"><rect x={DL} y={680} width={DR - DL} height={G - 680} /></clipPath>
        <g clipPath="url(#hall)">
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${DL + i * 60} 700 l30 40 l30 -40`} stroke={['#E86A5C', '#F2D54A', '#6CB7E0'][i % 3]} strokeWidth={8} fill="none" />)}
          {t > BURST && GUESTS.map((g, i) => {
            const q = stand(g.kind, g.x, `g${i}`, {s: g.s, look: g.look as PP['look']});
            const fp: FaceP = singing ? {...F0, eo: 0, happy: 1, mw: 40, mh: 40, mc: 10} : {...F0, eo: 1.3, er: 1.25, px: 30, py: 6, ps: 0.4, brow: -30, mw: 36, mh: 0, mc: -12};
            const arms: P = i === 1 ? [g.x + 50, 1000] : [g.x + 30, 1190];
            return (
              <g key={i}>
                <Person {...q} fp={fp} rh={arms} lh={[g.x - 20, 1200]} />
                {g.hat && <polygon points={`${g.x - 40},${G - (g.kind === 'teen' ? 600 : 520) * g.s / 0.68} ${g.x + 40},${G - (g.kind === 'teen' ? 600 : 520) * g.s / 0.68} ${g.x},${G - (g.kind === 'teen' ? 760 : 660) * g.s / 0.68}`} fill={g.hat} stroke={INK} strokeWidth={5} />}
              </g>
            );
          })}
          {t > BURST && <g transform="translate(330 1170)">
            <rect x={-80} y={-50} width={160} height={70} rx={10} fill="#F7A6C8" stroke={INK} strokeWidth={6} />
            {[-50, -15, 20, 55].map((x) => <g key={x}><rect x={x - 5} y={-90} width={10} height={40} fill="#fff" stroke={INK} strokeWidth={3} /><path d={`M${x} -104 q8 10 0 14 q-8 -4 0 -14Z`} fill="#F2A04A" /></g>)}
          </g>}
          {t > BURST && <g>
            <rect x={DL + 10} y={760} width={DR - DL - 20} height={60} rx={8} fill="#fff" stroke={INK} strokeWidth={5} />
            <text x={(DL + DR) / 2} y={805} textAnchor="middle" fontFamily="PH" fontSize={40} fill="#E86A5C">HAPPY B-DAY!!</text>
          </g>}
        </g>
      </g>
      {/* door */}
      <g transform={`translate(${bulge} 0)`}>
        <rect x={DL} y={680} width={doorW} height={G - 680} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
        {doorW > 120 && <g>
          <rect x={DL + doorW - 70} y={1030} width={40} height={60} rx={8} fill={t < 0.6 ? '#C9CED6' : '#7d8590'} stroke={INK} strokeWidth={5} />
          <rect x={DL + 30} y={760} width={doorW - 60} height={200} rx={6} fill="none" stroke={INK} strokeWidth={4} opacity={0.4} />
        </g>}
      </g>
      <rect x={DL - 12} y={668} width={DR - DL + 24} height={G - 668} fill="none" stroke={INK} strokeWidth={14} />
      {/* toilet */}
      <rect x={TX + 30} y={980} width={120} height={180} rx={14} fill="#fff" stroke={INK} strokeWidth={7} />
      <path d={`M${TX - 90} 1180 L${TX + 60} 1180 L${TX + 40} 1320 Q${TX - 20} 1350 ${TX - 70} 1300Z`} fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <rect x={TX - 40} y={1320} width={80} height={G - 1320} fill="#fff" stroke={INK} strokeWidth={6} />
      {/* TP */}
      <circle cx={TX + 200} cy={1120} r={30} fill="#fff" stroke={INK} strokeWidth={6} />
      <Person {...teen} />
      {phone && <g transform={`translate(${phone[0]} ${phone[1]}) rotate(${t > BURST ? t * 900 : -10})`}>
        <rect x={-20} y={-36} width={40} height={72} rx={8} fill="#2D2D33" stroke={INK} strokeWidth={5} />
        <rect x={-14} y={-28} width={28} height={54} rx={4} fill="#7CC6F0" />
      </g>}
      {/* lock in hand at start */}
      {t < 1.5 && <g transform={`translate(${t < 1.2 ? DR + 30 : lerp(DR + 30, 700, (t - 1.2) / 0.3)} ${t < 1.2 ? 1110 : 1110 + (t - 1.2) * 1200})`}><circle cx={0} cy={0} r={22} fill="#C9CED6" stroke={INK} strokeWidth={5} /><rect x={-4} y={-10} width={8} height={20} fill={INK} /></g>}
      {t > BURST && t < BURST + 0.3 && <Burst x={DL + 80} y={1100} r={120} />}
      <Pop t={t} at={0.15} x={DR + 160} y={1020} text="*clink*" size={70} rot={-10} life={1.0} />
      <Pop t={t} at={JIG} x={DR + 60} y={980} text="*jiggle jiggle*" size={56} rot={6} life={0.9} />
      <Pop t={t} at={6.5} x={620} y={820} text="OCCUPIED!!" size={96} rot={-6} col="#FFF3A8" life={0.9} />
      {[7.2, 7.8, 8.4, 8.8].map((k, i) => <Pop key={k} t={t} at={k} x={DL - 40 + (i % 2) * 40} y={900 + i * 60} text="KNOCK" size={60} rot={i % 2 ? 10 : -10} life={0.5} />)}
      <Pop t={t} at={BURST + 0.2} x={320} y={640} text="SURPRI—" size={100} rot={-4} col="#F7A6C8" life={0.8} />
      <Pop t={t} at={WAVE + 0.1} x={TX - 40} y={780} text="...hi" size={80} rot={6} life={0.9} />
      {void f}
    </g>
  );
};

export const Gag17: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let cam: {cx: number; cy: number; z: number; sh?: number} = {cx: 560, cy: 1040, z: 1.05};
  if (t < 1.2) cam = {cx: DR + 20, cy: 1080, z: K(t, [[0, 3.2], [1.2, 2.6]], EIO)};
  else if (t > JIG + 0.4 && t < LEG) cam = {cx: TX - 60, cy: 900, z: 2.4};
  else if (t > BURST + 0.3 && t < WAVE - 0.2) cam = {cx: 310, cy: 1000, z: 1.9};
  else cam = {cx: 560, cy: 1040, z: 1.05, sh: t > BURST && t < BURST + 0.3 ? 10 : 0};
  const caption =
    t < 2.4 ? 'the bathroom lock: purely decorative' :
    t < JIG ? '5 peaceful seconds' :
    t > BURST + 0.9 && t < FLASH ? 'it was MY surprise party.' :
    t > POLA && t < FRIDGE ? 'and someone brought a camera' :
    t > FRIDGE ? 'mum put it on the fridge. forever.' : undefined;
  const flash = t > FLASH && t < FLASH + 0.25 ? 1 - (t - FLASH) / 0.25 : 0;
  // polaroid snapshot of the moment
  const snapshot = (
    <svg x={-300} y={-330} width={600} height={560} viewBox="40 620 1000 940" preserveAspectRatio="xMidYMid slice">
      {scene(WAVE + 0.5, f)}
    </svg>
  );
  const polaroid = (sc: number, rot: number, x: number, y: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`}>
      <rect x={-340} y={-370} width={680} height={780} rx={10} fill="#fff" stroke={INK} strokeWidth={8} />
      {snapshot}
      <rect x={-300} y={-330} width={600} height={560} fill="none" stroke={INK} strokeWidth={5} />
      <text x={0} y={330} textAnchor="middle" fontFamily="PH" fontSize={64} fill={INK}>best b-day ever ♥</text>
    </g>
  );
  let body: React.ReactNode;
  if (t < FRIDGE) {
    body = scene(t, f);
  } else {
    // fridge shot
    const z = K(t, [[FRIDGE, 0.9], [GAG17_DUR, 1.25]], (x) => x);
    cam = {cx: 540, cy: 1000, z};
    body = (
      <g>
        <Room wall="#F7E9C2" floor="#B98A5A" />
        <rect x={180} y={300} width={720} height={G - 300} rx={30} fill="#EEF3F7" stroke={INK} strokeWidth={10} />
        <line x1={180} y1={700} x2={900} y2={700} stroke={INK} strokeWidth={8} />
        <rect x={820} y={420} width={30} height={200} rx={10} fill="#C9CED6" stroke={INK} strokeWidth={5} />
        <rect x={820} y={760} width={30} height={260} rx={10} fill="#C9CED6" stroke={INK} strokeWidth={5} />
        {/* baby pics + drawings */}
        <rect x={230} y={340} width={170} height={200} fill="#fff" stroke={INK} strokeWidth={5} transform="rotate(-6 315 440)" />
        <circle cx={315} cy={430} r={50} fill="#F7E9C2" stroke={INK} strokeWidth={4} />
        <rect x={620} y={360} width={170} height={150} fill="#FFF3A8" stroke={INK} strokeWidth={5} transform="rotate(5 705 435)" />
        <path d="M650 470 l30 -60 l30 60 M740 400 a20 20 0 1 0 1 0" stroke="#E86A5C" strokeWidth={6} fill="none" />
        {polaroid(0.62, 4, 540, 1020)}
        <path d="M540 780 m-24 0 a24 24 0 0 1 48 0 a24 24 0 0 1 -48 0" fill="#E86A5C" />
        <path d="M516 790 L540 830 L564 790Z" fill="#E86A5C" />
      </g>
    );
  }
  const overlay = t > POLA && t < FRIDGE ? (
    <g transform={`translate(540 ${K(t, [[POLA, 2400], [POLA + 0.5, 1040]], EIO)})`}>{polaroid(1, K(t, [[POLA, -20], [POLA + 0.5, -4]], EIO), 0, 0)}</g>
  ) : null;
  return (
    <Shell title="" dur={GAG17_DUR} bg="#BFE3E8" cam={cam} caption={caption} flash={flash} overlay={overlay}>
      {body}
    </Shell>
  );
};
