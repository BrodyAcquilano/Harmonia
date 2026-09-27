// Gravity wave model from symmetric inertia transfer, in display-scaled units.
// Pure math: no React, no DOM — safe to import anywhere.
//
// Theory (mass coordinates):
//   psi1(M1,M2) = A1 * e^{i(k1*M1 - w1*M2)}
//   psi2(M2,M1) = A2 * e^{i(k2*M2 - w2*M1)}
//   psis = psi1 + psi2
//
// Amplitudes derived from the theory (conservation section), not chosen:
//   d psi1/dM1 + d psi2/dM1 = 0  ->  k1*A1 = w2*A2  (matched-phase boundary)
//   both branches               ->  k1*k2 = w1*w2   (symmetry condition)
//   |l2|/|l1| = sqrt(M1/M2)      ->  k2 = k1*sqrt(M2/M1)
//   |A1|^2 + |A2|^2 = 1         ->  normalization (probability-style)
//   display: k1 = 1, w1 = 1 (unit phase velocity)
//   => A1/A2 = w2/k1 = k2 = sqrt(M2/M1)
//   => A1 = sqrt(M2/(M1+M2)), A2 = sqrt(M1/(M1+M2))
// Note the cross-coupling: A1 (body 1's wave) is set by M2, the companion mass.
//
// Decay: each wave is emitted at its source mass and decays exponentially
// with distance travelled toward the companion. psi1 leaves M1 at x=0
// heading +x: envelope e^{-beta*x}. psi2 leaves M2 at x=L heading -x:
// envelope e^{-beta*(L-x)}.
//   beta = |M1-M2|/(M1+M2): zero for the symmetric (lossless) case.
//
// Display mapping: λₙ is the structural-wavelength coordinate (normalized
// display span 0..4π), tau advances the temporal phase in place of the
// companion-mass coordinate:
//   psi1(λₙ,tau) = A1 * e^{-beta*λₙ}     * e^{i(k1*λₙ - w1*M2*tau)}
//   psi2(λₙ,tau) = A2 * e^{-beta*(L-λₙ)} * e^{i(-k2*λₙ - w2*M1*tau)}
// Only the real (spatial-inertia) parts are plotted.
//
// Derivatives (theory's mass-coordinate gradients; the envelope is a real
// factor, so the phase-gradient structure is preserved):
//   d psi1 / dM1 = i*k1*psi1,   d psi2 / dM1 = -i*w2*psi2
//   d psi1 / dM2 = -i*w1*psi1,  d psi2 / dM2 = i*k2*psi2

export const L = 4 * Math.PI

export function gravityParams(M1, M2) {
  const k1 = 1
  const w1 = 1
  const a = Math.max(M1, 0)
  const b = Math.max(M2, 0)
  const sum = a + b
  // The wavelength relation k2 = k1*sqrt(M2/M1) is singular at M1 = 0;
  // the companion wave flattens there (its amplitude also vanishes).
  const k2 = a > 0 ? k1 * Math.sqrt(b / a) : 0
  const w2 = a > 0 ? (k1 * k2) / w1 : 0 // symmetry condition k1*k2 = w1*w2
  // Amplitudes follow the mass-ratio limit A1/A2 = sqrt(M2/M1) so the
  // M -> 0 endpoints stay continuous with M -> 0+.
  let A1, A2
  if (sum <= 0) { A1 = 0; A2 = 0 }
  else if (a <= 0) { A1 = 1; A2 = 0 }
  else if (b <= 0) { A1 = 0; A2 = 1 }
  else {
    const r = Math.sqrt(b / a)
    A2 = 1 / Math.sqrt(1 + r * r)
    A1 = r * A2
  }
  const beta = sum > 0 ? Math.abs(a - b) / sum : 0
  return { k1, k2, w1, w2, A1, A2, beta }
}

/** psi1 as {re, im} at spatial position x and clock tau. */
export function psi1(x, tau, P, M2) {
  const ph = P.k1 * x - P.w1 * M2 * tau
  const env = Math.exp(-P.beta * x)
  return { re: P.A1 * env * Math.cos(ph), im: P.A1 * env * Math.sin(ph) }
}

