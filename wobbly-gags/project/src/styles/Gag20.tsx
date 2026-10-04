import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, cl, sm, lerp, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, FPS} from './kit';

// "She wasn't waving at me" (~23s): wave back -> cover-up attempts -> accidentally hails a taxi -> €47 ride around the block.
export const GAG20_DUR = 23;
export const GAG20_FRAMES = GAG20_DUR * FPS;

const ROAD = G + 30;
const HUG = 3.2, FREEZE = 4.6, HAIR = 5.8, STRETCH = 6.8, HAIL = 8.0, TAXI = 8.6, IN = 10.1, GONE = 11.0, METER = 12.0, BACK = 14.4, OUT = 15.6, WAVE2 = 16.8, CHECK = 17.4, ME = 18.4, TURN = 19.4, AGAIN = 20.6;

const teenAt = (t: number): PP | null => {
  const look = {top: '#B57FE0', top2: '#9A66C6', pants: '#3E4A66', shoe: '#F2D54A'};
  let x = 430;
  if (t < 1.2) {
    const p = stand('teen', x, 'tn', {look});
    return {...p, rh: [x + 110 + Math.sin(t * 16) * 40, 740], fp: {...F0, eo: 0, happy: 1, mw: 60, mh: 36, mc: 20}, tilt: Math.sin(t * 8) * 4};
  }
  if (t >= IN && t < OUT) return null;
  if (t >= OUT) x = 430;
  let p = stand('teen', x, 'tn', {look});
  if (t < FREEZE) {
    p = walkPose(p, t, 1.2, HUG, 430, 520, 2.6);
    const w = Math.sin(t * 16) * 40;
    return {...p, rh: [p.x + 110 + w, 740], fp: {...F0, eo: 0, happy: 1, mw: 60, mh: 36, mc: 20}, tilt: Math.sin(t * 8) * 4};
  }
  x = t < IN ? 520 : 430;
  p = stand('teen', x, 'tn', {look});
  if (t < HAIR) return {...p, rh: [x + 60, 830], fp: {...F0, eo: 1.4, er: 1.35, ps: 0.3, px: 26, py: 0, brow: -38, mw: 44, mh: 0, mc: -14, sweat: t > 5.1 ? 1 : 0}};
  if (t < STRETCH) {
    const rh = KP(t, [[HAIR, [x + 60, 830]], [HAIR + 0.3, [x + 20, 760]], [HAIR + 0.5, [x - 30, 770]], [HAIR + 0.7, [x + 20, 760]]], EIO);
    return {...p, rh, fp: {...F0, eo: 0.4, px: -26, py: -10, brow: 10, mw: 40, mc: 6, sweat: 1}, tilt: -8};
  }
  if (t < HAIL) {
    const u = sm(cl((t - STRETCH) / 0.4));
    return {...p, rh: [x + 60, lerp(830, 700, u)], lh: [x - 50, lerp(1160, 700, u)], fp: {...F0, eo: 0.1, brow: 10, mw: 46, mh: 50, mc: 0, sweat: 1}, tilt: Math.sin(t * 4) * 6, hip: -345};
  }
  if (t < IN) {
    const hail = KP(t, [[HAIL, [x + 60, 760]], [HAIL + 0.3, [x + 210, 880]]], EIO);
    let fp: FaceP = {...F0, eo: 0.8, px: 26, py: 0, brow: -4, mw: 40, mc: 6, sweat: 1};
    if (t > TAXI + 0.5) fp = {...F0, eo: 0.45, px: 0, py: 0, ps: 0.6, brow: 12, mw: 46, mh: 0, mc: -6}; // looks at camera
    return {...p, rh: t > TAXI + 0.5 ? [x + 40, 1160] : hail, lh: [x - 14, 1160], fp};
  }
  // dropped back
  let fp: FaceP = {...F0, eo: 0.45, px: 26, py: 6, ps: 0.6, brow: 12, mw: 46, mh: 0, mc: -6};
  let rh: P = [x + 40, 1160], lh: P = [x - 14, 1160];
  let tilt = 0, flip = false;
  if (t > WAVE2) fp = {...F0, eo: 1.1, px: 26, py: 0, brow: -10, mw: 36, mc: 0};
  if (t > CHECK && t < ME) { flip = true; fp = {...F0, eo: 1.0, px: 26, py: 0, brow: -6, mw: 36, mc: -4}; }
  if (t > ME && t < TURN) { rh = [x + 10, 1060]; fp = {...F0, eo: 1.15, px: 26, py: 0, brow: -14, mw: 30, mh: 26, mc: 0}; tilt = 6; }
  if (t > TURN) { rh = [x + 110 + Math.sin(t * 16) * 30, 740]; fp = {...F0, eo: 0, happy: 1, mw: 50, mh: 30, mc: 18}; }
  if (t > TURN + 0.6) { fp = {...F0, eo: 0.45, px: 26, py: 0, ps: 0.6, brow: 12, mw: 46, mh: 0, mc: -6}; rh = [x + 60, 830]; }
  if (t > AGAIN) { rh = [x + 210, 880]; lh = [x - 14, 1160]; fp = {...F0, eo: 0.42, px: 26, py: 0, ps: 0.6, brow: 12, mw: 46, mh: 0, mc: -4}; }
  return {...p, rh, lh, fp, tilt, flip};
};

