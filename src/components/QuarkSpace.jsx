import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import ConvolutionSurface, { surfU, QUARK_FREQS } from './ConvolutionSurface.jsx'
import SurfaceMap from './SurfaceMap.jsx'

/* The Quark Space: a convolution of energy and mass and space and time.
   The two time coordinates are angles: τ1 on the mass-wave-frequency axis,
   τ2 on the energy-wave-phase axis. The labels name the axes; the values are
   the angles — they move the gold arrow to the point where energy and mass
   are read. The surface wave itself comes from the eigenstates: one new
   frequency per eigenstate, from E = hf = mc². When mass is high energy is
   low, and when mass is low energy is high. The axes are wavelength (λ / −λ),
   velocity (v / −v, vertical), and the imaginary wavelength axis (iλ / −iλ),
   from which the phase angle is read. Frequency comes from the velocity.
   Entropy grows the surface from a point — higher entropy, more eigenstates. */

const D2R = Math.PI / 180

// One frequency quantum per expelled quark, from E = hf = mc²:
// f_q = (2/3)·m_q·c²/h with m_q·c² = 2 MeV.
const QUARK_MC2 = 2.0 // MeV
const H_EV_S = 4.135667696e-15 // eV·s
const FQ = (2 / 3) * QUARK_MC2 * 1e6 / H_EV_S // Hz

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
  const [entropy, setEntropy] = useState(60000)
  const [tau1, setTau1] = useState(0) // angle on the mass-wave-frequency axis — moves the arrow
  const [tau2, setTau2] = useState(0) // angle on the energy-wave-phase axis — moves the arrow
  const [waveAmp, setWaveAmp] = useState(0.04)

  // Local amplitude at the arrow (θ = τ1). τ1/τ2 are angles that move
  // the arrow — they never reshape the wave. Mass is carried as amplitude
  // (high spots, green); energy is its inverse — the 180° phase-shifted
  // partner (low spots, red) — so E · m = 1.
  const R = Math.max(entropy, 0) / 100000 // the sphere scales very slowly with entropy
  // the eigenstate count sets the surface wave number: N points on a sphere
  // resolve wave numbers up to ~√N, so the wave varies at the finest scale
  // the eigenstates can resolve
  const nStates = Math.min(1 + Math.round(entropy / 50), QUARK_FREQS.length)
  const th = tau1 * D2R, ph = tau2 * D2R
  const u0 = surfU(th, waveAmp, nStates)
  const A = R * u0
  const m = A
  const E = A > 0 ? 1 / A : Infinity
  // eigenvector components at the arrow
  const lam = A * Math.cos(ph) * Math.cos(th)
  const vel = A * Math.cos(ph) * Math.sin(th)
  const ilam = A * Math.sin(ph)
  // first few frequencies of the combination chain, for the equation box
  const firstTerms = QUARK_FREQS.slice(0, 8).join(', ')
  // typical (rms) roughness of the 1/√k eigenstate sum: a·√(Σ 1/k)
  let hN = 0
  for (let j = 1; j <= nStates; j++) hN += 1 / j
  const bound = waveAmp * Math.sqrt(hN)

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
              Convolution Surface
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
                The two of time are τ1 and τ2: the labels name the axes — mass wave
                frequency, energy wave phase — and the values are the angles
                that move the gold arrow to the point on the surface where
                energy and mass are read. The three
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
              waveAmp={waveAmp}
            />
            <p className="graph-note">
              τ1 and τ2 are angles that move the gold arrow — the labels name the axes
              (mass wave frequency, energy wave phase); the values are the angles.
              The surface carries one wave per eigenstate, from E = hf = mc² —
              green mass highs, red energy lows.
            </p>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Flat Map</h2>
            </div>
            <SurfaceMap
              entropy={entropy} tau1={tau1} tau2={tau2}
              waveAmp={waveAmp}
            />
            <p className="graph-note">
              The surface unfolded flat — −λ left, iλ center, λ right (the +λ half;
              the −λ half is its 180° opposite). τ2 vertical.
              Green peaks, red valleys. The yellow dot is the arrow's position,
              moved by τ1 and τ2.
            </p>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">More entropy, more frequencies</h2>
            </div>
            <p className="graph-note">
              The number of frequencies increases as entropy increases, because
              newer combinations of frequencies can be built from old ones.
              Start with 2/3 and −1/3 — then 2/3 + 2/3, then
              2/3 − 1/3 — and keep going. Each new combination is a
              new frequency, a new eigenstate on the sphere:
            </p>
            <div className="eq-grid">
              <div className="eq-box">
                <span className="eq-label">Building new frequencies from old ones</span>
                <span className="eq-line"><Tex tex="\frac{2}{3}, -\frac{1}{3} \text{ — the seeds}" /></span>
                <span className="eq-line"><Tex tex="\frac{2}{3} + \frac{2}{3} = \frac{4}{3}" /></span>
                <span className="eq-line"><Tex tex="\frac{2}{3} - \frac{1}{3} = \frac{1}{3}" /></span>
              </div>
            </div>
            <p className="graph-note">
              The cosmic background radiation shows this process developing over
              time. The main belt where the Milky Way sits is high in activity,
              so it keeps adding new frequencies as entropy rises there.
              Everywhere else, random processes have split the fluctuations
              between dark matter and dark energy.
            </p>
            <p className="graph-note">
              Dark matter and dark energy are the stored frequencies — the
              process of creating up and down quarks. Creating a quark subtracts
              a frequency from the existing combinations, but it still creates
              energy fluctuations. Down quarks result in dark matter; up quarks
              result in dark energy.
            </p>
            <p className="graph-note">
              The process is random, so unlike this sphere, the background
              radiation reads as a random combination of energy fluctuations
              — except along the Milky Way’s belt, where rising
              entropy keeps increasing the number of frequencies.
            </p>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Equations</h2>
            </div>
            <div className="eq-grid">
              <div className="eq-box">
                <span className="eq-label">Frequency from wavelength</span>
                <span className="eq-line"><Tex tex="f = \dfrac{c}{\lambda}" /></span>
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
                <span className="eq-label">Convolution surface — one wave per eigenstate</span>
                <span className="eq-line"><Tex tex="u = 1 + \sum_{k=1}^{N(s)} \frac{a}{\sqrt{k}}\sigma_k\cos(q_k\theta)" /></span>
                <span className="eq-line"><Tex tex="q_1 = 2,\, q_2 = -1 \text{ — the seeds } \frac{2}{3}f_q, -\frac{1}{3}f_q" /></span>
                <span className="eq-line"><Tex tex="q_k = q_i \pm q_j \text{ — each new frequency a random sum/difference of two earlier ones}" /></span>
                <span className="eq-line"><Tex tex="\sigma_k = \pm 1 \text{ — fixed signs spread the peaks, left mirrors right}" /></span>
                <span className="eq-line">chain starts: {firstTerms}, …</span>
                <span className="eq-line"><Tex tex="\theta\text{ — angle from } +\lambda\text{ in the }\lambda\text{–}v\text{ plane}" />
                <span className="eq-line"><Tex tex="w(\theta + \pi) = -w(\theta)\text{ — the } -\lambda\text{ half is the } 180^\circ\text{ phase-shifted opposite}" /></span></span>
                <span className="eq-line"><Tex tex="v = f_j\lambda_j = 2\pi f_q \text{ — one wave speed for all eigenstates}" /></span>
                <span className="eq-line"><Tex tex="N(s) = 1 + \dfrac{s}{50} \text{ — entropy sets the eigenstate count}" /></span>
                <span className="eq-line"><Tex tex="r = R\,u, \quad R = \dfrac{s}{100000}, \quad m = u, \quad E = \dfrac{1}{u}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Eigenstate frequencies</span>
                <span className="eq-line"><Tex tex="f_j = j\,f_q, \quad f_q = \dfrac{(2/3)\,m_q c^2}{h}" /></span>
                <span className="eq-line"><Tex tex="m_q c^2 = 2\,\text{MeV}" /></span>
                <span className="eq-line"><Tex tex="\text{one new eigenstate, one new frequency}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Entropy</span>
                <span className="eq-line"><Tex tex="S = k_B \ln \Omega" /></span>
                <span className="eq-line"><Tex tex="R = \dfrac{s}{100000}, \quad N = 1 + \dfrac{s}{50}" /></span>
                <span className="eq-line"><Tex tex="\text{entropy grows the radius and the eigenstate count}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Eigenvector — moved by τ1, τ2</span>
                <span className="eq-line"><Tex tex="P = (r\cos\phi\cos\theta,\, r\cos\phi\sin\theta,\, r\sin\phi)" /></span>
                <span className="eq-line"><Tex tex="\theta = \tau_1,\, \phi = \tau_2 \text{ (angles; the labels name the axes)}" /></span>
              </div>
            </div>
          </div>
        </div>

        <div className="lab-side">
        <div className="lab-controls">
          <div className="control-group">
            <h3>Entropy</h3>
            <Slider label="s" value={entropy} min={0} max={100000} step={1}
              onChange={setEntropy} format={(v) => v.toFixed(0)} />
            <p className="graph-note">Higher entropy, more eigenstates.</p>
          </div>

          <div className="control-group">
            <h3>τ1 — mass wave frequency</h3>
            <Slider label="τ1" value={tau1} min={-180} max={180} step={1}
              onChange={setTau1} format={(v) => `${v.toFixed(0)}°`} />
            <p className="graph-note">The frequency of the mass wave. Frequency comes from the velocity — the vertical axis.</p>
          </div>

          <div className="control-group">
            <h3>τ2 — energy wave phase</h3>
            <Slider label="τ2" value={tau2} min={-90} max={90} step={1}
              onChange={setTau2} format={(v) => `${v.toFixed(0)}°`} />
            <p className="graph-note">The phase angle of the energy wave. Phase is read from the iλ axis.</p>
          </div>

          <div className="control-group">
            <h3>Wave</h3>
            <Slider label="a" value={waveAmp} min={0} max={0.2} step={0.01}
              onChange={setWaveAmp} format={(v) => v.toFixed(2)} />
            <p className="graph-note">
              Surface u/R, typical range: 1 ± {bound.toFixed(2)}.
              One wave per eigenstate at amplitude a/√k — newer combinations weaker, but every doubling of the eigenstate count adds as much visible structure as the last. Frequencies are a random
              combination chain from the 2/3, −1/3 seeds. No absolute value — the −λ half is the negated +λ half (180° phase shift), so the surface dents inward where the wave goes negative.
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
            <h3>Eigenvector (τ1, τ2)</h3>
            <div className="readout">
              <Row k="λ" v={fmt(lam)} />
              <Row k="v" v={fmt(vel)} />
              <Row k="iλ" v={fmt(ilam)} />
              <Row k="|P|" v={fmt(A)} />
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
            <h3>Eigenstate frequencies</h3>
            <div className="readout">
              <Row k="f_q" v={`${fmt(FQ)} Hz`} />
              <Row k="f_N (top)" v={`${fmt(nStates * FQ)} Hz`} />
              <Row k="added mass" v={`${fmt(nStates * (2 / 3) * QUARK_MC2)} MeV/c²`} />
            </div>
            <p className="graph-note">One new eigenstate, one new frequency: f_j = j·f_q, from E = hf = mc².</p>
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

    </div>
  )
}
