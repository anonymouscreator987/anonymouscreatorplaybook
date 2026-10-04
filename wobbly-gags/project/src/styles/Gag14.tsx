import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, cl, sm, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Room, Whoosh, FPS} from './kit';

// "When mum calls you" - teen teleports from game to mum, gets handed trash, comes back to GAME OVER.
export const GAG14_DUR = 13;
export const GAG14_FRAMES = GAG14_DUR * FPS;

const CALL = 2.6, ZAP = 4.6, HALL = 5.0, BAG = 6.6, TRUDGE = 8.0, BACK = 10.4;
const BX = 330; // beanbag x

const sitTeen = (t: number): PP => {
  const x = BX;
  const p = stand('teen', x, 'tn');
  const mash = t < CALL ? Math.sin(t * 40) * 8 : 0;
  const frozen = t >= CALL;
  let fp: FaceP = {...F0, eo: 1.0, px: 28, py: -2, brow: -10, mw: 44, mc: 14};
  if (frozen) fp = {...F0, eo: 1.35, er: 1.3, ps: 0.3, px: 30, py: -4, brow: -36, mw: 34, mh: 0, mc: -10, sweat: t > 3.6 ? 1 : 0};
  return {...p, hip: -55, sy: 0.96, lf: [x + 125, G - 8], rf: [x + 165, G - 8], lh: [x + 70, 1270 + mash], rh: [x + 110, 1268 - mash], fp, tilt: frozen ? 0 : Math.sin(t * 7) * 3};
};

const hallTeen = (t: number): PP => {
  if (t < TRUDGE) {
    const x = 640;
    const p = stand('teen', x, 'tn', {flip: true});
    const got = t > BAG + 0.3;
    const fp: FaceP = got
      ? {...F0, eo: 0.45, px: 0, py: 6, ps: 0.6, brow: 10, mw: 46, mh: 0, mc: -6}
      : {...F0, eo: 1.0, px: 14, py: 0, brow: -12, mw: 60, mh: 26, mc: 20, sweat: 1};
    const lh: P = got ? [x - 60, 1220] : [x - 20, 1170];
    const rh: P = got ? [x - 40, 1230] : [x + 20, 1170];
    return {...p, lh, rh, fp, tilt: got ? 8 : -2, hip: got ? -320 : -340};
  }
  let p = stand('teen', 640, 'tn', {flip: true, lh: [600, 1230], rh: [620, 1235]});
  p = walkPose(p, t, TRUDGE, BACK, 640, 1250, 2.0);
  return {...p, fp: {...F0, eo: 0.42, px: 0, py: 6, ps: 0.6, brow: 10, mw: 46, mh: 0, mc: -6}, tilt: 10};
};

const hallMum = (t: number): PP => {
  const x = 330;
  const p = stand('mum', x, 'mm');
  let lh: P = [x + 50, 1186], rh: P = [x - 40, 1200];
  if (t > BAG - 0.4 && t < BAG + 0.4) {
    rh = KP(t, [[BAG - 0.4, rh], [BAG, [560, 1200]], [BAG + 0.4, rh]], EIO);
  }
  const fp: FaceP = {...F0, eo: 0.5, px: 12, py: 2, brow: 8, tilt: 16, mw: 56, mh: 0, mc: t > BAG + 0.4 ? 10 : -12};
  return {...p, lh, rh, fp};
};

const Bag: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-60 0 Q-70 -90 -20 -110 L-10 -140 L10 -140 L20 -110 Q70 -90 60 0Z" fill="#2D2D33" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M-30 -60 Q-10 -70 10 -50" stroke="#555" strokeWidth={5} fill="none" />
    <path d="M30 -20 l6 -14 M38 -24 l10 -8" stroke="#7DB86B" strokeWidth={5} />
  </g>
);

const LivingRoom: React.FC<{t: number; teen?: PP; over?: boolean}> = ({t, teen, over}) => (
  <g>
    <Room wall="#3B3360" floor="#4E3C35" />
    {/* TV */}
    <rect x={700} y={900} width={420} height={260} rx={14} fill="#16161E" stroke={INK} strokeWidth={9} />
    <rect x={720} y={920} width={380} height={220} rx={8} fill={over ? '#120A0A' : '#3BA0E8'} />
    {!over && <g>
      <rect x={760} y={1060} width={300} height={30} fill="#5DAA5A" />
      <rect x={800 + Math.sin(t * 5) * 60} y={1010} width={40} height={50} fill="#F2D54A" stroke={INK} strokeWidth={4} />
      <circle cx={980} cy={1020 + Math.sin(t * 8) * 20} r={18} fill="#E86A5C" stroke={INK} strokeWidth={4} />
    </g>}
    {over && <text x={910} y={1050} textAnchor="middle" fontFamily="PH" fontSize={72} fill="#E86A5C">GAME OVER</text>}
    <rect x={760} y={1160} width={300} height={G - 1160} fill="#5A4A6E" stroke={INK} strokeWidth={8} />
    {/* TV glow */}
    {!over && <polygon points="720,1140 300,1460 1100,1460 1100,1140" fill="#3BA0E8" opacity={0.12} />}
    {/* beanbag */}
    <ellipse cx={BX - 30} cy={G - 70} rx={200} ry={110} fill="#E86A5C" stroke={INK} strokeWidth={8} />
    {teen && <Person {...teen} />}
    {/* controller */}
    {teen && <g transform={`translate(${(teen.lh[0] + teen.rh[0]) / 2} ${(teen.lh[1] + teen.rh[1]) / 2})`}>
      <rect x={-40} y={-20} width={80} height={40} rx={18} fill="#2D2D33" stroke={INK} strokeWidth={5} />
    </g>}
  </g>
);

