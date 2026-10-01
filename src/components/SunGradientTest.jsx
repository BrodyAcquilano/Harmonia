import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Slider from './Slider.jsx'
import { setupScene, disposeScene, Transport } from './ModellingSun.jsx'

/* The gradient test: the second model in the Modelling the Sun tab.
   No table this time. Each pulse carries its quark frequency outward
   through an actual temperature profile T(r) and sheds energy by Compton
   scattering at every step — sped up, with S representative scatterings
   standing in for ~10^25. When a pulse reaches the photosphere we record
   how far it was actually divided down; the attenuation graph and the
   landing spectrum build themselves from that recorded history.
   The table's factors were drawn from the temperature-gradient picture,
   so we expect this model to reproduce them — that's the test. The model
   is a first attempt, deliberately improvable. */

// ---- physics constants: the actual Sun ----
const H = 6.62607015e-34      // J s
const KB = 1.380649e-23       // J/K
const EV = 1.602176634e-19    // J
const MEC2 = 511e3 * EV       // electron rest energy, J
const M_SUN = 1.989e30        // kg
const R_SUN = 6.957e8         // m
const T_CORE = 1.5e7          // K
const T_PHOT = 5778           // K
const S_SUN = 1e35            // J/K, total entropy of the Sun (order of
                              // magnitude; Wikipedia "Orders of magnitude
                              // (entropy)", citing Bekenstein 1973)

// one frequency quantum per expelled quark: f_q = (2/3)·m_q·c²/h, m_q·c² = 2 MeV
const FQ = (2 / 3) * 2e6 / 4.135667696e-15 // Hz

// analytic approximation to the standard solar model temperature profile
const T_of = (x) => T_PHOT + (T_CORE - T_PHOT) * (1 - x) * (1 - x)

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

// the expected attenuation, from the note's table — what the gradient
// would have to do. Log-log piecewise through all four anchors.
const TABLE_ANCHORS = [
  [FQ / 3, 2.5e5],
  [(2 * FQ) / 3, 4.2e5],
  [FQ, 5.7e5],
  [(4 * FQ) / 3, 6.7e5],
]
function tableMod(nu) {
  const pts = TABLE_ANCHORS.map(([n, m]) => [Math.log10(n), Math.log10(m)])
  const x = Math.log10(nu)
  let i = 0
  if (x <= pts[0][0]) i = 0
  else if (x >= pts[pts.length - 1][0]) i = pts.length - 2
  else { i = 0; while (x >= pts[i + 1][0]) i++ }
  const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]
  const s = (y1 - y0) / (x1 - x0)
  return Math.pow(10, y0 + s * (x - x0))
}
// complete thermalization: every input lands at the photosphere's mean
// blackbody photon energy, 2.7·kT — attenuation strictly proportional
// to the input frequency
const thermalLimit = (nu) => nu / ((2.7 * KB * T_PHOT) / H)

// sim geometry mirrors the first model: hidden inner sphere, photosphere
const C = 1.0
const LAMBDA0 = 0.9
const SIG_R = 0.45
const DECAY_TAU = 2.0
const MAX_PULSES = 48
const SURF_R0 = 2.3 // the photosphere
const SURF_G = 2.5
const SURF_SEG = 56
const SURF_RINGS = 40
const R_IN = 0.9 // the hidden inner sphere where quarks fire
// the generator spheres: R_gen = band × GEN_BASE, radii in the ratio
// 1:2:3:4 — the f_q sphere sits at half the sun's radius, the 4/3 f_q
// sphere reaches two-thirds of the way out
const GEN_BASE = 0.5 * SURF_R0

const BANDS = [FQ / 3, (2 * FQ) / 3, FQ, (4 * FQ) / 3]
const BAND_NAMES = ['1/3 f_q', '2/3 f_q', 'f_q', '4/3 f_q']
const HIST_N = 48
const HIST_L0 = 13, HIST_L1 = 16.5 // log10 Hz

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function freshExperiment(entropy) {
  return {
    t: 0,
    spawnAcc: 0,
    pulses: [],
    rng: mulberry32(Math.floor(entropy * 2654435761) % 4294967296),
    bins: BANDS.map(() => ({ n: 0, sumA: 0, sumNu: 0 })),
    hist: new Float64Array(HIST_N),
    histN: 0,
    version: 0,
  }
}

function pickQ(rng) {
  const r = rng()
  if (r < 3 / 7) return 1
  if (r < 5 / 7) return 2
  if (r < 6 / 7) return 3
  return 4
}

function nearestBand(nu) {
  const x = Math.log10(nu)
  let best = 0, bd = Infinity
  for (let i = 0; i < BANDS.length; i++) {
    const d = Math.abs(x - Math.log10(BANDS[i]))
    if (d < bd) { bd = d; best = i }
  }
  return best
}

// one Compton-cooling step: dE/dn = -(E/m_e c²)(E - kT), integrated
// exactly over dN scatterings at the local temperature. In u = 1/E the
// equation is linear: du/dn = (1 - kT·u)/m_e c².
function coolStep(E, xNew, dN) {
  const kT = KB * T_of(Math.min(1, Math.max(0, xNew)))
  const inv = 1 / kT + (1 / E - 1 / kT) * Math.exp(-kT * dN / MEC2)
  return 1 / inv
}

