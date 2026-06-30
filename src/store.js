import { create } from 'zustand'

// Normalized start points (progress 0..1) for each beat. Tuned to the blueprint.
// open · problem · decide · migrate · modern
export const ACT_POINTS = [0.0, 0.08, 0.28, 0.5, 0.74]

// Total runtime of the auto-play cinematic, in seconds.
export const DURATION = 58

export const useStore = create((set, get) => ({
  progress: 0,
  playing: false,
  duration: DURATION,
  started: false,

  setProgress: (p) => set({ progress: Math.min(1, Math.max(0, p)) }),
  setPlaying: (p) => set({ playing: p }),
  setStarted: (s) => set({ started: s }),

  // Advance the timeline each frame while playing.
  tick: (delta) => {
    const { playing, progress, duration } = get()
    if (!playing || progress >= 1) return
    // Decelerate over the Decision-Agent scorecard read-out so it stays legible,
    // then resume — keeps the "plays like a video" feel without a hard pause.
    let speed = 1
    if (progress > 0.4 && progress < 0.5) speed = 0.32
    const next = Math.min(1, progress + (delta / duration) * speed)
    set({ progress: next })
    if (next >= 1) set({ playing: false })
  },

  begin: () => set({ started: true, playing: true, progress: 0 }),

  goToAct: (i) => {
    const p = ACT_POINTS[i] ?? 0
    set({ progress: p, playing: true })
  },

  nextAct: () => {
    const { progress } = get()
    const next = ACT_POINTS.find((p) => p > progress + 0.01)
    set({ progress: next ?? 1, playing: next !== undefined })
  },

  prevAct: () => {
    const { progress } = get()
    const prev = [...ACT_POINTS].reverse().find((p) => p < progress - 0.01)
    if (prev !== undefined) set({ progress: prev, playing: true })
  },

  togglePlay: () => {
    const { playing, progress } = get()
    if (progress >= 1) {
      set({ progress: 0, playing: true })
    } else {
      set({ playing: !playing })
    }
  },

  replay: () => set({ progress: 0, playing: true }),
}))

// Dev-only: expose the store for quick scrubbing/verification in the browser.
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
