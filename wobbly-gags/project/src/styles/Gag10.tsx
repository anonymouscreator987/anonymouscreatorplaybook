import React from 'react';
import {useCurrentFrame} from 'remotion';
import {INK, G, P, EIO, K, KP, RING, cl, sm, lerp, F0, FaceP, PP, Person, stand, walkPose, Shell, Pop, Burst, Room, FPS} from './kit';

// "PUSH or PULL?" - teen fights a shop door, mum slides it open sideways.
export const GAG10_DUR = 13;
export const GAG10_FRAMES = GAG10_DUR * FPS;

const DX = 600; // door left edge
const DW = 300;
const B1 = 2.7, B2 = 3.9, READ = 5.0, PULL = 6.6, MUM = 8.3, SLIDE = 9.2, FALL = 9.45;

const teenAt = (t: number): PP => {
  let p = stand('teen', 120, 'tn');
  p = walkPose(p, t, 0.2, 2.2, 120, 440);
  const x = p.x;
  let fp: FaceP = {...F0, eo: 0.8, px: 20, py: 4, mc: 8};
  if (t < 2.4) return {...p, fp, lh: [x + 20, 1170], rh: [x + 50, 1170]};
  // pushes
  const push = (t0: number, hard: number) => {
    const u = t - t0;
    const fwd = K(u, [[-0.4, 0], [0, 1], [0.08, 1.08], [0.35, 0]], EIO);
    return fwd * hard;
  };
  let lean = 0, back = 0;
  if (t < READ) {
    const a = t < B2 - 0.5 ? push(B1, 1) : push(B2, 1.6);
    lean = a;
    back = K(t, [[B1, 0], [B1 + 0.1, -30], [B1 + 0.5, 0], [B2, 0], [B2 + 0.1, -70], [B2 + 0.6, -20]], EIO);
    const hit = (t > B1 && t < B1 + 0.5) || (t > B2 && t < B2 + 0.9);
    fp = hit
      ? {...F0, eo: 0.1, er: 1, brow: 14, mw: 40, mh: 0, mc: -8, tilt: -10}
      : {...F0, eo: 0.9, px: 22, py: 2, brow: -6, mw: 30, mc: -4, tilt: 8};
    const hx = x + 120 + lean * 26 + back;
    return {...p, x: x + back, lf: [x - 28 + back * 0.5, G - 6], rf: [x + 30 + back * 0.5, G - 6], lh: [hx, 1050], rh: [hx + 6, 1080], tilt: lean * 10 - (hit ? 10 : 0), fp};
  }
  if (t < PULL) {
    // reads the sign, then nods smugly
    const nod = t > 5.9 ? Math.sin((t - 5.9) * 14) * 5 * (t < 6.4 ? 1 : 0) : 0;
    fp = t < 5.8 ? {...F0, eo: 1, px: 22, py: -10, brow: -8, mw: 30, mh: 0, mc: 0} : {...F0, eo: 0.55, px: 20, py: 0, brow: 4, mw: 50, mc: 16};
    return {...p, x: x - 20, lf: [x - 48, G - 6], rf: [x + 10, G - 6], lh: [x - 20, 1170], rh: [x + 40, 1160], tilt: 6 + nod, fp};
  }
  if (t < FALL) {
    // grabs handle and pulls, harder and harder
    const strain = cl((t - PULL) / 2.4);
    const jerk = Math.sin(t * 34) * 6 * strain;
    const bx = x - 20 - strain * 40;
    fp = {...F0, eo: 0.15, brow: 14, mw: 46, mh: 0, mc: -10, sweat: strain > 0.4 ? 1 : 0, tilt: -14};
    if (t > MUM + 0.2) fp = {...F0, eo: 1.2, er: 1.2, px: 24, py: -4, ps: 0.5, brow: -26, mw: 34, mh: 0, mc: -2, sweat: 1};
    const H: P = [DX + 40 + jerk, 1060];
    return {...p, x: bx, lf: [bx - 70, G - 6], rf: [bx + 40, G - 6], lh: H, rh: [H[0] + 4, H[1] + 18], tilt: -10 - strain * 8, fp, hip: -320};
  }
  // door vanishes sideways: flies back and lands flat on back
  const u = cl((t - FALL) / 0.45);
  const bx = lerp(x - 60, x - 210, sm(u));
  const down = t > FALL + 0.45;
  if (!down) {
    fp = {...F0, eo: 1.4, er: 1.3, ps: 0.4, brow: -36, mw: 30, mh: 50, mc: 0};
    return {...p, x: bx, hip: lerp(-320, -120, u), sy: 1, lf: [bx + 120 * u, G - 6 - 120 * u], rf: [bx + 160 * u, G - 6 - 80 * u], lh: [bx + 140, 1000 + 200 * u], rh: [bx + 160, 1000 + 220 * u], tilt: -40 * u, fp};
  }
  fp = {...F0, eo: K(t, [[10.6, 0.05], [11.4, 0.05], [11.6, 0.7]], EIO), px: 10, py: -12, brow: 6, mw: 30, mc: -6};
  return {...p, x: bx, hip: -60, sy: 0.92, lf: [bx + 170, G - 30], rf: [bx + 220, G - 10], lh: [bx - 70, G - 20], rh: [bx + 120, G - 40], tilt: -20, fp, bob: 40};
};

