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

// atmospheric LUT: uses the high-res transmission directly, not control points
function buildAtmosLut() {
  const N = 256, lut = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const T = (i / (N - 1)) * 8
    const TK = Math.max(0.05, T * BB_T_SCALE) * 11604.5
    let r = 0, g = 0, b = 0
    for (let j = 0; j < 48; j++) {
      const lamNm = 380 + (750 - 380) * j / 47
      const atten = atmosTrans(lamNm)
      const Bl = planck(lamNm * 1e-9, TK)
      const [cr, cg, cb] = spectralRGB(lamNm)
      r += Bl * cr * atten; g += Bl * cg * atten; b += Bl * cb * atten
    }
    const m = Math.max(r, g, b, 1e-30)
    lut[i * 3] = r / m * 255; lut[i * 3 + 1] = g / m * 255; lut[i * 3 + 2] = b / m * 255
  }
  return lut
}

// clear-sky vertical transmission at sea level, 1 nm steps, 380-750 nm.
// Rayleigh (lambda^-4) + O3 Chappuis/Huggins + O2 B-band (690) and A-band wing
// + H2O (720) + NO2. computed from standard band parameters, not interpolated.
const ATMOS_HIRES = [
  0.6516, 0.6546, 0.6575, 0.6605, 0.6634, 0.6662, 0.6690, 0.6718, 0.6746, 0.6773,
  0.6800, 0.6826, 0.6852, 0.6878, 0.6904, 0.6929, 0.6954, 0.6979, 0.7004, 0.7028,
  0.7052, 0.7076, 0.7099, 0.7122, 0.7145, 0.7168, 0.7191, 0.7213, 0.7235, 0.7257,
  0.7278, 0.7300, 0.7321, 0.7342, 0.7363, 0.7383, 0.7404, 0.7424, 0.7444, 0.7464,
  0.7483, 0.7502, 0.7522, 0.7541, 0.7559, 0.7578, 0.7597, 0.7615, 0.7633, 0.7651,
  0.7669, 0.7686, 0.7704, 0.7721, 0.7738, 0.7755, 0.7772, 0.7789, 0.7805, 0.7822,
  0.7838, 0.7854, 0.7870, 0.7886, 0.7902, 0.7917, 0.7933, 0.7948, 0.7963, 0.7978,
  0.7993, 0.8008, 0.8023, 0.8037, 0.8052, 0.8066, 0.8080, 0.8094, 0.8108, 0.8122,
  0.8136, 0.8149, 0.8163, 0.8176, 0.8189, 0.8202, 0.8215, 0.8228, 0.8241, 0.8253,
  0.8266, 0.8278, 0.8291, 0.8303, 0.8315, 0.8327, 0.8339, 0.8350, 0.8362, 0.8373,
  0.8385, 0.8396, 0.8407, 0.8418, 0.8429, 0.8440, 0.8450, 0.8461, 0.8471, 0.8481,
  0.8491, 0.8501, 0.8511, 0.8521, 0.8531, 0.8540, 0.8550, 0.8559, 0.8568, 0.8577,
  0.8586, 0.8595, 0.8603, 0.8612, 0.8620, 0.8628, 0.8636, 0.8645, 0.8652, 0.8660,
  0.8668, 0.8675, 0.8683, 0.8690, 0.8697, 0.8704, 0.8711, 0.8718, 0.8725, 0.8732,
  0.8738, 0.8745, 0.8751, 0.8757, 0.8763, 0.8769, 0.8775, 0.8781, 0.8786, 0.8792,
  0.8798, 0.8803, 0.8808, 0.8814, 0.8819, 0.8824, 0.8829, 0.8834, 0.8838, 0.8843,
  0.8848, 0.8852, 0.8857, 0.8861, 0.8866, 0.8870, 0.8875, 0.8879, 0.8883, 0.8887,
  0.8891, 0.8895, 0.8899, 0.8903, 0.8907, 0.8911, 0.8915, 0.8918, 0.8922, 0.8926,
  0.8930, 0.8933, 0.8937, 0.8941, 0.8944, 0.8948, 0.8951, 0.8955, 0.8958, 0.8962,
  0.8966, 0.8969, 0.8973, 0.8976, 0.8980, 0.8983, 0.8987, 0.8990, 0.8994, 0.8997,
  0.9001, 0.9005, 0.9008, 0.9012, 0.9016, 0.9019, 0.9023, 0.9027, 0.9030, 0.9034,
  0.9038, 0.9042, 0.9046, 0.9049, 0.9053, 0.9057, 0.9061, 0.9065, 0.9069, 0.9073,
  0.9077, 0.9081, 0.9086, 0.9090, 0.9094, 0.9098, 0.9103, 0.9107, 0.9111, 0.9116,
  0.9120, 0.9125, 0.9129, 0.9134, 0.9138, 0.9143, 0.9148, 0.9152, 0.9157, 0.9162,
  0.9166, 0.9171, 0.9176, 0.9181, 0.9186, 0.9191, 0.9196, 0.9201, 0.9206, 0.9211,
  0.9216, 0.9221, 0.9226, 0.9231, 0.9236, 0.9242, 0.9247, 0.9252, 0.9257, 0.9262,
  0.9268, 0.9273, 0.9278, 0.9283, 0.9286, 0.9288, 0.9285, 0.9276, 0.9259, 0.9236,
  0.9213, 0.9196, 0.9193, 0.9206, 0.9234, 0.9268, 0.9301, 0.9329, 0.9349, 0.9362,
  0.9372, 0.9378, 0.9384, 0.9390, 0.9395, 0.9400, 0.9406, 0.9411, 0.9416, 0.9421,
  0.9426, 0.9431, 0.9436, 0.9441, 0.9446, 0.9451, 0.9456, 0.9461, 0.9466, 0.9471,
  0.9476, 0.9481, 0.9485, 0.9490, 0.9495, 0.9498, 0.9480, 0.9304, 0.8592, 0.7360,
  0.6710, 0.7367, 0.8608, 0.9330, 0.9516, 0.9543, 0.9548, 0.9552, 0.9557, 0.9561,
  0.9565, 0.9569, 0.9573, 0.9577, 0.9581, 0.9584, 0.9588, 0.9592, 0.9594, 0.9595,
  0.9587, 0.9560, 0.9492, 0.9365, 0.9185, 0.9003, 0.8881, 0.8847, 0.8867, 0.8875,
  0.8833, 0.8747, 0.8652, 0.8581, 0.8558, 0.8589, 0.8672, 0.8796, 0.8946, 0.9102,
  0.9249, 0.9376, 0.9478, 0.9553, 0.9605, 0.9640, 0.9661, 0.9675, 0.9683, 0.9688,
  0.9692, 0.9695, 0.9697, 0.9700, 0.9702, 0.9704, 0.9706, 0.9709, 0.9711, 0.9713,
  0.9715,
]
function atmosTrans(lamNm) {
  const x = Math.min(370, Math.max(0, lamNm - 380))
  const i = Math.floor(x), f = x - i
  const a = ATMOS_HIRES[i], b = ATMOS_HIRES[Math.min(370, i + 1)]
  return a + (b - a) * f
}

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

