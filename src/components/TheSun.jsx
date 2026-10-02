import { useRef, useState } from 'react'
import Slider from './Slider.jsx'
import { Transport } from './ModellingSun.jsx'
import {
  ForgetSurface,
  TempDistPanel,
  LandingPanel,
  ForgetTrack,
  freshSunExperiment,
  SUN_ENTROPY,
} from './SunGradientTest.jsx'

// The Sun — its own tab. The finished version; "Modelling the Sun" was
// the trial run. Core fusion firing: every packet born at the core with
// the one 2 MeV fusion quantum, Poisson births, random-walk out,
// thermalized on the first hop. Same surface treatment as the trial run
// (heat, inverse-density warping, frequency ripples), but the graphs are
// the clean set: no attenuation, no quark markers, one birth one curve.
export default function TheSun() {
  const [sunPlaying, setSunPlaying] = useState(false)
  const [sunSpeed, setSunSpeed] = useState(1)
  const [sunRipple, setSunRipple] = useState(1)
  const [sunRippleTau, setSunRippleTau] = useState(2.5)
  const sunExpRef = useRef(null)
  if (!sunExpRef.current) sunExpRef.current = freshSunExperiment(SUN_ENTROPY)
  const sunCtlRef = useRef({})
  const dirtyRef = useRef(0)
  sunCtlRef.current = {
    playing: sunPlaying, speed: sunSpeed, ripple: sunRipple,
    rippleTau: sunRippleTau,
  }
  const sunPlayingRef = useRef(false)
  sunPlayingRef.current = sunPlaying

  // second view: the visible band only. same experiment shape, own run —
  // the sphere ignores infrared and ultraviolet and only plots the
  // visible spectrum part. colors assigned the same way, but the
  // stretch/compress is driven only by the visible band's energy.
  const [sunVisPlaying, setSunVisPlaying] = useState(false)
  const [sunVisSpeed, setSunVisSpeed] = useState(1)
  const [sunVisRipple, setSunVisRipple] = useState(1)
  const [sunVisRippleTau, setSunVisRippleTau] = useState(2.5)
  const sunVisExpRef = useRef(null)
  if (!sunVisExpRef.current) sunVisExpRef.current = freshSunExperiment(SUN_ENTROPY)
  const sunVisCtlRef = useRef({})
  sunVisCtlRef.current = {
    playing: sunVisPlaying, speed: sunVisSpeed, ripple: sunVisRipple,
    rippleTau: sunVisRippleTau,
  }
  const sunVisPlayingRef = useRef(false)
  sunVisPlayingRef.current = sunVisPlaying

  return (
    <>
      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">The Sun</div>
        </div>
        <ForgetSurface expRef={sunExpRef} ctlRef={sunCtlRef} dirtyRef={dirtyRef} />
        <p className="graph-note">
          Its own experiment, its own play and clock, its own fixed seed —
          decoupled from the entropy slider. Fusion flips quarks
          (up↔down), it doesn't create them: every packet is born at the
          core with the one fusion quantum — a full unit of charge
          flipped, 2/3−(−1/3)=1, 2 MeV — fired as a Poisson process, about
          7 packets per sim-second, each standing in for ~4e48 real
          fusions. Each packet random-walks outward through a real stellar
          structure (the Lane-Emden n=3 polytrope, integrated live), one
          twentieth of a radius per hop — every hop stands in for
          (hop/mean-free-path)² honest scatterings, about 10²² of them
          down in the core, and the readout says so. Compton
          thermalization needs only a few hundred, across centimeters, so
          the birth frequency is forgotten on the first hop: the packet's
          frequency is sampled from the Planck distribution at the local
          temperature and rides the local temperature outward. The sphere
          is a blackbody surface: every escape deposits its photon's
          energy as heat in a small patch around its exit direction, so
          each patch's temperature is the local escaping energy flux,
          cooling by Newton's law between hits. A patch glows with the
          visible light a blackbody at its temperature produces, seen
          across a full spectrum — dark red through orange, yellow,
          green, blue and purple to violet at the hot end — assigned
          by inverse-density warping: the mapping is flat where
          the amplitude is high, so dense temperature ranges get wide
          color ranges, and steep where
          thin (narrow ranges, compressed), tilted so red stretches and
          ultraviolet compresses; the infrared shows as dark rather than
          being filtered out; the brightness is the real Planck integral
          over the visible band: cold patches make almost no visible light
          and sit near black, hot ones blaze violet — and every
          escape launches a wave there too, carrying its photon: amplitude
          the escaping photon's energy, wavelength and frequency the
          photon's own wavelength scaled so green light makes the
          reference ripple — hot blue photons tight fast ringlets, cool
          infrared ones broad slow swells, all travelling at the same
          speed (slowed down so we can see them). The ripple slider scales
          the waves' amplitude only, the lifetime slider how long they
          live; the colors are untouched by either.
        </p>
        <Transport
          playing={sunPlaying}
          speed={sunSpeed}
          onPlayingChange={setSunPlaying}
          onSpeedChange={setSunSpeed}
        />
        <div className="transport-speed">
          <Slider label="ripple" value={sunRipple} min={0} max={3} step={0.1}
            onChange={setSunRipple} format={(v) => `${v.toFixed(1)}×`} />
          <Slider label="ripple lifetime" value={sunRippleTau} min={0} max={40} step={0.1}
            onChange={setSunRippleTau} format={(v) => `${v.toFixed(1)} s`} />
        </div>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Patch temperature distribution</div>
        </div>
        <TempDistPanel playingRef={sunPlayingRef} />
        <p className="graph-note">
          What the sphere's colors are assigned from. Orange is the live
          simulated patch-temperature distribution — the histogram the
          adaptive colors read every frame; dashed is the design
          assumption the original fixed scale was tuned against. Where
          they differ, a fixed scale mismatches the data, which is why
          the colors track the live one instead. The strip shows the
          live color assignment: which temperatures get which colors
          right now, with ruler marks at twelve evenly spaced gradient
          positions — watch them spread where the color range stretches
          and bunch where it compresses. The landing panel below is the
          check: it compares the escaping light against the 5778 K
          blackbody, the expected radiation from the sun.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Where the sunlight actually lands</div>
        </div>
        <LandingPanel expRef={sunExpRef} playingRef={sunPlayingRef} markers={false} />
        <p className="graph-note">
          The visible spectrum on a fixed scale; every escaped packet
          builds the escaping spectrum below it, teal the 5778 K
          blackbody. If birth is truly forgotten, the bars follow the
          teal curve — one input frequency in, the sun's own light out.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">One birth, one curve</div>
        </div>
        <ForgetTrack expRef={sunExpRef} playingRef={sunPlayingRef} single />
        <p className="graph-note">
          The test result, drawn: log frequency against fractional
          radius. The gold curve is the local thermal peak from the
          Lane-Emden structure; the yellow dot is the one fusion quantum
          at birth — 2 MeV — with its crash line into the thermal curve
          on the first hop. What escapes is set by the surface, not by
          the birth.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">The Sun — on the visible band</div>
        </div>
        <ForgetSurface expRef={sunVisExpRef} ctlRef={sunVisCtlRef} dirtyRef={dirtyRef} vis />
        <p className="graph-note">
          The same sun, but the sphere ignores infrared and ultraviolet
          and only plots the visible spectrum part. Colors are assigned
          the same way — inverse-density warping with the cold-stretch
          tilt — but only within the visible band (1.65–3.26 eV, the 750–
          380 nm photon energies): the stretch and compress is driven
          only by the energy produced by frequencies in that band, by
          their amplitudes and relative abundance there. That visible
          energy becomes the dominant energy source for the color a patch
          gets. Patches colder than the band (infrared) or hotter
          (ultraviolet) show black — no color assigned. Everything else
          is the same experiment: core fusion firing, Poisson births,
          random-walk out, heat deposited per escape, frequency-carrying
          ripples. The distribution panel below still shows the full
          patch-temperature spectrum developing, dark red included — but
          its color strip carries no colors outside the visible band.
        </p>
        <Transport
          playing={sunVisPlaying}
          speed={sunVisSpeed}
          onPlayingChange={setSunVisPlaying}
          onSpeedChange={setSunVisSpeed}
        />
        <div className="transport-speed">
          <Slider label="ripple" value={sunVisRipple} min={0} max={3} step={0.1}
            onChange={setSunVisRipple} format={(v) => `${v.toFixed(1)}×`} />
          <Slider label="ripple lifetime" value={sunVisRippleTau} min={0} max={40} step={0.1}
            onChange={setSunVisRippleTau} format={(v) => `${v.toFixed(1)} s`} />
        </div>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Patch temperature distribution — visible band</div>
        </div>
        <TempDistPanel playingRef={sunVisPlayingRef} vis />
        <p className="graph-note">
          The full distribution still develops here — orange is every
          patch, dark red infrared included — but the color strip below
          it carries colors only in the visible band. Outside 1.65–3.26
          eV it stays black: no color assigned to infrared or
          ultraviolet. The ruler marks are the visible band's own
          warping, spreading where its colors stretch and bunching where
          they compress.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">Where the sunlight actually lands — visible band</div>
        </div>
        <LandingPanel expRef={sunVisExpRef} playingRef={sunVisPlayingRef} markers={false} />
        <p className="graph-note">
          Same check as above, on this run's own experiment: every
          escaped packet builds the escaping spectrum, teal the 5778 K
          blackbody. One input frequency in, the sun's own light out.
        </p>
      </div>

      <div className="graph-box">
        <div className="graph-title-row">
          <div className="graph-title">One birth, one curve — visible band</div>
        </div>
        <ForgetTrack expRef={sunVisExpRef} playingRef={sunVisPlayingRef} single />
        <p className="graph-note">
          Same test, this run: the one fusion quantum at birth — 2 MeV —
          crashing into the thermal curve on the first hop. What escapes
          is set by the surface, not by the birth.
        </p>
      </div>
    </>
  )
}