const mumAt = (t: number): PP => {
  const x0 = DX + DW / 2 + 40;
  let p = stand('mum', x0 + 260, 'mm', {flip: true});
  p = walkPose(p, t, MUM - 0.7, MUM, x0 + 260, x0);
  const x = p.x;
  const look = t > MUM + 0.3;
  let fp: FaceP = {...F0, eo: 0.5, px: 10, py: 2, brow: 8, tilt: 16, mw: 56, mh: 0, mc: -10};
  if (!look) fp = {...fp, eo: 0.8, tilt: 0, mc: 2};
  // reaches to door edge, slides it to the right
  const slide = cl((t - SLIDE) / 0.3);
  let lh: P = p.lh, rh: P = p.rh;
  if (t > SLIDE - 0.4) {
    lh = KP(t, [[SLIDE - 0.4, p.lh], [SLIDE, [DX + 30, 1140]], [SLIDE + 0.3, [DX + 30 + DW * 0.9, 1140]], [SLIDE + 0.8, p.lh]], EIO);
  }
  void slide;
  if (t > SLIDE + 0.6) fp = {...F0, eo: 0.5, px: -6, py: 14, brow: 8, tilt: 16, mw: 50, mh: 0, mc: -6};
  return {...p, lh, rh, fp};
};

const doorOffset = (t: number) => K(t, [[SLIDE, 0], [SLIDE + 0.3, DW + 20]], EIO);
const doorShake = (t: number) => RING(t, [B1 + 0.02, B2 + 0.02], 10, 9, 8) + (t > PULL && t < FALL ? Math.sin(t * 34) * 3 * cl((t - PULL) / 2.4) : 0);

