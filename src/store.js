import { create } from 'zustand'
import { isMobile } from './lib/device'

// Normalized start points (progress 0..1) for each beat.
// open · problem · decide · migrate · modern
export const ACT_POINTS = [0.0, 0.08, 0.28, 0.5, 0.74]

// Total scroll length, in viewport-heights. More screens = slower, more
// luxurious scrub. Slightly shorter on phones — a thumb-fling covers less
// story than a wheel, so the same film needs fewer swipes.
export const SCROLL_SCREENS = isMobile ? 6.8 : 7.6

// Piecewise scroll→progress map. Decoupling "how far you scroll" from "how far
// the story moves" lets some beats linger. The decide beat gets a near-stall
// knot (scroll 0.46→0.56 spends a lot of scroll on progress 0.40→0.46) so the
// Decision scorecard reveals at a readable pace — a dwell with no CSS pinning.
const SCROLL_STOPS = [0.0, 0.1, 0.34, 0.46, 0.56, 0.62, 0.82, 1.0]
const PROG_STOPS = [0.0, 0.08, 0.28, 0.4, 0.46, 0.5, 0.74, 1.0]

// Scroll fraction that lands on each beat (for the constellation rail nav).
const BEAT_SCROLL = [0.0, 0.1, 0.34, 0.62, 0.82]

// Map a raw scroll fraction (0..1) to progress (0..1). Strictly monotonic.
export function scrollToProgress(s) {
  const x = Math.min(1, Math.max(0, s))
  for (let i = 0; i < SCROLL_STOPS.length - 1; i++) {
    if (x <= SCROLL_STOPS[i + 1]) {
      const span = SCROLL_STOPS[i + 1] - SCROLL_STOPS[i] || 1
      const k = (x - SCROLL_STOPS[i]) / span
      return PROG_STOPS[i] + (PROG_STOPS[i + 1] - PROG_STOPS[i]) * k
    }
  }
  return 1
}

const COARSE = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
const REDUCED = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export const useStore = create((set, get) => ({
  progress: 0, // smoothed value the scene renders
  target: 0, // progress implied by current scroll
  inDeepDive: false, // true once the deep-dive cover occludes the canvas

  setScroll: (frac) => set({ target: scrollToProgress(frac) }),
  setInDeepDive: (v) => {
    if (get().inDeepDive !== v) set({ inDeepDive: v })
  },

  // Damped follow each frame — the journey glides with scroll (parallax feel).
  // Frame-rate independent. Stiffer on touch (fling can overshoot), near-instant
  // when the user prefers reduced motion.
  damp: (delta) => {
    const { progress, target } = get()
    const dt = Math.min(delta, 0.05)
    const k = REDUCED ? 0.5 : 1 - Math.pow(COARSE ? 0.0008 : 0.0016, dt)
    const next = progress + (target - progress) * k
    if (Math.abs(next - progress) > 1e-6) set({ progress: Math.min(1, Math.max(0, next)) })
  },
}))

// Dev-only: expose for quick scrubbing/verification in the browser.
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.__journey = useStore
}

// Which beat index is active for a given progress value.
export function actIndexFor(progress) {
  if (progress >= ACT_POINTS[4]) return 4
  if (progress >= ACT_POINTS[3]) return 3
  if (progress >= ACT_POINTS[2]) return 2
  if (progress >= ACT_POINTS[1]) return 1
  return 0
}

// Scroll fraction (0..1) that lands on a given beat — for the rail nav.
export function scrollFractionForBeat(i) {
  return BEAT_SCROLL[Math.min(Math.max(i, 0), BEAT_SCROLL.length - 1)]
}
