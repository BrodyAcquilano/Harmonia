import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/* Convolution surface, drawn with three.js.
   The surface starts as a uniform 1:1 sphere of mass to energy. Each expelled
   quark — each new eigenstate — adds one new frequency to the mass wave, built
   as a random sum or difference of earlier frequencies from the seeds 2/3·f_q
   and -1/3·f_q, where the quark frequency quantum f_q = (2/3)·m_q·c²/h comes
   from E = hf = mc² with m_q·c² = 2 MeV.
   Energy is the 180° (i²) partner by construction: E = 1/m, so mass peaks are
   energy troughs — no phase slider needed.
   The gold arrow is positioned by τ1/τ2: angles on the mass-wave-frequency and
   energy-wave-phase axes. The labels name the axes; the values are the angles.
   Axes are wavelength (X: λ / −λ), velocity (Y: v / −v, vertical), and the
   imaginary wavelength axis (Z: iλ / −iλ) — the phase angle is read from it.
   The wave's angle θ is measured in the λ–v plane.
   Entropy s in [0,1000000]: s = 0 is a single point; the sphere scales very
   slowly as R = min(s/100000, 1) — past s = 100000 it holds unit size and
   only the eigenstate count keeps growing. */

const D2R = Math.PI / 180
const TAU = Math.PI * 2
const AXIS_LEN = 1.32 // axes reach just past the max sphere (radius 1)
const GOLD = 0xd9a441
export const MAX_STATES = 20001

function makeLabel(text) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const g = c.getContext('2d')
  g.font = '600 62px "IBM Plex Mono", monospace'
  g.fillStyle = '#715f43'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 128, 66)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  const sp = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })
  )
  sp.scale.set(0.44, 0.22, 1)
  return sp
}

// Pseudo-random generator (mulberry32) for the frequency chain — seeded fresh
// on every page load, so each visit gets a new set of random frequencies.
function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

// Quark-state frequency seeding — every eigenstate is a direct pick from the
// 14 quark states, in units of f_q/3 (so each is an integer and every
// cos(q·θ) stays seamless around the sphere; negative frequencies are the
// same waves phase-shifted by −180°).
//
// Formation (quark formation — dark matter + dark energy), ADDED, 95%:
//   state:  −2/3  −1/3  +1/3  −4/3   −1
//   weight:  2/7   2/7   1/7   1/7  1/7
// Decay (proton decay — normal matter), SUBTRACTED, 5%:
//   state:  +2/3  +1/3  −1/3  +4/3   +1
//   weight:  2/7   2/7   1/7   1/7  1/7
// The weights count quarks: two up quarks make 2/3 twice as likely as −1/3;
// one quark, two quarks (4/3 one way, 1/3 two ways), all three (1).
// Formation wins 95 to 5 — if the split were even, formation and decay would
// cancel out. Instead eigenstates accumulate, and that is why entropy rises.
const FORMATION_STATES = [[-2, 2], [-1, 2], [1, 1], [-4, 1], [-3, 1]]
const DECAY_STATES = [[2, 2], [1, 2], [-1, 1], [4, 1], [3, 1]]

function pickWeighted(rnd, table) {
  let r = rnd() * 7 // weights in each table sum to 7
  for (const [q, w] of table) {
    r -= w
    if (r <= 0) return q
  }
  return table[table.length - 1][0]
}

// One term per eigenstate: { q, m } with m = +1 (formation, added) or
// m = −1 (decay, subtracted). Built once per page load — a fresh random
// universe each visit; within a session a given entropy builds the same
// surface (no flicker while dragging the slider).
function buildQuarkTerms(count, seed, formationOnly = false) {
  const rnd = mulberry32(seed)
  const terms = [{ q: 2, m: 1 }, { q: -1, m: 1 }] // the seeds: 2/3·f_q, −1/3·f_q
  while (terms.length < count) {
    if (formationOnly || rnd() < 0.95) terms.push({ q: pickWeighted(rnd, FORMATION_STATES), m: 1 })
    else terms.push({ q: pickWeighted(rnd, DECAY_STATES), m: -1 })
  }
  return terms
}

export const QUARK_TERMS = buildQuarkTerms(MAX_STATES, (Math.random() * 0xFFFFFFFF) >>> 0)

