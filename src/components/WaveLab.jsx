import { useEffect, useRef, useState } from 'react'
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

const X_MAX = 4 * Math.PI

const C1 = '#2563eb' // psi1 — blue
const C2 = '#ff8c42' // psi2 — orange
const CS = '#111827' // sum — dark, bold

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
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  const padL = 46
  const padR = 18
  const padT = 18
  const padB = 34
  return { w, h, padL, padR, padT, padB, pw: w - padL - padR, ph: h - padT - padB }
}

function drawGrid(ctx, g, yMax) {
  const { padL, padT, padB, pw, ph } = g
  const X = (x) => padL + (x / X_MAX) * pw
  const Y = (y) => padT + ph / 2 - (y / yMax) * (ph / 2)
  ctx.lineWidth = 1
  ctx.strokeStyle = '#dbe1ea'
  ctx.fillStyle = '#6b7a90'
  ctx.font = '11px system-ui, sans-serif'
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
  for (let gy = -Math.ceil(yMax); gy <= Math.ceil(yMax); gy++) {
    if (gy === 0 || Math.abs(gy) > yMax) continue
    ctx.beginPath()
    ctx.moveTo(padL, Y(gy))
    ctx.lineTo(padL + pw, Y(gy))
    ctx.stroke()
    ctx.fillText(String(gy), padL - 8, Y(gy) + 4)
  }
  ctx.strokeStyle = '#9fb0c3'
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
    curves = [
      { fn: (x) => psi1(x, tau, P, s.M2).re, color: C1, width: 1.75 },
      { fn: (x) => psi2(x, tau, P, s.M1).re, color: C2, width: 1.75 },
    ]
    if (s.showSum) {
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
      { fn: grad(1, 'd2'), color: C2, width: 1.75, dash: [] },
      { fn: grad(2, 'd1'), color: C1, width: 1.75, dash: [6, 4] },
      { fn: grad(2, 'd2'), color: C2, width: 1.75, dash: [6, 4] },
    ]
  }
  const { X, Y } = drawGrid(ctx, g, yMax)
  curves.forEach((c) => trace(ctx, X, Y, c.fn, c.color, c.width, c.dash))
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

const fmt = (v, d = 2) => v.toFixed(d)
const sci = (v) => v.toExponential(2)
// Speed readout: scientific notation once it gets small.
const fmtSpeed = (v) => (v > 0 && v < 0.1 ? v.toExponential(1) : v.toFixed(2))
// Fastest on-screen oscillation (display units): k2 = w2 = sqrt(M2/M1), k1 = w1 = 1.
// The slow range is scaled so the fastest wave keeps the same apparent motion.
const displayFreq = (M1, M2) => Math.max(1, Math.sqrt(M2 / Math.max(M1, 0.1)))

const supExp = (e) => <sup>{String(e).replace('-', '−')}</sup>

// Real value in a×10^b form: 1.28×10⁻³⁷
function Sci({ v }) {
  const [m, e] = v.toExponential(2).split('e')
  return (
    <span>
      {m}×10{supExp(parseInt(e, 10))}
    </span>
  )
}

