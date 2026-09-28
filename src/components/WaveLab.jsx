import { useEffect, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import { isTypingAllowed, parseNumberInput } from '../utils/numberInput.js'
import {
  gravityParams,
  psi1,
  psi2,
  psiSum,
  dPsi_dM,
  structuralWavelengths,
  cAbs,
  theoryParams,
  SI,
} from '../waves/models.js'

// Render a LaTeX string via KaTeX (inline mode)
function Tex({ tex }) {
  const html = katex.renderToString(tex, { throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// Scientific-notation value as a LaTeX string: 8.52 \times 10^{50}
function sciTex(v) {
  const [m, e] = v.toExponential(2).split('e')
  return `${m} \\times 10^{${parseInt(e, 10)}}`
}

// Complex value in factored form as LaTeX: (2.58 + 2.58i) \times 10^{37}
function csciTex(z) {
  const mag = Math.max(Math.abs(z.re), Math.abs(z.im))
  if (!(mag > 0)) return '0'
  const e = Math.floor(Math.log10(mag))
  const f = 10 ** e
  const re = (z.re / f).toFixed(2)
  const im = (z.im / f).toFixed(2)
  const sign = z.im < 0 ? '-' : '+'
  return `(${re} ${sign} ${Math.abs(im).toFixed(2)}i) \\times 10^{${e}}`
}

const X_MAX = 4 * Math.PI

const C1 = '#2563ad' // psi1 — blue
const C2 = '#d7642e' // psi2 — orange
const CS = '#3a2c1a' // sum — dark, bold

function frameSetup(ctx, canvas) {
  const dpr = window.devicePixelRatio || 1
  const w = Math.max(canvas.clientWidth, 50)
  const h = Math.max(canvas.clientHeight, 50)
  const W = Math.round(w * dpr)
  const H = Math.round(h * dpr)
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W
    canvas.height = H
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.fillStyle = '#fffdf4'
  ctx.fillRect(0, 0, w, h)
  const compact = h < 220
  const padL = 50
  const padR = 50
  const padT = compact ? 12 : 20
  const padB = compact ? 39 : 46
  return { w, h, padL, padR, padT, padB, pw: w - padL - padR, ph: h - padT - padB }
}

function drawGrid(ctx, g, yMax) {
  const { padL, padT, padB, pw, ph } = g
  const X = (x) => padL + (x / X_MAX) * pw
  const Y = (y) => padT + ph / 2 - (y / yMax) * (ph / 2)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#e5dcc0'
  ctx.fillStyle = '#715f43'
  ctx.font = '10px "IBM Plex Mono", monospace'
  ctx.textAlign = 'center'
  const piLabels = ['0', 'π', '2π', '3π', '4π']
  for (let i = 0; i <= 4; i++) {
    const gx = i * Math.PI
    ctx.beginPath()
    ctx.moveTo(X(gx), padT)
    ctx.lineTo(X(gx), padT + ph)
    ctx.stroke()
    ctx.fillText(piLabels[i], X(gx), padT + ph + 16)
  }
  ctx.textAlign = 'right'
  for (const frac of [-1, -0.5, 0.5, 1]) {
    const gy = frac * yMax
    ctx.beginPath()
    ctx.moveTo(padL, Y(gy))
    ctx.lineTo(padL + pw, Y(gy))
    ctx.stroke()
  }
  ctx.strokeStyle = '#a99760'
  ctx.beginPath()
  ctx.moveTo(padL, Y(0))
  ctx.lineTo(padL + pw, Y(0))
  ctx.stroke()
  ctx.textAlign = 'right'
  ctx.fillText('λₙ (spatial)', padL + pw, padT + ph + 30)
  return { X, Y }
}

// Time-axis grid: x-axis is time t (one wobble cycle), not spatial wavelength.
function drawTimeGrid(ctx, g, yMax, tauMax) {
  const { padL, padT, padB, pw, ph } = g
  const X = (t) => padL + (t / tauMax) * pw
  const Y = (y) => padT + ph / 2 - (y / yMax) * (ph / 2)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#e5dcc0'
  ctx.fillStyle = '#715f43'
  ctx.font = '10px "IBM Plex Mono", monospace'
  ctx.textAlign = 'center'
  const labels = ['0', 'T/4', 'T/2', '3T/4', 'T']
  for (let i = 0; i <= 4; i++) {
    const t = (i / 4) * tauMax
    ctx.beginPath()
    ctx.moveTo(X(t), padT)
    ctx.lineTo(X(t), padT + ph)
    ctx.stroke()
    ctx.fillText(labels[i], X(t), padT + ph + 16)
  }
  ctx.textAlign = 'right'
  for (const frac of [-1, -0.5, 0.5, 1]) {
    const gy = frac * yMax
    ctx.beginPath()
    ctx.moveTo(padL, Y(gy))
    ctx.lineTo(padL + pw, Y(gy))
    ctx.stroke()
  }
  ctx.strokeStyle = '#a99760'
  ctx.beginPath()
  ctx.moveTo(padL, Y(0))
  ctx.lineTo(padL + pw, Y(0))
  ctx.stroke()
  ctx.textAlign = 'right'
  ctx.fillText('t (time)', padL + pw, padT + ph + 30)
  return { X, Y }
}

function trace(ctx, X, Y, fn, color, width, dash, xMax) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash || [])
  ctx.beginPath()
  const N = 420
  const dom = xMax === undefined ? X_MAX : xMax
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * dom
    const px = X(x)
    const py = Y(fn(x))
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.stroke()
  ctx.setLineDash([])
}

function renderFrame(ctx, canvas, s, tau) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  let yMax
  let curves
  if (s.subtab === 'gravity') {
    yMax = Math.max((P.A1 + P.A2) * 1.15, 0.5)
    curves = []
    if (s.waveDisplay === 'waves' || s.waveDisplay === 'all') {
      curves.push(
        { fn: (x) => psi1(x, tau, P, s.M2).re, color: C1, width: 1.75 },
        { fn: (x) => psi2(x, tau, P, s.M1).re, color: C2, width: 1.75 },
      )
    }
    if (s.waveDisplay === 'sum' || s.waveDisplay === 'all') {
      curves.push({
        fn: (x) => psiSum(psi1(x, tau, P, s.M2), psi2(x, tau, P, s.M1)).re,
        color: CS,
        width: 2.75,
      })
    }
  } else if (s.subtab === 'integ') {
    // Integration tab, first graph: wave areas with balance point.
    // Shows ψ₁ and ψ₂ with filled areas, marking where they meet at λ*.
    yMax = Math.max((P.A1 + P.A2) * 1.15, 0.5)
    curves = []
    if (s.waveDisplay === 'waves' || s.waveDisplay === 'all') {
      curves.push(
        { fn: (x) => psi1(x, tau, P, s.M2).re, color: C1, width: 1.75, fill: true },
        { fn: (x) => psi2(x, tau, P, s.M1).re, color: C2, width: 1.75, fill: true },
      )
    }
    if (s.waveDisplay === 'sum' || s.waveDisplay === 'all') {
      curves.push({
        fn: (x) => psiSum(psi1(x, tau, P, s.M2), psi2(x, tau, P, s.M1)).re,
        color: CS,
        width: 2.75,
      })
    }
  } else {
    // Both mass derivatives at once: color = wave, solid = d/dM1, dashed = d/dM2.
    const tot = P.k1 * P.A1 + P.w2 * P.A2 + P.w1 * P.A1 + P.k2 * P.A2
    yMax = Math.max(tot * 1.15, 0.2)
    const grad = (which, key) => (x) => dPsi_dM(which, x, tau, P, s.M1, s.M2)[key].re
    curves = [
      { fn: grad(1, 'd1'), color: C1, width: 1.75, dash: [] },
      { fn: grad(1, 'd2'), color: C1, width: 1.75, dash: [6, 4] },
      { fn: grad(2, 'd1'), color: C2, width: 1.75, dash: [] },
      { fn: grad(2, 'd2'), color: C2, width: 1.75, dash: [6, 4] },
    ]
  }
  const { X, Y } = drawGrid(ctx, g, yMax)
  curves.forEach((c) => {
    if (c.fill) {
      // Fill area under the curve
      ctx.save()
      ctx.globalAlpha = 0.15
      ctx.fillStyle = c.color
      ctx.beginPath()
      const n = 200
      ctx.moveTo(X(0), Y(0))
      for (let i = 0; i <= n; i++) {
        const x = (i / n) * X_MAX
        ctx.lineTo(X(x), Y(c.fn(x)))
      }
      ctx.lineTo(X(X_MAX), Y(0))
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
    trace(ctx, X, Y, c.fn, c.color, c.width, c.dash)
  })
  // For gravity main graph: shade area between ψ₁ and ψ₂,
  // blue left of balance point, orange right
  if (s.subtab === 'gravity' && (s.waveDisplay === 'waves' || s.waveDisplay === 'all') && curves.length >= 2 && s.M1 + s.M2 > 0) {
    const xStar = (X_MAX * s.M2) / (s.M1 + s.M2)
    const fn1 = curves[0].fn
    const fn2 = curves[1].fn
    ctx.save()
    ctx.globalAlpha = 0.15
    const n = 200
    // Left side (blue)
    ctx.fillStyle = C1
    ctx.beginPath()
    let first = true
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * xStar
      if (first) {
        ctx.moveTo(X(x), Y(fn1(x)))
        first = false
      } else {
        ctx.lineTo(X(x), Y(fn1(x)))
      }
    }
    for (let i = n; i >= 0; i--) {
      const x = (i / n) * xStar
      ctx.lineTo(X(x), Y(fn2(x)))
    }
    ctx.closePath()
    ctx.fill()
    // Right side (orange)
    ctx.fillStyle = C2
    ctx.beginPath()
    first = true
    for (let i = 0; i <= n; i++) {
      const x = xStar + (i / n) * (X_MAX - xStar)
      if (first) {
        ctx.moveTo(X(x), Y(fn1(x)))
        first = false
      } else {
        ctx.lineTo(X(x), Y(fn1(x)))
      }
    }
    for (let i = n; i >= 0; i--) {
      const x = xStar + (i / n) * (X_MAX - xStar)
      ctx.lineTo(X(x), Y(fn2(x)))
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }
  if ((s.subtab === 'gravity' || s.subtab === 'integ') && s.M1 + s.M2 > 0) {
    // Balance point: mass-weighted center x* = L·M₂/(M₁+M₂).
    // M₁·x* = M₂·(L−x*); equal masses → middle, M₂=3M₁ → 3L/4.
    // For integration tab, use the mirrored point (opposite side).
    const xStar = s.subtab === 'integ'
      ? X_MAX - (X_MAX * s.M2) / (s.M1 + s.M2)
      : (X_MAX * s.M2) / (s.M1 + s.M2)
    ctx.save()
    ctx.strokeStyle = '#9a9a9a'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(X(xStar), g.padT)
    ctx.lineTo(X(xStar), g.padT + g.ph)
    ctx.stroke()
    ctx.restore()
  }
}


// Gravity tab, second graph: The Envelope.
// The envelope is the wave with the oscillation stripped off:
// E1+/- = +/-A1 e^{-beta lambda}, E2+/- = +/-A2 e^{-beta (L - lambda)}.
// Push-pull is per body, so no pair-state fill belongs here -- each body
// gets its own push-pull graph below. Balance-point line lambda* marked.
function renderEnvelopeFrame(ctx, canvas, s, tau) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const yMax = Math.max((P.A1 + P.A2) * 1.15, 0.5)
  const { X, Y } = drawGrid(ctx, g, yMax)
  // Envelope bounds: the decay with the oscillation stripped off.
  ctx.save()
  ctx.globalAlpha = 0.45
  const e1 = (x) => P.A1 * Math.exp(-P.beta * x)
  const e2 = (x) => P.A2 * Math.exp(-P.beta * (X_MAX - x))
  trace(ctx, X, Y, e1, C1, 1, [6, 4])
  trace(ctx, X, Y, (x) => -e1(x), C1, 1, [6, 4])
  trace(ctx, X, Y, e2, C2, 1, [6, 4])
  trace(ctx, X, Y, (x) => -e2(x), C2, 1, [6, 4])
  ctx.restore()
  trace(ctx, X, Y, (x) => psi1(x, tau, P, s.M2).re, C1, 1.75, [])
  trace(ctx, X, Y, (x) => psi2(x, tau, P, s.M1).re, C2, 1.75, [])
  // Balance-point line.
  if (s.M1 + s.M2 > 0) {
    const xStar = (X_MAX * s.M2) / (s.M1 + s.M2)
    ctx.save()
    ctx.strokeStyle = '#9a9a9a'
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(X(xStar), g.padT)
    ctx.lineTo(X(xStar), g.padT + g.ph)
    ctx.stroke()
    ctx.restore()
  }
}

// Derivatives tab, lower graph: the summed total on its own, drawn on the
// same vertical scale as the component graph so the cancellation reads directly.
function renderTotalFrame(ctx, canvas, s, tau) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const tot = P.k1 * P.A1 + P.w2 * P.A2 + P.w1 * P.A1 + P.k2 * P.A2
  const yMax = Math.max(tot * 1.15, 0.2)
  const totalFn = (x) =>
    dPsi_dM(1, x, tau, P, s.M1, s.M2).sum.re +
    dPsi_dM(2, x, tau, P, s.M1, s.M2).sum.re
  const { X, Y } = drawGrid(ctx, g, yMax)
  trace(ctx, X, Y, totalFn, CS, 2.75, [])
}

