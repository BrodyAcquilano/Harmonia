import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import ConvolutionSphere from './ConvolutionSphere.jsx'

/* The Quark Space: a convolution of mass and energy and space and time.
   The convolution sphere carries energy and mass on its surface — energy is
   just mass 180° phase shifted. λx λy λz give the direction of each
   eigenstate; τ1 τ2 are the sphere's time coordinates, related to λ: they
   select the point, while the sphere's amplitude at that point sets its
   energy and mass. Entropy grows the sphere from a point — higher entropy,
   more eigenstates. */

const D2R = Math.PI / 180

function Tex({ tex }) {
  const html = katex.renderToString(tex, { throwOnError: false })
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

function fmt(v, digits = 4) {
  if (typeof v !== 'number' || Number.isNaN(v)) return '—'
  if (!isFinite(v)) return v > 0 ? '+∞' : '−∞'
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1e9 || a < 1e-4) return v.toExponential(2)
  return String(Number(v.toPrecision(digits)))
}

function Row({ k, v }) {
  return (
    <div className="readout-row">
      <span className="readout-key">{k}</span>
      <span className="readout-val">{v}</span>
    </div>
  )
}

export default function QuarkSpace() {
  const [entropy, setEntropy] = useState(0.6)
  const [tau1, setTau1] = useState(45)
  const [tau2, setTau2] = useState(30)

  // Sphere mapping (the visualization model): amplitude A = R = s (uniform
  // for now). Energy is carried as amplitude; mass is its inverse — the 180°
  // phase-shifted partner — so E · m = 1 at every surface point.
  const R = Math.max(entropy, 0)
  const A = R
  const E = A
  const m = R > 0 ? 1 / R : Infinity

  const t1 = tau1 * D2R, t2 = tau2 * D2R
  const lx = R * Math.cos(t2) * Math.cos(t1)
  const ly = R * Math.sin(t2)
  const lz = R * Math.cos(t2) * Math.sin(t1)

  const nStates = R <= 0 ? 1 : 1 + Math.round(entropy * 299)
  const volume = (4 / 3) * Math.PI * R ** 3
  const area = 4 * Math.PI * R ** 2

  // natural units c = h = 1: f = c/|λ| from the wavelength at the point
  const f = R > 0 ? 1 / R : NaN
  const omega = 2 * Math.PI * f
  const k = R > 0 ? (2 * Math.PI) / R : NaN
  const vPhase = 1 // ω/k = c

  return (
    <div className="quark-page">
      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">The Quark Space</h2>
        </div>
        <div className="quark-intro-body">
          <p>
            The quark space is a convolution of energy and mass — where energy is
            just mass 180° phase shifted. It is a convolution of mass and energy
            and space and time, relating all motion to the vibrations caused from
            quarks, which release or absorb light energy. That light interacts with
            mass and creates gravitational waves — motion.
          </p>
          <p>
            Each point of the convolution sphere is an eigenstate. λx, λy, λz give
            its direction; τ1 and τ2 are the sphere's time coordinates — related to
            λ, they select the point, while the sphere's amplitude at that point
            sets its energy and mass. Entropy grows the sphere from a single point:
            higher entropy, more eigenstates.
          </p>
          <p>
            The big bang was not the moment all matter was a single point — it was
            when all matter operated on the same 1:1 mass-to-energy ratio and
            vibrated at the same frequency, before quarks were created. All motion
            since is the adding of new frequencies: new eigenstates built on the
            same 2/3 building block, each time a quark is absorbed or released.
          </p>
          <p>
            That release creates a disproportion between energy and mass — −1/3 mass
            to 1 energy, or 2/3 mass to 1 energy — and every combination of these
            still resolves to 2/3: 2/3 + 2/3 = 4/3 = 1 + 1/3 = 2 − 2/3. All
            frequencies share this same harmonic ratio, and infinitely many
            frequencies can be added from it. Adding new frequencies increases the
            number of eigenstates — which is why entropy increases.
          </p>
        </div>
      </div>

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
            <ConvolutionSphere entropy={entropy} tau1={tau1} tau2={tau2} />
            <p className="graph-note">
              τ1 and τ2 select the point — λ gives direction, τ gives the time
              coordinate. Energy and mass are read from the amplitude at that point
              (uniform for now).
            </p>
          </div>
        </div>

        <div className="lab-side">
        <div className="lab-controls">
          <div className="control-group">
            <h3>Entropy</h3>
            <Slider label="s" value={entropy} min={0} max={1} step={0.01}
              onChange={setEntropy} format={(v) => v.toFixed(2)} />
            <p className="graph-note">Higher entropy, more eigenstates.</p>
          </div>

          <div className="control-group">
            <h3>τ1 — time longitude</h3>
            <Slider label="τ1" value={tau1} min={-180} max={180} step={1}
              onChange={setTau1} format={(v) => `${v.toFixed(0)}°`} />
          </div>

          <div className="control-group">
            <h3>τ2 — time latitude</h3>
            <Slider label="τ2" value={tau2} min={-90} max={90} step={1}
              onChange={setTau2} format={(v) => `${v.toFixed(0)}°`} />
          </div>

          <div className="control-group">
            <h3>Point energy &amp; mass</h3>
            <div className="readouts">
              <Row k="E = amplitude" v={fmt(E)} />
              <Row k="m = 1/amplitude" v={fmt(m)} />
              <Row k="E · m" v={R > 0 ? '1' : '—'} />
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
              <Row k="f = c/|λ|" v={fmt(f)} />
              <Row k="ω = 2πf" v={fmt(omega)} />
              <Row k="k = 2π/|λ|" v={fmt(k)} />
              <Row k="v phase = ω/k" v={fmt(vPhase)} />
            </div>
            <p className="graph-note">c = h = 1.</p>
          </div>
        </div>
        </div>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Equations</h2>
        </div>
        <div className="quark-eq-grid">
          <div className="eq-box">
            <span className="eq-label">Frequency from wavelength</span>
            <span className="eq-line"><Tex tex="f = \dfrac{c}{|\lambda|}, \quad c = 1" /></span>
            <span className="eq-line"><Tex tex="\text{wave speed normalized to 1 (natural units)}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Planck — energy–frequency bridge</span>
            <span className="eq-line"><Tex tex="E = hf, \quad h = 1" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Einstein — energy–mass bridge</span>
            <span className="eq-line"><Tex tex="E = mc^2" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Sphere mapping — energy as amplitude</span>
            <span className="eq-line"><Tex tex="E = A, \quad m = \dfrac{1}{A}, \quad E \cdot m = 1" /></span>
            <span className="eq-line"><Tex tex="\text{uniform amplitude } A = R \text{ for now}" /></span>
            <span className="eq-line"><Tex tex="\text{energy is mass } 180^\circ \text{ phase shifted}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Entropy — Boltzmann</span>
            <span className="eq-line"><Tex tex="S = k_B \ln \Omega" /></span>
            <span className="eq-line"><Tex tex="\text{here: } R = s, \quad N = 1 + 299s" /></span>
            <span className="eq-line"><Tex tex="\text{higher entropy } \to \text{ more eigenstates}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Eigenvector — point on the sphere</span>
            <span className="eq-line"><Tex tex="\lambda = R \, (\cos\tau_2 \cos\tau_1, \; \sin\tau_2, \; \cos\tau_2 \sin\tau_1)" /></span>
          </div>
        </div>
      </div>
    </div>
  )
}
