import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, cl, sm, lerp, F0, FaceP, PP, Person, stand, Shell, Pop, Room, FPS} from './kit';

// "Stomach growl in a silent exam" -> other stomachs answer -> teacher's stomach -> stomach choir. ~24s
export const GAG18_DUR = 24;
export const GAG18_FRAMES = GAG18_DUR * FPS;

const DESKS = [380, 640, 900];
const ME = 1; // middle desk
const COUGH = 3.0, G2 = 4.6, REPLY1 = 6.2, REPLY2 = 7.6, TSTAND = 9.4, TGROWL = 10.6, CONDUCT = 12.0, POSTER = 19.6;

type St = {look: PP['look']; kind: 'teen' | 'mum'; s: number};
const STU: St[] = [
  {kind: 'mum', s: 0.62, look: {nocurl: true, hair: '#1B1B1B', top: '#F2A04A', top2: '#D88A3A'}},
  {kind: 'teen', s: 0.72, look: {}},
  {kind: 'teen', s: 0.72, look: {top: '#6C93C6', top2: '#5A7FB0', hair: '#E0B04A', cap: '#E86A5C'}},
];

const growlAt = (t: number, i: number) => {
  // returns 0..1 intensity of stomach i growling
  const ev: [number, number, number][] = [
    [0.0, 1.3, ME], [G2, 1.0, ME], [REPLY1, 0.9, 0], [REPLY2, 0.9, 2], [REPLY2 + 0.5, 0.5, ME], [REPLY2 + 0.9, 0.5, 0],
  ];
  let v = 0;
  for (const [a, d, who] of ev) if (who === i && t >= a && t < a + d) v = Math.max(v, Math.sin(Math.PI * (t - a) / d));
  if (t > CONDUCT + 0.5 && t < POSTER) {
    const beat = (t - CONDUCT - 0.5) * 2.2;
    const k = Math.floor(beat);
    if (k % 3 === i || k % 4 === 3) v = Math.max(v, Math.sin(Math.PI * (beat - k)));
  }
  return v;
};

const student = (t: number, i: number): PP => {
  const x = DESKS[i] + 70;
  const st = STU[i];
  const base = stand(st.kind, x, `s${i}`, {flip: true, look: st.look, s: st.s});
  const sitHip = st.kind === 'teen' ? -270 : -250;
  const hy = st.kind === 'mum' ? 90 : 0;
  const p: PP = {...base, hip: sitHip, lf: [x - 110, G - 6], rf: [x - 70, G - 6], lh: [x - 90, 1150 + hy], rh: [x - 60, 1160 + hy]};
  const me = i === ME;
  let fp: FaceP = {...F0, eo: 0.7, px: 26, py: 26, brow: 2, mw: 34, mc: 0};
  const lookAtMe = !me && ((t > 0.6 && t < COUGH + 0.4) || (t > G2 + 0.2 && t < G2 + 1.2));
  if (lookAtMe) fp = {...F0, eo: 1.1, px: i < ME ? -26 : 26, py: 0, brow: -12, mw: 34, mh: 0, mc: -8};
  if (me) {
    if (t < COUGH) fp = {...F0, eo: 1.3, er: 1.25, ps: 0.35, px: 10, py: 10, brow: -30, mw: 40, mh: 0, mc: -14, sweat: 1};
    else if (t < COUGH + 0.5) fp = {...F0, eo: 0.1, brow: 10, mw: 40, mh: 40, mc: 0};
    else if (t < G2) fp = {...F0, eo: 0.6, px: 26, py: 26, brow: 4, mw: 30, mc: -4};
    else if (t < REPLY1) fp = {...F0, eo: 0.2, brow: 16, mw: 46, mh: 0, mc: -14, sweat: 1};
  }
  // replies: look at each other surprised
  if (t > REPLY1 && t < TSTAND) {
    const sur = growlAt(t, i) > 0.2;
    fp = sur ? {...F0, eo: 0.8, px: 26, py: 20, brow: 10, mw: 30, mc: -8, sweat: 1} : {...F0, eo: 1.15, px: i === 0 ? -26 : i === 2 ? 26 : (Math.floor(t * 1.5) % 2 ? 26 : -26), py: 0, brow: -16, mw: 30, mh: 0, mc: 0};
  }
  if (t > TSTAND && t < CONDUCT) fp = {...F0, eo: 1.3, er: 1.25, ps: 0.35, px: 26, py: -4, brow: -30, mw: 30, mh: 0, mc: -12, sweat: 1};
  if (t > CONDUCT + 0.3) {
    // choir: happy, swaying, mouths "ooo"
    const sway = Math.sin(t * 4.4 + i);
    fp = {...F0, eo: 0, happy: 1, mw: 30, mh: growlAt(t, i) > 0.3 ? 30 : 10, mc: 10};
    return {...p, fp, tilt: sway * 8, lh: [x - 90, 1100 + hy + sway * 10], rh: [x - 40, 1080 + hy - sway * 10]};
  }
  const g = growlAt(t, i);
  return {...p, fp, tilt: g * Math.sin(t * 40) * 3 + (me && t > COUGH && t < COUGH + 0.4 ? -10 : 0), rh: me && t > COUGH && t < COUGH + 0.5 ? [x - 30, 990] : p.rh};
};

