import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import Beat from '../Beat'
import { useStore } from '../../store'
import { smoothstep, lerp } from '../../lib/scene-params'
import { TEXT_FONT } from '../../lib/fonts'

const CYAN = new THREE.Color('#0f62fe')
const GREEN = new THREE.Color('#1faa6b')

// Source -> Transform -> Join -> Mask -> Target, with one branch edge.
const NODES = [
  { label: 'Source', messy: [-4.2, 2.6], clean: [-5.4, -0.4] },
  { label: 'Transform', messy: [1.6, 2.3], clean: [-2.7, 1.4] },
  { label: 'Join', messy: [-3.0, -2.3], clean: [0, -1.1] },
  { label: 'Mask', messy: [3.9, -1.7], clean: [2.7, 1.4] },
  { label: 'Target', messy: [0.4, 0.5], clean: [5.4, -1.0] },
]
const EDGES = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [1, 3],
]

const Y_AXIS = new THREE.Vector3(0, 1, 0)

export default function FlowGraph() {
  const nodeRefs = useRef([])
  const nodeMat = useRef([])
  const edgeRefs = useRef([])
  const edgeMat = useRef([])
  const dotRefs = useRef([])
  const dotMat = useRef([])
  const agent = useRef()
  const gear = useRef()
  const agentMat = useRef([])
  const accent = useMemo(() => new THREE.Color(), [])
  const v = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), d: new THREE.Vector3(), q: new THREE.Quaternion() }), [])

  useFrame(({ clock }) => {
    const p = useStore.getState().progress
    const e = clock.elapsedTime
    const m = smoothstep(0.5, 0.68, p) // messy -> clean
    const flush = smoothstep(0.74, 0.92, p) // cyan -> green
    accent.copy(CYAN).lerp(GREEN, flush)

    // current node positions
    const cur = NODES.map((n) => [lerp(n.messy[0], n.clean[0], m), lerp(n.messy[1], n.clean[1], m)])

    for (let i = 0; i < NODES.length; i++) {
      const ref = nodeRefs.current[i]
      if (ref) ref.position.set(cur[i][0], cur[i][1], 0)
      const mat = nodeMat.current[i]
      if (mat) mat.emissive.copy(accent)
    }

    const edgeIn = smoothstep(0.54, 0.66, p)
    for (let k = 0; k < EDGES.length; k++) {
      const [i, j] = EDGES[k]
      v.a.set(cur[i][0], cur[i][1], 0)
      v.b.set(cur[j][0], cur[j][1], 0)
      v.d.subVectors(v.b, v.a)
      const len = v.d.length() || 0.001
      const edge = edgeRefs.current[k]
      if (edge) {
        edge.position.copy(v.a).addScaledVector(v.d, 0.5)
        v.q.setFromUnitVectors(Y_AXIS, v.d.clone().normalize())
        edge.quaternion.copy(v.q)
        edge.scale.set(1, len, 1)
      }
      const em = edgeMat.current[k]
      if (em) {
        em.color.copy(accent)
        em.opacity = 0.85 * edgeIn
      }
      // traveling data packet along the edge
      const dot = dotRefs.current[k]
      if (dot) {
        const tt = (e * 0.35 + k * 0.21) % 1
        dot.position.copy(v.a).addScaledVector(v.d, tt)
        dot.visible = edgeIn > 0.3
      }
      const dm = dotMat.current[k]
      if (dm) dm.color.copy(accent)
    }

    // Migration Agent gear core — present in migrate, recedes into modern.
    if (gear.current) gear.current.rotation.z = e * 0.5
    if (agent.current) {
      const present = smoothstep(0.5, 0.56, p) * (1 - smoothstep(0.72, 0.82, p))
      agent.current.scale.setScalar(lerp(0.0, 1, present))
      agentMat.current.forEach((mm) => mm && (mm.opacity = present))
    }
  })

  return (
    <Beat window={[0.48, 1.06]}>
      <group>
        {/* Migration Agent — a cyan "gear" core above the graph. */}
        <group ref={agent} position={[0, 3.6, -0.5]}>
          <pointLight color="#0f62fe" intensity={4} distance={12} />
          <group ref={gear}>
            <mesh>
              <torusGeometry args={[0.62, 0.16, 10, 8]} />
              <meshStandardMaterial
                ref={(r) => (agentMat.current[0] = r)}
                color="#0f62fe"
                emissive="#0f62fe"
                emissiveIntensity={0.9}
                roughness={0.3}
                metalness={0.4}
                transparent
                toneMapped={false}
              />
            </mesh>
            <mesh>
              <icosahedronGeometry args={[0.32, 0]} />
              <meshStandardMaterial
                ref={(r) => (agentMat.current[1] = r)}
                color="#7fb0ff"
                emissive="#3a8bff"
                emissiveIntensity={1}
                transparent
                toneMapped={false}
              />
            </mesh>
          </group>
          <Text
            font={TEXT_FONT}
            position={[0, 1.5, 0]}
            fontSize={0.34}
            color="#0f62fe"
            anchorX="center"
            material-toneMapped={false}
          >
            MIGRATION AGENT
          </Text>
        </group>

        {/* Edges */}
        {EDGES.map((_, k) => (
          <group key={`e${k}`}>
            <mesh ref={(r) => (edgeRefs.current[k] = r)}>
              <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
              <meshBasicMaterial
                ref={(r) => (edgeMat.current[k] = r)}
                color="#0f62fe"
                transparent
                opacity={0}
                toneMapped={false}
              />
            </mesh>
            <mesh ref={(r) => (dotRefs.current[k] = r)}>
              <sphereGeometry args={[0.11, 12, 12]} />
              <meshBasicMaterial ref={(r) => (dotMat.current[k] = r)} color="#3a8bff" toneMapped={false} />
            </mesh>
          </group>
        ))}

        {/* Nodes */}
        {NODES.map((n, i) => (
          <group key={n.label} ref={(r) => (nodeRefs.current[i] = r)}>
            <RoundedBox args={[1.7, 0.78, 0.22]} radius={0.1} smoothness={4}>
              <meshStandardMaterial
                ref={(r) => (nodeMat.current[i] = r)}
                color="#ffffff"
                emissive="#0f62fe"
                emissiveIntensity={0.35}
                roughness={0.4}
                metalness={0.1}
              />
            </RoundedBox>
            <Text
              font={TEXT_FONT}
              position={[0, 0, 0.13]}
              fontSize={0.26}
              color="#0b1220"
              anchorX="center"
              anchorY="middle"
              material-toneMapped={false}
            >
              {n.label}
            </Text>
          </group>
        ))}
      </group>
    </Beat>
  )
}
