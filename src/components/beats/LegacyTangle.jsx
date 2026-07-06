import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import Beat from '../Beat'
import { BEATS } from '../../lib/scene-params'
import { isMobile } from '../../lib/device'
import { TEXT_FONT } from '../../lib/fonts'

const AMBER = '#ff832b'
const AMBER_DK = '#e06f1a'

// Fewer, coarser tubes on phones — the tangle reads the same at phone size,
// for roughly half the triangles.
const STRANDS = isMobile ? 18 : 30
const TUBE_SEGS = isMobile ? 36 : 48
const RADIAL_SEGS = isMobile ? 5 : 6

function useTangle() {
  return useMemo(() => {
    const rng = mulberry32(20240617)
    const strands = []
    for (let i = 0; i < STRANDS; i++) {
      const pts = []
      const cx = (rng() - 0.5) * 7
      const cy = (rng() - 0.5) * 7 + 3
      const cz = (rng() - 0.5) * 5
      const n = 4 + Math.floor(rng() * 3)
      for (let j = 0; j < n; j++) {
        pts.push(
          new THREE.Vector3(
            cx + (rng() - 0.5) * 6,
            cy + (rng() - 0.5) * 6,
            cz + (rng() - 0.5) * 5,
          ),
        )
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.6)
      const geo = new THREE.TubeGeometry(curve, TUBE_SEGS, 0.05 + rng() * 0.05, RADIAL_SEGS, false)
      strands.push({ geo, hot: rng() > 0.6 })
    }
    return strands
  }, [])
}

export default function LegacyTangle() {
  const strands = useTangle()
  const group = useRef()

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.elapsedTime * 0.05
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.18) * 0.08
    }
  })

  return (
    <Beat window={[BEATS.problem[0] - 0.02, BEATS.decide[0] + 0.02]}>
      <group ref={group} position={[0, 0.5, 0]}>
        {strands.map((s, i) => (
          <mesh key={i} geometry={s.geo}>
            <meshStandardMaterial
              color={s.hot ? AMBER : AMBER_DK}
              emissive={AMBER}
              emissiveIntensity={s.hot ? 0.5 : 0.25}
              roughness={0.45}
              metalness={0.1}
              opacity={0.92}
            />
          </mesh>
        ))}
      </group>

      {/* labels live outside the rotating group so they always face the camera */}
      <FloatingLabel text="Informatica" position={[-5.2, 5.6, 1]} />
      <FloatingLabel text="PowerCenter" position={[5.0, 1.4, -1]} />
      <FloatingLabel text="mapping_47.xml" position={[-4.0, -2.4, 1.6]} sub />
      <FloatingLabel text="legacy_etl.wf" position={[4.4, 6.0, 0.5]} sub />
    </Beat>
  )
}

function FloatingLabel({ text, position, sub = false }) {
  return (
    <Text
      font={TEXT_FONT}
      position={position}
      fontSize={sub ? 0.42 : 0.6}
      color={sub ? '#9a6b3a' : '#7a4a18'}
      anchorX="center"
      anchorY="middle"
      outlineWidth={0}
      material-toneMapped={false}
    >
      {text}
    </Text>
  )
}

// deterministic PRNG so the tangle is identical every run
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
