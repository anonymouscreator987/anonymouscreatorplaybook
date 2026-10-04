import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, cl, sm, lerp, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, FPS} from './kit';

// "Self checkout vs one banana" (~24s): unexpected item -> assistant -> security -> police lights -> 3m receipt -> news.
export const GAG19_DUR = 24;
export const GAG19_FRAMES = GAG19_DUR * FPS;

const KX = 760; // kiosk x (screen centre)
const BAGX = 1010;
const PUT1 = 2.0, LIFT = 4.0, QUEUE = 6.0, ASSIST = 7.6, TAPS = 8.8, SEC = 11.2, POLICE = 12.8, HANDS = 14.6, OK = 16.4, NEWS = 19.4;

const screenMsg = (t: number): [string, string] => {
  if (t < 1.4) return ['UNEXPECTED ITEM', '#E8463C'];
  if (t < PUT1) return ['SCAN ITEM', '#3BA0E8'];
  if (t < LIFT) return ['UNEXPECTED ITEM', '#E8463C'];
  if (t < ASSIST) return ['PLEASE WAIT', '#F2A04A'];
  if (t < TAPS + 1.6) return ['APPROVED', '#5DAA5A'];
  if (t < SEC) return ['UNEXPECTED ITEM', '#E8463C'];
  if (t < OK) return ['SECURITY NOTIFIED', '#E8463C'];
  return ['THANK YOU :)', '#5DAA5A'];
};

const teenAt = (t: number): {p: PP; banana: P | null} => {
  const x = 470;
  const p = stand('teen', x, 'tn', {look: {top: '#F2D54A', top2: '#D9BC3A', pants: '#4A5A7A'}});
  let fp: FaceP = {...F0, eo: 0.8, px: 26, py: 6, mc: 6};
  let rh: P = [x + 90, 1120], lh: P = [x - 10, 1160];
  let banana: P | null = [rh[0] + 20, rh[1] - 10];
  let tilt = 0;
  if (t < 1.4) {
    fp = {...F0, eo: 1.2, er: 1.2, px: 26, py: -4, ps: 0.5, brow: -20, mw: 36, mh: 0, mc: -10};
  } else if (t < LIFT) {
    rh = KP(t, [[1.4, [x + 90, 1120]], [1.8, [BAGX - 40, 1140]], [PUT1, [BAGX - 40, 1150]], [PUT1 + 0.6, [BAGX - 40, 1150]], [PUT1 + 0.9, [x + 90, 1100]], [PUT1 + 1.2, [BAGX - 40, 1150]]], EIO);
    banana = t > 1.9 && t < PUT1 + 0.6 ? [BAGX - 20, 1150] : [rh[0] + 20, rh[1] - 10];
    if (t > PUT1 + 1.2) banana = [BAGX - 20, 1150];
    fp = t > PUT1 ? {...F0, eo: 0.6, px: 26, py: -6, brow: 10, mw: 40, mc: -8} : {...F0, eo: 0.8, px: 26, py: 10, mc: 6};
  } else if (t < ASSIST) {
    // lifts the bag, looks under it, pats the machine
    rh = KP(t, [[LIFT, [BAGX - 40, 1150]], [LIFT + 0.5, [BAGX - 40, 980]], [LIFT + 1.2, [BAGX - 40, 980]], [LIFT + 1.6, [KX + 40, 960]], [LIFT + 1.8, [KX + 60, 950]], [LIFT + 2.0, [KX + 40, 960]]], EIO);
    banana = t < LIFT + 1.4 ? [rh[0] + 10, rh[1] + 40] : [BAGX - 20, 1150];
    fp = {...F0, eo: 0.55, px: t < LIFT + 1.2 ? 26 : 26, py: t < LIFT + 1.2 ? 26 : -4, brow: 10, mw: 44, mc: -10, sweat: t > QUEUE ? 1 : 0};
    tilt = t < LIFT + 1.2 ? 14 : 0;
    if (t > QUEUE) fp = {...fp, px: -26, py: 0, eo: 0.9, brow: -6};
  } else if (t < HANDS) {
    rh = [x + 50, 1150];
    banana = [BAGX - 20, 1150];
    fp = {...F0, eo: 1.0, px: t > TAPS ? 26 : 26, py: 0, brow: -6, mw: 36, mc: -6, sweat: 1};
    if (t > SEC) fp = {...F0, eo: 1.4, er: 1.35, ps: 0.3, px: 26, py: -6, brow: -40, mw: 30, mh: 40, mc: 0, sweat: 1};
    if (t > SEC + 0.5) banana = [x + 70, 1100];
    if (t > SEC + 0.5) rh = [x + 60, 1110];
  } else if (t < NEWS) {
    // hands up holding banana
    const u = sm(cl((t - HANDS) / 0.4));
    rh = [lerp(x + 60, x + 60, u), lerp(1110, 760, u)];
    lh = [lerp(x - 10, x - 40, u), lerp(1160, 770, u)];
    banana = [rh[0] + 10, rh[1] - 30];
    fp = {...F0, eo: 1.3, er: 1.3, ps: 0.3, px: -10, py: 0, brow: -36, mw: 34, mh: 30, mc: 0, sweat: 1};
    if (t > OK) fp = {...F0, eo: 0.42, px: 26, py: 10, ps: 0.6, brow: 12, mw: 46, mh: 0, mc: -4};
  }
  return {p: {...p, rh, lh, fp, tilt}, banana};
};