// Derivatives tab, middle graph: the two half-waves.
//   dM₁ half = ∂ψ₁/∂M₁ + ∂ψ₂/∂M₁  (sum of the solid pair)
//   dM₂ half = ∂ψ₁/∂M₂ + ∂ψ₂/∂M₂  (sum of the dashed pair)
// They are exact opposites (S₁ = −S₂), hence the flat total below.
function renderHalfFrame(ctx, canvas, s, tau) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const tot = P.k1 * P.A1 + P.w2 * P.A2 + P.w1 * P.A1 + P.k2 * P.A2
  const yMax = Math.max(tot * 1.15, 0.2)
  const { X, Y } = drawGrid(ctx, g, yMax)
  trace(ctx, X, Y, (x) => dPsi_dM(1, x, tau, P, s.M1, s.M2).sum.re, C1, 2, [])
  trace(ctx, X, Y, (x) => dPsi_dM(2, x, tau, P, s.M1, s.M2).sum.re, C2, 2, [6, 4])
}

// Integration tab: Work/Impulse cross pairs (with respect to M₁).
//   Pair 1: W₁ (work of ψ₁) + J₂ (impulse of ψ₂)
//   Pair 2: W₂ (work of ψ₂) + J₁ (impulse of ψ₁)
//   Work: Wₙ(x) = ∫₀ˣ Re(ψₙ(t)) dt (spatial, solid)
//   Impulse: Jₙ(x) = ∫₀ˣ Im(ψₙ(t)) dt (temporal, dashed)
//   Shading: green where work is on top (inertia stored),
//   red where impulse is on top (inertia released); alternates at crossings.
function renderPairFrame(ctx, canvas, s, tau, pair) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  // Precompute work and impulse via trapezoidal rule
  const N = 200
  const work1 = []
  const work2 = []
  const imp1 = []
  const imp2 = []
  let w1 = 0, w2 = 0, j1 = 0, j2 = 0
  let prevX = 0
  let prevW1 = psi1(0, tau, P, s.M2).re
  let prevW2 = psi2(0, tau, P, s.M1).re
  let prevJ1 = psi1(0, tau, P, s.M2).im
  let prevJ2 = psi2(0, tau, P, s.M1).im
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * X_MAX
    const p1 = psi1(x, tau, P, s.M2)
    const p2 = psi2(x, tau, P, s.M1)
    if (i > 0) {
      const dx = x - prevX
      w1 += ((prevW1 + p1.re) / 2) * dx
      w2 += ((prevW2 + p2.re) / 2) * dx
      j1 += ((prevJ1 + p1.im) / 2) * dx
      j2 += ((prevJ2 + p2.im) / 2) * dx
    }
    work1.push(w1)
    work2.push(w2)
    imp1.push(j1)
    imp2.push(j2)
    prevX = x
    prevW1 = p1.re
    prevW2 = p2.re
    prevJ1 = p1.im
    prevJ2 = p2.im
  }
  // Select the pair: pair=1 → W₁+J₁, pair=2 → W₂+J₂
  // Wₙ = potential work of Mₙ, Jₙ = impulse generated, Wₙ−Jₙ = inertia remaining.
  const arr1 = pair === 1 ? work1 : work2
  const arr2 = pair === 1 ? imp1 : imp2
  const color1 = pair === 1 ? C1 : C2
  const color2 = pair === 1 ? C1 : C2
  // For pair 1: W₁ solid blue, J₁ dashed blue. For pair 2: W₂ solid orange, J₂ dashed orange.
  const dash1 = []
  const dash2 = [6, 4]
  const diffArr = arr1.map((v, i) => v - arr2[i])
  const all = s.waveDisplay === 'sum' ? diffArr : [...arr1, ...arr2, ...diffArr]
  const yMax = Math.max(Math.abs(Math.min(...all)) * 1.15, Math.abs(Math.max(...all)) * 1.15, 0.1)
  const { X, Y } = drawGrid(ctx, g, yMax)
  const interp = (arr) => (x) => {
    const idx = Math.min(Math.floor((x / X_MAX) * N), N - 1)
    const t = ((x / X_MAX) * N) - idx
    return arr[idx] * (1 - t) + arr[idx + 1] * t
  }
  if (s.waveDisplay === 'waves' || s.waveDisplay === 'all') {
    // Shade area between the curves: green where work is on top (inertia stored),
    // red where impulse is on top (inertia released).
    // Alternates at each crossing point.
    const CGREEN = '#16a34a'
    const CRED = '#dc2626'
    ctx.save()
    ctx.globalAlpha = 0.18
    const n = 400
    let segStart = 0
    let segAbove = null // true if arr1 (work) is above arr2 (impulse)
    const fillSeg = (x0, x1, workOnTop) => {
      if (x1 <= x0) return
      ctx.fillStyle = workOnTop ? CGREEN : CRED
      ctx.beginPath()
      const m = 50
      let first = true
      for (let i = 0; i <= m; i++) {
        const x = x0 + (i / m) * (x1 - x0)
        if (first) { ctx.moveTo(X(x), Y(interp(arr1)(x))); first = false }
        else ctx.lineTo(X(x), Y(interp(arr1)(x)))
      }
      for (let i = m; i >= 0; i--) {
        const x = x0 + (i / m) * (x1 - x0)
        ctx.lineTo(X(x), Y(interp(arr2)(x)))
      }
      ctx.closePath()
      ctx.fill()
    }
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * X_MAX
      const d = interp(arr1)(x) - interp(arr2)(x)
      const above = d >= 0
      if (segAbove === null) segAbove = above
      if (above !== segAbove) {
        // Crossing between previous x and this x — approximate crossing point
        const xp = ((i - 1) / n) * X_MAX
        // Linear interpolation for crossing
        const dPrev = interp(arr1)(xp) - interp(arr2)(xp)
        const t = Math.abs(dPrev) / (Math.abs(dPrev) + Math.abs(d))
        const xc = xp + t * (x - xp)
        fillSeg(segStart, xc, segAbove)
        segStart = xc
        segAbove = above
      }
    }
    fillSeg(segStart, X_MAX, segAbove)
    ctx.restore()
    trace(ctx, X, Y, interp(arr1), color1, 2, dash1)
    trace(ctx, X, Y, interp(arr2), color2, 2, dash2)
  }
  if (s.waveDisplay === 'sum' || s.waveDisplay === 'all') {
    trace(ctx, X, Y, interp(diffArr), CS, 2.75, [])
  }
}

// Gravity tab, third/fourth graphs: per-body push-pull.
//   P_n(lambda) = W_n(lambda) - J_n(lambda), body n alone.
// The sign belongs to one body, not to the pair, so each body gets its
// own graph: the area between the P_n curve and the axis is green where
// P_n > 0 (push) and red where P_n < 0 (pull). body = 1 -> M1 (blue),
// body = 2 -> M2 (orange).
function renderBodyPushPullFrame(ctx, canvas, s, tau, body) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const N = 200
  const psi = body === 1
    ? (x) => psi1(x, tau, P, s.M2)
    : (x) => psi2(x, tau, P, s.M1)
  const color = body === 1 ? C1 : C2
  const work = [], imp = []
  let w = 0, j = 0, prevX = 0
  let prevW = psi(0).re, prevJ = psi(0).im
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * X_MAX
    const q = psi(x)
    if (i > 0) {
      const dx = x - prevX
      w += ((prevW + q.re) / 2) * dx
      j += ((prevJ + q.im) / 2) * dx
    }
    work.push(w); imp.push(j)
    prevX = x; prevW = q.re; prevJ = q.im
  }
  const pArr = work.map((v, i) => v - imp[i])
  const yMax = Math.max(Math.abs(Math.min(...pArr)) * 1.15, Math.abs(Math.max(...pArr)) * 1.15, 0.1)
  const { X, Y } = drawGrid(ctx, g, yMax)
  const interp = (x) => {
    const idx = Math.min(Math.floor((x / X_MAX) * N), N - 1)
    const t = ((x / X_MAX) * N) - idx
    return pArr[idx] * (1 - t) + pArr[idx + 1] * t
  }
  // Fill between the curve and the axis: green = push (P_n > 0),
  // red = pull (P_n < 0). Alternates at each zero crossing.
  const CGREEN = '#16a34a'
  const CRED = '#dc2626'
  ctx.save()
  ctx.globalAlpha = 0.18
  const n = 400
  let segStart = 0
  let segPush = null
  const fillSeg = (x0, x1, push) => {
    if (x1 <= x0) return
    ctx.fillStyle = push ? CGREEN : CRED
    ctx.beginPath()
    const m = 50
    let first = true
    for (let i = 0; i <= m; i++) {
      const x = x0 + (i / m) * (x1 - x0)
      if (first) { ctx.moveTo(X(x), Y(interp(x))); first = false }
      else ctx.lineTo(X(x), Y(interp(x)))
    }
    for (let i = m; i >= 0; i--) {
      const x = x0 + (i / m) * (x1 - x0)
      ctx.lineTo(X(x), Y(0))
    }
    ctx.closePath()
    ctx.fill()
  }
  for (let i = 0; i <= n; i++) {
    const x = (i / n) * X_MAX
    const push = interp(x) >= 0
    if (segPush === null) segPush = push
    if (push !== segPush) {
      const xp = ((i - 1) / n) * X_MAX
      const dPrev = interp(xp), dNow = interp(x)
      const denom = Math.abs(dPrev) + Math.abs(dNow)
      const xc = denom > 0 ? xp + (Math.abs(dPrev) / denom) * (x - xp) : x
      fillSeg(segStart, xc, segPush)
      segStart = xc
      segPush = push
    }
  }
  fillSeg(segStart, X_MAX, segPush)
  ctx.restore()
  trace(ctx, X, Y, interp, color, 2, [])
}

// ---- Motion tab, time domain ----
// At each phasor time τ, the net released impulse on body n is
//   Fₙ(τ) = Jₙ(L,τ) − Wₙ(L,τ) = ∫₀ᴸ [Im(ψₙ) − Re(ψₙ)] dλₙ.
// Integrating over τ gives the wobble: Xₙ(τ) = ∫₀^τ Fₙ(τ′) dτ′.
// Cached by (M1, M2) since it doesn't depend on the animation frame.
// Each body's wobble is sampled over its OWN natural period — F₁ oscillates
// at w₁M₂ = M₂ in τ, F₂ at w₂M₁ = √(M₁M₂) — so each curve closes exactly and
// the live dots can wrap on their own period with no teleport at the loop.
let wobbleCache = { key: null }
function wobbleCurves(M1, M2, P) {
  const T1 = (2 * Math.PI) / Math.max(M2, 0.05)
  const w2M1 = P.w2 * Math.max(M1, 0)
  const T2 = w2M1 > 1e-9 ? (2 * Math.PI) / w2M1 : T1
  const key = `${M1}|${M2}|${T1}|${T2}`
  if (wobbleCache.key === key) return wobbleCache
  const NT = 720, NS = 120
  const dx = X_MAX / NS
  // Net impulse + wobble of one body over its own period T.
  const sampleBody = (T, n) => {
    const dt = T / NT
    const f = [], x = []
    let c = 0
    for (let i = 0; i <= NT; i++) {
      const t = (i / NT) * T
      let s = 0
      for (let j = 0; j <= NS; j++) {
        const px = (j / NS) * X_MAX
        const p = n === 1 ? psi1(px, t, P, M2) : psi2(px, t, P, M1)
        const w = (j === 0 || j === NS) ? 0.5 : 1
        s += w * (p.im - p.re)
      }
      f.push(s * dx)
      if (i > 0) c += ((f[i - 1] + f[i]) / 2) * dt
      x.push(c)
    }
    // Center on zero over the body's own full period.
    const m = x.reduce((a, b) => a + b, 0) / x.length
    return { f, x: x.map((v) => v - m) }
  }
  const b1 = sampleBody(T1, 1), b2 = sampleBody(T2, 2)
  wobbleCache = { key, tauMax: T1, T1, T2, NT, f1: b1.f, f2: b2.f, x1: b1.x, x2: b2.x }
  return wobbleCache
}

