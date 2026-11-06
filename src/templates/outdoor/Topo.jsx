/**
 * Contour lines, as a survey map draws the lie of a piece of land: the
 * texture behind a hero or a band that has no photo. Drawn in the color of the
 * words over it at a low strength, and shaped by the business's own name, so
 * each site's lines are its own and the same on every page.
 */
import { seedOf } from './util.js';

const W = 1600;
const H = 900;

/** A smooth closed path through the points, as a Catmull-Rom curve. */
function closed(points) {
  const n = points.length;
  const at = (i) => points[(i + n) % n];
  let d = `M${at(0)[0].toFixed(1)},${at(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return `${d}Z`;
}

/** The rings of one hill: each a scaled copy of the last, so no two lines ever cross. */
function hill(cx, cy, rings, step, seed) {
  const phase = [seed * 6.28, seed * 11.3, seed * 17.9];
  const paths = [];
  for (let k = 1; k <= rings; k += 1) {
    const r = k * step;
    const drift = k * 0.05;
    const points = [];
    for (let i = 0; i < 36; i += 1) {
      const t = (i / 36) * Math.PI * 2;
      const f = 1 + 0.16 * Math.sin(2 * t + phase[0] + drift) + 0.08 * Math.sin(3 * t + phase[1]) + 0.04 * Math.sin(5 * t + phase[2] - drift);
      points.push([cx + Math.cos(t) * r * f * 1.35, cy + Math.sin(t) * r * f * 0.85]);
    }
    paths.push(closed(points));
  }
  return paths;
}

export default function Topo({ name, className = '', strength = 0.14 }) {
  const seed = seedOf(name);
  const cx = W * (0.68 + seed * 0.22);
  const cy = H * (0.2 + ((seed * 7) % 1) * 0.5);
  const paths = hill(cx, cy, 22, 58, seed);
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" style={{ opacity: strength }}>
        {paths.map((d, i) => (
          <path key={i} d={d} strokeWidth={i % 5 === 4 ? 2.2 : 1.1} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