/** psi2 as {re, im} at spatial position x and clock tau (travels -x). */
export function psi2(x, tau, P, M1) {
  const ph = -P.k2 * x - P.w2 * M1 * tau
  const env = Math.exp(-P.beta * (L - x))
  return { re: P.A2 * env * Math.cos(ph), im: P.A2 * env * Math.sin(ph) }
}

export function psiSum(a, b) {
  return { re: a.re + b.re, im: a.im + b.im }
}

// Complex helpers: i*k*(a+ib) = (-k*b, k*a); -i*w*(a+ib) = (w*b, -w*a).
const iTimes = (k, z) => ({ re: -k * z.im, im: k * z.re })
const negITimes = (w, z) => ({ re: w * z.im, im: -w * z.re })

/**
 * Mass-coordinate gradients at (x, tau).
 * which = 1 -> d/dM1 pair: dpsi1/dM1 = i*k1*psi1, dpsi2/dM1 = -i*w2*psi2
 * which = 2 -> d/dM2 pair: dpsi1/dM2 = -i*w1*psi1, dpsi2/dM2 = i*k2*psi2
 * Returns { d1, d2, sum } as {re, im} pairs.
 */
export function dPsi_dM(which, x, tau, P, M1, M2) {
  const p1 = psi1(x, tau, P, M2)
  const p2 = psi2(x, tau, P, M1)
  const d1 = which === 1 ? iTimes(P.k1, p1) : negITimes(P.w1, p1)
  const d2 = which === 1 ? negITimes(P.w2, p2) : iTimes(P.k2, p2)
  return { d1, d2, sum: psiSum(d1, d2) }
}

// ---- structural wavelengths: closed-form cubic solution from the masses ----
//   λ1 = (2 G h^2 / (M1 c^4))^{1/3} · (i√(M1/M2) − 1)^{-1/3}
//   λ2 = i√(M1/M2) · λ1
// (lambda-derivation note; masses in kg, SI constants, metres out.)
// Singular when either mass vanishes -> returns null.
export const SI = { G: 6.6743e-11, h: 6.62607015e-34, c: 299792458 }

const cMul = (a, b) => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re })

// Principal-branch complex power z^p = exp(p · ln z).
const cPow = (z, p) => {
  const r = Math.hypot(z.re, z.im)
  if (r === 0) return { re: 0, im: 0 }
  const m = Math.pow(r, p)
  const t = p * Math.atan2(z.im, z.re)
  return { re: m * Math.cos(t), im: m * Math.sin(t) }
}

export function structuralWavelengths(M1, M2) {
  if (!(M1 > 0) || !(M2 > 0)) return null
  const { G, h, c } = SI
  const pre = Math.cbrt((2 * G * h * h) / (M1 * Math.pow(c, 4)))
  const r = Math.sqrt(M1 / M2)
  const l1 = cMul({ re: pre, im: 0 }, cPow({ re: -1, im: r }, -1 / 3))
  const l2 = cMul({ re: 0, im: r }, l1) // λ2 = i√(M1/M2)·λ1 by construction
  return { l1, l2 }
}

export const cAbs = (z) => Math.hypot(z.re, z.im)

// Full theory parameters straight from the symmetric-inertia-transfer paper:
//   k_n = 2π/λ_n (complex, through λ) and ω_n = 2π M_n c²/h (real, Planck–Einstein).
// Returns null when a mass vanishes, since λ is singular there.
export function theoryParams(M1, M2) {
  const lam = structuralWavelengths(M1, M2)
  if (!lam) return null
  const { c, h } = SI
  const kOf = (l) => {
    const d = l.re * l.re + l.im * l.im
    const f = (2 * Math.PI) / d
    return { re: f * l.re, im: -f * l.im }
  }
  return {
    k1: kOf(lam.l1),
    k2: kOf(lam.l2),
    w1: ((2 * Math.PI) / h) * M1 * c * c,
    w2: ((2 * Math.PI) / h) * M2 * c * c,
  }
}
