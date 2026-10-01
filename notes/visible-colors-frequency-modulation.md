# Visible Colors as a Result of Frequency Modulation

*2026-10-01 — This is a theory, not a result. I'm experimenting with ideas here, and this note replaces the earlier amplitude-modulation note, which I now think was the wrong approach. I'm keeping the history of what I tried, because the dead ends taught me what the answer has to do.*

## 1. What I'm trying to rectify

My quark frequencies sit at $\sim 10^{20}$ Hz. Visible light sits at $\sim 10^{14}$ Hz. Same universe, six orders of magnitude apart. The question that won't leave me alone: how do the fundamental emission frequencies get transferred — modulated — down to the scale our eyes actually see?

| Quark state | Frequency | Wavelength | Energy |
|---|---:|---:|---:|
| $\frac13f_q$ | $1.07\times10^{20}\,\text{Hz}$ | $2.79\,\text{pm}$ | $0.44\,\text{MeV}$ |
| $\frac23f_q$ | $2.15\times10^{20}\,\text{Hz}$ | $1.39\,\text{pm}$ | $0.89\,\text{MeV}$ |
| $f_q$ | $3.22\times10^{20}\,\text{Hz}$ | $0.93\,\text{pm}$ | $1.33\,\text{MeV}$ |
| $\frac43f_q$ | $4.30\times10^{20}\,\text{Hz}$ | $0.70\,\text{pm}$ | $1.78\,\text{MeV}$ |

with $f_q = (2/3)m_qc^2/h$ and $m_qc^2 = 2\,\text{MeV}$. These are gamma rays, roughly a million times above visible light. The violet edge of vision ($789\,\text{THz}$) sits $136{,}000$ times below the *lowest* quark frequency. So the frequencies have to scale down — that part isn't negotiable. The question is only *how*.

## 2. What I tried first, and why each failed

**Doppler shift.** Motion shifts frequency — real physics, so I checked it: Earth's spin, Earth's orbit, the Sun's galactic orbit, the Sun's motion against the CMB. All of them multiply to $\approx 0.998$. To bridge the gap I'd need $\beta \approx 0.999999999892$ — twelve nines. Nothing we ride on moves like that. Tapped out.

**Amplitude modulation.** My previous note. Wrong quantity. AM changes *brightness*, and light travels at the same speed regardless of frequency — so losing energy to gravity (or anything else) means amplitude loss, not slowing down, not shifting. Dimmer photons, same color. The mechanism has to act on frequency itself.

**Planet mass ratios.** Sun/Earth $= 3.33\times10^5$ does park the quark band roughly on top of visible light. But there's no mechanism — mass ratios don't shift frequencies in any physics I know — and with 36 planet pairs you'd expect a few chance hits anyway. Numerology wearing a lab coat.

**The speed-bump cascade.** Light climbing out of every gravity well on the way here. I summed all of them: $2.16\times10^{-6}$ fractional, total. Needed: $0.999999$. Short by $\sim 5\times10^5$. And fractional $(1-\epsilon)$ effects can't cascade into orders of magnitude no matter how many wells you stack.

**The mass inventory.** Every mass formed is energy subtracted from the field — Earth holds $\sim 10^{52}$ quarks, the Sun $\sim 10^{57}$. But the Sun's mass-energy as a frequency is $M_\odot c^2/h \approx 2.7\times10^{80}\,\text{Hz}$: more locked-up mass means *higher* equivalent frequency, the wrong direction entirely. And subtracting energy thins the field — amplitude again, not frequency.

## 3. The new idea: frequency modulation inside the Sun

Then I remembered something I'd heard: light takes a long time to leave the Sun. It gets stuck. It bounces around. What if *that* is the frequency modulation?

Here's the real physics, which I checked rather than assumed. Fusion in the core manufactures gamma rays at $\sim\text{MeV}$ — that's $\nu \sim 10^{20}\,\text{Hz}$, my quark band exactly. Those photons do not fly out. They random-walk: mean free path of millimeters, $\sim 10^{25}$ scatterings, $\sim 10^5$ years to reach the surface. At every scattering the photon is absorbed and re-emitted at the energy of the *local* plasma — and the plasma cools as you move outward, from $1.5\times10^7\,\text{K}$ in the core to $5778\,\text{K}$ at the surface. So the photon keeps re-thermalizing to cooler and cooler surroundings as it climbs. Compton scattering off the cooling electrons chips a fraction off the frequency at each collision.

The books balance, and this is the part I love: entropy increases toward the surface, which means more possible values — one MeV quantum becomes $\sim 10^5$–$10^6$ visible photons, total energy conserved. The spectrum doesn't just shift; it *multiplies*. And the amount of mass in the Sun is what sets the whole thing up: the mass sets the optical depth (how many collisions) and, through hydrostatic balance, the core temperature and the gradient. More mass, more collisions, more entropy, more complete modulation.

