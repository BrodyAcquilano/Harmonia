 # Atmospheric Scattering

*2026-10-02*

## 1. A filter, not a physics

The Sun Filter tab doesn't change the sun. The fusion still fires as a Poisson process, the photons still random-walk out, the patches still heat and cool on their 35-second clock. All of that runs underneath, unseen — there are no distribution graphs here, just the surface.

What changes is what you're allowed to see.

## 2. The Final Sun

The first graph is the thermometer sun — the direct blackbody color per patch — seen through a graphic EQ. Eight sliders sit across the visible band, 380 to 750 nm. Each one moves a single point on the attenuation curve; the curve stays smooth between them, cosine-interpolated, so a slider never makes a step.

The filter is display-only. It doesn't touch the temperatures, the photons, or the energy. It only decides which colors reach your eye.

Turn down the yellow and the sphere loses its yellow. Turn down everything but green and the sphere goes black except where green light is falling — you're seeing the green component of the sunlight, isolated. The curve underneath shows the result: the baseline 5778 K blackbody distribution with your filter applied, the area filled with spectral colors dimmed where the curve runs low, blocked bands sinking into smooth gaps.

## 3. Atmospheric Scattering

The second graph is the same sun, but the filter isn't yours — it's Earth's. A static smooth curve replaces the sliders: the clear-sky vertical transmission at sea level. Rayleigh scattering (the λ⁻⁴ law) dominates, cutting the blue to ~65% at 380 nm while the red passes at ~97%. Ozone's faint Chappuis band broadens the dip near 600 nm; the oxygen B-band notches 690 nm and water vapor dents 720 nm.

The sphere yellows because the sky took the blue. That's not a metaphor — it's the same reason the sun looks yellow from the ground while being white in space. The curve underneath shows the sunlight as the ground receives it.

## 4. False Color + UV

The third graph asks: what if the ultraviolet came along? White is already the brightest thing the visible spectrum can make, so there's no room above it — the visible band has to shift down to make room for something hotter.

So the visible spectrum is compressed toward the red (violet becomes blue, blue becomes green, and so on down), and the ultraviolet (300–380 nm) takes the top end as purples rising to white. That's the NASA move: assign the invisible a color and let relative differences carry the information, not the literal hues.

The hottest patches — the ones with real UV in their blackbody curve — burn purple-white. The EQ filters actual wavelengths (UV shown as purple, though invisible), with the false-color assignment drawn as a second bar underneath so you can read the mapping. Filtering the UV sliders dims the hot spots directly.

This is the filter I mentioned at the end of the sun note: atmospheric scattering as a frequency filter. Here it is, drawn.

## 4. Why filter at all

The four suns in the other tab ask how to assign color. This tab asks a different question: how much of what we call "the sun's color" is the sun, and how much is the filter between us and it? Slide the yellow to zero and the sun goes alien. That's all filter. The physics never moved.
