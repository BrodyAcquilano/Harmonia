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

// smooth attenuation at lamNm: cosine-interpolated between control points.
// outside the slider range (380-750 nm) there is no filter: returns 1.
function smoothAtten(lamNm, attens) {
  const pts = POINTS
  if (lamNm < 380 || lamNm > 750) return 1
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

const ATMOS_HIRES = [
  0.0365, 0.0425, 0.0497, 0.0581, 0.0679, 0.0792, 0.0920, 0.1064, 0.1222, 0.1394,
  0.1578, 0.1772, 0.1973, 0.2178, 0.2385, 0.2589, 0.2790, 0.2983, 0.3167, 0.3341,
  0.3503, 0.3653, 0.3792, 0.3918, 0.4033, 0.4138, 0.4233, 0.4319, 0.4398, 0.4469,
  0.4634, 0.4674, 0.4714, 0.4754, 0.4794, 0.4834, 0.4873, 0.4913, 0.4953, 0.4993,
  0.5033, 0.5073, 0.5112, 0.5152, 0.5192, 0.5233, 0.5273, 0.5313, 0.5353, 0.5393,
  0.5433, 0.5473, 0.5513, 0.5553, 0.5593, 0.5632, 0.5672, 0.5711, 0.5750, 0.5789,
  0.5827, 0.5865, 0.5903, 0.5941, 0.5978, 0.6015, 0.6051, 0.6087, 0.6123, 0.6158,
  0.6192, 0.6227, 0.6261, 0.6294, 0.6327, 0.6359, 0.6392, 0.6423, 0.6454, 0.6485,
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
  0.9715, 0.9717, 0.9719, 0.9717, 0.9686, 0.9514, 0.8865, 0.7321, 0.5168, 0.3501,
  0.2932, 0.3502, 0.5172, 0.7330, 0.8879, 0.9531, 0.9708, 0.9742, 0.9748, 0.9750,
  0.9752, 0.9753, 0.9755, 0.9756, 0.9758, 0.9759, 0.9761, 0.9762, 0.9764, 0.9765,
  0.9766, 0.9768, 0.9769, 0.9771, 0.9772, 0.9773, 0.9775, 0.9776, 0.9777, 0.9779,
  0.9780, 0.9781, 0.9782, 0.9783, 0.9784, 0.9785, 0.9786, 0.9786, 0.9785, 0.9782,
  0.9776, 0.9764, 0.9740, 0.9696, 0.9621, 0.9502, 0.9328, 0.9095, 0.8813, 0.8508,
  0.8211, 0.7957, 0.7767, 0.7648, 0.7587, 0.7560, 0.7535, 0.7491, 0.7417, 0.7314,
  0.7198, 0.7085, 0.6992, 0.6933, 0.6914, 0.6941, 0.7014, 0.7131, 0.7287, 0.7478,
  0.7694, 0.7927, 0.8168, 0.8408, 0.8638, 0.8852, 0.9045, 0.9213, 0.9356, 0.9473,
  0.9568, 0.9642, 0.9698, 0.9740, 0.9771, 0.9793, 0.9808, 0.9819, 0.9826, 0.9831,
  0.9834, 0.9837, 0.9838, 0.9840, 0.9841, 0.9842, 0.9843, 0.9843, 0.9844, 0.9845,
  0.9846, 0.9846, 0.9847, 0.9848, 0.9849, 0.9849, 0.9850, 0.9851, 0.9851, 0.9852,
  0.9853, 0.9853, 0.9854, 0.9855, 0.9855, 0.9856, 0.9857, 0.9857, 0.9858, 0.9859,
  0.9859, 0.9860, 0.9861, 0.9861, 0.9862, 0.9863, 0.9863, 0.9864, 0.9864, 0.9865,
  0.9866, 0.9866, 0.9867, 0.9867, 0.9868, 0.9869, 0.9869, 0.9870, 0.9870, 0.9871,
  0.9871, 0.9871, 0.9871, 0.9871, 0.9870, 0.9869, 0.9867, 0.9864, 0.9859, 0.9852,
  0.9842, 0.9827, 0.9805, 0.9773, 0.9727, 0.9660, 0.9566, 0.9438, 0.9267, 0.9047,
  0.8778, 0.8462, 0.8109, 0.7735, 0.7358, 0.6998, 0.6673, 0.6397, 0.6175, 0.6007,
  0.5889, 0.5810, 0.5759, 0.5723, 0.5690, 0.5653, 0.5610, 0.5560, 0.5508, 0.5460,
  0.5423, 0.5403, 0.5405, 0.5433, 0.5489, 0.5575, 0.5690, 0.5834, 0.6006, 0.6202,
  0.6419, 0.6655, 0.6904, 0.7161, 0.7423, 0.7684, 0.7939, 0.8184, 0.8415, 0.8630,
  0.8826, 0.9003, 0.9159, 0.9295, 0.9412, 0.9511, 0.9594, 0.9662, 0.9717, 0.9762,
  0.9797, 0.9824, 0.9846, 0.9862, 0.9875, 0.9884, 0.9891, 0.9896, 0.9900, 0.9903,
  0.9905, 0.9907, 0.9908, 0.9909, 0.9910, 0.9910, 0.9911, 0.9911, 0.9912, 0.9912,
  0.9912, 0.9913, 0.9913, 0.9914, 0.9914, 0.9914, 0.9915, 0.9915, 0.9915, 0.9916,
  0.9916, 0.9916, 0.9917, 0.9917, 0.9917, 0.9918, 0.9918, 0.9918, 0.9919, 0.9919,
  0.9919, 0.9920, 0.9920, 0.9920, 0.9921, 0.9921, 0.9921, 0.9922, 0.9922, 0.9922,
  0.9922, 0.9923, 0.9923, 0.9923, 0.9924, 0.9924, 0.9924, 0.9925, 0.9925, 0.9925,
  0.9925, 0.9926, 0.9926, 0.9926, 0.9927, 0.9927, 0.9927, 0.9927, 0.9928, 0.9928,
  0.9928, 0.9929, 0.9929, 0.9929, 0.9929, 0.9930, 0.9930, 0.9930, 0.9930, 0.9931,
  0.9931,
];
const ATMOS_L0 = 300, ATMOS_L1 = 1050;
function atmosTrans(lamNm) {
  const x = Math.min(ATMOS_L1-ATMOS_L0, Math.max(0, lamNm - ATMOS_L0));
  const i = Math.floor(x), f = x - i;
  const a = ATMOS_HIRES[i], b = ATMOS_HIRES[Math.min(ATMOS_HIRES.length-1, i+1)];
  return a + (b - a) * f;
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
      const L0 = 300, L1 = 1050, TK = 5778
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      // unattenuated peak: the curve is anchored to the full blackbody
      let rawPeak = 1e-30
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK)
        if (v > rawPeak) rawPeak = v
      }
      // curve values with filter applied
      const vals = []
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK) * smoothAtten(lamNm, attens)
        vals.push(v)
      }
      const Y = (v) => padT + ih - (v / rawPeak) * ih
      // filled area: spectral colors in the visible, dimmed markers
      // outside it — the filter only touches 380-750 nm
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const f = vals[px] / rawPeak
        const y = Y(vals[px])
        let rgb
        if (lamNm < 380) rgb = [120, 90, 170]
        else if (lamNm > 750) rgb = [120, 60, 50]
        else rgb = spectralRGB(lamNm)
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
      ctx.fillText('300 nm', X(300), padT + ih + 16)
      ctx.fillText('visible', X(565), padT + ih + 16)
      ctx.fillText('1050 nm', X(1050), padT + ih + 16)
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
      const L0 = 300, L1 = 1050, TK = 5778
      let rawPeak = 1e-30
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK)
        if (v > rawPeak) rawPeak = v
      }
      const vals = []
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK) * atmosTrans(lamNm)
        vals.push(v)
      }
      const Y = (v) => padT + ih - (v / rawPeak) * ih
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const f = vals[px] / rawPeak
        const y = Y(vals[px])
        let rgb
        if (lamNm < 380) rgb = [120, 90, 170]
        else if (lamNm > 750) rgb = [120, 60, 50]
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
      ctx.strokeStyle = 'rgba(107,90,62,0.5)'
      ctx.beginPath()
      ctx.moveTo(padL, padT + ih); ctx.lineTo(padL + iw, padT + ih)
      ctx.stroke()
      ctx.fillStyle = '#715f43'
      ctx.font = '10px "IBM Plex Mono", monospace'
      ctx.textAlign = 'center'
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      ctx.fillText('300 nm', X(300), padT + ih + 16)
      ctx.fillText('visible', X(565), padT + ih + 16)
      ctx.fillText('1050 nm', X(1050), padT + ih + 16)
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
        The 5778 K blackbody from 300 to 1050 nm with the actual clear-sky
        sea-level transmission applied — Rayleigh's λ⁻⁴ blue slope, the O₂
        notch at 690 nm, the H₂O dents at 720, 820 and 940 nm, ozone
        swallowing the UV. This is what the atmosphere does to sunlight
        before it reaches you.
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
              The 5778 K blackbody from 300 to 1050 nm with your filter
              applied — the dots are your EQ points, the curve stays
              smooth between them. Anchored to the unfiltered peak so you
              see how much light the filter removes. The visible band is
              filled with spectral colors dimmed where the curve runs low;
              blocked bands sink into gaps.
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

