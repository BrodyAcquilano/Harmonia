# The Sun

*2026-10-02 — This note is the working document for "The Sun", its own tab in the Quark Space — the finished version. "Modelling the Sun" (the other tab) was the trial run: flash, remember, cool, and the forget view that asked whether birth is forgotten. The old frequency-modulation note stays where it is — it's the history of how I got here — but this is the clean one: everything I learned, one sim, one note.*

## 1. The correction that started it

I had the birth wrong. In the old sims, quarks were *fired* — created, flung outward, as if fusion manufactures quarks. It doesn't. Fusion *flips* them. The proton-proton chain:

$$p + p \to d + e^+ + \nu_e$$

two protons (uud + uud) become a deuteron (uud + udd) plus a positron and a neutrino. Count the quarks: six in, six out. What changed is one flavor — an up quark became a down quark. Nothing created, one thing flipped.

And the flip is exactly one full unit of charge: $2/3 - (-1/3) = 1$. That's the ratio everything hangs on. In my framework the quark carries 2 MeV ($m_q c^2$), so a full unit flip carries the full 2 MeV quantum — frequency $\nu = E/h \approx 4.84 \times 10^{20}\,\text{Hz}$. One base frequency, not four. The 1/3, 2/3, 4/3 band machinery was scaffolding for a question that's now answered; it's retired.

## 2. The sun as a fusion reactor

Once the birth is right, the core stops being mysterious and starts being *predictable* — it's a reactor with known reactions. The sun burns hydrogen to helium via the pp chain, about $1.8 \times 10^{38}$ proton-pair fusions per second (from $L_\odot = 3.828 \times 10^{26}\,\text{W}$ at 26.73 MeV per He-4). The gammas it actually emits are MeV-order: 0.42 MeV kinetic plus 1.02 MeV annihilation per pp step, 5.49 MeV from D+p. My 2 MeV quantum sits in the right decade — close enough for a coarse-grained packet, and the exact number washes out within centimeters anyway (§4).

One correction I owe myself: I wondered if the sun is at the iron stage. It isn't — not even close. The sun is on step one, hydrogen burning, and it will never get past carbon/oxygen; it ends as a white dwarf. Iron cores belong to stars above ~8 solar masses, the ones that go supernova. The predictability I wanted is real, it's just the pp chain, not an iron core.

## 3. How the firing works

The core fires as a Poisson process — the honest statistics of "each little volume has a constant probability per unit time of fusing." About 7 packets per sim-second, each born at the core ($0.01\,R_\odot$) with the 2 MeV quantum, each walking out independently.

The coarse-graining, stated plainly: the sun fuses $\sim 10^{38}$ pairs per real second and a photon walks $\sim 10^5$ years to escape; the sim fires 7 packets per sim-second and walks out in $\sim 20$ sim-seconds. Each packet stands in for $\sim 4\\times 10^{48}$ real fusions. The absolute scale is compressed away — what's preserved is the statistical structure: steady Poisson firing at the center, random-walk delay, immediate thermalization.

## 4. The journey: birth forgotten on the first hop

Everything I learned about the walk still holds, and it's simpler now. Each packet random-walks outward with honest 3D steps — no outward drift — one display hop standing in for $(\text{hop}/\text{mean-free-path})^2$ real scatterings, $\sim 10^{22}$ of them down in the core. Compton thermalization needs only a few hundred scatterings across centimeters, so each hop fully thermalizes the packet: its frequency is sampled from the Planck distribution at the local temperature.

The 2 MeV birth quantum survives exactly one hop. After that the packet *is* the local plasma's temperature, riding it outward — this is the null result from the old note, kept: at MeV energies the opacity is pure Thomson, frequency-blind, so every input thermalizes within centimeters of birth. The "One birth, one curve" graph draws it: one yellow dot at the core, one crash line into the gold thermal curve. What escapes is set by the surface, not by the birth.

## 5. How frequencies are actually produced