// Sample one body's curve array at time t, wrapping on that body's own
// period so live animations loop seamlessly at any mass ratio.
function samplePeriodic(arr, T, NT, t) {
  const tw = ((t % T) + T) % T
  const idx = Math.min(Math.floor((tw / T) * NT), NT - 1)
  const f = ((tw / T) * NT) - idx
  return arr[idx] * (1 - f) + arr[idx + 1] * f
}

// Wobble vs time — STATIC snapshot of one full cycle (both directions).
// X₁(t) blue, X₂(t) orange. No animation: this is the trajectory, not a frame.
// The window is body 1's period; body 2 is shown over the same window via its
// own periodic extension, exactly as the live dots draw it.
function renderWobbleTimeFrame(ctx, canvas, s) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const { tauMax, T2, NT, x1, x2 } = wobbleCurves(s.M1, s.M2, P)
  const all = [...x1, ...x2]
  const yMax = Math.max(Math.abs(Math.min(...all)) * 1.15, Math.abs(Math.max(...all)) * 1.15, 0.1)
  const { X, Y } = drawTimeGrid(ctx, g, yMax, tauMax)
  trace(ctx, X, Y, (t) => samplePeriodic(x1, tauMax, NT, t), C1, 2.5, [], tauMax)
  trace(ctx, X, Y, (t) => samplePeriodic(x2, T2, NT, t), C2, 2.5, [], tauMax)
}

// Net impulse vs time — STATIC snapshot of one full cycle.
// F₁(t) blue, F₂(t) orange: the driver behind the wobble.
function renderForceTimeFrame(ctx, canvas, s) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const { tauMax, T2, NT, f1, f2 } = wobbleCurves(s.M1, s.M2, P)
  const all = [...f1, ...f2]
  const yMax = Math.max(Math.abs(Math.min(...all)) * 1.15, Math.abs(Math.max(...all)) * 1.15, 0.1)
  const { X, Y } = drawTimeGrid(ctx, g, yMax, tauMax)
  trace(ctx, X, Y, (t) => samplePeriodic(f1, tauMax, NT, t), C1, 2.5, [], tauMax)
  trace(ctx, X, Y, (t) => samplePeriodic(f2, T2, NT, t), C2, 2.5, [], tauMax)
}

// Wobble diagram: m₁ dot left (blue), m₂ dot right (orange), each moving
// up/down with Xₙ(τ). No motion along the horizontal — relative velocity
// is constant, so the wobble is purely perpendicular. Each dot wraps on its
// own wobble period, so both loop seamlessly at any mass ratio.
function renderWobbleDotsFrame(ctx, canvas, s, tau) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const { T1, T2, NT, x1, x2 } = wobbleCurves(s.M1, s.M2, P)
  const v1 = samplePeriodic(x1, T1, NT, tau)
  const v2 = samplePeriodic(x2, T2, NT, tau)
  const all = [...x1, ...x2]
  const vMax = Math.max(Math.abs(Math.min(...all)), Math.abs(Math.max(...all)), 0.1)
  const { padL, padT, pw, ph } = g
  const midY = padT + ph / 2
  const amp = (ph / 2) * 0.8
  const y1 = midY - (v1 / vMax) * amp
  const y2 = midY - (v2 / vMax) * amp
  const xL = padL + pw * 0.25, xR = padL + pw * 0.75
  ctx.save()
  // Center line: the constant-relative-velocity axis (no motion along it).
  ctx.strokeStyle = '#a99760'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padL + pw, midY); ctx.stroke()
  // Guide rails
  ctx.strokeStyle = '#e5dcc0'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(xL, padT); ctx.lineTo(xL, padT + ph); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(xR, padT); ctx.lineTo(xR, padT + ph); ctx.stroke()
  // Dots (heavier body larger)
  const r1 = dotRadius(s.M1, s.M1, s.M2)
  const r2 = dotRadius(s.M2, s.M1, s.M2)
  ctx.fillStyle = C1
  ctx.beginPath(); ctx.arc(xL, y1, r1, 0, 2 * Math.PI); ctx.fill()
  ctx.fillStyle = C2
  ctx.beginPath(); ctx.arc(xR, y2, r2, 0, 2 * Math.PI); ctx.fill()
  ctx.fillStyle = '#3a2c1a'
  ctx.font = '600 13px "IBM Plex Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('m₁', xL, padT + ph + 22)
  ctx.fillText('m₂', xR, padT + ph + 22)
  // Axes: the xy plane (x is the λ line).
  ctx.fillStyle = '#715f43'
  ctx.font = '11px "IBM Plex Mono", monospace'
  ctx.textAlign = 'right'
  ctx.fillText('x (spatial)', padL + pw, midY - 8)
  ctx.textAlign = 'left'
  ctx.fillText('y', padL + 4, padT + 12)
  ctx.restore()
}

// Dot radius scales with mass: the heavier body draws larger.
// Guarded: both masses zero -> plain base radius (avoids 0/0 = NaN).
function dotRadius(M, M1, M2) {
  const mMax = Math.max(M1, M2)
  return mMax > 0 ? 5 + 7 * (M / mMax) : 5
}

// Bodies: in-line wobble — the yz plane, looking down the x (λ) axis, z up.
// Both bodies sit on the line of sight (center); the wobble Xₙ(t) is along y,
// which lies horizontal in this view: yₙ(t) = Xₙ(t). They move opposite —
// when one shifts left, the other shifts right — so the smaller (lighter)
// body visibly crosses in front of the larger one (drawn on top at crossings).
// Each dot wraps on its own wobble period, so both loop seamlessly.
function renderInlineWobbleFrame(ctx, canvas, s, tau) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const { T1, T2, NT, x1, x2 } = wobbleCurves(s.M1, s.M2, P)
  const v1 = samplePeriodic(x1, T1, NT, tau)
  const v2 = samplePeriodic(x2, T2, NT, tau)
  const all = [...x1, ...x2]
  const vMax = Math.max(Math.abs(Math.min(...all)), Math.abs(Math.max(...all)), 0.1)
  const { padL, padT, pw, ph } = g
  const midX = padL + pw / 2, midY = padT + ph / 2
  const amp = (pw / 2) * 0.8
  const x1p = midX + (v1 / vMax) * amp
  const x2p = midX + (v2 / vMax) * amp
  const r1 = dotRadius(s.M1, s.M1, s.M2)
  const r2 = dotRadius(s.M2, s.M1, s.M2)
  ctx.save()
  // Horizontal rail: the y-axis (wobble direction); z is vertical, bodies at z=0.
  ctx.strokeStyle = '#e5dcc0'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padL + pw, midY); ctx.stroke()
  // Center point: the impartial reference, head-on.
  ctx.strokeStyle = '#a99760'
  ctx.beginPath()
  ctx.moveTo(midX - 6, midY); ctx.lineTo(midX + 6, midY)
  ctx.moveTo(midX, midY - 6); ctx.lineTo(midX, midY + 6)
  ctx.stroke()
  // Heavier/larger first (underneath), lighter on top at crossings.
  const order = s.M1 >= s.M2
    ? [[x1p, r1, C1], [x2p, r2, C2]]
    : [[x2p, r2, C2], [x1p, r1, C1]]
  for (const [px, r, color] of order) {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(px, midY, r, 0, 2 * Math.PI); ctx.fill()
  }
  // Axes: the yz plane, z up.
  ctx.fillStyle = '#715f43'
  ctx.font = '11px "IBM Plex Mono", monospace'
  ctx.textAlign = 'left'
  ctx.fillText('z', midX + 8, padT + 12)
  ctx.textAlign = 'right'
  ctx.fillText('y', padL + pw - 4, midY - 8)
  ctx.restore()
}

// Orbit diagrams: circular orbits about the balance point.
// The center (+) is λ* = L·M₂/(M₁+M₂) — the Gravity tab's balance point,
// i.e. the center of mass. Each body's orbital radius is its distance from
// that point: r₁ = λ*, r₂ = L − λ*, so r₁ + r₂ = L always.
// The heavier mass traces the smaller circle, matching the wobble diagram.
// The orbital angle φ runs one full turn per displayed wobble cycle, synced
// to the same animation clock as the wobble dots. Both diagrams share one
// scale so they compare directly.
// trueMotion=false: "apparent" — the larger mass pinned at the center, the other circling it at
// the full separation L (the naive relative orbit).
// trueMotion=true:  "true" — the separation split at the balance point,
// both bodies circling (+), opposite.
function renderOrbitFrame(ctx, canvas, s, tau, trueMotion) {
  const g = frameSetup(ctx, canvas)
  // Degenerate case (both masses zero): no orbits to draw — the widget is
  // hidden by the JSX guard, but never let NaN reach the canvas.
  if (!(s.M1 + s.M2 > 0)) return
  const P = gravityParams(s.M1, s.M2)
  const { tauMax } = wobbleCurves(s.M1, s.M2, P)
  // Clamp to [0, X_MAX]: with one mass at zero, (X_MAX·M₂)/(M₁+M₂) can
  // round-trip a few ulps past X_MAX, making R₂ a tiny negative number —
  // and ctx.arc throws on a negative radius, freezing every graph.
  const lamStar = Math.min(Math.max((X_MAX * s.M2) / (s.M1 + s.M2), 0), X_MAX)
  const R1 = lamStar, R2 = X_MAX - lamStar
  const { padT, pw, ph } = g
  const cx = g.padL + pw / 2, cy = padT + ph / 2
  // True Motion zooms around the fit scale; Apparent stays at fit.
  const zoom = trueMotion ? (s.orbitZoom || 1) : 1
  const sc = (((Math.min(pw, ph) / 2) * 0.78) / X_MAX) * zoom
  const phi = 2 * Math.PI * (((tau % tauMax) + tauMax) % tauMax) / tauMax
  const p1x = trueMotion ? cx - R1 * sc * Math.cos(phi) : cx
  const p1y = trueMotion ? cy - R1 * sc * Math.sin(phi) : cy
  const p2x = cx + (trueMotion ? R2 : X_MAX) * sc * Math.cos(phi)
  const p2y = cy + (trueMotion ? R2 : X_MAX) * sc * Math.sin(phi)
  ctx.save()
  // Orbit guides
  ctx.strokeStyle = '#e5dcc0'
  ctx.lineWidth = 1
  for (const R of (trueMotion ? [R1, R2] : [X_MAX])) {
    ctx.beginPath(); ctx.arc(cx, cy, R * sc, 0, 2 * Math.PI); ctx.stroke()
  }
  if (trueMotion) {
    // Barycenter: the impartial center point.
    ctx.strokeStyle = '#a99760'
    ctx.beginPath()
    ctx.moveTo(cx - 6, cy); ctx.lineTo(cx + 6, cy)
    ctx.moveTo(cx, cy - 6); ctx.lineTo(cx, cy + 6)
    ctx.stroke()
  }
  // Force line: gravity acts along the line joining the two masses.
  ctx.save()
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = '#b3a684'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(p1x, p1y)
  ctx.lineTo(p2x, p2y)
  ctx.stroke()
  ctx.restore()
  const dot = (x, y, r, color, label) => {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill()
    ctx.fillStyle = '#3a2c1a'
    ctx.font = '600 13px "IBM Plex Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, x, y + 26)
  }
  const r1 = dotRadius(s.M1, s.M1, s.M2)
  const r2 = dotRadius(s.M2, s.M1, s.M2)
  if (!trueMotion && s.M2 > s.M1) {
    // Apparent view pins the larger mass: m₂ takes the center.
    dot(p1x, p1y, r2, C2, 'm₂')
    dot(p2x, p2y, r1, C1, 'm₁')
  } else {
    dot(p1x, p1y, r1, C1, 'm₁')
    dot(p2x, p2y, r2, C2, 'm₂')
  }
  ctx.restore()
}
// Motion tab: elliptical relative orbit — the step between the circular
// apparent view and True Motion. Restores distance variance while keeping
// the larger mass fixed, now at one focus of the ellipse (Kepler's first
// law); both foci are drawn, the empty one as a cross. The balance point
// splits the separation L into the lever arms λ* and L−λ*, and their
// normalized difference sets the eccentricity, so the shape follows the
// masses: e = |λ*−(L−λ*)|/L = |M₁−M₂|/(M₁+M₂). Semi-major axis a = L,
// semi-minor axis b = a√(1−e²). Equal masses give e = 0, a circle of
// radius L — the apparent view returns as a special case. The phase
// advances uniformly with tau (Kepler's equation is not solved — this is
// the shape, not the timing).
function renderEllipseFrame(ctx, canvas, s, tau) {
  const g = frameSetup(ctx, canvas)
  if (!(s.M1 + s.M2 > 0)) return
  const P = gravityParams(s.M1, s.M2)
  const { tauMax } = wobbleCurves(s.M1, s.M2, P)
  // Balance point λ* = L·M₂/(M₁+M₂) splits L into λ* and L−λ*; the
  // eccentricity is their normalized difference.
  const lamStar = (X_MAX * s.M2) / (s.M1 + s.M2)
  const e = Math.min(Math.abs(2 * lamStar - X_MAX) / X_MAX, 0.999) // e < 1 keeps r(φ) finite
  const a = X_MAX
  const c = a * e
  const b = a * Math.sqrt(1 - e * e)
  const { padT, pw, ph } = g
  // Ellipse center at the canvas center; fit the semi-major axis a.
  // The foci sit one focal length on either side of it.
  const ex = g.padL + pw / 2, ey = padT + ph / 2
  const sc = (((Math.min(pw, ph) / 2) * 0.78) / a)
  const phi = 2 * Math.PI * (((tau % tauMax) + tauMax) % tauMax) / tauMax
  // Occupied focus one focal length ahead of center (periapsis along +x).
  const fx = ex + c * sc, fy = ey
  const m1IsMax = s.M1 >= s.M2
  const fixColor = m1IsMax ? C1 : C2, fixLabel = m1IsMax ? 'm₁' : 'm₂'
  const movColor = m1IsMax ? C2 : C1, movLabel = m1IsMax ? 'm₂' : 'm₁'
  const fixR = dotRadius(Math.max(s.M1, s.M2), s.M1, s.M2)
  const movR = dotRadius(Math.min(s.M1, s.M2), s.M1, s.M2)
  // Distance from the occupied focus at phase phi.
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(phi))
  const mx = fx + r * sc * Math.cos(phi)
  const my = fy + r * sc * Math.sin(phi)
  ctx.save()
  // Ellipse guide.
  ctx.strokeStyle = '#e5dcc0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.ellipse(ex, ey, a * sc, b * sc, 0, 0, 2 * Math.PI)
  ctx.stroke()
  // Empty focus marker.
  ctx.strokeStyle = '#a99760'
  ctx.lineWidth = 1.5
  const ux = ex - c * sc
  ctx.beginPath()
  ctx.moveTo(ux - 6, ey); ctx.lineTo(ux + 6, ey)
  ctx.moveTo(ux, ey - 6); ctx.lineTo(ux, ey + 6)
  ctx.stroke()
  // Force line: gravity acts along the line joining the two masses.
  ctx.globalAlpha = 0.55
  ctx.strokeStyle = '#b3a684'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(fx, fy)
  ctx.lineTo(mx, my)
  ctx.stroke()
  ctx.globalAlpha = 1
  const dot = (x, y, r, color, label) => {
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill()
    ctx.fillStyle = '#3a2c1a'
    ctx.font = '600 13px "IBM Plex Mono", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, x, y + 26)
  }
  dot(fx, fy, fixR, fixColor, fixLabel)
  dot(mx, my, movR, movColor, movLabel)
  ctx.restore()
}

