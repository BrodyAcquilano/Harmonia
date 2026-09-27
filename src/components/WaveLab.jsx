import { useEffect, useRef, useState } from 'react'
import Slider from './Slider.jsx'
import { twoWaves, decayingWave, harmonics } from '../waves/models.js'

const X_MAX = 10

const EQUATIONS = {
  two: 'y = A₁·sin(kx − ωt + φ₁) + A₂·sin(kx + ωt + φ₂)',
  decay: 'y = A·e^(−βx)·sin(kx − ωt)',
  harmonics: 'y = Σ(m=1..N) (A/m)·sin(mπx/L)·cos(mω₀t),   ω₀ = π/L',
}

function renderFrame(ctx, canvas, s, t) {
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
  const pw = w - padL - padR
  const ph = h - padT - padB

  let yMax = 0.5
  if (s.model === 'two') {
    yMax = (Math.abs(s.twoParams.a1) + Math.abs(s.twoParams.a2)) * 1.15
  } else if (s.model === 'decay') {
    yMax = Math.abs(s.decayParams.a) * 1.15
  } else {
    yMax = Math.abs(s.harmParams.a) * 1.8
  }
  yMax = Math.max(yMax, 0.5)

  const X = (x) => padL + (x / X_MAX) * pw
  const Y = (y) => padT + ph / 2 - (y / yMax) * (ph / 2)

  // grid
  ctx.lineWidth = 1
  ctx.strokeStyle = '#1a2230'
  ctx.fillStyle = '#6b7a90'
  ctx.font = '11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  for (let gx = 0; gx <= X_MAX; gx += 2) {
    ctx.beginPath()
    ctx.moveTo(X(gx), padT)
    ctx.lineTo(X(gx), padT + ph)
    ctx.stroke()
    ctx.fillText(String(gx), X(gx), padT + ph + 16)
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

  // axes
  ctx.strokeStyle = '#39465c'
  ctx.beginPath()
  ctx.moveTo(padL, Y(0))
  ctx.lineTo(padL + pw, Y(0))
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(X(0), padT)
  ctx.lineTo(X(0), padT + ph)
  ctx.stroke()

  const trace = (fn, color, width, dash) => {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.setLineDash(dash || [])
    ctx.beginPath()
    const N = 360
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

  if (s.model === 'two') {
    const p = s.twoParams
    trace((x) => twoWaves(x, t, p).y1, 'rgba(110,168,254,0.45)', 1.5)
    trace((x) => twoWaves(x, t, p).y2, 'rgba(220,120,200,0.45)', 1.5)
    trace((x) => twoWaves(x, t, p).sum, '#f0f6ff', 2.5)
  } else if (s.model === 'decay') {
    const p = s.decayParams
    trace((x) => p.a * Math.exp(-p.beta * x), 'rgba(139,152,171,0.5)', 1.25, [6, 5])
    trace((x) => -p.a * Math.exp(-p.beta * x), 'rgba(139,152,171,0.5)', 1.25, [6, 5])
    trace((x) => decayingWave(x, t, p).y, '#f0f6ff', 2.5)
  } else {
    const p = s.harmParams
    for (let m = 0; m < p.n; m++) {
      const idx = m
      trace((x) => harmonics(x, t, p).components[idx], 'rgba(110,168,254,0.35)', 1.25)
    }
    trace((x) => harmonics(x, t, p).sum, '#f0f6ff', 2.5)
  }
}

export default function WaveLab() {
  const [model, setModel] = useState('two')
  const [mode, setMode] = useState('mass') // 'mass' | 'charge'
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(0)

  const [twoParams, setTwoParams] = useState({ a1: 1, a2: 0.6, k: 1.5, omega: 1.5, p1: 0, p2: 0 })
  const [decayParams, setDecayParams] = useState({ a: 1.5, k: 2, omega: 2, beta: 0.25 })
  const [harmParams, setHarmParams] = useState({ n: 3, a: 1.5, L: 10 })

  const canvasRef = useRef(null)
  const tRef = useRef(0)
  const stateRef = useRef()
  stateRef.current = { model, mode, twoParams, decayParams, harmParams, playing }

  const ampMin = mode === 'mass' ? 0 : -2

  function switchMode(next) {
    setMode(next)
    if (next === 'mass') {
      // Masses are positive: clamp any negative amplitudes back to zero.
      setTwoParams((p) => ({ ...p, a1: Math.max(0, p.a1), a2: Math.max(0, p.a2) }))
      setDecayParams((p) => ({ ...p, a: Math.max(0, p.a) }))
      setHarmParams((p) => ({ ...p, a: Math.max(0, p.a) }))
    }
  }

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
        tRef.current += dt
        setTime(Math.round(tRef.current * 20) / 20)
      }
      renderFrame(ctx, canvas, s, tRef.current)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const int = (v) => v.toFixed(0)

  return (
    <div className="lab-layout">
      <div className="lab-controls">
        <div className="control-group">
          <h3>Model</h3>
          <div className="btn-row">
            <button className={model === 'two' ? 'active' : ''} onClick={() => setModel('two')}>
              Two waves
            </button>
            <button className={model === 'decay' ? 'active' : ''} onClick={() => setModel('decay')}>
              Exponential decay
            </button>
            <button
              className={model === 'harmonics' ? 'active' : ''}
              onClick={() => setModel('harmonics')}
            >
              Harmonics
            </button>
          </div>
        </div>

        <div className="control-group">
          <h3>Source</h3>
          <div className="btn-row">
            <button className={mode === 'mass' ? 'active' : ''} onClick={() => switchMode('mass')}>
              Mass (+ only)
            </button>
            <button className={mode === 'charge' ? 'active' : ''} onClick={() => switchMode('charge')}>
              Charge (±)
            </button>
          </div>
          <p className="hint">
            {mode === 'mass'
              ? 'Masses are positive — amplitudes stay ≥ 0.'
              : 'Charges can be negative — amplitudes may go below 0.'}
          </p>
        </div>

        <div className="control-group">
          <h3>Parameters</h3>
          {model === 'two' && (
            <>
              <Slider label="A₁ amplitude" value={twoParams.a1} min={ampMin} max={2} step={0.05}
                onChange={(v) => setTwoParams((p) => ({ ...p, a1: v }))} />
              <Slider label="A₂ amplitude" value={twoParams.a2} min={ampMin} max={2} step={0.05}
                onChange={(v) => setTwoParams((p) => ({ ...p, a2: v }))} />
              <Slider label="k wavenumber" value={twoParams.k} min={0.5} max={4} step={0.05}
                onChange={(v) => setTwoParams((p) => ({ ...p, k: v }))} />
              <Slider label="ω frequency" value={twoParams.omega} min={0.5} max={4} step={0.05}
                onChange={(v) => setTwoParams((p) => ({ ...p, omega: v }))} />
              <Slider label="φ₁ phase" value={twoParams.p1} min={0} max={6.283} step={0.05}
                onChange={(v) => setTwoParams((p) => ({ ...p, p1: v }))} />
              <Slider label="φ₂ phase" value={twoParams.p2} min={0} max={6.283} step={0.05}
                onChange={(v) => setTwoParams((p) => ({ ...p, p2: v }))} />
            </>
          )}
          {model === 'decay' && (
            <>
              <Slider label="A amplitude" value={decayParams.a} min={ampMin} max={2} step={0.05}
                onChange={(v) => setDecayParams((p) => ({ ...p, a: v }))} />
              <Slider label="k wavenumber" value={decayParams.k} min={0.5} max={4} step={0.05}
                onChange={(v) => setDecayParams((p) => ({ ...p, k: v }))} />
              <Slider label="ω frequency" value={decayParams.omega} min={0.5} max={4} step={0.05}
                onChange={(v) => setDecayParams((p) => ({ ...p, omega: v }))} />
              <Slider label="β decay" value={decayParams.beta} min={0} max={1} step={0.01}
                onChange={(v) => setDecayParams((p) => ({ ...p, beta: v }))} />
            </>
          )}
          {model === 'harmonics' && (
            <>
              <Slider label="N modes" value={harmParams.n} min={1} max={8} step={1} format={int}
                onChange={(v) => setHarmParams((p) => ({ ...p, n: Math.round(v) }))} />
              <Slider label="A base amplitude" value={harmParams.a} min={ampMin} max={2} step={0.05}
                onChange={(v) => setHarmParams((p) => ({ ...p, a: v }))} />
              <Slider label="L string length" value={harmParams.L} min={2} max={10} step={0.5}
                onChange={(v) => setHarmParams((p) => ({ ...p, L: v }))} />
            </>
          )}
        </div>
      </div>

      <div className="lab-stage">
        <div className="equation">{EQUATIONS[model]}</div>
        <canvas ref={canvasRef} className="wave-canvas" />
        <div className="transport">
          <button onClick={() => setPlaying((p) => !p)}>{playing ? 'Pause' : 'Play'}</button>
          <button
            onClick={() => {
              tRef.current = 0
              setTime(0)
            }}
          >
            Reset
          </button>
          <span className="time-readout">t = {time.toFixed(2)} s</span>
        </div>
      </div>
    </div>
  )
}
