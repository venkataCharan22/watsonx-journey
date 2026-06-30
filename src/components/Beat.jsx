import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { smoothstep } from '../lib/scene-params'

// Fade factor (0..1) for a progress window [a,b] with soft edges of width w.
export function fadeFor(p, a, b, w = 0.035) {
  return smoothstep(a - w, a + w, p) * (1 - smoothstep(b - w, b + w, p))
}

// Wraps a beat's 3D content: toggles visibility and cross-fades every material's
// opacity across the beat's progress window. Materials are made transparent and
// their authored opacity is remembered as the fade ceiling.
export default function Beat({ window: win, fade = 0.045, children }) {
  const [a, b] = win
  const ref = useRef()
  const bases = useRef(null)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    const p = useStore.getState().progress
    const f = fadeFor(p, a, b, fade)
    g.visible = f > 0.004
    if (!g.visible) return
    if (!bases.current) {
      bases.current = new Map()
      g.traverse((o) => {
        if (o.material) {
          o.material.transparent = true
          bases.current.set(o.material, o.material.opacity)
        }
      })
    }
    bases.current.forEach((base, m) => {
      m.opacity = base * f
    })
  })

  return <group ref={ref}>{children}</group>
}
