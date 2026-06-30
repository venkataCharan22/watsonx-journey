import * as THREE from 'three'

// Master gradient, keyed to the film's progress so the river hue tracks the
// narrative: amber (problem) -> violet (decide) -> blue/cyan (migrate) -> green (modern).
// Each stop is [progress 0..1, hex].
const STOPS = [
  [0.0, '#ff832b'], // amber  — the problem
  [0.2, '#ffae57'], // amber-soft
  [0.36, '#8a3ffc'], // violet — decision agent
  [0.46, '#a56eff'], // violet-light
  [0.58, '#0f62fe'], // IBM blue — migration
  [0.68, '#3a8bff'], // cyan
  [0.82, '#1faa6b'], // green — modernized
  [1.0, '#42be65'], // green-light
]

// Pre-resolve stop colors once.
const STOP_COLORS = STOPS.map(([t, hex]) => ({ t, c: new THREE.Color(hex) }))

const _scratch = new THREE.Color()

// Returns a THREE.Color for a position along the master gradient (0..1).
// Writes into `out` if provided (to avoid allocations in hot loops).
export function gradientColorAt(t, out) {
  const target = out || _scratch
  const x = Math.min(1, Math.max(0, t))
  for (let i = 0; i < STOP_COLORS.length - 1; i++) {
    const a = STOP_COLORS[i]
    const b = STOP_COLORS[i + 1]
    if (x <= b.t) {
      const span = b.t - a.t || 1
      const k = (x - a.t) / span
      target.copy(a.c).lerp(b.c, k)
      return target
    }
  }
  target.copy(STOP_COLORS[STOP_COLORS.length - 1].c)
  return target
}

// CSS gradient string for the progress bar / DOM accents.
export const CSS_GRADIENT =
  'linear-gradient(90deg, #ff832b 0%, #ffae57 18%, #8a3ffc 38%, #a56eff 48%, #0f62fe 60%, #3a8bff 70%, #1faa6b 86%, #42be65 100%)'

// Hex accent for a given progress (used by DOM eyebrow / bar tip).
export function hexAt(t) {
  return '#' + gradientColorAt(t, _scratch).getHexString()
}

// Named beat accents.
export const ACCENT = {
  amber: '#ff832b',
  violet: '#8a3ffc',
  blue: '#0f62fe',
  cyan: '#3a8bff',
  green: '#1faa6b',
}