// sample a frequency from the Planck distribution at Teff — the escaping
// light is re-emitted thermal radiation, not the original photon.
// Individual photons follow the photon-number distribution, x²/(e^x−1),
// whose mean is 2.7·kT (not the energy-weighted x³ distribution).
function samplePlanck(Teff, rng) {
  const kT = KB * Teff
  const xMax = 20, N = 160
  const cum = new Float64Array(N + 1)
  for (let i = 1; i <= N; i++) {
    const x = (i / N) * xMax
    cum[i] = cum[i - 1] + (x * x) / (Math.exp(x) - 1)
  }
  const u = rng() * cum[N]
  let lo = 0, hi = N
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cum[mid] < u) lo = mid + 1
    else hi = mid
  }
  const i = Math.max(1, lo)
  const frac = (u - cum[i - 1]) / Math.max(cum[i] - cum[i - 1], 1e-300)
  const x = (((i - 1) + frac) / N) * xMax
  return (x * kT) / H
}

function planckNu(nu, T) {
  const x = (H * nu) / (KB * T)
  if (x > 60) return 0
  return (nu * nu * nu) / (Math.exp(x) - 1)
}

// ---- the 3D surface: watch the pulses cool as they climb ----
// sample-and-hold tuning: the flash strength that counts as a "hit,"
// and how fast a held color fades back toward the base color
const HIT_THRESH = 0.02
const HOLD_TAU = 40 // seconds to fade back toward the base color
// thermal surface tuning: patches accumulate wave energy as heat (eV)
// and radiate it away between hits
const HEAT_GAIN = 5
const COOL_TAU = 40 // seconds to cool back toward the base temperature
const T_BASE = 1.2 // eV — below the visible band: dark red when cold

// wipe an accumulating surface: 'hold' restarts at the base color,
// 'thermal' restarts cold
function resetSurface(P, mode, sCount) {
  for (let v = 0; v < sCount; v++) {
    if (mode === 'thermal') {
      P[v * 3] = T_BASE; P[v * 3 + 1] = 0; P[v * 3 + 2] = 0
    } else {
      P[v * 3] = 0.93; P[v * 3 + 1] = 0.91; P[v * 3 + 2] = 0.87
    }
  }
}

