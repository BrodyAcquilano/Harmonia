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

// ---- the fifth graph: temperature based on energy flux ----
// Packets are born across the proton-forming shell, 0.2–0.7 R_☉ — equal
// chance at each radius — each with a frequency drawn from the Planck
// distribution at its birth radius's own temperature. Whatever sorting
// happens (or doesn't) comes only from honest structure and honest
// opacity, plus the longer random-walk out for the deeper-born:
//
// structure — the Lane-Emden n=3 polytrope (the Eddington standard
//   model), integrated live below: no tables, no fits. θ(0) = 1,
//   θ′(0) = 0, dθ/dξ = −φ/ξ², dφ/dξ = ξ²θ³; ρ = ρ_c·θ³, T = T_c·θ.
//
// opacity — Kramers (free-free + bound-free) + Thomson. Kramers has the
//   ν⁻³ shape, anchored so κ_ν equals the textbook Rosseland mean
//   κ_R = 3.7e22·(1+X)·ρ·T^−3.5 (cgs, X = 0.7) at the Wien peak
//   hν = 2.8kT; Thomson is 0.34 cm²/g, flat in frequency.
//
// A packet random-walks outward. One hop on screen (5% of the radius)
// stands in for (hop/mean-free-path)² honest scatterings — the readout
// shows that number, ~10²² down in the core. Compton thermalization
// needs only ~m_e c²/kT ~ a few hundred of those, across centimeters,
// so each hop the packet is fully thermalized: its frequency is sampled
// from the Planck distribution at the local temperature (a real
// thermalized photon is a draw from the distribution, not the peak
// value) and rides the local temperature outward. Whether the four
// inputs stay resolved is the experiment. The 5% hop is display
// coarse-graining, not physics, and is labeled as such wherever it
// appears.
const RHO_C = 150 // g/cm³ — standard solar model central density
const R_CGS = 6.957e10 // cm
const KAPPA_T = 0.34 // cm²/g — Thomson, fully-ionized solar mix, flat in ν
const HOP_FRAC = 0.05 // display hop, fraction of R_☉ — coarse-graining

function laneEmden() {
  // integrate the Lane-Emden equation live; the surface is where θ = 0
  const xs = [], ths = []
  const h = 0.002
  let x = 1e-6
  let th = 1 - (x * x) / 6 // series start: θ ≈ 1 − ξ²/6
  let ph = (x * x * x) / 3 // φ = −ξ²θ′ ≈ ξ³/3
  for (let i = 0; i < 20000; i++) {
    xs.push(x); ths.push(th)
    const d = (xx, tt, pp) => [-pp / (xx * xx), xx * xx * tt * tt * tt]
    const [a1, b1] = d(x, th, ph)
    const [a2, b2] = d(x + h / 2, th + (h * a1) / 2, ph + (h * b1) / 2)
    const [a3, b3] = d(x + h / 2, th + (h * a2) / 2, ph + (h * b2) / 2)
    const [a4, b4] = d(x + h, th + h * a3, ph + h * b3)
    th += (h * (a1 + 2 * a2 + 2 * a3 + a4)) / 6
    ph += (h * (b1 + 2 * b2 + 2 * b3 + b4)) / 6
    x += h
    if (th <= 0) break
  }
  return { xs, ths, x1: x } // x1 ≈ 6.89685
}
const LE = laneEmden()
function structOf(xf) {
  // fractional radius → { rho in g/cm³, T in K }
  const x = Math.min(0.9999, Math.max(0, xf)) * LE.x1
  const { xs, ths } = LE
  let lo = 0, hi = xs.length - 1
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1
    if (xs[m] <= x) lo = m
    else hi = m
  }
  const f = (x - xs[lo]) / Math.max(xs[hi] - xs[lo], 1e-12)
  const th = Math.max(ths[lo] + (ths[hi] - ths[lo]) * f, 0)
  return { rho: RHO_C * th * th * th, T: Math.max(T_CORE * th, 1) }
}
function kappaNu(nu, rho, T) {
  // Kramers ν⁻³ shape anchored at the Wien peak + flat Thomson
  const kR = 3.7e22 * 1.7 * rho * Math.pow(T, -3.5)
  const x = (H * nu) / (KB * T)
  const xw = 2.8
  const shape = Math.pow(xw / Math.max(x, 1e-9), 3)
    * (1 - Math.exp(-Math.min(x, 60))) / (1 - Math.exp(-xw))
  return kR * Math.min(shape, 1e9) + KAPPA_T
}

