import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import Slider from './Slider.jsx'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildQuarkTerms, waveCoeffsFromTerms, MAX_STATES } from './ConvolutionSurface.jsx'
import { HUES } from './SurfaceMap.jsx'

/* The Space-Time Domain: the same quark-frequency family as the surface, let loose
   in space and time. Each axis — x, y, z — carries its own independent
   random chain of quark frequencies (one wave per eigenstate at amplitude
   a/√k, the pink-noise family, fundamentals |q| = 1..4). Each axis fans its
   wave across its plane of motion — x and y sweep the xy plane, z sweeps
   the yz plane — so waves propagate in every direction. (z is vertical here.)
   Each point of each wave is painted by the fundamental it is most made of —
   blue 1/3 f_q, red 2/3 f_q, green 1 f_q, yellow 4/3 f_q — and the bright
   gold curve is the superposition of all three: T(s,t) = (w_x, w_y, w_z),
   the total shape. Press play and every fundamental oscillates at its own
   rate f·Ω: the waves interfere, the total shape writhes — motion created
   from waves. The first 20 components of each axis are drawn too — faint
   lines in their own fundamental's color — so the interference building
   each axis wave is visible. */

const D2R = Math.PI / 180
const SPAN = 2.2 // waves run s ∈ [-SPAN, SPAN] along each axis
const AXIS_LEN = 2.62 // axes reach just past the wave ends
const SAMPLES = 420 // points per wave
const OMEGA = (2 * Math.PI) / 8 // base rate: the f=1 fundamental cycles every 8 s at speed 1
const GOLD = 0xd9a441
// fan of propagation: each axis sweeps its wave across its plane of motion
const BLADE_DEG = [-60, -30, 0, 30, 60]
const D2R_FAN = Math.PI / 180
// per axis: propagation direction d(α) and in-plane transverse n(α)
const FAMILIES = [
  { dir: (a) => [Math.cos(a), Math.sin(a), 0], nrm: (a) => [-Math.sin(a), Math.cos(a), 0] }, // x in xy
  { dir: (a) => [Math.sin(a), Math.cos(a), 0], nrm: (a) => [Math.cos(a), -Math.sin(a), 0] }, // y in xy
  { dir: (a) => [0, Math.sin(a), Math.cos(a)], nrm: (a) => [0, Math.cos(a), -Math.sin(a)] },  // z in yz
]
const MAX_COMP = 20 // components drawn per axis
const SGN_GAMMA = 0.618033988749895 // (sqrt(5)-1)/2 — same sign pattern as the surface
const sgnK = (k) => (Math.floor((k + 1) * SGN_GAMMA) % 2 === 0) ? 1 : -1

// dominant-frequency colors, 0..1 for vertex colors
const FC = [null]
for (let f = 1; f <= 4; f++) FC.push(HUES[f].map((v) => v / 255))

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

