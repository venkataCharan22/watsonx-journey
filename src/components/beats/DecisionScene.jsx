import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import Beat from '../Beat'
import { TEXT_FONT } from '../../lib/fonts'

const VIOLET = '#8a3ffc'
const CYAN = '#3a8bff'
const INK = '#3f4a5c'

function railGeometry(toX) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -1.8, 0),
    new THREE.Vector3(toX * 0.35, -3.4, 0),
    new THREE.Vector3(toX, -5.2, 0),
  ])
  return new THREE.TubeGeometry(curve, 40, 0.07, 8, false)
}

export default function DecisionScene() {
  const core = useRef()
  const shellA = useRef()
  const shellB = useRef()
  const leftRail = useMemo(() => railGeometry(-4.4), [])
  const rightRail = useMemo(() => railGeometry(4.4), [])

  useFrame(({ clock }) => {
    const e = clock.elapsedTime
    if (core.current) core.current.rotation.y = e * 0.6
    if (core.current) core.current.rotation.x = e * 0.25
    if (shellA.current) {
      shellA.current.rotation.y = -e * 0.4
      shellA.current.rotation.z = e * 0.2
    }
    if (shellB.current) shellB.current.rotation.x = e * 0.3
  })

  return (
    <Beat window={[0.255, 0.535]}>
      <group>
        {/* Frosted funnel — wide mouth up, tight throat down. */}
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[4.2, 0.55, 6, 48, 1, true]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive={VIOLET}
            emissiveIntensity={0.06}
            roughness={0.35}
            metalness={0}
            transparent
            opacity={0.16}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* Violet emissive throat rim. */}
        <mesh position={[0, -1.9, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.06, 12, 48]} />
          <meshBasicMaterial color={VIOLET} toneMapped={false} />
        </mesh>

        {/* Decision Agent core — violet reasoning icosahedron with shells. */}
        <group position={[-3.6, 2.9, 0.5]}>
          <pointLight color={VIOLET} intensity={6} distance={14} />
          <mesh ref={core}>
            <icosahedronGeometry args={[0.62, 0]} />
            <meshStandardMaterial
              color={VIOLET}
              emissive={VIOLET}
              emissiveIntensity={0.9}
              roughness={0.3}
              metalness={0.3}
              toneMapped={false}
            />
          </mesh>
          <mesh ref={shellA}>
            <icosahedronGeometry args={[0.95, 0]} />
            <meshBasicMaterial color={VIOLET} wireframe transparent opacity={0.35} toneMapped={false} />
          </mesh>
          <mesh ref={shellB}>
            <icosahedronGeometry args={[1.35, 0]} />
            <meshBasicMaterial color="#b794ff" wireframe transparent opacity={0.16} toneMapped={false} />
          </mesh>
          <Text font={TEXT_FONT} position={[0, 1.85, 0]} fontSize={0.34} color={VIOLET} anchorX="center" material-toneMapped={false}>
            DECISION AGENT
          </Text>
        </group>

        {/* Split guide rails to the two platforms. */}
        <mesh geometry={leftRail}>
          <meshBasicMaterial color="#b9a6e6" transparent opacity={0.5} toneMapped={false} />
        </mesh>
        <mesh geometry={rightRail}>
          <meshBasicMaterial color={CYAN} transparent opacity={0.95} toneMapped={false} />
        </mesh>

        {/* DataStage gate (left, not recommended — dim). */}
        <Gate x={-4.4} color="#9aa6bd" label="DataStage" recommended={false} />
        {/* StreamSets gate (right, recommended — bright). */}
        <Gate x={4.4} color={CYAN} label="StreamSets" recommended />
      </group>
    </Beat>
  )
}

function Gate({ x, color, label, recommended }) {
  return (
    <group position={[x, -5.4, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.05, 12, 48]} />
        <meshBasicMaterial color={color} transparent opacity={recommended ? 0.95 : 0.45} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.02, 40]} />
        <meshBasicMaterial color={color} transparent opacity={recommended ? 0.1 : 0.05} toneMapped={false} />
      </mesh>
      <Text font={TEXT_FONT} position={[0, -1.5, 0]} fontSize={0.46} color={recommended ? '#0f62fe' : INK} anchorX="center" material-toneMapped={false}>
        {label}
      </Text>
      {recommended && (
        <Text font={TEXT_FONT} position={[0, 1.35, 0]} fontSize={0.3} color="#1faa6b" anchorX="center" material-toneMapped={false}>
          RECOMMENDED
        </Text>
      )}
    </group>
  )
}
