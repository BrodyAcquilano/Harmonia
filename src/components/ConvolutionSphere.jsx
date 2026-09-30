import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/* Convolution sphere (the 4th dimension, §§8–10), drawn with three.js.
   Entropy s in [0,1]: s = 0 is a single point, s = 1 fills the viewport.
   The selected eigenvector is the surface point at time-longitude τ1 and
   time-latitude τ2; its axes are the wavelengths λx λy λz. */

const D2R = Math.PI / 180
const AXIS_LEN = 1.32 // axes reach just past the max sphere (radius 1)
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

// i-th point of an n-point Fibonacci lattice on a sphere of radius r
function fibPoint(i, n, r, target) {
  if (n <= 1) return target.set(0, 0, 0)
  const golden = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (i / (n - 1)) * 2
  const rad = Math.sqrt(Math.max(0, 1 - y * y))
  const th = golden * i
  return target.set(r * rad * Math.cos(th), r * y, r * rad * Math.sin(th))
}

export default function ConvolutionSphere({ entropy, tau1, tau2 }) {
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

    // coordinate axes + wavelength labels
    const axisCols = { x: 0xc0563f, y: 0x2e8b6e, z: 0x3f6fb5 }
    const labels = { x: 'λx', y: 'λy', z: 'λz' }
    ;['x', 'y', 'z'].forEach((ax) => {
      const g = new THREE.BufferGeometry()
      const a = new THREE.Vector3(), b = new THREE.Vector3()
      a[ax] = -AXIS_LEN; b[ax] = AXIS_LEN
      g.setFromPoints([a, b])
      scene.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: axisCols[ax] })))
      const lab = makeLabel(labels[ax])
      lab.position[ax] = AXIS_LEN + 0.16
      scene.add(lab)
    })

    // faint floor grid: the coordinate grid the sphere sits on
    const grid = new THREE.GridHelper(2.64, 16, 0xcbb37a, 0xdccfae)
    grid.material.transparent = true
    grid.material.opacity = 0.28
    grid.position.y = -AXIS_LEN
    scene.add(grid)

    // the convolution sphere: semi-transparent surface + faint wireframe
    const sphereGeo = new THREE.SphereGeometry(1, 48, 32)
    const sphere = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshStandardMaterial({
        color: 0xe9d9a6, transparent: true, opacity: 0.16,
        roughness: 0.35, metalness: 0.05,
        side: THREE.DoubleSide, depthWrite: false,
      })
    )
    const wire = new THREE.Mesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xb09a5e, wireframe: true, transparent: true, opacity: 0.07 })
    )
    scene.add(sphere, wire)

    // eigenstates: points on the sphere (Fibonacci lattice)
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

    // selected eigenstate marker
    const selPoint = new THREE.Mesh(
      new THREE.SphereGeometry(0.05, 20, 14),
      new THREE.MeshStandardMaterial({ color: GOLD, emissive: 0x8a6a1f, emissiveIntensity: 0.7 })
    )
    scene.add(selPoint)

    // eigenvector arrow: shaft + cone head + rounded tip
    const UP = new THREE.Vector3(0, 1, 0)
    const arrowMat = new THREE.MeshStandardMaterial({ color: GOLD, emissive: 0x8a6a1f, emissiveIntensity: 0.45, roughness: 0.4 })
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1, 20), arrowMat)
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.058, 1, 28), arrowMat)
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.02, 14, 10), arrowMat)
    const arrow = new THREE.Group()
    arrow.add(shaft, head, tip)
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

    apiRef.current = { sphere, wire, points, selPoint, arrow, shaft, head, tip, UP }

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

  // ---- per-prop update: entropy / mass / energy ----
  useEffect(() => {
    const api = apiRef.current
    if (!api) return
    const R = Math.max(entropy, 0)
    const { sphere, wire, points, selPoint, arrow, shaft, head, tip, UP } = api

    sphere.visible = R > 1e-4
    wire.visible = R > 1e-4
    sphere.scale.setScalar(Math.max(R, 1e-4))
    wire.scale.setScalar(Math.max(R, 1e-4))

    // eigenstates: one point at s = 0, up to 300 at s = 1
    const attr = points.geometry.attributes.position
    const v = new THREE.Vector3()
    let n
    if (R <= 1e-4) {
      n = 1
      attr.setXYZ(0, 0, 0, 0)
    } else {
      n = Math.min(1 + Math.round(entropy * 299), MAX_STATES)
      for (let i = 0; i < n; i++) {
        fibPoint(i, n, R, v)
        attr.setXYZ(i, v.x, v.y, v.z)
      }
    }
    attr.needsUpdate = true
    points.geometry.setDrawRange(0, n)
    points.geometry.computeBoundingSphere()

    // the selected eigenvector: time-longitude τ1, time-latitude τ2
    const th = tau1 * D2R, ph = tau2 * D2R
    const P = new THREE.Vector3(
      R * Math.cos(ph) * Math.cos(th),
      R * Math.sin(ph),
      R * Math.cos(ph) * Math.sin(th)
    )
    selPoint.visible = R > 1e-4
    selPoint.position.copy(P)

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
      tip.position.copy(dir).multiplyScalar(len)
    }
  }, [entropy, tau1, tau2])

  return <div ref={mountRef} className="quark-canvas-wrap" />
}
