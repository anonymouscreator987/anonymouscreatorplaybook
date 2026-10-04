import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, cl, sm, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, FPS} from './kit';

// "Microwave at 0:01" - stops it before the beep at night... opening the door beeps anyway.
export const GAG13_DUR = 12;
export const GAG13_FRAMES = GAG13_DUR * FPS;

const MX = 640, MY = 960, MW = 300, MH = 180; // microwave
const BTN: P = [MX + MW - 40, MY + 120];
const START = 1.2, STOP = 4.85, OPEN = 6.4, LIGHT = 6.75, CLOSE = 10.0;

const secsLeft = (t: number) => {
  if (t < START) return 6;
  if (t >= STOP) return 1;
  return Math.max(1, 6 - Math.floor((t - START) / 0.75));
};

const teenAt = (t: number): PP => {
  const x = 470;
  const p = stand('teen', x, 'tn');
  let fp: FaceP = {...F0, eo: 0.9, px: 26, py: 8, brow: -6, mw: 34, mc: 0};
  let lh: P = [x - 10, 1150], rh: P = [x + 60, 1100];
  let tilt = 4, lean = 0;
  if (t < STOP) {
    // poised finger, leaning in, sweat grows
    const tense = cl((t - START) / 3.5);
    lean = tense * 20;
    rh = [x + 130 + tense * 60, 1090 - tense * 20];
    fp = {...fp, eo: 1 + tense * 0.3, er: 1 + tense * 0.25, ps: 1 - tense * 0.5, brow: -6 - tense * 20, sweat: tense > 0.5 ? 1 : 0, mc: -4};
    if (t > STOP - 0.35) rh = KP(t, [[STOP - 0.35, rh], [STOP, BTN]], EIO);
    tilt = 4 + tense * 6;
  } else if (t < OPEN) {
    // smug
    rh = KP(t, [[STOP, BTN], [STOP + 0.4, [x + 60, 1100]]], EIO);
    fp = {...F0, eo: 0.45, px: 4, py: 0, brow: 6, mw: 52, mc: 18};
    tilt = -6 + Math.sin(t * 9) * 2;
    lh = [x - 40, 1100];
  } else if (t < CLOSE) {
    rh = KP(t, [[OPEN - 0.3, [x + 60, 1100]], [OPEN, [MX + 30, MY + 90]], [OPEN + 0.3, [MX - 30, MY + 90]]], EIO);
    const busted = t > LIGHT;
    fp = busted ? {...F0, eo: 1.4, er: 1.35, ps: 0.3, px: -24, py: 0, brow: -38, mw: 32, mh: 0, mc: -12, sweat: 1} : {...F0, eo: 0.5, px: 26, mc: 12};
    if (t > 8.2) fp = {...fp, px: 26, py: 6};
    tilt = busted ? -4 : 0;
  } else {
    // slowly closes it... BEEP again
    rh = KP(t, [[CLOSE, [MX - 30, MY + 90]], [CLOSE + 0.6, [MX + 30, MY + 90]], [CLOSE + 1.0, [x + 50, 1140]]], EIO);
    fp = {...F0, eo: 0.1, brow: 14, mw: 40, mh: 0, mc: -10, sweat: 1, tilt: -10};
  }
  return {...p, x: x + lean, lh, rh, fp, tilt};
};

const mumAt = (t: number): PP => {
  const p = stand('mum', 150, 'mm');
  const fp: FaceP = {...F0, eo: 0.5, px: 18, py: 2, brow: 8, tilt: 16, mw: 56, mh: 0, mc: -12};
  return {...p, fp: t > 9 ? {...fp, eo: 0.4} : fp, lh: [200, 1170], rh: [110, 1180]};
};