// Complex value in factored form: (3.66+3.27i)×10³⁷
function CSci({ z }) {
  const mag = Math.max(Math.abs(z.re), Math.abs(z.im))
  if (!(mag > 0)) return <span>0</span>
  const e = Math.floor(Math.log10(mag))
  const f = 10 ** e
  const re = z.re / f
  const im = z.im / f
  return (
    <span>
      ({re.toFixed(2)}{im < 0 ? '−' : '+'}
      {Math.abs(im).toFixed(2)}i)×10{supExp(e)}
    </span>
  )
}

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
  const [speedMode, setSpeedMode] = useState('slow') // 'slow': 0–slowMax, 'fast': 1–2.5
  const [slowMax, setSlowMax] = useState(1)

  // Rescale the slow-down range from the current masses; park speed at the top.
  const recalcSlow = (a, b) => {
    const m = 1 / displayFreq(a, b)
    setSlowMax(m)
    setSpeed(m)
  }

  const canvasRef = useRef(null)
  const canvasTotalRef = useRef(null)
  const tauRef = useRef(0)
  const stateRef = useRef()
  stateRef.current = { subtab, M1, M2, playing, speed, showSum }

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let last = performance.now()
    const draw = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const s = stateRef.current
      if (s.playing) {
        tauRef.current += dt * s.speed
        setTau(Math.round(tauRef.current * 20) / 20)
      }
      renderFrame(ctx, canvas, s, tauRef.current)
      if (s.subtab === 'derivatives' && s.showSum) {
        const tc = canvasTotalRef.current
        if (tc) renderTotalFrame(tc.getContext('2d'), tc, s, tauRef.current)
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
          <div className="btn-row">
            <button
              className={subtab === 'gravity' ? 'active' : ''}
              onClick={() => setSubtab('gravity')}
            >
              Gravity waves
            </button>
            <button
              className={subtab === 'deriv' ? 'active' : ''}
              onClick={() => setSubtab('deriv')}
            >
              Derivatives
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>ψ₁ — mass M₁</h3>
          <NumberInput value={M1} min={0} max={100} onCommit={setM1} />
          <Slider label="M₁" value={M1} min={0} max={100} step={0.1}
            onChange={setM1} />
        </div>

        <div className="control-group">
          <h3>ψ₂ — mass M₂</h3>
          <NumberInput value={M2} min={0} max={100} onCommit={setM2} />
          <Slider label="M₂" value={M2} min={0} max={100} step={0.1}
            onChange={setM2} />
        </div>

        <div className="control-group">
          <h3>Derived from M₁, M₂</h3>
          <dl className="readout">
            <div><dt>k₁</dt><dd>{fmt(P.k1)}</dd><dt>k₂</dt><dd>{fmt(P.k2)}</dd></div>
            <div><dt>ω₁</dt><dd>{fmt(P.w1)}</dd><dt>ω₂</dt><dd>{fmt(P.w2)}</dd></div>
            <div><dt>A₁</dt><dd>{fmt(P.A1)}</dd><dt>A₂</dt><dd>{fmt(P.A2)}</dd></div>
            <div><dt>A₁²</dt><dd>{fmt(P.A1 * P.A1)}</dd><dt>A₂²</dt><dd>{fmt(P.A2 * P.A2)}</dd></div>
            <div><dt>β</dt><dd>{fmt(P.beta, 3)}</dd><dt>ΣA²</dt><dd>{fmt(P.A1 * P.A1 + P.A2 * P.A2)}</dd></div>
            <div><dt>|λ₁|</dt><dd>{lam ? `${sci(cAbs(lam.l1))} m` : '—'}</dd><dt>|λ₂|</dt><dd>{lam ? `${sci(cAbs(lam.l2))} m` : '—'}</dd></div>
          </dl>
        </div>
        <div className="transport">
          <h3 className="transport-title">Animation</h3>
          <button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
          <button
            onClick={() => {
              tauRef.current = 0
              setTau(0)
            }}
          >
            Reset
          </button>
          <span className="time-readout">τ = {tau.toFixed(2)}</span>
          <label className="check-row transport-check">
            <input
              type="checkbox"
              checked={showSum}
              onChange={(e) => setShowSum(e.target.checked)}
            />
            {subtab === 'gravity' ? (
              <>standing wave ψ<sub>s</sub></>
            ) : (
              <>total dψ<sub>s</sub></>
            )}
          </label>
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
          {speedMode === 'slow' ? (
            <div className="speed-col">
              <Slider label="speed" value={Math.sqrt(Math.min(speed, slowMax) / slowMax)} min={0} max={1} step={0.005}
                format={() => fmtSpeed(speed)}
                onChange={(p) => setSpeed(slowMax * p * p)} />
              <button className="recalc-btn" onClick={() => recalcSlow(M1, M2)}>
                Recalculate slider range
              </button>
            </div>
          ) : (
            <Slider label="speed" value={Math.min(Math.max(speed, 1), 2.5)} min={1} max={2.5} step={0.1}
              format={() => fmtSpeed(speed)}
              onChange={setSpeed} />
          )}
        </div>
        </div>
      </div>

      <div className="lab-stage">
        <div className="graph-box">
        <div className="legend">
          {subtab === 'gravity' ? (
            <>
              <span><i className="swatch" style={{ background: C1 }} />ψ₁(M₁,M₂) → +λₙ</span>
              <span><i className="swatch" style={{ background: C2 }} />ψ₂(M₂,M₁) → −λₙ</span>
              {showSum && <span><i className="swatch" style={{ background: CS }} />ψ<sub>s</sub> = ψ₁ + ψ₂</span>}
            </>
          ) : (
            <>
              <span><i className="swatch" style={{ background: C1 }} />∂ψ₁/∂M₁ = ik₁ψ₁</span>
              <span><i className="swatch" style={{ background: C2 }} />∂ψ₂/∂M₁ = −iω₂ψ₂</span>
              <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C1} 0 5px, transparent 5px 9px)` }} />∂ψ₁/∂M₂ = −iω₁ψ₁</span>
              <span><i className="swatch" style={{ background: `repeating-linear-gradient(90deg, ${C2} 0 5px, transparent 5px 9px)` }} />∂ψ₂/∂M₂ = ik₂ψ₂</span>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="wave-canvas" />

        {subtab === 'derivatives' && showSum && (
          <>
            <div className="legend total-legend">
              <span><i className="swatch" style={{ background: CS }} />total dψ<sub>s</sub></span>
            </div>
            <canvas ref={canvasTotalRef} className="wave-canvas total-canvas" />
          </>
        )}
        </div>

        <div className="eq-panel">
        <div className="eq-groups">
          {subtab === 'gravity' ? (
            <>
              <div className="eq-group">
                <h4>Trigonometric form <span className="eq-tag">plotted · display units</span></h4>
                <div className="eq-list">
                  <div className="eq-box">ψ₁ = A₁e<sup>−βλₙ</sup>cos(k₁λₙ−ω₁M₂τ) + i·A₁e<sup>−βλₙ</sup>sin(k₁λₙ−ω₁M₂τ)</div>
                  <div className="eq-box">ψ₂ = A₂e<sup>−β(L−λₙ)</sup>cos(−k₂λₙ−ω₂M₁τ) + i·A₂e<sup>−β(L−λₙ)</sup>sin(−k₂λₙ−ω₂M₁τ)</div>
                  <div className="eq-box">ψ<sub>s</sub> = ψ₁ + ψ₂</div>
                </div>
              </div>

              <div className="eq-group">
                <h4>With k, ω, λ substituted <span className="eq-tag">full theory</span></h4>
                <div className="eq-list">
                  <div className="eq-box">ψ₁ = √(M₂/(M₁+M₂))·e<sup>−βλₙ</sup>·[cos(2πλₙ/λ₁ − 2πM₁M₂c²τ/h) + i·sin(2πλₙ/λ₁ − 2πM₁M₂c²τ/h)]</div>
                  <div className="eq-box">ψ₂ = √(M₁/(M₁+M₂))·e<sup>−β(L−λₙ)</sup>·[cos(−2πλₙ/λ₂ − 2πM₁M₂c²τ/h) + i·sin(−2πλₙ/λ₂ − 2πM₁M₂c²τ/h)]</div>
                </div>
                <h4 className="eq-sub">With f, T substituted <span className="eq-tag">full theory</span></h4>
                <div className="eq-list">
                  <div className="eq-box">f₁ = M₁c²/h, T₁ = 1/f₁</div>
                  <div className="eq-box">f₂ = M₂c²/h, T₂ = 1/f₂</div>
                </div>
                <div className="eq-list">
                  <div className="eq-box">ψ₁ = √(M₂/(M₁+M₂))·e<sup>−βλₙ</sup>·[cos(2πλₙ/λ₁ − 2πM₂τ/T₁) + i·sin(2πλₙ/λ₁ − 2πM₂τ/T₁)]</div>
                  <div className="eq-box">ψ₂ = √(M₁/(M₁+M₂))·e<sup>−β(4π−λₙ)</sup>·[cos(−2πλₙ/λ₂ − 2πM₁τ/T₂) + i·sin(−2πλₙ/λ₂ − 2πM₁τ/T₂)]</div>
                </div>
                <h4 className="eq-sub">Same, with current values <span className="eq-tag">M₁ = {fmt(M1)}, M₂ = {fmt(M2)}</span></h4>
                {T ? (
                  <div className="eq-list">
                    <div className="eq-box">ψ₁ = {fmt(P.A1)}·e<sup>−{fmt(P.beta, 3)}λₙ</sup>·[cos(<CSci z={T.k1} />·λₙ − <Sci v={xTerm} />·τ) + i·sin(<CSci z={T.k1} />·λₙ − <Sci v={xTerm} />·τ)]</div>
                    <div className="eq-box">ψ₂ = {fmt(P.A2)}·e<sup>−{fmt(P.beta, 3)}({X_MAX.toFixed(2)}−λₙ)</sup>·[cos(<CSci z={{ re: -T.k2.re, im: -T.k2.im }} />·λₙ − <Sci v={xTerm} />·τ) + i·sin(<CSci z={{ re: -T.k2.re, im: -T.k2.im }} />·λₙ − <Sci v={xTerm} />·τ)]</div>
                  </div>
                ) : (
                  <p className="hint">λ and k are singular at zero mass — no finite theory values here.</p>
                )}
              </div>

              <div className="eq-group">
                <h4>Ratios &amp; relationships <span className="eq-tag">paper</span></h4>
                <div className="eq-list">
                  <div className="eq-box">ω₂/ω₁ = M₂/M₁</div>
                  <div className="eq-box">k₂/k₁ = λ₁/λ₂ = −i√(M₂/M₁)</div>
                  <div className="eq-box">λ₂/λ₁ = i√(M₁/M₂)</div>
                  <div className="eq-box">M₁λ₁² = −M₂λ₂²</div>
                </div>
                <p className="hint">Display-unit consequences of the same structure:</p>
                <div className="eq-list">
                  <div className="eq-box">A₁/A₂ = √(M₂/M₁)</div>
                  <div className="eq-box">A₁² + A₂² = 1</div>
                  <div className="eq-box">k₁k₂ = ω₁ω₂</div>
                  <div className="eq-box">k₁A₁ = ω₂A₂</div>
                </div>
              </div>

              <div className="eq-group">
                <h4>Definitions <span className="eq-tag">paper · β from the display derivation</span></h4>
                <div className="eq-list">
                  <div className="eq-box">k₁ = 2π/λ₁</div>
                  <div className="eq-box">k₂ = 2π/λ₂</div>
                  <div className="eq-box">ω₁ = 2πf₁ = 2πM₁c²/h</div>
                  <div className="eq-box">ω₂ = 2πf₂ = 2πM₂c²/h</div>
                  <div className="eq-box">f₁ = M₁c²/h</div>
                  <div className="eq-box">f₂ = M₂c²/h</div>
                  <div className="eq-box">T₁ = 1/f₁ = h/(M₁c²)</div>
                  <div className="eq-box">T₂ = 1/f₂ = h/(M₂c²)</div>
                  <div className="eq-box wide">λ₁ = (2Gh²/M₁c⁴)<sup>1/3</sup>·(i√(M₁/M₂) − 1)<sup>−1/3</sup></div>
                  <div className="eq-box wide">λ₂ = i√(M₁/M₂)·λ₁</div>
                  <div className="eq-box">β = |M₁−M₂|/(M₁+M₂)</div>
                  <div className="eq-box">L = 4π <em>(λₙ span)</em></div>
                  <div className="eq-box">A₁ = √(M₂/(M₁+M₂))</div>
                  <div className="eq-box">A₂ = √(M₁/(M₁+M₂))</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="eq-group">
                <h4>General form <span className="eq-tag">plotted · display units</span></h4>
                <div className="eq-list">
                  <div className="eq-box">∂ψ₁/∂M₁ = ∂/∂M₁[A₁e<sup>−βλₙ</sup>e<sup>i(k₁λₙ−ω₁M₂τ)</sup>]</div>
                  <div className="eq-box">∂ψ₂/∂M₁ = ∂/∂M₁[A₂e<sup>−β(L−λₙ)</sup>e<sup>i(−k₂λₙ−ω₂M₁τ)</sup>]</div>
                  <div className="eq-box">∂ψ₁/∂M₂ = ∂/∂M₂[A₁e<sup>−βλₙ</sup>e<sup>i(k₁λₙ−ω₁M₂τ)</sup>]</div>
                  <div className="eq-box">∂ψ₂/∂M₂ = ∂/∂M₂[A₂e<sup>−β(L−λₙ)</sup>e<sup>i(−k₂λₙ−ω₂M₁τ)</sup>]</div>
                </div>
              </div>

              <div className="eq-group">
                <h4>Simplified <span className="eq-tag">fixed-parameter phase gradients</span></h4>
                <div className="eq-list">
                  <div className="eq-box">∂ψ₁/∂M₁ = ik₁ψ₁ <em>(solid)</em></div>
                  <div className="eq-box">∂ψ₂/∂M₁ = −iω₂ψ₂ <em>(solid)</em></div>
                  <div className="eq-box">∂ψ₁/∂M₂ = −iω₁ψ₁ <em>(dashed)</em></div>
                  <div className="eq-box">∂ψ₂/∂M₂ = ik₂ψ₂ <em>(dashed)</em></div>
                </div>
              </div>

              <div className="eq-group">
                <h4>With values substituted <span className="eq-tag">full theory · current M₁, M₂</span></h4>
                {T ? (
                  <div className="eq-list">
                    <div className="eq-box">∂ψ₁/∂M₁ = i·<CSci z={T.k1} />·ψ₁</div>
                    <div className="eq-box">∂ψ₂/∂M₁ = −i·<Sci v={T.w2} />·ψ₂</div>
                    <div className="eq-box">∂ψ₁/∂M₂ = −i·<Sci v={T.w1} />·ψ₁</div>
                    <div className="eq-box">∂ψ₂/∂M₂ = i·<CSci z={T.k2} />·ψ₂</div>
                  </div>
                ) : (
                  <p className="hint">k, ω are singular at zero mass — no finite theory values here.</p>
                )}
              </div>

              <div className="eq-group">
                <h4>Relations</h4>
                <div className="eq-list">
                  <div className="eq-box">∂ψ₁/∂M₁ + ∂ψ₂/∂M₁ = 0</div>
                  <div className="eq-box">∂ψ₁/∂M₂ + ∂ψ₂/∂M₂ = 0</div>
                  <div className="eq-box">k₁ψ₁ = ω₂ψ₂</div>
                  <div className="eq-box">k₂ψ₂ = ω₁ψ₁</div>
                  <div className="eq-box">dψ<sub>s</sub> = ∂ψ₁/∂M₁ + ∂ψ₂/∂M₁ + ∂ψ₁/∂M₂ + ∂ψ₂/∂M₂</div>
                </div>
              </div>

              <div className="eq-group">
                <h4>Variables <span className="eq-tag">defined in the gravity tab</span></h4>
                <div className="eq-list">
                  <div className="eq-box">k₁ = 2π/λ₁</div>
                  <div className="eq-box">k₂ = 2π/λ₂</div>
                  <div className="eq-box">ω₁ = 2πM₁c²/h</div>
                  <div className="eq-box">ω₂ = 2πM₂c²/h</div>
                  <div className="eq-box wide">λ₁ = (2Gh²/M₁c⁴)<sup>1/3</sup>·(i√(M₁/M₂) − 1)<sup>−1/3</sup></div>
                  <div className="eq-box wide">λ₂ = i√(M₁/M₂)·λ₁</div>
                  <div className="eq-box">β = |M₁−M₂|/(M₁+M₂)</div>
                  <div className="eq-box">A₁ = √(M₂/(M₁+M₂))</div>
                  <div className="eq-box">A₂ = √(M₁/(M₁+M₂))</div>
                </div>
              </div>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}
