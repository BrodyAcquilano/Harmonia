export default function Slider({ label, value, min, max, step, onChange, format }) {
  const fmt = format || ((v) => Number(v).toFixed(2))
  return (
    <label className={label ? 'slider-row' : 'slider-row no-label'}>
      {label ? <span className="slider-label">{label}</span> : null}
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