The rough accounting: MeV → keV thermalizes almost immediately in the core ($\sim 10^3\times$), then the random walk down the temperature gradient gives another $\sim 2.6\times10^3\times$. Total $\sim 10^5$–$10^6$ — the missing orders, delivered by a real mechanism that acts on *frequency*.

## 4. Why it's not typical frequency modulation

I should be honest about what this is and isn't. Radio-style FM is *coherent*: it preserves the signal's structure while shifting it — that's why FM radio works. What happens in the Sun is thermalization, which is *incoherent*: it erases the input spectrum and replaces it with a blackbody. A $10^{20}$ Hz input and a $10^{23}$ Hz input give identical sunlight.

Here's why I'm not bothered: we don't need the 2:3 ratios preserved here. The 2:3 ratio belongs to the underlying field frequencies generated by mass forming, and to how masses interact with the field. This light has no mass — it's radiation, not structure. Preserving the ratios doesn't matter. What matters is that the frequencies undergo a transformation, get shifted, and there's a mapping between the bands. Technically the shift isn't even uniform — some frequencies get shifted more than others, I'm not sure of the exact rule — but a mapping exists, and that's what I'm after.

## 5. The mapping: our spectrum against the real one

Our quark "spectrum" is a display convention — physically it's gamma rays. But we assigned it colors by energy ordering, and visible light is also ordered by frequency, so the two orderings line up. The table below is illustrative — part of the theory, not exact numbers. The solar physics in §3 is established science, not something new; what's mine is using it as the bridge that maps our quark display colors onto actual colors.

![Our quark 'spectrum' (display convention — physically gamma rays)](/note-images/quark-spectrum-bar.png)

![The actual visible spectrum](/note-images/visible-spectrum-bar.png)

And the correspondence, per color, with how much each has to scale down:

| Our quark color | Quark frequency | Visible counterpart | Visible frequency | Scale-down factor |
|---|---|---|---|---:|
| red ($\frac13f_q$) | $1.07\times10^{20}\,\text{Hz}$ | red ($\sim 700\,\text{nm}$) | $4.28\times10^{14}\,\text{Hz}$ | $2.5\times10^5$ |
| yellow ($\frac23f_q$) | $2.15\times10^{20}\,\text{Hz}$ | yellow ($\sim 580\,\text{nm}$) | $5.17\times10^{14}\,\text{Hz}$ | $4.2\times10^5$ |
| teal-green ($f_q$) | $3.22\times10^{20}\,\text{Hz}$ | green ($\sim 530\,\text{nm}$) | $5.66\times10^{14}\,\text{Hz}$ | $5.7\times10^5$ |
| blue ($\frac43f_q$) | $4.30\times10^{20}\,\text{Hz}$ | blue ($\sim 470\,\text{nm}$) | $6.38\times10^{14}\,\text{Hz}$ | $6.7\times10^5$ |
| — | — | infrared cutoff ($\sim 750\,\text{nm}$) | $4.00\times10^{14}\,\text{Hz}$ | no quark equivalent |
| — | — | ultraviolet cutoff ($\sim 380\,\text{nm}$) | $7.89\times10^{14}\,\text{Hz}$ | no quark equivalent |

Note the factors aren't equal — $2.5$ to $6.7\times10^5$ across the band. That's consistent with thermalization rather than a single clean scaling: the mapping is real but not uniform, and I'm not going to pretend I know the exact rule yet. But look at the pattern: the factors *climb with frequency* — $2.5$, $4.2$, $5.7$, $6.7\times10^5$ — so higher frequencies get divided down harder than lower ones. Temperature is acting like a **non-linear modulator**: the modulation depth depends on the input. That's exactly what you'd expect from thermalization rather than multiplicative scaling, and it's why I don't think there's one single "scale factor" to find.

## 6. Attenuation at different temperatures

If temperature is a non-linear modulator, I wanted to see what the modulation looks like at different depths — not just end to end. The idea: at temperature $T$, a photon of frequency $\nu$ sits a factor $h\nu/kT$ above what the local plasma can thermally sustain. That's the attenuation pressure at that depth. Averaging $1/T$ over a temperature range gives the mean attenuation each part of the quark band feels while passing through it. Illustrative model, not exact numbers — the point is the shape.

![Temperature as a non-linear modulator: attenuation of the quark band at different depths in the Sun](/note-images/temperature-attenuation.png)

Three things jump out at me:

