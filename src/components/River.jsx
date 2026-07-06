import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { gradientColorAt } from '../lib/gradient'
import { isMobile } from '../lib/device'
import {
  RIVER_TOP,
  RIVER_BOTTOM,
  laneXAt,
  flowSpeedAt,
  wobbleAt,
  channelBrightnessAt,
} from '../lib/scene-params'

const COUNT = isMobile ? 2000 : 4200
const SPAN = RIVER_TOP - RIVER_BOTTOM

// Soft round sprite so particles read as luminous droplets, not hard squares.
function makeSprite() {
  const s = 64
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.9)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  const tex = new THREE.CanvasTexture(c)
  return tex
}

// Faint color particles fade toward on the dimmed (DataStage) lane.
const FADE = new THREE.Color('#dbe5f5')

export default function River() {
  const sprite = useMemo(makeSprite, [])

  const { geometry, sizes, data } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)
    const sizes = new Float32Array(COUNT)
    const phase = new Float32Array(COUNT)
    const base = new Float32Array(COUNT)
    const channel = new Uint8Array(COUNT)
    const wPhase = new Float32Array(COUNT)
    const wFreq = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      phase[i] = Math.random()
      const b = Math.random() * 2 - 1
      base[i] = b
      channel[i] = b >= 0 ? 1 : 0 // right = StreamSets, left = DataStage
      wPhase[i] = Math.random() * Math.PI * 2
      wFreq[i] = 0.6 + Math.random() * 1.4
      sizes[i] = 0.5 + Math.random() * 0.9
      colors[i * 3] = 1
      colors[i * 3 + 1] = 0.6
      colors[i * 3 + 2] = 0.2
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return { geometry, sizes, data: { positions, colors, phase, base, channel, wPhase, wFreq } }
  }, [])

  const flow = useRef(0)
  const frame = useRef(0)
  const scratch = useMemo(() => new THREE.Color(), [])

  useFrame((_, delta) => {
    if (useStore.getState().inDeepDive) return // occluded by the deep-dive — freeze
    const p = useStore.getState().progress
    const dt = Math.min(delta, 0.05)
    const speed = flowSpeedAt(p)
    flow.current = (flow.current + dt * speed * 0.16) % 1

    const { positions, colors, phase, base, channel, wPhase, wFreq } = data
    const wob = wobbleAt(p)
    // update colours less often on mobile (every 3rd frame vs 2nd)
    const updateColor = frame.current % (isMobile ? 3 : 2) === 0
    frame.current++

    const time = flow.current
    for (let i = 0; i < COUNT; i++) {
      let t = phase[i] + time
      t -= Math.floor(t) // frac, 0 at top .. 1 at bottom
      const y = RIVER_TOP - t * SPAN

      const lane = laneXAt(p, base[i], channel[i])
      const wob1 = Math.sin(time * 6.28 * wFreq[i] + wPhase[i])
      const x = lane + wob1 * wob * 0.5
      const z = Math.cos(time * 6.28 * wFreq[i] * 0.7 + wPhase[i]) * wob * 0.7

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      if (updateColor) {
        // Hue tracks progress, with a slight lead/lag by vertical position for richness.
        gradientColorAt(p + (0.5 - t) * 0.06, scratch)
        const bright = channelBrightnessAt(p, channel[i])
        if (bright < 0.999) scratch.lerp(FADE, 1 - bright)
        colors[i * 3] = scratch.r
        colors[i * 3 + 1] = scratch.g
        colors[i * 3 + 2] = scratch.b
      }
    }

    geometry.attributes.position.needsUpdate = true
    if (updateColor) geometry.attributes.color.needsUpdate = true
  })

  return (
    <group>
      {/* Soft additive halo behind the cores — gives the river its glow on white.
          Much smaller on mobile so the overdraw stays cheap but the glow remains. */}
      <points geometry={geometry}>
        <pointsMaterial
          map={sprite}
          size={isMobile ? 0.6 : 1.05}
          vertexColors
          transparent
          opacity={isMobile ? 0.18 : 0.28}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>
      {/* Crisp cores — true color, normal blending so white stays white. */}
      <points geometry={geometry}>
        <pointsMaterial
          map={sprite}
          size={isMobile ? 0.46 : 0.42}
          vertexColors
          transparent
          opacity={0.95}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.NormalBlending}
          toneMapped={false}
        />
      </points>
    </group>
  )
}