export default function TimeDomain({ entropy, waveAmp = 0.2, playing = true, speed = 1, compCount = MAX_COMP, onPlayingChange, onSpeedChange }) {
  const mountRef = useRef(null)
  const apiRef = useRef(null)
  const playRef = useRef(playing)
  const speedRef = useRef(speed)
  const ampRef = useRef(waveAmp)
  const compCountRef = useRef(compCount)

  // one independent random frequency chain per axis — fresh each page load,
  // fixed within the session so the entropy slider never flickers
  const chains = useMemo(() => {
    const seed = () => (Math.random() * 0xffffffff) >>> 0
    return [buildQuarkTerms(MAX_STATES, seed()),
            buildQuarkTerms(MAX_STATES, seed()),
            buildQuarkTerms(MAX_STATES, seed())]
  }, [])

  const N = Math.min(1 + Math.round(Math.max(entropy, 0) / 50), MAX_STATES)
  const coeffs = useMemo(
    () => chains.map((ch) => waveCoeffsFromTerms(ch, N, waveAmp)),
    [chains, N, waveAmp]
  )
  const coeffsRef = useRef(coeffs)

  useEffect(() => { playRef.current = playing }, [playing])
  useEffect(() => { speedRef.current = speed }, [speed])
  useEffect(() => { ampRef.current = waveAmp }, [waveAmp])
  useEffect(() => { compCountRef.current = compCount }, [compCount])
  useEffect(() => { coeffsRef.current = coeffs }, [coeffs])

  // ---- one-time scene setup ----
  useEffect(() => {
    const mount = mountRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300)
    camera.up.set(0, 0, 1) // z is vertical in the space-time domain
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    scene.add(new THREE.AmbientLight(0xffffff, 0.95))
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.6)
    sun.position.set(5, 8, 6)
    scene.add(sun)

    // coordinate axes: plain x, y (vertical), z
    const axes = [
      { ax: 'x', color: 0xc0563f, plus: 'x', minus: '−x' },
      { ax: 'y', color: 0x2e8b6e, plus: 'y', minus: '−y' },
      { ax: 'z', color: 0x3f6fb5, plus: 'z', minus: '−z' },
    ]
    axes.forEach(({ ax, color, plus, minus }) => {
      const g = new THREE.BufferGeometry()
      const a = new THREE.Vector3(), b = new THREE.Vector3()
      a[ax] = -AXIS_LEN; b[ax] = AXIS_LEN
      g.setFromPoints([a, b])
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color })))
      const lab = makeLabel(plus)
      lab.position[ax] = AXIS_LEN + 0.16
      scene.add(lab)
      const lab2 = makeLabel(minus)
      lab2.position[ax] = -(AXIS_LEN + 0.16)
      scene.add(lab2)
    })

    // faint floor grid
    const grid = new THREE.GridHelper(AXIS_LEN * 2, 20, 0xcbb37a, 0xdccfae)
    grid.material.transparent = true
    grid.material.opacity = 0.28
    grid.rotation.x = Math.PI / 2 // lie in the xy plane — z is vertical
    grid.position.z = -AXIS_LEN
    scene.add(grid)

    // fan of propagation: each axis sweeps its wave across its plane of
    // motion, vertex-colored by dominant fundamental
    const blades = []
    for (let a = 0; a < 3; a++) {
      for (const deg of BLADE_DEG) {
        const al = deg * D2R_FAN
        const geo = new THREE.BufferGeometry()
        const pos = new Float32Array(SAMPLES * 3)
        const col = new Float32Array(SAMPLES * 3)
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
        geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6)
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
          vertexColors: true, transparent: true, opacity: 0.9,
        }))
        line.frustumCulled = false
        scene.add(line)
        blades.push({ a, d: FAMILIES[a].dir(al), n: FAMILIES[a].nrm(al), pos, col, line })
      }
    }

    // the components: the first MAX_COMP eigenstate waves of each axis' own
    // chain — faint lines in their own fundamental's color, so the interference
    // building each axis wave is visible
    const compLines = []
    {
      // `chains` is memoized once and never changes, so the setup closure's
      // copy is the live one
      for (let a = 0; a < 3; a++) {
        for (let k = 0; k < MAX_COMP; k++) {
          const term = chains[a][k]
          const qAbs = Math.abs(term.q)
          const geo = new THREE.BufferGeometry()
          const pos = new Float32Array(SAMPLES * 3)
          geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
          geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6)
          const hue = HUES[qAbs]
          const line = new THREE.Line(geo, new THREE.LineBasicMaterial({
            color: new THREE.Color(hue[0] / 255, hue[1] / 255, hue[2] / 255),
            transparent: true, opacity: 0.7,
          }))
          line.frustumCulled = false
          scene.add(line)
          compLines.push({ a, k, qAbs, m: term.m, pos, line })
        }
      }
    }

    // the superposition: T(s,t) = (w_x, w_y, w_z) — bright gold line + points
    const totGeo = new THREE.BufferGeometry()
    const totPos = new Float32Array(SAMPLES * 3)
    totGeo.setAttribute('position', new THREE.BufferAttribute(totPos, 3))
    totGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6)
    const totLine = new THREE.Line(totGeo, new THREE.LineBasicMaterial({
      color: 0x8a6a1f, transparent: true, opacity: 0.9,
    }))
    totLine.frustumCulled = false
    const totPts = new THREE.Points(totGeo, new THREE.PointsMaterial({
      color: GOLD, size: 0.05, sizeAttenuation: true,
      transparent: true, opacity: 0.95,
    }))
    totPts.frustumCulled = false
    scene.add(totLine, totPts)

    // origin marker
    const origin = new THREE.Mesh(
      new THREE.SphereGeometry(0.028, 16, 12),
      new THREE.MeshBasicMaterial({ color: 0x3a3125 })
    )
    scene.add(origin)

    // time readout, updated imperatively (no react re-render per frame)
    const timeTag = document.createElement('div')
    timeTag.className = 'sim-clock'
    mount.appendChild(timeTag)

    // per-sample wave values, shared by the axis waves and the total curve
    const wv = [new Float32Array(SAMPLES), new Float32Array(SAMPLES), new Float32Array(SAMPLES)]
    // per-axis dominant-fundamental colors (same for every blade of the axis)
    const cc = [new Float32Array(SAMPLES * 3), new Float32Array(SAMPLES * 3), new Float32Array(SAMPLES * 3)]

    const updateWaves = (t) => {
      const C3 = coeffsRef.current
      let wMax = 1e-9
      // pass 1: wave values per axis, track the max for color shading
      for (let a = 0; a < 3; a++) {
        const C = C3[a]
        const w = wv[a]
        for (let i = 0; i < SAMPLES; i++) {
          const s = -SPAN + (2 * SPAN * i) / (SAMPLES - 1)
          const ph = s - OMEGA * t // each fundamental f oscillates at f·Ω
          const c1 = C[1] * Math.cos(ph)
          const c2 = C[2] * Math.cos(2 * ph)
          const c3 = C[3] * Math.cos(3 * ph)
          const c4 = C[4] * Math.cos(4 * ph)
          const v = c1 + c2 + c3 + c4
          w[i] = v
          const av = Math.abs(v)
          if (av > wMax) wMax = av
        }
      }
      // pass 2: dominant-frequency colors, once per axis
      for (let a = 0; a < 3; a++) {
        const C = C3[a]
        const col = cc[a]
        for (let i = 0; i < SAMPLES; i++) {
          const s = -SPAN + (2 * SPAN * i) / (SAMPLES - 1)
          const ph = s - OMEGA * t
          const c1 = C[1] * Math.cos(ph)
          const c2 = C[2] * Math.cos(2 * ph)
          const c3 = C[3] * Math.cos(3 * ph)
          const c4 = C[4] * Math.cos(4 * ph)
          // dominant fundamental paints the point
          let f = 1, best = Math.abs(c1)
          if (Math.abs(c2) > best) { f = 2; best = Math.abs(c2) }
          if (Math.abs(c3) > best) { f = 3; best = Math.abs(c3) }
          if (Math.abs(c4) > best) { f = 4 }
          // shade toward white where the wave is weak — like the flat map
          const b = 0.3 + 0.7 * Math.min(1, Math.abs(wv[a][i]) / wMax)
          const hue = FC[f]
          const o = i * 3
          col[o] = 1 - (1 - hue[0]) * b
          col[o + 1] = 1 - (1 - hue[1]) * b
          col[o + 2] = 1 - (1 - hue[2]) * b
        }
      }
      // pass 3: fan blades — p(s) = s·d + w(s,t)·n
      for (const b of blades) {
        const w = wv[b.a]
        const col = cc[b.a]
        const pos = b.pos
        b.col.set(col)
        for (let i = 0; i < SAMPLES; i++) {
          const s = -SPAN + (2 * SPAN * i) / (SAMPLES - 1)
          const v = w[i]
          const o = i * 3
          pos[o] = s * b.d[0] + v * b.n[0]
          pos[o + 1] = s * b.d[1] + v * b.n[1]
          pos[o + 2] = s * b.d[2] + v * b.n[2]
        }
        b.line.geometry.attributes.position.needsUpdate = true
        b.line.geometry.attributes.color.needsUpdate = true
      }
      // the superposition: the three waves as one shape
      for (let i = 0; i < SAMPLES; i++) {
        const t3 = i * 3
        totPos[t3] = wv[0][i]
        totPos[t3 + 1] = wv[1][i]
        totPos[t3 + 2] = wv[2][i]
      }
      totGeo.attributes.position.needsUpdate = true

      // components: v_k = m_k·σ_k·(a/√(k+1))·cos(|q_k|·(s − Ωt))
      const nComp = Math.min(compCountRef.current, MAX_COMP)
      const amp = ampRef.current
      for (const c of compLines) {
        const show = c.k < nComp
        c.line.visible = show
        if (!show) continue
        const ak = c.m * sgnK(c.k) * (amp / Math.sqrt(c.k + 1))
        const q = c.qAbs
        const pos = c.pos
        for (let i = 0; i < SAMPLES; i++) {
          const s = -SPAN + (2 * SPAN * i) / (SAMPLES - 1)
          const v = ak * Math.cos(q * (s - OMEGA * t))
          const o = i * 3
          if (c.a === 0) { pos[o] = s; pos[o + 1] = v; pos[o + 2] = 0 }
          else if (c.a === 1) { pos[o] = v; pos[o + 1] = s; pos[o + 2] = 0 }
          else { pos[o] = 0; pos[o + 1] = v; pos[o + 2] = s }
        }
        c.line.geometry.attributes.position.needsUpdate = true
      }
    }

    const fitCamera = () => {
      const w = Math.max(mount.clientWidth, 50)
      const h = Math.max(mount.clientHeight, 50)
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
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
    let t = 0
    let last = performance.now()
    const clock = () => {
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      return dt
    }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (playRef.current) t += clock() * speedRef.current
      else clock()
      updateWaves(t)
      timeTag.textContent = 't = ' + t.toFixed(1) + ' s'
      controls.update()
      renderer.render(scene, camera)
    }
    loop()

    apiRef.current = { updateWaves }

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      controls.dispose()
      mount.removeChild(timeTag)
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

  return (
    <div className="sim-stage-col">
      <div ref={mountRef} className="quark-canvas-wrap" />
      <div className="sim-transport">
        <button
          className="sim-item transport-play"
          onClick={() => onPlayingChange && onPlayingChange(!playing)}
          aria-pressed={playing}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <div className="transport-speed">
          <Slider label="speed" value={speed} min={0.1} max={3} step={0.1}
            onChange={(v) => onSpeedChange && onSpeedChange(v)} format={(v) => `${v.toFixed(1)}×`} />
        </div>
      </div>
    </div>
  )
}