1. **Within each panel the curve rises with frequency** — higher frequencies get divided down harder. That's the non-linearity from §5, drawn out: the modulator's strength depends on the input.
2. **The outer, cooler layers dominate.** Most of the modulation happens where the input is furthest from equilibrium, near the surface. The core's panel sits two orders lower — at $10^7$ K the plasma is "closer" to the input, so there's less left to modulate.
3. **The fourth panel looks like the outer-Sun curve.** The total end-to-end mapping from the table has the same shape and nearly the same size as the outer range's attenuation. Consistent: the last, coolest stretch does most of the work.

## 7. Modelling it — the Sun simulation

I built this into the Quark Space as a simulation ("Modelling the Sun," right after the Color Theory tab), so I can watch the mapping happen instead of just tabulating it. The setup mirrors the model in this note: quarks fire inside a smaller inner sphere, hidden from view, and their waves travel outward at their normal speed through the temperature gradient, getting frequency-shifted as they climb. Each pulse is colored once — by where its frequency lands after the full trip through the gradient, using the end-to-end factors from the table in §5, interpolated log-log between the three anchors. The surface is the photosphere: normalized, relative emission only, rippling as wavefronts cross it — the gradient changes nothing but the color.

What you see on the surface is the actual visible spectrum, not our display convention — dark red (infrared) for anything landing below it, light purple (ultraviolet) for anything above. The number line above the surface shows the three fundamentals marked where they land — 1/3 f_q in the red, 2/3 in the yellow, 4/3 in the blue — with the attenuation distribution of each frequency below it. Press play and the colors ripple as wavefronts cross: the modulation, made visible.

## 8. The gradient test

The first model starts with the table's factors — the expected attenuation. But the table was drawn from the temperature-gradient picture, so I should expect an actual gradient model to reproduce it. That's the second model in the "Modelling the Sun" tab: no table in it at all.

