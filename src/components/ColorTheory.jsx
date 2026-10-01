import { useEffect, useMemo, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import { buildQuarkTerms } from './ConvolutionSurface.jsx'

function Tex({ tex }) {
  const html = katex.renderToString(tex, { throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

/* Color Theory: every eigenstate gets the color of its energy. Low
   frequencies burn red, high frequencies burn blue — the way starlight
   works — and the combination frequencies at higher entropies take their
   color from the same scale. The eigenstate waves are drawn in their energy
   colors, faint; their sum is drawn on top in the additive mix of all of
   them. The more components join, the closer the sum washes toward white. */

const SGN_GAMMA = 0.618033988749895 // golden-ratio sign pattern, as in the surface
const OMEGA = 0.6
const X_MAX = Math.PI * 4
const STEPS = 420

// the energy scale: |q| in units of f_q/3 — 1 → red, 2 → yellow,
// 3 → teal-green, ≥4 → blue; hotter combinations saturate at blue
const STOPS = [
  [0, [231, 76, 60]],
  [1 / 3, [241, 196, 15]],
  [2 / 3, [46, 204, 160]],
  [1, [52, 120, 246]],
]

function energyColor(q) {
  const t = Math.max(0, Math.min(1, (Math.abs(q) - 1) / 3))
  for (let s = 0; s < STOPS.length - 1; s++) {
    const [t0, c0] = STOPS[s]
    const [t1, c1] = STOPS[s + 1]
    if (t >= t0 && t <= t1) {
      const f = (t - t0) / (t1 - t0 || 1)
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * f),
        Math.round(c0[1] + (c1[1] - c0[1]) * f),
        Math.round(c0[2] + (c1[2] - c0[2]) * f),
      ]
    }
  }
  return STOPS[STOPS.length - 1][1].slice()
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
}) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ playing, speed })
  stateRef.current = { playing, speed }

  // a fresh random chain per entropy value — stable while the slider sits still
  const terms = useMemo(() => buildQuarkTerms(40, entropy), [entropy])

  const comps = useMemo(() => {
    const n = Math.min(shown, terms.length)
    const out = []
    for (let k = 0; k < n; k++) {
      const term = terms[k]
      const sgn = (Math.floor((k + 1) * SGN_GAMMA) % 2 === 0) ? 1 : -1
      const amp = term.m * sgn * (waveAmp / Math.sqrt(k + 1))
      out.push({ q: term.q, amp, color: energyColor(term.q) })
    }
    return out
  }, [terms, shown, waveAmp])

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
    for (let i = 0; i <= 24; i++) {
      const c = energyColor(1 + (i / 24) * 3.2)
      samples.push(rgb(c))
    }
    return `linear-gradient(to right, ${samples.join(',')})`
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
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
  }, [comps, mixed])

  return (
    <>
      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">The energy scale</h2>
        </div>
        <div style={{ padding: '6px 18px 2px' }}>
          <div
            style={{
              height: 26,
              borderRadius: 6,
              background: scaleCSS,
              border: '1px solid rgba(107,90,62,0.35)',
            }}
          />
          <div style={{ position: 'relative', height: 30, marginTop: 4 }}>
            {[
              ['0%', '1/3 f_q'],
              ['33.3%', '2/3 f_q'],
              ['66.7%', '1 f_q'],
              ['100%', '4/3 f_q +'],
            ].map(([left, label]) => (
              <span
                key={label}
                style={{
                  position: 'absolute', left, transform: 'translateX(-50%)',
                  font: '11px "IBM Plex Mono", monospace', color: '#715f43',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
        <p className="graph-note">
          Color from energy, E = hν — the cooler the frequency, the redder;
          the hotter, the bluer. Combination frequencies at higher entropies
          take their color from the same scale; anything hotter than 4/3 f_q
          saturates at blue.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Components in their energy colors</h2>
        </div>
        <div className="sim-stage-col">
          <div style={{ position: 'relative', width: '100%', height: 300 }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: '8px 18px 0' }}>
          {comps.map((c, i) => (
            <span
              key={i}
              title={`${freqLabel(c.q)}${c.amp < 0 ? ' (decay, subtracted)' : ''}`}
              style={{
                width: 20, height: 20, borderRadius: 4,
                background: rgb(c.color),
                border: '1px solid rgba(107,90,62,0.35)',
              }}
            />
          ))}
          <span style={{ margin: '0 4px', color: '#715f43' }}>→</span>
          <span
            title="the additive mix of every component"
            style={{
              width: 34, height: 34, borderRadius: 6,
              background: rgb(mixed),
              border: '2px solid rgba(107,90,62,0.5)',
            }}
          />
          <span style={{ font: '12px "IBM Plex Mono", monospace', color: '#715f43' }}>
            the sum's color
          </span>
        </div>
        <p className="graph-note">
          Every eigenstate wave in its energy color, faint; their sum on top
          in the additive mix. Adding light doesn't average toward grey the
          way paint does — the hues pile up and the sum washes toward white.
          Hover a swatch for its frequency; decay states are subtracted from
          the sum.
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

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Equations</h2>
        </div>
        <div className="eq-grid">
          <div className="eq-box">
            <span className="eq-label">Color from energy</span>
            <span className="eq-line"><Tex tex="E = h\nu \;\Rightarrow\; \nu_k = |q_k|\,\dfrac{f_q}{3}" /></span>
            <span className="eq-line"><Tex tex="\text{red } |q|=1 \;\to\; \text{yellow } |q|=2 \;\to\; \text{blue } |q|\ge 4" /></span>
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
    </>
  )
}
