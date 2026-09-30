import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildQuarkTerms, waveCoeffsFromTerms } from './ConvolutionSurface.jsx'

/* The Mass Lattice: a cube of masses, one at every grid point, each with
   mass m = 1. The waves do two things to each mass. First they move it: its
   position is the resultant of the three axis waves at its rest position —
   p(t) = p0 + (w_x(x0,t), w_y(y0,t), w_z(z0,t)) — motion created from waves,
   the same superposition as the gold curve of the Space-Time Domain,
   evaluated at every point at once. Then they breathe it: m = 1 + w, the
   local mass swells where the wave piles up and thins where it dips, and
   energy is the exact inverse, E = 1/m, so E·m = 1 everywhere — green where
   mass gathers, red where energy is released, the same language as the
   surface. z is vertical here. */

const GOLD = 0xd9a441
const AXIS_LEN = 2.2
const GREEN = [0.25, 0.72, 0.32] // mass piles up
const REDD = [0.78, 0.28, 0.22] // energy released
const NEUT = [0.85, 0.79, 0.68] // m = 1
const GRID_N = 7
const GRID_SPAN = 1.8

export default function MassLattice({
  entropy = 500,
  waveAmp = 0.15,
  playing = false,
  speed = 1,
}) {
  const mountRef = useRef(null)
  const stateRef = useRef({ playing, speed, entropy, waveAmp })
  stateRef.current = { playing, speed, entropy, waveAmp }

  // three independent chains, one per axis
  const chains = useMemo(
    () => [0, 1, 2].map(() => buildQuarkTerms(entropy)),
    [entropy],
  )
  const coeffs = useMemo(
    () => chains.map((terms) => waveCoeffsFromTerms(terms, waveAmp)),
    [chains, waveAmp],
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

    // the lattice: one unit mass at every grid point
    const N = GRID_N * GRID_N * GRID_N
    const sphereGeo = new THREE.SphereGeometry(0.1, 14, 12)
    const sphereMat = new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 })
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
    const tmpColor = new THREE.Color()
    // allocate instance colors
    for (let i = 0; i < N; i++) lattice.setColorAt(i, tmpColor.setRGB(...NEUT))

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
        const wbar = (dx + dy + dz) / 3
        // mass breathes with the wave: m = 1 + w, E = 1/m
        const s = Math.min(1.7, Math.max(0.5, 1 + wbar))
        dummy.position.set(x0 + dx, y0 + dy, z0 + dz)
        dummy.scale.setScalar(s)
        dummy.updateMatrix()
        lattice.setMatrixAt(i, dummy.matrix)
        // green where mass piles up, red where energy is released
        const k = Math.min(1, Math.abs(wbar) / 0.3)
        const hi = wbar >= 0 ? GREEN : REDD
        tmpColor.setRGB(
          NEUT[0] + (hi[0] - NEUT[0]) * k,
          NEUT[1] + (hi[1] - NEUT[1]) * k,
          NEUT[2] + (hi[2] - NEUT[2]) * k,
        )
        lattice.setColorAt(i, tmpColor)
      }
      lattice.instanceMatrix.needsUpdate = true
      if (lattice.instanceColor) lattice.instanceColor.needsUpdate = true
      controls.update()
      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(animate)

    return () => {
      window.removeEventListener('resize', onResize)
      renderer.setAnimationLoop(null)
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} className="quark-canvas-wrap" />
}
