import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Box3,
  Color,
  DoubleSide,
  MathUtils,
  Mesh,
  NoToneMapping,
  OrthographicCamera,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three'
import type { BufferGeometry, Group } from 'three'
import { dumbbellWire } from './equipmentWires'

const darkWire = '#62f6e6'
const lightWire = '#00695c'
const framePad = 1.08
const lightDir = new Vector3(-0.22, 0.72, 0.92).normalize()

const barSwing = { x: 0.09, y: 0.12, mouse: 0.18, float: 0.04 }

const vertexShader = `
  attribute vec3 dir;
  attribute float side;
  attribute float end;
  uniform vec2 uResolution;
  uniform float uWidth;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vSide;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vec3 worldDir = mat3(modelMatrix) * dir;
    vec4 clip = projectionMatrix * viewMatrix * world;
    vec4 clipEnd = projectionMatrix * viewMatrix * vec4(world.xyz + worldDir, 1.0);
    vec2 ndc = clip.xy / clip.w;
    vec2 delta = clipEnd.xy / clipEnd.w - ndc;
    float span = length(delta);
    vec2 tangent = span > 1e-6 ? delta / span : vec2(1.0, 0.0);
    vec2 across = vec2(-tangent.y, tangent.x);
    vec2 px = uWidth * 2.0 / uResolution;
    clip.xy += (across * side + tangent * end * 0.72) * px * clip.w;
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vSide = side;
    gl_Position = clip;
  }
`

const fragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uLight;
  uniform float uLift;
  varying vec3 vNormal;
  varying vec3 vWorld;
  varying float vSide;
  void main() {
    float dist = abs(vSide);
    float core = smoothstep(0.92, 0.34, dist);
    float halo = exp(-2.7 * dist * dist);
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float facing = smoothstep(-0.42, 0.78, dot(normal, viewDir));
    float light = smoothstep(-0.2, 0.9, dot(normal, normalize(uLight)));
    float shade = mix(0.4, 1.0, facing) * mix(0.58, 1.0, light);
    float stroke = mix(0.62, 1.0, core);
    vec3 color = uColor * shade * stroke;
    color += vec3(uLift) * core * shade;
    float alpha = max(core, halo * 0.46) * mix(0.5, 1.0, facing);
    if (alpha < 0.045) discard;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`

function Wire({
  geometry,
  color,
  lift,
}: {
  geometry: BufferGeometry
  color: string
  lift: number
}) {
  const size = useThree((state) => state.size)
  const dpr = useThree((state) => state.viewport.dpr)
  const material = useMemo(() => {
    const shader = new ShaderMaterial({
      uniforms: {
        uColor: { value: new Color(color) },
        uLight: { value: lightDir.clone() },
        uResolution: { value: new Vector2(1, 1) },
        uWidth: { value: 1.45 },
        uLift: { value: lift },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      premultipliedAlpha: true,
      toneMapped: false,
      side: DoubleSide,
    })
    return shader
  }, [color, lift])

  useLayoutEffect(() => {
    material.uniforms.uResolution.value.set(size.width * dpr, size.height * dpr)
    material.uniforms.uWidth.value = 1.45 * dpr
  }, [material, size.width, size.height, dpr])

  useEffect(() => () => material.dispose(), [material])

  return (
    <mesh
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  )
}

function Dumbbell({ color, lift }: { color: string; lift: number }) {
  return (
    <Wire
      color={color}
      geometry={dumbbellWire}
      lift={lift}
    />
  )
}

function Frame() {
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)

  useLayoutEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return
    const bounds = new Box3()
    scene.updateMatrixWorld(true)
    scene.traverse((obj) => {
      const mesh = obj as Mesh
      if (!mesh.isMesh) return
      const geometry = mesh.geometry
      if (!geometry.boundingBox) geometry.computeBoundingBox()
      if (!geometry.boundingBox) return
      bounds.union(geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld))
    })
    if (bounds.isEmpty()) return
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    size.x *= 1.2
    size.y *= 1.2
    camera.zoom = Math.min(
      width / (size.x * framePad),
      height / (size.y * framePad),
    )
    camera.position.set(center.x, center.y, 10)
    camera.lookAt(center.x, center.y, 0)
    camera.updateProjectionMatrix()
  }, [camera, scene, width, height])

  return null
}

function Sway({
  animate,
  pointer,
  rest,
  swing,
  children,
}: {
  animate: boolean
  pointer: { current: { x: number; y: number } }
  rest: [number, number, number]
  swing: { x: number; y: number; mouse: number; float: number }
  children: ReactNode
}) {
  const ref = useRef<Group>(null)

  useFrame((state, delta) => {
    const group = ref.current
    if (!group) return
    if (!animate) {
      group.rotation.set(rest[0], rest[1], rest[2])
      group.position.y = 0
      return
    }
    const t = state.clock.elapsedTime
    group.rotation.x = MathUtils.damp(
      group.rotation.x,
      rest[0] + Math.sin(t * 0.75) * swing.x - pointer.current.y * swing.mouse,
      5.5,
      delta,
    )
    group.rotation.y = MathUtils.damp(
      group.rotation.y,
      rest[1] + Math.sin(t * 0.52) * swing.y + pointer.current.x * swing.mouse,
      4.5,
      delta,
    )
    group.position.y = Math.sin(t * 1.05 + rest[1]) * swing.float
  })

  return (
    <group
      ref={ref}
      rotation={rest}
    >
      {children}
    </group>
  )
}

export function DumbbellScene({
  animate,
  dpr,
  dark,
  pointer,
}: {
  animate: boolean
  dpr: number
  dark: boolean
  pointer: { current: { x: number; y: number } }
}) {
  const color = dark ? darkWire : lightWire
  const lift = dark ? 0.22 : 0

  return (
    <Canvas
      orthographic
      dpr={dpr}
      frameloop={animate ? 'always' : 'demand'}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
        stencil: false,
        toneMapping: NoToneMapping,
      }}
      camera={{ position: [0, 0, 10], zoom: 50, near: 0.1, far: 40 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Frame />
      <Sway
        animate={animate}
        pointer={pointer}
        rest={[0.38, 0.72, 0.04]}
        swing={barSwing}
      >
        <Dumbbell
          color={color}
          lift={lift}
        />
      </Sway>
    </Canvas>
  )
}