export const Gag14: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const inHall = t >= HALL && t < BACK;
  let scene: React.ReactNode;
  let cam = {cx: 540, cy: 1040, z: 1.05, sh: 0} as {cx: number; cy: number; z: number; sh?: number};
  if (t < HALL) {
    const gone = t >= ZAP;
    const teen = gone ? undefined : sitTeen(t);
    const ctrlY = gone ? K(t, [[ZAP, 1270], [ZAP + 0.3, 1270], [ZAP + 0.4, G - 40]], (x) => x * x) : 0;
    if (t > 3.3 && t < ZAP) cam = {cx: BX + 10, cy: 960, z: K(t, [[3.3, 2.0], [ZAP, 2.5]], (x) => x), sh: 0};
    scene = (
      <g>
        <LivingRoom t={t} teen={teen} />
        {gone && <g>
          <rect x={BX + 50} y={ctrlY - 20} width={80} height={40} rx={18} fill="#2D2D33" stroke={INK} strokeWidth={5} />
          {t < ZAP + 0.3 && <Whoosh x={BX + 40} y={1050} dir={-1} n={5} op={1 - (t - ZAP) / 0.3} />}
          {t < ZAP + 0.3 && <circle cx={BX + 40} cy={1000} r={60 + (t - ZAP) * 300} fill="none" stroke="#fff" strokeWidth={10 * (1 - (t - ZAP) / 0.3)} />}
        </g>}
        {/* mum's voice from off-screen */}
        {t > CALL && t < 4.4 && (
          <g transform={`translate(${t < 3.3 ? 640 : BX + 150} ${t < 3.3 ? 640 : 780}) scale(${K(t, [[CALL, 0.4], [CALL + 0.15, 1.1], [CALL + 0.25, 1]], EIO) * (t < 3.3 ? 1 : 0.55)})`}>
            <path d="M-200 -90 Q0 -170 200 -90 Q260 0 180 60 L240 130 L120 80 Q0 110 -180 60 Q-260 0 -200 -90Z" fill="#fff" stroke={INK} strokeWidth={9} />
            <text x={0} y={30} textAnchor="middle" fontFamily="PH" fontSize={92} fill="#D2342B">COME HERE.</text>
          </g>
        )}
      </g>
    );
  } else if (inHall) {
    const teen = hallTeen(t);
    const mum = hallMum(t);
    const bagAt: P | null = t < BAG ? [mum.rh[0] + 10, mum.rh[1] + 120] : [teen.lh[0], teen.lh[1] + 130];
    const arrive = t - HALL;
    cam = {cx: t > BAG + 0.4 && t < TRUDGE ? 600 : 520, cy: t > BAG + 0.4 && t < TRUDGE ? 900 : 1040, z: t > BAG + 0.4 && t < TRUDGE ? 2.0 : 1.05, sh: arrive < 0.15 ? 8 : 0};
    if (t >= TRUDGE) cam = {cx: Math.min(teen.x - 40, 900), cy: 1040, z: 1.05, sh: 0};
    scene = (
      <g>
        <Room wall="#E8D6B0" floor="#A27B5C" />
        {[0, 1, 2].map((i) => <rect key={i} x={-100 + i * 520} y={600} width={160} height={210} rx={10} fill="#F6EEDC" stroke={INK} strokeWidth={7} />)}
        <rect x={1120} y={760} width={300} height={G - 760} fill="#7A5A3C" stroke={INK} strokeWidth={8} />
        <circle cx={1150} cy={1120} r={12} fill="#F2D54A" stroke={INK} strokeWidth={4} />
        <Person {...mum} />
        <Person {...teen} />
        {bagAt && <Bag x={bagAt[0]} y={bagAt[1]} />}
        {arrive < 0.3 && <Whoosh x={teen.x + 140} y={1000} dir={-1} n={5} op={1 - arrive / 0.3} />}
        <Pop t={t} at={HALL + 0.1} x={760} y={720} text="yes mum?" size={70} rot={-6} life={1.1} />
        <Pop t={t} at={BAG + 0.3} x={560} y={700} text="trash." size={70} rot={6} life={1.0} />
      </g>
    );
  } else {
    // back to the room: GAME OVER
    cam = {cx: K(t, [[BACK, 540], [BACK + 1.2, 900]], EIO), cy: K(t, [[BACK, 1040], [BACK + 1.2, 1030]], EIO), z: K(t, [[BACK, 1.05], [BACK + 1.2, 1.9]], EIO), sh: 0};
    scene = (
      <g>
        <LivingRoom t={t} over />
        <rect x={BX + 50} y={G - 60} width={80} height={40} rx={18} fill="#2D2D33" stroke={INK} strokeWidth={5} />
      </g>
    );
  }
  return (
    <Shell title="When mum calls you" dur={GAG14_DUR} bg="#3B3360" cam={cam}>
      {scene}
    </Shell>
  );
};
