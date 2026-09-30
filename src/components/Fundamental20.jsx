import { useEffect, useMemo, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { BASE20 } from './ConvolutionSurface.jsx'

/* The fundamental 20 superposition: the 20 base frequencies from
   notes/quark-space.md (fixed seed, formation only) drawn as travelling
   waves on an x–amplitude graph. x spans one full cycle of the fundamental
   (the 1/3·f_q wave) so every wave completes a whole number of cycles — the
   fastest (4/3·f_q) completes 4. All 20 travel at one wave speed, like the
   surface's eigenstates. */

const BLUE = '#2563ad'
const ORANGE = '#d7642e'
const SGN_GAMMA = 0.618033988749895
const X_MAX = 2 * Math.PI // one full cycle of the fundamental
const PERIOD_S = 16 // seconds per fundamental cycle — time runs slowly

function Tex({ tex }) {
  return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(tex) }} />
}

const FRACS = { 1: '\\frac{1}{3}', 2: '\\frac{2}{3}', 3: '1', 4: '\\frac{4}{3}' }
const PLAIN_FRACS = { 1: '1/3', 2: '2/3', 3: '1', 4: '4/3' }
const LAMBDAS = { 1: '2\\pi', 2: '\\pi', 3: '\\frac{2\\pi}{3}', 4: '\\frac{\\pi}{2}' }

function waveParams() {
  return BASE20.map((t, k) => {
    const q = Math.abs(t.q)
    return {
      q,
      amp: 1 / Math.sqrt(k + 1),
      sgn: (Math.floor((k + 1) * SGN_GAMMA) % 2 === 0) ? 1 : -1,
      frac: FRACS[q],
      lambda: LAMBDAS[q],
    }
  })
}

function renderFrame(canvas, params, yMax, display, waveIdx, t) {
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (!w || !h) return
  const W = Math.round(w * dpr)
  const H = Math.round(h * dpr)
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W
    canvas.height = H
  }
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const L = 54
  const R = 16
  const T = 16
  const B = 36
  const pw = w - L - R
  const ph = h - T - B
  const X = (x) => L + (x / X_MAX) * pw
  const Y = (y) => T + ph / 2 - (y / yMax) * (ph / 2)

  // grid
  ctx.strokeStyle = '#e7dcc0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ;[-1, 0, 1].forEach((g) => {
    ctx.moveTo(L, Y(g * yMax))
    ctx.lineTo(w - R, Y(g * yMax))
  })
  ctx.stroke()
  // axes
  ctx.strokeStyle = '#8a7a55'
  ctx.beginPath()
  ctx.moveTo(L, T)
  ctx.lineTo(L, h - B)
  ctx.lineTo(w - R, h - B)
  ctx.stroke()
  // x ticks
  ctx.fillStyle = '#6b5c3e'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  const ticks = [[0, '0'], [Math.PI / 2, 'π/2'], [Math.PI, 'π'], [(3 * Math.PI) / 2, '3π/2'], [2 * Math.PI, '2π']]
  ticks.forEach(([x, lbl]) => {
    ctx.fillText(lbl, X(x), h - B + 16)
    ctx.strokeStyle = '#8a7a55'
    ctx.beginPath()
    ctx.moveTo(X(x), h - B)
    ctx.lineTo(X(x), h - B + 5)
    ctx.stroke()
  })
  // y ticks
  ctx.textAlign = 'right'
  ;[-yMax, 0, yMax].forEach((y) => {
    ctx.fillText(y === 0 ? '0' : y.toFixed(2), L - 8, Y(y) + 4)
  })
  // axis titles
  ctx.textAlign = 'right'
  ctx.fillText('x', w - R, h - 8)
  ctx.save()
  ctx.translate(15, T + ph / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'
  ctx.fillText('amplitude', 0, 0)
  ctx.restore()

  const N = 420
  const yk = (p, x) => p.sgn * p.amp * Math.cos(p.q * (x - t))
  const trace = (fn, color, width, alpha) => {
    ctx.globalAlpha = alpha
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    for (let i = 0; i <= N; i++) {
      const x = (i / N) * X_MAX
      const px = X(x)
      const py = Y(fn(x))
      if (i === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  if (display === 'all') {
    params.forEach((p) => trace((x) => yk(p, x), BLUE, 1, 0.45))
  }
  if (display === 'all' || display === 'sum') {
    trace((x) => params.reduce((s, p) => s + yk(p, x), 0), ORANGE, 2.5, 1)
  }
  if (display === 'single') {
    const p = params[waveIdx]
    trace((x) => yk(p, x), BLUE, 2.5, 1)
  }
}

export default function Fundamental20() {
  const [display, setDisplay] = useState('all') // 'all' | 'sum' | 'single'
  const [waveIdx, setWaveIdx] = useState(0)
  const [playing, setPlaying] = useState(true)
  const canvasRef = useRef(null)
  const tRef = useRef(0)
  const params = useMemo(waveParams, [])
  const yMax = useMemo(() => {
    let m = 0
    for (let i = 0; i <= 720; i++) {
      const x = (i / 720) * X_MAX
      const s = Math.abs(params.reduce((acc, p) => acc + p.sgn * p.amp * Math.cos(p.q * x), 0))
      if (s > m) m = s
    }
    return m * 1.15
  }, [params])

  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const draw = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (playing) tRef.current += dt * ((2 * Math.PI) / PERIOD_S)
      if (canvasRef.current) renderFrame(canvasRef.current, params, yMax, display, waveIdx, tRef.current)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [params, yMax, display, waveIdx, playing])

  const p = params[waveIdx]

  return (
    <div className="graph-box">
      <div className="graph-title-row">
        <h2 className="graph-title">The fundamental 20 superposition</h2>
      </div>
      <div className="graph-meta-row">
        <div className="legend">
          {display === 'all' && (
            <>
              <span><i className="swatch" style={{ background: BLUE }} />20 base waves</span>
              <span><i className="swatch" style={{ background: ORANGE }} />sum</span>
            </>
          )}
          {display === 'sum' && (
            <span><i className="swatch" style={{ background: ORANGE }} />sum of the 20 base waves</span>
          )}
          {display === 'single' && (
            <span><i className="swatch" style={{ background: BLUE }} /><Tex tex={`\\text{wave } ${waveIdx + 1}\\text{: } f = ${p.frac}f_q,\\; \\lambda = ${p.lambda}`} /></span>
          )}
        </div>
        <div className="graph-selects">
          <label className="check-row graph-check">
            Display
            <select value={display} onChange={(e) => setDisplay(e.target.value)}>
              <option value="all">All 20 + sum</option>
              <option value="sum">Sum only</option>
              <option value="single">Single wave</option>
            </select>
          </label>
          {display === 'single' && (
            <label className="check-row graph-check">
              Wave
              <select value={waveIdx} onChange={(e) => setWaveIdx(Number(e.target.value))}>
                {params.map((wp, i) => (
                  <option key={i} value={i}>Wave {i + 1} — {PLAIN_FRACS[wp.q]} f_q</option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
      <div className="f20-canvas-wrap">
        <canvas ref={canvasRef} className="wave-canvas f20-canvas" />
        <button
          className="f20-play"
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
      </div>
      <p className="graph-note f20-note">
        x spans one full cycle of the fundamental (the 1/3 f_q wave), so every wave completes whole
        cycles — the fastest (4/3 f_q) completes 4. All 20 travel at one wave speed.
      </p>
    </div>
  )
}