const lady = (t: number): PP => {
  const x = 860;
  const p = stand('mum', x, 'ld', {flip: true, look: {nocurl: true, hair: '#E0B04A', top: '#E86A5C', top2: '#C9574B', pants: '#3E4A66'}});
  let fp: FaceP = {...F0, eo: 0, happy: 1, mw: 50, mh: 24, mc: 16};
  let rh: P = [x - 60 + Math.sin(t * 14) * 30, 950];
  let lh: P = p.lh;
  if (t > HUG && t < BACK) { rh = [x - 90, 1120]; lh = [x - 80, 1130]; fp = {...F0, eo: 0, happy: 1, mw: 40, mh: 0, mc: 16}; }
  if (t > BACK) { rh = [x - 90, 1120]; lh = [x - 80, 1130]; fp = {...F0, eo: 0, happy: 1, mw: 40, mh: 0, mc: 16}; }
  if (t > WAVE2 && t < TURN) { rh = [x - 60 + Math.sin(t * 14) * 30, 950]; fp = {...F0, eo: 0.8, px: 26, py: 0, mw: 50, mh: 24, mc: 16}; }
  if (t > TURN) return {...p, flip: false, rh: [x + 60 + Math.sin(t * 14) * 30, 950], lh: [x - 14, 1250], fp: {...F0, eo: 0, happy: 1, mw: 50, mh: 24, mc: 16}};
  return {...p, rh, lh, fp};
};

const friend = (t: number): PP | null => {
  if (t < 2.0) return null;
  let p = stand('teen', -200, 'fr', {look: {top: '#5DAA5A', top2: '#4E9A4B', cap: '#3BA0E8', hair: '#1B1B1B'}});
  p = walkPose(p, t, 2.0, HUG, -200, 770, 5.0);
  if (t > HUG) return {...p, x: 770, lf: [742, G - 6], rf: [800, G - 6], rh: [860, 1080], lh: [820, 1090], fp: {...F0, eo: 0, happy: 1, mw: 50, mh: 20, mc: 16}, tilt: 6};
  return {...p, fp: {...F0, eo: 0.9, happy: 1, mw: 50, mh: 20, mc: 16}, rh: [p.x + 80, 900]};
};

