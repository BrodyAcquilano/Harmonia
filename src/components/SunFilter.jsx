import { useEffect, useMemo, useRef, useState } from 'react'
import {
  SUN_ENTROPY, freshSunExperiment, ForgetSurface,
  SPECTRUM_STOPS, BB_T_SCALE, bbHueFromLut,
} from './SunGradientTest'
import { Transport } from './ModellingSun.jsx'
import Slider from './Slider.jsx'

// filter bands: [label, lam0, lam1, kind] — kind is 'uv', 'vis', or 'ir'.
// the surface only listens to 'vis'; the spectrogram shows all.
const BANDS = [
  ['UV', 300, 340, 'uv'],
  ['UV', 340, 380, 'uv'],
  ['V', 380, 411, 'vis'],
  ['V', 411, 442, 'vis'],
  ['V', 442, 473, 'vis'],
  ['V', 473, 504, 'vis'],
  ['V', 504, 535, 'vis'],
  ['V', 535, 566, 'vis'],
  ['V', 566, 597, 'vis'],
  ['V', 597, 628, 'vis'],
  ['V', 628, 659, 'vis'],
  ['V', 659, 690, 'vis'],
  ['V', 690, 721, 'vis'],
  ['V', 721, 750, 'vis'],
  ['IR', 750, 875, 'ir'],
  ['IR', 875, 1000, 'ir'],
]
const VIS_BANDS = BANDS.map((b, i) => ({ ...b, i })).filter((b) => b[2] === 'vis')

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

function attenAt(lamNm, attens) {
  for (let i = 0; i < BANDS.length; i++) {
    if (lamNm >= BANDS[i][1] && lamNm < BANDS[i][2]) return attens[i]
  }
  return 1
}

// build a 256-entry blackbody color LUT with the filter applied.
// only the visible bands affect the surface; the LUT is display-only —
// the physics (temperatures, photons) is untouched.
export function buildFilteredLut(attens) {
  const N = 256, lut = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const T = (i / (N - 1)) * 8
    const TK = Math.max(0.05, T * BB_T_SCALE) * 11604.5
    const c1 = 3.7418e-16, c2 = 1.4388e-2
    let r = 0, g = 0, b = 0
    for (let j = 0; j < 24; j++) {
      const lamNm = 380 + (750 - 380) * j / 23
      const atten = attenAt(lamNm, attens)
      if (atten <= 0) continue
      const lamM = lamNm * 1e-9
      const Bl = c1 / Math.pow(lamM, 5) / (Math.exp(c2 / (lamM * TK)) - 1)
      const [cr, cg, cb] = spectralRGB(lamNm)
      r += Bl * cr * atten; g += Bl * cg * atten; b += Bl * cb * atten
    }
    const m = Math.max(r, g, b, 1e-30)
    lut[i * 3] = r / m * 255; lut[i * 3 + 1] = g / m * 255; lut[i * 3 + 2] = b / m * 255
  }
  return lut
}

// standard atmospheric transmission, 300-1000 nm. ozone eats the UV,
// Rayleigh scattering takes the blue, water vapor bites the IR.
const ATMOS = [
  [300, 320, 0.05], [320, 360, 0.15], [360, 400, 0.40],
  [400, 450, 0.65], [450, 500, 0.80], [500, 600, 0.95],
  [600, 700, 0.92], [700, 750, 0.88], [750, 900, 0.75], [900, 1000, 0.60],
]
function atmosAtten(lamNm) {
  for (const [a, b, t] of ATMOS) if (lamNm >= a && lamNm < b) return t
  return 1
}
function atmosAttens() {
  return BANDS.map((bd) => {
    const mid = (bd[1] + bd[2]) / 2
    return atmosAtten(mid)
  })
}

// spectrogram: the sun's emission spectrum (5778 K) with a filter applied.
// filtered bands become gaps. drawn in spectral colors.
function Spectrogram({ attens, title }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth, h = 220
      canvas.width = w * dpr; canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const padL = 14, padR = 14, padT = 18, padB = 28
      const iw = w - padL - padR, ih = h - padT - padB
      const L0 = 300, L1 = 1000
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      // 5778 K blackbody, for the shape
      const c1 = 3.7418e-16, c2 = 1.4388e-2, TK = 5778
      let peak = 1e-30
      const vals = []
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const lamM = lamNm * 1e-9
        const Bl = c1 / Math.pow(lamM, 5) / (Math.exp(c2 / (lamM * TK)) - 1)
        const v = Bl * attenAt(lamNm, attens)
        vals.push(v)
        if (v > peak) peak = v
      }
      // filled spectral curve
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const y = padT + ih - (vals[px] / peak) * ih
        let rgb
        if (lamNm < 380) rgb = [150, 100, 220]
        else if (lamNm > 750) rgb = [140, 40, 20]
        else rgb = spectralRGB(lamNm).map(Math.round)
        ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
        ctx.fillRect(padL + px, y, 1, padT + ih - y)
      }
      // band edges
      ctx.strokeStyle = 'rgba(107,90,62,0.35)'
      ctx.beginPath()
      ctx.moveTo(padL, padT + ih); ctx.lineTo(padL + iw, padT + ih)
      ctx.stroke()
      // labels
      ctx.fillStyle = '#715f43'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('300 nm', X(300), padT + ih + 16)
      ctx.fillText('750 nm', X(750), padT + ih + 16)
      ctx.fillText('1000 nm', X(1000), padT + ih + 16)
      ctx.fillText('UV', X(340), padT + 10)
      ctx.fillText('visible', X(565), padT + 10)
      ctx.fillText('IR', X(875), padT + 10)
      // visible band shading
      ctx.fillStyle = 'rgba(255,200,80,0.08)'
      ctx.fillRect(X(380), padT, X(750) - X(380), ih)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [attens])
  return (
    <div className="graph-box">
      <div className="graph-title-row"><div className="graph-title">{title}</div></div>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: 220 }} />
      <p className="graph-note">
        The sun's emission spectrum at 5778 K with the filter applied —
        filtered bands collapse into gaps. The filter changes only what
        is seen, not the energy underneath.
      </p>
    </div>
  )
}

