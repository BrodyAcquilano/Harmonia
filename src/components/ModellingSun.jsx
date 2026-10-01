import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Slider from './Slider.jsx'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/* Modelling the Sun: the Color Theory 3D surface, but every quark frequency
   is shifted to the visible spectrum by the frequency modulation the Sun's
   mass and temperature would produce. Quarks fire inside a smaller inner
   sphere we can't see; their waves travel outward at their normal speed
   through the temperature gradient and get frequency-shifted as they climb.
   What we see on the surface is where each frequency lands: the actual
   visible spectrum. Anything landing below it burns dark red (infrared);
   anything above burns light purple (ultraviolet). The surface itself is
   normalized — relative emission only, rippling as wavefronts cross it —
   the one thing the gradient changes is the color. */

// one frequency quantum per expelled quark: f_q = (2/3)·m_q·c²/h, m_q·c² = 2 MeV
const FQ = (2 / 3) * 2e6 / 4.135667696e-15 // Hz

// the actual visible spectrum, fixed — no shifting scale here
const VIS_LO = 4.0e14   // infrared cutoff, Hz
const VIS_HI = 7.89e14  // ultraviolet cutoff, Hz
const IR_RGB = [110, 20, 20]
const UV_RGB = [216, 191, 216]
const VISIBLE_STOPS = [
  [255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 200, 0],
  [0, 200, 255], [0, 0, 255], [139, 0, 255],
]
function rainbow(t) {
  const tc = Math.max(0, Math.min(1, t))
  const x = tc * (VISIBLE_STOPS.length - 1)
  const i = Math.min(VISIBLE_STOPS.length - 2, Math.floor(x))
  const f = x - i
  const a = VISIBLE_STOPS[i], b = VISIBLE_STOPS[i + 1]
  return [
    Math.round(a[0] + (b[0] - a[0]) * f),
    Math.round(a[1] + (b[1] - a[1]) * f),
    Math.round(a[2] + (b[2] - a[2]) * f),
  ]
}
function visibleColor(nu) {
  if (nu <= VIS_LO) return IR_RGB.slice()
  if (nu >= VIS_HI) return UV_RGB.slice()
  return rainbow((nu - VIS_LO) / (VIS_HI - VIS_LO))
}

// the end-to-end modulation from the FM note's color table — the
// non-linear modulator, log-log piecewise through the three anchors
const ANCHORS = [
  [FQ / 3, 2.509e5],      // 1/3 f_q -> red
  [(2 * FQ) / 3, 4.158e5], // 2/3 f_q -> yellow
  [(4 * FQ) / 3, 6.739e5], // 4/3 f_q -> blue
]
function finalMod(nu) {
  const pts = ANCHORS.map(([n, m]) => [Math.log10(n), Math.log10(m)])
  const x = Math.log10(nu)
  let i = 0
  if (x <= pts[0][0]) i = 0
  else if (x >= pts[2][0]) i = 1
  else i = x < pts[1][0] ? 0 : 1
  const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]
  const s = (y1 - y0) / (x1 - x0)
  return Math.pow(10, y0 + s * (x - x0))
}

// sim constants — same wave settings as the Color Theory 3D surface:
// normalized, relative emission; only the color mapping is new
const C = 1.0 // wave speed, units per sim-second — normal speed, not slowed
const LAMBDA0 = 0.9
const SIG_R = 0.45
const DECAY_TAU = 2.0
const MAX_PULSES = 48
const DIE_R = 7.5
const SURF_R0 = 2.3 // the visible surface — the photosphere
const SURF_G = 2.5
const SURF_SEG = 56
const SURF_RINGS = 40
const R_IN = 0.9 // the hidden inner sphere where quarks fire — we can't see it

// |q| weights from the quark-state picks, as in the other quark labs
function pickQ() {
  const r = Math.random()
  if (r < 3 / 7) return 1
  if (r < 5 / 7) return 2
  if (r < 6 / 7) return 3
  return 4
}

