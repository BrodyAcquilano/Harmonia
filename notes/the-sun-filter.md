# The Sun Filter

*2026-10-02*

## 1. A filter, not a physics

The Sun Filter tab doesn't change the sun. The fusion still fires as a Poisson process, the photons still random-walk out, the patches still heat and cool on their 35-second clock. All of that runs underneath, unseen — there are no distribution graphs here, just the surface.

What changes is what you're allowed to see.

A note on the name: "The Final Sun" — the first graph — isn't called that because it's the last variation. It's called that because it's the complete physics model for one specific story: quarks flipping from 2/3 (up) to −1/3 (down), losing mass that becomes energy, that energy becoming light that scatters outward through the random walk, and the surface radiating as a blackbody. That's the whole chain, nothing held back.

But "complete" has boundaries. It doesn't take into account electromagnetism, or currents, or anything beyond that chain. It's deliberately focused: the quark flip, the mass-to-energy conversion, the scattering light, the blackbody radiation. The point of this tab is that once that model is complete, there are still different ways of displaying it — and each display asks you to interpret it differently. That's what the three graphs are.

The colors on the surface are determined by temperature. When energy fluctuations heat a patch, its blackbody curve shifts — hotter means higher frequencies — and the surface is the addition of those colors, wavelength by wavelength. The filter never touches any of that. It only decides which of the added colors reach your eye, and in the false-color graph, how they're remapped for display. The animation is the same; the seeing is different.

## 2. The Final Sun

The first graph is the thermometer sun — the direct blackbody color per patch — seen through a graphic EQ. Twelve sliders sit across the visible band, 380 to 750 nm, each positioned above its wavelength on the spectrum bar. Each one moves a single point on the attenuation curve; the curve stays smooth between them, cosine-interpolated, so a slider never makes a step.

Turn down the yellow and the sphere loses its yellow. Turn down everything but green and the sphere goes black except where green light is falling — you're seeing the green component of the sunlight, isolated. The curve underneath is the actual 5778 K blackbody from 300 to 1050 nm — ultraviolet through infrared — with your filter carving into it. It's anchored to the unfiltered peak, so you see how much light the filter removes rather than a renormalized shape. The visible band is filled with spectral colors dimmed where the curve runs low; blocked bands sink into gaps.

## 3. Reading it like NASA

The trick I keep coming back to: keep the baseline, then isolate. Leave the filter open and you see the sun as it is. Then turn off everything but the ultraviolet, and the sphere goes dark except where the high-energy light lives — you're seeing the hot spikes standing alone against the baseline you already know.

This is what NASA does with images. You can't image the infrared to learn something new here, because it's weaker than the visible — you'd still just be seeing the visible light's shape. But the ultraviolet sits on top of the visible: higher energy, higher temperature, and it adds. Filtering out everything except that higher energy, against the baseline, lets you focus on the spikes — the places where the blackbody is running hottest. The filter becomes a way of asking the sun a narrower question.

## 4. Atmospheric Scattering

The second graph is the same sun, but the filter isn't yours — it's Earth's. A static curve replaces the sliders: the 5778 K blackbody from 300 to 1050 nm with the actual clear-sky vertical transmission at sea level applied, computed at 1 nm resolution from the band physics. Ozone swallows the ultraviolet below ~340 nm; Rayleigh scattering (the λ⁻⁴ law) sets the blue slope; the oxygen B-band carves a sharp notch at 690 nm and the A-band gouges 760 nm; water vapor dents 720, 820 and 940 nm. Those notches are real molecular structure, resolved because the curve is sampled finely enough to see them — and the curve is anchored to the unfiltered blackbody peak, so every dip reads as light removed.

The sphere yellows because the sky took the blue. That's not a metaphor — it's the same reason the sun looks yellow from the ground while being white in space. The curve underneath shows the sunlight as the ground receives it.

This is the filter I mentioned at the end of the sun note: atmospheric scattering as a frequency filter. Here it is, drawn.

## 5. False Color + UV

The third graph asks: what if the ultraviolet came along for the display, not just the filter? White is already the brightest thing the visible spectrum can make, so there's no room above it for something hotter — unless the display stops pretending to be literal.

Each wavelength is mapped by energy onto a thermal scale: ultraviolet burns bright yellow, red glows dark red, with the visible band compressed toward the dark-red end so the sun's ~500 nm peak reads dark red and only the blue and ultraviolet climb toward yellow. The Planck-weighted sum is then done on those false colors — the ultraviolet, mapped to the hottest yellow, pushes the total past white ("higher white") before the final normalization. That's the NASA/thermal-camera move: let relative differences carry the information, not the literal hues.

The EQ filters actual wavelengths (UV shown as purple, though invisible), with the false-color mapping drawn as a second bar underneath so the assignment stays readable. Filtering the UV sliders dims the hot spots directly — same isolation trick as section 3, now with the heat made visible.

## 6. Why filter at all

The four suns in the other tab ask how to assign color. This tab asks a different question: how much of what we call "the sun's color" is the sun, and how much is the filter between us and it? Slide the yellow to zero and the sun goes alien. That's all filter. The physics never moved.
