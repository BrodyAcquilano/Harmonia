import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import Slider from './Slider.jsx'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildQuarkTerms, waveCoeffsFromTerms, MAX_STATES } from './ConvolutionSurface.jsx'

/* The Mass Lattice: a cube of masses, one at every grid point, each a
   green unit mass (m = 1, constant size). Each mass rides the resultant of
   the three axis waves at its rest position —
   p(t) = p0 + g·(w_x(x0,t), w_y(y0,t), w_z(z0,t)) — motion created from
   waves, the same superposition as the gold curve of the Space-Time Domain,
   evaluated at every point at once. The motion is amplified by a visual
   gain g: at the entropies we can simulate only a few combinations have
   built up, so the raw wave motion is small next to the real universe's —
   the gain stands in for all the entropy we can't. z is vertical here. */

const AXIS_LEN = 2.2
const MASS_GREEN = 0x2e8b6e
const GRID_N = 7
const GRID_SPAN = 1.4 // tight — wavelength sizes, so the motion shows
const MOTION_GAIN = 2 // visual gain: stands in for un-simulatable entropy

export default function MassLattice({
  entropy = 500,
  waveAmp = 0.15,
  playing = false,
  speed = 1,
  onPlayingChange,
  onSpeedChange,
}) {
  const mountRef = useRef(null)
  const stateRef = useRef({ playing, speed, entropy, waveAmp })
  stateRef.current = { playing, speed, entropy, waveAmp }

  // three independent chains, one per axis
  const chains = useMemo(
    () => [0, 1, 2].map(() => buildQuarkTerms(entropy)),
    [entropy],
  )
  const N = Math.min(1 + Math.round(Math.max(entropy, 0) / 50), MAX_STATES)
  const coeffs = useMemo(
    () => chains.map((terms) => waveCoeffsFromTerms(terms, N, waveAmp)),
    [chains, N, waveAmp],
  )
  const coeffRef = useRef(coeffs)
  coeffRef.current = coeffs

  useEffect(() => {
    const mount = mountRef.current
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300)
    camera.up.set(0, 0, 1) // z is vertical in the space-time domain
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    scene.add(new THREE.AmbientLight(0xffffff, 0.85))
    const key = new THREE.DirectionalLight(0xfff2d8, 1.6)
    key.position.set(3, 4, 5)
    scene.add(key)

    // axes
    const axes = [
      { ax: 'x', color: 0xd94f3d },
      { ax: 'y', color: 0x3fae5a },
      { ax: 'z', color: 0x4a7fd4 },
    ]
    for (const { ax, color } of axes) {
      const g = new THREE.BufferGeometry()
      const p = new Float32Array(6)
      if (ax === 'x') p.set([-AXIS_LEN, 0, 0, AXIS_LEN, 0, 0])
      else if (ax === 'y') p.set([0, -AXIS_LEN, 0, 0, AXIS_LEN, 0])
      else p.set([0, 0, -AXIS_LEN, 0, 0, AXIS_LEN])
      g.setAttribute('position', new THREE.BufferAttribute(p, 3))
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.75 })))
      for (const sgn of [1, -1]) {
        const tick = new THREE.BufferGeometry()
        const tp = new Float32Array(6)
        if (ax === 'x') tp.set([sgn * AXIS_LEN, -0.07, 0, sgn * AXIS_LEN, 0.07, 0])
        else if (ax === 'y') tp.set([-0.07, sgn * AXIS_LEN, 0, 0.07, sgn * AXIS_LEN, 0])
        else tp.set([-0.07, 0, sgn * AXIS_LEN, 0.07, 0, sgn * AXIS_LEN])
        tick.setAttribute('position', new THREE.BufferAttribute(tp, 3))
        scene.add(new THREE.Line(tick, new THREE.LineBasicMaterial({ color })))
      }
    }
    // axis labels
    const makeLabel = (text) => {
      const c = document.createElement('canvas')
      c.width = 128; c.height = 128
      const ctx = c.getContext('2d')
      ctx.font = '72px Georgia, serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#6b5a3e'
      ctx.fillText(text, 64, 68)
      const tex = new THREE.CanvasTexture(c)
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
      sp.scale.set(0.34, 0.34, 1)
      return sp
    }
    for (const { ax } of axes) {
      for (const sgn of [1, -1]) {
        const sp = makeLabel(sgn === 1 ? ax : '−' + ax)
        const L = AXIS_LEN + 0.22
        if (ax === 'x') sp.position.set(sgn * L, 0, 0)
        else if (ax === 'y') sp.position.set(0, sgn * L, 0)
        else sp.position.set(0, 0, sgn * L)
        scene.add(sp)
      }
    }
    // floor grid on the xy plane
    const grid = new THREE.GridHelper(AXIS_LEN * 2, 20, 0xcbb37a, 0xdccfae)
    grid.material.transparent = true
    grid.material.opacity = 0.28
    grid.rotation.x = Math.PI / 2
    grid.position.z = -AXIS_LEN
    scene.add(grid)

    // time readout, updated imperatively (no react re-render per frame)
    const timeTag = document.createElement('div')
    timeTag.className = 'sim-clock'
    mount.appendChild(timeTag)

    // the lattice: one green unit mass at every grid point, constant size
    const N = GRID_N * GRID_N * GRID_N
    const sphereGeo = new THREE.SphereGeometry(0.11, 14, 12)
    const sphereMat = new THREE.MeshStandardMaterial({ color: MASS_GREEN, roughness: 0.45, metalness: 0.1 })
    const lattice = new THREE.InstancedMesh(sphereGeo, sphereMat, N)
    lattice.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    lattice.frustumCulled = false
    scene.add(lattice)
    const rest = new Float32Array(N * 3)
    const step = (2 * GRID_SPAN) / (GRID_N - 1)
    {
      let i = 0
      for (let iz = 0; iz < GRID_N; iz++)
        for (let iy = 0; iy < GRID_N; iy++)
          for (let ix = 0; ix < GRID_N; ix++) {
            rest[i * 3] = -GRID_SPAN + ix * step
            rest[i * 3 + 1] = -GRID_SPAN + iy * step
            rest[i * 3 + 2] = -GRID_SPAN + iz * step
            i++
          }
    }
    const dummy = new THREE.Object3D()

    const OMEGA = 0.6
    const clock = new THREE.Clock()
    let simT = 0

    const fitCamera = () => {
      const w = mount.clientWidth || 1
      const h = mount.clientHeight || 1
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (!fitCamera.done) {
        fitCamera.done = true
        const dist = 9.5
        const dir = new THREE.Vector3(1, 1.4, 0.75).normalize()
        camera.position.copy(dir.multiplyScalar(dist))
        controls.target.set(0, 0, 0)
        controls.update()
      }
    }
    fitCamera()
    const onResize = () => fitCamera()
    window.addEventListener('resize', onResize)

    const animate = () => {
      const st = stateRef.current
      const C = coeffRef.current
      const dt = Math.min(clock.getDelta(), 0.05)
      if (st.playing) simT += dt * st.speed
      const wt = OMEGA * simT
      const Cx = C[0], Cy = C[1], Cz = C[2]
      for (let i = 0; i < N; i++) {
        const o = i * 3
        const x0 = rest[o], y0 = rest[o + 1], z0 = rest[o + 2]
        let dx = 0, dy = 0, dz = 0
        for (let f = 1; f <= 4; f++) {
          dx += Cx[f] * Math.cos(f * x0 - f * wt)
          dy += Cy[f] * Math.cos(f * y0 - f * wt)
          dz += Cz[f] * Math.cos(f * z0 - f * wt)
        }
        dummy.position.set(x0 + MOTION_GAIN * dx, y0 + MOTION_GAIN * dy, z0 + MOTION_GAIN * dz)
        dummy.updateMatrix()
        lattice.setMatrixAt(i, dummy.matrix)
      }
      lattice.instanceMatrix.needsUpdate = true
      timeTag.textContent = 't = ' + simT.toFixed(1) + ' s'
      controls.update()
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(animate)

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.setAnimationLoop(null)
      renderer.dispose()
      mount.removeChild(timeTag)
      mount.removeChild(renderer.domElement)
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
