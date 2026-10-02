import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SUN_ENTROPY, freshSunExperiment, ForgetSurface,
  SPECTRUM_STOPS, BB_T_SCALE,
} from './SunGradientTest'
import { Transport } from './ModellingSun.jsx'
import Slider from './Slider.jsx'

// control points across the visible band. sliders move these points;
// the attenuation curve is smoothly interpolated between them.
const POINTS = [
  { lam: 380, label: '380' },
  { lam: 414, label: '414' },
  { lam: 448, label: '448' },
  { lam: 482, label: '482' },
  { lam: 516, label: '516' },
  { lam: 550, label: '550' },
  { lam: 584, label: '584' },
  { lam: 618, label: '618' },
  { lam: 652, label: '652' },
  { lam: 686, label: '686' },
  { lam: 720, label: '720' },
  { lam: 750, label: '750' },
]

function spectralRGB(lamNm) {
  const x = Math.min(1, Math.max(0, (750 - lamNm) / (750 - 380)))
  const sx = x * (SPECTRUM_STOPS.length - 1)
  const si = Math.min(SPECTRUM_STOPS.length - 2, Math.floor(sx))
  const sf = sx - si
  const a = SPECTRUM_STOPS[si], b = SPECTRUM_STOPS[si + 1]
  return [
    a[0] + (b[0] - a[0]) * sf,
    a[1] + (b[1] - a[1]) * sf,
    a[2] + (b[2] - a[2]) * sf,
  ]
}

// smooth attenuation at lamNm: cosine-interpolated between control points
function smoothAtten(lamNm, attens) {
  const pts = POINTS
  if (lamNm <= pts[0].lam) return attens[0]
  if (lamNm >= pts[pts.length - 1].lam) return attens[pts.length - 1]
  let i = 0
  while (i < pts.length - 2 && lamNm >= pts[i + 1].lam) i++
  const t = (lamNm - pts[i].lam) / (pts[i + 1].lam - pts[i].lam)
  const st = t * t * (3 - 2 * t) // smoothstep
  return attens[i] * (1 - st) + attens[i + 1] * st
}

function planck(lamM, TK) {
  const c1 = 3.7418e-16, c2 = 1.4388e-2
  return c1 / Math.pow(lamM, 5) / (Math.exp(c2 / (lamM * TK)) - 1)
}

// filtered blackbody color LUT for the sphere: 24 visible wavelengths,
// Planck-weighted, each scaled by the smooth filter. display-only.
export function buildFilteredLut(attens) {
  const N = 256, lut = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const T = (i / (N - 1)) * 8
    const TK = Math.max(0.05, T * BB_T_SCALE) * 11604.5
    let r = 0, g = 0, b = 0
    for (let j = 0; j < 24; j++) {
      const lamNm = 380 + (750 - 380) * j / 23
      const atten = smoothAtten(lamNm, attens)
      if (atten <= 0) continue
      const Bl = planck(lamNm * 1e-9, TK)
      const [cr, cg, cb] = spectralRGB(lamNm)
      r += Bl * cr * atten; g += Bl * cg * atten; b += Bl * cb * atten
    }
    const m = Math.max(r, g, b, 1e-30)
    lut[i * 3] = r / m * 255; lut[i * 3 + 1] = g / m * 255; lut[i * 3 + 2] = b / m * 255
  }
  return lut
}

// standard atmosphere across the visible band: Rayleigh scattering
// slopes the blue; the green-yellow-red passes nearly untouched.
const ATMOS_ATTENS = [0.55, 0.62, 0.70, 0.78, 0.88, 0.93, 0.95, 0.94, 0.92, 0.90, 0.89, 0.88]

