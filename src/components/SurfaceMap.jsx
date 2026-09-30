import { useEffect, useRef } from 'react'
import { surfU } from './ConvolutionSurface.jsx'

/* Flat projection of the convolution surface: half unfolding — the
   horizontal runs from −λ (left) through iλ (center) to +λ (right), the +λ
   half of the wave circle. The −λ half isn't shown: it's the 180°
   phase-shifted opposite (negation) of this half. τ2 runs vertically.
   Peaks are green, valleys are red — full color, since the gold arrow
   isn't drawn here. The τ1/τ2 controls move a yellow dot: the arrow's
   position on the map (|τ1| folds onto the half shown). */

const MAX_STATES = 320
const W = 360, H = 180

function colorFor(t) {
  // diverging scale: valley red -> warm neutral -> peak green
  let r, g, b
  if (t < 0.5) {
    const k = t / 0.5
    r = 200 + (240 - 200) * k
    g = 50 + (235 - 50) * k
    b = 40 + (210 - 40) * k
  } else {
    const k = (t - 0.5) / 0.5
    r = 240 + (30 - 240) * k
    g = 235 + (160 - 235) * k
    b = 210 + (80 - 210) * k
  }
  return [Math.round(r), Math.round(g), Math.round(b)]
}

export default function SurfaceMap({ entropy, tau1, tau2, waveAmp = 0.04 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    const N = Math.min(1 + Math.round(entropy * 3), MAX_STATES)

    const us = new Float32Array(W * H)
    let uMin = Infinity, uMax = -Infinity
    for (let iy = 0; iy < H; iy++) {
      const t2 = (0.5 - (iy + 0.5) / H) * Math.PI // τ2: +90° top .. -90° bottom
      for (let ix = 0; ix < W; ix++) {
        const t1 = Math.PI * (1 - (ix + 0.5) / W) // −λ at left .. +λ at right, iλ center
        const u = surfU(t1, waveAmp, N)
        us[iy * W + ix] = u
        if (u < uMin) uMin = u
        if (u > uMax) uMax = u
      }
    }

    const img = ctx.createImageData(W, H)
    const d = img.data
    const span = uMax - uMin || 1
    for (let i = 0; i < W * H; i++) {
      const t = (us[i] - uMin) / span
      const [r, g, b] = colorFor(t)
      d[i * 4] = r
      d[i * 4 + 1] = g
      d[i * 4 + 2] = b
      d[i * 4 + 3] = 255
    }
    ctx.putImageData(img, 0, 0)

    // yellow dot: the arrow's position, moved by τ1/τ2
    const dx = ((180 - Math.abs(tau1)) / 180) * W // |τ1| folds onto the half map
    const dy = ((90 - tau2) / 180) * H
    ctx.beginPath()
    ctx.arc(dx, dy, 7, 0, 2 * Math.PI)
    ctx.fillStyle = '#f2c230'
    ctx.fill()
    ctx.lineWidth = 2.5
    ctx.strokeStyle = '#3a3125'
    ctx.stroke()
  }, [entropy, tau1, tau2, waveAmp])

  return (
    <div>
      <canvas ref={canvasRef} className="surface-map-canvas" />
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px 0',
                    fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: '#715f43' }}>
        <span>−λ</span>
        <span>iλ</span>
        <span>λ</span>
      </div>
    </div>
  )
}
