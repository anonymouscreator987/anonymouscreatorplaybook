# Overlays and masks (code-generated, 4K-clean, deterministic)

The channel makes its own overlays instead of downloading "film grain / dust / light leak" packs. This has three advantages:
- **Resolution-independent:** perfect at 4K, with no upscaled 1080p grain mush.
- **Deterministic:** every render is identical, which Remotion requires.
- **Copyright-free:** many free overlay packs have unclear licenses.

All components read `useCurrentFrame()`. None use CSS animations, `Math.random`, or timers.

## Film grain (6%)

```tsx
import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'overlay', opacity}}>
      <svg width="100%" height="100%">
        <filter id="grain">
          {/* seed = frame -> new grain every frame, identical on every render */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
```
Grain sits **above** the camera push, so it is never scaled. For 4K renders made with `--scale=2`, `baseFrequency` stays at 0.9, which keeps the grain fine.

## Vignette

```tsx
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
  <AbsoluteFill style={{
    pointerEvents: 'none',
    background: `radial-gradient(ellipse at center, rgba(5,6,10,0) 55%, rgba(5,6,10,${strength}) 100%)`,
  }} />
);
```

## Chromatic aberration (wrap a scene; only on approved beats)

```tsx
export const ChromaticAberration: React.FC<{px: number; children: React.ReactNode}> = ({px, children}) => (
  <AbsoluteFill style={{filter: 'url(#ca)'}}>
    <svg width="0" height="0" style={{position: 'absolute'}}>
      <filter id="ca" colorInterpolationFilters="sRGB">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={-px} dy={0} result="r2" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feOffset in="b" dx={px} dy={0} result="b2" />
        <feBlend in="r2" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b2" mode="screen" />
      </filter>
    </svg>
    {children}
  </AbsoluteFill>
);
```
Animate `px` between 0 and 3 (at 1080p) with `interpolate`. Treat it as a moment of stress, not a constant effect.

## Masks

**Iris reveal** (a circle opens from a point; good for "zoom-out reveals"):
```tsx
const r = interpolate(frame, [0, 30], [0, 1400], {easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateRight: 'clamp'});
<svg width={1920} height={1080}>
  <defs><mask id="iris"><circle cx={960} cy={420} r={r} fill="white" /></mask></defs>
  <g mask="url(#iris)">{/* content */}</g>
</svg>
```

**Soft linear wipe** (horizon-line reveals): use a `<linearGradient>` inside the `<mask>`, and animate the gradient stops' `offset` with `interpolate`.

**Text as a window** (big Bebas word filled with the starfield): put the word in a `<mask>` as `<text fill="white">`, then draw the scene inside the masked `<g>`.

**Edge feather on any panel:** `mask-image: radial-gradient(...)` as an inline style. It is deterministic because it's static CSS (no transition).

## Light leaks / lens dirt
Off-brand for this channel and not used. Bright, warm leaks read as vlog, not documentary. If a beat needs heat, use Ember Amber glow on the subject itself.
