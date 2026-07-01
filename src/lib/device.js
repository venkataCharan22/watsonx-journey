// Cheap one-time device checks (used to scale down work on phones).
export const isMobile =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches

export const isCoarse =
  typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