const Taxi: React.FC<{x: number; door?: number}> = ({x, door = 0}) => (
  <g transform={`translate(${x} ${ROAD + 120})`}>
    <path d="M0 -60 L0 -170 Q20 -190 120 -200 L180 -300 Q200 -320 260 -320 L440 -320 Q480 -320 500 -300 L560 -200 Q640 -190 660 -170 L660 -60Z" fill="#F7D84A" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M200 -210 L240 -290 L340 -290 L340 -210Z" fill="#BFE6FA" stroke={INK} strokeWidth={6} />
    <path d="M370 -210 L370 -290 L460 -290 L520 -210Z" fill="#BFE6FA" stroke={INK} strokeWidth={6} />
    {/* driver Gary */}
    <circle cx={290} cy={-250} r={30} fill="#F7E9C2" stroke={INK} strokeWidth={5} />
    <path d="M270 -238 Q290 -226 310 -238" stroke={INK} strokeWidth={8} fill="none" />
    <circle cx={282} cy={-258} r={4} fill={INK} /><circle cx={298} cy={-258} r={4} fill={INK} />
    <rect x={290} y={-360} width={110} height={40} rx={8} fill="#fff" stroke={INK} strokeWidth={5} />
    <text x={345} y={-330} textAnchor="middle" fontFamily="PH" fontSize={30} fill={INK}>TAXI</text>
    {[...Array(8)].map((_, i) => <rect key={i} x={20 + i * 80} y={-130} width={40} height={20} fill={i % 2 ? INK : '#F7D84A'} />)}
    {door > 0 && <rect x={370} y={-210} width={150 * (1 - door * 0.7)} height={150} fill="#E0C03A" stroke={INK} strokeWidth={6} />}
    {[130, 540].map((wx) => <g key={wx}><circle cx={wx} cy={-50} r={56} fill="#2D2D33" stroke={INK} strokeWidth={8} /><circle cx={wx} cy={-50} r={20} fill="#999" stroke={INK} strokeWidth={5} /></g>)}
  </g>
);

