import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store'
import { smoothstep } from '../../lib/scene-params'

// Soft green wash that warms the white space as the pipeline comes alive.
function makeGlow() {
  const s = 256
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(31,170,107,0.55)')
  g.addColorStop(0.5, 'rgba(66,190,101,0.18)')
  g.addColorStop(1, 'rgba(66,190,101,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  return new THREE.CanvasTexture(c)
}

export default function ModernFlow() {
  const tex = useMemo(makeGlow, [])
  const mat = useRef()

  useFrame(() => {
    const p = useStore.getState().progress
    if (mat.current) mat.current.opacity = smoothstep(0.76, 0.94, p) * 0.5
  })

  return (
    <mesh position={[0, 0, -6]} renderOrder={-5}>
      <planeGeometry args={[34, 22]} />
      <meshBasicMaterial
        ref={mat}
        map={tex}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  )
}