// graphic EQ: one vertical attenuation slider per band, color-coded.
function FilterEQ({ attens, onChange }) {
  const set = (i, v) => {
    const next = attens.slice()
    next[i] = v / 100
    onChange(next)
  }
  const reset = () => onChange(attens.map(() => 1))
  return (
    <div className="graph-box">
      <div className="graph-title-row">
        <div className="graph-title">Filter EQ</div>
        <button className="graph-reset" onClick={reset}>reset</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, padding: '8px 4px', overflowX: 'auto' }}>
        {BANDS.map((bd, i) => {
          const mid = (bd[1] + bd[2]) / 2
          let col
          if (bd[3] === 'uv') col = '#966fd6'
          else if (bd[3] === 'ir') col = '#a03020'
          else col = `rgb(${spectralRGB(mid).map(Math.round).join(',')})`
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 34 }}>
              <input
                type="range" min={0} max={100} value={Math.round(attens[i] * 100)}
                onChange={(e) => set(i, +e.target.value)}
                style={{ writingMode: 'vertical-lr', direction: 'rtl', width: 24, height: 110, accentColor: col }}
                aria-label={`${bd[0]} ${bd[1]}-${bd[2]} nm attenuation`}
              />
              <div style={{ fontSize: 9, color: '#715f43', marginTop: 4, fontFamily: '"IBM Plex Mono", monospace' }}>
                {bd[3] === 'vis' ? `${Math.round(mid)}` : bd[0]}
              </div>
              <div style={{ width: 20, height: 6, background: col, borderRadius: 2, marginTop: 2, opacity: 0.85 }} />
            </div>
          )
        })}
      </div>
      <p className="graph-note">
        Attenuation per band, 100% = pass, 0% = blocked. Only the visible
        sliders change the sphere — the surface shows visible light only —
        but IR and UV sliders reshape the spectrogram. The filter removes
        color from the view, never energy from the physics.
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
  // part 1: user filter
  const [attens, setAttens] = useState(() => BANDS.map(() => 1))
  const lut = useMemo(() => buildFilteredLut(attens), [attens])
  const lutRef = useRef(null)
  lutRef.current = lut

  // part 2: atmospheric filter (static)
  const atmos = useMemo(() => atmosAttens(), [])
  const atmosLut = useMemo(() => buildFilteredLut(atmos), [atmos])
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
        <Spectrogram attens={attens} title="Spectrogram — your filter" />
      </SunSphere>

      <SunSphere
        title="Atmospheric Scattering"
        lutRef={atmosLutRef}
        note={
          <>
            The same sun, seen through Earth's atmosphere instead of your
            sliders. Ozone eats the ultraviolet, Rayleigh scattering
            steals the blue, water vapor bites the infrared — the filter
            below is the standard transmission curve, not a choice. The
            sphere yellows because the sky took the blue.
          </>
        }
      >
        <div className="graph-box">
          <div className="graph-title-row"><div className="graph-title">Atmospheric transmission</div></div>
          <AtmosFilterGraph />
          <p className="graph-note">
            Static filter: fraction transmitted at each wavelength.
            Ozone below ~340 nm, Rayleigh scattering through the blue,
            water vapor out in the infrared. This is what the atmosphere
            does to sunlight before it reaches you.
          </p>
        </div>
        <Spectrogram attens={atmos} title="Spectrogram — through air" />
      </SunSphere>
    </>
  )
}

function AtmosFilterGraph() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth, h = 160
      canvas.width = w * dpr; canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const padL = 34, padR = 14, padT = 12, padB = 24
      const iw = w - padL - padR, ih = h - padT - padB
      const L0 = 300, L1 = 1000
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      const Y = (t) => padT + ih - t * ih
      ctx.beginPath()
      for (let px = 0; px <= iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const t = atmosAtten(lamNm)
        if (px === 0) ctx.moveTo(X(lamNm), Y(t)); else ctx.lineTo(X(lamNm), Y(t))
      }
      ctx.strokeStyle = '#4a7fb5'
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.lineTo(X(L1), Y(0)); ctx.lineTo(X(L0), Y(0)); ctx.closePath()
      ctx.fillStyle = 'rgba(74,127,181,0.15)'
      ctx.fill()
      ctx.lineWidth = 1
      ctx.fillStyle = '#715f43'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'right'
      ctx.fillText('1.0', padL - 6, Y(1) + 3)
      ctx.fillText('0', padL - 6, Y(0) + 3)
      ctx.textAlign = 'center'
      ctx.fillText('wavelength →', padL + iw / 2, h - 6)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])
  return <canvas ref={ref} style={{ display: 'block', width: '100%', height: 160 }} />
}
