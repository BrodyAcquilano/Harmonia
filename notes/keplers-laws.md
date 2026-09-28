# Kepler's Laws: The Right Proportion

*Companion to "Symmetric Inertia Transfer," "Lambda Derivation," and "The Hidden Phasor." On what Kepler got right — the proportions, the harmony — and where the ellipse stops: it carries the correct relative motion, but it is not the actual motion.*

---

## 1. What Kepler was hunting

Kepler inherited Tycho Brahe's observations of Mars — the best naked-eye data ever taken — and found that no circle, however cleverly compounded, could fit them. The discrepancy was eight arcminutes: a sliver of sky, and it broke two thousand years of circles. From that sliver he drew the first two laws (*Astronomia Nova*, 1609) and, a decade later, the third (*Harmonices Mundi*, 1619).

But the deeper fact about Kepler is *what he was looking for*. Before the ellipses he nested the planets in Platonic solids (*Mysterium Cosmographicum*); after them he wrote a book of cosmic music. He believed the orbits encode simple proportions — that the solar system is built on harmony, in the literal musical sense. He was right about that. The laws below are the proportions he found. The standing wave is what was resonating.

## 2. The First Law — the ellipse, and the focus

Planets move on ellipses, with the Sun at one focus:

$$
r(\phi) = \frac{a(1-e^2)}{1+e\cos\phi}
$$

The Wave Lab's "Elliptical Relative Motion" does exactly this: the larger mass $M_{\max}$ fixed at a focus, the companion tracing $r(\phi)$ around it. **The relative motion is correct.** The separation between the bodies really does vary this way — nearest at periapsis, farthest at apoapsis, the exact curve above.

But the ellipse is not the actual motion. It answers one question — *how far apart are they?* — and is silent on everything else. It has no center: it describes $r(\phi)$, the relative separation, and says nothing about how either body moves against an impartial point. The actual motion, in this framework, is the two waves: $\psi_1$ reporting body 1's pull toward body 2, $\psi_2$ reporting the answer back, counter-propagating, push switching to pull every half cycle, their sum $\psi_s = \psi_1 + \psi_2$ the standing wave of the whole exchange. The ellipse is the shadow those waves cast — the relative distance, projected out of the full picture. Kepler drew the shadow with perfect fidelity. He stopped at the shadow.

## 3. a and b are the balancing points' proportion

Here the ellipse stops being something measured from the sky and becomes something derived. The balance point $\lambda^* = L\,M_2/(M_1+M_2)$ splits the separation $L$ into the two lever arms $\lambda^*$ and $L-\lambda^*$, and their normalized difference *is* the eccentricity:

$$
e = \frac{|\lambda^*-(L-\lambda^*)|}{L} = \frac{|M_1-M_2|}{M_1+M_2}, \qquad a = L, \qquad b = a\sqrt{1-e^2}
$$

The whole ellipse — both axes — is the mass ratio drawn as geometry. Equal masses put $\lambda^*$ at the midpoint, $e = 0$, and the ellipse collapses to a circle of radius $L$: the apparent circular view returns as a special case. One mass dominant pushes $\lambda^*$ toward the heavy end and stretches $e \to 1$.

Kepler measured $a$, $b$, and $e$ from the sky. Here they are not fitted — they are the proportion between the balancing points, made visible. The ellipse's shape *is* the lever-arm ratio. That is the sense in which Kepler had the right proportion: the numbers he extracted from Tycho's tables were these numbers, the balance of the two arms, all along.

## 4. The Second Law — equal areas, and the timing we don't yet have

The radius vector sweeps out equal areas in equal times: the planet moves faster near periapsis, slower near apoapsis, so the areal velocity is constant.

The honest comparison first: **the simulation does not do this yet.** The animation advances the phase uniformly — uniform mean anomaly — which is the circular approximation to the timing. True Kepler timing means solving Kepler's equation $M = E - e\sin E$ for the eccentric anomaly at each step, and that is not implemented. The shape on screen is right; the speed along it is approximate. It is marked as future work, not hidden.

The deeper comparison is about what the law *means*. The second law says the *rate* of the motion varies around the orbit — fast infall, slow retreat. In the wave language, that varying rate is the phasor: as the phase cycles, energy redistributes between spatial and temporal inertia, push becomes pull every half cycle, and the local intensity of the exchange breathes. Kepler's area law is the geometric trace of a varying rate; the phasor rotation is the varying rate itself. He drew the trace. The rotation is what draws it.

## 5. The Third Law — the harmonic law, and the music

$$
T^2 \propto a^3
$$

The period squared goes as the semi-major axis cubed — one proportion binding every orbit in the system. Kepler found it inside *Harmonices Mundi*, the book of cosmic music, and that placement was not an accident. His "right idea about harmonics" was this: the planets' angular speeds, fastest at perihelion and slowest at aphelion, stand in ratios that match musical intervals — the inner planets sing higher, the outer lower, each planet spanning its own chord across its orbit. The third law is the single number underneath all those intervals: $T^2/a^3$ is the same for every planet, the common fundamental the whole choir is tuned to.

And this is what standing waves do. $\psi_s = \psi_1 + \psi_2$ is two counter-propagating reciprocal waves superposed — and a standing wave only stands at whole-number proportions: $\lambda = 2L/n$, the harmonic series. Integer ratios are not imposed on a standing wave; they are what it *is*. Kepler heard the harmony in the periods — simple ratios, one universal proportion — because something was resonating. The standing wave is the resonator: two signals, each body telling the other how hard it is pulling, locking into the integer proportions that let the pattern hold still. His proportion was right; the waves are what was singing.

The graph carries the law as its caption — $T^2 \propto a^3$ beneath the orbit — because the caption is the claim: the shape above is tuned to that proportion.

## 6. What the ellipse can't say

Set the three laws side by side and notice what none of them contains: a center. Every one is relative — the planet relative to the Sun-at-focus, the area relative to the radius vector, the period relative to the axis. Kepler's system has no impartial point; there is nowhere to stand that belongs to neither body.

The waves supply one. The double integral of the Hidden Phasor — collapse the spatial line to the net released impulse $F_n(t)$, integrate over time — gives $X_n(t)$: each body's wobble *against the balance point* $\lambda^*$, the center that belongs to neither body. Not just "how far apart," but how far each moves from center, one wobbling one way and the other the other, the heavier moving less. That information is nowhere in the ellipse. It is in the waves, and the integrals pull it out.

Nor does the ellipse say *why*. Kepler described; Newton, later, supplied inverse-square attraction as the cause. Here the mechanism is the mutual pull itself — the two directions of the conversation, $\psi_1 \longleftrightarrow \psi_2$, each body answering the other's tug, the push-pull switching every half cycle. The ellipse is what that conversation looks like from the outside, with the participants removed.

## 7. Conclusion: the right description, and what lies beneath it

Kepler invented the ellipse as a description, and it was the right description of the relative motion — $r(\phi)$ exactly as drawn, the focus exactly where $M_{\max}$ sits. His error, if it can be called one, was stopping at the description: mistaking the shadow for the thing. The $a$ and $b$ he measured from the sky are the proportion between the balancing points — $\lambda^*$ and $L-\lambda^*$, the lever arms, their normalized difference the eccentricity. And the harmony he chased through *Harmonices Mundi*, the musical intervals spanning each orbit and the single proportion $T^2 \propto a^3$ beneath them all, is the standing wave: two reciprocal signals locking into integer ratios, the music made physical.

He had the proportions right. The waves are what was resonating.