export const Gag10: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const teen = teenAt(t);
  const mum = mumAt(t);
  const off = doorOffset(t);
  const shk = doorShake(t);
  const readShot = t >= READ && t < READ + 0.9;
  const cam = readShot
    ? {cx: DX + 120, cy: 900, z: 2.3}
    : t > FALL + 0.4
      ? {cx: K(t, [[FALL + 0.4, 540], [FALL + 1.6, 480]], EIO), cy: K(t, [[FALL + 0.4, 1060], [FALL + 1.6, 1160]], EIO), z: K(t, [[FALL + 0.4, 1.05], [FALL + 1.6, 1.25]], EIO), sh: t < FALL + 0.6 ? 8 : 0}
      : {cx: 540, cy: 1000, z: 1.05, sh: (t > B1 && t < B1 + 0.12) || (t > B2 && t < B2 + 0.18) ? 6 : 0};

  const door = (
    <g transform={`translate(${DX + off + shk} 0)`}>
      <rect x={0} y={640} width={DW} height={G - 640} rx={6} fill="#BFE3F2" fillOpacity={0.55} stroke={INK} strokeWidth={10} />
      <path d={`M40 720 L110 660 M60 800 L170 690`} stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      {/* sign */}
      <g transform={`translate(${DW / 2 - 10} 900) rotate(${shk * 0.6})`}>
        <rect x={-80} y={-36} width={160} height={72} rx={10} fill="#fff" stroke={INK} strokeWidth={6} />
        <text x={0} y={22} textAnchor="middle" fontFamily="PH" fontSize={60} fill="#D2342B">PULL</text>
      </g>
      {/* handle */}
      <rect x={28} y={980} width={22} height={170} rx={10} fill="#C9CED6" stroke={INK} strokeWidth={6} />
    </g>
  );

  const shop = (
    <g>
      <Room wall="#F1C27D" floor="#B98A5A" />
      {/* storefront */}
      <rect x={480} y={420} width={760} height={G - 420} fill="#2F7A6B" stroke={INK} strokeWidth={10} />
      <rect x={520} y={460} width={680} height={130} rx={10} fill="#F6EEDC" stroke={INK} strokeWidth={8} />
      <text x={860} y={550} textAnchor="middle" fontFamily="PH" fontSize={80} fill={INK}>SNACK SHOP</text>
      <rect x={DX} y={640} width={DW} height={G - 640} fill="#F8E7B0" stroke={INK} strokeWidth={8} />
      {/* shelves inside */}
      {[780, 950, 1120].map((y) => <rect key={y} x={DX} y={y} width={DW} height={16} fill="#B98A5A" stroke={INK} strokeWidth={4} />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={DX + 20 + (i % 3) * 90} y={(i < 3 ? 780 : 950) - 70} width={60} height={70} rx={8} fill={['#E86A5C', '#6CB7E0', '#F2D54A'][i % 3]} stroke={INK} strokeWidth={5} />)}
      <clipPath id="dclip"><rect x={DX} y={640} width={DW + 400} height={G - 640} /></clipPath>
      {t > MUM - 0.7 && <g clipPath="url(#dclip)"><Person {...mum} /></g>}
      {door}
      {/* frame */}
      <rect x={DX - 10} y={630} width={DW + 20} height={G - 630} fill="none" stroke={INK} strokeWidth={12} />
      <rect x={DX + DW + 10} y={640} width={250} height={600} rx={6} fill="#BFE3F2" fillOpacity={0.5} stroke={INK} strokeWidth={8} />
      {/* bush outside */}
      <ellipse cx={60} cy={G - 40} rx={140} ry={90} fill="#5DAA5A" stroke={INK} strokeWidth={8} />
      <Person {...teen} />
      {(t > B1 && t < B1 + 0.35) && <Burst x={DX + 6} y={880} r={60} />}
      {(t > B2 && t < B2 + 0.45) && <Burst x={DX + 6} y={880} r={90} />}
      {t > B2 + 0.15 && t < READ && [0, 1, 2].map((i) => {
        const a = t * 5 + i * 2.1;
        return <text key={i} x={teen.x + Math.cos(a) * 90} y={830 + Math.sin(a) * 26} fontFamily="PH" fontSize={50} fill="#F2D54A" stroke={INK} strokeWidth={6} paintOrder="stroke">★</text>;
      })}
      <Pop t={t} at={B1} x={DX - 80} y={780} text="BONK" size={86} />
      <Pop t={t} at={B2} x={DX - 90} y={760} text="BONK!!" size={110} rot={8} />
      <Pop t={t} at={FALL + 0.45} x={380} y={1280} text="THUD" size={100} />
      <Pop t={t} at={11.8} x={teen.x + 20} y={1180} text="..." size={110} rot={0} life={1.2} />
    </g>
  );

  return (
    <Shell title="Push or pull?" dur={GAG10_DUR} bg="#F1C27D" cam={cam}>
      {shop}
    </Shell>
  );
};
