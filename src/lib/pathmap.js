// Section timing + master-path sampling for the scrollytelling engine.

// Global-progress bands per section (sum to 1). The two money-shots (Decision
// S2, StreamSets S4) are the widest so the traveler dwells there.
export const SECTION_RANGES = [
  [0.0, 0.08], // 0 landing
  [0.08, 0.22], // 1 powercenter
  [0.22, 0.4], // 2 decision (weighted)
  [0.4, 0.5], // 3 fork
  [0.5, 0.72], // 4 streamsets (widest)
  [0.72, 0.86], // 5 deploy
  [0.86, 0.94], // 6 value
  [0.94, 1.0], // 7 closing
]

// The traveler reaches the cloud (end of the drawn path) at this global progress;
// it then rests there through the value + closing sections.
export const TRAVELER_END = 0.86

export function clamp01(x) {
  return Math.min(1, Math.max(0, x))
}

// Local progress (0..1) within a section.
export function lp(i, gp) {
  const [a, b] = SECTION_RANGES[i]
  return clamp01((gp - a) / (b - a || 1))
}

// Arc fraction of the decision ring centre along the path.
const RING_ARC = 0.4
// Maps global progress to a 0..1 arc fraction for the traveler. The doc rises to
// the decision ring, PINS there through the S2 window (so it stays centred while
// the ring spins), then resumes to the cloud at TRAVELER_END.
export function pathEase(gp) {
  if (gp >= TRAVELER_END) return 1
  if (gp < 0.24) return (gp / 0.24) * RING_ARC
  if (gp < 0.4) return RING_ARC // pinned at the ring through S2
  return RING_ARC + ((gp - 0.4) / (TRAVELER_END - 0.4)) * (1 - RING_ARC)
}

// Precompute a lookup table of points along the path (cheap sampling on mobile —
// zero getPointAtLength calls per frame).
export function buildLUT(pathEl, n = 600) {
  const L = pathEl.getTotalLength()
  const xs = new Float32Array(n + 1)
  const ys = new Float32Array(n + 1)
  for (let i = 0; i <= n; i++) {
    const pt = pathEl.getPointAtLength((i / n) * L)
    xs[i] = pt.x
    ys[i] = pt.y
  }
  return { L, n, xs, ys }
}

// Sample the LUT at arc fraction f (0..1) with linear interpolation.
export function sampleLUT(lut, f) {
  const x = clamp01(f) * lut.n
  const i = Math.min(lut.n - 1, Math.floor(x))
  const k = x - i
  return {
    x: lut.xs[i] + (lut.xs[i + 1] - lut.xs[i]) * k,
    y: lut.ys[i] + (lut.ys[i + 1] - lut.ys[i]) * k,
  }
}
