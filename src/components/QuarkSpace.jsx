import { useState } from 'react'
import Slider from './Slider.jsx'
import ConvolutionSphere from './ConvolutionSphere.jsx'

/* The Quark Space: a new page for simulations that are not wave-lab graphs.
   First simulation: the convolution sphere (the 4th dimension, §§8–10).
   Mass and energy ride the sphere like longitude (−180°…180°) and latitude
   (−90°…90°), compactified by tan to (−∞, ∞) — the relativistic mapping.
   The axes are the wavelengths λx λy λz. Derived quantities in natural
   units c = ħ = 1. */

const D2R = Math.PI / 180
const mapMass = (deg) =>
  Math.abs(deg) > 179.5 ? Math.sign(deg || 1) * Infinity : Math.tan((deg * D2R) / 2)
const mapEnergy = (deg) =>
  Math.abs(deg) > 89.5 ? (deg >= 0 ? Infinity : -Infinity) : Math.tan(deg * D2R)

function fmt(v, digits = 4) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—'
  if (!isFinite(v)) return v > 0 ? '+∞' : '−∞'
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1e9 || a < 1e-4) return v.toExponential(2)
  return String(Number(v.toPrecision(digits)))
}

function Row({ k, v, unit }) {
  return (
    <div className="readout-row">
      <span className="readout-key">{k}</span>
      <span className="readout-val">{v}{unit ? <span className="readout-unit"> {unit}</span> : null}</span>
    </div>
  )
}

export default function QuarkSpace() {
  const [entropy, setEntropy] = useState(0.6)
  const [massDeg, setMassDeg] = useState(45)
  const [energyDeg, setEnergyDeg] = useState(30)

  const R = Math.max(entropy, 0)
  const th = massDeg * D2R, ph = energyDeg * D2R
  const lx = R * Math.cos(ph) * Math.cos(th)
  const ly = R * Math.sin(ph)
  const lz = R * Math.cos(ph) * Math.sin(th)
  const m = mapMass(massDeg)
  const E = mapEnergy(energyDeg)
  const nStates = R <= 0 ? 1 : 1 + Math.round(entropy * 299)
  const volume = (4 / 3) * Math.PI * R ** 3
  const area = 4 * Math.PI * R ** 2

  // natural units c = ħ = 1: E = ħω, p² = E² − m²
  const omega = Math.abs(E)
  const nu = omega / (2 * Math.PI)
  const k = R > 0 ? (2 * Math.PI) / R : NaN
  const vPhase = R > 0 && isFinite(k) && k !== 0 ? omega / k : NaN
  let vPart = NaN, gamma = NaN, regime = '—'
  if (isFinite(E) && isFinite(m)) {
    if (E === 0 && m === 0) regime = 'undefined (0/0)'
    else {
      const p2 = E * E - m * m
      if (p2 > 0) {
        vPart = Math.sqrt(p2) / E
        gamma = m !== 0 ? Math.abs(E / m) : Infinity
        regime = 'timelike'
      } else if (p2 === 0) {
        vPart = 0; gamma = 1; regime = 'at rest'
      } else regime = 'spacelike — v imaginary'
    }
  } else regime = 'at a pole (∞)'

  return (
    <div className="lab-layout">
      <nav className="sim-nav" aria-label="Simulations">
        <h3>Simulations</h3>
        <div className="sim-list" role="tablist" aria-label="Simulations">
          <button className="sim-item active" role="tab" aria-selected="true">
            Convolution Sphere
          </button>
        </div>
      </nav>

      <div className="lab-stage">
        <div className="graph-box">
          <div className="graph-title-row">
            <h2 className="graph-title">Convolution Sphere</h2>
          </div>
          <ConvolutionSphere entropy={entropy} massDeg={massDeg} energyDeg={energyDeg} />
          <p className="graph-note">
            Each surface point is an eigenstate; the gold arrow is the selected eigenvector.
            Entropy grows the sphere from a point — new eigenstates come from expansion.
          </p>
        </div>
      </div>

      <div className="lab-controls">
        <div className="control-group">
          <h3>Entropy</h3>
          <Slider label="s" value={entropy} min={0} max={1} step={0.01}
            onChange={setEntropy} format={(v) => v.toFixed(2)} />
          <p className="graph-note">0 is a single point; 1 fills the view.</p>
        </div>

        <div className="control-group">
          <h3>Mass — longitude</h3>
          <Slider label="θ" value={massDeg} min={-180} max={180} step={1}
            onChange={setMassDeg} format={(v) => `${v.toFixed(0)}°`} />
          <div className="readout-row">
            <span className="readout-key">m = tan(θ/2)</span>
            <span className="readout-val">{fmt(m)}</span>
          </div>
        </div>

        <div className="control-group">
          <h3>Energy — latitude</h3>
          <Slider label="φ" value={energyDeg} min={-90} max={90} step={1}
            onChange={setEnergyDeg} format={(v) => `${v.toFixed(0)}°`} />
          <div className="readout-row">
            <span className="readout-key">E = tan(φ)</span>
            <span className="readout-val">{fmt(E)}</span>
          </div>
        </div>

        <div className="control-group">
          <h3>Eigenvector — wavelengths</h3>
          <div className="readouts">
            <Row k="λx" v={fmt(lx)} />
            <Row k="λy" v={fmt(ly)} />
            <Row k="λz" v={fmt(lz)} />
            <Row k="|λ|" v={fmt(R)} />
          </div>
        </div>

        <div className="control-group">
          <h3>Sphere</h3>
          <div className="readouts">
            <Row k="eigenstates" v={String(nStates)} />
            <Row k="volume" v={fmt(volume)} />
            <Row k="surface area" v={fmt(area)} />
          </div>
        </div>

        <div className="control-group">
          <h3>Derived — natural units</h3>
          <div className="readouts">
            <Row k="ω = |E|" v={fmt(omega)} />
            <Row k="ν = ω/2π" v={fmt(nu)} />
            <Row k="k = 2π/|λ|" v={fmt(k)} />
            <Row k="v phase" v={fmt(vPhase)} />
            <Row k="v particle" v={fmt(vPart)} />
            <Row k="γ" v={fmt(gamma)} />
            <Row k="regime" v={regime} />
          </div>
          <p className="graph-note">c = ħ = 1. Sliders compactify by tan to (−∞, ∞).</p>
        </div>
      </div>
    </div>
  )
}