const teacher = (t: number): PP => {
  const x = 160;
  const base = stand('teen', x, 'tc', {look: {top: '#4A4A55', top2: '#3A3A44', pants: '#3A3A44', shoe: '#2D2D33', hair: '#9A9AA5', tie: '#E86A5C'}, s: 0.86});
  const seated = t < TSTAND;
  let fp: FaceP = {...F0, eo: 0.5, px: 26, py: 26, brow: 8, mw: 44, mc: -4};
  if (seated) {
    const p: PP = {...base, hip: -230, lf: [x + 110, G - 6], rf: [x + 150, G - 6], lh: [x + 120, 1150], rh: [x + 150, 1150]};
    if (t > 0.6 && t < 1.8) fp = {...F0, eo: 0.6, px: 26, py: 0, brow: 14, tilt: 18, mw: 44, mc: -10};
    if (t > REPLY1 + 0.3) fp = {...F0, eo: 0.55, px: 26, py: 0, brow: 16, tilt: 22, mw: 50, mc: -14};
    return {...p, fp};
  }
  if (t < CONDUCT) {
    const growl = t > TGROWL && t < TGROWL + 1.0;
    fp = growl ? {...F0, eo: 1.3, er: 1.2, ps: 0.35, px: 10, py: 20, brow: -30, mw: 30, mh: 0, mc: -10, sweat: 1} : {...F0, eo: 0.55, px: 26, py: 0, brow: 18, tilt: 24, mw: 54, mc: -16};
    if (t > TGROWL + 1.0) fp = {...F0, eo: 0.6, px: 26, py: 0, brow: 0, mw: 40, mc: 4};
    return {...base, lh: [x - 20, 1150], rh: t > TGROWL + 1.0 ? [x + 30, 1060] : [x + 60, 1100], fp, tilt: t > TGROWL + 1.0 ? -6 : 0};
  }
  // conducting
  const b = t * 2.2 * Math.PI;
  fp = {...F0, eo: 0, happy: 1, mw: 40, mh: 16, mc: 12};
  return {...base, lh: [x + 40 + Math.sin(b) * 40, 960 + Math.cos(b) * 50], rh: [x + 120 + Math.cos(b) * 50, 900 + Math.sin(b * 2) * 40], fp, tilt: Math.sin(b) * 6, bob: Math.abs(Math.sin(b)) * -10};
};

const Desk: React.FC<{x: number}> = ({x}) => (
  <g>
    <rect x={x - 90} y={1170} width={190} height={26} rx={6} fill="#C9935A" stroke={INK} strokeWidth={7} />
    <rect x={x - 80} y={1196} width={16} height={G - 1196} fill="#9C7348" stroke={INK} strokeWidth={5} />
    <rect x={x + 70} y={1196} width={16} height={G - 1196} fill="#9C7348" stroke={INK} strokeWidth={5} />
    <rect x={x - 60} y={1152} width={90} height={20} fill="#fff" stroke={INK} strokeWidth={4} transform={`rotate(-3 ${x} 1160)`} />
  </g>
);