// The 20 base frequencies: formation-only picks from a fixed seed, matching
// the table in notes/quark-space.md — the early universe, before any decay.
export const BASE20 = buildQuarkTerms(20, 20260930, true)

// unit-surface multiplier on the sphere: the 1:1 sphere plus one mass wave
// per eigenstate. θ is the angle from +λ in the λ–v plane. The k-th
// eigenstate adds frequency q_k·(f_q/3) from the quark-state picks above;

// amplitudes fall as 1/√k — newer combinations are weaker, but every doubling
// of the eigenstate count adds the same visible structure (pink-noise
// spectrum), so raising entropy always reshapes the surface. Energy is the
// inverse, E = 1/u — the 180° partner. The −λ half
// (|θ| > π/2) is the 180° phase-shifted opposite of the +λ half: −λ gives
// −f. No absolute value — the surface dents inward where the wave goes
// negative; the 0.05 floor only stops the mesh turning inside-out.
const SGN_GAMMA = 0.618033988749895 // (sqrt(5)-1)/2

// fold θ onto the +λ half: returns [t, s] with t in [-π/2, π/2], s = -1 on
// the −λ half (the 180° phase-shifted opposite)
export function foldTheta(theta) {
  let t = theta % TAU
  if (t > Math.PI) t -= TAU
  else if (t < -Math.PI) t += TAU
  let s = 1
  if (t > Math.PI / 2) { t -= Math.PI; s = -1 }
  else if (t < -Math.PI / 2) { t += Math.PI; s = -1 }
  return [t, s]
}

// Grouped fundamental coefficients: |q_k| only takes the values 1..4 and
// cos is even, so the whole eigenstate sum is EXACTLY
//   w(t) = C_1·cos(t) + C_2·cos(2t) + C_3·cos(3t) + C_4·cos(4t)
// with C_f = Σ_{k<N, |q_k|=f} m_k·σ_k·a/√(k+1) — every eigenstate's 1/√k
// fractional weight clustered into its fundamental. One O(N) pass replaces
// N cosines per evaluation, which is what keeps N = 20001 instant.
export function waveCoeffs(N, a) {
  const C = [0, 0, 0, 0, 0] // 1-indexed by |q|
  const n = Math.min(N, QUARK_TERMS.length)
  for (let k = 0; k < n; k++) {
    // fixed +/-1 sign pattern (golden-ratio bits): spreads the peaks around
    // the circle instead of piling them at th = 0, while keeping perfect
    // left-right symmetry (unlike a phase shift)
    const sgn = (Math.floor((k + 1) * SGN_GAMMA) % 2 === 0) ? 1 : -1
    const term = QUARK_TERMS[k]
    C[Math.abs(term.q)] += term.m * sgn * (a / Math.sqrt(k + 1))
  }
  return C
}

// 4-cosine evaluation of precomputed coefficients — the fast path for
// per-vertex / per-pixel work
export function waveSumFast(t, C) {
  return C[1] * Math.cos(t) + C[2] * Math.cos(2 * t)
       + C[3] * Math.cos(3 * t) + C[4] * Math.cos(4 * t)
}

// raw signed wave sum at folded angle t (no fold, no floor) — the shared
// core used by the readouts and the arrow (a few calls per render)
export function waveSum(t, a, N) {
  return waveSumFast(t, waveCoeffs(N, a))
}

export function surfU(theta, a, N) {
  const [t, s] = foldTheta(theta)
  return Math.max(1 + s * waveSum(t, a, N), 0.05)
}

// fast surfU against precomputed coefficients — the per-vertex path
export function surfUFast(theta, C) {
  const [t, s] = foldTheta(theta)
  return Math.max(1 + s * waveSumFast(t, C), 0.05)
}

// i-th point of an n-point Fibonacci lattice on a sphere of radius r
function fibPoint(i, n, r, target) {
  if (n <= 1) return target.set(0, 0, 0)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (i / (n - 1)) * 2
  const rad = Math.sqrt(Math.max(0, 1 - y * y))
  const th = golden * i
  return target.set(r * rad * Math.cos(th), r * y, r * rad * Math.sin(th))
}