function Transport({ playing, speed, onPlayingChange, onSpeedChange }) {
  return (
    <div className="sim-transport">
      <button
        className="sim-item transport-play"
        onClick={() => onPlayingChange(!playing)}
        aria-pressed={playing}
      >
        {playing ? 'Pause' : 'Play'}
      </button>
      <div className="transport-speed">
        <Slider label="speed" value={speed} min={0.1} max={3} step={0.1}
          onChange={(v) => onSpeedChange(v)} format={(v) => `${v.toFixed(1)}×`} />
      </div>
    </div>
  )
}

function setupScene(mount) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.domElement.style.display = 'block'
  mount.appendChild(renderer.domElement)
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300)
  camera.up.set(0, 0, 1)
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  scene.add(new THREE.AmbientLight(0xffffff, 0.95))
  const sun = new THREE.DirectionalLight(0xfff2d0, 1.6)
  sun.position.set(5, 8, 6)
  scene.add(sun)
  const timeTag = document.createElement('div')
  timeTag.className = 'sim-clock'
  mount.appendChild(timeTag)
  const fitCamera = () => {
    const w = Math.max(mount.clientWidth, 50)
    const h = Math.max(mount.clientHeight, 50)
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const fov = camera.fov * Math.PI / 180
    const fitH = 2.62 / Math.tan(fov / 2)
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
  return { renderer, scene, camera, controls, timeTag, ro, mount }
}

function disposeScene(s) {
  s.ro.disconnect()
  s.controls.dispose()
  s.mount.removeChild(s.timeTag)
  s.scene.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) {
      const ms = Array.isArray(o.material) ? o.material : [o.material]
      ms.forEach((m) => { if (m.map) m.map.dispose(); m.dispose() })
    }
  })
  s.renderer.dispose()
  s.mount.removeChild(s.renderer.domElement)
}

