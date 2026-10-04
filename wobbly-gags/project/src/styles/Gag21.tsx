import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, cl, sm, lerp, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, FPS} from './kit';

// "Airport hand dryer" (~20s): face ripples -> lifted like a flag -> through the ceiling -> past a plane -> space.
export const GAG21_DUR = 20;
export const GAG21_FRAMES = GAG21_DUR * FPS;

const DX = 820, DY = 1060; // dryer
const PULL = 3.4, TURBO = 5.2, CEIL = 7.4, SKY = 8.0, SPACE = 11.0, BACKR = 15.4;
const LOOK = {top: '#3BA0E8', top2: '#2F86C4', pants: '#4A4A55', shoe: '#F2A04A'};

const flap = (t: number, a: number) => Math.sin(t * 46) * a;

const Dryer: React.FC<{t: number; on: boolean; turbo: boolean}> = ({t, on, turbo}) => (
  <g>
    <rect x={DX - 90} y={DY - 120} width={180} height={150} rx={30} fill="#C9CED6" stroke={INK} strokeWidth={8} />
    <rect x={DX - 50} y={DY + 30} width={100} height={30} rx={8} fill="#7d8590" stroke={INK} strokeWidth={6} />
    <text x={DX} y={DY - 50} textAnchor="middle" fontFamily="PH" fontSize={34} fill={INK}>TURBO 9000</text>
    <circle cx={DX + 60} cy={DY - 90} r={12} fill={turbo ? (Math.floor(t * 8) % 2 ? '#E8463C' : '#F2D54A') : on ? '#5DAA5A' : '#555'} stroke={INK} strokeWidth={4} />
    {on && [0, 1, 2, 3, 4].map((i) => {
      const y = DY + 70 + ((t * (turbo ? 2400 : 1200) + i * 60) % 300);
      return <line key={i} x1={DX - 40 + i * 20} y1={y} x2={DX - 40 + i * 20} y2={y + 60} stroke="#BFE6FA" strokeWidth={8} strokeLinecap="round" />;
    })}
  </g>
);

const teenWorld = (t: number): {p: PP; rot: number; piv: P} => {
  let p = stand('teen', DX - 150, 'tn', {look: LOOK});
  const x = p.x;
  const hands: P = [DX - 10, DY + 110];
  if (t < PULL) {
    const rip = flap(t, 3);
    const fp: FaceP = {...F0, eo: 0.15 + Math.abs(rip) * 0.05, brow: 14, mw: 60, mh: 40 + rip * 6, mc: 0, tilt: rip * 3};
    return {p: {...p, lh: hands, rh: [hands[0] + 20, hands[1] + 6], fp, tilt: -6 + rip, sy: 1 + rip * 0.01}, rot: 0, piv: hands};
  }
  if (t < TURBO) {
    // tries to pull away, feet slide towards dryer
    const u = cl((t - PULL) / (TURBO - PULL));
    const fx = lerp(x, x + 60, u);
    const fp: FaceP = {...F0, eo: 0.1, brow: 16, mw: 50, mh: 30 + flap(t, 6), mc: -10, sweat: 1, tilt: -10};
    return {p: {...p, x: fx - 40, lf: [fx - 130, G - 6], rf: [fx - 80, G - 6], lh: hands, rh: [hands[0] + 20, hands[1] + 6], fp, tilt: -24 + flap(t, 3), hip: -320}, rot: 0, piv: hands};
  }
  // lifted horizontally like a flag, then up
  const lift = sm(cl((t - TURBO) / 0.8));
  const fp: FaceP = {...F0, eo: 1.4, er: 1.3, ps: 0.3, brow: -38, mw: 50, mh: 60 + flap(t, 10), mc: 0, sweat: 1};
  const body: PP = {...p, x: x, lh: hands, rh: [hands[0] + 20, hands[1] + 6], fp, lf: [x - 40 + flap(t, 30), G - 6], rf: [x + 10 - flap(t, 30), G - 30], tilt: flap(t, 5)};
  return {p: body, rot: lerp(0, -95, lift) + flap(t, 6) * lift, piv: hands};
};

