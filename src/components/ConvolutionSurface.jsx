import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/* Convolution surface, drawn with three.js.
   The surface starts as a uniform 1:1 cylinder of mass to energy. Each expelled
   quark — each new eigenstate — adds one new frequency to the mass wave: the
   j-th eigenstate adds f_j = j·f_q, where the quark frequency quantum
   f_q = (2/3)·m_q·c²/h comes from E = hf = mc² with m_q·c² = 2 MeV.
   Energy is the 180° (i²) partner by construction: E = 1/m, so mass peaks are
   energy troughs — no phase slider needed.
   The gold arrow is positioned by τ1/τ2: angles on the mass-wave-frequency and
   energy-wave-phase axes. The labels name the axes; the values are the angles.
   Axes are wavelength (X: λ / −λ), velocity (Y: v / −v, vertical), and the
   imaginary wavelength axis (Z: iλ / −iλ) — the phase angle is read from it.
   The wave's angle θ is measured in the λ–v plane.
   Entropy s in [0,100000]: s = 0 is a single point; the vase scales very slowly as R = s/100000. */

const D2R = Math.PI / 180
const AXIS_LEN = 1.32 // axes reach just past the max vase (radius 1)
const GOLD = 0xd9a441
const MAX_STATES = 320

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

// unit-surface multiplier on the vase: the 1:1 cylinder plus one mass wave
// per eigenstate. θ runs 0..2π in the λ–iλ plane
// (λ → iλ → −λ → −iλ → λ); vfrac = |v|/c runs 0 at the equator to 1 at ±c.
// The j-th eigenstate adds frequency f_j = j·f_q (f_q the quark frequency
// quantum from E = hf = mc²). Amplitudes fall as 1/j so the sum stays
// bounded. Energy is the inverse, E = 1/u — the 180° partner. v = fλ holds
// per harmonic with one wave speed. The absolute value keeps every
// displacement outward (no dents); amplitude grows with |v|, smallest at
// the equator.
export function surfU(theta, vfrac, a, N) {
  const gamma = 0.618033988749895 // (sqrt(5)-1)/2
  let w = 0
  for (let j = 1; j <= N; j++) {
    // fixed +/-1 sign pattern (golden-ratio bits): spreads the harmonic
    // peaks around the circle instead of piling them at th = 0, while
    // keeping perfect left-right symmetry (unlike a phase shift)
    const sgn = (Math.floor(j * gamma) % 2 === 0) ? 1 : -1
    w += (a / j) * sgn * Math.cos(j * theta)
  }
  return Math.max(1 + vfrac * Math.abs(w), 0.05)
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
      { ax: 'x', color: 0xc0563f, plus: 'λ', minus: '−λ' },
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

    // faint floor grid: the coordinate grid the vase sits on
    const grid = new THREE.GridHelper(2.64, 16, 0xcbb37a, 0xdccfae)
    grid.material.transparent = true
    grid.material.opacity = 0.28
    grid.position.y = -AXIS_LEN
    scene.add(grid)

    // the convolution surface: a vase around the v axis, semi-transparent,
    // displaced radially by the wave and tinted by local amplitude
    // (green = mass high, red = energy low)
    const vaseGeo = new THREE.CylinderGeometry(1, 1, 2, 96, 32, true)
    const basePos = vaseGeo.attributes.position.array.slice()
    const vCount = vaseGeo.attributes.position.count
    vaseGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(vCount * 3).fill(1), 3))
    const vase = new THREE.Mesh(
      vaseGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffffff, transparent: true, opacity: 0.65,
        roughness: 0.35, metalness: 0.05,
        side: THREE.DoubleSide, depthWrite: false,
        vertexColors: true,
      })
    )
    const wire = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 2, 24, 10, true),
      new THREE.MeshBasicMaterial({ color: 0xb09a5e, wireframe: true, transparent: true, opacity: 0.18 })
    )
    scene.add(vase, wire)

    // eigenstates: points on the vase (golden-angle spiral, spread along v)
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
      // distance so the axes (just past the max vase) fill the smaller view dimension
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

    apiRef.current = { vase, wire, points, arrow, shaft, head, UP, basePos }

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

  // ---- per-prop update: entropy / wave / arrow ----
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const R = Math.max(entropy, 0) / 100000
    const N = Math.min(1 + Math.round(27 * Math.log(1 + entropy)), MAX_STATES)
    const { vase, wire, points, arrow, shaft, head, UP, basePos } = api

    // displace the unit-vase vertices radially by the wave and tint by
    // amplitude (green = mass high, red = energy low)
    const posA = vase.geometry.attributes.position
    const colA = vase.geometry.attributes.color
    const count = posA.count
    let rMin = Infinity, rMax = -Infinity
    const radii = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const x = basePos[i * 3], y = basePos[i * 3 + 1], z = basePos[i * 3 + 2]
      // θ in the λ–iλ plane (λ → iλ → −λ → −iλ), |v|/c = |y| with y in [-1, 1]
      const th = Math.atan2(z, x)
      const vf = Math.min(1, Math.abs(y))
      const r = surfU(th, vf, waveAmp, N)
      radii[i] = r
      if (r < rMin) rMin = r
      if (r > rMax) rMax = r
      posA.setXYZ(i, x * r, y, z * r)
    }
    const span = rMax - rMin
    for (let i = 0; i < count; i++) {
      const t = span > 1e-6 ? (radii[i] - rMin) / span : 0.5
      colA.setXYZ(i, 1.0 - 0.35 * t, 0.65 + 0.3 * t, 0.65)
    }
    posA.needsUpdate = true
    colA.needsUpdate = true
    vase.geometry.computeVertexNormals()

    vase.visible = R > 1e-4
    wire.visible = R > 1e-4
    vase.scale.setScalar(Math.max(R, 1e-4))
    wire.scale.setScalar(Math.max(R, 1e-4))

    // eigenstates: one point at s = 0, up to 320 at s = 1, riding the vase
    const attr = points.geometry.attributes.position
    let n
    if (R <= 1e-4) {
      n = 1
      attr.setXYZ(0, 0, 0, 0)
    } else {
      n = N
      for (let i = 0; i < n; i++) {
        const th = i * 2.399963229728653 // golden angle around the vase
        const y = 1 - (2 * (i + 0.5)) / n // spread along v, -1..1
        const rl = R * surfU(th, Math.abs(y), waveAmp, N)
        attr.setXYZ(i, Math.cos(th) * rl, y * R, Math.sin(th) * rl)
      }
    }
    attr.needsUpdate = true
    points.geometry.setDrawRange(0, n)
    points.geometry.computeBoundingSphere()

    // the eigenvector: τ1 moves the arrow around the vase, τ2 moves it
    // along v; the labels name the axes
    const TH = tau1 * D2R
    const vf = Math.min(1, Math.abs(tau2) / 90)
    const u0 = surfU(TH, vf, waveAmp, N)
    const rl = R * u0
    const P = new THREE.Vector3(
      rl * Math.cos(TH),
      (tau2 / 90) * R,
      rl * Math.sin(TH)
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