// Where the frequencies land: the actual visible spectrum as a number line,
// with the three fundamentals marked where they land after modulation,
// and the attenuation distribution of each frequency below it.
function SunNumberLine() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    const draw = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const padL = 16, padR = 16
      const iw = w - padL - padR
      const X = (t) => padL + t * iw

      // ---- the actual visible spectrum ----
      const AX_LO = 3.8e14, AX_HI = 8.1e14
      const barY = 34, barH = 26
      const grad = ctx.createLinearGradient(padL, 0, padL + iw, 0)
      for (let i = 0; i <= 72; i++) {
        const nu = AX_LO + (i / 72) * (AX_HI - AX_LO)
        grad.addColorStop(i / 72, rgb(visibleColor(nu)))
      }
      ctx.fillStyle = grad
      ctx.fillRect(padL, barY, iw, barH)
      ctx.strokeStyle = 'rgba(107,90,62,0.35)'
      ctx.strokeRect(padL, barY, iw, barH)
      const tOf = (nu) => (nu - AX_LO) / (AX_HI - AX_LO)
      // cutoff ticks
      ctx.fillStyle = 'rgba(255,255,255,0.75)'
      ctx.fillRect(X(tOf(VIS_LO)) - 1, barY, 2, barH)
      ctx.fillRect(X(tOf(VIS_HI)) - 1, barY, 2, barH)
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.fillStyle = '#715f43'
      ctx.textAlign = 'left'
      ctx.fillText('infrared cutoff · 4.00e14 Hz', padL, barY - 8)
      ctx.textAlign = 'right'
      ctx.fillText('ultraviolet cutoff · 7.89e14 Hz', padL + iw, barY - 8)

      // the three fundamentals, where they land after modulation
      const marks = [
        { name: '1/3 f_q', nu: FQ / 3, att: 2.509e5 },
        { name: '2/3 f_q', nu: (2 * FQ) / 3, att: 4.158e5 },
        { name: '4/3 f_q', nu: (4 * FQ) / 3, att: 6.739e5 },
      ]
      ctx.textAlign = 'center'
      for (const m of marks) {
        const nuOut = m.nu / finalMod(m.nu)
        const x = X(tOf(nuOut))
        ctx.strokeStyle = 'rgba(58,49,37,0.9)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(x, barY)
        ctx.lineTo(x, barY + barH + 8)
        ctx.stroke()
        ctx.lineWidth = 1
        ctx.fillStyle = '#4a3f2c'
        ctx.fillText(m.name, x, barY + barH + 24)
        ctx.fillStyle = '#715f43'
        ctx.fillText('÷' + m.att.toExponential(1).replace('e+', '×10^'), x, barY + barH + 40)
      }

      // ---- attenuation distribution of each frequency ----
      const plotY = 168, plotH = 150
      const Q_LO = 1.0e20, Q_HI = 4.4e20
      const qx = (nu) => padL + ((nu - Q_LO) / (Q_HI - Q_LO)) * iw
      const A_LO = 2e5, A_HI = 8e5
      const ay = (a) => plotY + plotH - ((Math.log10(a) - Math.log10(A_LO)) / (Math.log10(A_HI) - Math.log10(A_LO))) * plotH
      // area under the curve, filled with the quark colors
      const qgrad = ctx.createLinearGradient(padL, 0, padL + iw, 0)
      qgrad.addColorStop(0, rgb([220, 30, 30], 0.55))
      qgrad.addColorStop(0.38, rgb([240, 200, 20], 0.55))
      qgrad.addColorStop(0.68, rgb([0, 190, 140], 0.55))
      qgrad.addColorStop(1, rgb([50, 90, 255], 0.55))
      ctx.beginPath()
      ctx.moveTo(qx(Q_LO), ay(A_LO))
      const N = 80
      for (let i = 0; i <= N; i++) {
        const nu = Q_LO + (i / N) * (Q_HI - Q_LO)
        ctx.lineTo(qx(nu), ay(finalMod(nu)))
      }
      ctx.lineTo(qx(Q_HI), ay(A_LO))
      ctx.closePath()
      ctx.fillStyle = qgrad
      ctx.fill()
      // the curve on top
      ctx.beginPath()
      for (let i = 0; i <= N; i++) {
        const nu = Q_LO + (i / N) * (Q_HI - Q_LO)
        const x = qx(nu), y = ay(finalMod(nu))
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(74,63,44,0.9)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.lineWidth = 1
      // the three anchor points
      for (const m of marks) {
        const x = qx(m.nu), y = ay(m.att)
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#3a3125'
        ctx.fill()
        ctx.fillStyle = '#4a3f2c'
        ctx.fillText(m.name + ' ÷' + m.att.toExponential(1).replace('e+', '×10^'), x, y - 10)
      }
      // axes
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, plotY + plotH)
      ctx.lineTo(padL + iw, plotY + plotH)
      ctx.stroke()
      ctx.fillStyle = '#715f43'
      ctx.textAlign = 'left'
      ctx.fillText('quark frequency →', padL, plotY + plotH + 16)
      ctx.fillText('1.07e20 Hz', padL, plotY + plotH + 32)
      ctx.textAlign = 'right'
      ctx.fillText('4.30e20 Hz', padL + iw, plotY + plotH + 32)
      ctx.textAlign = 'left'
      ctx.fillText('attenuation ↑', padL, plotY - 8)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return (
    <div className="graph-box">
      <div className="graph-title-row">
        <h2 className="graph-title">Where the frequencies land</h2>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 392 }}>
        <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <p className="graph-note">
        The actual visible spectrum — not our display convention — with the
        three fundamentals marked where they land after the trip through the
        temperature gradient: 1/3 f_q in the red, 2/3 f_q in the yellow,
        4/3 f_q in the blue, each labeled with how far it was divided down.
        Below, the attenuation each frequency suffers: the non-linear
        modulator, rising with frequency — the higher the input, the harder
        it gets divided.
      </p>
    </div>
  )
}

