# Color Theory

2026-09-30

## Table of Contents

- [1. The colors were only labels](#1-the-colors-were-only-labels)
- [2. Starlight](#2-starlight)
- [3. The scale — stretched between cutoffs](#3-the-scale--stretched-between-cutoffs)
- [4. The 3D graphs in true colors](#4-the-3d-graphs-in-true-colors)
- [5. Adding light makes white](#5-adding-light-makes-white)
- [6. What the whitening might mean](#6-what-the-whitening-might-mean)
- [7. Open questions](#7-open-questions)

## 1. The colors were only labels

Up until now the colors in the quark diagrams were labels: blue meant the 1/3 fundamental, red meant 2/3, green meant 1, yellow meant 4/3. They told me *which* wave I was looking at, not *what* it was. That started to bother me, because color in nature is never arbitrary — color *is* energy. A red star and a blue star are not labeled differently; they burn at different temperatures, and you can read the temperature off the color. My waves have frequencies, and frequency is energy ($E = h\nu$), so there was no reason for the colors to be a code. They should have been a measurement all along.

## 2. Starlight

The analogy I keep coming back to is stellar classification. Red dwarfs burn cool, around three thousand kelvin; blue giants burn hotter than ten thousand. Hotter means bluer, cooler means redder — this is Wien's displacement law wearing work clothes: the peak of the spectrum slides toward shorter wavelengths as the temperature rises. Nobody assigned those colors; the physics did.

So the rule for the waves wrote itself: the cooler the frequency, the redder; the hotter, the bluer. No interpretation step, no legend to memorize — $E = h\nu$ does the mapping directly.

## 3. The scale — stretched between cutoffs

The first version of the scale had fixed anchors: $1/3\,f_q$ burned red, $2/3\,f_q$ yellow, $1\,f_q$ green-teal, $4/3\,f_q$ blue, everything hotter saturated at blue. That worked until I kept adding frequencies and the anchors started feeling like the old labels wearing a disguise. The scale should fit *what's there*, not the four fundamentals I happened to start with.

So now the scale stretches between two cutoff bounds, drawn as a number line. The cutoffs are padded about ten percent past the frequencies actually in view, and the visible spectrum — red, orange, yellow, green, cyan, blue, violet — fills the reasonable range in the middle, spanning exactly the frequencies present. Below the coolest frequency the bar is flat dark red: infrared, one color. Above the hottest it's flat light purple: ultraviolet, one color. Strictly speaking those two aren't visible colors at all — they're the display's way of marking the bands off the ends of what the eye can see, and giving them each one flat color keeps them honest. The tick marks on the number line show the lowest and highest frequencies in view, so every wave's color can be matched off the bar.

Every time new frequencies are added, the bounds refit. The scale always spans what is actually here — the coolest thing in view is always infrared, the hottest always ultraviolet, and the real spectrum always sits between them.

I like that the scale doesn't care how a frequency was made. A combination frequency that came from a sum of two earlier states takes its color from its own energy, wherever it lands. Energy is energy; the history is irrelevant. That feels right for a resonator that only ever sees the waves, not their biographies.

## 4. The 3D graphs in true colors

The Space-Time Domain's three graphs got remade on the Color Theory tab with true colors: the individual spherical firings, the $z = 0$ slice, and the 3D superposition surface. Each pulse burns its energy color on the shifting scale — the bounds refit every frame, so the colors track the frequencies that are actually live. The slice and the surface wear the additive mix at every point: one pulse's color where one pulse dominates, washing toward white where many overlap.

That's the whitening made spatial. The 1D graph below shows the components one by one, but the 3D surface shows the same pile-up happening in space — every crossing wavefront contributing its color, the whole tending toward white where the firings crowd together. The old label colors are gone from these three graphs; everything else on the site keeps its labels, untouched, the way I asked.

## 5. Adding light makes white

The part I actually wanted to see: draw every eigenstate wave in its energy color, faint, and draw their sum on top in the additive mix of all of them. Adding colored light doesn't average toward grey the way mixing paint does — it piles up toward white. The simulation shows it happening in front of me: a few components and the sum has a tint; a dozen and it's washing out; keep adding and it tends to white. The spectrum bar above the graph is the reference — each wave's color can be matched off it.

The decay states are in the mix too — the five percent that get subtracted from the sum instead of added. They still contribute their color (energy is positive even when the wave subtracts), which is the honest version: a decay takes energy *out* of the wave but the energy itself still had a color.

## 6. What the whitening might mean

Here is where I have to be careful, because this is the part that feels like it means something and I don't yet know what. As entropy rises, the resonator keeps adding eigenstates — more frequencies, more colors — and the sum of all of them tends toward white. White light contains every color. The high-entropy end of the resonator contains every eigenstate. Is "white" just what a complete spectrum looks like from the outside?

It makes me think about the 2:3 story again: the universe as a resonator excited at 2/3, fluctuations as 2/3-structured excitations. If every fluctuation is one more color added to the mix, then the long-run tendency of the whole thing is toward white — not toward any one frequency winning, but toward all of them piling up into something colorless. I'm not claiming that; I'm noticing that the simulation keeps showing it, and I want to know whether it's deep or trivial.

## 7. Open questions

- Does the whitening saturate, or does it keep approaching pure white as $N$ runs to $20{,}001$? The simulation only shows me the first forty.
- Is ten percent the right padding for the cutoff bounds, or should the infrared and ultraviolet bands be wider or narrower? Right now the coolest and hottest frequencies in view sit right at the edges of the flat bands, which is what I wanted — but I picked ten percent by feel.
- What color would the *energy* wave burn? It's the 180° partner, $E = 1/u$ — the inverse. If mass-wave frequencies map red-to-blue, does the energy wave map blue-to-red?
- The three Space-Time Domain graphs got recolored; the rest keep their labels for now. Should the flat map and the convolution surface ever get true colors, or do the labels still earn their keep there?