function GradientSurface({ expRef, ctlRef, dirtyRef, mode = 'flash' }) {
  // mode: 'flash' (instantaneous), 'hold' (sample-and-hold mosaic),
  // 'thermal' (accumulates heat, cools between hits)
  const isAccum = mode !== 'flash'
  const mountRef = useRef(null)
  // accumulated-surface state lives in refs: per-vertex memory (held
  // colors for 'hold', temperature in eV for 'thermal'), and which
  // experiment it belongs to
  const phosRef = useRef(null)
  const phosExpRef = useRef(null)
  const seenDirtyRef = useRef(0)

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
    if (isAccum) {
      // the accumulating surface starts cold everywhere
      const P = new Float32Array(sCount * 3)
      resetSurface(P, mode, sCount)
      phosRef.current = P
    }

    const spawn = (exp, t) => {
      const rng = exp.rng
      const q = pickQ(rng)
      const band = Math.abs(q) / 3 // 1/3, 2/3, 1, 4/3
      // each fundamental is born in its own sphere, radii in the ratio
      // 1:2:3:4 — the 1/3 f_q sphere deepest, the 4/3 f_q sphere reaching
      // two-thirds of the way to the surface. Higher-frequency
      // quark combinations assemble where the pressure is lower, so they
      // have less gradient left to climb and cool less.
      const Rg = band * GEN_BASE
      const rr = Rg * Math.cbrt(rng())
      const th = rng() * Math.PI * 2
      const ph = Math.acos(2 * rng() - 1)
      const nuIn = (Math.abs(q) / 3) * FQ
      const x0 = rr / SURF_R0
      exp.pulses.push({
        ox: rr * Math.sin(ph) * Math.cos(th),
        oy: rr * Math.sin(ph) * Math.sin(th),
        oz: rr * Math.cos(ph),
        k: q * 2 * Math.PI / LAMBDA0,
        phi: rng() * Math.PI * 2,
        born: t, q,
        r0: rr,
        x: x0,
        x0,
        // random-walk scaling: the scatterings needed to escape go as the
        // optical depth to the surface raised to a power — 2 for a uniform
        // medium, steepened to 2.5 here as a small step toward a
        // centrally-concentrated star, where the optical depth from a birth
        // radius grows faster than the remaining path. Without this, the
        // same S spread over a shorter path would cool shallow births
        // *more*, not less.
        sq: Math.pow(1 - x0, 2.5),
        nuIn,
        E: H * nuIn,
        col: visibleColor(nuIn), // MeV gamma — ultraviolet clamp
      })
      if (exp.pulses.length > MAX_PULSES) exp.pulses.shift()
    }

    const land = (exp, p) => {
      // the energy that reaches the surface escapes as thermal light
      const Teff = p.E / KB
      const nuOut = Math.max(samplePlanck(Teff, exp.rng), 1e10)
      const A = p.nuIn / nuOut
      const b = nearestBand(p.nuIn)
      const bin = exp.bins[b]
      bin.n += 1
      bin.sumA += A
      bin.sumNu += nuOut
      const hb = Math.floor(
        ((Math.log10(nuOut) - HIST_L0) / (HIST_L1 - HIST_L0)) * HIST_N)
      if (hb >= 0 && hb < HIST_N) exp.hist[hb] += 1
      exp.histN += 1
      exp.version += 1
    }

    // one pulse's field: a spherical wave in every direction — thins as
    // 1/(1+r), loses energy with the decay rate
    const field = (p, x, y, z, t, amp, decay) => {
      const dt = t - p.born
      if (dt <= 0) return 0
      const rx = x - p.ox, ry = y - p.oy, rz = z - p.oz
      const r = Math.sqrt(rx * rx + ry * ry + rz * rz)
      const xi = r - C * dt
      if (xi > 4 * SIG_R || xi < -4 * SIG_R) return 0
      const damp = decay > 0 ? Math.exp(-decay * dt / DECAY_TAU) : 1
      return amp * Math.cos(p.k * xi + p.phi)
        * Math.exp(-(xi * xi) / (2 * SIG_R * SIG_R)) * damp / (1 + r)
    }

    const update = (sdt = 0) => {
      const ctl = ctlRef.current
      const exp = expRef.current
      const posA = sphGeo.attributes.position
      const colA = sphGeo.attributes.color
      const np = exp.pulses.length
      const P = isAccum ? phosRef.current : null
      for (let v = 0; v < sCount; v++) {
        const x = sBase[v * 3], y = sBase[v * 3 + 1], z = sBase[v * 3 + 2]
        let u = 0, mr = 0, mg = 0, mb = 0, er = 0
        for (let i = 0; i < np; i++) {
          const p = exp.pulses[i]
          const f = field(p, x, y, z, exp.t, ctl.waveAmp, ctl.decay)
          u += f // every wave ripples the surface, whatever its color
          const w = Math.abs(f)
          if (mode === 'flash') {
            // additive mix: each pulse wears its *current* color — watch it
            // cool as it climbs: ultraviolet clamp, through the visible,
            // into the infrared clamp
            const c = p.col
            mr += w * c[0]; mg += w * c[1]; mb += w * c[2]
            continue
          }
          // the accumulating surfaces only see visible light: a hot
          // leading edge or a cold trailing edge ripples through without
          // painting or heating, so the surface keeps its previous state
          const nu = p.E / H
          if (nu <= VIS_LO || nu >= VIS_HI) continue
          if (mode === 'hold') {
            const c = p.col
            mr += w * c[0]; mg += w * c[1]; mb += w * c[2]
          } else {
            er += w * (p.E / EV) // deposit the wave's photon energy, in eV
          }
        }
        Uc[v] = u
        if (mode === 'flash') {
          const mx = Math.max(mr, mg, mb)
          if (mx > 1e-6) colA.setXYZ(v, mr / mx, mg / mx, mb / mx)
          else colA.setXYZ(v, 0.93, 0.91, 0.87) // quiet — neutral
          continue
        }
        const o = v * 3
        if (mode === 'hold') {
          // sample-and-hold: the surface keeps the color of the most recent
          // thing that hit it. A wavefront crossing the hit threshold repaints
          // the vertex with the flash's hue; otherwise the held color just
          // fades slowly back toward the base color. No averaging — colors
          // stay pure, and the sphere becomes a slowly-evolving mosaic of
          // recent landings instead of flickering back to bland.
          if (sdt > 0) {
            const fade = Math.exp(-sdt / HOLD_TAU)
            P[o] = P[o] * fade + 0.93 * (1 - fade)
            P[o + 1] = P[o + 1] * fade + 0.91 * (1 - fade)
            P[o + 2] = P[o + 2] * fade + 0.87 * (1 - fade)
            const mx = Math.max(mr, mg, mb)
            if (mx > HIT_THRESH) {
              const inv = 1 / mx
              P[o] = mr * inv
              P[o + 1] = mg * inv
              P[o + 2] = mb * inv
            }
          }
          colA.setXYZ(v, P[o], P[o + 1], P[o + 2])
          continue
        }
        // thermal: the patch accumulates the energy of the visible waves
        // that hit it and radiates it away between hits — fresh hits run
        // hot and blue-white, neglected patches cool toward dark red,
        // the sunspot-like ones
        if (sdt > 0) {
          P[o] += HEAT_GAIN * sdt * er
          P[o] += (T_BASE - P[o]) * (1 - Math.exp(-sdt / COOL_TAU))
        }
        const tc = visibleColor((P[o] * EV) / H)
        colA.setXYZ(v, tc[0] / 255, tc[1] / 255, tc[2] / 255)
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

    // one experiment step: spawn, age, cool, and remove landed pulses.
    // recordLanding feeds the measurement graphs — the accumulating view
    // keeps its own experiment and doesn't record.
    const advance = (exp, ctl, sdt, recordLanding) => {
      exp.t += sdt
      // more entropy, more quark events (the physics per journey is
      // unchanged by the firing rate)
      exp.spawnAcc += sdt * ctl.fireRate * (2 + ctl.entropy / 120000)
      while (exp.spawnAcc >= 1) {
        exp.spawnAcc -= 1
        spawn(exp, exp.t)
      }
      for (let i = exp.pulses.length - 1; i >= 0; i--) {
        const p = exp.pulses[i]
        p.age = (p.age || 0) + sdt
        // the outward wavefront climbs: x = r/R_sun
        const xNew = Math.min(1, p.x0 + (C * p.age) / SURF_R0)
        const dN = ctl.S * p.sq * ((xNew - p.x) / (1 - p.x0))
        if (dN > 0) p.E = coolStep(p.E, xNew, dN)
        p.x = xNew
        p.col = visibleColor(p.E / H)
        if (xNew >= 1) {
          if (recordLanding) land(exp, p)
          exp.pulses.splice(i, 1)
        }
      }
    }

    const resetPhosphor = () => {
      // a new experiment started — the surface forgets everything
      resetSurface(phosRef.current, mode, sCount)
    }

    let raf = 0
    let last = performance.now()
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const ctl = ctlRef.current
      const exp = expRef.current
      if (isAccum) {
        // independent experiment: its own pulses, its own clock
        if (ctl.playing) {
          const sdt = dt * ctl.speed
          if (phosExpRef.current !== exp) {
            phosExpRef.current = exp
            resetPhosphor()
          }
          advance(exp, ctl, sdt, false)
          update(sdt)
          S.timeTag.textContent = 't = ' + exp.t.toFixed(1) + ' s'
          S.controls.update()
          S.renderer.render(S.scene, S.camera)
          return
        }
        // paused: frozen — no recomputation, no renders, until the camera
        // moves or a parameter changes
        S.controls.update()
        let dirty = false
        if (S.camDirty) { S.camDirty = false; dirty = true }
        if (dirtyRef.current !== seenDirtyRef.current) {
          seenDirtyRef.current = dirtyRef.current
          dirty = true
        }
        if (dirty) {
          if (phosExpRef.current !== exp) {
            phosExpRef.current = exp
            resetPhosphor()
          }
          update(0)
          S.timeTag.textContent = 't = ' + exp.t.toFixed(1) + ' s'
          S.renderer.render(S.scene, S.camera)
        }
        return
      }
      if (ctl.playing) {
        const sdt = dt * ctl.speed
        advance(exp, ctl, sdt, true)
        update(sdt)
        S.timeTag.textContent = 't = ' + exp.t.toFixed(1) + ' s · landed ' + exp.histN
        S.controls.update()
        S.renderer.render(S.scene, S.camera)
        return
      }
      // paused: frozen — no recomputation, no renders, until the camera
      // moves or a parameter changes
      S.controls.update()
      let dirty = false
      if (S.camDirty) { S.camDirty = false; dirty = true }
      if (dirtyRef.current !== seenDirtyRef.current) {
        seenDirtyRef.current = dirtyRef.current
        dirty = true
        update(0)
      }
      if (dirty) S.renderer.render(S.scene, S.camera)
    }
    update(0)
    loop()
    return () => {
      cancelAnimationFrame(raf)
      disposeScene(S)
    }
  }, [])

  return (
    <div className="sim-stage-col">
      <div ref={mountRef} className="quark-canvas-wrap" />
    </div>
  )
}