export const Gag21: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  let cam: {cx: number; cy: number; z: number; sh?: number} = {cx: 620, cy: 1040, z: 1.15, sh: t > TURBO ? 4 : 1};
  const caption =
    t < 2.2 ? 'airport hand dryer: "gentle"' :
    t > PULL && t < TURBO ? 'it would not let go' :
    t > TURBO + 0.3 && t < CEIL ? 'TURBO MODE' :
    t > SKY + 0.6 && t < SPACE ? 'passing gate B12' :
    t > SPACE + 0.8 && t < BACKR ? 'should have used the paper towels' :
    t > BACKR + 1.2 ? 'lesson learned (by everyone else)' : undefined;

  if (t >= SKY && t < SPACE) {
    // rocketing up past a plane
    const u = (t - SKY) / (SPACE - SKY);
    const ty = lerp(1900, -300, u);
    const planeX = lerp(1300, -400, u * 0.9);
    const fp: FaceP = {...F0, eo: 1.4, er: 1.3, ps: 0.3, brow: -38, mw: 50, mh: 70 + flap(t, 10), mc: 0, sweat: 1};
    const sx = 540;
    const p = stand('teen', sx, 'tn', {look: LOOK});
    return (
      <Shell title="" dur={GAG21_DUR} bg="#8FCBF0" cam={{cx: 540, cy: 960, z: 1, sh: 3}} caption={caption}>
        <rect x={-800} y={-400} width={2700} height={2800} fill="#8FCBF0" />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={(i * 300 + 100) % 1200} cy={((i * 520 + t * 1400) % 2400) - 300} rx={180} ry={60} fill="#fff" stroke={INK} strokeWidth={6} />)}
        {/* plane */}
        <g transform={`translate(${planeX} 760)`}>
          <path d="M0 0 Q40 -70 160 -80 L760 -80 Q860 -70 880 0 Q860 60 760 70 L160 70 Q40 60 0 0Z" fill="#fff" stroke={INK} strokeWidth={9} />
          <path d="M700 -80 L820 -260 L880 -260 L820 -80Z" fill="#E86A5C" stroke={INK} strokeWidth={7} />
          <path d="M380 30 L240 220 L360 220 L520 30Z" fill="#D6DCE4" stroke={INK} strokeWidth={7} />
          {[0, 1, 2, 3, 4, 5].map((i) => <g key={i}>
            <rect x={200 + i * 90} y={-50} width={56} height={56} rx={26} fill="#BFE6FA" stroke={INK} strokeWidth={5} />
            <circle cx={228 + i * 90} cy={-18} r={18} fill="#F7E9C2" stroke={INK} strokeWidth={3} />
            <circle cx={222 + i * 90} cy={-22} r={6} fill="#fff" stroke={INK} strokeWidth={2} /><circle cx={236 + i * 90} cy={-22} r={6} fill="#fff" stroke={INK} strokeWidth={2} />
            <ellipse cx={229 + i * 90} cy={-10} rx={4} ry={6} fill={INK} />
          </g>)}
        </g>
        <g transform={`translate(0 ${ty - G})`}>
          <g transform={`rotate(-90 ${sx + 120} ${G - 600})`}>
            <Person {...p} lh={[sx + 120, G - 600]} rh={[sx + 140, G - 590]} fp={fp} lf={[sx - 40 + flap(t, 30), G - 6]} rf={[sx + 10 - flap(t, 30), G - 30]} tilt={flap(t, 4)} />
          </g>
          {[0, 1, 2].map((i) => <line key={i} x1={sx - 60 + i * 60} y1={G + 80} x2={sx - 60 + i * 60} y2={G + 360} stroke="#fff" strokeWidth={10} strokeLinecap="round" />)}
        </g>
        <Pop t={t} at={SKY + 1.2} x={400} y={560} text="AAAAAAAAA" size={90} rot={-8} col="#FFF3A8" life={1.6} />
      </Shell>
    );
  }
  if (t >= SPACE && t < BACKR) {
    const fl = Math.sin(t * 1.4) * 20;
    const p = stand('teen', 420, 'tn', {look: LOOK});
    const astro = stand('teen', 760, 'as', {flip: true, look: {top: '#F4F4F4', top2: '#DADADA', pants: '#F4F4F4', shoe: '#9AA0AA', hair: '#3B2A24'}});
    const ax = K(t, [[SPACE, 1300], [SPACE + 1.2, 760]], EIO);
    const towel = t > SPACE + 2.0;
    return (
      <Shell title="" dur={GAG21_DUR} bg="#0B0F24" cam={{cx: 540, cy: 960, z: 1}} caption={caption}>
        <rect x={-800} y={-400} width={2700} height={2800} fill="#0B0F24" />
        {Array.from({length: 60}).map((_, i) => <circle key={i} cx={(i * 197) % 1080} cy={(i * 331) % 1920} r={(i % 3) + 2} fill="#fff" opacity={0.4 + (i % 4) * 0.15} />)}
        <circle cx={540} cy={2350} r={900} fill="#3B7AD8" stroke={INK} strokeWidth={10} />
        <path d="M100 1600 Q300 1500 420 1620 Q520 1700 700 1580 Q860 1500 1000 1640" fill="#5DAA5A" stroke={INK} strokeWidth={6} />
        <g transform={`rotate(${-20 + fl * 0.4} 420 ${G - 300}) translate(0 ${fl - 200})`}>
          <Person {...p} lh={towel ? [500, 1100] : [470, 1040]} rh={towel ? [520, 1110] : [500, 1030]} lf={[380, G - 40]} rf={[440, G - 10]}
            fp={towel ? {...F0, eo: 0.45, px: 26, py: 10, ps: 0.6, brow: 12, mw: 40, mh: 0, mc: -6} : {...F0, eo: 1.2, er: 1.2, px: 26, py: 0, ps: 0.4, brow: -24, mw: 34, mh: 30, mc: 0}} />
          {towel && <rect x={470} y={1080} width={80} height={50} rx={6} fill="#fff" stroke={INK} strokeWidth={4} transform={`rotate(${Math.sin(t * 9) * 10} 510 1105)`} />}
        </g>
        <g transform={`translate(${ax - 760} ${-fl - 160}) rotate(${fl * 0.3} 760 ${G - 300})`}>
          <Person {...astro} x={760} lh={[720, 1160]} rh={towel ? [700, 1140] : [600, 1080]} lf={[732, G - 6]} rf={[790, G - 6]} fp={{...F0, eo: 0.6, px: 26, py: 0, brow: 6, mw: 40, mc: 4}} />
          <circle cx={760} cy={830} r={120} fill="#BFE6FA" fillOpacity={0.35} stroke={INK} strokeWidth={8} />
          {!towel && <rect x={560} y={1050} width={80} height={50} rx={6} fill="#fff" stroke={INK} strokeWidth={4} />}
        </g>
        <Pop t={t} at={SPACE + 1.3} x={760} y={620} text="towel?" size={70} rot={6} life={1.0} />
      </Shell>
    );
  }
  if (t >= BACKR) {
    // back in the restroom: next guy sees the hole, uses towels
    let dad = stand('teen', -150, 'dd', {look: {top: '#5DAA5A', top2: '#4E9A4B', hair: '#9A9AA5', tie: '#F2D54A', pants: '#3E4A66', shoe: '#2D2D33'}});
    dad = walkPose(dad, t, BACKR, BACKR + 1.4, -150, 560, 3.0);
    const look = t > BACKR + 1.6;
    const fp: FaceP = look ? {...F0, eo: 1.2, er: 1.2, px: 20, py: -30, ps: 0.4, brow: -20, mw: 30, mh: 0, mc: -8} : {...F0, eo: 0.8, px: 26, py: 4, mc: 4};
    const towelPull = t > BACKR + 2.8;
    return (
      <Shell title="" dur={GAG21_DUR} bg="#DDEFF2" cam={{cx: 600, cy: 960, z: 1.1}} caption={caption}>
        <Room wall="#DDEFF2" floor="#E9E9EE" />
        <rect x={-300} y={200} width={1800} height={60} fill="#C9D6DA" stroke={INK} strokeWidth={6} />
        <path d={`M${DX - 120} 200 L${DX - 60} 270 L${DX + 10} 210 L${DX + 80} 280 L${DX + 130} 200Z`} fill="#0B0F24" stroke={INK} strokeWidth={6} />
        <Dryer t={t} on={false} turbo={false} />
        <rect x={360} y={880} width={140} height={180} rx={10} fill="#fff" stroke={INK} strokeWidth={7} />
        <text x={430} y={980} textAnchor="middle" fontFamily="PH" fontSize={30} fill={INK}>towels</text>
        <Person {...dad} fp={fp} rh={towelPull ? [440, 1060] : dad.rh} />
        {towelPull && <rect x={420} y={1060} width={60} height={70} rx={4} fill="#fff" stroke={INK} strokeWidth={4} />}
      </Shell>
    );
  }
  // restroom
  const {p, rot, piv} = teenWorld(t);
  if (t < 2.0) cam = {cx: DX - 130, cy: 880, z: K(t, [[0, 2.8], [2.0, 2.4]], EIO), sh: 3};
  if (t > CEIL - 0.6) cam = {cx: 620, cy: K(t, [[CEIL - 0.6, 1040], [CEIL, 700]], EIO), z: 1.1, sh: 10};
  const up = t > CEIL - 0.4 ? K(t, [[CEIL - 0.4, 0], [CEIL, -1400]], (x) => x * x) : 0;
  return (
    <Shell title="" dur={GAG21_DUR} bg="#DDEFF2" cam={cam} caption={caption}>
      <Room wall="#DDEFF2" floor="#E9E9EE" />
      <rect x={-300} y={200} width={1800} height={60} fill="#C9D6DA" stroke={INK} strokeWidth={6} />
      {t > CEIL - 0.05 && <path d={`M${DX - 120} 200 L${DX - 60} 270 L${DX + 10} 210 L${DX + 80} 280 L${DX + 130} 200Z`} fill="#8FCBF0" stroke={INK} strokeWidth={6} />}
      {/* mirrors + sinks */}
      {[120, 420].map((x) => <g key={x}><rect x={x} y={640} width={200} height={240} rx={14} fill="#E6F6FA" stroke={INK} strokeWidth={7} /><rect x={x - 20} y={1080} width={240} height={50} rx={20} fill="#fff" stroke={INK} strokeWidth={7} /></g>)}
      <rect x={360} y={880} width={140} height={180} rx={10} fill="#fff" stroke={INK} strokeWidth={7} opacity={0} />
      <Dryer t={t} on={t < CEIL} turbo={t > TURBO} />
      <g transform={`translate(0 ${up}) rotate(${rot} ${piv[0]} ${piv[1]})`}>
        <Person {...p} />
      </g>
      {t > TURBO && t < CEIL && [0, 1, 2, 3].map((i) => <line key={i} x1={DX - 300 - ((t * 900 + i * 120) % 500)} y1={DY + 60 + i * 40} x2={DX - 420 - ((t * 900 + i * 120) % 500)} y2={DY + 60 + i * 40} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.6} />)}
      <Pop t={t} at={0.1} x={DX - 300} y={700} text="FWOOOOOSH" size={84} rot={-8} col="#BFE6FA" life={1.6} />
      <Pop t={t} at={TURBO} x={DX - 80} y={760} text="TURBO!!" size={90} rot={6} col="#FFB3AE" life={1.0} />
      <Pop t={t} at={CEIL} x={DX} y={380} text="CRASH" size={110} rot={-6} col="#FFF3A8" life={0.6} />
    </Shell>
  );
};
