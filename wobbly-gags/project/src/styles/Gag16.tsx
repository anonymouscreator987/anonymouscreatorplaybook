import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, cl, sm, lerp, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, FPS} from './kit';

// "The bus is 'on time'" - outdoor, rain, sarcastic arrival board, splash, then three buses at once.
export const GAG16_DUR = 14;
export const GAG16_FRAMES = GAG16_DUR * FPS;

const BUS1 = 4.6, SPLASH = 5.55, SUN = 8.2, THREE = 9.4, NOPE = 11.0;
const ROAD = G + 30;

const boardText = (t: number) => {
  if (t < 1.4) return '2 MIN';
  if (t < 2.2) return '5 MIN';
  if (t < 3.0) return '17 MIN';
  if (t < 3.8) return 'SOON™';
  if (t < BUS1) return 'LOL';
  if (t < THREE) return 'ARRIVED';
  return 'ON TIME :)';
};

const teenAt = (t: number): PP => {
  const x = 520;
  const p = stand('teen', x, 'tn', {look: {top: '#E8B04A', top2: '#C99332', pants: '#4A5A7A', shoe: '#E86A5C'}});
  let fp: FaceP = {...F0, eo: 0.55, px: 26, py: -16, brow: 8, mw: 44, mh: 0, mc: -4};
  let lh: P = [x - 20, 1170], rh: P = [x + 40, 1170];
  let tilt = 0;
  if (t < BUS1) {
    // checks board, increasingly dead inside; drip hits head
    const n = Math.floor(t / 0.8);
    fp = {...fp, eo: lerp(0.8, 0.35, cl(t / 4)), brow: 4 + n * 2, mc: -2 - n * 2};
    if (Math.floor(t * 1.2) % 2 === 0) fp = {...fp, px: -4, py: 20}; // looks at phone
    rh = [x + 60, 1080];
  } else if (t < SPLASH) {
    // hopeful wave
    fp = {...F0, eo: 1.0, px: -26, py: 0, brow: -10, mw: 54, mh: 24, mc: 18};
    rh = [x - 30 + Math.sin(t * 18) * 30, 820];
    tilt = -6;
  } else if (t < SUN) {
    const drip = t > SPLASH + 0.2;
    fp = drip ? {...F0, eo: 0.25, px: 0, py: 0, ps: 0.6, brow: 12, mw: 40, mh: 0, mc: -2} : {...F0, eo: 1.4, er: 1.3, ps: 0.3, brow: -40, mw: 30, mh: 40};
    rh = drip ? [x + 40, 1180] : [x - 30, 860];
    lh = [x - 30, 1180];
  } else if (t < NOPE) {
    fp = {...F0, eo: 0.4, px: -20, py: 4, ps: 0.6, brow: 12, mw: 46, mh: 0, mc: -6};
    if (t > THREE + 0.6) fp = {...fp, px: -28, eo: 0.5, brow: 16, tilt: 20, mc: -10};
  } else {
    // walks home instead
    let q = walkPose({...p, fp, lh, rh}, t, NOPE + 0.3, GAG16_DUR, x, 1300, 2.6);
    return {...q, fp: {...F0, eo: 0.5, px: 26, py: 0, brow: 6, mw: 44, mc: 6}};
  }
  const wet = t > SPLASH ? {top: '#9C7A3A', top2: '#86682F', pants: '#344260', shoe: '#B5544A', hair: '#2A1E1A'} : p.look;
  return {...p, look: wet, fp, lh, rh, tilt};
};

const Bus: React.FC<{x: number; col: string; label: string; doors?: number}> = ({x, col, label, doors = 0}) => (
  <g transform={`translate(${x} ${ROAD + 170})`}>
    <rect x={0} y={-430} width={900} height={400} rx={40} fill={col} stroke={INK} strokeWidth={10} />
    {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={40 + i * 160} y={-390} width={130} height={130} rx={14} fill="#BFE6FA" stroke={INK} strokeWidth={7} />)}
    <rect x={30} y={-230} width={840} height={30} fill="#fff" opacity={0.5} />
    <rect x={720} y={-250} width={120} height={200} rx={10} fill="#BFE6FA" stroke={INK} strokeWidth={7} />
    {doors > 0 && <rect x={720} y={-250} width={120 * doors} height={200} fill={INK} opacity={0.6} />}
    <rect x={250} y={-470} width={400} height={60} rx={10} fill={INK} />
    <text x={450} y={-425} textAnchor="middle" fontFamily="PH" fontSize={46} fill="#F2D54A">{label}</text>
    {[170, 700].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={64} fill="#2D2D33" stroke={INK} strokeWidth={8} /><circle cx={wx} cy={-30} r={24} fill="#999" stroke={INK} strokeWidth={5} /></g>)}
  </g>
);