// ---- measured vs expected attenuation: the graph builds itself ----
function AttenuationGraph({ expRef, playingRef }) {
  const ref = useRef(null)
  const seen = useRef({ exp: null, version: -1 })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    const draw = () => {
      const exp = expRef.current
      const w = canvas.clientWidth, h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const padL = 64, padR = 16, padT = 14, padB = 44
      const iw = w - padL - padR, ih = h - padT - padB
      const X0 = 20, X1 = 20.65 // log10 Hz (1e20 – 4.4e20)
      const Y0 = 3, Y1 = 7      // log10 attenuation
      const qx = (nu) => padL + ((Math.log10(nu) - X0) / (X1 - X0)) * iw
      const ay = (a) => padT + ih - ((Math.log10(a) - Y0) / (Y1 - Y0)) * ih

      // gridlines
      ctx.strokeStyle = 'rgba(107,90,62,0.22)'
      ctx.fillStyle = '#715f43'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'right'
      for (let e = Y0; e <= Y1; e++) {
        const y = ay(Math.pow(10, e))
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + iw, y); ctx.stroke()
        ctx.fillText('10^' + e, padL - 6, y + 3)
      }
      ctx.textAlign = 'center'
      for (const nu of [1e20, 2e20, 4e20]) {
        ctx.fillText(nu.toExponential(0).replace('e+', '×10^'), qx(nu), padT + ih + 16)
      }

      // expected: the note's table, gold
      ctx.beginPath()
      for (let i = 0; i <= 80; i++) {
        const nu = Math.pow(10, X0 + (i / 80) * (X1 - X0))
        const x = qx(nu), y = ay(tableMod(nu))
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(180,130,40,0.85)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.lineWidth = 1

      // complete thermalization limit, teal dashed
      ctx.beginPath()
      for (let i = 0; i <= 40; i++) {
        const nu = Math.pow(10, X0 + (i / 40) * (X1 - X0))
        const x = qx(nu), y = ay(thermalLimit(nu))
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0,150,140,0.7)'
      ctx.setLineDash([5, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // measured: running averages per fundamental
      const ptCols = [[220, 30, 30], [200, 160, 20], [0, 170, 130], [50, 90, 255]]
      ctx.textAlign = 'left'
      for (let i = 0; i < BANDS.length; i++) {
        const bin = exp.bins[i]
        if (bin.n === 0) continue
        const A = bin.sumA / bin.n
        const x = qx(BANDS[i]), y = ay(A)
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fillStyle = rgb(ptCols[i])
        ctx.fill()
        ctx.strokeStyle = '#3a3125'
        ctx.stroke()
        ctx.fillStyle = '#4a3f2c'
        ctx.font = '11px "IBM Plex Mono", monospace'
        ctx.fillText(
          BAND_NAMES[i] + ' ÷' + A.toExponential(1).replace('e+', '×10^') + ' (n=' + bin.n + ')',
          x + 9, y + 4)
      }

      // legend + axes
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.fillStyle = 'rgba(180,130,40,1)'
      ctx.fillText('— expected (note\u2019s table)', padL + 4, padT + 12)
      ctx.fillStyle = 'rgba(0,150,140,1)'
      ctx.fillText('- - complete thermalization', padL + 4, padT + 28)
      ctx.fillStyle = '#715f43'
      ctx.textAlign = 'left'
      ctx.fillText('quark frequency →', padL, padT + ih + 34)
      ctx.save()
      ctx.translate(14, padT + ih / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.textAlign = 'center'
      ctx.fillText('attenuation ÷', 0, 0)
      ctx.restore()
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, padT + ih); ctx.lineTo(padL + iw, padT + ih)
      ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + ih)
      ctx.stroke()
    }

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const exp = expRef.current
      const s = seen.current
      if (playingRef.current || exp !== s.exp || exp.version !== s.version) {
        s.exp = exp; s.version = exp.version
        draw()
      }
    }
    draw()
    loop()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 340 }} />
}

