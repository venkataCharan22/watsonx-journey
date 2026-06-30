import { useMemo } from 'react'
import * as THREE from 'three'

function makeGradientTexture() {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 512
  const ctx = c.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, 0, 512)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.55, '#fbfcff')
  g.addColorStop(1, '#e9f0fb')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 8, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

function makeGridTexture() {
  const size = 128
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  ctx.strokeStyle = 'rgba(15, 98, 254, 0.5)'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, size - 1, size - 1)
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(34, 34)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export default function Background() {
  const gradTex = useMemo(makeGradientTexture, [])
  const gridTex = useMemo(makeGridTexture, [])

  return (
    <group>
      {/* Vertical-gradient backdrop, far back so geometry melts into it via fog. */}
      <mesh position={[0, 0, -52]} renderOrder={-10}>
        <planeGeometry args={[420, 300]} />
        <meshBasicMaterial map={gradTex} depthWrite={false} fog={false} toneMapped={false} />
      </mesh>

      {/* Faint receding blue grid. */}
      <mesh position={[0, 0, -34]} renderOrder={-9}>
        <planeGeometry args={[320, 220]} />
        <meshBasicMaterial
          map={gridTex}
          transparent
          opacity={0.1}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