export const Gag13: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const lit = t > LIGHT;
  const teen = teenAt(t);
  const mum = mumAt(t);
  const doorA = K(t, [[OPEN - 0.05, 0], [OPEN + 0.3, 1], [CLOSE + 0.1, 1], [CLOSE + 0.6, 0]], EIO); // 0 closed, 1 open
  const s = secsLeft(t);
  const blinkDisp = t > STOP && Math.floor(t * 3) % 2 === 0;
  const dispCU = t > 3.2 && t < 4.3;
  const faceCU = t > 4.3 && t < STOP;
  const cam = dispCU
    ? {cx: MX + MW - 50, cy: MY + 50, z: 3.4}
    : faceCU
      ? {cx: 500, cy: 900, z: 2.3}
      : t > 7.6 && t < 8.6
        ? {cx: 160, cy: 980, z: 2.4}
        : {cx: 540, cy: 1010, z: 1.05, sh: t > LIGHT && t < LIGHT + 0.2 ? 6 : 0};
  const wall = lit ? '#F2E6C8' : '#17264A';
  const floor = lit ? '#C9A57A' : '#0F1A36';
  return (
    <Shell title="Microwave at 0:01" dur={GAG13_DUR} bg={wall} cam={cam}>
      <Room wall={wall} floor={floor} />
      {/* window */}
      <rect x={60} y={520} width={220} height={260} rx={10} fill={lit ? '#2A4585' : '#2A4585'} stroke={INK} strokeWidth={8} />
      <circle cx={220} cy={580} r={24} fill="#E8F0FF" stroke={INK} strokeWidth={4} />
      {/* doorway + mum */}
      <rect x={20} y={760} width={260} height={G - 760} fill={lit ? '#D9C9A3' : '#0B1430'} stroke={INK} strokeWidth={8} />
      {lit && <Person {...mum} />}
      {/* light switch */}
      <rect x={300} y={1000} width={40} height={60} rx={6} fill="#fff" stroke={INK} strokeWidth={5} />
      <rect x={312} y={lit ? 1008 : 1030} width={16} height={22} rx={4} fill="#ccc" stroke={INK} strokeWidth={3} />
      {/* counter */}
      <rect x={560} y={MY + MH} width={700} height={G - MY - MH} fill={lit ? '#E9E1D3' : '#22366B'} stroke={INK} strokeWidth={8} />
      <rect x={550} y={MY + MH - 10} width={720} height={34} rx={8} fill={lit ? '#B98A5A' : '#31497F'} stroke={INK} strokeWidth={7} />
      {/* microwave */}
      <rect x={MX} y={MY} width={MW} height={MH} rx={16} fill={lit ? '#D9DEE6' : '#2C3C66'} stroke={INK} strokeWidth={8} />
      <rect x={MX + 18} y={MY + 18} width={190} height={MH - 36} rx={10} fill={doorA > 0.5 ? '#3a2f22' : t < STOP && t > START ? '#F2C66B' : '#18233F'} stroke={INK} strokeWidth={5} />
      {t > START && t < STOP && <ellipse cx={MX + 113} cy={MY + 120} rx={50} ry={14} fill="#fff" opacity={0.5} transform={`rotate(${(t * 90) % 360 * 0} 0 0)`} />}
      <rect x={MX + MW - 78} y={MY + 22} width={64} height={38} rx={6} fill="#0C1A14" stroke={INK} strokeWidth={4} />
      {!blinkDisp && <text x={MX + MW - 46} y={MY + 52} textAnchor="middle" fontFamily="PH" fontSize={30} fill="#7CFF9A">{`0:0${s}`}</text>}
      <circle cx={BTN[0]} cy={BTN[1]} r={14} fill="#E86A5C" stroke={INK} strokeWidth={4} />
      {/* door swing */}
      {doorA > 0 && (
        <polygon points={`${MX},${MY} ${MX - 230 * doorA},${MY + 20 * doorA} ${MX - 230 * doorA},${MY + MH - 20 * doorA} ${MX},${MY + MH}`} fill={lit ? '#C5CCD8' : '#3E5C80'} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      )}
      <Person {...teen} />
      <Pop t={t} at={STOP} x={MX + MW - 40} y={MY - 40} text="click" size={60} rot={-6} life={0.6} />
      <Pop t={t} at={OPEN} x={MX + 120} y={MY - 60} text="BEEP!" size={120} rot={-8} col="#FFF3A8" life={0.6} />
      <Pop t={t} at={CLOSE + 0.6} x={MX + 120} y={MY - 60} text="BEEP!" size={120} rot={8} col="#FFF3A8" life={0.8} />
      <Pop t={t} at={LIGHT} x={320} y={950} text="click" size={60} rot={6} life={0.6} />
    </Shell>
  );
};