// ---- where the pulses actually land ----
let planckTotal = 0 // ∫ B_ν dν at 5778 K, for normalizing the theory curve
function planckNorm() {
  if (planckTotal) return planckTotal
  let tot = 0
  const N = 400
  for (let i = 1; i <= N; i++) {
    const nu = Math.pow(10, 12 + (i / N) * 5)
    const dnu = nu * Math.LN10 * (5 / N)
    tot += planckNu(nu, T_PHOT) * dnu
  }
  planckTotal = tot
  return tot
}

function LandingPanel({ expRef, playingRef }) {
  const ref = useRef(null)
  const seen = useRef({ exp: null, version: -1 })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

    const draw = () => {
      const exp = expRef.current
      const w = canvas.clientWidth, h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const padL = 16, padR = 16
      const iw = w - padL - padR

      // ---- the visible spectrum with the four fundamentals ----
      const AX_LO = 3.8e14, AX_HI = 8.1e14
      const barY = 30, barH = 24
      const tOf = (nu) => (nu - AX_LO) / (AX_HI - AX_LO)
      const X = (t) => padL + t * iw
      const grad = ctx.createLinearGradient(padL, 0, padL + iw, 0)
      for (let i = 0; i <= 72; i++) {
        const nu = AX_LO + (i / 72) * (AX_HI - AX_LO)
        grad.addColorStop(i / 72, rgb(visibleColor(nu)))
      }
      ctx.fillStyle = grad
      ctx.fillRect(padL, barY, iw, barH)
      ctx.strokeStyle = 'rgba(107,90,62,0.35)'
      ctx.strokeRect(padL, barY, iw, barH)
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.fillStyle = '#715f43'
      ctx.textAlign = 'left'
      ctx.fillText('infrared cutoff · 4.00e14 Hz', padL, barY - 8)
      ctx.textAlign = 'right'
      ctx.fillText('ultraviolet cutoff · 7.89e14 Hz', padL + iw, barY - 8)

      // the four fundamentals, where they actually landed — clamped at the
      // edges, staggered so they stay readable while they settle
      const ptCols = [[220, 30, 30], [200, 160, 20], [0, 170, 130], [50, 90, 255]]
      ctx.textAlign = 'center'
      for (let i = 0; i < BANDS.length; i++) {
        const bin = exp.bins[i]
        const laneY = barY + barH + 14 + i * 20
        if (bin.n === 0) {
          ctx.fillStyle = 'rgba(113,95,67,0.5)'
          ctx.fillText(BAND_NAMES[i] + ' — waiting for data', padL + iw / 2, laneY)
          continue
        }
        const nuMean = bin.sumNu / bin.n
        const nuClamped = Math.max(VIS_LO, Math.min(VIS_HI, nuMean))
        const x = X(tOf(nuClamped))
        ctx.strokeStyle = 'rgba(58,49,37,0.9)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(x, barY + barH)
        ctx.lineTo(x, laneY - 4)
        ctx.stroke()
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, laneY - 4, 4, 0, Math.PI * 2)
        ctx.fillStyle = rgb(ptCols[i])
        ctx.fill()
        ctx.strokeStyle = '#3a3125'
        ctx.stroke()
        ctx.fillStyle = '#4a3f2c'
        const edge = nuMean < VIS_LO ? ' (IR edge)' : nuMean > VIS_HI ? ' (UV edge)' : ''
        ctx.fillText(BAND_NAMES[i] + edge, x, laneY + 10)
      }

      // ---- the landed spectrum: histogram vs the 5778 K blackbody ----
      const plotY = 190, plotH = 150
      const qx = (nu) => padL + ((Math.log10(nu) - HIST_L0) / (HIST_L1 - HIST_L0)) * iw
      let hMax = 1
      for (let i = 0; i < HIST_N; i++) hMax = Math.max(hMax, exp.hist[i])
      const hy = (c) => plotY + plotH - (c / hMax) * plotH
      // theory: the full-thermalization blackbody at the photosphere
      const norm = planckNorm()
      ctx.beginPath()
      for (let i = 0; i <= 120; i++) {
        const nu = Math.pow(10, HIST_L0 + (i / 120) * (HIST_L1 - HIST_L0))
        const dnu = nu * Math.LN10 * ((HIST_L1 - HIST_L0) / HIST_N)
        const expected = exp.histN * (planckNu(nu, T_PHOT) * dnu) / norm
        const x = qx(nu), y = hy(expected)
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0,150,140,0.8)'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.lineWidth = 1
      // histogram bars
      const bw = iw / HIST_N
      for (let i = 0; i < HIST_N; i++) {
        const c = exp.hist[i]
        if (c <= 0) continue
        const nuMid = Math.pow(10, HIST_L0 + ((i + 0.5) / HIST_N) * (HIST_L1 - HIST_L0))
        ctx.fillStyle = rgb(visibleColor(nuMid), 0.75)
        ctx.fillRect(qx(Math.pow(10, HIST_L0 + (i / HIST_N) * (HIST_L1 - HIST_L0))) + 0.5,
          hy(c), bw - 1, plotY + plotH - hy(c))
      }
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, plotY + plotH); ctx.lineTo(padL + iw, plotY + plotH)
      ctx.stroke()
      ctx.fillStyle = '#715f43'
      ctx.textAlign = 'left'
      ctx.fillText('landed frequency →', padL, plotY + plotH + 16)
      ctx.fillText('10^13 Hz', padL, plotY + plotH + 32)
      ctx.textAlign = 'right'
      ctx.fillText('10^16.5 Hz', padL + iw, plotY + plotH + 32)
      ctx.textAlign = 'left'
      ctx.fillText('pulses landed: ' + exp.histN, padL, plotY - 8)
      ctx.fillStyle = 'rgba(0,150,140,1)'
      ctx.fillText('— 5778 K blackbody (full thermalization)', padL + 150, plotY - 8)
    }

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const exp = expRef.current
      const s = seen.current
      if (playingRef.current || exp !== s.exp || exp.version !== s.version) {
        s.exp = exp; s.version = exp.version
        draw()
      }
    }
    draw()
    loop()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 400 }} />
}

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (e) => String(e).split('').map((d) => SUP[+d]).join('')

