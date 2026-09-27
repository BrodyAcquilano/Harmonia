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
// Display mapping: x is the spatial axis, tau advances the temporal phase
// in place of the companion-mass coordinate:
//   psi1(x,tau) = A1 * e^{-beta*x}     * e^{i(k1*x - w1*M2*tau)}
//   psi2(x,tau) = A2 * e^{-beta*(L-x)} * e^{i(-k2*x - w2*M1*tau)}
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
  const k2 = k1 * Math.sqrt(M2 / M1)
  const w2 = (k1 * k2) / w1 // symmetry condition k1*k2 = w1*w2
  const r = w2 / k1 // A1/A2 from k1*A1 = w2*A2
  const A2 = 1 / Math.sqrt(1 + r * r)
  const A1 = r * A2
  const beta = Math.abs(M1 - M2) / (M1 + M2)
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