// the actual sea-level transmission curve, drawn at 1 nm resolution —
// not an interpolation of sparse points. the O2 notch at 690 nm and the
// H2O dent at 720 nm are real structure.
function AtmosCurve() {
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
      const vals = []
      let peak = 1e-30
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK) * atmosTrans(lamNm)
        vals.push(v)
        if (v > peak) peak = v
      }
      const Y = (v) => padT + ih - (v / peak) * ih
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const f = vals[px] / peak
        const y = Y(vals[px])
        const rgb = spectralRGB(lamNm)
        ctx.fillStyle = `rgb(${Math.round(rgb[0] * f)},${Math.round(rgb[1] * f)},${Math.round(rgb[2] * f)})`
        ctx.fillRect(padL + px, y, 1, padT + ih - y)
      }
      ctx.beginPath()
      for (let px = 0; px < iw; px++) {
        const x = padL + px, y = Y(vals[px])
        if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(58,49,37,0.85)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, padT + ih); ctx.lineTo(padL + iw, padT + ih)
      ctx.stroke()
      ctx.fillStyle = '#715f43'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'center'
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      ctx.fillText('380 nm', X(380), padT + ih + 16)
      ctx.fillText('565 nm', X(565), padT + ih + 16)
      ctx.fillText('750 nm', X(750), padT + ih + 16)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])
  return (
    <div className="graph-box">
      <div className="graph-title-row"><div className="graph-title">Atmospheric transmission curve</div></div>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: 240 }} />
      <p className="graph-note">
        The actual clear-sky sea-level transmission at 1 nm resolution —
        Rayleigh's λ⁻⁴ blue slope, the O₂ notch at 690 nm, the H₂O dent
        at 720 nm. This is what the atmosphere does to sunlight before it
        reaches you.
      </p>
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

  const atmosLut = useMemo(() => buildAtmosLut(), [])
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
        <AtmosCurve />
      </SunSphere>

      <FalseColorSection />
    </>
  )
}