const QUEUERS = [
  {kind: 'mum' as const, look: {nocurl: true, hair: '#9A9AA5', top: '#6CB7A0', top2: '#559A86'}, s: 0.66},
  {kind: 'teen' as const, look: {top: '#4A4A55', top2: '#3A3A44', tie: '#3BA0E8', hair: '#1B1B1B'}, s: 0.8},
  {kind: 'mum' as const, look: {}, s: 0.68},
];

const queuer = (t: number, i: number): PP => {
  const x0 = -260 - i * 200, x1 = 310 - i * 170;
  const s0 = QUEUE + i * 0.5;
  let p = stand(QUEUERS[i].kind, x0, `q${i}`, {look: QUEUERS[i].look, s: QUEUERS[i].s});
  p = walkPose(p, t, s0, s0 + 1.2, x0, x1, 3.0);
  const tap = t > s0 + 1.3 && t < HANDS ? Math.max(0, Math.sin(t * 16 + i)) * 20 : 0;
  let fp: FaceP = {...F0, eo: 0.5, px: 26, py: 0, brow: 12, tilt: 16, mw: 48, mc: -12};
  if (t > POLICE) fp = {...F0, eo: 1.3, er: 1.3, ps: 0.35, px: 26, py: 0, brow: -30, mw: 30, mh: 40, mc: 0};
  if (t > OK) fp = {...F0, eo: 0.5, px: 26, py: 0, brow: 12, tilt: 16, mw: 48, mc: -12};
  const crossed = QUEUERS[i].kind === 'mum' ? [p.x + 40, 1240] : [p.x + 40, 1150];
  return {...p, rf: [p.rf[0], p.rf[1] - tap], lh: crossed as P, rh: [p.x - 20, (crossed as P)[1] + 10], fp};
};

const assistant = (t: number): PP => {
  let p = stand('teen', 1300, 'as', {flip: true, look: {top: '#E86A5C', top2: '#C9574B', cap: '#E86A5C', hair: '#B5651D'}});
  p = walkPose(p, t, ASSIST, TAPS, 1300, 820, 3.0);
  if (t > TAPS + 1.6) p = walkPose({...p, x: 820}, t, TAPS + 1.7, SEC, 820, 1350, 3.0);
  const tapping = t > TAPS && t < TAPS + 1.5;
  const rh: P = tapping ? [KX + 70 + (Math.floor(t * 30) % 2) * 20, 900 + (Math.floor(t * 30) % 3) * 12] : p.rh;
  const fp: FaceP = {...F0, eo: 0.35, px: 26, py: 0, brow: 10, mw: 40, mh: 0, mc: 0};
  return {...p, rh, fp};
};

const guard = (t: number): PP => {
  let p = stand('teen', 1400, 'gd', {flip: true, look: {top: '#2D3A5A', top2: '#232E48', pants: '#2D3A5A', shoe: '#1B1B1B', cap: '#2D3A5A', shades: true}, s: 0.9});
  p = walkPose(p, t, SEC + 0.3, SEC + 1.1, 1400, 760, 5.0);
  const point = t > SEC + 1.1;
  return {...p, rh: point ? [p.x - 160, 1000] : p.rh, lh: point ? [p.x - 150, 1010] : p.lh, fp: {...F0, eo: 0.5, px: 26, py: 0, brow: 16, tilt: 20, mw: 40, mc: -12}};
};

const Banana: React.FC<{p: P}> = ({p}) => (
  <g transform={`translate(${p[0]} ${p[1]}) rotate(-20)`}>
    <path d="M-50 0 Q0 50 50 -10 Q0 26 -50 0Z" fill="#F7D84A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M50 -10 l10 -8" stroke="#6B4A2A" strokeWidth={8} strokeLinecap="round" />
  </g>
);