This is the part I had backwards for a while: the sun doesn't *preserve* frequencies, it *manufactures* them thermally. Nothing of the 2 MeV quantum reaches the surface. Instead, every hop re-samples from the local Planck distribution, and what finally escapes is sampled from the Planck distribution at 5778 K — the photosphere's own light. The "Where the sunlight actually lands" graph checks this: the escaping spectrum (bars) against the 5778 K blackbody (teal). One frequency in, the sun's own light out.

So the frequency story has two halves with opposite arrows: fusion *releases* MeV quanta at the core (quark flips, predictable), and thermalization *replaces* them with the local blackbody at every step (random draws, unpredictable individually, exact statistically). The 2:3 structure lives in the flip; the light forgets it.

## 6. The surface: energy flux made visible

Every escaping packet deposits its photon's energy as heat in a small patch around its exit direction (gain 0.5 at the splash center, tuned so the sphere spans the full range without saturating). Each patch's temperature is the local escaping energy flux — accumulated buildup, not the incoming photon's frequency — cooling by Newton's law on a 40-second tau between hits.

A patch glows with the visible light a blackbody at its temperature produces: the brightness is the real Planck integral over the visible band, so cold patches make almost no visible light and sit near black while hot ones blaze violet. The hue runs the full spectrum — dark red through orange, yellow, green, blue and purple to violet at the hot end — assigned by inverse-density warping: the temperature-to-color mapping is flat where the amplitude is high — dense ranges stretch over wide, calm color bands — and steep where thin (narrow ranges, compressed), tilted so red stretches and ultraviolet compresses. Higher amplitudes stretch the color range because there's more area there; lower areas compress. (The first try at this had it backwards, bunching color stops into dense regions; the correction was to invert it.) The warping recomputes live from the patch-temperature histogram, which forgets on ~45 s — the colors track the distribution as it shifts. The "Patch temperature distribution" panel shows the live histogram against the old design assumption, with the live color strip and its twelve ruler marks: even gradient steps mapped through the warping, spreading where it stretches, bunching where it compresses.

Infrared shows as dark rather than being filtered out — it's real escaping energy, just not visible.

## 7. The ripples carry their photons

Every escape also launches a wave at its exit point — a damped ring radiating outward. The baseline amplitude is the photon's energy (the ripple slider multiplies all of them); the baseline wavelength and frequency are the photon's *own* wavelength, scaled so 550 nm gives the reference ripple: hot blue photons make tight fast ringlets, cool infrared ones broad slow swells, every ripple travelling at the same phase speed. (Slowed down so we can see them — an honest visualization choice, stated in the caption.) The lifetime slider (0–40 s) sets how long they live; with long lifetimes hundreds coexist and genuinely interfere — linear superposition, same frequency family, so fringe patterns rather than beats. Ripples displace only; they never touch the colors.

## 8. Cycles and sunspots

Watching it run, the sim breathes: stretches where the surface is busy — bright spots flaring all over — then quiet stretches where escapes thin out and it cools and darkens. It reminds me of sunspot maximum and minimum, which stopped me, because there's no cycle in the model. Nothing periodic drives it.

What's actually happening, as far as I can tell: the 48-odd walkers have broadly distributed escape times (deep births take ~7× longer than shallow ones), so escapes arrive in bursts and lulls — and with 40-second lifetimes the ripples pile up during bursts, disturbed in every direction at once, which is what I'd expect from the sun at high activity. Then the 40-second surface memory and 45-second color memory low-pass-filter the flicker into slow swells. Random arrivals, smoothed by a surface that remembers: that's all it takes to look cyclic. A stationary random process has a characteristic timescale but no phase — it feels rhythmic but can't keep time, and if you watch long enough the "period" wanders.

I'm not claiming this *is* the solar cycle — the real one is an 11-year magnetic polarity reversal with dynamo machinery this model knows nothing about, and filtered noise can't flip a sign. But the stochastic ingredient is genuine: real cycle amplitudes wander, and grand minima look like the dynamo stumbling. The sim has the modulation without the clock. And the dark patches are honest sunspots in one specific sense: regions the light hasn't visited in a while, cooled toward black.

## 9. What's retired, and why