// Motion tab: static ellipse geometry diagram, drawn underneath the animated
// Elliptical Relative Motion. Same a/b/e as the animation; labels the
// semi-major axis a (center → vertex) and the semi-minor axis b
// (center → co-vertex), with both foci marked.
function renderEllipseGeomFrame(ctx, canvas, s) {
  const g = frameSetup(ctx, canvas)
  if (!(s.M1 + s.M2 > 0)) return
  const lamStar = (X_MAX * s.M2) / (s.M1 + s.M2)
  const e = Math.min(Math.abs(2 * lamStar - X_MAX) / X_MAX, 0.999)
  const a = X_MAX
  const c = a * e
  const b = a * Math.sqrt(1 - e * e)
  const { padT, pw, ph } = g
  // Ellipse centered on the canvas; fit the semi-major axis a.
  const ex = g.padL + pw / 2, ey = padT + ph / 2
  const sc = (((Math.min(pw, ph) / 2) * 0.78) / a)
  const asc = a * sc, bsc = b * sc, csc = c * sc
  ctx.save()
  // Ellipse outline.
  ctx.strokeStyle = '#8a7a52'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.ellipse(ex, ey, asc, bsc, 0, 0, 2 * Math.PI)
  ctx.stroke()
  // Dimension lines: a along the major axis (center → vertex),
  // b up the minor axis (center → co-vertex).
  ctx.strokeStyle = C2
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(ex, ey); ctx.lineTo(ex + asc, ey)
  ctx.moveTo(ex, ey); ctx.lineTo(ex, ey - bsc)
  ctx.stroke()
  // Foci.
  ctx.strokeStyle = '#a99760'
  ctx.lineWidth = 1.5
  for (const fxp of [ex + csc, ex - csc]) {
    ctx.beginPath()
    ctx.moveTo(fxp - 6, ey); ctx.lineTo(fxp + 6, ey)
    ctx.moveTo(fxp, ey - 6); ctx.lineTo(fxp, ey + 6)
    ctx.stroke()
  }
  // Center dot.
  ctx.fillStyle = '#3a2c1a'
  ctx.beginPath(); ctx.arc(ex, ey, 3, 0, 2 * Math.PI); ctx.fill()
  // Labels.
  ctx.font = '600 14px "IBM Plex Mono", monospace'
  ctx.textAlign = 'center'
  ctx.fillText('a', ex + asc / 2, ey - 10)
  ctx.textAlign = 'left'
  ctx.fillText('b', ex + 10, ey - bsc / 2 + 5)
  ctx.restore()
}


// Motion tab, second graph: local push-pull D(λₙ) = [W₁−J₁] − [W₂−J₂].
// The integrand of the displacement — net push in +λₙ at each point.
// Push-pull density: the local remaining-inertia difference between the bodies.
//   P₁(λₙ) = W₁(λₙ) − J₁(λₙ),   P₂(λₙ) = W₂(λₙ) − J₂(λₙ),   D(λₙ) = P₁ − P₂.
// Mode: 'parts' (P₁, P₂), 'diff' (D), 'all' (all three).
function renderPushPullFrame(ctx, canvas, s, tau, mode) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const N = 200
  const work1 = [], work2 = [], imp1 = [], imp2 = []
  let w1 = 0, w2 = 0, j1 = 0, j2 = 0
  let prevX = 0
  let prevW1 = psi1(0, tau, P, s.M2).re
  let prevW2 = psi2(0, tau, P, s.M1).re
  let prevJ1 = psi1(0, tau, P, s.M2).im
  let prevJ2 = psi2(0, tau, P, s.M1).im
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * X_MAX
    const p1 = psi1(x, tau, P, s.M2)
    const p2 = psi2(x, tau, P, s.M1)
    if (i > 0) {
      const dx = x - prevX
      w1 += ((prevW1 + p1.re) / 2) * dx
      w2 += ((prevW2 + p2.re) / 2) * dx
      j1 += ((prevJ1 + p1.im) / 2) * dx
      j2 += ((prevJ2 + p2.im) / 2) * dx
    }
    work1.push(w1); work2.push(w2); imp1.push(j1); imp2.push(j2)
    prevX = x
    prevW1 = p1.re; prevW2 = p2.re; prevJ1 = p1.im; prevJ2 = p2.im
  }
  const p1Arr = work1.map((w, i) => w - imp1[i])
  const p2Arr = work2.map((w, i) => w - imp2[i])
  const dArr = p1Arr.map((p, i) => p - p2Arr[i])
  const showParts = mode === 'parts' || mode === 'all'
  const showDiff = mode === 'diff' || mode === 'all'
  const shown = [...(showParts ? [...p1Arr, ...p2Arr] : []), ...(showDiff ? dArr : [])]
  const yMax = Math.max(Math.abs(Math.min(...shown)) * 1.15, Math.abs(Math.max(...shown)) * 1.15, 0.1)
  const { X, Y } = drawGrid(ctx, g, yMax)
  const interp = (arr) => (x) => {
    const idx = Math.min(Math.floor((x / X_MAX) * N), N - 1)
    const t = ((x / X_MAX) * N) - idx
    return arr[idx] * (1 - t) + arr[idx + 1] * t
  }
  if (showParts) {
    trace(ctx, X, Y, interp(p1Arr), C1, 2.5, [])
    trace(ctx, X, Y, interp(p2Arr), C2, 2.5, [])
  }
  if (showDiff) trace(ctx, X, Y, interp(dArr), '#3a2c1a', 2.5, [])
}

// Temporal push-pull density: the same remaining-inertia difference, the whole
// spatial line collapsed and tracked through time. Since Fₙ(t) = Jₙ(L,t) − Wₙ(L,t),
//   Pₙ(t) = Wₙ(L,t) − Jₙ(L,t) = −Fₙ(t),   T(t) = P₁(t) − P₂(t) = F₂(t) − F₁(t).
function renderPushPullTimeFrame(ctx, canvas, s, mode) {
  const g = frameSetup(ctx, canvas)
  const P = gravityParams(s.M1, s.M2)
  const { tauMax, T2, NT, f1, f2 } = wobbleCurves(s.M1, s.M2, P)
  // Pₙ(t) = −Fₙ(t), evaluated at the same instant t for both bodies; body 2
  // wraps on its own period.
  const p1at = (t) => -samplePeriodic(f1, tauMax, NT, t)
  const p2at = (t) => -samplePeriodic(f2, T2, NT, t)
  const diffAt = (t) => p1at(t) - p2at(t)
  const showParts = mode === 'parts' || mode === 'all'
  const showDiff = mode === 'diff' || mode === 'all'
  const shown = []
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * tauMax
    if (showParts) shown.push(p1at(t), p2at(t))
    if (showDiff) shown.push(diffAt(t))
  }
  const yMax = Math.max(Math.abs(Math.min(...shown)) * 1.15, Math.abs(Math.max(...shown)) * 1.15, 0.1)
  const { X, Y } = drawTimeGrid(ctx, g, yMax, tauMax)
  if (showParts) {
    trace(ctx, X, Y, p1at, C1, 2.5, [], tauMax)
    trace(ctx, X, Y, p2at, C2, 2.5, [], tauMax)
  }
  if (showDiff) trace(ctx, X, Y, diffAt, '#3a2c1a', 2.5, [], tauMax)
}

// Legacy wrapper for backward compatibility
function renderCumFrame(ctx, canvas, s, tau) {
  renderPairFrame(ctx, canvas, s, tau, 1)
}

// Placeholder for area frame (not used - area is drawn in renderFrame for integ)
function renderAreaFrame(ctx, canvas, s, tau) {
  // Area graph is rendered via renderFrame with subtab='integ'
  renderFrame(ctx, canvas, s, tau)
}

const fmt = (v, d = 2) => v.toFixed(d)
const sci = (v) => v.toExponential(2)
// Speed readout: scientific notation once it gets small.
const fmtSpeed = (v) => (v > 0 && v < 0.1 ? v.toExponential(1) : v.toFixed(2))
// Fastest on-screen oscillation (display units): k2 = w2 = sqrt(M2/M1), k1 = w1 = 1.
// The slow range is scaled so the fastest wave keeps the same apparent motion.
const displayFreq = (M1, M2) => Math.max(1, Math.sqrt(M2 / Math.max(M1, 0.1)))

const supExp = (e) => <sup>{String(e).replace('-', '−')}</sup>

// Text box that sits above a slider. Typing allows only digits and one
// decimal point; the value commits (parsed + clamped) on blur or Enter.
function NumberInput({ value, min, max, onCommit }) {
  const [text, setText] = useState(String(value))
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (!focused) setText(String(value))
  }, [value, focused])

  const commit = () => {
    const num = parseNumberInput(text, value, min, max)
    setFocused(false)
    setText(String(num))
    onCommit(num)
  }

  return (
    <input
      className="num-input"
      value={text}
      inputMode="decimal"
      aria-label="type a value"
      onFocus={() => setFocused(true)}
      onBlur={commit}
      onChange={(e) => {
        if (isTypingAllowed(e.target.value)) setText(e.target.value)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.target.blur()
      }}
    />
  )
}

