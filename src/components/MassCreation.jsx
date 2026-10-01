import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import Slider from './Slider.jsx'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { buildQuarkTerms, waveCoeffsFromTerms, MAX_STATES } from './ConvolutionSurface.jsx'

/* Mass Creation: quarks fire at random positions in the field — about eight
   per sim-second. 95% of the time a firing forms a unit mass (a green
   sphere); the other 5% release only energy, a red flash with no mass.
   Every formed mass then rides the same resultant wave motion as the
   lattice — p(t) = p0 + g·(w_x, w_y, w_z), perpendicular to the energy
   wave, 180° out of phase — so each mass traces a closed loop (the integer
   frequencies close the orbit). When masses bump together they merge into
   one rendered sphere, sized by the total unit masses inside; the program
   still counts every unit mass separately, and when they drift apart the
   cluster breaks up again. Masses that form in the same spot pile onto the
   same sphere, so it grows. z is vertical. */

const AXIS_LEN = 2.2
const SPAWN_SPAN = 1.6 // quarks fire uniformly inside this cube
const MAX_MASSES = 900 // hard cap on live unit masses
const SPAWN_RATE = 8 // quark firings per sim-second
const FORM_PROB = 0.95
const MERGE_R = 0.35 // bump distance: merge into one rendered sphere
const BASE_R = 0.11 // rendered radius of one unit mass
const GAIN = 2 // same visual gain as the lattice
const OMEGA = 0.6
const DECAY_L = 2.0 // decay length: wave-riding motion falls as exp(-d·r0/DECAY_L)
const GREEN = 0x2e8b6e
const REDFLASH = 0xc0392b
const MAX_FLASH = 48