The attenuation graph is gone — it measured per-band divisions ($A = \nu_{in}/\nu_{out}$) against the note's table, and the answer came back "complete thermalization," which the new sim takes as given rather than re-measuring. The four birth bands are gone — one quantum, one dot. The shell-birth radii (0.2–0.7 $R_\odot$, then band-dependent spheres) are gone — everything fires at the core, because that's where fusion happens. None of it was wasted: each piece was scaffolding for the question "does the input survive?", and the answer — no, within centimeters — is what let me build this clean.

## 11. The Sun — on the visible band

A second view of the same sun, added 2026-10-02. The sphere ignores infrared and ultraviolet and only plots the visible spectrum part. The colors are assigned the same way — inverse-density warping with the cold-stretch tilt — but only within the visible band: 1.65–3.26 eV, the photon energies of 750–380 nm. Only the visible band feeds its warping histogram, so the stretch and compress is driven only by the energy produced by frequencies in that band — by their amplitudes and their relative abundance there. In effect the visible energy becomes the dominant energy source for the color a patch gets.

Patches colder than 1.65 eV (infrared) or hotter than 3.26 eV (ultraviolet) take no new color — each patch keeps whatever the last visible color that hit it was, dimming naturally as it cools. So there are no dark spots: light is still emitted there, only the visible part is shown, at whatever intensity the cooling leaves. No intensity reduction was needed — the Newton cooling handles it on its own. The ripples follow the same rule: only visible photons radiate waves on this sphere. Everything else is the same experiment: the same Poisson core firing, the same random walk, the same heat deposited per escape, just a second run of it.

The distribution panel still shows the full patch-temperature spectrum developing and piling up — but now its bars are colored by band: dark red rectangles for infrared, the assigned visible colors inside the band, light purple rectangles for ultraviolet. The color strip below still carries no colors outside the visible band. The ruler marks are the visible band's own warping: spreading where its colors stretch, bunching where they compress.

Why this view: the first sphere shows the whole thermal story, including the dark infrared bulk. This one asks what the sun looks like if you only listen to the band we can actually see — which patches dominate the visible light, and how the visible colors share themselves out.

## 12. The Sun — by adding light

A third view, added 2026-10-02 (and corrected the same night — the first version computed blackbody chromaticities, which missed the point). The first two color the sun by warping — stretching and compressing a palette across the temperature distribution. This one does something different: every escaping photon deposits its spectral color onto the patch it exits through, added to whatever color is already there at its current, partially cooled intensity.

Hit a spot with a red photon, then a blue one before the red has cooled, and the two combine on the surface. Many colors piling up go toward a warm peach (the palette's mean, 255,190,155 — not neutral white, and I like it that way); red alone stays red; red and orange mix to orange. The accumulated colors fade as the patch cools — no intensity reduction was needed beyond the natural cooling. No warping, no stretch/compress: the color is what's actually piled up, not a reassignment.

The exact math, per visible photon (E in eV, 1.65–3.26): its hue H is the spectral RGB at λ=1240/E from the palette; each nearby patch gets ΔRGB = H × E × 0.15 × gaussian — hue times photon energy times gain times the spatial falloff. A 3.26 eV blue photon deposits about twice the intensity of a 1.65 eV red, because it carries twice the energy. Every frame the accumulated RGB fades by exp(−dt/40s), the same 40-second cooling as the temperature.

The distribution panel keeps its color strip, but the strip is not a warping. For each temperature it shows the average of the photon colors actually accumulated on the surface patches sitting at that temperature — each part of the distribution assigned the color that's really there. The ruler marks are gone; there is nothing to stretch.

Why this view: the warping views answer "how do we share colors across what the sun is doing." This one answers "what happens if the surface just keeps what hits it" — additive light, the way paint mixes, driven by the real photon stream.

## 13. The Sun — as a thermometer

A fourth view, added 2026-10-02. The honest baseline: each patch shows the blackbody color for its temperature — dim orange-red where cool, warm white where sun-like, blue-white where hot — with no warping, no photon history, no stretch or compress. The temperature at each point is the local energy flux from wave hits, cooling over time by Newton's law.

I almost didn't add it — without warping, would it just be one color? No: the patches span 1.2 to 4+ eV. The temperature is scaled so hot patches (~3.5 eV) reach the 5778 K sun-surface yellow-white; cooler spots read red-orange. (Anchoring the typical 2.4 eV to 5778 K pushed the hot end into blue-white, which isn't the sun — the scaling is what makes it a useful thermometer.)

