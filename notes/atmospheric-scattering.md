 # Atmospheric Scattering

*2026-10-02*

## 1. A filter, not a physics

The Sun Filter tab doesn't change the sun. The fusion still fires as a Poisson process, the photons still random-walk out, the patches still heat and cool on their 35-second clock. All of that runs underneath, unseen — there are no distribution graphs here, just the surface.

What changes is what you're allowed to see.

## 2. The Final Sun

The first graph is the thermometer sun — the direct blackbody color per patch — seen through a graphic EQ. Eight sliders sit across the visible band, 380 to 750 nm. Each one moves a single point on the attenuation curve; the curve stays smooth between them, cosine-interpolated, so a slider never makes a step.

The filter is display-only. It doesn't touch the temperatures, the photons, or the energy. It only decides which colors reach your eye.

Turn down the yellow and the sphere loses its yellow. Turn down everything but green and the sphere goes black except where green light is falling — you're seeing the green component of the sunlight, isolated. The curve underneath is the actual 5778 K blackbody from 300 to 1050 nm — ultraviolet through infrared — with your filter carving into it. It's anchored to the unfiltered peak, so you see how much light the filter removes rather than a renormalized shape. The visible band is filled with spectral colors dimmed where the curve runs low; blocked bands sink into gaps.

## 3. Atmospheric Scattering

The second graph is the same sun, but the filter isn't yours — it's Earth's. A static curve replaces the sliders: the 5778 K blackbody from 300 to 1050 nm with the actual clear-sky vertical transmission at sea level applied, computed at 1 nm resolution from the band physics. Ozone swallows the ultraviolet below ~340 nm; Rayleigh scattering (the λ⁻⁴ law) sets the blue slope; the oxygen B-band carves a sharp notch at 690 nm and the A-band gouges 760 nm; water vapor dents 720, 820 and 940 nm. Those notches are real molecular structure, resolved because the curve is sampled finely enough to see them — and the curve is anchored to the unfiltered blackbody peak, so every dip reads as light removed.

The sphere yellows because the sky took the blue. That's not a metaphor — it's the same reason the sun looks yellow from the ground while being white in space. The curve underneath shows the sunlight as the ground receives it.

## 4. False Color + UV

The third graph asks: what if the ultraviolet came along? White is already the brightest thing the visible spectrum can make, so there's no room above it for something hotter — unless you let the sum go past white.

So the true spectral colors are added normally (visible 380–750 nm), then the ultraviolet (300–380 nm) adds as extra white, pushing the total from 256 toward 350 — a "higher white." Only after the addition and the filtering is done does the result get mapped onto the false-color scale: dark red for the coolest, through orange and yellow, to bright yellow (near-white) for the hottest. That's the NASA/thermal-camera move: let relative differences carry the information, not the literal hues.

The hottest patches — the ones with real UV in their blackbody curve — burn bright yellow. The EQ filters actual wavelengths (UV shown as purple, though invisible), with the false-color scale drawn as a second bar underneath. Filtering the UV sliders dims the hot spots directly.

This is the filter I mentioned at the end of the sun note: atmospheric scattering as a frequency filter. Here it is, drawn.

## 4. Why filter at all

The four suns in the other tab ask how to assign color. This tab asks a different question: how much of what we call "the sun's color" is the sun, and how much is the filter between us and it? Slide the yellow to zero and the sun goes alien. That's all filter. The physics never moved.
