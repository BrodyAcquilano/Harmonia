import { useEffect, useRef, useState } from 'react'
import Slider from './Slider.jsx'
import { gravityParams, psi1, psi2, psiSum, dPsi_dM } from '../waves/models.js'

const X_MAX = 4 * Math.PI

const C1 = '#4da3ff' // psi1 — blue
const C2 = '#ff8c42' // psi2 — orange
const CS = '#f2f6ff' // sum — white, bold

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
  ctx.fillStyle = '#0d1117'
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
  ctx.strokeStyle = '#1a2230'
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
  ctx.strokeStyle = '#39465c'
  ctx.beginPath()
  ctx.moveTo(padL, Y(0))
  ctx.lineTo(padL + pw, Y(0))
  ctx.stroke()
  return { X, Y }
}

function trace(ctx, X, Y, fn, color, width) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
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
      {
        fn: (x) => psiSum(psi1(x, tau, P, s.M2), psi2(x, tau, P, s.M1)).re,
        color: CS,
        width: 2.75,
      },
    ]
  } else {
    const m1 = s.derivVar === 1 ? P.k1 * P.A1 : P.w1 * P.A1
    const m2 = s.derivVar === 1 ? P.w2 * P.A2 : P.k2 * P.A2
    yMax = Math.max((m1 + m2) * 1.15, 0.2)
    curves = [
      { fn: (x) => dPsi_dM(s.derivVar, x, tau, P, s.M1, s.M2).d1.re, color: C1, width: 1.75 },
      { fn: (x) => dPsi_dM(s.derivVar, x, tau, P, s.M1, s.M2).d2.re, color: C2, width: 1.75 },
      { fn: (x) => dPsi_dM(s.derivVar, x, tau, P, s.M1, s.M2).sum.re, color: CS, width: 2.75 },
    ]
  }
  const { X, Y } = drawGrid(ctx, g, yMax)
  curves.forEach((c) => trace(ctx, X, Y, c.fn, c.color, c.width))
}

const fmt = (v, d = 2) => v.toFixed(d)

export default function WaveLab() {
  const [subtab, setSubtab] = useState('gravity')
  const [M1, setM1] = useState(2)
  const [M2, setM2] = useState(1)
  const [derivVar, setDerivVar] = useState(1)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [tau, setTau] = useState(0)

  const canvasRef = useRef(null)
  const tauRef = useRef(0)
  const stateRef = useRef()
  stateRef.current = { subtab, M1, M2, derivVar, playing, speed }

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
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const P = gravityParams(M1, M2)

  return (
    <div className="lab-layout">
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
          <Slider label="M₁" value={M1} min={0.2} max={5} step={0.05}
            onChange={setM1} />
        </div>

        <div className="control-group">
          <h3>ψ₂ — mass M₂</h3>
          <Slider label="M₂" value={M2} min={0.2} max={5} step={0.05}
            onChange={setM2} />
        </div>

        {subtab === 'deriv' && (
          <div className="control-group">
            <h3>Differentiate by</h3>
            <div className="btn-row">
              <button
                className={derivVar === 1 ? 'active' : ''}
                onClick={() => setDerivVar(1)}
              >
                d/dM₁
              </button>
              <button
                className={derivVar === 2 ? 'active' : ''}
                onClick={() => setDerivVar(2)}
              >
                d/dM₂
              </button>
            </div>
          </div>
        )}

        <div className="control-group">
          <h3>Derived from M₁, M₂</h3>
          <dl className="readout">
            <div><dt>k₁</dt><dd>{fmt(P.k1)}</dd><dt>k₂</dt><dd>{fmt(P.k2)}</dd></div>
            <div><dt>ω₁</dt><dd>{fmt(P.w1)}</dd><dt>ω₂</dt><dd>{fmt(P.w2)}</dd></div>
            <div><dt>A₁</dt><dd>{fmt(P.A1)}</dd><dt>A₂</dt><dd>{fmt(P.A2)}</dd></div>
            <div><dt>A₁²</dt><dd>{fmt(P.A1 * P.A1)}</dd><dt>A₂²</dt><dd>{fmt(P.A2 * P.A2)}</dd></div>
            <div><dt>β</dt><dd>{fmt(P.beta, 3)}</dd><dt>ΣA²</dt><dd>{fmt(P.A1 * P.A1 + P.A2 * P.A2)}</dd></div>
          </dl>
          <p className="hint">
            k₂ = √(M₂/M₁); k₁k₂ = ω₁ω₂; k₁A₁ = ω₂A₂; β = |M₁−M₂|/(M₁+M₂).
          </p>
        </div>
      </div>

      <div className="lab-stage">
        <div className="legend">
          {subtab === 'gravity' ? (
            <>
              <span><i className="swatch" style={{ background: C1 }} />ψ₁(M₁,M₂) → +x</span>
              <span><i className="swatch" style={{ background: C2 }} />ψ₂(M₂,M₁) → −x</span>
              <span><i className="swatch" style={{ background: CS }} />ψ<sub>s</sub> = ψ₁ + ψ₂</span>
            </>
          ) : (
            <>
              <span><i className="swatch" style={{ background: C1 }} />
                {derivVar === 1 ? '∂ψ₁/∂M₁ = ik₁ψ₁' : '∂ψ₁/∂M₂ = −iω₁ψ₁'}</span>
              <span><i className="swatch" style={{ background: C2 }} />
                {derivVar === 1 ? '∂ψ₂/∂M₁ = −iω₂ψ₂' : '∂ψ₂/∂M₂ = ik₂ψ₂'}</span>
              <span><i className="swatch" style={{ background: CS }} />sum = 0 (conservation)</span>
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="wave-canvas" />

        <div className="eq-list">
          {subtab === 'gravity' ? (
            <>
              <div className="eq-box">ψ₁(M₁,M₂) = A₁·e<sup>−βx</sup>·e<sup>i(k₁x − ω₁M₂τ)</sup></div>
              <div className="eq-box">ψ₂(M₂,M₁) = A₂·e<sup>−β(L−x)</sup>·e<sup>i(−k₂x − ω₂M₁τ)</sup></div>
              <div className="eq-box">ψ<sub>s</sub> = ψ₁ + ψ₂</div>
            </>
          ) : derivVar === 1 ? (
            <>
              <div className="eq-box">∂ψ₁/∂M₁ = ik₁ψ₁</div>
              <div className="eq-box">∂ψ₂/∂M₁ = −iω₂ψ₂</div>
              <div className="eq-box">∂ψ₁/∂M₁ + ∂ψ₂/∂M₁ = 0</div>
            </>
          ) : (
            <>
              <div className="eq-box">∂ψ₁/∂M₂ = −iω₁ψ₁</div>
              <div className="eq-box">∂ψ₂/∂M₂ = ik₂ψ₂</div>
              <div className="eq-box">∂ψ₁/∂M₂ + ∂ψ₂/∂M₂ = 0</div>
            </>
          )}
        </div>

        <div className="transport">
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
          <Slider label="speed" value={speed} min={0.1} max={2.5} step={0.1}
            onChange={setSpeed} />
        </div>

        <p className="hint">
          Real (spatial-inertia) parts shown. Each wave decays exponentially with
          distance travelled from its source mass, at rate β set by the mass
          asymmetry. Display uses scaled units that preserve the theory's
          structural ratios; x is the spatial axis and τ advances the temporal
          phase in place of the companion-mass coordinate.
        </p>
      </div>
    </div>
  )
}
