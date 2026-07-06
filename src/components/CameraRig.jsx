import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

// Camera positions keyed to progress (0..1). Subtle, confident moves — the river
// does the travelling; the camera breathes.
const camPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3.2, 31), // open
  new THREE.Vector3(0, 2.4, 26), // problem in
  new THREE.Vector3(1.6, 1.4, 22.5), // problem weave
  new THREE.Vector3(0.2, 0.6, 18), // decide approach (push toward funnel)
  new THREE.Vector3(-2.6, 0.7, 15.2), // arc past the Decision core
  new THREE.Vector3(1.8, 0.6, 17), // settle on the split (bias right)
  new THREE.Vector3(3.4, 1.0, 20.5), // migrate: dolly across the DAG
  new THREE.Vector3(1.2, 1.4, 23), // migrate end
  new THREE.Vector3(0, 3.0, 29), // modern: crane back
  new THREE.Vector3(0, 4.0, 34), // end hero
])

const lookPath = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 3.6, 0),
  new THREE.Vector3(0, 2.0, 0),
  new THREE.Vector3(0, 1.0, 0),
  new THREE.Vector3(0, 0.2, 0),
  new THREE.Vector3(0.2, 0.4, 0),
  new THREE.Vector3(0.9, 0.0, 0),
  new THREE.Vector3(1.6, 0.0, 0),
  new THREE.Vector3(0.6, 0.2, 0),
  new THREE.Vector3(0, 1.0, 0),
  new THREE.Vector3(0, 1.6, 0),
])

export default function CameraRig() {
  const { camera, size } = useThree()
  const pos = useRef(new THREE.Vector3(0, 3.2, 31))
  const look = useRef(new THREE.Vector3(0, 3.6, 0))
  const tPos = useRef(new THREE.Vector3())
  const tLook = useRef(new THREE.Vector3())

  useFrame((_, delta) => {
    if (useStore.getState().inDeepDive) return // occluded by the deep-dive — freeze
    const { damp } = useStore.getState()
    damp(delta)
    const progress = useStore.getState().progress
    const p = Math.min(0.9999, progress)

    camPath.getPoint(p, tPos.current)
    lookPath.getPoint(p, tLook.current)

    // Portrait / phone screens: the scene is composed wide, so dolly the camera
    // back (subject fits the narrow FOV without clipping) and drop the look
    // target so the 3D rises above the bottom-sheet caption.
    const aspect = size.width / Math.max(1, size.height)
    if (aspect < 0.95) {
      const t = Math.min(1, (0.95 - aspect) / 0.5) // 0..1, stronger as it narrows
      const zoom = 1 + t * 0.9
      tPos.current.sub(tLook.current).multiplyScalar(zoom).add(tLook.current)
      tLook.current.y -= t * 3.4
    }

    // Faster settle through the funnel hand-off so the push-in feels deliberate.
    const k = progress > 0.28 && progress < 0.54 ? 0.06 : 0.035
    pos.current.lerp(tPos.current, k)
    look.current.lerp(tLook.current, k)

    camera.position.copy(pos.current)
    camera.lookAt(look.current)
  })

  return null
}
