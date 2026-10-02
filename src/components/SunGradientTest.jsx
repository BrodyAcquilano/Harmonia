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
// full spectrum: dark red through orange, yellow, green, blue, purple
// to violet. the warping decides which temperatures get which colors —
// the palette itself spans the whole visible range.
const SPECTRUM_STOPS = [
  [120, 10, 0],    // dark red — cold end
  [220, 50, 0],    // red-orange
  [255, 130, 0],   // orange
  [255, 220, 20],  // yellow
  [60, 200, 70],   // green
  [40, 120, 235],  // blue
  [110, 60, 210],  // purple
  [170, 80, 230],  // violet — hot end
]
// adaptive warping: inverse-density mapping with a cold-stretch bias.
// x(T) is FLAT where the amplitude is high — dense regions get wide
// temperature ranges per color, so the color "stretches" over the bulk
// (the sun reads mostly orange) — and STEEP where thin (narrow ranges,
// "compressed"). the weight tilts with T^2 on top: red compresses less
// than ultraviolet, so the cold side stretches wide and calm while the
// hot side compresses. higher amplitudes stretch the color range because
// theres more area there; lower areas compress. recomputed from the live
// histogram, so it tracks the simulation as it unfolds.
// infrared is displayed as dark, not filtered out.
const AD_N = 96, AD_T0 = 1.0, AD_T1 = 6.0, AD_TAU = 45
const adHist = new Float64Array(AD_N)
const adX = new Float64Array(AD_N) // warping lookup: histogram bin -> gradient x
// default distribution: a broad guess centered near 2.4 eV, so the
// mapping is sane from frame one — real data takes over within seconds
for (let i = 0; i < AD_N; i++) {
  const T = AD_T0 + (AD_T1 - AD_T0) * (i + 0.5) / AD_N
  adHist[i] = 2337 * Math.exp(-(((T - 2.4) / 1.5) ** 2))
  adX[i] = i / (AD_N - 1)
}
function warmHue(T) {
  const bx = Math.min(AD_N - 1, Math.max(0, Math.floor((T - AD_T0) / (AD_T1 - AD_T0) * AD_N)))
  const x = adX[bx]
  const sx = x * (SPECTRUM_STOPS.length - 1)
  const si = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(sx))
  const sf = sx - si
  const a = SPECTRUM_STOPS[si], b = SPECTRUM_STOPS[si + 1]
  return [
    Math.round(a[0] + (b[0] - a[0]) * sf),
    Math.round(a[1] + (b[1] - a[1]) * sf),
    Math.round(a[2] + (b[2] - a[2]) * sf),
  ]
}
// visible-band warping: the same rules, but only the visible band feeds
// the histogram and only it gets colors. below 1.65 eV (750 nm) is
// infrared, above 3.26 eV (380 nm) is ultraviolet. the stretch/compress
// is driven only by the energy in the visible band.
const VIS_T_LO = 1.65
const VIS_T_HI = 3.26
// additive photon colors (third view): each escaping photon deposits its
// spectral color onto the patch it exits through, added to whatever color
// is already there at its current (partially cooled) intensity. colors
// accumulate and fade — no warping, no stretch/compress. the strip under
// the distribution shows the per-temperature average of the accumulated
// surface colors.
//
// exact math, per visible photon (E in eV, 1.65-3.26):
//   hue H = spectral RGB at λ=1240/E, from the palette (0-1)
//   deposit per patch: ΔRGB = H × E × 1.0 × exp(-(1-d)/σ²)
//     (hue × photon energy × gain × spatial gaussian;
//      a central hit saturates to full color, then fades;
//      a 3.26 eV blue photon deposits ~2× the intensity of a 1.65 eV red)
//   per frame: RGB *= exp(-dt/120s)  (slow fade on its own clock, so
//     hits accumulate toward the peach steady state instead of dying
//     between hits; starts dark)
//   display: clamp(RGB, 0, 1)
// equal photon flux across the band averages to the palette mean —
// (255,190,155), a warm peach — not neutral white.
const MIX_COLOR_GAIN = 1.0
// color fades on its own slower clock than the thermal cooling, so that
// repeated hits accumulate toward the peach steady state instead of
// dying back to black between hits
const MIX_TAU = 120
// spectral color of a photon energy (eV), 0-1 RGB. null if not visible.
function photonRGB(eV) {
  if (eV < VIS_T_LO || eV > VIS_T_HI) return null
  const lamNm = 1240 / eV
  const x = Math.min(1, Math.max(0, (750 - lamNm) / (750 - 380)))
  const sx = x * (SPECTRUM_STOPS.length - 1)
  const si = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(sx))
  const sf = sx - si
  const a = SPECTRUM_STOPS[si], b = SPECTRUM_STOPS[si + 1]
  return [
    (a[0] + (b[0] - a[0]) * sf) / 255,
    (a[1] + (b[1] - a[1]) * sf) / 255,
    (a[2] + (b[2] - a[2]) * sf) / 255,
  ]
}
// per-temperature-bin average accumulated RGB, filled by ForgetSurface in
// mix mode, read by TempDistPanel for the strip
const mixBinAvg = new Float32Array(AD_N * 3)
const mixBinCnt = new Float32Array(AD_N)
const adHistVis = new Float64Array(AD_N)
const adXVis = new Float64Array(AD_N)
for (let i = 0; i < AD_N; i++) {
  const T = AD_T0 + (AD_T1 - AD_T0) * (i + 0.5) / AD_N
  adHistVis[i] = 2337 * Math.exp(-(((T - 2.4) / 1.5) ** 2))
  adXVis[i] = i / (AD_N - 1)
}
function warmHueVis(T) {
  if (T < VIS_T_LO || T > VIS_T_HI) return [0, 0, 0]
  const bx = Math.min(AD_N - 1, Math.max(0, Math.floor((T - AD_T0) / (AD_T1 - AD_T0) * AD_N)))
  const x = adXVis[bx]
  const sx = x * (SPECTRUM_STOPS.length - 1)
  const si = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(sx))
  const sf = sx - si
  const a = SPECTRUM_STOPS[si], b = SPECTRUM_STOPS[si + 1]
  return [
    Math.round(a[0] + (b[0] - a[0]) * sf),
    Math.round(a[1] + (b[1] - a[1]) * sf),
    Math.round(a[2] + (b[2] - a[2]) * sf),
  ]
}
// rebuild the adaptive warping from a histogram: 1%/99% data range,
// inverse-density weights with the T^2 cold-stretch tilt.
function rebuildWarping(hist, X) {
  let tot = 0
  for (let i = 0; i < AD_N; i++) tot += hist[i]
  let cum = 0, loB = 0, hiB = AD_N - 1
  for (let i = 0; i < AD_N; i++) {
    cum += hist[i]
    if (cum / tot < 0.01) loB = i + 1
    if (cum / tot < 0.99) hiB = i
  }
  loB = Math.max(0, Math.min(loB, AD_N - 2))
  hiB = Math.min(AD_N - 1, Math.max(hiB, loB + 1))
  let hMax = 1e-9
  for (let i = loB; i <= hiB; i++) hMax = Math.max(hMax, hist[i])
  const eps = 0.1 * hMax
  const wOf = (i) => {
    const T = AD_T0 + (AD_T1 - AD_T0) * (i + 0.5) / AD_N
    return (T * T) / 4.0 / (hist[i] + eps)
  }
  let wSum = 0
  for (let i = loB; i <= hiB; i++) wSum += wOf(i)
  cum = 0
  for (let i = 0; i < AD_N; i++) {
    if (i < loB) X[i] = 0
    else if (i > hiB) X[i] = 1
    else { cum += wOf(i); X[i] = cum / wSum }
  }
}
// this view is decoupled from the entropy slider — its own fixed seed.
// (a bigger seed isn't "more random"; it just picks a different stream,
// so the value only needs to be fixed, not large.)
const FORGET_ENTROPY = 8888888888
// forget ripples: each escaping photon launches a wave on the sphere.
// the baseline amplitude carries the photon's energy (the amplitude
// slider multiplies all of them); the baseline wavelength and frequency
// carry the photon's own wavelength, scaled so 550 nm (visible middle)
// gives the nice K=18 ripple — higher energy means tighter, faster
// ripples, lower energy broader, slower swells, every ripple moving at
// the same phase speed. clamped to what the 56x40 mesh can resolve.
const RIPPLE_K_REF = 18   // angular wavenumber at the reference wavelength (~0.35 rad rings)
const RIPPLE_W_REF = 6    // oscillation rate at the reference wavelength, rad/sim-s
const RIPPLE_LAMBDA_REF = 550e-9 // m — visible middle
const RIPPLE_K_MIN = 5
const RIPPLE_K_MAX = 30
const RIPPLE_SIG = 0.5 // angular decay of the wave, radians
const RIPPLE_TAU = 2.5 // default wave lifetime, sim-seconds — the slider takes over
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
    hop: hopForget,
  }
}
// ---- The Sun: core fusion firing ----
// fusion flips quarks (up<->down), it doesn't create them. each firing
// is one full unit of charge flipped — 2/3-(-1/3)=1 — carrying the
// framework's 2 MeV quantum: FUSION_NU ≈ 4.84e20 Hz, the one base
// frequency. the core fires as a Poisson process: the sun fuses
// ~1.8e38 pp pairs per real second and a photon walks ~1e5 yr to
// escape; the sim fires SUN_LAMBDA packets per sim-second and walks
// out in ~20 sim-s — each packet stands in for ~4e48 real fusions.
// the absolute scale is compressed away; the Poisson statistics and
// the walk are what's preserved.
const FUSION_EV = 2.0e6
const FUSION_NU = FUSION_EV * EV / H
const SUN_LAMBDA = 7.0 // packets per sim-second, Poisson firing at the core
const SUN_N = 120
const SUN_R_BIRTH = 0.01 // the core, in R_☉
const SUN_MAX_PACKETS = 256
export const SUN_ENTROPY = 7777777777
function poisson(rng, lam) {
  const L = Math.exp(-lam)
  let k = 0, p = 1
  do { k++; p *= rng() } while (p > L)
  return k - 1
}
function spawnSunPacket(rng, t) {
  // born at the core: fusion flips a quark (up<->down) — one full unit
  // of charge, 2/3-(-1/3)=1 — the one 2 MeV quantum. the walk does
  // everything after that.
  const th = rng() * Math.PI * 2
  const ph = Math.acos(2 * rng() - 1)
  const r0 = SUN_R_BIRTH * SURF_R0
  return {
    x: r0 * Math.sin(ph) * Math.cos(th),
    y: r0 * Math.sin(ph) * Math.sin(th),
    z: r0 * Math.cos(ph),
    band: 0,
    nu: FUSION_NU,
    nscat: 0,
    rBirth: SUN_R_BIRTH,
    tBirth: t,
  }
}
export function freshSunExperiment(entropy) {
  const rng = mulberry32(Math.floor(entropy * 2654435761) % 4294967296)
  const packets = []
  // prefill: the reactor is already running — packets mid-walk at random
  // radii with local thermal frequencies, so the sun is lit from frame one
  for (let i = 0; i < SUN_N; i++) {
    const p = spawnSunPacket(rng, -rng() * 20)
    const r = SUN_R_BIRTH + (1 - SUN_R_BIRTH) * rng()
    const th = rng() * Math.PI * 2, ph = Math.acos(2 * rng() - 1)
    p.x = r * SURF_R0 * Math.sin(ph) * Math.cos(th)
    p.y = r * SURF_R0 * Math.sin(ph) * Math.sin(th)
    p.z = r * SURF_R0 * Math.cos(ph)
    p.nu = Math.max(samplePlanck(structOf(Math.min(r, 1)).T, rng), 1e10)
    packets.push(p)
  }
  return {
    t: 0, hopAcc: 0, packets, escapes: [0], rng, version: 0,
    bins: [{ n: 0, sumA: 0, sumNu: 0 }],
    hist: new Float64Array(HIST_N),
    histN: 0,
    splashes: [],
    ripples: [],
    hop: hopSun,
  }
}
// one display hop for every packet, plus Poisson births at the core.
// same honest 3D random-walk steps as the forget run — one hop stands
// in for (hop/mean-free-path)^2 real scatterings — with the frequency
// sampled from the Planck distribution at the local temperature each
// hop. on escape the packet is consumed; the core fires replacements
// as a Poisson process, it doesn't recycle.
function hopSun(exp) {
  let n = poisson(exp.rng, SUN_LAMBDA / 60)
  while (n-- > 0 && exp.packets.length < SUN_MAX_PACKETS)
    exp.packets.push(spawnSunPacket(exp.rng, exp.t))
  const hopScene = HOP_FRAC * SURF_R0
  const hopCm = HOP_FRAC * R_CGS
  for (let i = exp.packets.length - 1; i >= 0; i--) {
    const p = exp.packets[i]
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
      // fully thermalized long before the surface — what escapes is the
      // photosphere's own light, sampled from the Planck distribution
      const nuOut = Math.max(samplePlanck(T_PHOT, exp.rng), 1e10)
      const bin = exp.bins[0]
      bin.n += 1
      bin.sumA += FUSION_NU / nuOut
      bin.sumNu += nuOut
      if (exp.splashes.length < 128) {
        exp.splashes.push({ dx: nx / nr, dy: ny / nr, dz: nz / nr, nuOut })
      }
      if (exp.ripples.length < 256) {
        const lambdaM = 299792458 / nuOut
        const kRp = Math.min(RIPPLE_K_MAX, Math.max(RIPPLE_K_MIN,
          RIPPLE_K_REF * (RIPPLE_LAMBDA_REF / lambdaM)))
        exp.ripples.push({ dx: nx / nr, dy: ny / nr, dz: nz / nr, t0: exp.t,
          amp: (nuOut * H) / EV, k: kRp, w: RIPPLE_W_REF * kRp / RIPPLE_K_REF })
      }
      const hb = Math.floor(
        ((Math.log10(nuOut) - HIST_L0) / (HIST_L1 - HIST_L0)) * HIST_N)
      if (hb >= 0 && hb < HIST_N) exp.hist[hb] += 1
      exp.histN += 1
      exp.escapes[0] += 1
      exp.version += 1
      exp.packets.splice(i, 1)
      continue
    }
    p.x = nx; p.y = ny; p.z = nz
    const Tn = structOf(nr / SURF_R0).T
    p.nu = Math.max(samplePlanck(Tn, exp.rng), 1e10)
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
        // the ripple carries the photon's wavelength: scaled so 550 nm
        // gives the reference ripple, higher energy tighter and faster,
        // lower energy broader and slower, same phase speed throughout
        const lambdaM = 299792458 / nuOut
        const kRp = Math.min(RIPPLE_K_MAX, Math.max(RIPPLE_K_MIN,
          RIPPLE_K_REF * (RIPPLE_LAMBDA_REF / lambdaM)))
        exp.ripples.push({ dx: nx / nr, dy: ny / nr, dz: nz / nr, t0: exp.t,
          amp: (nuOut * H) / EV, k: kRp, w: RIPPLE_W_REF * kRp / RIPPLE_K_REF })
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

export function LandingPanel({ expRef, playingRef, markers = true }) {
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

      // the band markers, where each input's light actually landed —
      // clamped at the edges, staggered so they stay readable. skipped
      // for the single-frequency run, which has nothing to mark.
      if (markers) {
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

// patch-temperature distribution: what the sphere's adaptive colors are
// assigned from. orange = the live simulated distribution (the histogram
// the colors read); dashed = the design assumption the original fixed
// scale was tuned against. the strip below shows the live color
// assignment — which temperatures get which colors right now.
export function TempDistPanel({ playingRef, vis = false, bare = false, mix = false }) {
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
      const padL = 14, padR = 14, padT = 30, padB = 58
      const iw = w - padL - padR, ih = h - padT - padB
      const T0 = 1.0, T1 = 5.0
      const X = (T) => padL + ((T - T0) / (T1 - T0)) * iw
      const Y = (f) => padT + ih - Math.min(1, f) * ih
      // visible band shading, 1.65–3.26 eV
      ctx.fillStyle = 'rgba(255,200,80,0.10)'
      ctx.fillRect(X(1.65), padT, X(3.26) - X(1.65), ih)
      ctx.fillStyle = 'rgba(113,95,67,0.8)'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('visible band', (X(1.65) + X(3.26)) / 2, padT + 12)
      // simulated: the live histogram, normalized to its peak — the same
      // orange line as the first graph
      let hMax = 1e-9
      for (let i = 0; i < AD_N; i++) hMax = Math.max(hMax, adHist[i])
      ctx.beginPath()
      let started = false
      for (let i = 0; i < AD_N; i++) {
        const T = AD_T0 + (AD_T1 - AD_T0) * (i + 0.5) / AD_N
        if (T < T0 || T > T1) continue
        const x = X(T), y = Y(adHist[i] / hMax)
        if (!started) { ctx.moveTo(x, y); started = true } else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = '#c46a1a'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.lineWidth = 1
      // expected: the design assumption (gaussian, mu 2.4 eV, sigma 0.6)
      ctx.beginPath()
      ctx.setLineDash([5, 4])
      for (let i = 0; i <= 120; i++) {
        const T = T0 + (T1 - T0) * (i / 120)
        const x = X(T), y = Y(Math.exp(-(((T - 2.4) / 0.6) ** 2)))
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(113,95,67,0.9)'
      ctx.stroke()
      ctx.setLineDash([])
      // axes
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, padT + ih); ctx.lineTo(padL + iw, padT + ih)
      ctx.stroke()
      ctx.fillStyle = '#715f43'
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.textAlign = 'left'
      ctx.fillText('1 eV', padL, padT + ih + 16)
      ctx.textAlign = 'right'
      ctx.fillText('5 eV', padL + iw, padT + ih + 16)
      ctx.textAlign = 'left'
      ctx.fillText('patch temperature →', padL, padT + ih + 32)
      // legend
      ctx.fillStyle = '#c46a1a'
      ctx.fillRect(padL, 10, 26, 3)
      ctx.fillStyle = '#4a3f2c'
      ctx.fillText('simulated (live)', padL + 32, 15)
      ctx.strokeStyle = 'rgba(113,95,67,0.9)'
      ctx.setLineDash([5, 4])
      ctx.beginPath(); ctx.moveTo(padL + 190, 11); ctx.lineTo(padL + 216, 11); ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = '#4a3f2c'
      ctx.fillText('design assumption', padL + 222, 15)
      // live color strip: which temperatures get which colors right now.
      // in mix mode each temperature shows the average accumulated color
      // of the surface patches sitting at it — no warping, no marks.
      // in visible mode only the visible band carries color — infrared
      // and ultraviolet show black. skipped entirely in bare mode (no
      // warping to display).
      if (mix) {
        const stripY = padT + ih + 40, stripH = 12
        for (let px = 0; px < iw; px++) {
          const T = T0 + (px / iw) * (T1 - T0)
          const b = Math.min(AD_N - 1, Math.max(0,
            Math.floor((T - AD_T0) / (AD_T1 - AD_T0) * AD_N)))
          const r = Math.round(Math.min(1, mixBinAvg[b * 3]) * 255)
          const g = Math.round(Math.min(1, mixBinAvg[b * 3 + 1]) * 255)
          const bl = Math.round(Math.min(1, mixBinAvg[b * 3 + 2]) * 255)
          ctx.fillStyle = `rgb(${r},${g},${bl})`
          ctx.fillRect(padL + px, stripY, 1, stripH)
        }
        ctx.strokeStyle = 'rgba(107,90,62,0.35)'
        ctx.strokeRect(padL, stripY, iw, stripH)
      } else if (!bare) {
        const stripY = padT + ih + 40, stripH = 12
        for (let px = 0; px < iw; px++) {
          const T = T0 + (px / iw) * (T1 - T0)
          ctx.fillStyle = rgb(vis ? warmHueVis(T) : warmHue(T))
          ctx.fillRect(padL + px, stripY, 1, stripH)
        }
        ctx.strokeStyle = 'rgba(107,90,62,0.35)'
        ctx.strokeRect(padL, stripY, iw, stripH)
        // ruler marks: 12 evenly spaced gradient positions, drawn at the
        // temperatures they currently map to — they spread out where the
        // color range stretches (dense) and bunch up where it compresses
        // (thin), and visibly shift as the warping updates
        ctx.fillStyle = '#3a3125'
        const markX = vis ? adXVis : adX
        for (let k = 1; k < 12; k++) {
          const xk = k / 12
          let b = 0
          while (b < AD_N - 2 && markX[b + 1] < xk) b++
          const x0 = markX[b], x1 = markX[b + 1]
          const f = x1 > x0 ? Math.min(1, Math.max(0, (xk - x0) / (x1 - x0))) : 0
          const T = AD_T0 + (AD_T1 - AD_T0) * (b + 0.5 + f) / AD_N
          if (T >= T0 && T <= T1) ctx.fillRect(X(T) - 0.5, stripY - 4, 1, 4)
        }
      }
    }

    let raf = 0
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (playingRef.current) draw()
    }
    draw()
    loop()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 300 }} />
}