The color is the 24-wavelength Planck-weighted spectral sum at the scaled temperature — the same math as the "adding light" idea, but applied to the patch's thermal state rather than to arriving photons. The distribution strip is the direct legend: the blackbody color each temperature gets, unshifted.

Why this view: the other three are all display choices layered on the physics — warping, band-filtering, photon accumulation. This one strips them away. Compare any of them against the thermometer to see what the coloring method itself is contributing.

## 14. The four suns, together

2026-10-02. The Sun tab now holds four views of the same physics — same Poisson core firing, same random walk, same heat per escape — differing only in how surface color is assigned. They're worth naming together, because each one strips away a different layer of display choice.

**The Sun (full spectrum).** Shows which waves are hitting the surface most recently. The frequencies are spread across the palette by inverse-density warping, so the one with the highest amplitude gets the greater representation — if the majority of the light hitting the surface is that color, it dominates the view. Red stretches wide and calm over the dense cool bulk; the hot thin tail compresses into violet.

**The Sun — on the visible band.** Does the same, but the surface ignores infrared and ultraviolet: only visible colors are assigned, 1.65–3.26 eV. A patch outside the band keeps whatever its last visible color was, dimming as it cools — no black spots, no holes. The warping listens only to the visible band's energy.

**The Sun — by adding light.** Stops spreading color assignments over a range of frequencies, and stops showing the predominant color for an area under the curve. Instead it integrates: every visible photon deposits its spectral color onto the patch, added to what's already there, fading on an 80-second clock. They combine toward a mostly warm-peach sphere with colored patches where fresh hits land — red alone stays red, many together go peach-white.

**The Sun — as a thermometer.** The final sun, without any of the hidden layers: just the color read from blackbody radiation. There's a base temperature, surface points heat up from hits and cool back down, and at any given temperature the blackbody curve decides the color — but a temperature doesn't emit one color, it emits all of them, the visible sum under the curve. Hot patches (~3.5 eV) reach the 5778 K sun-surface yellow-white; cooler spots read red-orange.

All four leave out atmospheric scattering, which acts as a filter that removes certain frequencies before light reaches an eye on the ground. What you see here is the sun as it is, not as the sky tints it — and the sun itself, for the record, is white, not yellow. "Yellow dwarf" is the atmosphere talking.

## 15. Cooldowns, and why each is what it is

2026-10-02. Every view has clocks, and they're not all the same clock. Here's what's set where, and the reasoning.

**Thermal cooling: 35 s (all four views).** Patch temperatures relax toward the 1.2 eV base on a 35-second exponential. This is the physical cooling — how fast a heated patch forgets the hit. It was 40 s; I trimmed it a smidge at Brody's call for a slightly more dynamic surface. Everything thermal in every view runs on this.

**Warping memory: 45 s (full spectrum and visible band).** The histogram that drives the color warping forgets on 45 s — a touch slower than the thermal cooling, so the color assignment stays stable while the temperatures shift underneath it, but still tracks the distribution as it evolves. The twelve ruler marks visibly drift on this timescale.

**Additive fade: 80 s (by adding light only).** The accumulated photon colors fade on 80 s, much slower than the thermal 35 s. This is deliberate: at 40 s the deposits died between hits and the sphere sat black. At 80 s they pile up — the sphere builds from dark toward the peach steady state, with fresh hits flashing their colors before sinking back in. Brody's diagnosis was "they aren't given enough time to accumulate"; the 80 s is the fix. (We tried 120 s first; 80 s was the call.)

**Thermometer: no color clock.** The blackbody color is instantaneous — it reads the current temperature, no memory, no fade. Only the 35 s thermal applies, through the temperature itself.

**Ripples: user slider (all views).** Default 2.5 s lifetime, adjustable 0–40 s, amplitude 0–3x. These are display, not physics — how long the surface waves linger after each escape.

The pattern: the physics (thermal) runs fastest, the display memories run slower, and the slowest — the 80 s additive — is the one that lets history visibly pile up.