export const Gag19: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const {p: teen, banana} = teenAt(t);
  const [msg, mcol] = screenMsg(t);
  const flashOn = mcol === '#E8463C' && Math.floor(t * 4) % 2 === 0;
  const police = t > POLICE && t < OK;
  const receipt = t > OK ? Math.min(900, (t - OK) * 420) : 0;

  if (t >= NEWS) {
    const z = K(t, [[NEWS, 1.0], [GAG19_DUR, 1.12]], (x) => x);
    const anchor = stand('mum', 380, 'an', {look: {nocurl: true, hair: '#E0B04A', top: '#3BA0E8', top2: '#2F86C4'}, s: 0.9});
    return (
      <Shell title="" dur={GAG19_DUR} bg="#2A2A35" cam={{cx: 540, cy: 980, z}} caption="I just wanted a banana.">
        <rect x={-800} y={-400} width={2700} height={2800} fill="#2A2A35" />
        <rect x={60} y={520} width={960} height={1000} rx={30} fill="#16161E" stroke={INK} strokeWidth={12} />
        <rect x={90} y={550} width={900} height={940} rx={14} fill="#3B5A8C" />
        <rect x={90} y={550} width={900} height={60} fill="#E8463C" />
        <text x={120} y={595} fontFamily="PH" fontSize={44} fill="#fff">● LIVE   BREAKING NEWS</text>
        <rect x={560} y={680} width={380} height={360} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
        <text x={750} y={720} textAnchor="middle" fontFamily="PH" fontSize={34} fill={INK}>SUSPECT</text>
        <circle cx={750} cy={860} r={90} fill="#F7E9C2" stroke={INK} strokeWidth={6} />
        <circle cx={720} cy={850} r={14} fill={INK} /><circle cx={780} cy={850} r={14} fill={INK} />
        <path d="M720 905 Q750 890 780 905" stroke={INK} strokeWidth={6} fill="none" />
        <Banana p={[750, 990]} />
        <g transform="translate(0 0)"><Person {...anchor} fp={{...F0, eo: 0.8, px: 26, py: 0, mw: 50, mh: Math.floor(t * 8) % 2 ? 24 : 0, mc: 6}} lh={[420, 1250]} rh={[460, 1250]} /></g>
        <rect x={90} y={1330} width={900} height={160} fill="#F2D54A" />
        <text x={540} y={1400} textAnchor="middle" fontFamily="PH" fontSize={58} fill={INK}>LOCAL TEEN BUYS BANANA</text>
        <text x={540 - ((t - NEWS) * 160) % 900 + 300} y={1465} textAnchor="middle" fontFamily="PH" fontSize={38} fill={INK}>police: "it was a very tense banana" • store: "machine working as intended" •</text>
      </Shell>
    );
  }

  let cam: {cx: number; cy: number; z: number; sh?: number} = {cx: 600, cy: 1060, z: 1.2};
  if (t < 1.4) cam = {cx: KX, cy: 900, z: K(t, [[0, 3.4], [1.4, 2.8]], EIO), sh: 3};
  else if (t > TAPS && t < TAPS + 1.5) cam = {cx: KX + 40, cy: 920, z: 2.4};
  else if (t > HANDS && t < OK) cam = {cx: 520, cy: 960, z: K(t, [[HANDS, 1.1], [OK, 1.5]], (x) => x), sh: 2};
  else if (t > OK) cam = {cx: K(t, [[OK, 600], [NEWS, 700]], EIO), cy: K(t, [[OK, 1060], [NEWS, 1300]], EIO), z: K(t, [[OK, 1.2], [NEWS, 1.0]], EIO)};
  const caption =
    t < 2.6 ? 'self checkout: day 1' :
    t > QUEUE + 0.4 && t < ASSIST ? 'the queue: growing' :
    t > TAPS && t < TAPS + 1.6 ? 'taps screen 47 times' :
    t > SEC + 0.3 && t < POLICE ? 'it escalated' :
    t > OK + 0.4 ? 'receipt for 1 banana:' : undefined;
  return (
    <Shell title="" dur={GAG19_DUR} bg="#EEF0E8" cam={cam} caption={caption}>
      <Room wall="#EEF0E8" floor="#C9C2B4" />
      {/* shelves */}
      {[0, 1].map((r) => <g key={r}>
        <rect x={-400} y={520 + r * 220} width={1900} height={22} fill="#B98A5A" stroke={INK} strokeWidth={5} />
        {Array.from({length: 16}).map((_, i) => <rect key={i} x={-380 + i * 120} y={520 + r * 220 - 70 - (i % 3) * 10} width={70} height={70 + (i % 3) * 10} rx={8} fill={['#E86A5C', '#6CB7E0', '#F2D54A', '#5DAA5A'][(i + r) % 4]} stroke={INK} strokeWidth={4} />)}
      </g>)}
      <rect x={-400} y={330} width={1900} height={80} fill="#5DAA5A" stroke={INK} strokeWidth={6} />
      <text x={540} y={390} textAnchor="middle" fontFamily="PH" fontSize={60} fill="#fff">SUPER SAVER MART</text>
      {/* kiosk */}
      <rect x={KX - 20} y={600} width={14} height={220} fill="#7d8590" stroke={INK} strokeWidth={4} />
      <rect x={KX - 50} y={560} width={70} height={50} rx={20} fill={flashOn || police ? '#E8463C' : '#8a1f1a'} stroke={INK} strokeWidth={5} />
      {(flashOn || police) && <polygon points={`${KX - 15},585 ${KX - 300},420 ${KX - 300},760`} fill="#E8463C" opacity={0.25} />}
      <rect x={KX - 140} y={820} width={280} height={200} rx={16} fill="#2D2D33" stroke={INK} strokeWidth={8} />
      <rect x={KX - 120} y={840} width={240} height={160} rx={8} fill={mcol} />
      <foreignObject x={KX - 120} y={840} width={240} height={160}>
        <div style={{fontFamily: 'PH', fontSize: 38, lineHeight: '40px', color: '#fff', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>{msg}</div>
      </foreignObject>
      <rect x={KX - 160} y={1040} width={420} height={G - 1040} fill="#C9CED6" stroke={INK} strokeWidth={8} />
      <rect x={KX - 120} y={1060} width={180} height={40} rx={6} fill="#E8463C" opacity={0.6} />
      <rect x={BAGX - 120} y={1160} width={240} height={30} rx={6} fill="#9AA0AA" stroke={INK} strokeWidth={6} />
      <path d={`M${BAGX - 80} 1160 L${BAGX - 90} 1060 L${BAGX + 70} 1060 L${BAGX + 60} 1160Z`} fill="#fff" stroke={INK} strokeWidth={5} opacity={t > LIFT && t < LIFT + 1.4 ? 0 : 1} />
      {/* receipt */}
      {[0, 1, 2].map((i) => t > QUEUE + i * 0.5 && <Person key={i} {...queuer(t, i)} />)}
      <Person {...teen} />
      {banana && <Banana p={banana} />}
      {t > ASSIST && t < SEC && <Person {...assistant(t)} />}
      {t > SEC + 0.3 && <Person {...guard(t)} />}
      {receipt > 0 && (() => {
        const drop = Math.min(receipt, G + 60 - 1080);
        const run = Math.max(0, receipt - drop);
        const d = `M${KX + 60} 1080 L${KX + 60 + 20} ${1080 + drop} ${run > 0 ? `Q${KX + 110} ${G + 90} ${KX + 80 - run * 0.4} ${G + 120 + run * 0.5}` : ''}`;
        return <g>
          <path d={d} stroke={INK} strokeWidth={70} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#fff" strokeWidth={58} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#9AA0AA" strokeWidth={4} strokeDasharray="20 40" fill="none" />
        </g>;
      })()}
      {/* police lights wash */}
      {police && <rect x={-800} y={-400} width={2700} height={2800} fill={Math.floor(t * 5) % 2 ? '#E8463C' : '#3B6CE8'} opacity={0.22} />}
      {police && t > POLICE + 0.4 && <polygon points={`${200 + Math.sin(t * 2) * 200},-300 ${80 + Math.sin(t * 2) * 200},1500 ${420 + Math.sin(t * 2) * 200},1500`} fill="#FFFBE0" opacity={0.3} />}
      <Pop t={t} at={PUT1} x={BAGX} y={980} text="BEEP BEEP" size={64} rot={-6} col="#FFB3AE" life={0.8} />
      <Pop t={t} at={SEC} x={KX} y={720} text="WEE-OO WEE-OO" size={70} rot={6} col="#FFB3AE" life={1.4} />
      <Pop t={t} at={POLICE + 0.3} x={560} y={500} text="*helicopter noises*" size={60} rot={-4} life={1.6} />
      <Pop t={t} at={HANDS + 0.4} x={300} y={760} text="*gasp*" size={64} rot={-6} life={0.8} />
      <Pop t={t} at={OK} x={KX} y={760} text="ding!" size={80} rot={6} col="#C8F2C0" life={0.8} />
    </Shell>
  );
};
