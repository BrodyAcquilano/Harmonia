import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { HUES } from './SurfaceMap.jsx'
import { energyColor, spectrumBounds } from './ColorTheory.jsx'

function Tex({ tex }) {
  const html = katex.renderToString(tex, { throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
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

/* Point Sources: the Mass Creation firing process, but every firing launches
   a wave instead of a mass. Quarks fire at random points inside the cube and
   each firing radiates a spherical wave in every direction — with a velocity
   and a decay rate. The first graph shows the individual components: every
   live pulse as its expanding wavefront shells, colored by its fundamental
   (blue 1/3 f_q, red 2/3 f_q, green 1 f_q, yellow 4/3 f_q). The second graph
   is the superposition on the z = 0 slice — a fair sample of every
   direction. The third graph is the whole: all the pulses summed into one
   surface in 3D space — a sphere sampling the total field, green where the
   total runs high, red where it runs low. Each graph runs its own clock, so
   one can play while the others stay paused. z is vertical.
   With trueColors, the same three graphs are remade for Color Theory: each
   pulse burns its energy color on the shifting spectrum, and the slice and
   surface wear the per-point additive mix of the pulses reaching them. */

const AXIS_LEN = 2.62
const HALF = 2.6 // sim cube half-size; the slice spans [-HALF, HALF]^2
const SPAWN = 1.7 // pulses are born inside [-SPAWN, SPAWN]^3
const C = 1.0 // wave speed, units per sim-second
const LAMBDA0 = 0.9 // wavelength of the q = 1 fundamental
const SIG_R = 0.45 // radial width of the wave packet
const DECAY_TAU = 2.0 // decay slider d in [0,1] damps as exp(-d·dt/DECAY_TAU)
const MAX_PULSES = 48
const DIE_R = 7.5 // a pulse dies once its front radius passes this
const SHELLS = 3 // nested wavefront shells drawn per pulse
const GRID_N = 48 // slice mesh segments per side
const SURF_R0 = 2.3 // the superposition surface is a sphere of this radius
const SURF_G = 2.5 // surface displacement gain
const SURF_SEG = 56
const SURF_RINGS = 40

const GREEN_RGB = [0x2e / 255, 0x8b / 255, 0x6e / 255]
const RED_RGB = [0xc0 / 255, 0x39 / 255, 0x2b / 255]

// |q| weights from the quark-state picks: formation gives |q| = 1 with 3/7,
// |q| = 2 with 2/7, |q| = 3 and 4 with 1/7 each
function pickQ() {
  const r = Math.random()
  if (r < 3 / 7) return 1
  if (r < 5 / 7) return 2
  if (r < 6 / 7) return 3
  return 4
}

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

function setupScene(mount) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.domElement.style.display = 'block'
  mount.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300)
  camera.up.set(0, 0, 1) // z is vertical
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08

  scene.add(new THREE.AmbientLight(0xffffff, 0.95))
  const sun = new THREE.DirectionalLight(0xfff2d0, 1.6)
  sun.position.set(5, 8, 6)
  scene.add(sun)

  // coordinate axes: plain x, y, z
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

  const fitCamera = () => {
    const w = Math.max(mount.clientWidth, 50)
    const h = Math.max(mount.clientHeight, 50)
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const fov = camera.fov * Math.PI / 180
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

export default function PointSources({
  entropy = 60000,
  waveAmp = 0.2,
  decay = 0.35,
  trueColors = false,
}) {
  const mountARef = useRef(null)
  const mountBRef = useRef(null)
  const mountCRef = useRef(null)
  // Each graph runs its own clock: its own play/pause, its own speed, its
  // own pulses. All three start paused.
  const [playingA, setPlayingA] = useState(false)
  const [speedA, setSpeedA] = useState(1)
  const [playingB, setPlayingB] = useState(false)
  const [speedB, setSpeedB] = useState(1)
  const [playingC, setPlayingC] = useState(false)
  const [speedC, setSpeedC] = useState(1)
  const ctlRef = useRef({})
  ctlRef.current = {
    playingA, speedA, playingB, speedB, playingC, speedC,
    entropy, waveAmp, decay, trueColors,
  }
  // one dirty flag per graph: a paused graph re-renders once when a
  // parameter changes, then goes quiet again
  const dirtyRef = useRef({ A: true, B: true, C: true })

  // a paused graph re-renders once when its parameters change
  useEffect(() => { dirtyRef.current = { A: true, B: true, C: true } }, [waveAmp, decay])

  useEffect(() => {
    const A = setupScene(mountARef.current)
    const B = setupScene(mountBRef.current)
    const Cc = setupScene(mountCRef.current)

    // orbit while paused: each scene re-renders when its camera moves
    for (const S of [A, B, Cc]) {
      S.camDirty = false
      S.controls.addEventListener('change', () => { S.camDirty = true })
    }

    const tmpC = new THREE.Color()

    // ---- graph A: expanding wavefront shells, one actor group per pulse slot ----
    const shellGeo = new THREE.SphereGeometry(1, 20, 14)
    const flashGeo = new THREE.SphereGeometry(0.1, 12, 10)
    const actors = []
    for (let i = 0; i < MAX_PULSES; i++) {
      const group = new THREE.Group()
      const shells = []
      for (let j = 0; j < SHELLS; j++) {
        const m = new THREE.Mesh(shellGeo,
          new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }))
        shells.push(m)
        group.add(m)
      }
      const flash = new THREE.Mesh(flashGeo,
        new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false }))
      group.add(flash)
      group.visible = false
      A.scene.add(group)
      actors.push({ group, shells, flash })
    }

    // ---- graph B: the superposition on the z = 0 slice ----
    const surfGeo = new THREE.PlaneGeometry(HALF * 2, HALF * 2, GRID_N, GRID_N)
    const vCount = surfGeo.attributes.position.count
    surfGeo.setAttribute('color',
      new THREE.BufferAttribute(new Float32Array(vCount * 3).fill(1), 3))
    surfGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8)
    const surf = new THREE.Mesh(surfGeo,
      new THREE.MeshStandardMaterial({
        vertexColors: true, roughness: 0.5, metalness: 0.05,
        side: THREE.DoubleSide,
      }))
    surf.frustumCulled = false
    const surfWire = new THREE.Mesh(surfGeo,
      new THREE.MeshBasicMaterial({
        color: 0xb09a5e, wireframe: true, transparent: true, opacity: 0.14,
      }))
    surfWire.frustumCulled = false
    B.scene.add(surf, surfWire)
    // thin square marking the slice plane
    const frameGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-HALF, -HALF, 0), new THREE.Vector3(HALF, -HALF, 0),
      new THREE.Vector3(HALF, HALF, 0), new THREE.Vector3(-HALF, HALF, 0),
    ])
    const frame = new THREE.LineLoop(frameGeo,
      new THREE.LineBasicMaterial({ color: 0xb09a5e, transparent: true, opacity: 0.5 }))
    frame.frustumCulled = false
    B.scene.add(frame)
    const U = new Float32Array(vCount)

    // ---- graph C: the superposition as one surface in 3D space ----
    const sphGeo = new THREE.SphereGeometry(SURF_R0, SURF_SEG, SURF_RINGS)
    const sCount = sphGeo.attributes.position.count
    const sBase = new Float32Array(sphGeo.attributes.position.array) // rest shape
    sphGeo.setAttribute('color',
      new THREE.BufferAttribute(new Float32Array(sCount * 3).fill(1), 3))
    sphGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8)
    const sph = new THREE.Mesh(sphGeo,
      new THREE.MeshStandardMaterial({
        vertexColors: true, roughness: 0.5, metalness: 0.05,
      }))
    sph.frustumCulled = false
    const sphWire = new THREE.Mesh(sphGeo,
      new THREE.MeshBasicMaterial({
        color: 0xb09a5e, wireframe: true, transparent: true, opacity: 0.1,
      }))
    sphWire.frustumCulled = false
    Cc.scene.add(sph, sphWire)
    const Uc = new Float32Array(sCount)

    // ---- the pulses: one independent stream per graph, each on its own clock ----
    const makeSim = () => ({ t: 0, spawnAcc: 0, pulses: [] })
    const simA = makeSim()
    const simB = makeSim()
    const simC = makeSim()
    const spawnInto = (sim, t) => {
      const q = pickQ()
      sim.pulses.push({
        ox: (Math.random() * 2 - 1) * SPAWN,
        oy: (Math.random() * 2 - 1) * SPAWN,
        oz: (Math.random() * 2 - 1) * SPAWN,
        k: q * 2 * Math.PI / LAMBDA0,
        lambda: LAMBDA0 / q,
        phi: Math.random() * Math.PI * 2,
        t0: t, q,
      })
      if (sim.pulses.length > MAX_PULSES) sim.pulses.shift()
    }

    // one pulse's field: a spherical wave in every direction — the wavefront
    // thins geometrically as 1/(1+r) and loses energy with the decay rate
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

    const updateA = (t, pulses, decay, trueColors) => {
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i]
        const ac = actors[i]
        const dt = t - p.t0
        const damp = decay > 0 ? Math.exp(-decay * dt / DECAY_TAU) : 1
        const col = trueColors ? p.col : HUES[p.q]
        tmpC.setRGB(col[0] / 255, col[1] / 255, col[2] / 255)
        ac.group.visible = true
        ac.group.position.set(p.ox, p.oy, p.oz)
        // nested wavefront shells: the crests, one wavelength apart
        for (let j = 0; j < SHELLS; j++) {
          const s = ac.shells[j]
          const rad = C * dt - j * p.lambda
          const show = rad > 0.05 && damp > 0.02
          s.visible = show
          if (show) {
            s.scale.setScalar(rad)
            s.material.color.copy(tmpC)
            s.material.opacity = 0.15 * damp * (1 - j / (SHELLS + 1))
              * Math.max(0, 1 - rad / (DIE_R * 1.2))
          }
        }
        // birth flash, gone in well under a second
        const ff = Math.max(0, 1 - dt / 0.6)
        ac.flash.visible = ff > 0
        ac.flash.material.color.copy(tmpC)
        ac.flash.material.opacity = 0.7 * ff
        ac.flash.scale.setScalar(1 + dt * 2.5)
      }
      for (let i = pulses.length; i < MAX_PULSES; i++) {
        actors[i].group.visible = false
      }
    }

    const updateB = (t, pulses, amp, decay, trueColors) => {
      const posA = surfGeo.attributes.position
      const colA = surfGeo.attributes.color
      let umax = 1e-9
      const np = pulses.length
      for (let v = 0; v < vCount; v++) {
        const x = posA.getX(v), y = posA.getY(v)
        let u = 0, mr = 0, mg = 0, mb = 0
        for (let i = 0; i < np; i++) {
          const p = pulses[i]
          const f = field(p, x, y, 0, t, amp, decay)
          u += f
          if (trueColors) {
            // additive mix: every pulse reaching this point contributes its
            // true color, weighted by how strongly it reaches
            const w = Math.abs(f), c = p.col
            mr += w * c[0]; mg += w * c[1]; mb += w * c[2]
          }
        }
        U[v] = u
        posA.setZ(v, Math.max(-HALF, Math.min(HALF, u)))
        if (trueColors) {
          const mx = Math.max(mr, mg, mb)
          if (mx > 1e-6) colA.setXYZ(v, mr / mx, mg / mx, mb / mx)
          else colA.setXYZ(v, 0.93, 0.91, 0.87) // quiet — neutral
        } else {
          const au = Math.abs(u)
          if (au > umax) umax = au
        }
      }
      if (!trueColors) {
        for (let v = 0; v < vCount; v++) {
          const u = U[v]
          // shade toward white where the total is weak — like the flat map
          const b = 0.35 + 0.65 * Math.min(1, Math.abs(u) / umax)
          const hue = u >= 0 ? GREEN_RGB : RED_RGB
          colA.setXYZ(v, 1 - (1 - hue[0]) * b, 1 - (1 - hue[1]) * b, 1 - (1 - hue[2]) * b)
        }
      }
      posA.needsUpdate = true
      colA.needsUpdate = true
      surfGeo.computeVertexNormals()
    }

    const updateC = (t, pulses, amp, decay, trueColors) => {
      const posA = sphGeo.attributes.position
      const colA = sphGeo.attributes.color
      let umax = 1e-9
      const np = pulses.length
      for (let v = 0; v < sCount; v++) {
        const x = sBase[v * 3], y = sBase[v * 3 + 1], z = sBase[v * 3 + 2]
        let u = 0, mr = 0, mg = 0, mb = 0
        for (let i = 0; i < np; i++) {
          const p = pulses[i]
          const f = field(p, x, y, z, t, amp, decay)
          u += f
          if (trueColors) {
            // additive mix: every pulse reaching this point contributes its
            // true color, weighted by how strongly it reaches
            const w = Math.abs(f), c = p.col
            mr += w * c[0]; mg += w * c[1]; mb += w * c[2]
          }
        }
        Uc[v] = u
        if (!trueColors) {
          const au = Math.abs(u)
          if (au > umax) umax = au
        }
        if (trueColors) {
          const mx = Math.max(mr, mg, mb)
          if (mx > 1e-6) colA.setXYZ(v, mr / mx, mg / mx, mb / mx)
          else colA.setXYZ(v, 0.93, 0.91, 0.87) // quiet — neutral
        }
      }
      for (let v = 0; v < sCount; v++) {
        const u = Uc[v]
        const rNew = Math.max(0.6, Math.min(4.2, SURF_R0 + SURF_G * u))
        const f = rNew / SURF_R0
        posA.setXYZ(v, sBase[v * 3] * f, sBase[v * 3 + 1] * f, sBase[v * 3 + 2] * f)
        if (!trueColors) {
          // shade toward white where the total is weak — like the flat map
          const b = 0.35 + 0.65 * Math.min(1, Math.abs(u) / umax)
          const hue = u >= 0 ? GREEN_RGB : RED_RGB
          colA.setXYZ(v, 1 - (1 - hue[0]) * b, 1 - (1 - hue[1]) * b, 1 - (1 - hue[2]) * b)
        }
      }
      posA.needsUpdate = true
      colA.needsUpdate = true
      sphGeo.computeVertexNormals()
    }

    // One animation frame drives all three graphs, but each graph keeps its
    // own clock: playing graph A never forces B or C to recompute, pausing
    // one never pauses the others, and each runs its own pulse stream.
    const runScene = (S, sim, key, playing, speed, dt, update) => {
      const ctl = ctlRef.current
      if (playing) {
        const sdt = dt * speed
        sim.t += sdt
        // more entropy, more quark events
        sim.spawnAcc += sdt * (2 + ctl.entropy / 120000)
        while (sim.spawnAcc >= 1) {
          sim.spawnAcc -= 1
          spawnInto(sim, sim.t)
        }
        for (let i = sim.pulses.length - 1; i >= 0; i--) {
          if (C * (sim.t - sim.pulses[i].t0) > DIE_R) sim.pulses.splice(i, 1)
        }
        // true colors: the spectrum bounds refit to the live pulses every
        // frame, so each pulse burns its color on the current scale
        if (ctl.trueColors) {
          const qs = []
          for (let i = 0; i < sim.pulses.length; i++) qs.push(sim.pulses[i].q)
          const b = spectrumBounds(qs)
          for (let i = 0; i < sim.pulses.length; i++) {
            sim.pulses[i].col = energyColor(sim.pulses[i].q, b)
          }
        }
        update()
        S.timeTag.textContent = 't = ' + sim.t.toFixed(1) + ' s'
        S.controls.update()
        S.renderer.render(S.scene, S.camera)
        return
      }
      // Paused: the sim clock is frozen, so the scene is static — no field
      // recomputation and no renders, until the camera moves or a parameter
      // changes. Orbiting while paused just re-renders the frozen frame.
      S.controls.update()
      let dirty = false
      if (S.camDirty) { S.camDirty = false; dirty = true }
      if (dirtyRef.current[key]) {
        dirtyRef.current[key] = false
        dirty = true
        update()
      }
      if (dirty) S.renderer.render(S.scene, S.camera)
    }
    let raf = 0
    let last = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const ctl = ctlRef.current
      runScene(A, simA, 'A', ctl.playingA, ctl.speedA, dt,
        () => updateA(simA.t, simA.pulses, ctl.decay, ctl.trueColors))
      runScene(B, simB, 'B', ctl.playingB, ctl.speedB, dt,
        () => updateB(simB.t, simB.pulses, ctl.waveAmp, ctl.decay, ctl.trueColors))
      runScene(Cc, simC, 'C', ctl.playingC, ctl.speedC, dt,
        () => updateC(simC.t, simC.pulses, ctl.waveAmp, ctl.decay, ctl.trueColors))
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      disposeScene(A)
      disposeScene(B)
      disposeScene(Cc)
    }
  }, [])

  return (
    <>
      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Individual components</h2>
        </div>
        <div className="sim-stage-col">
          <div ref={mountARef} className="quark-canvas-wrap" />
        </div>
        <p className="graph-note">
          {trueColors ? (
            <>
              Every live pulse on its own — a quark fired at a random point,
              radiating a spherical wave in every direction. The nested shells
              are the wave's crests, one wavelength apart, expanding at speed
              c and fading as the pulse decays. Each pulse burns its energy
              color on the shifting spectrum — dark red (infrared) for the
              coolest frequency live, light purple (ultraviolet) for the
              hottest — and the bounds refit as new frequencies fire.
            </>
          ) : (
            <>
              Every live pulse on its own — a quark fired at a random point,
              radiating a spherical wave in every direction. The nested shells are
              the wave's crests, one wavelength apart, expanding at speed c and
              fading as the pulse decays. Each pulse keeps its own
              fundamental's color: blue 1/3 f_q, red 2/3 f_q, green 1 f_q,
              yellow 4/3 f_q.
            </>
          )}
        </p>
        <Transport playing={playingA} speed={speedA} onPlayingChange={setPlayingA} onSpeedChange={setSpeedA} />
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Superposition — one slice of space</h2>
        </div>
        <div className="sim-stage-col">
          <div ref={mountBRef} className="quark-canvas-wrap" />
        </div>
        <p className="graph-note">
          {trueColors ? (
            <>
              The same firings summed on the z = 0 slice — a fair sample of
              every direction. Every point wears the additive mix of the
              pulses reaching it: one pulse's color where one dominates,
              washing toward white where many overlap. Where two wavefronts
              cross, the surface spikes or cancels: interference, made visible.
            </>
          ) : (
            <>
              The same firings summed on the z = 0 slice — a fair sample of every
              direction, green where the total runs high, red where it runs low.
              Where two wavefronts cross, the surface spikes or cancels:
              interference, made visible.
            </>
          )}
        </p>
        <Transport playing={playingB} speed={speedB} onPlayingChange={setPlayingB} onSpeedChange={setSpeedB} />
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Superposition — one surface in 3D space</h2>
        </div>
        <div className="sim-stage-col">
          <div ref={mountCRef} className="quark-canvas-wrap" />
        </div>
        <p className="graph-note">
          {trueColors ? (
            <>
              The whole at once: a sphere in 3D space sampling the total
              field — every firing summed, in every direction. Every point
              wears the additive mix of the pulses reaching it — the
              whitening, in 3D. This is the surface the slice was hinting at.
            </>
          ) : (
            <>
              The whole at once: a sphere in 3D space sampling the total field —
              every firing summed, in every direction. Each expanding shell dents
              the surface as it crosses; green where the total runs high, red
              where it runs low. This is the surface the slice was hinting at.
            </>
          )}
        </p>
        <Transport playing={playingC} speed={speedC} onPlayingChange={setPlayingC} onSpeedChange={setSpeedC} />
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Equations</h2>
        </div>
        <div className="eq-grid">
          <div className="eq-box">
            <span className="eq-label">One pulse — a spherical wave in every direction</span>
            <span className="eq-line"><Tex tex="u_i(\mathbf{x},t) = A\,\dfrac{\cos(k_q(r - c(t-t_i)) + \varphi_i)}{1+r}\,e^{-(r-c(t-t_i))^2/2\sigma_r^2}\,e^{-d(t-t_i)/\tau_0}" /></span>
            <span className="eq-line"><Tex tex="r = |\mathbf{x} - \mathbf{x}_i| \text{ — distance from the random firing point}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Pulse frequencies</span>
            <span className="eq-line"><Tex tex="k_q = q\cdot\dfrac{2\pi}{\lambda_0}, \quad q \in \{1,2,3,4\}" /></span>
            <span className="eq-line"><Tex tex="q = 1\;(\frac{3}{7}),\; 2\;(\frac{2}{7}),\; 3\;(\frac{1}{7}),\; 4\;(\frac{1}{7}) \text{ — the quark-state weights}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Firing rate</span>
            <span className="eq-line"><Tex tex="r(s) = 2 + \dfrac{s}{120000} \text{ firings per sim-second}" /></span>
            <span className="eq-line"><Tex tex="\text{more entropy, more quark events}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Wavefront shells</span>
            <span className="eq-line"><Tex tex="R_n(t) = c(t-t_i) - n\lambda_q,\quad n = 0,1,2" /></span>
            <span className="eq-line"><Tex tex="\text{the expanding crests drawn in the first graph}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Decay</span>
            <span className="eq-line"><Tex tex="d \in [0,1] \text{ — the decay slider}" /></span>
            <span className="eq-line"><Tex tex="\frac{1}{1+r} \text{ — the wavefront spreads and thins, } e^{-d\Delta t/\tau_0} \text{ — the decay rate}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Superposition — the whole</span>
            <span className="eq-line"><Tex tex="U(\mathbf{x},t) = \sum_i u_i(\mathbf{x},t)" /></span>
            <span className="eq-line"><Tex tex="\text{slice: } U(x,y,0,t) \text{ — surface: } r = R_0 + G\,U \text{ on the sphere}" /></span>
          </div>
          {trueColors && (
          <>
          <div className="eq-box">
            <span className="eq-label">True colors — a shifting spectrum</span>
            <span className="eq-line"><Tex tex="t_i = \dfrac{|q_i| - q_{\mathrm{lo}}}{q_{\mathrm{hi}} - q_{\mathrm{lo}}},\quad \mathbf{C}_i = \mathrm{spectrum}(t_i)" /></span>
            <span className="eq-line"><Tex tex="q_{\mathrm{lo/hi}} = q_{\min/\max} \mp 10\% \text{ — cutoffs refit as new frequencies fire}" /></span>
            <span className="eq-line"><Tex tex="t \le t_{\mathrm{IR}} \to \text{dark red},\ t \ge t_{\mathrm{UV}} \to \text{light purple — the visible spectrum fills the middle}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">True colors — the mix</span>
            <span className="eq-line"><Tex tex="\mathbf{C}(\mathbf{x},t) = \sum_i |u_i(\mathbf{x},t)|\,\mathbf{C}_i" /></span>
            <span className="eq-line"><Tex tex="\text{brightest channel scaled to 1 — one color where one pulse dominates, white where many overlap}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">The 1D components — adding to white</span>
            <span className="eq-line"><Tex tex="w_k(x,t) = a_k\cos(|q_k|(x-\Omega t)),\quad a_k = \dfrac{m_k\sigma_k a}{\sqrt{k+1}}" /></span>
            <span className="eq-line"><Tex tex="\mathbf{C}_{\mathrm{sum}} = \sum_k |a_k|\,\mathbf{C}_k \text{ — the sum's color washes toward white}" /></span>
          </div>
          </>
          )}
        </div>
      </div>
    </>
  )
}