export default function ConvolutionSurface({ entropy, tau1 = 0, tau2 = 0, waveAmp = 0.04 }) {
  const mountRef = useRef(null)
  const apiRef = useRef(null)

  // ---- one-time scene setup ----
  useEffect(() => {
    const mount = mountRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    scene.add(new THREE.AmbientLight(0xffffff, 0.95))
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.6)
    sun.position.set(5, 8, 6)
    scene.add(sun)

    // coordinate axes: wavelength X (λ / −λ), velocity Y (v / −v, vertical),
    // imaginary wavelength Z (iλ / −iλ) — phase is read from this axis
    const axes = [
      { ax: 'x', color: 0xc0563f, plus: '−λ', minus: 'λ' },
      { ax: 'y', color: 0x2e8b6e, plus: 'v', minus: '−v' },
      { ax: 'z', color: 0x3f6fb5, plus: 'iλ', minus: '−iλ' },
    ]
    axes.forEach(({ ax, color, plus, minus }) => {
      const g = new THREE.BufferGeometry()
      const a = new THREE.Vector3(), b = new THREE.Vector3()
      a[ax] = -AXIS_LEN; b[ax] = AXIS_LEN
      g.setFromPoints([a, b])
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color })))
      if (plus) {
        const lab = makeLabel(plus)
        lab.position[ax] = AXIS_LEN + 0.16
        scene.add(lab)
      }
      if (minus) {
        const lab = makeLabel(minus)
        lab.position[ax] = -(AXIS_LEN + 0.16)
        scene.add(lab)
      }
    })

    // faint floor grid: the coordinate grid the sphere sits on
    const grid = new THREE.GridHelper(2.64, 16, 0xcbb37a, 0xdccfae)
    grid.material.transparent = true
    grid.material.opacity = 0.28
    grid.position.y = -AXIS_LEN
    scene.add(grid)

    // the convolution surface: semi-transparent, displaced by the wave
    // and tinted by local amplitude (green = mass high, red = energy low)
    const sphereGeo = new THREE.SphereGeometry(1, 64, 48)
    const basePos = sphereGeo.attributes.position.array.slice()
    const vCount = sphereGeo.attributes.position.count
    sphereGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(vCount * 3).fill(1), 3))
    const sphere = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffffff, transparent: true, opacity: 0.65,
        roughness: 0.35, metalness: 0.05,
        side: THREE.DoubleSide, depthWrite: false,
        vertexColors: true,
      })
    )
    const wire = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xb09a5e, wireframe: true, transparent: true, opacity: 0.18 })
    )
    scene.add(sphere, wire)

    // eigenstates: points on the surface (Fibonacci lattice)
    const posArr = new Float32Array(MAX_STATES * 3)
    const ptsGeo = new THREE.BufferGeometry()
    ptsGeo.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    const points = new THREE.Points(
      ptsGeo,
      new THREE.PointsMaterial({ color: GOLD, size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.95 })
    )
    points.geometry.setDrawRange(0, 1)
    scene.add(points)

    // origin marker
    const origin = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x3a3125 })
    )
    scene.add(origin)

    // eigenvector arrow: shaft + cone head
    const UP = new THREE.Vector3(0, 1, 0)
    const arrowMat = new THREE.MeshStandardMaterial({ color: GOLD, emissive: 0x8a6a1f, emissiveIntensity: 0.45, roughness: 0.4 })
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1, 20), arrowMat)
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.058, 1, 28), arrowMat)
    const arrow = new THREE.Group()
    arrow.add(shaft, head)
    scene.add(arrow)

    const fitCamera = () => {
      const w = Math.max(mount.clientWidth, 50)
      const h = Math.max(mount.clientHeight, 50)
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      // distance so the axes (just past the max sphere) fill the smaller view dimension
      const fov = camera.fov * D2R
      const fitH = AXIS_LEN / Math.tan(fov / 2)
      const dist = Math.max(fitH, fitH / camera.aspect)
      const dir = camera.position.clone().sub(controls.target)
      if (dir.lengthSq() < 1e-6) dir.set(1, 0.55, 1.4)
      dir.normalize()
      camera.position.copy(controls.target).addScaledVector(dir, dist)
      controls.minDistance = dist * 0.35
      controls.maxDistance = dist * 3
      controls.update()
    }

    camera.position.set(1, 0.55, 1.4).normalize()
    fitCamera()
    const ro = new ResizeObserver(fitCamera)
    ro.observe(mount)

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      controls.update()
      renderer.render(scene, camera)
    }
    loop()

    apiRef.current = { sphere, wire, points, arrow, shaft, head, UP, basePos }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose()
        if (o.material) {
          const ms = Array.isArray(o.material) ? o.material : [o.material]
          ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose() })
        }
      })
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      apiRef.current = null
    }
  }, [])

  // ---- surface rebuild: entropy / wave reshape the sphere (not the arrow) ----
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const R = Math.min(Math.max(entropy, 0) / 100000, 1)
    const N = Math.min(1 + Math.round(entropy / 50), MAX_STATES)
    const C = waveCoeffs(N, waveAmp) // one O(N) pass; vertices evaluate 4 cosines
    const { sphere, wire, points, basePos } = api

    // displace the unit-sphere vertices radially by the wave and tint by
    // amplitude (green = mass high, red = energy low)
    const posA = sphere.geometry.attributes.position
    const colA = sphere.geometry.attributes.color
    const count = posA.count
    let rMin = Infinity, rMax = -Infinity
    const radii = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = basePos[i * 3], y = basePos[i * 3 + 1], z = basePos[i * 3 + 2]
      // θ measured from +λ in the λ–v plane (+λ is at −X since the swap)
      const th = Math.atan2(y, -x)
      const r = surfUFast(th, C)
      radii[i] = r
      if (r < rMin) rMin = r
      if (r > rMax) rMax = r
      posA.setXYZ(i, x * r, y * r, z * r)
    }
    const span = rMax - rMin
    for (let i = 0; i < count; i++) {
      const t = span > 1e-6 ? (radii[i] - rMin) / span : 0.5
      colA.setXYZ(i, 1.0 - 0.35 * t, 0.65 + 0.3 * t, 0.65)
    }
    posA.needsUpdate = true
    colA.needsUpdate = true
    sphere.geometry.computeVertexNormals()

    sphere.visible = R > 1e-4
    wire.visible = R > 1e-4
    sphere.scale.setScalar(Math.max(R, 1e-4))
    wire.scale.setScalar(Math.max(R, 1e-4))

    // eigenstates: one point at s = 0, up to MAX_STATES at max entropy, riding the surface
    const attr = points.geometry.attributes.position
    const v = new THREE.Vector3()
    let n
    if (R <= 1e-4) {
      n = 1
      attr.setXYZ(0, 0, 0, 0)
    } else {
      n = N
      for (let i = 0; i < n; i++) {
        fibPoint(i, n, 1, v)
        const th = Math.atan2(v.y, -v.x)
        const rl = R * surfUFast(th, C)
        attr.setXYZ(i, v.x * rl, v.y * rl, v.z * rl)
      }
    }
    attr.needsUpdate = true
    points.geometry.setDrawRange(0, n)
    points.geometry.computeBoundingSphere()

  }, [entropy, waveAmp])

  // ---- arrow: τ1/τ2 move it to the point where the values are read, without
  // ---- rebuilding the surface (the labels name the axes)
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const R = Math.min(Math.max(entropy, 0) / 100000, 1)
    const N = Math.min(1 + Math.round(entropy / 50), MAX_STATES)
    const { arrow, shaft, head, UP } = api

    const TH = tau1 * D2R, PH = tau2 * D2R
    const u0 = surfU(TH, waveAmp, N)
    const rl = R * u0
    const P = new THREE.Vector3(
      -rl * Math.cos(PH) * Math.cos(TH),
      rl * Math.cos(PH) * Math.sin(TH),
      rl * Math.sin(PH)
    )
    const len = P.length()
    arrow.visible = len > 1e-3
    if (arrow.visible) {
      const dir = P.clone().normalize()
      const headLen = Math.min(0.2, len * 0.4)
      const shaftLen = Math.max(len - headLen, 0.001)
      shaft.scale.set(1, shaftLen, 1)
      shaft.position.copy(dir).multiplyScalar(shaftLen / 2)
      shaft.quaternion.setFromUnitVectors(UP, dir)
      head.scale.set(1, headLen, 1)
      head.position.copy(dir).multiplyScalar(shaftLen + headLen / 2)
      head.quaternion.setFromUnitVectors(UP, dir)
    }
  }, [entropy, tau1, tau2, waveAmp])

  return <div ref={mountRef} className="quark-canvas-wrap" />
}