export const Gag20: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const teen = teenAt(t);
  const ld = lady(t);
  const fr = friend(t);
  let taxiX = 2000;
  if (t > TAXI && t < GONE + 0.8) taxiX = t < IN ? K(t, [[TAXI, 1400], [TAXI + 0.4, 220]], EIO) : K(t, [[GONE, 220], [GONE + 0.8, -1200]], (x) => x * x);
  if (t > BACK && t < OUT + 0.8) taxiX = t < OUT ? K(t, [[BACK, 1400], [BACK + 0.4, 130]], EIO) : K(t, [[OUT + 0.2, 130], [OUT + 0.8, -1200]], (x) => x * x);
  if (t > AGAIN) taxiX = K(t, [[AGAIN, 1400], [AGAIN + 0.35, 220]], EIO);
  const door = (t > IN - 0.4 && t < GONE) || (t > OUT - 0.4 && t < OUT + 0.2) || t > AGAIN + 0.6 ? 1 : 0;
  let cam: {cx: number; cy: number; z: number; sh?: number} = {cx: 600, cy: 1060, z: 1.1};
  if (t < 1.2) cam = {cx: 470, cy: 880, z: K(t, [[0, 2.8], [1.2, 2.3]], EIO)};
  else if (t > FREEZE && t < HAIR) cam = {cx: 520, cy: 880, z: K(t, [[FREEZE, 2.0], [HAIR, 2.6]], (x) => x)};
  else if (t > TAXI + 0.5 && t < IN) cam = {cx: 520, cy: 880, z: 2.4};
  else if (t > CHECK && t < TURN) cam = {cx: 650, cy: 960, z: 1.6};
  const caption =
    t < 1.2 ? 'she waved. so I waved back.' :
    t > HUG + 0.2 && t < FREEZE ? 'she was NOT waving at me' :
    t > HAIR && t < STRETCH ? 'cover up #1: hair' :
    t > STRETCH && t < HAIL ? 'cover up #2: big stretch' :
    t > HAIL && t < TAXI + 0.5 ? 'cover up #3: ...' :
    t > BACK && t < WAVE2 ? 'he drove me around the block' :
    t > WAVE2 && t < CHECK ? 'wait. now she\'s waving at me?' :
    t > TURN + 0.6 && t < AGAIN ? 'nope.' :
    t > AGAIN + 0.5 ? 'see you tomorrow, Gary.' : undefined;

  if (t > METER && t < BACK) {
    const fare = (3.5 + Math.pow((t - METER) / (BACK - METER), 1.6) * 44.3).toFixed(2);
    return (
      <Shell title="" dur={GAG20_DUR} bg="#2A2A35" cam={{cx: 540, cy: 960, z: K(t, [[METER, 1.0], [BACK, 1.2]], (x) => x)}} caption="I didn't need to go anywhere.">
        <rect x={-800} y={-400} width={2700} height={2800} fill="#3A3A46" />
        <rect x={140} y={700} width={800} height={460} rx={30} fill="#16161E" stroke={INK} strokeWidth={12} />
        <rect x={190} y={760} width={700} height={240} rx={14} fill="#0C1A14" stroke={INK} strokeWidth={8} />
        <text x={540} y={930} textAnchor="middle" fontFamily="PH" fontSize={150} fill="#FF5A4A">€{fare}</text>
        <text x={540} y={1100} textAnchor="middle" fontFamily="PH" fontSize={56} fill="#F2D54A">FARE</text>
        <circle cx={540 + Math.sin(t * 20) * 3} cy={1500} r={150} fill="#2D2D33" stroke={INK} strokeWidth={10} />
        <text x={540} y={1530} textAnchor="middle" fontFamily="PH" fontSize={60} fill="#999">GARY</text>
      </Shell>
    );
  }
  return (
    <Shell title="" dur={GAG20_DUR} bg="#9FD8F5" cam={cam} caption={caption}>
      <rect x={-800} y={-400} width={2700} height={2800} fill="#9FD8F5" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={100 + i * 450} cy={360 + (i % 2) * 70} rx={170} ry={60} fill="#fff" stroke={INK} strokeWidth={6} />)}
      {[[-260, 560, '#F2A04A'], [60, 700, '#E8B4C8'], [380, 620, '#9FC8A0'], [700, 740, '#C8B8E8'], [1020, 600, '#F2D54A']].map(([x, y, c], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width={300} height={G - (y as number)} fill={c as string} stroke={INK} strokeWidth={7} />
          {[0, 1, 2].map((r) => [0, 1].map((k) => <rect key={`${r}${k}`} x={(x as number) + 50 + k * 120} y={(y as number) + 60 + r * 150} width={80} height={90} rx={6} fill="#BFE6FA" stroke={INK} strokeWidth={5} />))}
        </g>
      ))}
      <rect x={-800} y={G} width={2700} height={40} fill="#C9C2B4" stroke={INK} strokeWidth={6} />
      <rect x={-800} y={ROAD} width={2700} height={900} fill="#3E3F48" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-200 + i * 360} y={ROAD + 250} width={180} height={18} fill="#F2D54A" />)}
      {/* lamp post */}
      <rect x={1150} y={760} width={20} height={G - 760} fill="#4A4A55" stroke={INK} strokeWidth={5} />
      <circle cx={1160} cy={750} r={34} fill="#F7E9C2" stroke={INK} strokeWidth={6} />
      <Person {...ld} />
      {fr && <Person {...fr} />}
      {teen && <Person {...teen} />}
      <Taxi x={taxiX} door={door} />
      <Pop t={t} at={TAXI} x={900} y={1200} text="SKRRRT" size={100} rot={-6} col="#FFF3A8" />
      <Pop t={t} at={BACK} x={900} y={1200} text="SKRRRT" size={100} rot={6} col="#FFF3A8" />
      <Pop t={t} at={AGAIN} x={900} y={1200} text="SKRRRT" size={100} rot={-6} col="#FFF3A8" />
      <Pop t={t} at={ME + 0.1} x={560} y={760} text="me??" size={80} rot={-8} life={0.9} />
    </Shell>
  );
};