const FORGET_N = 48 // 12 packets per quark frequency
// thermal-surface tuning for the forget view: every escape deposits its
// photon's energy as heat in a small patch around its exit direction —
// the surface temperature is the local escaping energy flux — and each
// patch cools by Newton's law, like the cools view
const FORGET_GAIN = 0.5 // eV deposited per eV of escaping photon, at the splash center
const SPLASH_SIG = 0.12 // radians — the splash patch size
// blackbody surface: a patch at temperature T (eV) glows with the visible
// light a blackbody at T produces — the hue is the spectral color of kT,
// the brightness is the real Planck integral over the visible band,
// normalized at the band's top edge. cold patches make almost no visible
// light, so they sit near black; hot ones blaze
const BB_N = 48, BB_T0 = 0.5, BB_T1 = 8
const bbVis = new Float64Array(BB_N + 1)
for (let i = 0; i <= BB_N; i++) {
  const T = BB_T0 + (BB_T1 - BB_T0) * i / BB_N
  let s = 0
  for (let j = 0; j < 48; j++) {
    const nu = VIS_LO + (VIS_HI - VIS_LO) * (j + 0.5) / 48
    s += Math.pow(nu, 3) / (Math.exp((nu * H / EV) / T) - 1)
  }
  bbVis[i] = s
}
const BB_REF = bbVis[Math.round((3.26 - BB_T0) / (BB_T1 - BB_T0) * BB_N)]
function visBrightness(T) {
  const x = Math.min(BB_N, Math.max(0, (T - BB_T0) / (BB_T1 - BB_T0) * BB_N))
  const i = Math.floor(x), f = x - i
  const v = bbVis[i] * (1 - f) + bbVis[Math.min(BB_N, i + 1)] * f
  return Math.min(1, v / BB_REF)
}
// warm filter: the thermal hue is compressed onto the black→red→orange→
// yellow range — green through violet are filtered out, so the sphere
// reads as sun colors. the window sits so the typical patch temperature
// lands between yellow and orange; hotter patches clamp to yellow.
const WARM_T0 = 1.65 // eV — red edge of the visible band
const WARM_T1 = 2.61 // eV — yellow; hotter clamps to yellow
function warmHue(T) {
  const x = Math.min(1, Math.max(0, (T - WARM_T0) / (WARM_T1 - WARM_T0)))
  return rainbow(x / 3) // rainbow 0→1/3 spans red→orange→yellow
}
// this view is decoupled from the entropy slider — its own fixed seed.
// (a bigger seed isn't "more random"; it just picks a different stream,
// so the value only needs to be fixed, not large.)
const FORGET_ENTROPY = 8888888888
// forget ripples: each escaping photon launches a wave on the sphere.
// the amplitude carries the photon's energy; the oscillation rate and
// wavelength are slowed and widened so we can see them — visualization
// choices, like the coarse-grained hops
const RIPPLE_K = 18    // angular wavenumber — ring wavelength ~0.35 rad
const RIPPLE_W = 6     // visual oscillation rate, radians per sim-second
const RIPPLE_SIG = 0.5 // angular decay of the wave, radians
const RIPPLE_TAU = 2.5 // wave lifetime, sim-seconds
const RIPPLE_G = 0.02  // fractional radius per eV of wave amplitude, at slider 1
function spawnForgetPacket(rng, band, t) {
  // born across the proton-forming shell, 0.2–0.7 R_☉ — equal chance at
  // each radius — with a frequency drawn from the Planck distribution at
  // the birth radius's own temperature. the deeper-born take longer to
  // random-walk out, so their surface hits arrive later: the relative
  // time delay is the walk itself (~2x the hops from 0.2 as from 0.7).
  const r0 = (0.2 + 0.5 * rng()) * SURF_R0
  const th = rng() * Math.PI * 2
  const ph = Math.acos(2 * rng() - 1)
  const T0 = structOf(r0 / SURF_R0).T
  return {
    x: r0 * Math.sin(ph) * Math.cos(th),
    y: r0 * Math.sin(ph) * Math.sin(th),
    z: r0 * Math.cos(ph),
    band,
    nu: Math.max(samplePlanck(T0, rng), 1e10),
    nscat: 0,
    rBirth: r0 / SURF_R0,
    tBirth: t,
  }
}
function freshForgetExperiment(entropy) {
  const rng = mulberry32(Math.floor(entropy * 2654435761) % 4294967296)
  const packets = []
  for (let i = 0; i < FORGET_N; i++) packets.push(spawnForgetPacket(rng, i % 4, 0))
  return {
    t: 0, hopAcc: 0, packets, escapes: [0, 0, 0, 0], rng, version: 0,
    // landing records, same shape as the original experiment's, so the
    // same measurement graphs can read this run
    bins: [0, 1, 2, 3].map(() => ({ n: 0, sumA: 0, sumNu: 0 })),
    hist: new Float64Array(HIST_N),
    histN: 0,
    // escape splashes, drained by the 3D view to paint the surface
    splashes: [],
    // escape ripples: each escaping photon launches a wave on the surface
    ripples: [],
  }
}
// one display hop for every packet: an honest 3D random-walk step of
// HOP_FRAC·R_☉ — no outward drift smuggled in — standing in for
// (hop/mean-free-path)² real scatterings, with the frequency sampled
// from the Planck distribution at the local temperature (Compton
// thermalizes in ~10² scatterings over centimeters, utterly negligible
// next to one hop's ~10²²)
function hopForget(exp) {
  const hopScene = HOP_FRAC * SURF_R0
  const hopCm = HOP_FRAC * R_CGS
  for (const p of exp.packets) {
    const rScene = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)
    const { rho, T } = structOf(rScene / SURF_R0)
    const kap = kappaNu(p.nu, rho, T)
    const l = 1 / Math.max(kap * rho, 1e-300) // cm
    p.nscat = (hopCm / l) * (hopCm / l)
    const th = exp.rng() * Math.PI * 2
    const ph = Math.acos(2 * exp.rng() - 1)
    let nx = p.x + hopScene * Math.sin(ph) * Math.cos(th)
    let ny = p.y + hopScene * Math.sin(ph) * Math.sin(th)
    let nz = p.z + hopScene * Math.cos(ph)
    let nr = Math.sqrt(nx * nx + ny * ny + nz * nz)
    if (nr < 1e-9) { nx = hopScene; ny = 0; nz = 0; nr = hopScene }
    if (nr >= SURF_R0) {
      // the packet is fully thermalized by now — what escapes is the
      // photosphere's own light, not the birth photon. Same treatment
      // as the original experiment's land(): sample the escaping
      // frequency from the Planck distribution at 5778 K.
      const nuOut = Math.max(samplePlanck(T_PHOT, exp.rng), 1e10)
      const b = p.band
      const bin = exp.bins[b]
      bin.n += 1
      bin.sumA += BANDS[b] / nuOut
      bin.sumNu += nuOut
      // a splash for the 3D view: exit direction + escaping frequency,
      // so the surface can flare where this packet got out — and a wave,
      // launched at the exit point with the photon's energy
      if (exp.splashes.length < 128) {
        exp.splashes.push({ dx: nx / nr, dy: ny / nr, dz: nz / nr, nuOut })
      }
      if (exp.ripples.length < 256) {
        exp.ripples.push({ dx: nx / nr, dy: ny / nr, dz: nz / nr, t0: exp.t, amp: (nuOut * H) / EV })
      }
      const hb = Math.floor(
        ((Math.log10(nuOut) - HIST_L0) / (HIST_L1 - HIST_L0)) * HIST_N)
      if (hb >= 0 && hb < HIST_N) exp.hist[hb] += 1
      exp.histN += 1
      exp.escapes[b] += 1
      exp.version += 1
      Object.assign(p, spawnForgetPacket(exp.rng, b, exp.t))
      continue
    }
    p.x = nx; p.y = ny; p.z = nz
    const Tn = structOf(nr / SURF_R0).T
    // thermalized by the hop's ~10²² scatterings — but a real thermalized
    // photon is a draw from the Planck distribution at the local
    // temperature, not the peak value, so sample it
    p.nu = Math.max(samplePlanck(Tn, exp.rng), 1e10)
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

// ---- the fifth graph: watch the frequencies forget ----
function ForgetSurface({ expRef, ctlRef, dirtyRef }) {
  const mountRef = useRef(null)
  const readRef = useRef(null)
  const phosRef = useRef(null)
  const phosExpRef = useRef(null)

  useEffect(() => {
    const S = setupScene(mountRef.current)
    S.camDirty = false
    S.controls.addEventListener('change', () => { S.camDirty = true })

    // the thermal treatment, like the cools view: the sphere itself is
    // painted by escaping light — fresh escapes flare blue-white,
    // neglected patches cool back to dark red
    const sphGeo = new THREE.SphereGeometry(SURF_R0, SURF_SEG, SURF_RINGS)
    const sCount = sphGeo.attributes.position.count
    const sBase = new Float32Array(sphGeo.attributes.position.array) // pristine copy — ripples displace from this
    const uDir = new Float32Array(sCount * 3)
    for (let v = 0; v < sCount; v++) {
      const l = Math.hypot(sBase[v * 3], sBase[v * 3 + 1], sBase[v * 3 + 2]) || 1
      uDir[v * 3] = sBase[v * 3] / l
      uDir[v * 3 + 1] = sBase[v * 3 + 1] / l
      uDir[v * 3 + 2] = sBase[v * 3 + 2] / l
    }
    sphGeo.setAttribute('color',
      new THREE.BufferAttribute(new Float32Array(sCount * 3).fill(1), 3))
    sphGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 8)
    const sph = new THREE.Mesh(sphGeo,
      new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.05 }))
    sph.frustumCulled = false
    const wire = new THREE.Mesh(sphGeo,
      new THREE.MeshBasicMaterial({ color: 0xb09a5e, wireframe: true, transparent: true, opacity: 0.1 }))
    wire.frustumCulled = false
    S.scene.add(sph, wire)
    const P = new Float32Array(sCount * 3)
    resetSurface(P, 'thermal', sCount)
    phosRef.current = P
    phosExpRef.current = expRef.current

    const paintSurface = (exp, sdt) => {
      // drain the escape splashes: every escape deposits its photon's
      // energy as heat — each patch's temperature is the local escaping
      // energy flux
      if (exp.splashes.length) {
        for (const sp of exp.splashes) {
          const eV = (sp.nuOut * H) / EV
          for (let v = 0; v < sCount; v++) {
            const d = uDir[v * 3] * sp.dx + uDir[v * 3 + 1] * sp.dy + uDir[v * 3 + 2] * sp.dz
            if (d < 0.85) continue
            P[v * 3] += FORGET_GAIN * eV * Math.exp(-(1 - d) / (SPLASH_SIG * SPLASH_SIG))
          }
        }
        exp.splashes.length = 0
      }
      const colA = sphGeo.attributes.color
      const posA = sphGeo.attributes.position
      const coolF = sdt > 0 ? (1 - Math.exp(-sdt / COOL_TAU)) : 0
      const rippleGain = ctlRef.current.ripple ?? 1
      // prune spent waves — ripples are pushed in time order
      while (exp.ripples.length && exp.t - exp.ripples[0].t0 > 4 * RIPPLE_TAU) exp.ripples.shift()
      for (let v = 0; v < sCount; v++) {
        const o = v * 3
        if (coolF > 0) P[o] += (T_BASE - P[o]) * coolF
        // blackbody color through the warm filter: sun-range hue, and
        // brightness from the real visible-band Planck integral at T
        const tc = warmHue(P[o])
        const br = visBrightness(P[o])
        colA.setXYZ(v, (tc[0] / 255) * br, (tc[1] / 255) * br, (tc[2] / 255) * br)
      }
      colA.needsUpdate = true
      // waves: every escaping photon radiates a damped ring from its exit
      // point — amplitude carries the photon's energy, the ripple slider
      // scales it all, colors untouched
      for (let v = 0; v < sCount; v++) {
        const o = v * 3
        let h = 0
        if (rippleGain > 0 && exp.ripples.length) {
          const ux = uDir[o], uy = uDir[o + 1], uz = uDir[o + 2]
          for (let r = 0; r < exp.ripples.length; r++) {
            const rp = exp.ripples[r]
            const age = exp.t - rp.t0
            let d = ux * rp.dx + uy * rp.dy + uz * rp.dz
            d = d > 1 ? 1 : d < -1 ? -1 : d
            const th = Math.acos(d)
            h += rp.amp * Math.cos(RIPPLE_K * th - RIPPLE_W * age)
              * Math.exp(-th / RIPPLE_SIG) * Math.exp(-age / RIPPLE_TAU)
          }
        }
        const f = 1 + RIPPLE_G * rippleGain * h
        posA.setXYZ(v, sBase[o] * f, sBase[o + 1] * f, sBase[o + 2] * f)
      }
      posA.needsUpdate = true
      sphGeo.computeVertexNormals()
    }

    const readout = (exp) => {
      if (!readRef.current) return
      const p = exp.packets[0]
      const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) / SURF_R0
      const { T } = structOf(Math.min(r, 1))
      const eV = (p.nu * H) / EV
      const eVstr = eV >= 1000 ? (eV / 1000).toFixed(1) + ' keV' : eV.toFixed(2) + ' eV'
      readRef.current.textContent =
        'a packet now: r/R\u2609 = ' + r.toFixed(2) +
        ' \u00b7 T = ' + T.toExponential(1) + ' K' +
        ' \u00b7 h\u03bd = ' + eVstr +
        ' \u00b7 one hop \u2248 ' + p.nscat.toExponential(0) + ' scatterings'
    }

    let raf = 0
    let last = performance.now()
    let seenDirty = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const ctl = ctlRef.current
      const exp = expRef.current
      if (phosExpRef.current !== exp) {
        phosExpRef.current = exp
        resetSurface(phosRef.current, 'thermal', sCount)
      }
      if (ctl.playing) {
        const sdt = dt * ctl.speed
        exp.t += sdt
        exp.hopAcc += sdt * 60
        while (exp.hopAcc >= 1) { hopForget(exp); exp.hopAcc -= 1 }
        paintSurface(exp, sdt)
        readout(exp)
        const n = exp.escapes[0] + exp.escapes[1] + exp.escapes[2] + exp.escapes[3]
        S.timeTag.textContent = 't = ' + exp.t.toFixed(1) + ' s \u00b7 escaped ' + n
        S.controls.update()
        S.renderer.render(S.scene, S.camera)
        return
      }
      // paused: frozen — no recomputation, no renders, until the camera
      // moves or a parameter changes
      S.controls.update()
      let dirty = false
      if (S.camDirty) { S.camDirty = false; dirty = true }
      if (dirtyRef.current !== seenDirty) { seenDirty = dirtyRef.current; dirty = true }
      if (dirty) {
        paintSurface(exp, 0)
        readout(exp)
        S.renderer.render(S.scene, S.camera)
      }
    }
    paintSurface(expRef.current, 0)
    readout(expRef.current)
    loop()
    return () => { cancelAnimationFrame(raf); disposeScene(S) }
  }, [])

  return (
    <div className="sim-stage-col">
      <div ref={mountRef} className="quark-canvas-wrap" />
      <div ref={readRef} className="graph-note" />
    </div>
  )
}

