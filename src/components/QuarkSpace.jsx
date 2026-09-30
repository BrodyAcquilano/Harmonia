import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import ConvolutionSurface, { surfU } from './ConvolutionSurface.jsx'

/* The Quark Space: a convolution of energy and mass and space and time.
   The convolution surface carries the mass wave and the energy wave together —
   energy is just mass 180° phase shifted. τ1 is the frequency of the mass
   wave; τ2 is the amount the energy wave is rotated by the phasor, from its
   default of 180° out of phase. When mass is high energy is low, and when
   mass is low energy is high. The axes are wavelength (λ / −λ), velocity
   (v / −v, vertical), and phase (φ / −φ). Entropy grows the surface from a
   point — higher entropy, more eigenstates. */

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
  const [tau1, setTau1] = useState(8) // frequency of the mass wave
  const [tau2, setTau2] = useState(90) // energy-wave phasor rotation, degrees
  const [waveAmp, setWaveAmp] = useState(0.04)
  const [waveN, setWaveN] = useState(8)

  // Local amplitude at the fixed eigenvector (θ = 0, φ = 0, on the λ axis).
  // Mass is carried as amplitude (high spots, green); energy is its inverse —
  // the 180° phase-shifted partner (low spots, red) — so E · m = 1.
  const R = Math.max(entropy, 0)
  const u0 = surfU(0, 0, tau1, tau2 * D2R, waveAmp, waveN)
  const A = R * u0
  const m = A
  const E = A > 0 ? 1 / A : Infinity

  const nStates = R <= 0 ? 1 : 1 + Math.round(entropy * 319)
  const volume = (4 / 3) * Math.PI * R ** 3
  const area = 4 * Math.PI * R ** 2

  // natural units c = h = 1: f = c/|λ| from the local wavelength at the point
  const f = A > 0 ? 1 / A : NaN
  const omega = 2 * Math.PI * f
  const k = A > 0 ? (2 * Math.PI) / A : NaN
  const vPhase = 1 // ω/k = c

  return (
    <div className="quark-page">
      <div className="lab-layout">
        <div className="lab-stage">
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
                The convolution surface carries the mass wave and the energy wave
                together — two things: the frequency of the mass wave, and the phase
                of the energy wave. τ1 is the frequency of the mass wave; τ2 is the
                phase of the energy wave, the amount it is rotated by the phasor from
                its default of 180° out of phase. When mass is high, energy is low;
                when mass is low, energy is high — mass running high shows as green
                spots on the surface, energy pooling in the red lows. At τ2 = 0 the
                two waves cancel and the surface is uniform: the 1:1 version.
              </p>
              <p>
                Each point of the convolution surface is an eigenstate, with its
                direction given on the three axes: wavelength λ, velocity v, and
                phase φ. Entropy grows the surface from a single point: higher
                entropy, more eigenstates.
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

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Convolution Surface</h2>
            </div>
            <ConvolutionSurface
              entropy={entropy} tau1={tau1} tau2={tau2}
              waveAmp={waveAmp} waveN={waveN}
            />
            <p className="graph-note">
              τ1 sets the mass wave's frequency; τ2 rotates the energy wave's phasor away from 180°.
              The gold arrow rides the fixed eigenvector on the λ axis, growing and shrinking as the
              waves move beneath it — green mass highs, red energy lows.
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
            <h3>τ1 — mass wave frequency</h3>
            <Slider label="τ1" value={tau1} min={1} max={20} step={1}
              onChange={setTau1} format={(v) => v.toFixed(0)} />
          </div>

          <div className="control-group">
            <h3>τ2 — energy phasor</h3>
            <Slider label="τ2" value={tau2} min={-180} max={180} step={1}
              onChange={setTau2} format={(v) => `${v.toFixed(0)}°`} />
            <p className="graph-note">Rotation of the energy wave from 180° out of phase. At 0° the waves cancel.</p>
          </div>

          <div className="control-group">
            <h3>Wave</h3>
            <Slider label="a" value={waveAmp} min={0} max={0.2} step={0.01}
              onChange={setWaveAmp} format={(v) => v.toFixed(2)} />
            <Slider label="n" value={waveN} min={1} max={20} step={1}
              onChange={setWaveN} format={(v) => v.toFixed(0)} />
            <p className="graph-note">
              Surface u/R range: {(1 - 2 * waveAmp).toFixed(2)} – {(1 + 2 * waveAmp).toFixed(2)}
            </p>
          </div>

          <div className="control-group">
            <h3>Point energy &amp; mass</h3>
            <div className="readout">
              <Row k="m = amplitude" v={fmt(m)} />
              <Row k="E = 1/amplitude" v={fmt(E)} />
              <Row k="E · m" v={A > 0 ? '1' : '—'} />
            </div>
          </div>

          <div className="control-group">
            <h3>Eigenvector (fixed, λ axis)</h3>
            <div className="readout">
              <Row k="λ" v={fmt(A)} />
              <Row k="v" v={fmt(0)} />
              <Row k="φ" v={fmt(0)} />
              <Row k="|λ|" v={fmt(A)} />
            </div>
          </div>

          <div className="control-group">
            <h3>Surface</h3>
            <div className="readout">
              <Row k="eigenstates" v={fmt(nStates, 6)} />
              <Row k="volume" v={fmt(volume)} />
              <Row k="area" v={fmt(area)} />
            </div>
          </div>

          <div className="control-group">
            <h3>Derived</h3>
            <div className="readout">
              <Row k="f = 1/|λ|" v={fmt(f)} />
              <Row k="ω = 2πf" v={fmt(omega)} />
              <Row k="k = 2π/|λ|" v={fmt(k)} />
              <Row k="v phase" v={fmt(vPhase)} />
            </div>
            <p className="graph-note">Natural units: c = h = 1.</p>
          </div>
        </div>
        </div>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <h2 className="graph-title">Equations</h2>
        </div>
        <div className="eq-grid">
          <div className="eq-box">
            <span className="eq-label">Frequency from wavelength</span>
            <span className="eq-line"><Tex tex="f = \dfrac{c}{|\lambda|}" /></span>
            <span className="eq-line"><Tex tex="\text{one cycle per wavelength, at light speed}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Planck–Einstein</span>
            <span className="eq-line"><Tex tex="E = hf" /></span>
            <span className="eq-line"><Tex tex="\text{energy carried per cycle}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Mass–energy</span>
            <span className="eq-line"><Tex tex="E = mc^2" /></span>
            <span className="eq-line"><Tex tex="\text{with } c = 1 \text{ this is } E = m" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Convolution surface — mass and energy waves</span>
            <span className="eq-line"><Tex tex="u = 1 + a\cos(\tau_1\theta)\cos(n\phi) + a\cos(\tau_1\theta + \pi + \tau_2)\cos(n\phi)" /></span>
            <span className="eq-line"><Tex tex="r = R\,u, \quad m = A, \quad E = \dfrac{1}{A}" /></span>
            <span className="eq-line"><Tex tex="\tau_2 = 0 \to u = 1 \text{ (uniform — the 1:1 version)}" /></span>
            <span className="eq-line"><Tex tex="\tau_2 \text{ in radians}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Entropy</span>
            <span className="eq-line"><Tex tex="S = k_B \ln \Omega" /></span>
            <span className="eq-line"><Tex tex="R = s, \quad N = 1 + 319\,s" /></span>
            <span className="eq-line"><Tex tex="\text{entropy grows the radius and the eigenstate count}" /></span>
          </div>
          <div className="eq-box">
            <span className="eq-label">Eigenvector — fixed on the λ axis</span>
            <span className="eq-line"><Tex tex="P = (r(0,0),\, 0,\, 0)" /></span>
            <span className="eq-line"><Tex tex="\text{rides the waves as } \tau_1, \tau_2 \text{ move beneath it}" /></span>
          </div>
        </div>
      </div>
    </div>
  )
}