const Wave: React.FC<{x: number; y: number; v: number; t: number; big?: boolean}> = ({x, y, v, t, big}) => v <= 0.05 ? null : (
  <g opacity={v}>
    {[0, 1, 2].map((k) => {
      const r = (big ? 60 : 30) + k * (big ? 50 : 26) + ((t * 120) % 26);
      return <path key={k} d={`M${x + r * 0.5} ${y - r * 0.8} Q${x + r} ${y} ${x + r * 0.5} ${y + r * 0.8}`} stroke={INK} strokeWidth={big ? 9 : 6} fill="none" strokeLinecap="round" />;
    })}
  </g>
);

export const Gag18: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const studs = [0, 1, 2].map((i) => student(t, i));
  const tch = teacher(t);
  const me = studs[ME];
  let cam: {cx: number; cy: number; z: number; sh?: number} = {cx: 520, cy: 1080, z: 1.22};
  if (t < 1.2) cam = {cx: me.x - 20, cy: 1150, z: K(t, [[0, 4.0], [1.2, 3.0]], EIO), sh: 4};
  else if (t > G2 && t < G2 + 0.9) cam = {cx: me.x - 20, cy: 960, z: 2.6};
  else if (t > TGROWL && t < TGROWL + 1.0) cam = {cx: 220, cy: 1080, z: 2.4, sh: 6};
  else if (t > CONDUCT && t < POSTER) cam = {cx: 520, cy: 1060, z: K(t, [[CONDUCT, 1.18], [POSTER, 1.3]], (x) => x)};
  const caption =
    t < 2.6 ? 'the SILENT exam' :
    t > REPLY1 + 0.2 && t < REPLY2 ? 'wait.' :
    t > REPLY2 && t < TSTAND ? 'they answered.' :
    t > CONDUCT + 0.6 && t < 16.5 ? 'and that\'s how our class choir was born' :
    t > 16.5 && t < POSTER ? 'nobody finished the exam' :
    t > POSTER ? 'we sold out the school hall tho' : undefined;
  const choir = t > CONDUCT + 0.5 && t < POSTER;
  if (t >= POSTER) {
    const z = K(t, [[POSTER, 1.0], [GAG18_DUR, 1.2]], (x) => x);
    return (
      <Shell title="" dur={GAG18_DUR} bg="#3B3360" cam={{cx: 540, cy: 980, z}} caption={caption}>
        <rect x={-800} y={-400} width={2700} height={2800} fill="#3B3360" />
        {/* stage + curtains */}
        <rect x={-200} y={1250} width={1500} height={600} fill="#7A4A2A" stroke={INK} strokeWidth={8} />
        <path d="M-200 300 Q100 700 60 1250 L-200 1250Z" fill="#B8323A" stroke={INK} strokeWidth={8} />
        <path d="M1280 300 Q980 700 1020 1250 L1280 1250Z" fill="#B8323A" stroke={INK} strokeWidth={8} />
        <rect x={190} y={380} width={700} height={190} rx={20} fill="#F2D54A" stroke={INK} strokeWidth={8} />
        <text x={540} y={500} textAnchor="middle" fontFamily="PH" fontSize={96} fill={INK}>THE GROWLERS</text>
        <text x={540} y={640} textAnchor="middle" fontFamily="PH" fontSize={56} fill="#fff">SOLD OUT</text>
        {[0, 1, 2, 3].map((i) => {
          const x = 260 + i * 190;
          const q = i === 3 ? {...tch, x, lf: [x - 28, G - 6] as P, rf: [x + 30, G - 6] as P} : {...stand(STU[i].kind, x, `p${i}`, {look: STU[i].look, s: STU[i].s})};
          const sway = Math.sin(t * 4.4 + i);
          return <Person key={i} {...q} uid={`pp${i}`} fp={{...F0, eo: 0, happy: 1, mw: 30, mh: 24, mc: 10}} tilt={sway * 6} lh={[x - 50, 1080 + (i === 0 ? 110 : 0) + sway * 20]} rh={[x + 60, 1080 + (i === 0 ? 110 : 0) - sway * 20]} />;
        })}
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={-100 + i * 240} cy={1820} r={90} fill="#1B1730" stroke={INK} strokeWidth={6} />)}
        {Array.from({length: 6}).map((_, i) => { const ph = (t * 0.6 + i / 6) % 1; return <text key={i} x={120 + i * 160 + Math.sin(ph * 6) * 20} y={1150 - ph * 600} fontFamily="PH" fontSize={70} fill="#F2D54A" opacity={1 - ph}>♪</text>; })}
      </Shell>
    );
  }
  return (
    <Shell title="" dur={GAG18_DUR} bg="#DCE8D0" cam={cam} caption={caption}>
      <Room wall="#DCE8D0" floor="#B98A5A" />
      {/* blackboard */}
      <rect x={-120} y={540} width={560} height={330} rx={10} fill="#2F4A3A" stroke={INK} strokeWidth={10} />
      <text x={160} y={650} textAnchor="middle" fontFamily="PH" fontSize={64} fill="#fff">FINAL EXAM</text>
      <text x={160} y={760} textAnchor="middle" fontFamily="PH" fontSize={52} fill="#fff" opacity={0.8}>SILENCE!!</text>
      <rect x={700} y={520} width={140} height={140} rx={70} fill="#fff" stroke={INK} strokeWidth={7} />
      <line x1={770} y1={590} x2={770} y2={545} stroke={INK} strokeWidth={6} /><line x1={770} y1={590} x2={805} y2={600} stroke={INK} strokeWidth={6} />
      {/* teacher desk */}
      <rect x={100} y={1160} width={260} height={G - 1160} fill="#9C7348" stroke={INK} strokeWidth={8} />
      <Person {...tch} />
      {tch.hip !== -230 && <rect x={100} y={1160} width={260} height={G - 1160} fill="#9C7348" stroke={INK} strokeWidth={8} opacity={0} />}
      <rect x={100} y={1160} width={260} height={G - 1160} fill="#9C7348" stroke={INK} strokeWidth={8} />
      {t > CONDUCT && <line x1={tch.rh[0]} y1={tch.rh[1]} x2={tch.rh[0] + 90} y2={tch.rh[1] - 60} stroke={INK} strokeWidth={8} strokeLinecap="round" />}
      {studs.map((s, i) => <Person key={i} {...s} />)}
      {DESKS.map((x) => <Desk key={x} x={x} />)}
      {studs.map((s, i) => <Wave key={i} x={s.x - 10} y={1240} v={growlAt(t, i)} t={t} big={t < 1.3 && i === ME} />)}
      <Wave x={tch.x + 40} y={1200} v={t > TGROWL && t < TGROWL + 1.0 ? Math.sin(Math.PI * (t - TGROWL)) : 0} t={t} big />
      {choir && Array.from({length: 8}).map((_, i) => { const ph = (t * 0.7 + i / 8) % 1; return <text key={i} x={300 + (i % 4) * 200 + Math.sin(ph * 7) * 30} y={1100 - ph * 500} fontFamily="PH" fontSize={64} fill={INK} opacity={1 - ph}>{i % 2 ? '♪' : '♫'}</text>; })}
      <Pop t={t} at={0.05} x={me.x + 140} y={1080} text="GRRRWWLLL" size={66} rot={-8} col="#F2D54A" life={1.4} />
      <Pop t={t} at={COUGH} x={me.x - 40} y={820} text="*COUGH*" size={70} rot={8} life={0.7} />
      <Pop t={t} at={G2} x={me.x + 120} y={1110} text="grrrooOOOWL" size={60} rot={6} col="#F2D54A" life={0.9} />
      <Pop t={t} at={REPLY1} x={studs[0].x + 60} y={1100} text="grrl?" size={56} rot={-8} col="#F2D54A" life={0.8} />
      <Pop t={t} at={REPLY2} x={studs[2].x + 70} y={1100} text="grrr grr!" size={56} rot={8} col="#F2D54A" life={0.8} />
      <Pop t={t} at={TGROWL} x={330} y={980} text="GRRROOOOOOOOWL" size={78} rot={-4} col="#E86A5C" life={1.0} />
    </Shell>
  );
};