// the filtered blackbody curve: baseline 5778 K Planck distribution with
// the smooth filter applied. area filled with spectral colors, dimmed
// where the curve runs low.
function FilterCurve({ attens, title, note }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth, h = 240
      canvas.width = w * dpr; canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const padL = 14, padR = 14, padT = 16, padB = 30
      const iw = w - padL - padR, ih = h - padT - padB
      const L0 = 380, L1 = 750, TK = 5778
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      // curve values
      const vals = []
      let peak = 1e-30
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK) * smoothAtten(lamNm, attens)
        vals.push(v)
        if (v > peak) peak = v
      }
      const Y = (v) => padT + ih - (v / peak) * ih
      // filled area, spectral colors dimmed by relative intensity
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const f = vals[px] / peak
        const y = Y(vals[px])
        const rgb = spectralRGB(lamNm)
        ctx.fillStyle = `rgb(${Math.round(rgb[0] * f)},${Math.round(rgb[1] * f)},${Math.round(rgb[2] * f)})`
        ctx.fillRect(padL + px, y, 1, padT + ih - y)
      }
      // smooth curve line on top
      ctx.beginPath()
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const x = padL + px, y = Y(vals[px])
        if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(58,49,37,0.85)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.lineWidth = 1
      // control points
      ctx.fillStyle = '#3a3125'
      for (let i = 0; i < POINTS.length; i++) {
        const lamNm = POINTS[i].lam
        const v = planck(lamNm * 1e-9, TK) * attens[i]
        ctx.beginPath()
        ctx.arc(X(lamNm), Y(v), 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
      // axes and labels
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, padT + ih); ctx.lineTo(padL + iw, padT + ih)
      ctx.stroke()
      ctx.fillStyle = '#715f43'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('380 nm', X(380), padT + ih + 16)
      ctx.fillText('565 nm', X(565), padT + ih + 16)
      ctx.fillText('750 nm', X(750), padT + ih + 16)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [attens])
  return (
    <div className="graph-box">
      <div className="graph-title-row"><div className="graph-title">{title}</div></div>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: 240 }} />
      {note && <p className="graph-note">{note}</p>}
    </div>
  )
}

function FilterEQ({ attens, onChange }) {
  const set = (i, v) => {
    const next = attens.slice()
    next[i] = v / 100
    onChange(next)
  }
  const reset = () => onChange(attens.map(() => 1))
  // spectrum gradient for the bar, built from the actual spectral colors
  const gradStops = []
  for (let j = 0; j <= 12; j++) {
    const lam = 380 + (750 - 380) * j / 12
    const pct = (j / 12) * 100
    gradStops.push(`rgb(${spectralRGB(lam).map(Math.round).join(',')}) ${pct}%`)
  }
  return (
    <div className="graph-box">
      <div className="graph-title-row">
        <div className="graph-title">Filter EQ</div>
        <button className="graph-reset" onClick={reset}>reset</button>
      </div>
      <div style={{ position: 'relative', height: 170, margin: '4px 8px 0' }}>
        {POINTS.map((pt, i) => {
          const leftPct = ((pt.lam - 380) / (750 - 380)) * 100
          const col = `rgb(${spectralRGB(pt.lam).map(Math.round).join(',')})`
          return (
            <div
              key={i}
              style={{
                position: 'absolute', left: `${leftPct}%`, top: 0,
                transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
              }}
            >
              <input
                type="range" min={0} max={100} value={Math.round(attens[i] * 100)}
                onChange={(e) => set(i, +e.target.value)}
                style={{ writingMode: 'vertical-lr', direction: 'rtl', width: 22, height: 100, accentColor: col }}
                aria-label={`${pt.label} nm attenuation`}
              />
              <div style={{ fontSize: 8, color: '#715f43', marginTop: 2, fontFamily: '"IBM Plex Mono", monospace' }}>
                {pt.label}
              </div>
            </div>
          )
        })}
        <div
          style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 16,
            background: `linear-gradient(to right, ${gradStops.join(', ')})`,
            borderRadius: 3, border: '1px solid rgba(107,90,62,0.35)',
          }}
        />
      </div>
      <p className="graph-note">
        Each slider sits above its wavelength on the spectrum bar and moves
        a single point on the attenuation curve; the curve stays smooth
        between them. 100% = pass, 0% = blocked. The filter removes color
        from the view, never energy from the physics.
      </p>
    </div>
  )
}

