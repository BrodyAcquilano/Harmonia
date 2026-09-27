import { useRef } from 'react'

/* Custom div-based slider: no native <input type="range">, so the yellow
   styling renders identically in every browser (no webkit/moz pseudo-elements). */
export default function Slider({ label, value, min, max, step, onChange, format }) {
  const fmt = format || ((v) => Number(v).toFixed(2))
  const trackRef = useRef(null)

  const clampValue = (v) => {
    const stepped = Math.round(v / step) * step
    // avoid floating-point dust like 0.30000000000000004
    const rounded = Math.round(stepped * 1e9) / 1e9
    return Math.min(max, Math.max(min, rounded))
  }

  const valueFromClientX = (clientX) => {
    const el = trackRef.current
    if (!el) return value
    const rect = el.getBoundingClientRect()
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return clampValue(min + frac * (max - min))
  }

  const handlePointerDown = (e) => {
    e.preventDefault()
    const el = trackRef.current
    if (!el) return
    try { el.setPointerCapture(e.pointerId) } catch (_) {}
    onChange(valueFromClientX(e.clientX))
    const move = (ev) => onChange(valueFromClientX(ev.clientX))
    const up = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
  }

  const handleKeyDown = (e) => {
    let v = null
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') v = clampValue(value + step)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') v = clampValue(value - step)
    else if (e.key === 'Home') v = min
    else if (e.key === 'End') v = max
    if (v !== null) { e.preventDefault(); onChange(v) }
  }

  const frac = max > min ? (value - min) / (max - min) : 0
  const pct = (frac * 100).toFixed(3)

  return (
    <div className={label ? 'slider-row' : 'slider-row no-label'}>
      {label ? <span className="slider-label">{label}</span> : null}
      <div
        ref={trackRef}
        className="yslider"
        role="slider"
        tabIndex={0}
        aria-label={label || 'slider'}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onPointerDown={handlePointerDown}
        onKeyDown={handleKeyDown}
      >
        <div className="yslider-track">
          <div className="yslider-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="yslider-handle" style={{ left: `${pct}%` }} />
      </div>
      <span className="slider-value">{fmt(value)}</span>
    </div>
  )
}