export default function ModellingSun({
  entropy = 60000,
  waveAmp = 0.2,
  decay = 0.35,
}) {
  const mountRef = useRef(null)
  // its own clock — starts paused, like every animated graph
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const ctlRef = useRef({})
  ctlRef.current = { playing, speed, entropy, waveAmp, decay }
  const dirtyRef = useRef(true)
  // a paused surface re-renders once when a parameter changes, then rests
  useEffect(() => { dirtyRef.current = true }, [waveAmp, decay])

  useEffect(() => {
    const S = setupScene(mountRef.current)
    S.camDirty = false
    S.controls.addEventListener('change', () => { S.camDirty = true })

    const sphGeo = new THREE.SphereGeometry(SURF_R0, SURF_SEG, SURF_RINGS)
    const sCount = sphGeo.attributes.position.count
    const sBase = new Float32Array(sphGeo.attributes.position.array)
    sphGeo.setAttribute('color',
      new THREE.BufferAttribute(new Float32Array(sCount * 3).fill(1), 3))
    sphGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8)
    const sph = new THREE.Mesh(sphGeo,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.05 }))
    sph.frustumCulled = false
    const sphWire = new THREE.Mesh(sphGeo,
      new THREE.MeshBasicMaterial({ color: 0xb09a5e, wireframe: true, transparent: true, opacity: 0.1 }))
    sphWire.frustumCulled = false
    S.scene.add(sph, sphWire)
    const Uc = new Float32Array(sCount)

    // the pulses: quarks firing inside the hidden inner sphere, each at its
    // normal quark frequency and normal wave speed — colored once, at birth,
    // by where that frequency lands after the full trip through the gradient
    const sim = { t: 0, spawnAcc: 0, pulses: [] }
    const spawn = (t) => {
      const q = pickQ()
      const rr = R_IN * Math.cbrt(Math.random())
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      const nu = (Math.abs(q) / 3) * FQ
      sim.pulses.push({
        ox: rr * Math.sin(ph) * Math.cos(th),
        oy: rr * Math.sin(ph) * Math.sin(th),
        oz: rr * Math.cos(ph),
        k: q * 2 * Math.PI / LAMBDA0,
        lambda: LAMBDA0 / q,
        phi: Math.random() * Math.PI * 2,
        t0: t, q,
        col: visibleColor(nu / finalMod(nu)),
      })
      if (sim.pulses.length > MAX_PULSES) sim.pulses.shift()
    }
    // one pulse's field: a spherical wave in every direction — thins as
    // 1/(1+r), loses energy with the decay rate
    const field = (p, x, y, z, t, amp, decay) => {
      const dt = t - p.t0
      if (dt <= 0) return 0
      const rx = x - p.ox, ry = y - p.oy, rz = z - p.oz
      const r = Math.sqrt(rx * rx + ry * ry + rz * rz)
      const xi = r - C * dt
      if (xi > 4 * SIG_R || xi < -4 * SIG_R) return 0
      const damp = decay > 0 ? Math.exp(-decay * dt / DECAY_TAU) : 1
      return amp * Math.cos(p.k * xi + p.phi)
        * Math.exp(-(xi * xi) / (2 * SIG_R * SIG_R)) * damp / (1 + r)
    }

    const update = () => {
      const ctl = ctlRef.current
      const posA = sphGeo.attributes.position
      const colA = sphGeo.attributes.color
      const np = sim.pulses.length
      for (let v = 0; v < sCount; v++) {
        const x = sBase[v * 3], y = sBase[v * 3 + 1], z = sBase[v * 3 + 2]
        let u = 0, mr = 0, mg = 0, mb = 0
        for (let i = 0; i < np; i++) {
          const p = sim.pulses[i]
          const f = field(p, x, y, z, sim.t, ctl.waveAmp, ctl.decay)
          u += f
          // additive mix: every pulse reaching this point contributes its
          // modulated color, weighted by how strongly it reaches
          const w = Math.abs(f), c = p.col
          mr += w * c[0]; mg += w * c[1]; mb += w * c[2]
        }
        Uc[v] = u
        const mx = Math.max(mr, mg, mb)
        if (mx > 1e-6) colA.setXYZ(v, mr / mx, mg / mx, mb / mx)
        else colA.setXYZ(v, 0.93, 0.91, 0.87) // quiet — neutral
      }
      for (let v = 0; v < sCount; v++) {
        const rNew = Math.max(0.6, Math.min(4.2, SURF_R0 + SURF_G * Uc[v]))
        const f = rNew / SURF_R0
        posA.setXYZ(v, sBase[v * 3] * f, sBase[v * 3 + 1] * f, sBase[v * 3 + 2] * f)
      }
      posA.needsUpdate = true
      colA.needsUpdate = true
      sphGeo.computeVertexNormals()
    }

    let raf = 0
    let last = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const ctl = ctlRef.current
      if (ctl.playing) {
        const sdt = dt * ctl.speed
        sim.t += sdt
        // more entropy, more quark events
        sim.spawnAcc += sdt * (2 + ctl.entropy / 120000)
        while (sim.spawnAcc >= 1) {
          sim.spawnAcc -= 1
          spawn(sim.t)
        }
        for (let i = sim.pulses.length - 1; i >= 0; i--) {
          if (C * (sim.t - sim.pulses[i].t0) > DIE_R) sim.pulses.splice(i, 1)
        }
        update()
        S.timeTag.textContent = 't = ' + sim.t.toFixed(1) + ' s'
        S.controls.update()
        S.renderer.render(S.scene, S.camera)
        return
      }
      // paused: frozen — no recomputation, no renders, until the camera
      // moves or a parameter changes
      S.controls.update()
      let dirty = false
      if (S.camDirty) { S.camDirty = false; dirty = true }
      if (dirtyRef.current) { dirtyRef.current = false; dirty = true; update() }
      if (dirty) S.renderer.render(S.scene, S.camera)
    }
    update()
    loop()
    return () => {
      cancelAnimationFrame(raf)
      disposeScene(S)
    }
  }, [])

  return (
    <>
      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Modelling the Sun</h2>
        </div>
        <div className="quark-intro-body">
          <p>
            The quark frequencies don't reach us directly. In this model the
            Sun is a temperature gradient: quarks fire inside a smaller inner
            sphere, hidden from view, and their waves travel outward at their
            normal speed through the gradient — getting frequency-shifted as
            they climb, the frequency modulation from the note. What we see
            on the surface is where each frequency lands: the actual visible
            spectrum.
          </p>
          <p>
            The surface itself is normalized — relative emission only,
            rippling as wavefronts cross it. The one thing the gradient
            changes is the color: every pulse is painted by its landing
            color, dark red (infrared) for anything landing below the
            visible spectrum, light purple (ultraviolet) for anything above.
          </p>
        </div>
      </div>

      <SunNumberLine />

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">The modulated surface</h2>
        </div>
        <div className="sim-stage-col">
          <div ref={mountRef} className="quark-canvas-wrap" />
        </div>
        <p className="graph-note">
          The whole Sun at once: a sphere in 3D space sampling the total
          field — every firing summed, in every direction. Each pulse is born
          inside the hidden inner sphere at its quark frequency and wears
          the color where that frequency lands after the full trip through
          the temperature gradient. Every point on the surface takes the
          additive mix of the pulses reaching it. Press play and watch the
          colors ripple as wavefronts cross.
        </p>
        <Transport playing={playing} speed={speed} onPlayingChange={setPlaying} onSpeedChange={setSpeed} />
      </div>
    </>
  )
}