// ---------------------------------------------------------------------------
// False Color + UV: the visible spectrum is shifted down (compressed toward
// the red) to make room at the top, and ultraviolet is mapped to
// purples-to-white — "hotter than white," NASA-style. the EQ filters the
// actual wavelengths (UV shown as purple, though invisible); the sphere
// displays the false-color assignment.

const FC_POINTS = [
  { lam: 300, label: '300' },
  { lam: 340, label: '340' },
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

function falseColor(lamNm) {
  if (lamNm >= 380) {
    // visible, compressed toward the red end: 750 nm stays red,
    // 380 nm lands on blue (not violet) — room left at the top for UV
    const x = ((750 - lamNm) / (750 - 380)) * 0.62
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
  // ultraviolet: purple at 380 nm rising to white at 300 nm — hotter than white
  const t = (380 - lamNm) / 80
  return [
    160 + (255 - 160) * t,
    90 + (255 - 90) * t,
    230 + (255 - 230) * t,
  ]
}

function fcAtten(lamNm, attens) {
  const pts = FC_POINTS
  if (lamNm <= pts[0].lam) return attens[0]
  if (lamNm >= pts[pts.length - 1].lam) return attens[pts.length - 1]
  let i = 0
  while (i < pts.length - 2 && lamNm >= pts[i + 1].lam) i++
  const t = (lamNm - pts[i].lam) / (pts[i + 1].lam - pts[i].lam)
  const st = t * t * (3 - 2 * t)
  return attens[i] * (1 - st) + attens[i + 1] * st
}

function buildFalseColorLut(attens) {
  const N = 256, lut = new Float32Array(N * 3)
  for (let i = 0; i < N; i++) {
    const T = (i / (N - 1)) * 8
    const TK = Math.max(0.05, T * BB_T_SCALE) * 11604.5
    let r = 0, g = 0, b = 0
    for (let j = 0; j < 32; j++) {
      const lamNm = 300 + (750 - 300) * j / 31
      const atten = fcAtten(lamNm, attens)
      if (atten <= 0) continue
      const Bl = planck(lamNm * 1e-9, TK)
      const [cr, cg, cb] = falseColor(lamNm)
      r += Bl * cr * atten; g += Bl * cg * atten; b += Bl * cb * atten
    }
    const m = Math.max(r, g, b, 1e-30)
    lut[i * 3] = r / m * 255; lut[i * 3 + 1] = g / m * 255; lut[i * 3 + 2] = b / m * 255
  }
  return lut
}

function FalseColorSection() {
  const [attens, setAttens] = useState(() => FC_POINTS.map(() => 1))
  const lut = useMemo(() => buildFalseColorLut(attens), [attens])
  const lutRef = useRef(null)
  lutRef.current = lut

  const set = (i, v) => {
    const next = attens.slice()
    next[i] = v / 100
    setAttens(next)
  }
  const reset = () => setAttens(attens.map(() => 1))

  // actual-spectrum gradient (UV as purple, though invisible) and the
  // false-color assignment bar below it
  const actualStops = []
  const falseStops = []
  for (let j = 0; j <= 16; j++) {
    const lam = 300 + (750 - 300) * j / 16
    const pct = (j / 16) * 100
    let actual
    if (lam < 380) actual = [150, 100, 220]
    else actual = spectralRGB(lam)
    actualStops.push(`rgb(${actual.map(Math.round).join(',')}) ${pct}%`)
    const fc = falseColor(lam)
    falseStops.push(`rgb(${fc.map(Math.round).join(',')}) ${pct}%`)
  }

  return (
    <SunSphere
      title="False Color + UV"
      lutRef={lutRef}
      note={
        <>
          The thermometer sun in NASA colors. Ultraviolet (300–380 nm)
          joins the spectrum, mapped to purples rising to white — hotter
          than white — while the visible band is shifted down toward the
          red to make room. The brightest spots burn purple-white where
          the UV lives. The EQ below filters actual wavelengths (UV shown
          as purple, though invisible); the sphere shows the false-color
          assignment.
        </>
      }
    >
      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Filter EQ — with UV</div>
          <button className="graph-reset" onClick={reset}>reset</button>
        </div>
        <div style={{ position: 'relative', height: 200, margin: '4px 8px 0' }}>
          {FC_POINTS.map((pt, i) => {
            const leftPct = ((pt.lam - 300) / (750 - 300)) * 100
            const actual = pt.lam < 380 ? [150, 100, 220] : spectralRGB(pt.lam)
            const col = `rgb(${actual.map(Math.round).join(',')})`
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
                  style={{ writingMode: 'vertical-lr', direction: 'rtl', width: 22, height: 90, accentColor: col }}
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
              position: 'absolute', left: 0, right: 0, bottom: 22, height: 14,
              background: `linear-gradient(to right, ${actualStops.join(', ')})`,
              borderRadius: 3, border: '1px solid rgba(107,90,62,0.35)',
            }}
          />
          <div
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 0, height: 14,
              background: `linear-gradient(to right, ${falseStops.join(', ')})`,
              borderRadius: 3, border: '1px solid rgba(107,90,62,0.35)',
            }}
          />
        </div>
        <p className="graph-note">
          Top bar: the actual spectrum you're filtering (UV as purple,
          though invisible). Bottom bar: the false-color assignment the
          sphere displays. Sliders move single points; the curve stays
          smooth. Filtering UV dims the purple-white hot spots.
        </p>
      </div>
      <FilterCurveFC attens={attens} />
    </SunSphere>
  )
}