export default function MassCreation({
  entropy = 60000,
  waveAmp = 0.15,
  decay = 0,
  playing = false,
  speed = 1,
  onPlayingChange,
  onSpeedChange,
}) {
  const mountRef = useRef(null)
  const stateRef = useRef({ playing, speed, entropy, waveAmp, decay })
  stateRef.current = { playing, speed, entropy, waveAmp, decay }

  // three independent chains, one per axis — same field recipe as the lattice
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
    camera.up.set(0, 0, 1) // z is vertical
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

    // unit masses: rest positions (where each one formed)
    const rest = new Float32Array(MAX_MASSES * 3)
    const pos = new Float32Array(MAX_MASSES * 3) // displaced positions, per frame
    let nMass = 0

    // energy-only flashes (the 5%): position + remaining life
    const flashPos = new Float32Array(MAX_FLASH * 3)
    const flashLife = new Float32Array(MAX_FLASH)
    let flashHead = 0

    // one rendered sphere per cluster; capacity covers the all-single worst case
    const massMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 14, 12),
      new THREE.MeshStandardMaterial({ color: GREEN, roughness: 0.45, metalness: 0.1 }),
      MAX_MASSES,
    )
    massMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    massMesh.frustumCulled = false
    massMesh.count = 0
    scene.add(massMesh)

    const flashMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 10, 8),
      new THREE.MeshBasicMaterial({ color: REDFLASH, transparent: true, opacity: 0.55 }),
      MAX_FLASH,
    )
    flashMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    flashMesh.frustumCulled = false
    flashMesh.count = 0
    scene.add(flashMesh)

    const dummy = new THREE.Object3D()

    // union-find + spatial hash, reused every frame
    const parent = new Int32Array(MAX_MASSES)
    const cellMap = new Map()
    const clusterOf = new Map() // root -> cluster index
    const clusterSum = new Float64Array(MAX_MASSES * 4) // count, sx, sy, sz

    const find = (a) => {
      let r = a
      while (parent[r] !== r) r = parent[r]
      while (parent[a] !== r) { const t = parent[a]; parent[a] = r; a = t }
      return r
    }

    const clock = new THREE.Clock()
    let simT = 0
    let spawnAcc = 0

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

    const fireQuark = () => {
      const x = (Math.random() * 2 - 1) * SPAWN_SPAN
      const y = (Math.random() * 2 - 1) * SPAWN_SPAN
      const z = (Math.random() * 2 - 1) * SPAWN_SPAN
      if (Math.random() < FORM_PROB && nMass < MAX_MASSES) {
        rest[nMass * 3] = x
        rest[nMass * 3 + 1] = y
        rest[nMass * 3 + 2] = z
        nMass++
      } else {
        // energy released with no mass: a red flash that fades
        flashPos[flashHead * 3] = x
        flashPos[flashHead * 3 + 1] = y
        flashPos[flashHead * 3 + 2] = z
        flashLife[flashHead] = 1
        flashHead = (flashHead + 1) % MAX_FLASH
      }
    }

    const animate = () => {
      const st = stateRef.current
      const C = coeffRef.current
      const dt = Math.min(clock.getDelta(), 0.05)
      if (st.playing) {
        simT += dt * st.speed
        spawnAcc += dt * st.speed * SPAWN_RATE
        while (spawnAcc >= 1) { spawnAcc -= 1; fireQuark() }
      }

      // displace every unit mass by the resultant wave at its rest position
      const wt = OMEGA * simT
      const Cx = C[0], Cy = C[1], Cz = C[2]
      for (let i = 0; i < nMass; i++) {
        const o = i * 3
        const x0 = rest[o], y0 = rest[o + 1], z0 = rest[o + 2]
        let dx = 0, dy = 0, dz = 0
        for (let f = 1; f <= 4; f++) {
          dx += Cx[f] * Math.cos(f * x0 - f * wt)
          dy += Cy[f] * Math.cos(f * y0 - f * wt)
          dz += Cz[f] * Math.cos(f * z0 - f * wt)
        }
        // decay: the wave loses energy traveling out from the center
        const r0 = Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0)
        const env = st.decay > 0 ? Math.exp(-st.decay * r0 / DECAY_L) : 1
        pos[o] = x0 + GAIN * dx * env
        pos[o + 1] = y0 + GAIN * dy * env
        pos[o + 2] = z0 + GAIN * dz * env
      }

      // cluster by bump distance: spatial hash + union-find
      for (let i = 0; i < nMass; i++) parent[i] = i
      cellMap.clear()
      const inv = 1 / MERGE_R
      for (let i = 0; i < nMass; i++) {
        const ix = Math.floor(pos[i * 3] * inv)
        const iy = Math.floor(pos[i * 3 + 1] * inv)
        const iz = Math.floor(pos[i * 3 + 2] * inv)
        const k = (ix + 64) + (iy + 64) * 256 + (iz + 64) * 65536
        let arr = cellMap.get(k)
        if (!arr) { arr = []; cellMap.set(k, arr) }
        arr.push(i)
      }
      const r2 = MERGE_R * MERGE_R
      for (let i = 0; i < nMass; i++) {
        const ix = Math.floor(pos[i * 3] * inv)
        const iy = Math.floor(pos[i * 3 + 1] * inv)
        const iz = Math.floor(pos[i * 3 + 2] * inv)
        for (let ax = -1; ax <= 1; ax++)
          for (let ay = -1; ay <= 1; ay++)
            for (let az = -1; az <= 1; az++) {
              const arr = cellMap.get((ix + ax + 64) + (iy + ay + 64) * 256 + (iz + az + 64) * 65536)
              if (!arr) continue
              for (let t = 0; t < arr.length; t++) {
                const j = arr[t]
                if (j <= i) continue
                const ddx = pos[i * 3] - pos[j * 3]
                const ddy = pos[i * 3 + 1] - pos[j * 3 + 1]
                const ddz = pos[i * 3 + 2] - pos[j * 3 + 2]
                if (ddx * ddx + ddy * ddy + ddz * ddz < r2) {
                  const ri = find(i), rj = find(j)
                  if (ri !== rj) parent[rj] = ri
                }
              }
            }
      }
      clusterOf.clear()
      let nCl = 0
      for (let i = 0; i < nMass; i++) {
        const r = find(i)
        let ci = clusterOf.get(r)
        if (ci === undefined) {
          ci = nCl++
          clusterOf.set(r, ci)
          clusterSum[ci * 4] = 0
          clusterSum[ci * 4 + 1] = 0
          clusterSum[ci * 4 + 2] = 0
          clusterSum[ci * 4 + 3] = 0
        }
        clusterSum[ci * 4] += 1
        clusterSum[ci * 4 + 1] += pos[i * 3]
        clusterSum[ci * 4 + 2] += pos[i * 3 + 1]
        clusterSum[ci * 4 + 3] += pos[i * 3 + 2]
      }

      // one sphere per cluster: centroid, radius grows with total unit mass
      for (let ci = 0; ci < nCl; ci++) {
        const m = clusterSum[ci * 4]
        dummy.position.set(
          clusterSum[ci * 4 + 1] / m,
          clusterSum[ci * 4 + 2] / m,
          clusterSum[ci * 4 + 3] / m,
        )
        dummy.scale.setScalar(BASE_R * Math.cbrt(m))
        dummy.updateMatrix()
        massMesh.setMatrixAt(ci, dummy.matrix)
      }
      massMesh.count = nCl
      massMesh.instanceMatrix.needsUpdate = true

      // flashes shrink away
      let nf = 0
      for (let i = 0; i < MAX_FLASH; i++) {
        if (flashLife[i] <= 0) continue
        flashLife[i] -= dt * 1.2
        const l = Math.max(0, flashLife[i])
        dummy.position.set(flashPos[i * 3], flashPos[i * 3 + 1], flashPos[i * 3 + 2])
        dummy.scale.setScalar(0.09 * l + 0.001)
        dummy.updateMatrix()
        flashMesh.setMatrixAt(nf++, dummy.matrix)
      }
      flashMesh.count = nf
      flashMesh.instanceMatrix.needsUpdate = true

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