export default function WaveLab() {
  const [subtab, setSubtab] = useState('gravity')
  const [M1, setM1] = useState(2)
  const [M2, setM2] = useState(1)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [tau, setTau] = useState(0)
  const [showSum, setShowSum] = useState(true)
  const [waveDisplay, setWaveDisplay] = useState('all')
  const [ppDisplay, setPpDisplay] = useState('diff') // push-pull: 'parts' | 'diff' | 'all'
  const [speedMode, setSpeedMode] = useState('slow') // 'slow': 0–slowMax, 'fast': 1–2.5
  const [slowMax, setSlowMax] = useState(1)
  const [orbitZoom, setOrbitZoom] = useState(1) // True Motion zoom, 1 = fit

  // Rescale the slow-down range from the current masses; park speed at the top.
  const recalcSlow = (a, b) => {
    const m = 1 / displayFreq(a, b)
    setSlowMax(m)
    setSpeed(m)
  }

  // Pause parks the speed at slow-down/0 — that is what stops the motion.
  // Play restores the exact speed state from before the pause.
  const prevSpeedRef = useRef(null)
  const handlePlayPause = () => {
    if (playing) {
      prevSpeedRef.current = { mode: speedMode, speed }
      setSpeedMode('slow')
      setSpeed(0)
      setPlaying(false)
    } else {
      const prev = prevSpeedRef.current
      if (prev) {
        setSpeedMode(prev.mode)
        setSpeed(prev.speed)
      }
      setPlaying(true)
    }
  }

  const canvasRef = useRef(null)
  const canvasEnvelopeRef = useRef(null)
  const canvasPP1Ref = useRef(null)
  const canvasPP2Ref = useRef(null)
  const canvasEllipseRef = useRef(null)
  const canvasEllipseGeomRef = useRef(null)
  const canvasHalfRef = useRef(null)
  const canvasTotalRef = useRef(null)
  const canvasAreaRef = useRef(null)
  const canvasCumRef = useRef(null)
  const canvasPair2Ref = useRef(null)
  const canvasWobbleTimeRef = useRef(null)
  const canvasForceTimeRef = useRef(null)
  const canvasWobbleDotsRef = useRef(null)
  const canvasInlineWobbleRef = useRef(null)
  const canvasOrbitApparentRef = useRef(null)
  const canvasOrbitTrueRef = useRef(null)
  const canvasPushPullRef = useRef(null)
  const canvasPushPullTimeRef = useRef(null)
  const tauRef = useRef(0)
  const stateRef = useRef()
  stateRef.current = { subtab, M1, M2, playing, speed, showSum, waveDisplay, ppDisplay, orbitZoom }

  useEffect(() => {
    let raf
    let last = performance.now()
    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const s = stateRef.current
      if (!s) {
        raf = requestAnimationFrame(draw)
        return
      }
      if (s.playing) {
        tauRef.current += dt * s.speed
        setTau(Math.round(tauRef.current * 20) / 20)
      }
      // NOTE: canvasRef is re-read every frame because the main canvas is
      // remounted when switching tabs (gravity/derivatives render separate
      // <canvas> elements into the same ref). Capturing it once here would
      // keep drawing to the detached node after a tab switch.
      const canvas = canvasRef.current
      if (canvas) renderFrame(canvas.getContext('2d'), canvas, s, tauRef.current)
      if (s.subtab === 'gravity') {
        const ec = canvasEnvelopeRef.current
        if (ec) renderEnvelopeFrame(ec.getContext('2d'), ec, s, tauRef.current)
        const p1 = canvasPP1Ref.current
        if (p1) renderBodyPushPullFrame(p1.getContext('2d'), p1, s, tauRef.current, 1)
        const p2 = canvasPP2Ref.current
        if (p2) renderBodyPushPullFrame(p2.getContext('2d'), p2, s, tauRef.current, 2)
      }
      if (s.subtab === 'deriv') {
        const hc = canvasHalfRef.current
        if (hc) renderHalfFrame(hc.getContext('2d'), hc, s, tauRef.current)
        const tc = canvasTotalRef.current
        if (tc) renderTotalFrame(tc.getContext('2d'), tc, s, tauRef.current)
      }
      if (s.subtab === 'integ') {
        const cc = canvasCumRef.current
        if (cc) renderPairFrame(cc.getContext('2d'), cc, s, tauRef.current, 1)
        const p2 = canvasPair2Ref.current
        if (p2) renderPairFrame(p2.getContext('2d'), p2, s, tauRef.current, 2)
      }
      if (s.subtab === 'motion') {
        const wt = canvasWobbleTimeRef.current
        if (wt) renderWobbleTimeFrame(wt.getContext('2d'), wt, s)
        const ft = canvasForceTimeRef.current
        if (ft) renderForceTimeFrame(ft.getContext('2d'), ft, s)
        const wd = canvasWobbleDotsRef.current
        if (wd) renderWobbleDotsFrame(wd.getContext('2d'), wd, s, tauRef.current)
        const iw = canvasInlineWobbleRef.current
        if (iw) renderInlineWobbleFrame(iw.getContext('2d'), iw, s, tauRef.current)
        const oa = canvasOrbitApparentRef.current
        if (oa) renderOrbitFrame(oa.getContext('2d'), oa, s, tauRef.current, false)
        const el = canvasEllipseRef.current
        if (el) renderEllipseFrame(el.getContext('2d'), el, s, tauRef.current)
        const eg = canvasEllipseGeomRef.current
        if (eg) renderEllipseGeomFrame(eg.getContext('2d'), eg, s)
        const ot = canvasOrbitTrueRef.current
        if (ot) renderOrbitFrame(ot.getContext('2d'), ot, s, tauRef.current, true)
        const pp = canvasPushPullRef.current
        if (pp) renderPushPullFrame(pp.getContext('2d'), pp, s, tauRef.current, s.ppDisplay)
        const ppt = canvasPushPullTimeRef.current
        if (ppt) renderPushPullTimeFrame(ppt.getContext('2d'), ppt, s, s.ppDisplay)
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const P = gravityParams(M1, M2)
  const lam = structuralWavelengths(M1, M2)
  const T = theoryParams(M1, M2)
  // Paper's temporal cross-term coefficient: ω₁M₂ = ω₂M₁ = 2πM₁M₂c²/h
  const xTerm = ((2 * Math.PI) / SI.h) * M1 * M2 * SI.c * SI.c

  return (
    <div className="lab-layout">
      <nav className="sim-nav" aria-label="Simulations">
        <h3>Simulations</h3>
        <div className="sim-list" role="tablist" aria-label="Simulations">
          <button
            className="sim-item"
            role="tab"
            aria-selected={subtab === 'gravity'}
            onClick={() => setSubtab('gravity')}
          >
            Gravity waves
          </button>
          <button
            className="sim-item"
            role="tab"
            aria-selected={subtab === 'deriv'}
            onClick={() => setSubtab('deriv')}
          >
            Derivatives
          </button>
          <button
            className="sim-item"
            role="tab"
            aria-selected={subtab === 'integ'}
            onClick={() => setSubtab('integ')}
          >
            Integration
          </button>
          <button
            className="sim-item"
            role="tab"
            aria-selected={subtab === 'motion'}
            onClick={() => setSubtab('motion')}
          >
            Motion
          </button>
        </div>
      </nav>
      <div className="lab-side">
      <div className="lab-controls">

        <div className="control-group">
          <h3>M₁</h3>
          <NumberInput value={M1} min={0} max={100} onCommit={setM1} />
          <Slider value={M1} min={0} max={100} step={0.01}
            onChange={setM1} />
        </div>

        <div className="control-group">
          <h3>M₂</h3>
          <NumberInput value={M2} min={0} max={100} onCommit={setM2} />
          <Slider value={M2} min={0} max={100} step={0.01}
            onChange={setM2} />
        </div>

        <div className="control-group">
          <h3>Derived from M₁, M₂</h3>
          <div className="derived-grid">
            <div className="derived-box"><span>k₁</span><b>{fmt(P.k1)}</b></div>
            <div className="derived-box"><span>k₂</span><b>{fmt(P.k2)}</b></div>
            <div className="derived-box"><span>ω₁</span><b>{fmt(P.w1)}</b></div>
            <div className="derived-box"><span>ω₂</span><b>{fmt(P.w2)}</b></div>
            <div className="derived-box"><span>A₁</span><b>{fmt(P.A1)}</b></div>
            <div className="derived-box"><span>A₂</span><b>{fmt(P.A2)}</b></div>
            <div className="derived-box"><span>A₁²</span><b>{fmt(P.A1 * P.A1)}</b></div>
            <div className="derived-box"><span>A₂²</span><b>{fmt(P.A2 * P.A2)}</b></div>
            <div className="derived-box"><span>β</span><b>{fmt(P.beta, 3)}</b></div>
            <div className="derived-box"><span>ΣA²</span><b>{fmt(P.A1 * P.A1 + P.A2 * P.A2)}</b></div>
            <div className="derived-box"><span>|λ₁|</span><b>{lam ? `${sci(cAbs(lam.l1))} m` : '—'}</b></div>
            <div className="derived-box"><span>|λ₂|</span><b>{lam ? `${sci(cAbs(lam.l2))} m` : '—'}</b></div>
          </div>
        </div>
      </div>
      </div>

      <div className="lab-stage">
        <div className="transport transport-bar">
          <div className="transport-title-row">
            <h3 className="transport-title">Animation settings</h3>
            <span className="time-readout">τ = {tau.toFixed(2)}</span>
          </div>
          <div className="transport-bar-row">
            <label className="speed-mode-row">
              <span>Speed range</span>
              <select
                className="speed-mode"
                value={speedMode}
                aria-label="speed mode"
                onChange={(e) => {
                  const m = e.target.value
                  setSpeedMode(m)
                  if (m === 'fast') {
                    setSpeed((s) => Math.max(s, 1))
                  } else {
                    recalcSlow(M1, M2) // auto-recompute when switching back to slow down
                  }
                }}
              >
                <option value="slow">Slow down</option>
                <option value="fast">Speed up</option>
              </select>
            </label>
            <div className="transport-btn-row">
              <button className="round-btn" onClick={handlePlayPause} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? '❚❚' : '▶'}
              </button>
              <button
                className="round-btn"
                aria-label="Reset time"
                onClick={() => {
                  tauRef.current = 0
                  setTau(0)
                }}
              >
                ↻
              </button>
            </div>
          </div>
          <div className="transport-slider-row">
            {speedMode === 'slow' ? (
              <Slider label={null} value={Math.sqrt(Math.min(speed, slowMax) / slowMax)} min={0} max={1} step={0.005}
                format={() => fmtSpeed(speed)}
                onChange={(p) => setSpeed(slowMax * p * p)} />
            ) : (
              <Slider label={null} value={Math.min(Math.max(speed, 1), 2.5)} min={1} max={2.5} step={0.1}
                format={() => fmtSpeed(speed)}
                onChange={setSpeed} />
            )}
          </div>
          {speedMode === 'slow' && (
            <div className="transport-recalc-row">
              <button className="recalc-btn" onClick={() => recalcSlow(M1, M2)}>
                Recalculate slider step
              </button>
            </div>
          )}
        </div>
        {subtab === 'gravity' ? (
          <>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Gravity Waves Inertia-Energy</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                {(waveDisplay === 'waves' || waveDisplay === 'all') && (
                  <>
                    <span><i className="swatch" style={{ background: C1 }} /><Tex tex="\psi_1(M_1,M_2) \to +\lambda_n" /></span>
                    <span><i className="swatch" style={{ background: C2 }} /><Tex tex="\psi_2(M_2,M_1) \to -\lambda_n" /></span>
                  </>
                )}
                {(waveDisplay === 'sum' || waveDisplay === 'all') && <span><i className="swatch" style={{ background: CS }} /><Tex tex="\psi_s = \psi_1 + \psi_2" /></span>}
                <span><i className="swatch swatch-dashed" /><Tex tex="\text{balance point } \lambda^*" /></span>
              </div>
              <label className="check-row graph-check">
                Display
                <select value={waveDisplay} onChange={(e) => setWaveDisplay(e.target.value)}>
                  <option value="waves">ψ₁, ψ₂</option>
                  <option value="sum">ψ₁ + ψ₂</option>
                  <option value="all">ψ₁, ψ₂, ψ₁ + ψ₂</option>
                </select>
              </label>
            </div>
            <canvas ref={canvasRef} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">The Envelope</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><i className="swatch" style={{ background: C1 }} /><Tex tex="\psi_1" /></span>
                <span><i className="swatch" style={{ background: C2 }} /><Tex tex="\psi_2" /></span>
                <span><i className="swatch swatch-dashed" /><Tex tex="\text{balance point } \lambda^*" /></span>
              </div>
            </div>
            <canvas ref={canvasEnvelopeRef} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Push-Pull of M₁</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><i className="swatch" style={{ background: C1 }} /><Tex tex="P_1 = W_1 - J_1" /></span>
                <span><i className="swatch" style={{ background: '#16a34a', opacity: 0.5 }} /><Tex tex="\text{push } (P_1 > 0)" /></span>
                <span><i className="swatch" style={{ background: '#dc2626', opacity: 0.5 }} /><Tex tex="\text{pull } (P_1 < 0)" /></span>
              </div>
            </div>
            <canvas ref={canvasPP1Ref} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Push-Pull of M₂</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><i className="swatch" style={{ background: C2 }} /><Tex tex="P_2 = W_2 - J_2" /></span>
                <span><i className="swatch" style={{ background: '#16a34a', opacity: 0.5 }} /><Tex tex="\text{push } (P_2 > 0)" /></span>
                <span><i className="swatch" style={{ background: '#dc2626', opacity: 0.5 }} /><Tex tex="\text{pull } (P_2 < 0)" /></span>
              </div>
            </div>
            <canvas ref={canvasPP2Ref} className="wave-canvas" />
          </div>
          </>
        ) : subtab === 'deriv' ? (
          <>
            <div className="graph-box">
              <div className="graph-title-row">
                <h2 className="graph-title">Gravity Wave Inertia-Energy Rates Of Change</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  <span><i className="swatch" style={{ background: C1 }} /><Tex tex="\dfrac{\partial\psi_1}{\partial M_1} = ik_1\psi_1" /></span>
                  <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C1} 0 5px, transparent 5px 9px)` }} /><Tex tex="\dfrac{\partial\psi_1}{\partial M_2} = -i\omega_1\psi_1" /></span>
                  <span><i className="swatch" style={{ background: C2 }} /><Tex tex="\dfrac{\partial\psi_2}{\partial M_1} = -i\omega_2\psi_2" /></span>
                  <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C2} 0 5px, transparent 5px 9px)` }} /><Tex tex="\dfrac{\partial\psi_2}{\partial M_2} = ik_2\psi_2" /></span>
                </div>
              </div>
              <canvas ref={canvasRef} className="wave-canvas" />
            </div>
            <div className="graph-box">
              <div className="graph-title-row">
                <h2 className="graph-title">Inertia To Energy Symmetry</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  <span><i className="swatch" style={{ background: C1 }} /><Tex tex="dM_1 = \dfrac{\partial\psi_1}{\partial M_1} + \dfrac{\partial\psi_2}{\partial M_1}" /></span>
                  <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C2} 0 5px, transparent 5px 9px)` }} /><Tex tex="dM_2 = \dfrac{\partial\psi_1}{\partial M_2} + \dfrac{\partial\psi_2}{\partial M_2}" /></span>
                </div>
              </div>
              <canvas ref={canvasHalfRef} className="wave-canvas half-canvas" />
            </div>
            <div className="graph-box">
              <div className="graph-title-row">
                <h2 className="graph-title">Conservation of Inertia-Energy</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  <span><i className="swatch" style={{ background: CS }} /><Tex tex="\text{total } d\psi_s" /></span>
                </div>
              </div>
              <canvas ref={canvasTotalRef} className="wave-canvas total-canvas" />
            </div>
          </>
        ) : subtab === 'integ' ? (
          <>
            <div className="graph-box">
              <div className="graph-title-row">
                <h2 className="graph-title">Potential Work and Impulse of M₁</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  {(waveDisplay === 'waves' || waveDisplay === 'all') && (
                    <>
                      <span><i className="swatch" style={{ background: C1 }} /><Tex tex="W_1 = \int \mathrm{Re}(\psi_1) \, d\lambda_n" /></span>
                      <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C1} 0 5px, transparent 5px 9px)` }} /><Tex tex="J_1 = \int \mathrm{Im}(\psi_1) \, d\lambda_n" /></span>
                      <span><i className="swatch" style={{ background: '#16a34a', opacity: 0.5 }} /><Tex tex="\text{inertia stored}" /></span>
                      <span><i className="swatch" style={{ background: '#dc2626', opacity: 0.5 }} /><Tex tex="\text{inertia released}" /></span>
                    </>
                  )}
                  {(waveDisplay === 'sum' || waveDisplay === 'all') && <span><i className="swatch" style={{ background: CS }} /><Tex tex="W_1 - J_1 = \text{inertia remaining}" /></span>}
                </div>
                <label className="check-row graph-check">
                  Display
                  <select value={waveDisplay} onChange={(e) => setWaveDisplay(e.target.value)}>
                    <option value="waves">W₁, J₁</option>
                    <option value="sum">W₁ − J₁</option>
                    <option value="all">W₁, J₁, W₁ − J₁</option>
                  </select>
                </label>
              </div>
              <canvas ref={canvasCumRef} className="wave-canvas" />
            </div>
            <div className="graph-box">
              <div className="graph-title-row">
                <h2 className="graph-title">Potential Work and Impulse of M₂</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  {(waveDisplay === 'waves' || waveDisplay === 'all') && (
                    <>
                      <span><i className="swatch" style={{ background: C2 }} /><Tex tex="W_2 = \int \mathrm{Re}(\psi_2) \, d\lambda_n" /></span>
                      <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C2} 0 5px, transparent 5px 9px)` }} /><Tex tex="J_2 = \int \mathrm{Im}(\psi_2) \, d\lambda_n" /></span>
                      <span><i className="swatch" style={{ background: '#16a34a', opacity: 0.5 }} /><Tex tex="\text{inertia stored}" /></span>
                      <span><i className="swatch" style={{ background: '#dc2626', opacity: 0.5 }} /><Tex tex="\text{inertia released}" /></span>
                    </>
                  )}
                  {(waveDisplay === 'sum' || waveDisplay === 'all') && <span><i className="swatch" style={{ background: CS }} /><Tex tex="W_2 - J_2 = \text{inertia remaining}" /></span>}
                </div>
                <label className="check-row graph-check">
                  Display
                  <select value={waveDisplay} onChange={(e) => setWaveDisplay(e.target.value)}>
                    <option value="waves">W₂, J₂</option>
                    <option value="sum">W₂ − J₂</option>
                    <option value="all">W₂, J₂, W₂ − J₂</option>
                  </select>
                </label>
              </div>
              <canvas ref={canvasPair2Ref} className="wave-canvas" />
            </div>
          </>
        ) : subtab === 'motion' ? (
          <>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Push-Pull Density (spatial)</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                {(ppDisplay === 'parts' || ppDisplay === 'all') && (
                  <>
                    <span><i className="swatch" style={{ background: C1 }} /><Tex tex="P_1(\lambda_n)" /></span>
                    <span><i className="swatch" style={{ background: C2 }} /><Tex tex="P_2(\lambda_n)" /></span>
                  </>
                )}
                {(ppDisplay === 'diff' || ppDisplay === 'all') && <span><i className="swatch" style={{ background: '#3a2c1a' }} /><Tex tex="D(\lambda_n) = P_1 - P_2" /></span>}
              </div>
              <label className="check-row graph-check">
                Display
                <select value={ppDisplay} onChange={(e) => setPpDisplay(e.target.value)}>
                  <option value="parts">P₁, P₂</option>
                  <option value="diff">P₁ − P₂</option>
                  <option value="all">P₁, P₂, P₁ − P₂</option>
                </select>
              </label>
            </div>
            <canvas ref={canvasPushPullRef} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Push-Pull Density (temporal)</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                {(ppDisplay === 'parts' || ppDisplay === 'all') && (
                  <>
                    <span><i className="swatch" style={{ background: C1 }} /><Tex tex="P_1(t)" /></span>
                    <span><i className="swatch" style={{ background: C2 }} /><Tex tex="P_2(t)" /></span>
                  </>
                )}
                {(ppDisplay === 'diff' || ppDisplay === 'all') && <span><i className="swatch" style={{ background: '#3a2c1a' }} /><Tex tex="T(t) = P_1 - P_2" /></span>}
              </div>
              <label className="check-row graph-check">
                Display
                <select value={ppDisplay} onChange={(e) => setPpDisplay(e.target.value)}>
                  <option value="parts">P₁, P₂</option>
                  <option value="diff">P₁ − P₂</option>
                  <option value="all">P₁, P₂, P₁ − P₂</option>
                </select>
              </label>
            </div>
            <canvas ref={canvasPushPullTimeRef} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Net Impulse Over Time</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><i className="swatch" style={{ background: C1 }} /><Tex tex="F_1(t)" /></span>
                <span><i className="swatch" style={{ background: C2 }} /><Tex tex="F_2(t)" /></span>
              </div>
            </div>
            <canvas ref={canvasForceTimeRef} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Wobble Over Time</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><i className="swatch" style={{ background: C1 }} /><Tex tex="X_1(t)" /></span>
                <span><i className="swatch" style={{ background: C2 }} /><Tex tex="X_2(t)" /></span>
              </div>
            </div>
            <canvas ref={canvasWobbleTimeRef} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Bodies: In-Line Wobble (yz plane)</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><i className="swatch" style={{ background: C1 }} /><Tex tex="m_1" /></span>
                <span><i className="swatch" style={{ background: C2 }} /><Tex tex="m_2" /></span>
                <span><Tex tex="\text{same wobble, looking down the } x \text{ axis}" /></span>
              </div>
            </div>
            <canvas ref={canvasInlineWobbleRef} className="wave-canvas" />
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Bodies: Wobble (xy plane)</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><i className="swatch" style={{ background: C1 }} /><Tex tex="m_1" /></span>
                <span><i className="swatch" style={{ background: C2 }} /><Tex tex="m_2" /></span>
                <span><Tex tex="\text{apparent wobble — projection of the circular motion}" /></span>
              </div>
            </div>
            <canvas ref={canvasWobbleDotsRef} className="wave-canvas" />
          </div>
          {/* Orbits need at least one nonzero mass; with both at zero the
              radii are 0/0, so hide the diagrams instead of drawing NaN.
              They remount automatically once a mass is nonzero again. */}
          {M1 + M2 > 0 ? (
          <>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Apparent Relative Motion</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><Tex tex="M_{\max} \text{ fixed --- the naive view}" /></span>
                <span><Tex tex="\lambda_2 - \lambda_1 = \lambda_1 - \lambda_2 = x" /></span>
              </div>
            </div>
            <canvas ref={canvasOrbitApparentRef} className="wave-canvas-orbit" />
            <div className="graph-footnote">xy plane</div>
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Elliptical Relative Motion</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><Tex tex="M_{\max} \text{ fixed at a focus}" /></span>
              </div>
            </div>
            <p className="graph-note">Restoring distance variance — the larger mass fixed, the eccentricity set by the balance-point split.</p>
            <canvas ref={canvasEllipseRef} className="wave-canvas-orbit" />
            <canvas ref={canvasEllipseGeomRef} className="wave-canvas-orbit" />
            <div className="graph-caption"><Tex tex="\text{static ellipse: } a \text{ semi-major axis, } b \text{ semi-minor axis}" /></div>
            <div className="graph-caption"><Tex tex="T^2 \propto a^3" /></div>
            <div className="graph-caption"><Tex tex="\text{Kepler's third law}" /></div>
            <div className="graph-footnote">xy plane</div>
          </div>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">True Motion</h2>
            </div>
            <div className="graph-meta-row">
              <div className="legend">
                <span><Tex tex="\text{axis wrapped around the center, split at } \lambda^*" /></span>
              </div>
            </div>
            <canvas ref={canvasOrbitTrueRef} className="wave-canvas-orbit-lg" />
            <div className="graph-foot-row">
              <div className="zoom-controls">
                <button className="zoom-btn" onClick={() => setOrbitZoom(z => Math.max(0.5, z / 1.25))} aria-label="Zoom out">−</button>
                <span className="zoom-level">{Math.round(orbitZoom * 100)}%</span>
                <button className="zoom-btn" onClick={() => setOrbitZoom(z => Math.min(4, z * 1.25))} aria-label="Zoom in">+</button>
                {orbitZoom !== 1 && <button className="zoom-btn" onClick={() => setOrbitZoom(1)} aria-label="Reset zoom">reset</button>}
              </div>
              <div className="graph-footnote">xy plane</div>
            </div>
          </div>
          </>
          ) : (
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Orbits</h2>
            </div>
            <p className="placeholder-note">Both masses are at zero — there is nothing to orbit. Raise M₁ or M₂ above zero and the orbit diagrams will come back.</p>
          </div>
          )}
          </>
        ) : null}

        <div className="eq-panel">
        <div className="eq-groups">
          {subtab === 'gravity' ? (
            <>
              <div className="eq-group">
                <h4>Trigonometric form <span className="eq-note">— plotted · display units</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">ψ₁(M₁,M₂)</span><Tex tex="\psi_1 = A_1 e^{-\beta\lambda_n} \cos(k_1\lambda_n - \omega_1 M_2 \tau) + i A_1 e^{-\beta\lambda_n} \sin(k_1\lambda_n - \omega_1 M_2 \tau)" /></div>
                  <div className="eq-box wide"><span className="eq-label">ψ₂(M₂,M₁)</span><Tex tex="\psi_2 = A_2 e^{-\beta(L-\lambda_n)} \cos(-k_2\lambda_n - \omega_2 M_1 \tau) + i A_2 e^{-\beta(L-\lambda_n)} \sin(-k_2\lambda_n - \omega_2 M_1 \tau)" /></div>
                  <div className="eq-box wide"><span className="eq-label">Summed field</span><Tex tex="\psi_s = \psi_1 + \psi_2" /></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>With k, ω, λ substituted <span className="eq-note">— full theory</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">ψ₁(M₁,M₂)</span><Tex tex="\psi_1 = \sqrt{\dfrac{M_2}{M_1+M_2}} e^{-\beta\lambda_n} \left[\cos\left(\dfrac{2\pi\lambda_n}{\lambda_1} - \dfrac{2\pi M_1 M_2 c^2 \tau}{h}\right) + i \sin\left(\dfrac{2\pi\lambda_n}{\lambda_1} - \dfrac{2\pi M_1 M_2 c^2 \tau}{h}\right)\right]" /></div>
                  <div className="eq-box wide"><span className="eq-label">ψ₂(M₂,M₁)</span><Tex tex="\psi_2 = \sqrt{\dfrac{M_1}{M_1+M_2}} e^{-\beta(L-\lambda_n)} \left[\cos\left(-\dfrac{2\pi\lambda_n}{\lambda_2} - \dfrac{2\pi M_1 M_2 c^2 \tau}{h}\right) + i \sin\left(-\dfrac{2\pi\lambda_n}{\lambda_2} - \dfrac{2\pi M_1 M_2 c^2 \tau}{h}\right)\right]" /></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>With f, T substituted <span className="eq-note">— full theory</span></h4>
                <div className="eq-list">
                  <div className="eq-box"><span className="eq-label">Body 1</span><span className="eq-line"><Tex tex="f_1 = \dfrac{M_1 c^2}{h}" /></span><span className="eq-line"><Tex tex="T_1 = \dfrac{1}{f_1}" /></span></div>
                  <div className="eq-box"><span className="eq-label">Body 2</span><span className="eq-line"><Tex tex="f_2 = \dfrac{M_2 c^2}{h}" /></span><span className="eq-line"><Tex tex="T_2 = \dfrac{1}{f_2}" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">ψ₁(M₁,M₂)</span><Tex tex="\psi_1 = \sqrt{\dfrac{M_2}{M_1+M_2}} e^{-\beta\lambda_n} \left[\cos\left(\dfrac{2\pi\lambda_n}{\lambda_1} - \dfrac{2\pi M_2 \tau}{T_1}\right) + i \sin\left(\dfrac{2\pi\lambda_n}{\lambda_1} - \dfrac{2\pi M_2 \tau}{T_1}\right)\right]" /></div>
                  <div className="eq-box wide"><span className="eq-label">ψ₂(M₂,M₁)</span><Tex tex="\psi_2 = \sqrt{\dfrac{M_1}{M_1+M_2}} e^{-\beta(4\pi-\lambda_n)} \left[\cos\left(-\dfrac{2\pi\lambda_n}{\lambda_2} - \dfrac{2\pi M_1 \tau}{T_2}\right) + i \sin\left(-\dfrac{2\pi\lambda_n}{\lambda_2} - \dfrac{2\pi M_1 \tau}{T_2}\right)\right]" /></div>
                </div>
                <h4 className="eq-sub">Same, with current values</h4>
                {T ? (
                  <div className="eq-list">
                    <div className="eq-box wide"><span className="eq-label">M₁ = {fmt(M1)} · M₂ = {fmt(M2)}</span><Tex tex={`\\psi_1 = ${fmt(P.A1)} e^{-${fmt(P.beta, 3)}\\lambda_n} \\left[\\cos(${csciTex(T.k1)}\\lambda_n - ${sciTex(xTerm)}\\tau) + i \\sin(${csciTex(T.k1)}\\lambda_n - ${sciTex(xTerm)}\\tau)\\right]`} /></div>
                    <div className="eq-box wide"><span className="eq-label">L = 12.57</span><Tex tex={`\\psi_2 = ${fmt(P.A2)} e^{-${fmt(P.beta, 3)}(12.57-\\lambda_n)} \\left[\\cos(-${csciTex({ re: -T.k2.re, im: -T.k2.im })}\\lambda_n - ${sciTex(xTerm)}\\tau) + i \\sin(-${csciTex({ re: -T.k2.re, im: -T.k2.im })}\\lambda_n - ${sciTex(xTerm)}\\tau)\\right]`} /></div>
                  </div>
                ) : (
                  <p className="hint">Singular at zero mass: the full-theory λ and k substitutions are undefined when M₁ or M₂ is 0.</p>
                )}
              </div>

              <div className="eq-group">
                <h4>Ratios &amp; relationships <span className="eq-note">— paper</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Proportionality &amp; Symmetry</span><span className="eq-line"><Tex tex="\dfrac{\omega_2}{\omega_1} = \dfrac{M_2}{M_1}" /></span><span className="eq-line"><Tex tex="\dfrac{k_2}{k_1} = \dfrac{\lambda_1}{\lambda_2} = -i\sqrt{\dfrac{M_2}{M_1}}" /></span><span className="eq-line"><Tex tex="\dfrac{\lambda_2}{\lambda_1} = i\sqrt{\dfrac{M_1}{M_2}}" /></span><span className="eq-line"><Tex tex="M_1 \lambda_1^2 = -M_2 \lambda_2^2" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Display-unit consequences of the same structure</span><span className="eq-line"><Tex tex="\dfrac{A_1}{A_2} = \sqrt{\dfrac{M_2}{M_1}}" /></span><span className="eq-line"><Tex tex="A_1^2 + A_2^2 = 1" /></span><span className="eq-line"><Tex tex="k_1 k_2 = \omega_1 \omega_2" /></span><span className="eq-line"><Tex tex="k_1 A_1 = \omega_2 A_2" /></span></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>Definitions <span className="eq-note">— paper · β from the display derivation</span></h4>
                <div className="eq-list">
                  <div className="eq-box"><span className="eq-label">Wavenumbers</span><span className="eq-line"><Tex tex="k_1 = \dfrac{2\pi}{\lambda_1}" /></span><span className="eq-line"><Tex tex="k_2 = \dfrac{2\pi}{\lambda_2}" /></span></div>
                  <div className="eq-box"><span className="eq-label">Angular frequencies</span><span className="eq-line"><Tex tex="\omega_1 = 2\pi f_1 = \dfrac{2\pi M_1 c^2}{h}" /></span><span className="eq-line"><Tex tex="\omega_2 = 2\pi f_2 = \dfrac{2\pi M_2 c^2}{h}" /></span></div>
                  <div className="eq-box"><span className="eq-label">Frequency 1</span><Tex tex="f_1 = \dfrac{M_1 c^2}{h}" /></div>
                  <div className="eq-box"><span className="eq-label">Frequency 2</span><Tex tex="f_2 = \dfrac{M_2 c^2}{h}" /></div>
                  <div className="eq-box"><span className="eq-label">Period 1</span><Tex tex="T_1 = \dfrac{1}{f_1} = \dfrac{h}{M_1 c^2}" /></div>
                  <div className="eq-box"><span className="eq-label">Period 2</span><Tex tex="T_2 = \dfrac{1}{f_2} = \dfrac{h}{M_2 c^2}" /></div>
                  <div className="eq-box wide"><span className="eq-label">Structural wavelengths</span><span className="eq-line"><Tex tex="\lambda_1 = \left(\dfrac{2Gh^2}{M_1 c^4}\right)^{1/3} \left(i\sqrt{\dfrac{M_1}{M_2}} - 1\right)^{-1/3}" /></span><span className="eq-line"><Tex tex="\lambda_2 = i\sqrt{\dfrac{M_1}{M_2}} \left(\dfrac{2Gh^2}{M_1 c^4}\right)^{1/3} \left(i\sqrt{\dfrac{M_1}{M_2}} - 1\right)^{-1/3}" /></span></div>
                  <div className="eq-box"><span className="eq-label">Decay</span><Tex tex="\beta = \dfrac{|M_1 - M_2|}{M_1 + M_2}" /></div>
                  <div className="eq-box"><span className="eq-label">(λₙ span)</span><Tex tex="L = 4\pi" /></div>
                  <div className="eq-box"><span className="eq-label">Amplitudes</span><span className="eq-line"><Tex tex="A_1 = \sqrt{\dfrac{M_2}{M_1+M_2}}" /></span><span className="eq-line"><Tex tex="A_2 = \sqrt{\dfrac{M_1}{M_1+M_2}}" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Inertia Balance Point</span><span className="eq-line"><Tex tex="\lambda^* = L\dfrac{M_2}{M_1+M_2}" /></span><span className="eq-line"><Tex tex="M_1 \lambda^* = M_2 (L - \lambda^*)" /></span></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>The envelope <span className="eq-note">— plotted · display units</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Envelope bounds (decay without oscillation)</span><span className="eq-line"><Tex tex="E_1^{\pm} = \pm A_1 e^{-\beta\lambda_n}" /></span><span className="eq-line"><Tex tex="E_2^{\pm} = \pm A_2 e^{-\beta(L-\lambda_n)}" /></span></div>
                </div>
              </div>
              <div className="eq-group">
                <h4>Per-body push-pull <span className="eq-note">— plotted · display units</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Push-pull of M₁</span><span className="eq-line"><Tex tex="P_1(\lambda_n) = W_1(\lambda_n) - J_1(\lambda_n)" /></span><span className="eq-line"><Tex tex="W_1 = \int \mathrm{Re}(\psi_1) \, d\lambda_n, \quad J_1 = \int \mathrm{Im}(\psi_1) \, d\lambda_n" /></span><span className="eq-line"><Tex tex="\text{green (push): } P_1 > 0 \qquad \text{red (pull): } P_1 < 0" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Push-pull of M₂</span><span className="eq-line"><Tex tex="P_2(\lambda_n) = W_2(\lambda_n) - J_2(\lambda_n)" /></span><span className="eq-line"><Tex tex="W_2 = \int \mathrm{Re}(\psi_2) \, d\lambda_n, \quad J_2 = \int \mathrm{Im}(\psi_2) \, d\lambda_n" /></span><span className="eq-line"><Tex tex="\text{green (push): } P_2 > 0 \qquad \text{red (pull): } P_2 < 0" /></span></div>
                </div>
              </div>
            </>
          ) : subtab === 'deriv' ? (
            <>
              <div className="eq-group">
                <h4>General form <span className="eq-note">— plotted · display units</span></h4>
                <div className="eq-list">
                  <div className="eq-box"><span className="eq-label">M₁ · ψ₁</span><Tex tex="\dfrac{\partial\psi_1}{\partial M_1} = \dfrac{\partial}{\partial M_1}\left[A_1 e^{-\beta\lambda_n} e^{i(k_1\lambda_n - \omega_1 M_2 \tau)}\right]" /></div>
                  <div className="eq-box"><span className="eq-label">M₁ · ψ₂</span><Tex tex="\dfrac{\partial\psi_2}{\partial M_1} = \dfrac{\partial}{\partial M_1}\left[A_2 e^{-\beta(L-\lambda_n)} e^{i(-k_2\lambda_n - \omega_2 M_1 \tau)}\right]" /></div>
                  <div className="eq-box"><span className="eq-label">M₂ · ψ₁</span><Tex tex="\dfrac{\partial\psi_1}{\partial M_2} = \dfrac{\partial}{\partial M_2}\left[A_1 e^{-\beta\lambda_n} e^{i(k_1\lambda_n - \omega_1 M_2 \tau)}\right]" /></div>
                  <div className="eq-box"><span className="eq-label">M₂ · ψ₂</span><Tex tex="\dfrac{\partial\psi_2}{\partial M_2} = \dfrac{\partial}{\partial M_2}\left[A_2 e^{-\beta(L-\lambda_n)} e^{i(-k_2\lambda_n - \omega_2 M_1 \tau)}\right]" /></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>Simplified <span className="eq-note">— fixed-parameter phase gradients</span></h4>
                <div className="eq-list">
                  <div className="eq-box"><span className="eq-label">solid</span><Tex tex="\dfrac{\partial\psi_1}{\partial M_1} = ik_1\psi_1" /></div>
                  <div className="eq-box"><span className="eq-label">solid</span><Tex tex="\dfrac{\partial\psi_2}{\partial M_1} = -i\omega_2\psi_2" /></div>
                  <div className="eq-box"><span className="eq-label">dashed</span><Tex tex="\dfrac{\partial\psi_1}{\partial M_2} = -i\omega_1\psi_1" /></div>
                  <div className="eq-box"><span className="eq-label">dashed</span><Tex tex="\dfrac{\partial\psi_2}{\partial M_2} = ik_2\psi_2" /></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>With values substituted <span className="eq-note">— full theory · current M₁, M₂</span></h4>
                {T ? (
                  <div className="eq-list">
                    <div className="eq-box wide"><span className="eq-label">M₁ = {fmt(M1)} · M₂ = {fmt(M2)}</span><span className="eq-line"><Tex tex={`\\dfrac{\\partial\\psi_1}{\\partial M_1} = i[${csciTex(T.k1)}]\\psi_1`} /></span><span className="eq-line"><Tex tex={`\\dfrac{\\partial\\psi_2}{\\partial M_1} = -i[${sciTex(T.w2)}]\\psi_2`} /></span><span className="eq-line"><Tex tex={`\\dfrac{\\partial\\psi_1}{\\partial M_2} = -i[${sciTex(T.w1)}]\\psi_1`} /></span><span className="eq-line"><Tex tex={`\\dfrac{\\partial\\psi_2}{\\partial M_2} = i[${csciTex(T.k2)}]\\psi_2`} /></span></div>
                  </div>
                ) : (
                  <p className="hint">Singular at zero mass: the full-theory λ and k substitutions are undefined when M₁ or M₂ is 0.</p>
                )}
              </div>

              <div className="eq-group">
                <h4>Relations</h4>
                <div className="eq-list">
                  <div className="eq-box"><span className="eq-label">Coordinate conservation</span><span className="eq-line"><Tex tex="\dfrac{\partial\psi_1}{\partial M_1} + \dfrac{\partial\psi_2}{\partial M_1} = 0" /></span><span className="eq-line"><Tex tex="\dfrac{\partial\psi_1}{\partial M_2} + \dfrac{\partial\psi_2}{\partial M_2} = 0" /></span></div>
                  <div className="eq-box"><span className="eq-label">Cross-field balance</span><span className="eq-line"><Tex tex="k_1\psi_1 = \omega_2\psi_2" /></span><span className="eq-line"><Tex tex="k_2\psi_2 = \omega_1\psi_1" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Coordinate half-waves</span><span className="eq-line"><Tex tex="dM_1 = \dfrac{\partial\psi_1}{\partial M_1} + \dfrac{\partial\psi_2}{\partial M_1}" /></span><span className="eq-line"><Tex tex="dM_2 = \dfrac{\partial\psi_1}{\partial M_2} + \dfrac{\partial\psi_2}{\partial M_2}" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Total differential</span><Tex tex="d\psi_s = \dfrac{\partial\psi_1}{\partial M_1} + \dfrac{\partial\psi_2}{\partial M_1} + \dfrac{\partial\psi_1}{\partial M_2} + \dfrac{\partial\psi_2}{\partial M_2}" /></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>Variables <span className="eq-note">— defined in the gravity tab</span></h4>
                <div className="eq-list">
                  <div className="eq-box"><span className="eq-label">Wavenumbers</span><span className="eq-line"><Tex tex="k_1 = \dfrac{2\pi}{\lambda_1}" /></span><span className="eq-line"><Tex tex="k_2 = \dfrac{2\pi}{\lambda_2}" /></span></div>
                  <div className="eq-box"><span className="eq-label">Angular frequencies</span><span className="eq-line"><Tex tex="\omega_1 = \dfrac{2\pi M_1 c^2}{h}" /></span><span className="eq-line"><Tex tex="\omega_2 = \dfrac{2\pi M_2 c^2}{h}" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Structural wavelengths</span><span className="eq-line"><Tex tex="\lambda_1 = \left(\dfrac{2Gh^2}{M_1 c^4}\right)^{1/3} \left(i\sqrt{\dfrac{M_1}{M_2}} - 1\right)^{-1/3}" /></span><span className="eq-line"><Tex tex="\lambda_2 = i\sqrt{\dfrac{M_1}{M_2}} \left(\dfrac{2Gh^2}{M_1 c^4}\right)^{1/3} \left(i\sqrt{\dfrac{M_1}{M_2}} - 1\right)^{-1/3}" /></span></div>
                  <div className="eq-box"><span className="eq-label">Decay</span><Tex tex="\beta = \dfrac{|M_1 - M_2|}{M_1 + M_2}" /></div>
                  <div className="eq-box"><span className="eq-label">Amplitudes</span><span className="eq-line"><Tex tex="A_1 = \sqrt{\dfrac{M_2}{M_1+M_2}}" /></span><span className="eq-line"><Tex tex="A_2 = \sqrt{\dfrac{M_1}{M_1+M_2}}" /></span></div>
                </div>
              </div>
            </>
          ) : subtab === 'integ' ? (
            <>
              <div className="eq-group">
                <h4>Work and Impulse <span className="eq-note">— plotted</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Potential Work (spatial)</span><span className="eq-line"><Tex tex="W_1(x) = \int_0^x \mathrm{Re}[\psi_1(\lambda_n)] \, d\lambda_n" /></span><span className="eq-line"><Tex tex="W_2(x) = \int_0^x \mathrm{Re}[\psi_2(\lambda_n)] \, d\lambda_n" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Impulse Generated (temporal)</span><span className="eq-line"><Tex tex="J_1(x) = \int_0^x \mathrm{Im}[\psi_1(\lambda_n)] \, d\lambda_n" /></span><span className="eq-line"><Tex tex="J_2(x) = \int_0^x \mathrm{Im}[\psi_2(\lambda_n)] \, d\lambda_n" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Inertia Remaining</span><Tex tex="W_n - J_n = \text{inertia remaining at } x" /></div>
                  <div className="eq-box wide"><span className="eq-label">Shading</span><Tex tex="\text{Green: inertia stored. Red: inertia released.}" /></div>
                </div>
              </div>
            </>
          ) : subtab === 'motion' ? (
            <>
              <div className="eq-group">
                <h4>Push-Pull Density <span className="eq-note">— plotted · spatial + temporal</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Remaining inertia per body (spatial)</span><Tex tex="P_1(\lambda_n) = W_1(\lambda_n) - J_1(\lambda_n), \quad P_2(\lambda_n) = W_2(\lambda_n) - J_2(\lambda_n)" /></div>
                  <div className="eq-box wide"><span className="eq-label">Local push-pull (spatial)</span><Tex tex="D(\lambda_n) = P_1(\lambda_n) - P_2(\lambda_n)" /></div>
                  <div className="eq-box wide"><span className="eq-label">Remaining inertia per body (temporal)</span><Tex tex="P_n(t) = W_n(L, t) - J_n(L, t) = -F_n(t)" /></div>
                  <div className="eq-box wide"><span className="eq-label">Local push-pull (temporal)</span><Tex tex="T(t) = P_1(t) - P_2(t) = F_2(t) - F_1(t)" /></div>
                  <div className="eq-box wide"><span className="eq-label">Reading</span><Tex tex="\text{Where body 1's remaining inertia exceeds body 2's, and vice versa.}" /></div>
                </div>
              </div>
              <div className="eq-group">
                <h4>Wobble Over Time <span className="eq-note">— plotted · static snapshot, one cycle</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Net impulse at time t</span><Tex tex="F_n(t) = J_n(L, t) - W_n(L, t) = \int_0^L [\mathrm{Im}(\psi_n) - \mathrm{Re}(\psi_n)] \, d\lambda_n" /></div>
                  <div className="eq-box wide"><span className="eq-label">Body 1 wobble</span><Tex tex="X_1(t) = \int_0^t F_1(t') \, dt'" /></div>
                  <div className="eq-box wide"><span className="eq-label">Body 2 wobble</span><Tex tex="X_2(t) = \int_0^t F_2(t') \, dt'" /></div>
                  <div className="eq-box wide"><span className="eq-label">Reading</span><Tex tex="\text{Heavy mass wobbles less. Bodies move opposite: one up, the other down.}" /></div>
                </div>
              </div>
              <div className="eq-group">
                <h4>Apparent Wobble <span className="eq-note">— plotted · live</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Projection, xy plane</span><Tex tex="y_1(t) = X_1(t), \quad y_2(t) = X_2(t) \quad \text{(} x \text{ pinned at the } \lambda \text{ line)}" /></div>
                  <div className="eq-box wide"><span className="eq-label">Reading</span><Tex tex="\text{The } y \text{-component of the circular motion, before wrapping into circles.}" /></div>
                </div>
              </div>
              <div className="eq-group">
                <h4>In-Line Wobble <span className="eq-note">— plotted · live</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Same wobble, yz plane</span><Tex tex="y_1(t) = X_1(t), \quad y_2(t) = X_2(t) \quad \text{(looking down } x\text{)}" /></div>
                  <div className="eq-box wide"><span className="eq-label">Reading</span><Tex tex="\text{Bodies superimposed, moving opposite. Lighter crosses in front of heavier.}" /></div>
                </div>
              </div>
              <div className="eq-group">
                <h4>Orbit Diagrams <span className="eq-note">— plotted · live</span></h4>
                <div className="eq-list">
                  <div className="eq-box wide"><span className="eq-label">Orbital angle (one turn per wobble cycle)</span><Tex tex="\phi(t) = 2\pi t / T" /></div>
                  <div className="eq-box wide"><span className="eq-label">Center: the balance point</span><Tex tex="\lambda^*, \quad \lambda^* = L\frac{M_2}{M_1+M_2} \quad \text{— the center of mass}" /></div>
                  <div className="eq-box wide"><span className="eq-label">Apparent: the larger mass pinned</span><Tex tex="M_{\max} = \max(M_1, M_2)" /></div>
                  <div className="eq-box wide"><span className="eq-label">Apparent orbit (circular)</span><Tex tex="\mathbf{r}(\phi) = L(\cos\phi, \sin\phi) \quad \text{-- full separation}" /></div>
                  <div className="eq-box wide"><span className="eq-label">Elliptical orbit (M max at a focus)</span><Tex tex="r(\phi) = \dfrac{a(1-e^2)}{1+e\cos\phi}, \quad a = L, \quad b = a\sqrt{1-e^2}" /></div>
                  <div className="eq-box wide"><span className="eq-label">Eccentricity from the balance-point split</span><span className="eq-line"><Tex tex="e = \dfrac{|\lambda^*-(L-\lambda^*)|}{L} = \dfrac{|M_1-M_2|}{M_1+M_2}" /></span><span className="eq-line"><Tex tex="\text{equal masses } \to e = 0 \text{ (circle); one mass dominant } \to e \to 1" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Kepler's third law</span><Tex tex="T^2 \propto a^3" /></div>
                  <div className="eq-box wide"><span className="eq-label">Reading</span><Tex tex="\text{The period squared goes as the semi-major axis cubed: larger orbits take longer, steeply.}" /></div>
                  <div className="eq-box wide"><span className="eq-label">True: separation split at λ*</span><Tex tex="\mathbf{r}_1(\phi) = -\lambda^*(\cos\phi, \sin\phi), \quad \mathbf{r}_2(\phi) = +(L-\lambda^*)(\cos\phi, \sin\phi)" /></div>
                  <div className="eq-box wide"><span className="eq-label">Force direction</span><Tex tex="\text{along the line joining the masses (grey)}" /></div>
                </div>
              </div>
            </>
          ) : null}
        </div>
        </div>
      </div>
    </div>
  )
}