// ---- the fifth graph: watch the frequencies forget ----
export function ForgetSurface({ expRef, ctlRef, dirtyRef, vis = false, mix = false }) {
  const mountRef = useRef(null)
  const readRef = useRef(null)
  const phosRef = useRef(null)
  const phosExpRef = useRef(null)
  const visRef = useRef(vis)
  visRef.current = vis
  const mixRef = useRef(mix)
  mixRef.current = mix

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
    const sphMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.05 })
    const sph = new THREE.Mesh(sphGeo, sphMat)
    sph.frustumCulled = false
    S.scene.add(sph)
    const P = new Float32Array(sCount * 3)
    resetSurface(P, 'thermal', sCount)
    // visible-band view: each patch holds its last visible color. when its
    // temperature drifts into infrared or ultraviolet no new color is
    // assigned — it keeps whatever the last visible color that hit it was,
    // dimming naturally as it cools. initialized to the nearest visible
    // color so no patch starts black.
    const heldCol = new Float32Array(sCount * 3)
    for (let v = 0; v < sCount; v++) {
      const Tc = Math.min(VIS_T_HI, Math.max(VIS_T_LO, P[v * 3]))
      const tc = warmHueVis(Tc)
      heldCol[v * 3] = tc[0]; heldCol[v * 3 + 1] = tc[1]; heldCol[v * 3 + 2] = tc[2]
    }
    // mix mode: accumulated photon colors per patch (0-1 RGB), added on
    // each visible hit, fading slowly so they accumulate. starts dark.
    const accCol = new Float32Array(sCount * 3)
    phosRef.current = P
    phosExpRef.current = expRef.current

    const paintSurface = (exp, sdt) => {
      // drain the escape splashes: every escape deposits its photon's
      // energy as heat — each patch's temperature is the local escaping
      // energy flux. in mix mode a visible photon also deposits its
      // spectral color, added to whatever is already on the patch.
      if (exp.splashes.length) {
        for (const sp of exp.splashes) {
          const eV = (sp.nuOut * H) / EV
          const prgb = mixRef.current ? photonRGB(eV) : null
          for (let v = 0; v < sCount; v++) {
            const d = uDir[v * 3] * sp.dx + uDir[v * 3 + 1] * sp.dy + uDir[v * 3 + 2] * sp.dz
            if (d < 0.85) continue
            const g = Math.exp(-(1 - d) / (SPLASH_SIG * SPLASH_SIG))
            P[v * 3] += FORGET_GAIN * eV * g
            if (prgb) {
              const o = v * 3
              const cg = eV * MIX_COLOR_GAIN * g
              accCol[o] += prgb[0] * cg
              accCol[o + 1] += prgb[1] * cg
              accCol[o + 2] += prgb[2] * cg
            }
          }
        }
        exp.splashes.length = 0
      }
      const colA = sphGeo.attributes.color
      const posA = sphGeo.attributes.position
      const coolF = sdt > 0 ? (1 - Math.exp(-sdt / COOL_TAU)) : 0
      const rippleGain = ctlRef.current.ripple ?? 1
      // ripple lifetime from the slider, clamped above zero (0 ≈ no waves)
      const rippleTau = Math.max(1e-3, ctlRef.current.rippleTau ?? RIPPLE_TAU)
      // adaptive colors: fold the current patch temperatures into the
      // running histogram (it forgets on AD_TAU), then rebuild the
      // inverse-density warping from the live distribution. in visible
      // mode only the visible band feeds the histogram.
      if (sdt > 0) {
        const hDecay = Math.exp(-sdt / AD_TAU)
        const hFloor = 0.5 * (1 - hDecay)
        if (visRef.current) {
          for (let i = 0; i < AD_N; i++) adHistVis[i] = adHistVis[i] * hDecay + hFloor
          for (let v = 0; v < sCount; v++) {
            const T = P[v * 3]
            if (T < VIS_T_LO || T > VIS_T_HI) continue
            const b = Math.min(AD_N - 1, Math.max(0, Math.floor((T - AD_T0) / (AD_T1 - AD_T0) * AD_N)))
            adHistVis[b] += 1
          }
          rebuildWarping(adHistVis, adXVis)
          // the distribution itself is the full patch spectrum, like the
          // other views — only the color assignment differs, so the full
          // histogram is folded here too
          for (let i = 0; i < AD_N; i++) adHist[i] = adHist[i] * hDecay + hFloor
          for (let v = 0; v < sCount; v++) {
            const b = Math.min(AD_N - 1, Math.max(0, Math.floor((P[v * 3] - AD_T0) / (AD_T1 - AD_T0) * AD_N)))
            adHist[b] += 1
          }
          rebuildWarping(adHist, adX)
        } else {
          for (let i = 0; i < AD_N; i++) adHist[i] = adHist[i] * hDecay + hFloor
          for (let v = 0; v < sCount; v++) {
            const b = Math.min(AD_N - 1, Math.max(0, Math.floor((P[v * 3] - AD_T0) / (AD_T1 - AD_T0) * AD_N)))
            adHist[b] += 1
          }
          rebuildWarping(adHist, adX)
        }
      }
      // prune spent waves — ripples are pushed in time order
      while (exp.ripples.length && exp.t - exp.ripples[0].t0 > 4 * rippleTau) exp.ripples.shift()
      for (let v = 0; v < sCount; v++) {
        const o = v * 3
        if (coolF > 0) P[o] += (T_BASE - P[o]) * coolF
        // blackbody color: hue from the warping, brightness from the real
        // visible-band Planck integral at T. in the visible-band view a
        // patch only takes a new color while its temperature is in the
        // band — outside it keeps its last visible color and just cools,
        // so there are no dark spots: light is still emitted there, only
        // the visible part is shown.
        const T = P[o]
        let cr, cg, cb, br
        if (mixRef.current) {
          // additive photon colors: fade slowly on their own clock so
          // repeated hits accumulate toward peach instead of dying
          // between hits; display the accumulated mix directly — no
          // warping, no temperature mapping. infrared/ultraviolet
          // deposit nothing.
          if (sdt > 0) {
            const fade = Math.exp(-sdt / MIX_TAU)
            accCol[o] *= fade; accCol[o + 1] *= fade; accCol[o + 2] *= fade
          }
          cr = Math.min(1, accCol[o]) * 255
          cg = Math.min(1, accCol[o + 1]) * 255
          cb = Math.min(1, accCol[o + 2]) * 255
          br = 1
        } else if (visRef.current) {
          if (T >= VIS_T_LO && T <= VIS_T_HI) {
            const tc = warmHueVis(T)
            heldCol[o] = tc[0]; heldCol[o + 1] = tc[1]; heldCol[o + 2] = tc[2]
          }
          cr = heldCol[o]; cg = heldCol[o + 1]; cb = heldCol[o + 2]
          br = visBrightness(T)
        } else {
          const tc = warmHue(T)
          cr = tc[0]; cg = tc[1]; cb = tc[2]
          br = visBrightness(T)
        }
        colA.setXYZ(v, (cr / 255) * br, (cg / 255) * br, (cb / 255) * br)
      }
      colA.needsUpdate = true
      // mix mode: per-temperature-bin average accumulated color, for the
      // strip under the distribution — each temperature assigned the
      // average of what's actually on the surface there
      if (mixRef.current) {
        mixBinAvg.fill(0); mixBinCnt.fill(0)
        for (let v = 0; v < sCount; v++) {
          const b = Math.min(AD_N - 1, Math.max(0,
            Math.floor((P[v * 3] - AD_T0) / (AD_T1 - AD_T0) * AD_N)))
          mixBinAvg[b * 3] += Math.min(1, accCol[v * 3])
          mixBinAvg[b * 3 + 1] += Math.min(1, accCol[v * 3 + 1])
          mixBinAvg[b * 3 + 2] += Math.min(1, accCol[v * 3 + 2])
          mixBinCnt[b] += 1
        }
        for (let i = 0; i < AD_N; i++) {
          if (mixBinCnt[i] > 0) {
            mixBinAvg[i * 3] /= mixBinCnt[i]
            mixBinAvg[i * 3 + 1] /= mixBinCnt[i]
            mixBinAvg[i * 3 + 2] /= mixBinCnt[i]
          }
        }
      }
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
            // visible-band view: only visible photons radiate here —
            // infrared/ultraviolet escapes are ignored on this sphere
            if (visRef.current && (rp.amp < VIS_T_LO || rp.amp > VIS_T_HI)) continue
            const age = exp.t - rp.t0
            let d = ux * rp.dx + uy * rp.dy + uz * rp.dz
            d = d > 1 ? 1 : d < -1 ? -1 : d
            const th = Math.acos(d)
            h += rp.amp * Math.cos(rp.k * th - rp.w * age)
              * Math.exp(-th / RIPPLE_SIG) * Math.exp(-age / rippleTau)
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
      if (!p) return
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
        while (exp.hopAcc >= 1) { exp.hop(exp); exp.hopAcc -= 1 }
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
    S.renderer.render(S.scene, S.camera)
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
export function ForgetTrack({ expRef, playingRef, single = false }) {
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
        if (single) {
          // one base frequency: the fusion quantum at birth, crashing
          // into the thermal curve on the first hop
          const lb = Math.log10(FUSION_NU)
          ctx.strokeStyle = '#e8b91a'
          ctx.setLineDash([4, 3])
          ctx.beginPath(); ctx.moveTo(X(0.01), Y(lb)); ctx.lineTo(X(0.01), Y(lw)); ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = '#e8b91a'
          ctx.beginPath(); ctx.arc(X(0.01), Y(lb), 4, 0, 7); ctx.fill()
          ctx.fillText('fusion quantum — 2 MeV', X(0.01) + 9, Y(lb) + 4)
        } else
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
  const [frRippleTau, setFrRippleTau] = useState(2.5)
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
    rippleTau: frRippleTau,
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
                light a blackbody at its temperature produces, across a
                full spectrum — dark red through orange, yellow, green,
                blue and purple to violet at the hot end — assigned
                by inverse-density warping: the mapping is flat where the
                amplitude is high, so dense temperature ranges get wide color
                ranges, and steep where thin
                (narrow ranges, compressed), tilted so red stretches and
                ultraviolet compresses, and the
                infrared shows as dark rather than being filtered out; the
                brightness is the real Planck integral over the
                visible band: cold patches make almost no visible light and sit
                near black, hot ones blaze whitish-yellow — and
                every escape launches a wave there too, its amplitude the
                escaping photon's energy, rippling outward and dying away
                (slowed down so we can see it). The ripple slider scales the
                waves' amplitude only, the lifetime slider how long they live;
                the colors are untouched by either.
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
                <Slider label="ripple lifetime" value={frRippleTau} min={0} max={40} step={0.1}
                  onChange={setFrRippleTau} format={(v) => `${v.toFixed(1)} s`} />
              </div>
            </div>

            <div className="graph-box">
              <div className="graph-title-row">
                <div className="graph-title">Patch temperature distribution</div>
              </div>
              <TempDistPanel playingRef={frPlayingRef} />
              <p className="graph-note">
                What the sphere's colors are assigned from. Orange is the live
                simulated patch-temperature distribution — the histogram the
                adaptive colors read every frame; dashed is the design
                assumption the original fixed scale was tuned against. Where
                they differ, a fixed scale mismatches the data, which is why
                the colors track the live one instead. The strip shows the
                live color assignment: which temperatures get which colors
                right now. The landing panel below is untouched — it still
                compares the escaping light against the 5778 K blackbody,
                the expected radiation from the sun.
              </p>
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