Each pulse carries its quark frequency outward through a real temperature profile, $T(x) = T_{\\mathrm{phot}} + (T_{\\mathrm{core}} - T_{\\mathrm{phot}})(1-x)^2$ ($x = r/R_\\odot$, an analytic approximation to the standard solar model with the Sun's actual mass, $1.989\\times10^{30}\\,\\text{kg}$, setting the gradient's strength), shedding energy by Compton scattering at every step — $dE/dn = -(E/m_e c^2)(E - kT)$, integrated exactly. Sped up: $S$ representative scatterings per journey stand in for $\\sim 10^{25}$ (a slider — the model's main condition). When a pulse reaches the surface, the model records how far it was actually divided down: $A = \\nu_{\\mathrm{in}}/\\nu_{\\mathrm{out}}$, with $\\nu_{\\mathrm{out}}$ sampled from the Planck distribution at the landing energy, since the escaping light is re-emitted thermal radiation, not the original gamma. The attenuation graph builds itself from that recorded history — running averages per fundamental that wobble, then settle. Below it, the four fundamentals ($\\frac13f_q$, $\\frac23f_q$, $f_q$, $\\frac43f_q$) position themselves on the visible spectrum where they actually landed, clamped at the infrared/ultraviolet edges, still adjusting until the history settles. Changing the entropy reseeds the experiment; changing $S$ restarts it under different conditions.

What the model says on paper, before running it: once the scatterings are numerous enough, every input forgets where it started — the cooling equation converges too fast for the starting energy to matter — so the measured attenuation comes out proportional to the input frequency ($A \\propto \\nu_{\\mathrm{in}}$), a straight line against the table's curve. The level can be tuned into the table's ballpark with $S$ — the gradient genuinely divides by $\\sim 10^5$–$10^6$, so the FM order of magnitude holds — but the per-color separation doesn't fall out of Compton cooling alone. And there's a reason it can't finish the job: each halving of the energy costs $\\sim m_e c^2/E$ scatterings — cheap at MeV, ruinous at eV — so the cooling stalls in the cold outer layers. The missing piece is true absorption and re-emission, exactly what §3 says the real Sun does. So this is a first attempt, deliberately improvable: change the model, and watch whether the measured points move toward the expected curve or away from it.

One thing the first version of the test got wrong was where the pulses are born: all four fundamentals fired from the same inner sphere. But a 4/3 is two 2/3s — a different reaction than a lone 1/3 looking for partners — and the pressure of the Sun should matter for which combinations assemble where. A combination that's easier to form can form further out, where the pressure is lower. So now each fundamental gets its own generator sphere, radii in the ratio 1:2:3:4 — 1/3 $f_q$ deepest, 4/3 $f_q$ reaching furthest toward the surface, which is what pulls the 4/3 point (it was overshooting) down toward its expected value. Two things fell out of testing this that I didn't expect. First, the scattering budget has to shrink for shorter journeys: a random walk's steps go as the square of the optical depth, so each journey gets $S(1-x_0)^2$ scatterings, where $x_0$ is the birth radius. Spreading the same $S$ over a shorter path actually cools the shallow births *more* — backwards — so the scaling isn't a tweak, it's load-bearing. Second, once the spheres are in, the measured curve bends: it stops being a straight line and leans toward the table's gentler slope, with the slider's default retuned from $2\\times10^7$ to $4\\times10^7$ to hold the level. The shape of the curve is now something the model produces, not something I put in — which is the whole point of the test.

Since writing that, I've pushed the whole nest of spheres outward: the $f_q$ sphere now sits at half the Sun's radius, with 4/3 $f_q$ reaching two-thirds of the way out — because the blue and green points were still cooling too much. The 4/3 point now lands almost exactly on its expected value, and the measured curve leans a little further toward the table's gentler slope. The ratio stays 1:2:3:4; only the overall scale moved.

One more turn of the same knob: the scattering scaling went from $S(1-x_0)^2$ to $S(1-x_0)^{2.5}$, with the default retuned to $6\\times10^7$. The 2 is the uniform-medium random walk; 2.5 is a small step toward a centrally-concentrated star, where the optical depth from a birth radius grows faster than the remaining path. (The full realistic extreme would thermalize everything — which is exactly what the real Sun's spectrum shows — so this stays a stand-in.) The measured log-log slope moved from 0.85 toward the table's 0.72, and every point now sits within a few percent of its expected value: $A \\approx \\{2.33, 4.32, 5.88, 6.89\\}\\times10^5$. I also checked the Klein–Nishina cross-section — the real energy-dependent Compton cross-section, which genuinely makes high-energy photons scatter less — and it changes nothing here: the MeV phase is over in a handful of scatterings, and the attenuation is set by the freeze-out at electron-volt energies. A good reminder that a real effect can still be the wrong lever.

### The sun that remembers

The flash view is instantaneous: between pulses the sphere falls back to its bland base color, and most of the time that's all you see. So there's a third view at the bottom of the tab with its own experiment — its own pulses, its own play/pause/speed and clock, independent of the flash view. The surface keeps the color of the most recent thing that hit it: when a wavefront crosses a patch, that patch takes the flash's color and holds it, fading slowly back toward neutral over about forty seconds until the next wave repaints it. No averaging, so the colors stay pure. And only visible colors paint it — ultraviolet and infrared waves still ripple the surface as they pass, they just don't show their color, so a patch keeps the color of the previous thing that hit it. A pulse's hot leading edge arrives at the surface still clamped to ultraviolet and would otherwise wash out the mosaic before the visible landing color gets its turn. The firing rate is doubled (the physics per journey is unchanged — it just settles the graphs faster too). The result is a slowly-evolving mosaic of recent landings: the closest thing in the tab to what the model claims the Sun looks like — not a flickering ball, but light accumulating.

On entropy: the Sun's total is $\\sim 10^{35}\\,\\text{J/K}$ (order of magnitude — Wikipedia's "Orders of magnitude (entropy)," citing Bekenstein 1973), far beyond anything simulable. That's why the experiment keeps entropy as the relative 0–1,000,000 dial.

## 9. The physics anchors

Collecting the pieces this theory stands on, all standard:

- **Compton scattering**: photons scattering off cooler electrons lose a fraction of their energy per collision — a genuine per-collision frequency downshift, repeated $\sim 10^{25}$ times.
- **Temperature gradient**: $1.5\times10^7\,\text{K}$ core to $5778\,\text{K}$ surface. The scatterings only enforce local equilibrium; the *gradient* does the shifting.
- **Blackbody radiation**: each layer of the Sun radiates approximately as a blackbody at its own local temperature — so the temperature gradient modulation is really the light being handed from one blackbody curve to the next as it climbs outward, each step re-emitted at a lower temperature, until the photosphere radiates at $5778\,\text{K}$.
- **Sun's mass** ($1.989\times10^{30}\,\text{kg}$): sets the optical depth and, through hydrostatic equilibrium, the core temperature. The modulator's strength is the star's mass.
- **Escape time** ($\sim 10^5$ years): the "gets stuck and bounces around" I started from — the random walk is what gives thermalization time to complete.
- **Thermalization**: the process itself — absorption and re-emission replacing the input spectrum with the local thermal one, entropy rising outward, one high-energy quantum becoming $\sim 10^6$ low-energy ones.

## 10. Where this stands

This is still a theory, and I'm just experimenting with ideas. What I have: a real, checkable mechanism that shifts *frequency* (not amplitude) by roughly the right number of orders, with the Sun's mass setting its strength — and a color-by-color mapping between our quark display spectrum and the actual visible one. What I don't have: the exact non-uniform scaling rule in the table, or anything beyond the Sun (though every photon we've ever seen went through a star, so the Sun may be all the theory needs for light). The 2:3 structure lives in the mass-forming field, untouched by this — light is just passing through.
