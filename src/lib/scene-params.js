// Progress-driven parameters for the river + camera. Everything here is a pure
// function of `progress` (0..1) so the whole film is deterministic and scrubable.

export function clamp01(x) {
  return Math.min(1, Math.max(0, x))
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1))
  return t * t * (3 - 2 * t)
}

// Ken Perlin's smootherstep — zero 1st & 2nd derivative at the ends. Used to
// ease motion within each scroll segment so beats feel "magnetic".
export function smootherstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1))
  return t * t * t * (t * (6 * t - 15) + 10)
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

// Beat windows (progress ranges) — mirrors ACT_POINTS in the store.
export const BEATS = {
  open: [0.0, 0.08],
  problem: [0.08, 0.28],
  decide: [0.28, 0.5],
  migrate: [0.5, 0.74],
  modern: [0.74, 1.0],
}

// The river's visible vertical span (world units). Particles cycle within it.
export const RIVER_TOP = 17
export const RIVER_BOTTOM = -17

// Lateral half-width of the wide legacy river.
const WIDE = 5.2
// Lateral offset of each channel after the funnel split.
const SPLIT = 4.4

// How spread-out the river is before the funnel (collapses toward the throat).
export function spreadAt(p) {
  // Wide and messy through the problem, necks down to a tight column at the throat.
  if (p < 0.1) return lerp(2.4, WIDE, smoothstep(0.0, 0.1, p))
  return lerp(WIDE, 0.35, smoothstep(0.12, 0.34, p))
}

// 0 before the split, 1 fully split into two channels.
export function splitAt(p) {
  return smoothstep(0.34, 0.46, p) * (1 - smoothstep(0.78, 0.9, p))
}

// Lateral channel offset magnitude.
export function splitOffsetAt(p) {
  return SPLIT * splitAt(p)
}

// Flow speed multiplier — clogged/slow at the start, laminar and fast at the end.
export function flowSpeedAt(p) {
  const clogged = lerp(0.18, 0.45, smoothstep(0.0, 0.14, p)) // releases after cold open
  const sluggish = lerp(clogged, 0.55, smoothstep(0.14, 0.28, p)) // heavy legacy
  const funnel = lerp(sluggish, 0.85, smoothstep(0.3, 0.46, p)) // accelerates through throat
  const migrate = lerp(funnel, 0.8, smoothstep(0.5, 0.66, p))
  const modern = lerp(migrate, 1.7, smoothstep(0.78, 0.95, p)) // races out
  return modern
}

// Vertical wobble amount — chaotic legacy vs. laminar modern.
export function wobbleAt(p) {
  return lerp(1.0, 0.05, smoothstep(0.1, 0.82, p))
}

// Per-particle X (lane) target given its base lane (-1..1) and channel (0/1).
export function laneXAt(p, base, channel) {
  const pre = base * spreadAt(p)
  const split = (channel === 1 ? 1 : -1) * splitOffsetAt(p)
  const s = splitAt(p)
  // Small per-particle jitter inside a channel so it reads as a ribbon, not a line.
  const jitter = base * 0.5 * s
  return lerp(pre, split + jitter, s)
}

// During migration we follow the StreamSets (right, channel 1) lane and let the
// DataStage (left, channel 0) lane fade to faint. Returns brightness 0..1.
export function channelBrightnessAt(p, channel) {
  if (channel === 1) return 1
  // left channel dims through migrate, never fully gone until merge
  const dim = lerp(1, 0.12, smoothstep(0.5, 0.66, p))
  // comes back as it re-merges into the single modern ribbon
  const back = smoothstep(0.8, 0.92, p)
  return lerp(dim, 1, back)
}