function useSunExp() {
  const expRef = useRef(null)
  if (!expRef.current) expRef.current = freshSunExperiment(SUN_ENTROPY)
  return expRef
}

function useSunCtl() {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [ripple, setRipple] = useState(1)
  const [rippleTau, setRippleTau] = useState(2.5)
  const ctlRef = useRef({})
  ctlRef.current = { playing, speed, ripple, rippleTau }
  const playingRef = useRef(false)
  playingRef.current = playing
  return { playing, setPlaying, speed, setSpeed, ripple, setRipple, rippleTau, setRippleTau, ctlRef, playingRef }
}

function SunSphere({ title, note, lutRef, children }) {
  const expRef = useSunExp()
  const ctl = useSunCtl()
  const dirtyRef = useRef(0)
  return (
    <>
      <div className="graph-box">
        <div className="graph-title-row"><div className="graph-title">{title}</div></div>
        <ForgetSurface expRef={expRef} ctlRef={ctl.ctlRef} dirtyRef={dirtyRef} bb lutRef={lutRef} />
        <p className="graph-note">{note}</p>
        <Transport
          playing={ctl.playing} speed={ctl.speed}
          onPlayingChange={ctl.setPlaying} onSpeedChange={ctl.setSpeed}
        />
        <div className="transport-speed">
          <Slider label="ripple" value={ctl.ripple} min={0} max={3} step={0.1}
            onChange={ctl.setRipple} format={(v) => `${v.toFixed(1)}×`} />
          <Slider label="ripple lifetime" value={ctl.rippleTau} min={0} max={40} step={0.1}
            onChange={ctl.setRippleTau} format={(v) => `${v.toFixed(1)} s`} />
        </div>
      </div>
      {children}
    </>
  )
}

export default function SunFilter() {
  const [attens, setAttens] = useState(() => POINTS.map(() => 1))
  const lut = useMemo(() => buildFilteredLut(attens), [attens])
  const lutRef = useRef(null)
  lutRef.current = lut

  const atmosLut = useMemo(() => buildFilteredLut(ATMOS_ATTENS), [])
  const atmosLutRef = useRef(null)
  atmosLutRef.current = atmosLut

  return (
    <>
      <SunSphere
        title="The Final Sun"
        lutRef={lutRef}
        note={
          <>
            The thermometer sun, seen through your filter. The physics
            underneath — Poisson fusion, random-walk photons, patch heat,
            cooling — runs untouched and unseen; the filter only decides
            which visible colors reach your eye. Turn down the yellow and
            the sphere loses its yellow; leave only green and you see
            where the green light falls.
          </>
        }
      >
        <FilterEQ attens={attens} onChange={setAttens} />
        <FilterCurve
          attens={attens}
          title="Filter curve"
          note={
            <>
              The baseline 5778 K blackbody distribution with your filter
              applied — the dots are your EQ points, the curve stays
              smooth between them. The area is filled with spectral
              colors dimmed where the curve runs low; blocked bands sink
              into gaps.
            </>
          }
        />
      </SunSphere>

      <SunSphere
        title="Atmospheric Scattering"
        lutRef={atmosLutRef}
        note={
          <>
            The same sun, seen through Earth's atmosphere instead of your
            sliders. Rayleigh scattering slopes the blue — the curve
            below is the standard transmission, smooth. The sphere
            yellows because the sky took the blue.
          </>
        }
      >
        <FilterCurve
          attens={ATMOS_ATTENS}
          title="Atmospheric transmission curve"
          note={
            <>
              Static filter: the 5778 K blackbody seen through air.
              Rayleigh scattering attenuates the blue; green through red
              passes nearly untouched. This is what the atmosphere does
              to sunlight before it reaches you.
            </>
          }
        />
      </SunSphere>
    </>
  )
}
