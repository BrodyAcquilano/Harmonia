import { useEffect, useRef } from 'react'
import { foldTheta, waveSum, MAX_STATES } from './ConvolutionSurface.jsx'

/* Flat map of the convolution surface: θ × τ2 phase, like unraveling the
   globe. The horizontal runs from −λ (left) through iλ (center) to +λ
   (right), the +λ half of the wave circle (the −λ half isn't shown: it's
   the 180° phase-shifted opposite). Each row rotates the wave pattern by
   the τ2 phase — the middle row (τ2 = 0) is the base wave, rows run from
   −90° (bottom) to +90° (top). Peaks are green, valleys are red. The
   yellow dot marks the arrow's (τ1, τ2) position (|τ1| folds onto the half
   shown). */

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

    // θ × τ2 phase map: each row rotates the wave pattern by the phase φ.
    // The wave is precomputed once on a dense grid over the folded half and
    // sampled per pixel — far cheaper than N cosines per pixel.
    const G = 1440
    const grid = new Float32Array(G + 1)
    for (let g = 0; g <= G; g++)
      grid[g] = waveSum(-Math.PI / 2 + (g / G) * Math.PI, waveAmp, N)
    const us = new Float32Array(W * H)
    let uMin = Infinity, uMax = -Infinity
    for (let iy = 0; iy < H; iy++) {
      const phi = (0.5 - (iy + 0.5) / H) * Math.PI // τ2 phase: +90° top .. −90° bottom
      for (let ix = 0; ix < W; ix++) {
        const t1 = Math.PI * (1 - (ix + 0.5) / W) // −λ at left .. +λ at right, iλ center
        const ft = foldTheta(t1 - phi)
        const gf = ((ft[0] + Math.PI / 2) / Math.PI) * G
        const g0 = Math.floor(gf), fr = gf - g0
        const w = grid[g0] * (1 - fr) + grid[g0 + 1 > G ? G : g0 + 1] * fr
        const u = Math.max(1 + ft[1] * w, 0.05)
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
    imgRef.current = img
    drawDot()
  }, [entropy, waveAmp])

  useEffect(() => {
    drawDot() // τ1/τ2 only move the dot — no wave recompute
  }, [tau1, tau2])

  const label = { fontFamily: '"IBM Plex Mono", monospace', fontSize: 12, color: '#715f43' }
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
      </div>
    </div>
  )
}