// false-color scale: dark red (coolest) -> orange -> yellow ->
// bright yellow (hottest, near-white). many stops for smooth gradation.
const FC_SCALE = [
  [80, 8, 0],     // dark red
  [140, 20, 0],
  [190, 45, 0],
  [225, 80, 0],   // red-orange
  [245, 120, 0],  // orange
  [252, 160, 10],
  [255, 195, 30], // yellow-orange
  [255, 220, 70], // yellow
  [255, 235, 120],
  [255, 245, 170],// bright yellow
  [255, 250, 215],// near-white yellow (hottest)
]

function fcScaleColor(t) {
  // t in [0,1]: 0 = coolest, 1 = hottest
  const x = Math.min(1, Math.max(0, t)) * (FC_SCALE.length - 1)
  const i = Math.min(FC_SCALE.length - 2, Math.floor(x))
  const f = x - i
  const a = FC_SCALE[i], b = FC_SCALE[i + 1]
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ]
}

function fcAtten(lamNm, attens) {
  const pts = FC_POINTS
  if (lamNm < 300 || lamNm > 750) return 1
  if (lamNm <= pts[0].lam) return attens[0]
  if (lamNm >= pts[pts.length - 1].lam) return attens[pts.length - 1]
  let i = 0
  while (i < pts.length - 2 && lamNm >= pts[i + 1].lam) i++
  const t = (lamNm - pts[i].lam) / (pts[i + 1].lam - pts[i].lam)
  const st = t * t * (3 - 2 * t)
  return attens[i] * (1 - st) + attens[i + 1] * st
}

