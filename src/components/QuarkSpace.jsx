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
  const [sim, setSim] = useState('sphere') // 'sphere' | 'surface'
  const [entropy, setEntropy] = useState(0.6)
  const [tau1, setTau1] = useState(45)
  const [tau2, setTau2] = useState(30)
  const [waveAmp, setWaveAmp] = useState(0.45)
  const [waveM, setWaveM] = useState(2)
  const [waveN, setWaveN] = useState(1)

  const isWave = sim === 'surface'

  // Local amplitude at the selected point. The uniform sphere is the 1:1
  // version (A = R everywhere); the surface carries a wave so E and m vary
  // across it: r = R·(1 + a·cos(m·τ1)·cos(n·τ2)).
  const R = Math.max(entropy, 0)
  const t1 = tau1 * D2R, t2 = tau2 * D2R
  const wR = isWave
    ? Math.max(1 + waveAmp * Math.cos(waveM * t1) * Math.cos(waveN * t2), 0.05)
    : 1
  const A = R * wR
  const E = A
  const m = A > 0 ? 1 / A : Infinity

  const lx = A * Math.cos(t2) * Math.cos(t1)
  const ly = A * Math.sin(t2)
  const lz = A * Math.cos(t2) * Math.sin(t1)

  const nStates = R <= 0 ? 1 : 1 + Math.round(entropy * 299)
  const volume = (4 / 3) * Math.PI * R ** 3
  const area = 4 * Math.PI * R ** 2

  // natural units c = h = 1: f = c/|λ| from the local wavelength at the point
  const f = A > 0 ? 1 / A : NaN
  const omega = 2 * Math.PI * f
  const k = A > 0 ? (2 * Math.PI) / A : NaN
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
            <button
              className={`sim-item${sim === 'sphere' ? ' active' : ''}`}
              role="tab"
              aria-selected={sim === 'sphere'}
              onClick={() => setSim('sphere')}
            >
              Convolution Sphere
            </button>
            <button
              className={`sim-item${sim === 'surface' ? ' active' : ''}`}
              role="tab"
              aria-selected={sim === 'surface'}
              onClick={() => setSim('surface')}
            >
              Convolution Surface
            </button>
          </div>
        </nav>

        <div className="lab-stage">
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">{isWave ? 'Convolution Surface' : 'Convolution Sphere'}</h2>
            </div>
            <ConvolutionSphere
              entropy={entropy} tau1={tau1} tau2={tau2}
              mode={isWave ? 'wave' : 'uniform'} waveAmp={waveAmp} waveM={waveM} waveN={waveN}
            />
            <p className="graph-note">
              {isWave
                ? 'A wave wrapped around the sphere — warm where the amplitude (energy) is high, cool where it is low. Move τ1, τ2 and watch E and m trade off across the surface.'
                : 'τ1 and τ2 select the point — λ gives direction, τ gives the time coordinate. Energy and mass are read from the amplitude at that point (uniform here — the 1:1 version).'}
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

          {isWave && (
            <div className="control-group">
              <h3>Wave</h3>
              <Slider label="a" value={waveAmp} min={0} max={0.8} step={0.01}
                onChange={setWaveAmp} format={(v) => v.toFixed(2)} />
              <Slider label="m" value={waveM} min={1} max={8} step={1}
                onChange={setWaveM} format={(v) => v.toFixed(0)} />
              <Slider label="n" value={waveN} min={1} max={8} step={1}
                onChange={setWaveN} format={(v) => v.toFixed(0)} />
              <p className="graph-note">r = R·(1 + a·cos(mτ1)·cos(nτ2))</p>
              <p className="graph-note">surface r/R: {(1 - waveAmp).toFixed(2)} – {(1 + waveAmp).toFixed(2)}</p>
            </div>
          )}

          <div className="control-group">
            <h3>Point energy &amp; mass</h3>
            <div className="readouts">
              <Row k="E = amplitude" v={fmt(E)} />
              <Row k="m = 1/amplitude" v={fmt(m)} />
              <Row k="E · m" v={A > 0 ? '1' : '—'} />
            </div>
          </div>

          <div className="control-group">
            <h3>Eigenvector — wavelengths</h3>
            <div className="readouts">
              <Row k="λx" v={fmt(lx)} />
              <Row k="λy" v={fmt(ly)} />
              <Row k="λz" v={fmt(lz)} />
              <Row k="|λ|" v={fmt(A)} />
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
            <span className="eq-label">Convolution surface — wave-wrapped sphere</span>
            <span className="eq-line"><Tex tex="r = R \, (1 + a \cos m\tau_1 \cos n\tau_2)" /></span>
            <span className="eq-line"><Tex tex="A = r, \quad E = A, \quad m = \dfrac{1}{A}" /></span>
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
