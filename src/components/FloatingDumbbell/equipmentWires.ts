import {
  BufferGeometry,
  Float32BufferAttribute,
  Uint32BufferAttribute,
  Vector3,
} from 'three'

type Stroke = {
  points: Vector3[]
  normals: Vector3[]
  closed: boolean
}

const sphereR = 1
const hideR = sphereR - 0.01

function strokesToGeometry(strokes: Stroke[]) {
  const position: number[] = []
  const normal: number[] = []
  const dir: number[] = []
  const side: number[] = []
  const end: number[] = []
  const indices: number[] = []

  const add = (p: Vector3, n: Vector3, d: Vector3, s: number, e: number) => {
    position.push(p.x, p.y, p.z)
    normal.push(n.x, n.y, n.z)
    dir.push(d.x, d.y, d.z)
    side.push(s)
    end.push(e)
  }

  for (const stroke of strokes) {
    const count = stroke.points.length
    const segments = stroke.closed ? count : count - 1
    for (let i = 0; i < segments; i++) {
      const j = stroke.closed ? (i + 1) % count : i + 1
      const a = stroke.points[i]
      const b = stroke.points[j]
      const d = new Vector3().subVectors(b, a)
      if (d.lengthSq() < 1e-10) continue
      const base = position.length / 3
      add(a, stroke.normals[i], d, -1, -1)
      add(a, stroke.normals[i], d, 1, -1)
      add(b, stroke.normals[j], d, -1, 1)
      add(b, stroke.normals[j], d, 1, 1)
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(position, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normal, 3))
  geometry.setAttribute('dir', new Float32BufferAttribute(dir, 3))
  geometry.setAttribute('side', new Float32BufferAttribute(side, 1))
  geometry.setAttribute('end', new Float32BufferAttribute(end, 1))
  geometry.setIndex(new Uint32BufferAttribute(indices, 1))
  geometry.computeBoundingBox()
  return geometry
}

function sphereStrokes(radius: number, meridians: number, parallels: number) {
  const strokes: Stroke[] = []

  for (let i = 1; i < parallels; i++) {
    const phi = (i / parallels) * Math.PI
    const y = Math.cos(phi) * radius
    const ring = Math.sin(phi) * radius
    const points: Vector3[] = []
    const normals: Vector3[] = []
    for (let j = 0; j < meridians; j++) {
      const theta = (j / meridians) * Math.PI * 2
      const point = new Vector3(
        Math.cos(theta) * ring,
        y,
        Math.sin(theta) * ring,
      )
      points.push(point)
      normals.push(point.clone().normalize())
    }
    strokes.push({ points, normals, closed: true })
  }

  for (let j = 0; j < meridians; j++) {
    const theta = (j / meridians) * Math.PI * 2
    const points: Vector3[] = []
    const normals: Vector3[] = []
    for (let i = 0; i <= parallels; i++) {
      const phi = (i / parallels) * Math.PI
      const ring = Math.sin(phi) * radius
      const point = new Vector3(
        Math.cos(theta) * ring,
        Math.cos(phi) * radius,
        Math.sin(theta) * ring,
      )
      points.push(point)
      normals.push(
        point.lengthSq() > 1e-8
          ? point.clone().normalize()
          : new Vector3(0, i === 0 ? 1 : -1, 0),
      )
    }
    strokes.push({ points, normals, closed: false })
  }

  return strokes
}

function crossT(a: Vector3, b: Vector3, radius: number) {
  const ab = new Vector3().subVectors(b, a)
  const A = ab.lengthSq()
  const B = 2 * a.dot(ab)
  const C = a.lengthSq() - radius * radius
  const disc = B * B - 4 * A * C
  if (A < 1e-12 || disc < 0) return 0.5
  const root = Math.sqrt(disc)
  const t1 = (-B - root) / (2 * A)
  const t2 = (-B + root) / (2 * A)
  if (t1 >= 0 && t1 <= 1) return t1
  if (t2 >= 0 && t2 <= 1) return t2
  return Math.min(1, Math.max(0, t1))
}

function splitVisible(points: Vector3[], normals: Vector3[], closed: boolean) {
  const count = points.length
  if (count < 2) return []
  const hidden = (point: Vector3) => point.length() < hideR
  const hide = points.map(hidden)
  if (hide.every((value) => !value)) return [{ points, normals, closed }]
  if (hide.every(Boolean)) return []

  const strokes: Stroke[] = []
  let runP: Vector3[] = []
  let runN: Vector3[] = []
  const flush = () => {
    if (runP.length >= 2) {
      strokes.push({ points: runP, normals: runN, closed: false })
    }
    runP = []
    runN = []
  }
  const push = (point: Vector3, normal: Vector3) => {
    runP.push(point)
    runN.push(normal)
  }
  const hit = (a: Vector3, b: Vector3, na: Vector3, nb: Vector3) => {
    const t = crossT(a, b, hideR)
    return {
      point: new Vector3().lerpVectors(a, b, t),
      normal: new Vector3().lerpVectors(na, nb, t).normalize(),
    }
  }

  const start = closed ? Math.max(0, hide.findIndex(Boolean)) : 0
  const steps = closed ? count : count - 1
  for (let step = 0; step < steps; step++) {
    const i = (start + step) % count
    const j = (start + step + 1) % count
    const aHidden = hide[i]
    const bHidden = hide[j]
    if (!aHidden && !bHidden) {
      if (runP.length === 0) push(points[i], normals[i])
      push(points[j], normals[j])
    } else if (!aHidden && bHidden) {
      const cut = hit(points[i], points[j], normals[i], normals[j])
      if (runP.length === 0) push(points[i], normals[i])
      push(cut.point, cut.normal)
      flush()
    } else if (aHidden && !bHidden) {
      const cut = hit(points[i], points[j], normals[i], normals[j])
      push(cut.point, cut.normal)
      push(points[j], normals[j])
    } else {
      flush()
    }
  }
  flush()
  return strokes
}

function handleStrokes() {
  const spread = 0.68
  const fillet = 0.4
  const tube = 0.158
  const joinY = 1.04
  const crownY = 2.28
  const foot = -0.92
  const radial = 16
  const archBase = crownY - spread
  const centerX = spread - fillet
  const points: Vector3[] = []

  const add = (point: Vector3) => {
    const prev = points[points.length - 1]
    if (prev && prev.distanceToSquared(point) < 1e-8) return
    points.push(point)
  }

  const filletSteps = 14
  for (let i = 0; i <= filletSteps; i++) {
    const angle = foot + (0 - foot) * (i / filletSteps)
    add(
      new Vector3(
        -(centerX + Math.cos(angle) * fillet),
        joinY + Math.sin(angle) * fillet,
        0,
      ),
    )
  }

  const legSteps = 8
  for (let i = 1; i <= legSteps; i++) {
    const y = joinY + ((archBase - joinY) * i) / legSteps
    add(new Vector3(-spread, y, 0))
  }

  const archSteps = 28
  for (let i = 1; i <= archSteps; i++) {
    const angle = Math.PI - (i / archSteps) * Math.PI
    add(
      new Vector3(
        Math.cos(angle) * spread,
        archBase + Math.sin(angle) * spread,
        0,
      ),
    )
  }

  for (let i = 1; i <= legSteps; i++) {
    const y = archBase - ((archBase - joinY) * i) / legSteps
    add(new Vector3(spread, y, 0))
  }

  for (let i = 1; i <= filletSteps; i++) {
    const angle = 0 + (foot - 0) * (i / filletSteps)
    add(
      new Vector3(
        centerX + Math.cos(angle) * fillet,
        joinY + Math.sin(angle) * fillet,
        0,
      ),
    )
  }

  const frames = points.map((point, index) => {
    const prev = points[Math.max(0, index - 1)]
    const next = points[Math.min(points.length - 1, index + 1)]
    const tangent = new Vector3().subVectors(next, prev).normalize()
    const binormal = new Vector3(0, 0, 1)
    const normal = new Vector3().crossVectors(binormal, tangent).normalize()
    return { point, normal, binormal }
  })

  const strokes: Stroke[] = []
  for (let i = 0; i < frames.length; i++) {
    const ringP: Vector3[] = []
    const ringN: Vector3[] = []
    for (let j = 0; j < radial; j++) {
      const angle = (j / radial) * Math.PI * 2
      const outward = new Vector3()
        .addScaledVector(frames[i].normal, Math.cos(angle))
        .addScaledVector(frames[i].binormal, Math.sin(angle))
      ringP.push(frames[i].point.clone().addScaledVector(outward, tube))
      ringN.push(outward)
    }
    strokes.push(...splitVisible(ringP, ringN, true))
  }

  for (let j = 0; j < radial; j++) {
    const angle = (j / radial) * Math.PI * 2
    const lineP: Vector3[] = []
    const lineN: Vector3[] = []
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    for (let i = 0; i < frames.length; i++) {
      const outward = new Vector3()
        .addScaledVector(frames[i].normal, cos)
        .addScaledVector(frames[i].binormal, sin)
      lineP.push(frames[i].point.clone().addScaledVector(outward, tube))
      lineN.push(outward)
    }
    strokes.push(...splitVisible(lineP, lineN, false))
  }

  return strokes
}

function revolveX(profile: Array<[number, number]>, segments: number) {
  const normals2 = profile.map((_, index) => {
    const prev = profile[Math.max(0, index - 1)]
    const next = profile[Math.min(profile.length - 1, index + 1)]
    let tx = next[0] - prev[0]
    let tr = next[1] - prev[1]
    const length = Math.hypot(tx, tr) || 1
    tx /= length
    tr /= length
    return { nx: -tr, nr: tx }
  })

  const strokes: Stroke[] = []
  for (let i = 0; i < profile.length; i++) {
    const radius = profile[i][1]
    if (radius < 0.012) continue
    const points: Vector3[] = []
    const normals: Vector3[] = []
    for (let s = 0; s < segments; s++) {
      const angle = (s / segments) * Math.PI * 2
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      points.push(new Vector3(profile[i][0], radius * cos, radius * sin))
      normals.push(
        new Vector3(normals2[i].nx, normals2[i].nr * cos, normals2[i].nr * sin).normalize(),
      )
    }
    strokes.push({ points, normals, closed: true })
  }

  for (let s = 0; s < segments; s++) {
    const angle = (s / segments) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const points: Vector3[] = []
    const normals: Vector3[] = []
    for (let i = 0; i < profile.length; i++) {
      const radius = profile[i][1]
      points.push(new Vector3(profile[i][0], radius * cos, radius * sin))
      normals.push(
        new Vector3(normals2[i].nx, normals2[i].nr * cos, normals2[i].nr * sin).normalize(),
      )
    }
    strokes.push({ points, normals, closed: false })
  }

  return strokes
}

function mirrorX(strokes: Stroke[]) {
  return strokes.map((stroke) => ({
    closed: stroke.closed,
    points: stroke.points.map((point) => new Vector3(-point.x, point.y, point.z)),
    normals: stroke.normals.map(
      (normal) => new Vector3(-normal.x, normal.y, normal.z),
    ),
  }))
}

function dedupe(profile: Array<[number, number]>) {
  const clean: Array<[number, number]> = []
  for (const point of profile) {
    const prev = clean[clean.length - 1]
    if (prev && Math.hypot(point[0] - prev[0], point[1] - prev[1]) < 1e-4) continue
    clean.push(point)
  }
  return clean
}

function plateProfile(
  xInner: number,
  xOuter: number,
  radius: number,
  hole: number,
  solid: boolean,
) {
  const bevel = Math.min(0.05, (xOuter - xInner) * 0.28)
  const rings = [hole, radius * 0.32, radius * 0.55, radius * 0.78, radius - bevel]
  const profile: Array<[number, number]> = rings.map((ring) => [xInner, ring])
  profile.push([xInner + bevel * 0.45, radius - bevel * 0.28])
  profile.push([xInner + bevel, radius])
  profile.push([xOuter - bevel, radius])
  profile.push([xOuter - bevel * 0.45, radius - bevel * 0.28])
  const outer = solid
    ? [radius - bevel, radius * 0.78, radius * 0.55, radius * 0.32, radius * 0.12, 0]
    : [radius - bevel, radius * 0.78, radius * 0.55, radius * 0.32, hole]
  for (const ring of outer) profile.push([xOuter, ring])
  return dedupe(profile)
}

function collarProfile(x0: number, x1: number, bar: number, hole: number) {
  const flange = hole * 1.55
  const neck = x0 + (x1 - x0) * 0.42
  const face = x1 - (x1 - x0) * 0.16
  return dedupe([
    [x0, bar],
    [neck, bar],
    [neck + 0.012, flange],
    [face, flange],
    [face, hole],
    [x1, hole],
  ])
}

function barProfile(x0: number, x1: number, radius: number, rings: number) {
  const profile: Array<[number, number]> = []
  for (let i = 0; i <= rings; i++) {
    profile.push([x0 + ((x1 - x0) * i) / rings, radius])
  }
  return profile
}

const barR = 0.132
const hole = 0.15
const grip = 0.44
const collarEnd = 0.68
const innerPlate = plateProfile(0.72, 0.96, 0.84, hole, false)
const outerPlate = plateProfile(1.07, 1.28, 0.64, 0.06, true)

export const bellBody = strokesToGeometry(sphereStrokes(sphereR, 36, 22))
export const bellHandle = strokesToGeometry(handleStrokes())
export const dumbbellWire = strokesToGeometry([
  ...revolveX(barProfile(-grip, grip, barR, 8), 18),
  ...revolveX(collarProfile(grip, collarEnd, barR, hole), 18),
  ...mirrorX(revolveX(collarProfile(grip, collarEnd, barR, hole), 18)),
  ...revolveX(innerPlate, 28),
  ...mirrorX(revolveX(innerPlate, 28)),
  ...revolveX(outerPlate, 28),
  ...mirrorX(revolveX(outerPlate, 28)),
])
