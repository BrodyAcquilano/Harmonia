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
  ctx.fillText('λₙ', padL + pw, padT + ph + 30)
  return { X, Y }
}

function trace(ctx, X, Y, fn, color, width, dash) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.setLineDash(dash || [])
  ctx.beginPath()
  const N = 420
  for (let i = 0; i <= N; i++) {
    const x = (i / N) * X_MAX
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
    const xStar = (X_MAX * s.M1) / (s.M1 + s.M2)
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
    // Balance point: mass-weighted center x* = L·M₁/(M₁+M₂).
    // M₂·x* = M₁·(L−x*); equal masses → middle, M₂=3M₁ → L/4.
    // For integration tab, use the mirrored point (opposite side).
    const xStar = s.subtab === 'integ'
      ? X_MAX - (X_MAX * s.M1) / (s.M1 + s.M2)
      : (X_MAX * s.M1) / (s.M1 + s.M2)
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

// Integration tab: Potential to Do Work and Potential to Generate Impulse.
//   Pair 1: W₁ + J₁ (work and impulse of ψ₁)
//   Pair 2: W₂ + J₂ (work and impulse of ψ₂)
//   Work: Wₙ(x) = ∫₀ˣ Re(ψₙ(t)) dt (spatial, solid)
//   Impulse: Jₙ(x) = ∫₀ˣ Im(ψₙ(t)) dt (temporal, dashed)
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
  const arr1 = pair === 1 ? work1 : work2
  const arr2 = pair === 1 ? imp1 : imp2
  const lineColor = pair === 1 ? C1 : C2
  // For pair 1: W₁ solid blue, J₁ dashed blue. For pair 2: W₂ solid orange, J₂ dashed orange.
  const dash1 = []
  const dash2 = [6, 4]
  const sumArr = arr1.map((v, i) => v + arr2[i])
  const all = s.waveDisplay === 'sum' ? sumArr : [...arr1, ...arr2, ...sumArr]
  const yMax = Math.max(Math.abs(Math.min(...all)), Math.abs(Math.max(...all)) * 1.15, 0.1)
  const { X, Y } = drawGrid(ctx, g, yMax)
  const interp = (arr) => (x) => {
    const idx = Math.min(Math.floor((x / X_MAX) * N), N - 1)
    const t = ((x / X_MAX) * N) - idx
    return arr[idx] * (1 - t) + arr[idx + 1] * t
  }
  if (s.waveDisplay === 'waves' || s.waveDisplay === 'all') {
    // Shade area between the two lines: blue left of balance point, orange right
    const xStar = s.M1 + s.M2 > 0 ? X_MAX - (X_MAX * s.M1) / (s.M1 + s.M2) : X_MAX / 2
    ctx.save()
    ctx.globalAlpha = 0.15
    const n = 200
    // Left side (blue)
    ctx.fillStyle = C1
    ctx.beginPath()
    let first = true
    for (let i = 0; i <= n; i++) {
      const x = (i / n) * xStar
      const y1 = interp(arr1)(x)
      if (first) {
        ctx.moveTo(X(x), Y(y1))
        first = false
      } else {
        ctx.lineTo(X(x), Y(y1))
      }
    }
    for (let i = n; i >= 0; i--) {
      const x = (i / n) * xStar
      const y2 = interp(arr2)(x)
      ctx.lineTo(X(x), Y(y2))
    }
    ctx.closePath()
    ctx.fill()
    // Right side (orange)
    ctx.fillStyle = C2
    ctx.beginPath()
    first = true
    for (let i = 0; i <= n; i++) {
      const x = xStar + (i / n) * (X_MAX - xStar)
      const y1 = interp(arr1)(x)
      if (first) {
        ctx.moveTo(X(x), Y(y1))
        first = false
      } else {
        ctx.lineTo(X(x), Y(y1))
      }
    }
    for (let i = n; i >= 0; i--) {
      const x = xStar + (i / n) * (X_MAX - xStar)
      const y2 = interp(arr2)(x)
      ctx.lineTo(X(x), Y(y2))
    }
    ctx.closePath()
    ctx.fill()
    ctx.restore()
    trace(ctx, X, Y, interp(arr1), lineColor, 2, dash1)
    trace(ctx, X, Y, interp(arr2), lineColor, 2, dash2)
  }
  if (s.waveDisplay === 'sum' || s.waveDisplay === 'all') {
    trace(ctx, X, Y, interp(sumArr), CS, 2.75, [])
  }
  // Mirrored balance point for integrals: λ*_integ = L - λ*
  if (s.M1 + s.M2 > 0) {
    const xStar = X_MAX - (X_MAX * s.M1) / (s.M1 + s.M2)
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
  const [speedMode, setSpeedMode] = useState('slow') // 'slow': 0–slowMax, 'fast': 1–2.5
  const [slowMax, setSlowMax] = useState(1)

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
  const canvasHalfRef = useRef(null)
  const canvasTotalRef = useRef(null)
  const canvasAreaRef = useRef(null)
  const canvasCumRef = useRef(null)
  const canvasPair2Ref = useRef(null)
  const tauRef = useRef(0)
  const stateRef = useRef()
  stateRef.current = { subtab, M1, M2, playing, speed, showSum, waveDisplay }

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
      if (s.subtab === 'deriv') {
        const hc = canvasHalfRef.current
        if (hc) renderHalfFrame(hc.getContext('2d'), hc, s, tauRef.current)
        const tc = canvasTotalRef.current
        if (tc) renderTotalFrame(tc.getContext('2d'), tc, s, tauRef.current)
      }
      if (s.subtab === 'integ') {
        const ac = canvasAreaRef.current
        if (ac) renderAreaFrame(ac.getContext('2d'), ac, s, tauRef.current)
        const cc = canvasCumRef.current
        if (cc) renderPairFrame(cc.getContext('2d'), cc, s, tauRef.current, 1)
        const p2 = canvasPair2Ref.current
        if (p2) renderPairFrame(p2.getContext('2d'), p2, s, tauRef.current, 2)
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
      <div className="lab-side">
      <div className="lab-controls">
        <div className="control-group">
          <h3>View</h3>
          <div className="subtabs" role="tablist" aria-label="View">
            <button
              className="subtab"
              role="tab"
              aria-selected={subtab === 'gravity'}
              onClick={() => setSubtab('gravity')}
            >
              Gravity waves
            </button>
            <button
              className="subtab"
              role="tab"
              aria-selected={subtab === 'deriv'}
              onClick={() => setSubtab('deriv')}
            >
              Derivatives
            </button>
            <button
              className="subtab"
              role="tab"
              aria-selected={subtab === 'integ'}
              onClick={() => setSubtab('integ')}
            >
              Integration
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>M₁</h3>
          <NumberInput value={M1} min={0} max={100} onCommit={setM1} />
          <Slider value={M1} min={0} max={100} step={0.1}
            onChange={setM1} />
        </div>

        <div className="control-group">
          <h3>M₂</h3>
          <NumberInput value={M2} min={0} max={100} onCommit={setM2} />
          <Slider value={M2} min={0} max={100} step={0.1}
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
                <h2 className="graph-title">Energy Balance Point</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  {(waveDisplay === 'waves' || waveDisplay === 'all') && (
                    <>
                      <span><i className="swatch" style={{ background: C1 }} /><Tex tex="\int \psi_1 \, d\lambda_n" /></span>
                      <span><i className="swatch" style={{ background: C2 }} /><Tex tex="\int \psi_2 \, d\lambda_n" /></span>
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
                <h2 className="graph-title">Potential to Do Work₁ + Generate Impulse₁</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  {(waveDisplay === 'waves' || waveDisplay === 'all') && (
                    <>
                      <span><i className="swatch" style={{ background: C1 }} /><Tex tex="W_1 = \int \mathrm{Re}(\psi_1) \, d\lambda_n" /></span>
                      <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C1} 0 5px, transparent 5px 9px)` }} /><Tex tex="J_1 = \int \mathrm{Im}(\psi_1) \, d\lambda_n" /></span>
                    </>
                  )}
                  {(waveDisplay === 'sum' || waveDisplay === 'all') && <span><i className="swatch" style={{ background: CS }} /><Tex tex="W_1 + J_1" /></span>}
                  <span><i className="swatch swatch-dashed" /><Tex tex="\text{balance point } \lambda^*" /></span>
                </div>
                <label className="check-row graph-check">
                  Display
                  <select value={waveDisplay} onChange={(e) => setWaveDisplay(e.target.value)}>
                    <option value="waves">W₁, J₁</option>
                    <option value="sum">W₁ + J₁</option>
                    <option value="all">W₁, J₁, W₁ + J₁</option>
                  </select>
                </label>
              </div>
              <canvas ref={canvasCumRef} className="wave-canvas" />
            </div>
            <div className="graph-box">
              <div className="graph-title-row">
                <h2 className="graph-title">Potential to Do Work₂ + Generate Impulse₂</h2>
              </div>
              <div className="graph-meta-row">
                <div className="legend">
                  {(waveDisplay === 'waves' || waveDisplay === 'all') && (
                    <>
                      <span><i className="swatch" style={{ background: C2 }} /><Tex tex="W_2 = \int \mathrm{Re}(\psi_2) \, d\lambda_n" /></span>
                      <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C2} 0 5px, transparent 5px 9px)` }} /><Tex tex="J_2 = \int \mathrm{Im}(\psi_2) \, d\lambda_n" /></span>
                    </>
                  )}
                  {(waveDisplay === 'sum' || waveDisplay === 'all') && <span><i className="swatch" style={{ background: CS }} /><Tex tex="W_2 + J_2" /></span>}
                  <span><i className="swatch swatch-dashed" /><Tex tex="\text{balance point } \lambda^*" /></span>
                </div>
                <label className="check-row graph-check">
                  Display
                  <select value={waveDisplay} onChange={(e) => setWaveDisplay(e.target.value)}>
                    <option value="waves">W₂, J₂</option>
                    <option value="sum">W₂ + J₂</option>
                    <option value="all">W₂, J₂, W₂ + J₂</option>
                  </select>
                </label>
              </div>
              <canvas ref={canvasPair2Ref} className="wave-canvas" />
            </div>
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
                  <div className="eq-box wide"><span className="eq-label">Inertia Balance Point</span><span className="eq-line"><Tex tex="\lambda^* = L\dfrac{M_1}{M_1+M_2}" /></span><span className="eq-line"><Tex tex="M_2 \lambda^* = M_1 (L - \lambda^*)" /></span></div>
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
                  <div className="eq-box wide"><span className="eq-label">Potential to Do Work (spatial)</span><span className="eq-line"><Tex tex="W_1(x) = \int_0^x \mathrm{Re}[\psi_1(\lambda_n)] \, d\lambda_n" /></span><span className="eq-line"><Tex tex="W_2(x) = \int_0^x \mathrm{Re}[\psi_2(\lambda_n)] \, d\lambda_n" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Potential to Generate Impulse (temporal)</span><span className="eq-line"><Tex tex="J_1(x) = \int_0^x \mathrm{Im}[\psi_1(\lambda_n)] \, d\lambda_n" /></span><span className="eq-line"><Tex tex="J_2(x) = \int_0^x \mathrm{Im}[\psi_2(\lambda_n)] \, d\lambda_n" /></span></div>
                  <div className="eq-box wide"><span className="eq-label">Energy Balance Point</span><Tex tex="W_1(\lambda^*) = W_2(\lambda^*) \quad \text{where} \quad \lambda^* = L - L\dfrac{M_1}{M_1+M_2} = L\dfrac{M_2}{M_1+M_2}" /></div>
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
