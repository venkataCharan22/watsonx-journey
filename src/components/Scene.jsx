import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import Background from './Background'
import River from './River'
import LegacyTangle from './beats/LegacyTangle'
import DecisionScene from './beats/DecisionScene'
import FlowGraph from './beats/FlowGraph'
import ModernFlow from './beats/ModernFlow'
import { useStore } from '../store'
import { gradientColorAt } from '../lib/gradient'

// A single accent point light that takes on the active beat's hue and spills
// premium color onto the white scene.
function BeatLight() {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current || useStore.getState().inDeepDive) return
    gradientColorAt(useStore.getState().progress, ref.current.color)
  })
  return <pointLight ref={ref} position={[2, 3, 10]} intensity={1.6} distance={40} decay={0.6} />
}

function SceneContent() {
  return (
    <>
      <CameraRig />
      <BeatLight />

      <hemisphereLight args={['#ffffff', '#e3ebf8', 0.95]} />
      <directionalLight position={[-7, 11, 9]} intensity={0.55} color="#ffffff" />

      <Background />
      <River />

      <Suspense fallback={null}>
        <LegacyTangle />
        <DecisionScene />
        <FlowGraph />
        <ModernFlow />
      </Suspense>

      <fog attach="fog" args={['#eef3fb', 42, 120]} />
    </>
  )
}

export default function Scene() {
  return (
    <Canvas
      camera={{ fov: 58, near: 0.1, far: 220, position: [0, 3.2, 31] }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.0
      }}
      style={{ width: '100%', height: '100%', touchAction: 'pan-y' }}
    >
      <color attach="background" args={['#fbfcff']} />
      <SceneContent />
    </Canvas>
  )
}
