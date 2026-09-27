// Pure wave-math models. No React, no DOM — safe to import anywhere.

/**
 * Two counter-propagating sine waves and their superposition.
 * y1 = a1 * sin(kx - ωt + p1)   (travels +x)
 * y2 = a2 * sin(kx + ωt + p2)   (travels -x)
 * With a1 == a2 the sum is a standing wave: 2a·sin(kx)·cos(ωt + φ).
 */
export function twoWaves(x, t, { a1, a2, k, omega, p1, p2 }) {
  const y1 = a1 * Math.sin(k * x - omega * t + p1)
  const y2 = a2 * Math.sin(k * x + omega * t + p2)
  return { y1, y2, sum: y1 + y2 }
}

/**
 * Traveling wave with exponential spatial decay.
 * y = a · e^(−βx) · sin(kx − ωt)
 */
export function decayingWave(x, t, { a, k, omega, beta }) {
  const y = a * Math.exp(-beta * x) * Math.sin(k * x - omega * t)
  return { y }
}

/**
 * Standing-wave harmonics on a string of length L, fixed at both ends.
 * y = Σ_{m=1..n} (a/m)·sin(mπx/L)·cos(m·ω₀t),  ω₀ = π/L (wave speed c = 1).
 * Returns per-mode components plus their sum.
 */
export function harmonics(x, t, { n, a, L }) {
  const omega0 = Math.PI / L
  const components = []
  let sum = 0
  for (let m = 1; m <= n; m++) {
    const c = (a / m) * Math.sin((m * Math.PI * x) / L) * Math.cos(m * omega0 * t)
    components.push(c)
    sum += c
  }
  return { components, sum }
}
