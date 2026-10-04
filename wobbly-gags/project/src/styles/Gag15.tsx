import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, cl, sm, lerp, lerpP, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, FPS} from './kit';

// "Short charger cable" - stands up, phone snaps back; ends folded on the floor... then mum unplugs it for the vacuum.
export const GAG15_DUR = 13;
export const GAG15_FRAMES = GAG15_DUR * FPS;

const SOCK: P = [120, 1330];
const CABLE = 330;
const UP = 1.8, WALK = 2.4, SNAP = 3.15, CURL = 5.0, MUM = 7.4, UNPLUG = 9.0, VAC = 9.6;

const teenAt = (t: number): {p: PP; phone: P; phoneInHand: boolean} => {
  const x0 = 300;
  let p = stand('teen', x0, 'tn');
  const sitting = (x: number): PP => ({...p, x, hip: -55, sy: 0.96, lf: [x + 125, G - 8], rf: [x + 165, G - 8]});
  if (t < UP) {
    const ph: P = [x0 + 70, 1190];
    return {p: {...sitting(x0), lh: [x0 + 50, 1220], rh: ph, fp: {...F0, eo: 0.8, px: 26, py: 14, mc: 14, mw: 36}}, phone: ph, phoneInHand: true};
  }
  if (t < WALK) {
    const u = sm(cl((t - UP) / 0.5));
    const sp = sitting(x0);
    const st = stand('teen', x0, 'tn');
    const ph: P = lerpP([x0 + 70, 1190], [x0 + 80, 1060], u);
    return {p: {...st, hip: lerp(sp.hip, st.hip, u), sy: 1, lf: lerpP(sp.lf, st.lf, u), rf: lerpP(sp.rf, st.rf, u), lh: [x0 - 10, 1160], rh: ph, fp: {...F0, eo: 0.8, px: 26, py: 14, mc: 14}}, phone: ph, phoneInHand: true};
  }
  if (t < CURL) {
    p = walkPose({...p, rh: [x0 + 80, 1060]}, t, WALK, CURL - 0.6, x0, 560, 3.0);
    if (t > SNAP) p = {...p, x: lerp(p.x, 540, 0.5)};
    const x = t < SNAP ? lerp(x0, 560, cl((t - WALK) / (SNAP - WALK))) : 560;
    p = {...p, x, lf: [x - 28, G - 6], rf: [x + 30, G - 6]};
    if (t < SNAP) {
      p = walkPose(stand('teen', x0, 'tn', {rh: [x0 + 80, 1060]}), t, WALK, SNAP, x0, 560, 3.0);
      const ph: P = [p.x + 80, 1060];
      return {p: {...p, rh: ph, fp: {...F0, eo: 0.8, px: 26, py: 14, mc: 14}}, phone: ph, phoneInHand: true};
    }
    // phone yanked away -> flies back to wall
    const u = cl((t - SNAP) / 0.35);
    const ph: P = [lerp(640, SOCK[0] + 40, sm(u)), lerp(1060, G - 20, u) - Math.sin(Math.PI * u) * 160];
    const look = t > SNAP + 0.5;
    const fp: FaceP = look ? {...F0, eo: 1.1, px: -26, py: 20, brow: -14, mw: 40, mh: 0, mc: -12} : {...F0, eo: 1.3, er: 1.2, ps: 0.4, brow: -30, mw: 30, mh: 40, mc: 0};
    return {p: {...p, x: 560, lf: [532, G - 6], rf: [590, G - 6], lh: [520, 1160], rh: [640, 1060], fp, tilt: look ? -10 : 0}, phone: ph, phoneInHand: false};
  }
  // curled up on the floor next to the socket, contorted
  const x = 250;
  const u = sm(cl((t - CURL) / 0.6));
  const sx = lerp(560, x, u);
  const ph: P = [SOCK[0] + 90, 1330];
  let fp: FaceP = {...F0, eo: 0.8, px: -20, py: 18, brow: 0, mw: 30, mc: 10};
  if (t > UNPLUG) fp = {...F0, eo: 1.3, er: 1.3, ps: 0.4, px: -20, py: 10, brow: -34, mw: 34, mh: 0, mc: -14};
  if (t > VAC + 0.6) fp = {...F0, eo: 0.42, px: 20, py: 0, ps: 0.6, brow: 10, mw: 46, mh: 0, mc: -4};
  return {p: {...p, x: sx, hip: lerp(-335, -150, u), sy: 1, lf: [sx + 90, G - 6], rf: [sx + 150, G - 10], lh: [sx + 40, 1340], rh: t > UNPLUG ? [ph[0] + 20, 1300] : ph, fp, tilt: lerp(0, -28, u), bob: 0}, phone: [ph[0] + 10, ph[1] - 30], phoneInHand: true};
};

const mumAt = (t: number): PP => {
  let p = stand('mum', 1250, 'mm', {flip: true});
  p = walkPose(p, t, MUM, UNPLUG - 0.6, 1250, 480, 3.0);
  let lh = p.lh, rh = p.rh;
  const fp: FaceP = {...F0, eo: 0.6, px: 14, py: 6, brow: 4, tilt: 4, mw: 44, mh: 0, mc: 8};
  const hum = t > VAC ? Math.sin(t * 9) * 3 : 0;
  return {...p, lh: [lh[0] + hum, lh[1]], rh: [rh[0] + hum, rh[1]], fp, tilt: hum};
};

