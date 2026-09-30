import { useEffect, useRef } from 'react'
import { foldTheta, waveCoeffs, MAX_STATES } from './ConvolutionSurface.jsx'

/* Flat map of the +λ half of the convolution surface: the wave unfolded
   flat, like unraveling a globe — θ runs −λ (left) through iλ (center) to
   +λ (right), and each row rotates the wave by the τ2 phase (middle row
   τ2 = 0, −90° bottom to +90° top). The −λ half isn't shown: it's the 180°
   phase-shifted opposite.

   Each pixel is painted by which fundamental quark frequency it is most made
   of. The 14 quark states collapse to four magnitudes |q| = 1..4 (cos is
   even, so + and − are the same wave), and every eigenstate's 1/√k
   fractional weight accumulates into its fundamental's total C_f. At each
   point the four contributions C_f·cos(fθ) interfere; the pixel takes the
   color of the largest — blue 1/3 f_q, red 2/3 f_q, green 1 f_q,
   yellow 4/3 f_q — shaded toward white by the total wave amplitude.
   Eigenstates that never dominate a grid point never appear: with far more
   eigenstates than grid points, the map clusters them by dominant family.
   The yellow dot marks the arrow's (τ1, τ2) position (|τ1| folds onto the
   half shown). */

const W = 360, H = 180
// fundamental colors by |q| in units of f_q/3
const HUES = {
  1: [37, 99, 173],   // 1/3 f_q — blue
  2: [192, 57, 43],   // 2/3 f_q — red
  3: [46, 139, 110],  // 1 f_q — green
  4: [230, 184, 0],   // 4/3 f_q — yellow
}

export default function SurfaceMap({ entropy, tau1, tau2, waveAmp = 0.04 }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null) // cached wave image so the dot moves without recompute

  const drawDot = () => {
    const canvas = canvasRef.current
    if (!canvas || !imgRef.current) return
    const ctx = canvas.getContext('2d')
    ctx.putImageData(imgRef.current, 0, 0)
    // yellow dot: the arrow's (τ1, τ2) position on the map
    const dx = ((180 - Math.abs(tau1)) / 180) * W // |τ1| folds onto the half map
    const dy = ((90 - tau2) / 180) * H
    ctx.beginPath()
    ctx.arc(dx, dy, 7, 0, 2 * Math.PI)
    ctx.fillStyle = '#f2c230'
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#3a3125'
    ctx.stroke()
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    const N = Math.min(1 + Math.round(entropy / 50), MAX_STATES)
    const C = waveCoeffs(N, waveAmp) // the four fundamental totals, one O(N) pass

    // θ × τ2 phase map: each row rotates the wave pattern by the phase φ.
    // Per grid point over the folded half: the total wave and which
    // fundamental contributes most. 1441 grid points vs 64800 pixels — each
    // grid point's dominant family colors a whole cluster of pixels.
    const G = 1440
    const gridF = new Uint8Array(G + 1)
    const gridW = new Float32Array(G + 1)
    let wMax = 0
    for (let g = 0; g <= G; g++) {
      const th = -Math.PI / 2 + (g / G) * Math.PI
      const c1 = C[1] * Math.cos(th)
      const c2 = C[2] * Math.cos(2 * th)
      const c3 = C[3] * Math.cos(3 * th)
      const c4 = C[4] * Math.cos(4 * th)
      const w = c1 + c2 + c3 + c4
      gridW[g] = w
      const aw = Math.abs(w)
      if (aw > wMax) wMax = aw
      let f = 1, best = Math.abs(c1)
      if (Math.abs(c2) > best) { f = 2; best = Math.abs(c2) }
      if (Math.abs(c3) > best) { f = 3; best = Math.abs(c3) }
      if (Math.abs(c4) > best) { f = 4 }
      gridF[g] = f
    }

    const img = ctx.createImageData(W, H)
    const d = img.data
    const wScale = wMax || 1
    for (let iy = 0; iy < H; iy++) {
      const phi = (0.5 - (iy + 0.5) / H) * Math.PI // τ2 phase: +90° top .. −90° bottom
      for (let ix = 0; ix < W; ix++) {
        const t1 = Math.PI * (1 - (ix + 0.5) / W) // −λ at left .. +λ at right, iλ center
        const ft = foldTheta(t1 - phi)
        const g0 = Math.max(0, Math.min(G, Math.round(((ft[0] + Math.PI / 2) / Math.PI) * G)))
        const hue = HUES[gridF[g0]]
        // brightness follows the wave amplitude — weak wave fades toward white
        const b = 0.25 + 0.75 * Math.min(1, Math.abs(gridW[g0]) / wScale)
        const o = (iy * W + ix) * 4
        d[o] = Math.round(255 - (255 - hue[0]) * b)
        d[o + 1] = Math.round(255 - (255 - hue[1]) * b)
        d[o + 2] = Math.round(255 - (255 - hue[2]) * b)
        d[o + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
    imgRef.current = img
    drawDot()
  }, [entropy, waveAmp])

  useEffect(() => {
    drawDot() // τ1/τ2 only move the dot — no wave recompute
  }, [tau1, tau2])

  const label = { fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: '#715f43' }
  const legend = [
    [1, '#2563ad', '1/3 f_q'],
    [2, '#c0392b', '2/3 f_q'],
    [3, '#2e8b6e', '1 f_q'],
    [4, '#e6b800', '4/3 f_q'],
  ]
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <div style={{ ...label, display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between', textAlign: 'right', padding: '0 0 20px' }}>
        <span>+90°</span>
        <span>τ2</span>
        <span>−90°</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <canvas ref={canvasRef} className="surface-map-canvas" />
        <div style={{ ...label, display: 'flex', justifyContent: 'space-between', padding: '2px 6px 0' }}>
          <span>−λ</span>
          <span>iλ</span>
          <span>λ</span>
        </div>
        <div style={{ ...label, display: 'flex', gap: 14, flexWrap: 'wrap', padding: '8px 6px 0' }}>
          {legend.map(([f, color, text]) => (
            <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 11, height: 11, borderRadius: 2, background: color,
                             display: 'inline-block' }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