// ---- the second model, assembled ----
export default function SunGradientTest({ entropy = 60000, waveAmp = 0.2, decay = 0.35 }) {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [scatLog, setScatLog] = useState(Math.log10(6e7))
  const expRef = useRef(null)
  if (!expRef.current) expRef.current = freshExperiment(entropy)
  // the accumulating view runs its own experiment — own pulses, own clock,
  // own play/pause/speed — so the two surfaces are independent
  const [accPlaying, setAccPlaying] = useState(false)
  const [accSpeed, setAccSpeed] = useState(1)
  const accExpRef = useRef(null)
  if (!accExpRef.current) accExpRef.current = freshExperiment(entropy)
  const accCtlRef = useRef({})
  // the thermal view: its own slower-firing experiment, so the cooling
  // between hits is visible
  const [thPlaying, setThPlaying] = useState(false)
  const [thSpeed, setThSpeed] = useState(1)
  const thExpRef = useRef(null)
  if (!thExpRef.current) thExpRef.current = freshExperiment(entropy)
  const thCtlRef = useRef({})
  const dirtyRef = useRef(0)
  const playingRef = useRef(false)
  playingRef.current = playing
  const ctlRef = useRef({})

  // a new entropy seed or a new scattering count restarts the flash
  // experiment — the graphs rebuild themselves from the new recorded
  // history. The accumulating view is locked at the standard S, so it
  // only restarts on a new entropy seed.
  useEffect(() => {
    expRef.current = freshExperiment(entropy)
    dirtyRef.current += 1
  }, [entropy, scatLog])
  useEffect(() => {
    accExpRef.current = freshExperiment(entropy)
    dirtyRef.current += 1
  }, [entropy])
  useEffect(() => {
    thExpRef.current = freshExperiment(entropy)
    dirtyRef.current += 1
  }, [entropy])

  ctlRef.current = {
    playing, speed, entropy, waveAmp, decay,
    S: Math.pow(10, scatLog),
    fireRate: 2, // doubled so the surface sees more action
  }
  accCtlRef.current = {
    playing: accPlaying, speed: accSpeed, entropy, waveAmp, decay,
    S: 6e7, // locked at the standard scattering count — no slider
    fireRate: 0.25, // slow — the mosaic turns over lazily
  }
  thCtlRef.current = {
    playing: thPlaying, speed: thSpeed, entropy, waveAmp, decay,
    S: 6e7, // locked at the standard scattering count — no slider
    fireRate: 0.5, // slow firing, so the cooling between hits is visible
  }

  const Sfmt = (v) => {
    const e = Math.floor(v + 1e-9)
    const m = Math.pow(10, v - e)
    return '≈' + m.toFixed(1) + '×10' + sup(e)
  }

  return (
    <>
      <div className="graph-box">
        <div className="quark-intro-body">
          <p>
            Now the test. The table above lists what the temperature
            gradient would have to do — those attenuation factors were
            drawn from the gradient picture, so we expect this model to
            reproduce them. This time there is no table: each pulse carries
            its quark frequency outward through an actual temperature
            profile, shedding energy by Compton scattering at every step —
            sped up, with <em>S</em> representative scatterings standing in
            for ~10<sup>25</sup>. When a pulse reaches the surface we record
            how far it was actually divided down, and the graphs build
            themselves from that recorded history: running averages per
            fundamental that wobble, then settle. If the model is right, the
            measured points land on the expected curve.
          </p>
          <p>
            A note on entropy: the Sun's real entropy is ~10<sup>35</sup> J/K
            — it's listed with the equations below — but that's far beyond
            anything simulable. Here entropy stays our relative 0–1,000,000
            dial, and changing it reseeds the experiment. And this gradient
            model is a first attempt: improve it, change the conditions, and
            watch whether the measured points move toward the expected curve
            or away from it.
          </p>
          <p>
            One condition changed since the first version: the four
            fundamentals are no longer all born in the same sphere. Each
            gets its own generator sphere, radii in the ratio 1:2:3:4 — the
            1/3 f<sub>q</sub> sphere deepest, the 4/3 f<sub>q</sub> sphere
            reaching furthest toward the surface. The idea is that
            higher-frequency quark combinations assemble where the
            pressure is lower, so they climb less of the gradient and cool
            less. A journey starting further out also escapes in fewer
            scatterings — a random walk's steps go as the optical depth to
            the surface raised to a power: 2 for a uniform medium,
            steepened to 2.5 here as a small step toward a
            centrally-concentrated star, where the optical depth from a
            birth radius grows faster than the remaining path — so each
            journey gets S(1−x<sub>0</sub>)<sup>2.5</sup> scatterings, where
            x<sub>0</sub> is the birth radius. Watch
            what this does to the curve: it should bend the measured
            attenuation away from a straight line and toward the table's
            gentler slope.
          </p>
        </div>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Climbing the gradient</div>
        </div>
        <GradientSurface expRef={expRef} ctlRef={ctlRef} dirtyRef={dirtyRef} mode="flash" />
        <p className="graph-note">
          Each pulse leaves its own generator sphere carrying its quark
          frequency — MeV gamma, ultraviolet clamp — and cools as it climbs
          the gradient: violet, through the visible, into the infrared
          clamp. What reaches the surface escapes as thermal light, and its
          attenuation is recorded below. This surface has its own Transport.
        </p>
        <Transport
          playing={playing}
          speed={speed}
          onPlayingChange={setPlaying}
          onSpeedChange={setSpeed}
        />
        <div style={{ maxWidth: 340, marginTop: 8 }}>
          <Slider
            label="scatterings per journey"
            value={scatLog}
            min={Math.log10(2e7)}
            max={Math.log10(2e8)}
            step={0.01}
            onChange={setScatLog}
            format={Sfmt}
          />
        </div>
        <p className="graph-note">
          The scattering count is the model's main condition: more
          scatterings, more complete the cooling. Changing it restarts the
          experiment — the graphs rebuild from the new history.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Measured vs expected attenuation</div>
        </div>
        <AttenuationGraph expRef={expRef} playingRef={playingRef} />
        <p className="graph-note">
          Gold is the expected attenuation from the note's table; teal
          dashed is complete thermalization — every input landing at the
          photosphere's mean blackbody photon energy, 2.7·kT. The dots are
          the running measured averages per fundamental: they wobble, then
          settle. If the model reproduces the table, the dots sit on the
          gold curve.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Where the pulses actually land</div>
        </div>
        <LandingPanel expRef={expRef} playingRef={playingRef} />
        <p className="graph-note">
          The visible spectrum on a fixed scale. The four fundamentals
          position themselves where they actually landed on average —
          clamped at the infrared or ultraviolet edge if they overshoot —
          and keep adjusting until the recorded history settles. Below,
          every landed pulse builds the escaping spectrum; teal is the
          5778 K blackbody of full thermalization.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">The equations</div>
        </div>
        <div className="quark-intro-body">
          <p>
            <em>Solar mass</em> M<sub>☉</sub> = 1.989×10<sup>30</sup> kg ·
            <em> solar radius</em> R<sub>☉</sub> = 6.957×10<sup>8</sup> m ·
            the mass sets the optical depth (how many collisions) and,
            through hydrostatic balance, the core temperature and the
            gradient.
          </p>
          <p>
            <em>Temperature profile</em> T(x) = T<sub>phot</sub> +
            (T<sub>core</sub> − T<sub>phot</sub>)(1−x)<sup>2</sup>, with
            x = r/R<sub>☉</sub> the fractional radius — an analytic
            approximation to the standard solar model. T<sub>core</sub> =
            1.5×10<sup>7</sup> K, T<sub>phot</sub> = 5778 K.
          </p>
          <p>
            <em>Compton cooling</em> — per scattering, dE/dn = −(E/m<sub>e</sub>c<sup>2</sup>)(E −
            kT(x)), with m<sub>e</sub>c<sup>2</sup> = 511 keV. Integrated
            exactly over each step's scatterings; n counts scatterings, E is
            the pulse's energy, k = 1.380649×10<sup>−23</sup> J/K,
            h = 6.62607015×10<sup>−34</sup> J·s.
          </p>
          <p>
            <em>Birth spheres</em> — each fundamental is born in its own
            sphere of radius R<sub>gen</sub> = (ν<sub>in</sub>/f<sub>q</sub>)·R<sub>☉</sub>/2,
            in the ratio 1:2:3:4: the 1/3 f<sub>q</sub> sphere deepest, the
            4/3 f<sub>q</sub> sphere reaching 0.67 R<sub>☉</sub>. A journey
            starting at fractional radius x<sub>0</sub> gets
            S(1−x<sub>0</sub>)<sup>2.5</sup> scatterings — random-walk
            scaling, steps ∝ (optical depth)<sup>2</sup> for a uniform
            medium, steepened slightly toward a centrally-concentrated
            star — so shallower births genuinely cool less. (Spreading the
            same S over a shorter path would do the opposite.)
          </p>
          <p>
            <em>Representative scatterings</em> S per journey for a
            center-born pulse (slider, default 6×10<sup>7</sup>) — standing
            in for the ~10<sup>25</sup> of the real random walk, which would
            take ~10<sup>5</sup> years of simulated time. The slider sets
            the level of the curve; the birth spheres set its shape.
          </p>
          <p>
            <em>Attenuation</em> A = ν<sub>in</sub>/ν<sub>out</sub> ·
            ν<sub>out</sub> is sampled from the Planck distribution at
            T<sub>eff</sub>, with kT<sub>eff</sub> = E at landing — the
            escaping light is re-emitted thermal radiation (mean photon
            energy ≈ 2.7kT<sub>eff</sub>), not the original gamma.
          </p>
          <p>
            <em>The Sun's entropy</em> S<sub>☉</sub> ≈ 1×10<sup>35</sup> J/K
            (order of magnitude, for reference) — far beyond anything
            simulable, which is why the experiment keeps entropy as the
            relative 0–1,000,000 dial.
          </p>
        </div>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">The sun that remembers</div>
        </div>
        <GradientSurface expRef={accExpRef} ctlRef={accCtlRef} dirtyRef={dirtyRef} mode="hold" />
        <p className="graph-note">
          Its own experiment, its own play and clock — independent of the
          flash view above. This surface keeps the color of the most recent
          thing that hit it: when a wavefront crosses, the surface takes
          that flash's color and holds it, fading slowly back toward neutral
          until the next wave repaints it. Only visible colors paint it —
          ultraviolet and infrared waves still ripple the surface as they
          pass, they just don't show their color, so the patch keeps the
          previous one. The result is a slowly-evolving mosaic of recent
          landings instead of a sphere flickering back to bland between
          flashes.
        </p>
        <Transport
          playing={accPlaying}
          speed={accSpeed}
          onPlayingChange={setAccPlaying}
          onSpeedChange={setAccSpeed}
        />
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">The sun that cools</div>
        </div>
        <GradientSurface expRef={thExpRef} ctlRef={thCtlRef} dirtyRef={dirtyRef} mode="thermal" />
        <p className="graph-note">
          Its own experiment, its own play and clock — firing slower, so
          the cooling between hits is visible. Each patch of surface
          accumulates the energy of the visible waves that hit it and
          radiates it away when nothing hits: a fresh hit flares hot and
          blue-white, then fades through yellow and orange toward dark red
          as it cools. The dark patches are the honest sunspots — regions
          the waves haven't visited in a while. Ultraviolet and infrared
          waves still ripple the surface as they pass; they just don't
          heat it.
        </p>
        <Transport
          playing={thPlaying}
          speed={thSpeed}
          onPlayingChange={setThPlaying}
          onSpeedChange={setThSpeed}
        />
      </div>
    </>
  )
}