// false-color: wavelength mapped by energy onto the thermal scale.
// UV (300 nm, highest energy) -> bright yellow; red (750 nm) -> dark red.
function falseColor(lamNm) {
  const t = (750 - lamNm) / (750 - 300) // 1 at 300 nm, 0 at 750 nm
  return fcScaleColor(t)
}

function buildFalseColorLut(attens) {
  const N = 256, lut = new Float32Array(N * 3)
  // sum the Planck-weighted false colors per temperature, normalized
  // per-T so hue carries the temperature: hot T weights the
  // bright-yellow (UV) end, cool T weights the dark-red end
  for (let i = 0; i < N; i++) {
    const T = (i / (N - 1)) * 8
    const TK = Math.max(0.05, T * BB_T_SCALE) * 11604.5
    let r = 0, g = 0, b = 0
    for (let j = 0; j < 40; j++) {
      const lamNm = 300 + (750 - 300) * j / 39
      const w = planck(lamNm * 1e-9, TK) * fcAtten(lamNm, attens)
      const [cr, cg, cb] = falseColor(lamNm)
      r += w * cr; g += w * cg; b += w * cb
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
  // false-color mapping bar below it: UV -> bright yellow, red -> dark red
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
          The thermometer sun in thermal-camera colors. Each wavelength
          is mapped by energy onto a dark-red to bright-yellow scale —
          UV burns bright yellow, red glows dark red — then the
          Planck-weighted sum is done on those false colors, with
          ultraviolet pushing the total past white ("higher white")
          before the final normalization. The EQ below filters actual
          wavelengths (UV shown as purple, though invisible).
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
          though invisible). Bottom bar: the false-color mapping — UV
          maps to bright yellow, red to dark red. Sliders move single
          points; the curve stays smooth. Filtering UV dims the hottest
          spots.
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
      const L0 = 300, L1 = 1050, TK = 5778
      const X = (l) => padL + ((l - L0) / (L1 - L0)) * iw
      let rawPeak = 1e-30
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK)
        if (v > rawPeak) rawPeak = v
      }
      const vals = []
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const v = planck(lamNm * 1e-9, TK) * fcAtten(lamNm, attens)
        vals.push(v)
      }
      const Y = (v) => padT + ih - (v / rawPeak) * ih
      for (let px = 0; px < iw; px++) {
        const lamNm = L0 + (L1 - L0) * px / iw
        const f = vals[px] / rawPeak
        const y = Y(vals[px])
        // actual colors here (UV purple), matching the EQ
        let rgb
        if (lamNm < 380) rgb = [150, 100, 220]
        else if (lamNm > 750) rgb = [120, 60, 50]
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
      ctx.fillText('visible', X(565), padT + ih + 16)
      ctx.fillText('1050 nm', X(1050), padT + ih + 16)
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
        The 5778 K blackbody from 300 to 1050 nm with your filter applied,
        in actual colors (UV as purple). The filter touches 300–750 nm;
        the infrared wing shows unfiltered. Blocked bands sink into smooth
        gaps; the sphere reads the false-color version.
      </p>
    </div>
  )
}