export const Gag15: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const {p: teen, phone, phoneInHand} = teenAt(t);
  const mum = mumAt(t);
  const plugged = t < UNPLUG;
  const plugEnd: P = plugged ? SOCK : [SOCK[0] + 60, G - 10];
  const d = Math.hypot(phone[0] - plugEnd[0], phone[1] - plugEnd[1]);
  const sag = Math.max(0, CABLE - d) * 0.6 + 10;
  const mid: P = [(phone[0] + plugEnd[0]) / 2, Math.max(phone[1], plugEnd[1]) + sag];
  const taut = t > SNAP - 0.15 && t < SNAP + 0.05;
  const vacX = t > VAC ? mum.lh[0] - 40 + Math.sin(t * 6) * 60 : mum.lh[0] - 40;
  const camFace = t > CURL + 0.8 && t < MUM - 0.2;
  const sockCU = t > UNPLUG - 0.4 && t < UNPLUG + 0.6;
  const cam = sockCU ? {cx: SOCK[0] + 60, cy: SOCK[1], z: 3.2} : camFace ? {cx: 240, cy: 1180, z: 2.2} : {cx: 560, cy: 1050, z: 1.05, sh: taut ? 6 : 0};
  const battery = t < UNPLUG ? '' : '1%';
  return (
    <Shell title="Charger cable too short" dur={GAG15_DUR} bg="#F2D8C9" cam={cam}>
      <Room wall="#F2D8C9" floor="#8C6E5A" />
      {/* sofa (the goal) */}
      <rect x={700} y={1180} width={500} height={G - 1180} rx={30} fill="#5DAA5A" stroke={INK} strokeWidth={8} />
      <rect x={720} y={1040} width={460} height={160} rx={30} fill="#4E9A4B" stroke={INK} strokeWidth={8} />
      <rect x={760} y={1150} width={160} height={60} rx={20} fill="#F2D54A" stroke={INK} strokeWidth={6} />
      {/* frame */}
      <rect x={380} y={600} width={220} height={170} rx={8} fill="#BFE6FA" stroke={INK} strokeWidth={7} />
      <path d="M400 750 L470 660 L520 720 L560 680 L590 750Z" fill="#5DAA5A" stroke={INK} strokeWidth={5} />
      {/* socket */}
      <rect x={SOCK[0] - 34} y={SOCK[1] - 44} width={68} height={88} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
      <circle cx={SOCK[0] - 10} cy={SOCK[1] - 6} r={5} fill={INK} /><circle cx={SOCK[0] + 10} cy={SOCK[1] - 6} r={5} fill={INK} />
      {/* cable */}
      <path d={`M${plugEnd[0]} ${plugEnd[1]} Q${mid[0]} ${taut ? (phone[1] + plugEnd[1]) / 2 : mid[1]} ${phone[0]} ${phone[1]}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={`M${plugEnd[0]} ${plugEnd[1]} Q${mid[0]} ${taut ? (phone[1] + plugEnd[1]) / 2 : mid[1]} ${phone[0]} ${phone[1]}`} stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
      <rect x={plugEnd[0] - 14} y={plugEnd[1] - 14} width={28} height={28} rx={5} fill="#fff" stroke={INK} strokeWidth={5} />
      <Person {...teen} />
      {/* phone */}
      <g transform={`translate(${phone[0]} ${phone[1]}) rotate(${phoneInHand ? -8 : t * 700})`}>
        <rect x={-24} y={-42} width={48} height={84} rx={9} fill="#2D2D33" stroke={INK} strokeWidth={5} />
        <rect x={-18} y={-34} width={36} height={64} rx={5} fill={battery ? '#E86A5C' : '#7CC6F0'} />
        {battery && <text x={0} y={8} textAnchor="middle" fontFamily="PH" fontSize={26} fill="#fff">1%</text>}
      </g>
      {/* vacuum + mum */}
      {t > MUM && <g>
        <line x1={mum.lh[0]} y1={mum.lh[1]} x2={vacX} y2={G - 20} stroke={INK} strokeWidth={12} strokeLinecap="round" />
        <rect x={vacX - 50} y={G - 40} width={100} height={36} rx={12} fill="#E86A5C" stroke={INK} strokeWidth={6} />
        {t > VAC && <path d={`M${vacX + 60} ${G - 30} Q${(vacX + SOCK[0]) / 2 + 100} ${G + 30} ${SOCK[0]} ${SOCK[1]}`} stroke={INK} strokeWidth={8} fill="none" />}
        <Person {...mum} />
      </g>}
      {sockCU && (() => {
        const hx = K(t, [[UNPLUG - 0.4, 360], [UNPLUG - 0.1, SOCK[0] + 30], [UNPLUG + 0.3, SOCK[0] + 30], [UNPLUG + 0.6, 360]], EIO);
        return <g>
          <line x1={hx} y1={SOCK[1] + 10} x2={hx + 300} y2={SOCK[1] - 40} stroke={INK} strokeWidth={34} strokeLinecap="round" />
          <line x1={hx} y1={SOCK[1] + 10} x2={hx + 300} y2={SOCK[1] - 40} stroke="#C57FCB" strokeWidth={22} strokeLinecap="round" />
          <circle cx={hx} cy={SOCK[1] + 10} r={18} fill="#F7E9C2" stroke={INK} strokeWidth={5} />
        </g>;
      })()}
      <Pop t={t} at={SNAP} x={360} y={1150} text="BOING" size={90} rot={-10} col="#FFF3A8" />
      <Pop t={t} at={SNAP + 0.38} x={150} y={1220} text="clonk" size={60} rot={8} life={0.6} />
      <Pop t={t} at={UNPLUG} x={200} y={1220} text="pop" size={60} rot={-6} life={0.6} />
      {t > VAC && <Pop t={t} at={VAC} x={mum.x} y={900} text="VRRRRR" size={86} rot={-4} life={2.6} />}
    </Shell>
  );
};