// ---- the crash plot, on its own: birth frequencies onto the thermal curve ----
function ForgetTrack({ expRef, playingRef }) {
  const ref = useRef(null)
  const seen = useRef({ exp: null, version: -1 })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !canvas.clientWidth) return
    const ctx = canvas.getContext('2d')
      // the test result, drawn: log frequency against fractional radius.
      // The gold curve is the local thermal peak 2.8kT/h from the
      // Lane-Emden structure; the four colored dots are the quark
      // frequencies at birth — all at the core — with their crash lines.
      const BAND_COLS = ['#ff6b6b', '#ffa94d', '#69db7c', '#4dabf7']
      const draw = (exp) => {
        const cv = canvas
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        const W = cv.clientWidth, Hh = cv.clientHeight
        if (cv.width !== Math.round(W * dpr)) {
          cv.width = Math.round(W * dpr)
          cv.height = Math.round(Hh * dpr)
        }
        const ctx = cv.getContext('2d')
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, W, Hh)
        const L0 = 14, L1 = 21
        const X = (x) => 46 + x * (W - 62)
        const Y = (l) => 12 + (1 - (l - L0) / (L1 - L0)) * (Hh - 44)
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.strokeStyle = 'rgba(120,90,40,.55)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(46, 12); ctx.lineTo(46, Hh - 32); ctx.lineTo(W - 16, Hh - 32)
        ctx.stroke()
        ctx.fillStyle = '#8a6d3b'
        ctx.fillText('r / R☉', W - 52, Hh - 12)
        ctx.save()
        ctx.translate(13, Hh / 2); ctx.rotate(-Math.PI / 2)
        ctx.textAlign = 'center'
        ctx.fillText('log₁₀ ν (Hz)', 0, 0)
        ctx.restore()
        ctx.textAlign = 'left'
        for (let l = L0; l <= L1; l++) {
          ctx.fillStyle = 'rgba(138,109,59,.8)'
          ctx.fillText(String(l), 30, Y(l) + 4)
          ctx.strokeStyle = 'rgba(120,90,40,.18)'
          ctx.beginPath(); ctx.moveTo(46, Y(l)); ctx.lineTo(W - 16, Y(l)); ctx.stroke()
        }
        ctx.strokeStyle = '#c9962e'
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i <= 120; i++) {
          const x = (i / 120) * 0.995
          const { T } = structOf(x)
          const l = Math.max(Math.log10((2.8 * KB * T) / H), L0)
          const px = X(x), py = Y(l)
          if (i) ctx.lineTo(px, py)
          else ctx.moveTo(px, py)
        }
        ctx.stroke()
        ctx.fillStyle = '#8a6d3b'
        ctx.fillText('2.8kT/h — the thermal peak', X(0.55), Y(16.6))
        const { T: Tc } = structOf(0.01)
        const lw = Math.log10((2.8 * KB * Tc) / H)
        for (let b = 0; b < 4; b++) {
          const lb = Math.log10(BANDS[b])
          ctx.strokeStyle = BAND_COLS[b]
          ctx.setLineDash([4, 3])
          ctx.beginPath(); ctx.moveTo(X(0.01), Y(lb)); ctx.lineTo(X(0.01), Y(lw)); ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = BAND_COLS[b]
          ctx.beginPath(); ctx.arc(X(0.01), Y(lb), 4, 0, 7); ctx.fill()
          ctx.fillText(BAND_NAMES[b], X(0.01) + 9, Y(lb) - 12 + b * 12)
        }
        ctx.fillStyle = '#8a6d3b'
        ctx.fillText('born at the core — same place', X(0.01) + 9, Y(20.92))
        for (let i = 0; i < Math.min(12, FORGET_N); i++) {
          const p = exp.packets[i]
          const r = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) / SURF_R0
          ctx.fillStyle = BAND_COLS[p.band]
          ctx.beginPath()
          ctx.arc(X(Math.min(r, 1)), Y(Math.max(Math.log10(Math.max(p.nu, 1)), L0)), 3, 0, 7)
          ctx.fill()
        }
      }

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      const exp = expRef.current
      const q = seen.current
      if (playingRef.current || exp !== q.exp || exp.version !== q.version) {
        q.exp = exp; q.version = exp.version
        draw(exp)
      }
    }
    draw(expRef.current)
    loop()
    const ro = new ResizeObserver(() => draw(expRef.current))
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 230 }} />
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
  // the forget view: its own experiment — all four frequencies born at
  // the core, no assigned radii; the physics sorts them (or doesn't)
  const [frPlaying, setFrPlaying] = useState(false)
  const [frSpeed, setFrSpeed] = useState(1)
  const [frRipple, setFrRipple] = useState(1)
  const frExpRef = useRef(null)
  if (!frExpRef.current) frExpRef.current = freshForgetExperiment(FORGET_ENTROPY)
  const frCtlRef = useRef({})
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
  frCtlRef.current = {
    playing: frPlaying, speed: frSpeed, entropy, ripple: frRipple,
  }
  const frPlayingRef = useRef(false)
  frPlayingRef.current = frPlaying

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

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Temperature based on energy flux</div>
        </div>
        <ForgetSurface expRef={frExpRef} ctlRef={frCtlRef} dirtyRef={dirtyRef} />
        <p className="graph-note">
          Its own experiment, its own play and clock, its own fixed entropy
          seed — decoupled from the entropy slider, which no longer
          reseeds this view. Packets are born
          across the proton-forming shell, 0.2–0.7 R_☉, equal chance at
          each radius, each with a frequency drawn from the Planck
          distribution at its birth radius's own temperature. Each
          packet random-walks outward through a real stellar structure
          (the Lane-Emden n=3 polytrope, integrated live), one twentieth
          of a radius per hop — every hop stands in for
          (hop/mean-free-path)² honest scatterings, about 10²² of them
          down in the core, and the readout says so. Compton
          thermalization needs only a few hundred, across centimeters, so
          each hop fully thermalizes the packet: its frequency is sampled
          from the Planck distribution at the local temperature — a real
          thermalized photon is a draw from the distribution, not the peak
          value — and rides the local temperature outward: ultraviolet in
          the deep interior, cooling through the visible near the surface.
          The deeper-born take longer to random-walk out — about twice the
          hops from 0.2 as from 0.7 — so their surface hits arrive later;
          the relative time delay is the walk itself. The sphere is a
          blackbody surface: every escape deposits its photon's energy
          as heat in a small patch around its exit direction, so each
          patch's temperature is the local escaping energy flux, cooling
          by Newton's law between hits. A patch glows with the visible
          light a blackbody at its temperature produces, seen through a
          warm filter — the hue runs only black→red→orange→yellow, green
          through violet filtered out, centered so the typical patch glows
          between yellow and orange; the brightness is the real Planck
          integral over the visible band: cold patches make almost no
          visible light and sit near black, hot ones blaze yellow — and
          every escape launches a wave there too, its amplitude the
          escaping photon's energy, rippling outward and dying away
          (slowed down so we can see it). The ripple slider scales the
          waves only; the colors are untouched.
        </p>
        <Transport
          playing={frPlaying}
          speed={frSpeed}
          onPlayingChange={setFrPlaying}
          onSpeedChange={setFrSpeed}
        />
        <div className="transport-speed">
          <Slider label="ripple" value={frRipple} min={0} max={3} step={0.1}
            onChange={setFrRipple} format={(v) => `${v.toFixed(1)}×`} />
        </div>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Measured vs expected attenuation — the shell-born run</div>
        </div>
        <AttenuationGraph expRef={frExpRef} playingRef={frPlayingRef} />
        <p className="graph-note">
          Same layout as the other run: gold is the expected attenuation
          from the note's table — the division the old model said each
          fundamental needed — teal dashed is complete thermalization.
          The dots are what this run actually produces, per birth band.
          If the forget model is right, the dots sit on teal, not gold:
          every input divided down to the same surface light.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Where the shell-born pulses actually land</div>
        </div>
        <LandingPanel expRef={frExpRef} playingRef={frPlayingRef} />
        <p className="graph-note">
          The visible spectrum on a fixed scale; the four bands mark where
          their light actually landed on average. Below, every escaped
          packet builds the escaping spectrum, teal the 5778 K blackbody.
          If birth is truly forgotten, the four markers pile onto the same
          place and the bars follow the teal curve.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Four births, one curve</div>
        </div>
        <ForgetTrack expRef={frExpRef} playingRef={frPlayingRef} />
        <p className="graph-note">
          The test result, drawn: log frequency against fractional radius.
          The gold curve is the local thermal peak from the Lane-Emden
          structure; the four colored dots are the birth frequencies —
          all at the core — with their crash lines into the one curve.
          What escapes is set by the surface, not by the birth.
        </p>
      </div>
    </>
  )
}
