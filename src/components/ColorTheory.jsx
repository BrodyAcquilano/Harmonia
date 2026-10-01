import { useEffect, useMemo, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import { buildQuarkTerms } from './ConvolutionSurface.jsx'

function Tex({ tex }) {
  const html = katex.renderToString(tex, { throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

/* Color Theory: every eigenstate gets the color of its energy, on the real
   spectrum — dark red (infrared) for the coolest frequency in view, light
   purple (ultraviolet) for the hottest. The scale stretches between two
   cutoff bounds padded past what's present, and refits every time new
   frequencies are added. The eigenstate waves are drawn in their energy
   colors, faint; their sum is drawn on top in the additive mix of all of
   them. The more components join, the closer the sum washes toward white. */

const SGN_GAMMA = 0.618033988749895 // golden-ratio sign pattern, as in the surface
const OMEGA = 0.6
const X_MAX = Math.PI * 4
const STEPS = 420

// the physical color spectrum, from the cool end to the hot end.
// infrared and ultraviolet are each one flat color — dark red and light
// purple — with the visible spectrum filling the reasonable range in the
// middle. The middle range comes from the cutoff bounds: the visible
// spectrum spans exactly the frequencies in view.
const IR_RGB = [110, 20, 20]      // infrared — one color
const UV_RGB = [216, 191, 216]    // ultraviolet — one color
const VISIBLE_STOPS = [
  [255, 0, 0],     // red
  [255, 127, 0],   // orange
  [255, 255, 0],   // yellow
  [0, 200, 0],     // green
  [0, 200, 255],   // cyan
  [0, 0, 255],     // blue
  [139, 0, 255],   // violet
]
const DEF_BANDS = { tIR: 1 / 12, tUV: 11 / 12 }

export function spectrumColor(t, b = DEF_BANDS) {
  const tc = Math.max(0, Math.min(1, t))
  if (tc <= b.tIR) return IR_RGB.slice()
  if (tc >= b.tUV) return UV_RGB.slice()
  const s = (tc - b.tIR) / (b.tUV - b.tIR)
  const x = s * (VISIBLE_STOPS.length - 1)
  const i = Math.min(VISIBLE_STOPS.length - 2, Math.floor(x))
  const f = x - i
  const a = VISIBLE_STOPS[i], b2 = VISIBLE_STOPS[i + 1]
  return [
    Math.round(a[0] + (b2[0] - a[0]) * f),
    Math.round(a[1] + (b2[1] - a[1]) * f),
    Math.round(a[2] + (b2[2] - a[2]) * f),
  ]
}

// color from energy, on a shifting scale. The scale stretches between two
// cutoff bounds — each padded 10% beyond the frequencies in view — so the
// coolest frequency present lands in dark red (infrared) and the hottest in
// light purple (ultraviolet), with the real spectrum between. Every time new
// frequencies are added, the bounds are refit: the scale always spans what is
// actually here.
export function spectrumBounds(qs) {
  let qMin = Infinity, qMax = -Infinity
  for (const q of qs) {
    const aq = Math.abs(q)
    if (aq < qMin) qMin = aq
    if (aq > qMax) qMax = aq
  }
  if (!isFinite(qMin)) { qMin = 1; qMax = 4 }
  const pad = qMax > qMin ? 0.1 * (qMax - qMin) : 0.5
  const lo = qMin - pad, hi = qMax + pad
  // where the visible spectrum starts and ends on the bar — derived from
  // the cutoff bounds, so the visible range always spans what's in view
  const tIR = (qMin - lo) / (hi - lo)
  const tUV = (qMax - lo) / (hi - lo)
  return { lo, hi, qMin, qMax, tIR, tUV }
}

export function energyColor(q, b) {
  const t = b.hi > b.lo ? (Math.abs(q) - b.lo) / (b.hi - b.lo) : 0.5
  return spectrumColor(t, b)
}

const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

function freqLabel(q) {
  const aq = Math.abs(q)
  if (aq === 1) return '1/3 f_q'
  if (aq === 2) return '2/3 f_q'
  if (aq === 3) return '1 f_q'
  if (aq === 4) return '4/3 f_q'
  return `${aq}/3 f_q`
}

export default function ColorTheory({
  entropy = 60000,
  waveAmp = 0.2,
  shown = 12,
  playing = true,
  speed = 1,
  onPlayingChange,
  onSpeedChange,
  showScale = true,
  showComponents = true,
  showEquations = true,
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ playing, speed })
  stateRef.current = { playing, speed }

  // a fresh random chain per entropy value — stable while the slider sits still
  const terms = useMemo(() => buildQuarkTerms(40, entropy), [entropy])

  // the spectrum bounds, fit to the frequencies in view and stretched
  // between two padded cutoff bounds — refit every time new frequencies
  // are added
  const bounds = useMemo(() => {
    const n = Math.min(shown, terms.length)
    const qs = []
    for (let k = 0; k < n; k++) qs.push(terms[k].q)
    return spectrumBounds(qs)
  }, [terms, shown])

  const comps = useMemo(() => {
    const n = Math.min(shown, terms.length)
    const out = []
    for (let k = 0; k < n; k++) {
      const term = terms[k]
      const sgn = (Math.floor((k + 1) * SGN_GAMMA) % 2 === 0) ? 1 : -1
      const amp = term.m * sgn * (waveAmp / Math.sqrt(k + 1))
      out.push({ q: term.q, amp, color: energyColor(term.q, bounds) })
    }
    return out
  }, [terms, shown, waveAmp, bounds])

  // additive mix of the component colors, weighted by |amplitude| —
  // scaled so the brightest channel hits full: hues pile up toward white
  const mixed = useMemo(() => {
    const m = [0, 0, 0]
    for (const c of comps) {
      const w = Math.abs(c.amp)
      m[0] += w * c.color[0]; m[1] += w * c.color[1]; m[2] += w * c.color[2]
    }
    const mx = Math.max(m[0], m[1], m[2], 1e-9)
    const s = 255 / mx
    return [Math.min(255, m[0] * s), Math.min(255, m[1] * s), Math.min(255, m[2] * s)].map(Math.round)
  }, [comps])

  const scaleCSS = useMemo(() => {
    const samples = []
    for (let i = 0; i <= 48; i++) samples.push(rgb(spectrumColor(i / 48, bounds)))
    return `linear-gradient(to right, ${samples.join(',')})`
  }, [bounds])

  useEffect(() => {
    const canvas = canvasRef.current
    // the scale-only mount has no canvas — nothing to draw on
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf = 0
    let simT = 0
    let last = performance.now()

    const draw = () => {
      const st = stateRef.current
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const padL = 8, padR = 8, padT = 14, padB = 26
      const iw = w - padL - padR, ih = h - padT - padB
      // vertical auto-scale: the sum of |amplitudes| always fits
      let yMax = 1e-9
      for (const c of comps) yMax += Math.abs(c.amp)
      yMax *= 1.2
      const X = (x) => padL + (x / X_MAX) * iw
      const Y = (y) => padT + ih / 2 - (y / yMax) * (ih / 2)

      // center axis
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padL, Y(0)); ctx.lineTo(padL + iw, Y(0))
      ctx.stroke()
      // x ticks: 0, π, 2π, 3π, 4π
      ctx.fillStyle = '#715f43'
      ctx.font = '11px "IBM Plex Mono", monospace'
      ctx.textAlign = 'center'
      const tickLabels = ['0', 'π', '2π', '3π', '4π']
      for (let i = 0; i <= 4; i++) {
        const x = (i / 4) * X_MAX
        ctx.fillText(tickLabels[i], X(x), padT + ih + 16)
      }

      // the components, faint, in their energy colors
      ctx.lineWidth = 1.2
      for (const c of comps) {
        const aq = Math.abs(c.q)
        ctx.strokeStyle = rgb(c.color, 0.55)
        ctx.beginPath()
        for (let s = 0; s <= STEPS; s++) {
          const x = (s / STEPS) * X_MAX
          const y = c.amp * Math.cos(aq * (x - OMEGA * simT))
          if (s === 0) ctx.moveTo(X(x), Y(y))
          else ctx.lineTo(X(x), Y(y))
        }
        ctx.stroke()
      }
      // the sum, bright, in the additive mix
      ctx.strokeStyle = rgb(mixed, 1)
      ctx.lineWidth = 3
      ctx.beginPath()
      for (let s = 0; s <= STEPS; s++) {
        const x = (s / STEPS) * X_MAX
        let y = 0
        for (const c of comps) {
          const aq = Math.abs(c.q)
          y += c.amp * Math.cos(aq * (x - OMEGA * simT))
        }
        if (s === 0) ctx.moveTo(X(x), Y(y))
        else ctx.lineTo(X(x), Y(y))
      }
      ctx.stroke()
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const now = performance.now()
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      if (stateRef.current.playing) simT += dt * stateRef.current.speed
      draw()
    }
    loop()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [comps, mixed, showComponents])

  return (
    <>
      {showScale && (
      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">The energy scale</h2>
        </div>
        <div style={{ padding: '6px 18px 2px' }}>
          <div style={{ position: 'relative' }}>
            <div
              style={{
                height: 26,
                borderRadius: 6,
                background: scaleCSS,
                border: '1px solid rgba(107,90,62,0.35)',
              }}
            />
            {/* ticks where the visible spectrum starts and ends */}
            {[bounds.tIR, bounds.tUV].map((tt, i) => (
              <div key={i} style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${tt * 100}%`, width: 2,
                background: 'rgba(255,255,255,0.7)',
                transform: 'translateX(-1px)',
              }} />
            ))}
          </div>
          <div style={{ position: 'relative', height: 42, marginTop: 6 }}>
            <span style={{
              position: 'absolute', left: 0, top: 0,
              font: '11px "IBM Plex Mono", monospace', color: '#715f43',
            }}>
              infrared
            </span>
            <span style={{
              position: 'absolute', right: 0, top: 0, textAlign: 'right',
              font: '11px "IBM Plex Mono", monospace', color: '#715f43',
            }}>
              ultraviolet
            </span>
            <span style={{
              position: 'absolute', left: `${bounds.tIR * 100}%`, top: 18,
              transform: 'translateX(-50%)', whiteSpace: 'nowrap',
              font: '11px "IBM Plex Mono", monospace', color: '#4a3f2c',
            }}>
              {freqLabel(bounds.qMin)}
            </span>
            <span style={{
              position: 'absolute', left: `${bounds.tUV * 100}%`, top: 18,
              transform: 'translateX(-50%)', whiteSpace: 'nowrap',
              font: '11px "IBM Plex Mono", monospace', color: '#4a3f2c',
            }}>
              {freqLabel(bounds.qMax)}
            </span>
          </div>
        </div>
        <p className="graph-note">
          Color from energy, E = hν, on a shifting scale — drawn as a number
          line. The scale stretches between two cutoff bounds, each padded
          past the frequencies in view; the visible spectrum fills the
          reasonable range in the middle, with flat infrared (dark red)
          below the coolest frequency and flat ultraviolet (light purple)
          above the hottest. Every time new frequencies are added, the
          bounds are refit — the scale always spans what is actually here.
        </p>
      </div>
      )}

      {showComponents && (
      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Components in their energy colors</h2>
        </div>
        <div className="sim-stage-col">
          <div style={{ position: 'relative', width: '100%', height: 300 }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </div>
        <p className="graph-note">
          Every eigenstate wave in its energy color, faint; their sum on top
          in the additive mix. Adding light doesn't average toward grey the
          way paint does — the hues pile up and the sum washes toward white.
          Match each wave's color off the spectrum bar above; decay states
          are subtracted from the sum.
        </p>
        <div className="sim-transport">
          <button
            className="sim-item transport-play"
            onClick={() => onPlayingChange && onPlayingChange(!playing)}
            aria-pressed={playing}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <div className="transport-speed">
            <Slider label="speed" value={speed} min={0.1} max={3} step={0.1}
              onChange={(v) => onSpeedChange && onSpeedChange(v)} format={(v) => `${v.toFixed(1)}×`} />
          </div>
        </div>
      </div>
      )}

      {showEquations && (
      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Equations</h2>
        </div>
        <div className="eq-grid">
          <div className="eq-box">
            <span className="eq-label">Color from energy — a shifting scale</span>
            <span className="eq-line"><Tex tex="t_k = \dfrac{|q_k| - q_{\mathrm{lo}}}{q_{\mathrm{hi}} - q_{\mathrm{lo}}},\quad \mathbf{C}_k = \mathrm{spectrum}(t_k)" /></span>
            <span className="eq-line"><Tex tex="q_{\mathrm{lo/hi}} = q_{\min/\max} \mp 10\% \text{ — cutoffs padded past what's in view}" /></span>
            <span className="eq-line"><Tex tex="t \le t_{\mathrm{IR}} \to \text{dark red},\ t \ge t_{\mathrm{UV}} \to \text{light purple — the visible spectrum fills the middle}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">The components</span>
            <span className="eq-line"><Tex tex="w_k(x,t) = a_k\cos(|q_k|(x-\Omega t)),\quad a_k = \dfrac{m_k\sigma_k a}{\sqrt{k+1}}" /></span>
            <span className="eq-line"><Tex tex="m_k = \pm 1 \text{ formation/decay},\quad \sigma_k \text{ the golden-ratio sign pattern}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Additive mixing — toward white</span>
            <span className="eq-line"><Tex tex="\mathbf{C}_{\mathrm{sum}} = \sum_k |a_k|\,\mathbf{C}_k" /></span>
            <span className="eq-line"><Tex tex="\text{scaled so the brightest channel is 1 — hues pile up to white}" /></span>
          </div>
        </div>
      </div>
      )}
    </>
  )
}

/* Relative abundance of frequencies distribution: a smooth distribution
   curve over the spectrum — the curve rises where eigenstates pile up, and
   the area beneath it is filled with the spectrum itself, each point colored
   by where it sits on the line. No vertical axis: the graph pops up from the
   number line, and what matters is the shape — a fall from infrared to
   ultraviolet, or a hump in the middle. */
export function FrequencyDistribution({ entropy, shown }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const terms = buildQuarkTerms(40, entropy)
    const n = Math.min(shown, terms.length)
    const qs = []
    for (let k = 0; k < n; k++) qs.push(Math.abs(terms[k].q))
    const bounds = spectrumBounds(qs)
    const tOf = (q) => (q - bounds.lo) / (bounds.hi - bounds.lo)
    const ts = qs.map(tOf)

    // smooth distribution: a gaussian kernel on every eigenstate's position
    const bw = 0.1
    const gauss = (u) => Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
    const density = (t) => {
      let s = 0
      for (const tk of ts) s += gauss((t - tk) / bw)
      return s / (n * bw)
    }
    const M = 240
    const ds = []
    let dMax = 1e-9
    for (let i = 0; i <= M; i++) {
      const d = density(i / M)
      ds.push(d)
      if (d > dMax) dMax = d
    }

    const padL = 14, padR = 14, padT = 10, plotH = 190
    const barH = 18, barGap = 8, textH = 36
    const iw = w - padL - padR
    const baseY = padT + plotH
    const X = (t) => padL + t * iw
    const Y = (d) => baseY - (d / (dMax * 1.08)) * plotH

    // area under the curve, filled with the spectrum itself
    const grad = ctx.createLinearGradient(padL, 0, padL + iw, 0)
    for (let i = 0; i <= 48; i++) grad.addColorStop(i / 48, rgb(spectrumColor(i / 48, bounds), 0.55))
    ctx.beginPath()
    ctx.moveTo(X(0), baseY)
    for (let i = 0; i <= M; i++) ctx.lineTo(X(i / M), Y(ds[i]))
    ctx.lineTo(X(1), baseY)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // the curve on top
    ctx.beginPath()
    for (let i = 0; i <= M; i++) {
      const x = X(i / M), y = Y(ds[i])
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(74,63,44,0.85)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.lineWidth = 1

    // the number line it pops up from
    ctx.strokeStyle = 'rgba(107,90,62,0.5)'
    ctx.beginPath()
    ctx.moveTo(padL, baseY)
    ctx.lineTo(padL + iw, baseY)
    ctx.stroke()

    // spectrum bar beneath, for reference
    const barY = baseY + barGap
    const bg = ctx.createLinearGradient(padL, 0, padL + iw, 0)
    for (let i = 0; i <= 48; i++) bg.addColorStop(i / 48, rgb(spectrumColor(i / 48, bounds)))
    ctx.fillStyle = bg
    ctx.fillRect(padL, barY, iw, barH)
    ctx.strokeStyle = 'rgba(107,90,62,0.35)'
    ctx.strokeRect(padL, barY, iw, barH)
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    for (const tt of [bounds.tIR, bounds.tUV]) ctx.fillRect(X(tt) - 1, barY, 2, barH)

    // labels: zones on one row, tick frequencies below
    ctx.font = '11px "IBM Plex Mono", monospace'
    const row1 = barY + barH + 15, row2 = barY + barH + 31
    ctx.fillStyle = '#715f43'
    ctx.textAlign = 'left'
    ctx.fillText('infrared', padL, row1)
    ctx.textAlign = 'right'
    ctx.fillText('ultraviolet', padL + iw, row1)
    ctx.fillStyle = '#4a3f2c'
    ctx.textAlign = 'center'
    ctx.fillText(freqLabel(bounds.qMin), X(bounds.tIR), row2)
    ctx.fillText(freqLabel(bounds.qMax), X(bounds.tUV), row2)
  }, [entropy, shown])

  return (
    <div className="graph-box">
      <div className="graph-title-row">
        <h2 className="graph-title">Relative abundance of frequencies distribution</h2>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 292 }}>
        <canvas ref={ref} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
      <p className="graph-note">
        A smooth distribution over the spectrum — the curve rises where
        eigenstates pile up, and the area beneath it is filled with the
        spectrum itself, each point colored by where it sits on the line.
        No vertical axis: what matters is the shape — a fall from infrared
        to ultraviolet, or a hump in the middle. Move entropy or components
        and watch it change.
      </p>
    </div>
  )
}
