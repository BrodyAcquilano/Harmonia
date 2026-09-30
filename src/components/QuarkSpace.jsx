import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import ConvolutionSurface, { surfU } from './ConvolutionSurface.jsx'

/* The Quark Space: a convolution of energy and mass and space and time.
   For a given combination — mass-wave frequency f, energy phasor p, amplitude a —
   the convolution surface shows all values of m. τ1 and τ2 are the selected
   eigenstate's time coordinates: they move the gold arrow around the surface but
   never reshape it. When mass is high energy is low, and when mass is low energy
   is high. The axes are wavelength (λ / −λ), velocity (v / −v, vertical), and
   the imaginary wavelength axis (iλ / −iλ), from which the phase angle is read.
   Entropy grows the surface from a point — higher entropy, more eigenstates. */

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
  const [tau1, setTau1] = useState(0) // point longitude, degrees — moves the arrow
  const [tau2, setTau2] = useState(0) // point latitude, degrees — moves the arrow
  const [waveAmp, setWaveAmp] = useState(0.04)
  const [freq, setFreq] = useState(8) // mass-wave frequency (θ wave number)
  const [phasor, setPhasor] = useState(90) // energy-wave rotation from 180°, degrees

  // Local amplitude at the selected (τ1, τ2) point.
  // Mass is carried as amplitude (high spots, green); energy is its inverse —
  // the 180° phase-shifted partner (low spots, red) — so E · m = 1.
  const R = Math.max(entropy, 0)
  // the eigenstate count sets the surface wave number: N points on a sphere
  // resolve wave numbers up to ~√N, so the wave varies at the finest scale
  // the eigenstates can resolve
  const nStates = 1 + Math.round(entropy * 299)
  const waveN = Math.max(1, Math.round(Math.sqrt(nStates)))
  const th = tau1 * D2R
  const ph = tau2 * D2R
  const u0 = surfU(th, ph, freq, phasor * D2R, waveAmp, waveN)
  const A = R * u0
  const m = A
  const E = A > 0 ? 1 / A : Infinity

  // τ values on (−∞, ∞) inferred from the angles
  const tau1v = Math.abs(tau1) >= 180 ? (tau1 > 0 ? Infinity : -Infinity) : Math.tan(th / 2)
  const tau2v = Math.tan(ph / 2)
  const fmtTau = (v) => !isFinite(v) ? (v > 0 ? '∞' : '−∞') : v.toFixed(4)

  // eigenvector components at the selected point
  const lamC = A * Math.cos(ph) * Math.cos(th)
  const velC = A * Math.cos(ph) * Math.sin(th)
  const imaC = A * Math.sin(ph)

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
        <nav className="sim-nav" aria-label="Simulations">
          <h3>Simulations</h3>
          <div className="sim-list" role="tablist" aria-label="Simulations">
            <button
              className="sim-item"
              role="tab"
              aria-selected="true"
            >
              Convolution Sphere
            </button>
          </div>
        </nav>
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
                The convolution follows specific rules. Energy and mass are convolved,
                typically in a 1:1 ratio — the energy wave is the mass wave shifted
                180° out of phase, a rotation by i². There are different ways to
                describe it, but ultimately an eigenstate needs three spatial
                coordinates or two of time.
              </p>
              <p>
                The three of space are wavelength, velocity, and iλ: λ on the red
                axis, velocity v on the green, iλ on the blue — the phase angle is
                read from the iλ axis. The velocity gives the frequency, relating ω
                to k; from the frequency we get E = hf, and from the energy E = mc²
                gives the mass. The velocity is what relates mass to energy.
                The two of time are τ1 and τ2, the eigenstate's time coordinates. They
                range over (−∞, ∞), so we use angles — longitude and latitude on the
                surface — and infer the value from the angle. Changing τ1 and τ2 moves
                the arrow around the surface; the surface itself is unchanged. The three
                spatial coordinates relate the volume inside the sphere to its surface,
                and the two of time give all the possible values on the surface — two
                of time, three of space, the way Kepler's T² ∝ a³ counts them. So an
                eigenstate can be defined either way.
                When mass is high, energy is low; when mass is low, energy is high —
                mass running high shows as green spots on the surface, energy pooling
                in the red lows. Entropy grows the surface from a single point:
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

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Convolution Surface</h2>
            </div>
            <ConvolutionSurface
              entropy={entropy} tau1={tau1} tau2={tau2}
              waveAmp={waveAmp} waveN={waveN} freq={freq} phasor={phasor}
            />
            <p className="graph-note">
              τ1 and τ2 move the gold arrow around the surface — green mass highs, red energy lows.
              The surface shows all values of m for the given wave combination.
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
            <h3>τ1 — point longitude</h3>
            <Slider label="τ1" value={tau1} min={-180} max={180} step={1}
              onChange={setTau1} format={(v) => `${v.toFixed(0)}°`} />
            <p className="graph-note">Moves the arrow; the surface is unchanged.</p>
          </div>

          <div className="control-group">
            <h3>τ2 — point latitude</h3>
            <Slider label="τ2" value={tau2} min={-90} max={90} step={1}
              onChange={setTau2} format={(v) => `${v.toFixed(0)}°`} />
            <p className="graph-note">Moves the arrow; the surface is unchanged.</p>
          </div>

          <div className="control-group">
            <h3>Wave</h3>
            <Slider label="a" value={waveAmp} min={0} max={0.2} step={0.01}
              onChange={setWaveAmp} format={(v) => v.toFixed(2)} />
            <Slider label="f" value={freq} min={1} max={20} step={1}
              onChange={setFreq} format={(v) => v.toFixed(0)} />
            <Slider label="p" value={phasor} min={-180} max={180} step={1}
              onChange={setPhasor} format={(v) => `${v.toFixed(0)}°`} />
            <p className="graph-note">
              Surface u/R range: {(1 - 2 * waveAmp).toFixed(2)} – {(1 + 2 * waveAmp).toFixed(2)}.
              n = {waveN} follows the eigenstate count (n ≈ √N).
            </p>
            <p className="graph-note">Rotation of the energy wave from 180° out of phase. At 0° the waves cancel.</p>
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
            <h3>Eigenvector (τ1, τ2)</h3>
            <div className="readout">
              <Row k="λ" v={fmt(lamC)} />
              <Row k="v" v={fmt(velC)} />
              <Row k="iλ" v={fmt(imaC)} />
              <Row k="τ1" v={fmtTau(tau1v)} />
              <Row k="τ2" v={fmtTau(tau2v)} />
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
            <span className="eq-line"><Tex tex="R = s, \quad N = 1 + 299\,s" /></span>
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
