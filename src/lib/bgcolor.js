// THREE-free background/ink interpolation for the dark→light stage arc.
// (Kept separate from lib/gradient.js so `three` never enters the 2D bundle.)

function hexToRgb(h) {
  const n = parseInt(h.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function rgbToCss(r, g, b) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}
function lerpStops(stops, t) {
  const x = Math.min(1, Math.max(0, t))
  for (let i = 0; i < stops.length - 1; i++) {
    const [ta, ca] = stops[i]
    const [tb, cb] = stops[i + 1]
    if (x <= tb) {
      const k = (x - ta) / (tb - ta || 1)
      const A = hexToRgb(ca)
      const B = hexToRgb(cb)
      return rgbToCss(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k)
    }
  }
  return rgbToCss(...hexToRgb(stops[stops.length - 1][1]))
}

// Back-loaded flip: dark data-center most of the way, fast brighten at the cloud.
const BG_STOPS = [
  [0.0, '#05070f'],
  [0.2, '#0e1730'],
  [0.38, '#10203f'],
  [0.48, '#16345f'],
  [0.62, '#1f4f8f'],
  [0.8, '#dbe8ff'],
  [0.88, '#f4f8ff'],
  [1.0, '#fbfcff'],
]

// slightly lighter center for the radial-gradient depth
const CENTER_STOPS = [
  [0.0, '#0b1226'],
  [0.2, '#16224a'],
  [0.38, '#1a2d55'],
  [0.48, '#21497f'],
  [0.62, '#2a63aa'],
  [0.8, '#eaf1ff'],
  [1.0, '#ffffff'],
]

export function bgColorAt(gp) {
  return lerpStops(BG_STOPS, gp)
}
export function bgCenterAt(gp) {
  return lerpStops(CENTER_STOPS, gp)
}

// Text ink: near-white on the dark bands, flips to dark ink as it brightens.
export function inkAt(gp) {
  return lerpStops(
    [
      [0.0, '#f4f7ff'],
      [0.68, '#eaf1ff'],
      [0.78, '#0b1220'],
      [1.0, '#0b1220'],
    ],
    gp,
  )
}

// True once the stage has brightened enough to use dark-on-light text styling.
export function isLightAt(gp) {
  return gp >= 0.74
}