export const Gag16: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const sunny = t > SUN;
  const teen = teenAt(t);
  const bus1x = K(t, [[BUS1, -1000], [SPLASH + 0.6, 1300]], (x) => x);
  const busIn = (i: number) => K(t, [[THREE + i * 0.15, 1300 + i * 200], [THREE + 0.6 + i * 0.15, -620 + i * 0]], EIO);
  const boardCU = t > 0.9 && t < 4.4 && Math.floor((t - 0.9) / 0.8) % 2 === 0;
  const faceCU = t > SPLASH + 0.6 && t < SUN;
  const cam = boardCU
    ? {cx: 760, cy: 760, z: 2.6}
    : faceCU
      ? {cx: 520, cy: 880, z: 2.2}
      : {cx: 560, cy: 1060, z: 1.0, sh: t > SPLASH && t < SPLASH + 0.25 ? 9 : 0};
  const sky = sunny ? '#9FD8F5' : '#5E6B80';
  const rain = !sunny ? Array.from({length: 70}).map((_, i) => {
    const x = ((i * 157) % 1700) - 300;
    const y = (((i * 263) + f * 46) % 2100) - 300;
    return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 60} stroke="#CFE0F0" strokeWidth={4} opacity={0.6} />;
  }) : null;
  // splash wave over teen
  const sw = t - SPLASH;
  return (
    <Shell title={'The bus is "on time"'} dur={GAG16_DUR} bg={sky} cam={cam}>
      <rect x={-800} y={-400} width={2700} height={2800} fill={sky} />
      {sunny && <g>
        <circle cx={900} cy={420} r={110} fill="#F7D84A" stroke={INK} strokeWidth={8} />
        {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M-100 ${980 - i * 34} A700 520 0 0 1 1300 ${980 - i * 34}`} fill="none" stroke={['#E86A5C', '#F2A04A', '#F2D54A', '#5DAA5A', '#6C93C6'][i]} strokeWidth={30} opacity={0.6} />)}
      </g>}
      {!sunny && [0, 1, 2].map((i) => <ellipse key={i} cx={100 + i * 420} cy={330 + (i % 2) * 60} rx={260} ry={90} fill="#465266" stroke={INK} strokeWidth={6} />)}
      {/* city */}
      {[[-200, 600], [80, 760], [960, 640], [1180, 820]].map(([x, y], i) => <rect key={i} x={x} y={y} width={260} height={G - y} fill={sunny ? '#C8B8E8' : '#6B6680'} stroke={INK} strokeWidth={7} />)}
      {/* pavement + road */}
      <rect x={-800} y={G} width={2700} height={40} fill={sunny ? '#C9C2B4' : '#8A857A'} stroke={INK} strokeWidth={6} />
      <rect x={-800} y={ROAD} width={2700} height={900} fill="#3E3F48" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={-200 + i * 360} y={ROAD + 250} width={180} height={18} fill="#F2D54A" />)}
      <ellipse cx={560} cy={ROAD + 70} rx={200} ry={30} fill="#7E93AE" stroke={INK} strokeWidth={5} opacity={t < SPLASH ? 0.9 : 0.3} />
      {/* shelter */}
      <rect x={280} y={720} width={540} height={30} fill="#5A6A7A" stroke={INK} strokeWidth={7} />
      <rect x={300} y={750} width={14} height={G - 750} fill="#5A6A7A" stroke={INK} strokeWidth={5} />
      <rect x={790} y={750} width={14} height={G - 750} fill="#5A6A7A" stroke={INK} strokeWidth={5} />
      <path d="M520 720 L540 750 L560 720" fill={sky} stroke={INK} strokeWidth={5} /> {/* hole in roof */}
      {/* arrival board */}
      <rect x={640} y={680} width={240} height={110} rx={10} fill="#141820" stroke={INK} strokeWidth={7} />
      <text x={760} y={752} textAnchor="middle" fontFamily="PH" fontSize={boardText(t).length > 7 ? 40 : 54} fill="#F2A04A">{boardText(t)}</text>
      <Person {...teen} />
      {/* drip through roof hole */}
      {!sunny && [0, 1].map((i) => { const ph = (t * 1.3 + i * 0.5) % 1; return <path key={i} d="M0 -12 Q9 2 0 9 Q-9 2 0 -12Z" transform={`translate(540 ${760 + ph * 120})`} fill="#BFE6FA" stroke={INK} strokeWidth={3} opacity={ph < 0.9 ? 1 : 0} />; })}
      {t > BUS1 && t < SPLASH + 0.7 && <Bus x={bus1x} col="#E86A5C" label="NOT IN SERVICE" />}
      {sw > 0 && sw < 0.6 && <path d={`M${300} ${ROAD + 60} Q${520} ${ROAD - 600 * Math.sin(Math.PI * sw / 0.6)} ${820} ${ROAD + 60}`} fill="#7E93AE" stroke={INK} strokeWidth={8} opacity={0.85} />}
      {t > THREE && [2, 1, 0].map((i) => <g key={i} transform={`translate(${i * 340} ${0})`}><Bus x={busIn(i)} col={['#5DAA5A', '#6C93C6', '#F2A04A'][i]} label={['42', '42', '42'][i]} doors={t > THREE + 1.0 ? 1 : 0} /></g>)}
      {rain}
      <Pop t={t} at={SPLASH} x={560} y={900} text="SPLOOSH" size={120} rot={-6} col="#BFE6FA" />
      <Pop t={t} at={SPLASH + 1.1} x={530} y={700} text="cool. cool cool." size={50} rot={4} life={1.4} />
      <Pop t={t} at={SUN + 0.2} x={300} y={600} text="*birds singing*" size={56} rot={-4} life={1.2} />
      <Pop t={t} at={NOPE} x={520} y={780} text="nope." size={100} rot={-8} life={1.2} />
    </Shell>
  );
};
