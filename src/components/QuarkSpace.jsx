import { useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Slider from './Slider.jsx'
import ConvolutionSurface, { surfU, QUARK_TERMS } from './ConvolutionSurface.jsx'
import SurfaceMap from './SurfaceMap.jsx'
import ConvolutionSphere from './ConvolutionSphere.jsx'
import TimeDomain from './TimeDomain.jsx'
import MassLattice from './MassLattice.jsx'
import MassCreation from './MassCreation.jsx'
import PointSources from './PointSources.jsx'
import ColorTheory, { FrequencyDistribution, spectrumBounds, spectrumColor } from './ColorTheory.jsx'
import ModellingSun from './ModellingSun.jsx'
import Fundamental20 from './Fundamental20.jsx'

// the energy-spectrum legend for the Space-Time Domain graphs: the same
// color system as Color Theory — coolest fundamental at the infrared end,
// hottest at the ultraviolet end
const TD_SPECTRUM_B = spectrumBounds([1, 2, 3, 4])
const TD_SPECTRUM_GRAD = (() => {
  const stops = []
  for (let i = 0; i <= 48; i++) {
    const c = spectrumColor(i / 48, TD_SPECTRUM_B)
    stops.push(`rgb(${c[0]},${c[1]},${c[2]}) ${(i / 48 * 100).toFixed(1)}%`)
  }
  return `linear-gradient(to right, ${stops.join(', ')})`
})()

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
  const [waveAmp, setWaveAmp] = useState(0.2)
  const [sim, setSim] = useState('sphere') // 'sphere' | 'surface' | 'time' | 'mass' | 'color' | 'sun'
  const [entropyT, setEntropyT] = useState(60000)
  const [waveAmpT, setWaveAmpT] = useState(0.2)
  const [entropyM, setEntropyM] = useState(60000)
  const [waveAmpM, setWaveAmpM] = useState(0.15)
  const [playingM, setPlayingM] = useState(false)
  const [playingC, setPlayingC] = useState(false)
  const [speedC, setSpeedC] = useState(1)
  const [speedM, setSpeedM] = useState(1)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [decayP, setDecayP] = useState(0.35)
  const [decayM, setDecayM] = useState(0.35)
  const [decayC, setDecayC] = useState(0.35)
  const [entropyC, setEntropyC] = useState(60000)
  const [waveAmpC, setWaveAmpC] = useState(0.2)
  const [showC, setShowC] = useState(12)
  const [playingC1, setPlayingC1] = useState(false)
  const [speedC1, setSpeedC1] = useState(1)
  const [compCount, setCompCount] = useState(20)
  const [entropyS, setEntropyS] = useState(60000)
  const [waveAmpS, setWaveAmpS] = useState(0.2)
  const [decayS, setDecayS] = useState(0.35)

  // Local amplitude at the arrow (θ = τ1). τ1/τ2 are angles that move
  // the arrow — they never reshape the wave. Mass is carried as amplitude
  // (high spots, green); energy is its inverse — the 180° phase-shifted
  // partner (low spots, red) — so E · m = 1.
  const R = Math.min(Math.max(entropy, 0) / 100000, 1) // the sphere scales very slowly with entropy, holding unit size past s = 100000
  // the eigenstate count sets the surface wave number: N points on a sphere
  // resolve wave numbers up to ~√N, so the wave varies at the finest scale
  // the eigenstates can resolve
  const nStates = Math.min(1 + Math.round(entropy / 50), QUARK_TERMS.length)
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
  const firstTerms = QUARK_TERMS.slice(0, 8).map((t) => t.q).join(', ')
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
              aria-selected={sim === 'sphere'}
              onClick={() => setSim('sphere')}
            >
              Convolution Sphere
            </button>
            <button
              className="sim-item"
              role="tab"
              aria-selected={sim === 'surface'}
              onClick={() => setSim('surface')}
            >
              Convolution Surface
            </button>
            <button
              className="sim-item"
              role="tab"
              aria-selected={sim === 'time'}
              onClick={() => setSim('time')}
            >
              Space-Time Domain
            </button>
            <button
              className="sim-item"
              role="tab"
              aria-selected={sim === 'mass'}
              onClick={() => setSim('mass')}
            >
              Mass Lattice
            </button>
            <button
              className="sim-item"
              role="tab"
              aria-selected={sim === 'color'}
              onClick={() => setSim('color')}
            >
              Color Theory
            </button>
            <button
              className="sim-item"
              role="tab"
              aria-selected={sim === 'sun'}
              onClick={() => setSim('sun')}
            >
              Modelling the Sun
            </button>
          </div>
        </nav>
        <div className="lab-stage">
          {sim === 'surface' && (
          <>
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
                Before quarks were created, all matter operated on the same 1:1
                mass-to-energy ratio and vibrated at the same frequency. All motion
                since is the adding of new frequencies: new eigenstates built on the
                same 2/3 building block, each time a quark is absorbed or released.
                That is how motion was created from waves — proton formation, when
                electrons were created, forced quarks to group together to remain
                stable, and changing the frequencies in the gravitational field
                created gravitational waves.
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
              The wave unfolded flat, like unraveling the globe — θ runs −λ left,
              iλ center, λ right (the +λ half; the −λ half is its 180° opposite),
              and each row rotates the wave by the τ2 phase: the middle row is the
              base wave (τ2 = 0), −90° at the bottom, +90° at the top.
              Each pixel takes the color of the fundamental frequency it is most
              made of — blue 1/3 f_q, red 2/3 f_q, green 1 f_q, yellow 4/3 f_q —
              shaded by the wave amplitude. The yellow dot marks the arrow's (τ1, τ2).
            </p>
          </div>

          <Fundamental20 />

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">More entropy, more frequencies</h2>
            </div>
            <p className="graph-note">
              The number of frequencies increases as entropy increases, because
              every eigenstate is a quark event — a formation or a decay. Each
              new eigenstate picks one of the 14 quark states: 95% of the time
              a formation state (a negative frequency — the same wave
              phase-shifted by −180°), 5% of the time a decay state, which is
              subtracted from the wave instead of added. The weights count the
              quarks: two up quarks make 2/3 twice as likely as −1/3, and the
              two-quark and three-quark combinations fill out the rest:
            </p>
            <div className="eq-grid">
              <div className="eq-box">
                <span className="eq-label">Quark-state seeding — one pick per eigenstate</span>
                <span className="eq-line"><Tex tex="\text{formation } 95\%, \text{ added: } -\frac{2}{3}\,(\frac{2}{7}),\; -\frac{1}{3}\,(\frac{2}{7}),\; \frac{1}{3},\; -\frac{4}{3},\; -1\;(\frac{1}{7} \text{ each})" /></span>
                <span className="eq-line"><Tex tex="\text{decay } 5\%, \text{ subtracted: } \frac{2}{3}\,(\frac{2}{7}),\; \frac{1}{3}\,(\frac{2}{7}),\; -\frac{1}{3},\; \frac{4}{3},\; 1\;(\frac{1}{7} \text{ each})" /></span>
                <span className="eq-line"><Tex tex="\text{weights count the quarks: two ups, one down}" /></span>
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
              process of creating up and down quarks. Creating a quark adds a
              frequency (a negative one — phase-shifted by −180°); a decay
              subtracts one instead, but both are energy fluctuations. Down
              quarks result in dark matter; up quarks result in dark energy.
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
                <span className="eq-line"><Tex tex="u = 1 + \sum_{k=1}^{N(s)} m_k\frac{a}{\sqrt{k}}\sigma_k\cos(q_k\theta)" /></span>
                <span className="eq-line"><Tex tex="q_1 = 2,\, q_2 = -1 \text{ — the seeds } \frac{2}{3}f_q, -\frac{1}{3}f_q" /></span>
                <span className="eq-line"><Tex tex="q_k \text{ — one weighted pick from the 14 quark states per eigenstate}" /></span>
                <span className="eq-line"><Tex tex="m_k = +1 \text{ formation } (95\%),\; m_k = -1 \text{ decay } (5\%) \text{ — decay is subtracted}" /></span>
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
                <span className="eq-line"><Tex tex="R = \min\left(\dfrac{s}{100000}, 1\right), \quad N = 1 + \dfrac{s}{50}" /></span>
                <span className="eq-line"><Tex tex="\text{entropy grows the radius and the eigenstate count}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Eigenvector — moved by τ1, τ2</span>
                <span className="eq-line"><Tex tex="P = (r\cos\phi\cos\theta,\, r\cos\phi\sin\theta,\, r\sin\phi)" /></span>
                <span className="eq-line"><Tex tex="\theta = \tau_1,\, \phi = \tau_2 \text{ (angles; the labels name the axes)}" /></span>
              </div>
            </div>
          </div>
          </>
          )}
          {sim === 'sphere' && (
          <>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">The Quark Space</h2>
            </div>
            <div className="quark-intro-body">
              <p>
                The convolution sphere is the quark space before any quarks were
                created — a uniform 1:1 sphere of mass to energy, E · m = 1
                everywhere. No eigenstates, no entropy, no frequencies. It is here
                to teach the axes: λ on the red axis, velocity v on the green
                (vertical), iλ on the blue — the phase angle is read from the
                iλ axis.
              </p>
              <p>
                Move τ1 and τ2 and the gold arrow rides the sphere. τ1 is
                the angle on the mass-wave-frequency axis; τ2 is the phase angle
                on the energy-wave-phase axis. The labels name the axes; the values
                are the angles.
              </p>
            </div>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Convolution Sphere</h2>
            </div>
            <ConvolutionSphere tau1={tau1} tau2={tau2} />
            <p className="graph-note">
              The sphere is transparent so the gold arrow stays visible wherever it
              goes. τ1 swings it around the λ–v plane; τ2 lifts it up
              the iλ axis.
            </p>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Equations</h2>
            </div>
            <div className="eq-grid">
              <div className="eq-box">
                <span className="eq-label">The 1:1 sphere</span>
                <span className="eq-line"><Tex tex="u = 1" /></span>
                <span className="eq-line"><Tex tex="m = u, \; E = \dfrac{1}{u}" /></span>
                <span className="eq-line"><Tex tex="E \cdot m = 1 \text{ everywhere}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Eigenvector — moved by τ1, τ2</span>
                <span className="eq-line"><Tex tex="P = (\cos\phi\cos\theta,\, \cos\phi\sin\theta,\, \sin\phi)" /></span>
                <span className="eq-line"><Tex tex="\theta = \tau_1,\, \phi = \tau_2 \text{ (angles; the labels name the axes)}" /></span>
                <span className="eq-line"><Tex tex="|P| = 1 \text{ — the arrow rides the unit sphere}" /></span>
              </div>
            </div>
          </div>
          </>
          )}
          {sim === 'time' && (
          <>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">The Space-Time Domain</h2>
            </div>
            <div className="quark-intro-body">
              <p>
                The same quark-frequency family as the surface, let loose in space
                and time. Each axis — x, y, z — carries its own independent random
                chain of quark frequencies: one wave per eigenstate at amplitude
                a/√k, the pink-noise family. Each axis fans its wave across its
                plane of motion — x and y sweep the xy plane, z sweeps the zy
                plane (z is vertical here) — so waves propagate in every
                direction. Every point of every wave is painted by the energy of
                the fundamental it is most made of — dark red (infrared) for
                the coolest, light purple (ultraviolet) for the hottest, the
                visible spectrum between.
              </p>
              <p>
                The bright gold curve is the superposition of all three waves —
                T(s,t) = (w_x, w_y, w_z), the total shape. The faint lines are the
                first 20 components of each axis, each in its energy color on
                the same spectrum, so the interference building every wave is
                visible. Press play and every
                fundamental oscillates at its own rate f·Ω: the waves interfere,
                the total shape writhes, and motion appears. This is motion being
                created from waves.
              </p>
            </div>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Space-Time Domain</h2>
            </div>
            <TimeDomain entropy={entropyT} waveAmp={waveAmpT} playing={playing} speed={speed} compCount={compCount} onPlayingChange={setPlaying} onSpeedChange={setSpeed} />
            <p className="graph-note">
              One independent frequency chain per axis — x, y and z each get their
              own random quarks, each fanned across its plane of motion (x and y
              in xy, z in zy). The faint lines are the first 20 components of
              each axis in their energy color on the spectrum; the brighter fan waves
              are their sums, painted by the dominant fundamental's energy color
              at each point;
              the bright gold curve is the three waves superposed.
            </p>
            <div style={{ padding: '8px 6px 0' }}>
              <div style={{ height: 10, borderRadius: 5, background: TD_SPECTRUM_GRAD }} />
              <div style={{ display: 'flex', justifyContent: 'space-between',
                             fontFamily: '"IBM Plex Mono", monospace', fontSize: 12,
                             color: '#715f43', marginTop: 4 }}>
                <span>1 f_q · infrared</span>
                <span>4 f_q · ultraviolet</span>
              </div>
            </div>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Equations</h2>
            </div>
            <div className="eq-grid">
              <div className="eq-box">
                <span className="eq-label">One wave per axis, over time</span>
                <span className="eq-line"><Tex tex="w_x(s,t) = \sum_{f=1}^{4} C^xf \cos(fs - f\Omega t)" /></span>
                <span className="eq-line"><Tex tex="w_y, w_z \text{ the same — each with its own chain}" /></span>
                <span className="eq-line"><Tex tex="\text{fan: } p(s) = s\mathbf{d}(\alpha) + w(s,t)\mathbf{n}(\alpha),\; \alpha \in \{-60^\circ, -30^\circ, 0^\circ, 30^\circ, 60^\circ\}" /></span>
                <span className="eq-line"><Tex tex="w_{x,k}(s,t) = \dfrac{m_k\sigma_k a}{\sqrt{k+1}} \cos(|q_k|(s-\Omega t))" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Superposition — the total shape</span>
                <span className="eq-line"><Tex tex="T(s,t) = (w_x(s,t),\, w_y(s,t),\, w_z(s,t))" /></span>
                <span className="eq-line"><Tex tex="\Omega \text{ set by the speed control}" /></span>
              </div>
            </div>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Point Sources</h2>
            </div>
            <div className="quark-intro-body">
              <p>
                The Mass Creation firing process, but every firing launches a
                wave instead of a mass: quarks fire at random points inside
                the cube, and each firing radiates a spherical wave in every
                direction — with a velocity and a decay rate. Watch the waves
                entangle in 3D space, coming from different points at once.
              </p>
              <p>
                The first graph shows the individual components — every live
                pulse as its expanding wavefront shells, each in its
                fundamental's color. The second is the superposition on the
                z = 0 slice — a fair sample of every direction. The third is
                the whole: all the waves summed into one surface in 3D space.
                Each graph runs its own clock, so one can play while the
                others stay paused.
              </p>
            </div>
          </div>

          <PointSources entropy={entropyT} waveAmp={waveAmpT} decay={decayP} />
          </>
          )}
          {sim === 'mass' && (
          <>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">The Mass Lattice</h2>
            </div>
            <div className="quark-intro-body">
              <p>
                A cube of masses — one at every grid point, each a green unit
                mass, m = 1, constant size. Each mass rides the resultant of the
                three axis waves at its rest position,
                p(t) = p0 + g·(w_x(x0,t), w_y(y0,t), w_z(z0,t)) — motion created
                from waves, the same superposition as the gold curve of the
                Space-Time Domain, evaluated at every point at once.
              </p>
              <p>
                The motion is amplified by a visual gain g. At the entropies we
                can simulate only a few combinations have built up, so the raw
                wave motion is small next to the real universe's — the gain
                stands in for all the entropy we can't reach, even at a million.
              </p>
            </div>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Mass Lattice</h2>
            </div>
            <MassLattice entropy={entropyM} waveAmp={waveAmpM} decay={decayM} playing={playingM} speed={speedM} onPlayingChange={setPlayingM} onSpeedChange={setSpeedM} />
            <p className="graph-note">
              343 green unit masses on a 7×7×7 grid, constant size. Each one
              rides the amplified resultant wave motion at its position. Press
              play and watch the whole cube ripple. Decay damps the motion
              with distance from the center.
            </p>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Mass Creation</h2>
            </div>
            <div className="quark-intro-body">
              <p>
                Quarks fire at random positions in the field — about eight per
                second. 95% of the time a firing forms a unit mass, a green
                sphere; the other 5% release only energy, a red flash with no
                mass. That is the 95/5 split from the surface, playing out one
                quark at a time.
              </p>
              <p>
                Every formed mass then moves in the field the same way the
                lattice masses do — riding the resultant wave, perpendicular to
                the energy wave, 180° out of phase — so each one traces a closed
                loop. When masses bump together they merge into a single
                rendered sphere, sized by the total unit masses inside; the
                program still counts every unit mass separately, and when they
                drift apart the cluster breaks up again. Masses that form in the
                same spot pile onto the same sphere, so it grows.
              </p>
            </div>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Mass Creation Field</h2>
            </div>
            <MassCreation entropy={entropyM} waveAmp={waveAmpM} decay={decayM} playing={playingC} speed={speedC} onPlayingChange={setPlayingC} onSpeedChange={setSpeedC} />
            <p className="graph-note">
              Green spheres are formed masses — watch them appear, drift in
              closed loops, merge when they bump, and split apart again. Red
              flashes are the 5%: energy released with no mass. Up to 900 unit
              masses; its own clock, its own play button. Decay damps their
              wave-riding motion away from the center.
            </p>
          </div>

          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Equations</h2>
            </div>
            <div className="eq-grid">
              <div className="eq-box">
                <span className="eq-label">Resultant motion — one mass</span>
                <span className="eq-line"><Tex tex="\mathbf{p}(t) = \mathbf{p}_0 + g\,(w_x(x_0,t),\, w_y(y_0,t),\, w_z(z_0,t))" /></span>
                <span className="eq-line"><Tex tex="w_x(x,t) = \sum_{f=1}^{4} C^xf \cos(fx - f\Omega t)" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">The gain g</span>
                <span className="eq-line"><Tex tex="g = 2 \text{ — visual gain standing in for unreachable entropy}" /></span>
                <span className="eq-line"><Tex tex="m = 1 \text{ everywhere, constant size}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Mass creation — quark firing</span>
                <span className="eq-line"><Tex tex="\text{quarks fire at } \lambda \approx 8/\mathrm{s},\quad P(\text{mass}) = 0.95" /></span>
                <span className="eq-line"><Tex tex="\text{the other 5\% release only energy — a red flash, no mass}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Merging — one rendered sphere</span>
                <span className="eq-line"><Tex tex="M = \sum_i m_i,\quad R \propto M^{1/3}" /></span>
                <span className="eq-line"><Tex tex="|\mathbf{p}_i - \mathbf{p}_j| < r_m \text{ merges — splits apart beyond it}" /></span>
              </div>
              <div className="eq-box">
                <span className="eq-label">Decay</span>
                <span className="eq-line"><Tex tex="\text{motion} \times e^{-d\,r_0/L},\quad r_0 = |\mathbf{p}_0|" /></span>
                <span className="eq-line"><Tex tex="d \in [0,1] \text{ — the decay slider; waves lose energy traveling out}" /></span>
              </div>
            </div>
          </div>
          </>
          )}
          {sim === 'color' && (
          <>
          <div className="graph-box">
            <div className="graph-title-row">
              <h2 className="graph-title">Color Theory</h2>
            </div>
            <div className="quark-intro-body">
              <p>
                Every eigenstate gets the color of its energy, on the real
                spectrum: dark red (infrared) for the coolest frequency in
                view, light purple (ultraviolet) for the hottest. The scale
                stretches between two cutoff bounds and refits every time new
                frequencies appear — nothing here is labeled by quark type
                anymore; energy decides.
              </p>
              <p>
                Right below the scale, the relative abundance of each
                frequency on the spectrum — which end of the scale the
                resonator actually lives at. Then the Space-Time Domain's
                three graphs remade in true colors: the individual firings,
                the slice, and the 3D surface — every point wearing the
                additive mix of the pulses reaching it. Last, the components
                drawn one by one in 1D, so you can watch the sum wash toward
                white.
              </p>
            </div>
          </div>

          <ColorTheory entropy={entropyC} waveAmp={waveAmpC} shown={showC} showComponents={false} showEquations={false} />
          <FrequencyDistribution entropy={entropyC} shown={showC} />
          <PointSources trueColors entropy={entropyC} waveAmp={waveAmpC} decay={decayC} />
          <ColorTheory entropy={entropyC} waveAmp={waveAmpC} shown={showC} playing={playingC1} speed={speedC1} onPlayingChange={setPlayingC1} onSpeedChange={setSpeedC1} showScale={false} showEquations={false} />
          </>
          )}
          {sim === 'sun' && (
          <>
            <ModellingSun entropy={entropyS} waveAmp={waveAmpS} decay={decayS} />
          </>
          )}
        </div>

        <div className="lab-side">
        <div className="lab-controls">
          {sim === 'surface' && (
          <>
          <div className="control-group">
            <h3>Entropy</h3>
            <Slider label="s" value={entropy} min={0} max={1000000} step={1}
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
          </>
          )}
          {sim === 'sphere' && (
          <>
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
            <h3>Point energy &amp; mass</h3>
            <div className="readout">
              <Row k="m" v="1" />
              <Row k="E" v="1" />
              <Row k="E · m" v="1" />
            </div>
            <p className="graph-note">The 1:1 sphere — energy and mass are equal everywhere.</p>
          </div>
          </>
          )}
          {sim === 'time' && (
          <>
          <div className="control-group">
            <h3>Entropy</h3>
            <Slider label="s" value={entropyT} min={0} max={1000000} step={1}
              onChange={setEntropyT} format={(v) => v.toFixed(0)} />
            <p className="graph-note">Higher entropy, more eigenstates on each axis — every axis keeps its own chain.</p>
          </div>

          <div className="control-group">
            <h3>Wave</h3>
            <Slider label="a" value={waveAmpT} min={0} max={0.2} step={0.01}
              onChange={setWaveAmpT} format={(v) => v.toFixed(2)} />
            <p className="graph-note">One wave per eigenstate at amplitude a/√k on each axis.</p>
          </div>

          <div className="control-group">
            <h3>Decay</h3>
            <Slider label="d" value={decayP} min={0} max={1} step={0.01}
              onChange={setDecayP} format={(v) => v.toFixed(2)} />
            <p className="graph-note">Each pulse loses energy as it travels — 0 is no decay, 1 is fast decay.</p>
          </div>

          <div className="control-group">
            <h3>Components</h3>
            <Slider label="shown" value={compCount} min={0} max={20} step={1}
              onChange={setCompCount} format={(v) => v.toFixed(0)} />
            <p className="graph-note">The first 20 eigenstate waves of each axis, drawn faint in their own fundamental's color.</p>
          </div>

          </>
          )}
          {sim === 'mass' && (
          <>
          <div className="control-group">
            <h3>Entropy</h3>
            <Slider label="s" value={entropyM} min={0} max={1000000} step={1}
              onChange={setEntropyM} format={(v) => v.toFixed(0)} />
            <p className="graph-note">Higher entropy, more eigenstates on each axis — every axis keeps its own chain.</p>
          </div>

          <div className="control-group">
            <h3>Wave</h3>
            <Slider label="a" value={waveAmpM} min={0} max={0.2} step={0.01}
              onChange={setWaveAmpM} format={(v) => v.toFixed(2)} />
            <p className="graph-note">Drives the motion — larger a, wilder masses.</p>
          </div>

          <div className="control-group">
            <h3>Decay</h3>
            <Slider label="d" value={decayM} min={0} max={1} step={0.01}
              onChange={setDecayM} format={(v) => v.toFixed(2)} />
            <p className="graph-note">Wave motion fades with distance from the center — 0 is no decay, 1 falls off fast.</p>
          </div>

          </>
          )}
          {sim === 'color' && (
          <>
          <div className="control-group">
            <h3>Entropy</h3>
            <Slider label="s" value={entropyC} min={0} max={1000000} step={1}
              onChange={setEntropyC} format={(v) => v.toFixed(0)} />
            <p className="graph-note">Reseeds the 1D component chain — and fires the 3D pulses faster.</p>
          </div>

          <div className="control-group">
            <h3>Wave</h3>
            <Slider label="a" value={waveAmpC} min={0} max={0.2} step={0.01}
              onChange={setWaveAmpC} format={(v) => v.toFixed(2)} />
            <p className="graph-note">One wave per eigenstate at amplitude a/√k — newer combinations weaker.</p>
          </div>

          <div className="control-group">
            <h3>Components</h3>
            <Slider label="shown" value={showC} min={1} max={40} step={1}
              onChange={setShowC} format={(v) => v.toFixed(0)} />
            <p className="graph-note">How many eigenstate waves join the sum — watch the sum's color wash toward white.</p>
          </div>

          <div className="control-group">
            <h3>Decay</h3>
            <Slider label="d" value={decayC} min={0} max={1} step={0.01}
              onChange={setDecayC} format={(v) => v.toFixed(2)} />
            <p className="graph-note">The 3D pulses fade as they age — 0 is no decay, 1 dies fast.</p>
          </div>

          </>
          )}
          {sim === 'sun' && (
          <>
          <div className="control-group">
            <h3>Entropy</h3>
            <Slider label="s" value={entropyS} min={0} max={1000000} step={1}
              onChange={setEntropyS} format={(v) => v.toFixed(0)} />
            <p className="graph-note">Reseeds the firings — and fires the pulses faster.</p>
          </div>

          <div className="control-group">
            <h3>Wave</h3>
            <Slider label="a" value={waveAmpS} min={0} max={0.2} step={0.01}
              onChange={setWaveAmpS} format={(v) => v.toFixed(2)} />
            <p className="graph-note">One wave per eigenstate at amplitude a/√k — the surface is normalized, so this sets the ripple height, not the color.</p>
          </div>

          <div className="control-group">
            <h3>Decay</h3>
            <Slider label="d" value={decayS} min={0} max={1} step={0.01}
              onChange={setDecayS} format={(v) => v.toFixed(2)} />
            <p className="graph-note">The pulses fade as they age — 0 is no decay, 1 dies fast. The gradient sets the color; decay only thins the waves.</p>
          </div>

          </>
          )}
        </div>
        </div>
      </div>

    </div>
  )
}