function FilterCurveFC({ attens }) {
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
      const L0 = 300, L1 = 750, TK = 5778
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      const vals = []
      let peak = 1e-30
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK) * fcAtten(lamNm, attens)
        vals.push(v)
        if (v > peak) peak = v
      }
      const Y = (v) => padT + ih - (v / peak) * ih
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const f = vals[px] / peak
        const y = Y(vals[px])
        // actual colors here (UV purple), matching the EQ
        let rgb
        if (lamNm < 380) rgb = [150, 100, 220]
        else rgb = spectralRGB(lamNm)
        ctx.fillStyle = `rgb(${Math.round(rgb[0] * f)},${Math.round(rgb[1] * f)},${Math.round(rgb[2] * f)})`
        ctx.fillRect(padL + px, y, 1, padT + ih - y)
      }
      ctx.beginPath()
      for (let px = 0; px < iw; px++) {
        const x = padL + px, y = Y(vals[px])
        if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(58,49,37,0.85)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.lineWidth = 1
      ctx.fillStyle = '#3a3125'
      for (let i = 0; i < FC_POINTS.length; i++) {
        const lamNm = FC_POINTS[i].lam
        const v = planck(lamNm * 1e-9, TK) * attens[i]
        ctx.beginPath()
        ctx.arc(X(lamNm), Y(v), 3.5, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, padT + ih); ctx.lineTo(padL + iw, padT + ih)
      ctx.stroke()
      ctx.fillStyle = '#715f43'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('300 nm', X(300), padT + ih + 16)
      ctx.fillText('525 nm', X(525), padT + ih + 16)
      ctx.fillText('750 nm', X(750), padT + ih + 16)
    }
    draw()
    const ro = new ResizeObserver(draw)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [attens])
  return (
    <div className="graph-box">
      <div className="graph-title-row"><div className="graph-title">Filter curve — with UV</div></div>
      <canvas ref={ref} style={{ display: 'block', width: '100%', height: 240 }} />
      <p className="graph-note">
        The baseline 5778 K blackbody from 300 to 750 nm with your filter
        applied, in actual colors (UV as purple). Blocked bands sink into
        smooth gaps; the sphere reads the false-color version.
      </p>
    </div>
  )
}
