export default function Slider({ label, value, min, max, step, onChange, format }) {
  const fmt = format || ((v) => Number(v).toFixed(2))
  return (
    <label className="slider-row">
      <span className="slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <span className="slider-value">{fmt(value)}</span>
    </label>
  )
}
