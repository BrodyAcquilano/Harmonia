# Kepler's Laws: The Right Proportion

*Companion to "Symmetric Inertia Transfer," "Lambda Derivation," "The Hidden Phasor," and "Time from Collisions." On what Kepler got right — the proportions, the harmony, and the projection itself: the ellipse is the 2D relative motion on the eigenplane, the same operation the three-body construction performs. He was not wrong; he was doing exactly this.*

---

## Table of Contents

- [1. What Kepler was hunting](#1-what-kepler-was-hunting)
- [2. The First Law — the ellipse, and the focus](#2-the-first-law--the-ellipse-and-the-focus)
- [3. a and b are the balancing points' proportion](#3-a-and-b-are-the-balancing-points-proportion)
- [4. The Second Law — equal areas, and the timing we don't yet have](#4-the-second-law--equal-areas-and-the-timing-we-dont-yet-have)
- [5. The Third Law — the harmonic law, and the music](#5-the-third-law--the-harmonic-law-and-the-music)
- [6. What the ellipse can't say](#6-what-the-ellipse-cant-say)
- [7. Conclusion: the right description, and what lies beneath it](#7-conclusion-the-right-description-and-what-lies-beneath-it)
- [References](#references)


## 1. What Kepler was hunting

Kepler inherited Tycho Brahe's observations of Mars — the best naked-eye data ever taken — and found that no circle, however cleverly compounded, could fit them. The discrepancy was eight arcminutes: a sliver of sky, and it broke two thousand years of circles. From that sliver he drew the first two laws (*Astronomia Nova*, 1609) and, a decade later, the third (*Harmonices Mundi*, 1619).

But the deeper fact about Kepler is *what he was looking for*. Before the ellipses he nested the planets in Platonic solids (*Mysterium Cosmographicum*); after them he wrote a book of cosmic music. He believed the orbits encode simple proportions — that the solar system is built on harmony, in the literal musical sense. He was right about that. The laws below are the proportions he found. The standing wave is what was resonating.

## 2. The First Law — the ellipse, and the focus

Planets move on ellipses, with the Sun at one focus:

$$
r(\phi) = \frac{a(1-e^2)}{1+e\cos\phi}
$$

The Wave Lab draws the pair of views side by side. "Apparent Motion with Constant Velocity" wraps the axis into a circle: two bodies in 3D space, constant relative velocity, no external force — the axis bent around, and the motion closes. "Kepler's Ellipse: Motion with External Force" does exactly this: the larger mass $M_{\max}$ fixed at a focus, the companion tracing $r(\phi)$ around it. **The relative motion is correct.** The separation between the bodies really does vary this way — nearest at periapsis, farthest at apoapsis, the exact curve above.

The difference between the two graphs is the difference between no external force and external force. Constant velocity wraps into a circle; acceleration — motion under external force, relative to something else — stretches it into an ellipse, and the eccentricity lives in the projected plane. Kepler was analyzing data with external energy acting on the system — the Sun's pull, acceleration relative to something else — so he saw ellipses. His version restores the acceleration for the 2D plane.

The ellipse is the relative motion on the eigenplane: the 3D system collapsed to the 2D plane where the bodies stay relatively locked, and the relative separation drawn there. That collapse — compute the vectors in 3D spacetime, project to the flat plane, draw the relative motion — is exactly what the three-body tab does when it produces its ellipses. Kepler performed the same operation four hundred years earlier, by hand, from Tycho's tables. It is not the true motion through the field — no 2D projection is — but it was never meant to be. It is the 2D relative motion, and it is correct as far as it goes. What neither Kepler nor the early version of this theory had was the center's own motion through the field: the clock relative to an external body (see "Time from Collisions").

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

Set the three laws side by side and notice what none of them contains: the center's motion. Every one is relative — the planet relative to the Sun-at-focus, the area relative to the radius vector, the period relative to the axis. Kepler's system has no moving center; there is nowhere the shared point itself travels.

The waves supply one. The double integral of the Hidden Phasor — collapse the spatial line to the net released impulse $F_n(t)$, integrate over time — gives $X_n(t)$: each body's wobble *against the balance point* $\lambda^*$, the center that belongs to neither body. And the new reading goes one step further: add the frame's own motion — the wobbles summed into the *center itself* moving, $\mathbf{C}(t) = \sum_n\sum_j X_{n,j}(t)\,\hat{e}_j$, the turbulence point, moving relative to some external third reference — while each body keeps wobbling in branches relative to that moving center — and the clock relative to that reference (see "Time from Collisions"). That information — the shared point traveling through the field, carrying time with it — is nowhere in the ellipse. It is in the waves, and the integrals pull it out.

Nor does the ellipse say *why* the projection holds. Kepler described; Newton, later, supplied inverse-square attraction as the cause. Here the mechanism is the mutual pull itself — the two directions of the conversation, $\psi_1 \longleftrightarrow \psi_2$, each body answering the other's tug, the push-pull switching every half cycle. The ellipse is what that conversation looks like from the eigenplane, with the center's own travel removed.

And the circle is what balance looks like: if force and velocity are balanced, they are perpendicular and the velocity is constant and unchanging — so the motion is a circle. Force is an imbalance between spatial and temporal inertia, caused by another external body acting on the system; no imbalance, no ellipse. When the external force is balanced with the motion, the symmetric balance point on the line is the reference point of motion — not an external point.

## 7. Conclusion: the right description, and what lies beneath it

Kepler invented the ellipse as a description, and it was the right description of the relative motion — $r(\phi)$ exactly as drawn, the focus exactly where $M_{\max}$ sits. The ellipse is the 2D relative motion on the eigenplane — the 3D system computed in full, collapsed to the flat plane where the bodies stay locked — and it is exactly what the three-body construction does when it draws its ellipses. He did the same thing we did. The $a$ and $b$ he measured from the sky are the proportion between the balancing points — $\lambda^*$ and $L-\lambda^*$, the lever arms, their normalized difference the eccentricity. And the harmony he chased through *Harmonices Mundi*, the musical intervals spanning each orbit and the single proportion $T^2 \propto a^3$ beneath them all, is the standing wave: two reciprocal signals locking into integer ratios, the music made physical.

He had the proportions right. The waves are what was resonating.

And one step further — the proportion itself, $T^2 \propto a^3$, is not just a number Kepler measured. Read it as a fingerprint of the integration ladder, because that is what it is: the 2 counts the two time integrations, the 3 counts the three spatial dimensions the path is reconstructed in.

The ladder, stated plainly. Start at the mass equation — the fundamental equation, $W_n(M_1, M_2)$, before space and time have been separated out. Then integrate, alternating:

$$
\text{space} \;\to\; \text{time} \;\to\; \text{space} \;\to\; \text{time}
$$

First over space ($\lambda_n$): the cumulative integrals $W_n = \int \mathrm{Re}(\psi_n)\,d\lambda_n$ and $J_n = \int \mathrm{Im}(\psi_n)\,d\lambda_n$ — the energy accounts along the radial line. Then over the transformed time — the frequency phase ($\tau$): the phasor turns, work becomes impulse, $F_n(\tau) = J_n(L,\tau) - W_n(L,\tau)$ — the net released impulse at each instant. Then over space again: the indefinite integral for work, computed for the bounds of the system, $0$ and $L$. Then over time again: $X_n(\tau) = \int_0^\tau F_n(\tau')\,d\tau'$ — the wobble, the motion.

Four integrations — and the last one lands back where the ladder started: the indefinite integral for work, evaluated at the bounds of the system. From that evaluated integral, the motion and the path are reconstructed.

This is why the deconstruction has to go all the way down and come back up in reverse. The gravity equation acts in the radial direction — along the line between the bodies. The motion it produces acts parallel — the two wobbles running alongside each other on their own axis. Parallel motion cannot be read off a radial equation directly. So you deconstruct down to the fundamental equation, where the directions have not yet been separated, and build back up in reverse order — and the reversal is what transfers the radial pull into parallel motion. The deconstruction is a contraction: we deconstruct motion into its directional parts and we get waves, gain information about the energy at each point, and lose information about the actual motion — we give up information so that we can rotate force into velocity.

Then count. Two passages through time: the transformed time — time rewritten as frequency phase, over which the phase rotates and the energy redistributes — and the accumulation time, over which the motion emerges. Three spatial dimensions for the reconstructed path. $T^2 \propto a^3$ — time squared, length cubed — is that count, written as an orbital proportion. Kepler measured the proportion. The ladder is why the proportion is what it is.

The picture sharpens one more level. It is just like light emitting from an antenna.

A force acts on the two bodies — and the pair, taken together, *is* the antenna. What an antenna does is cross a boundary: the signal travels down through the circuit as guided current, and then it is emitted — rebuilt in the perpendicular direction, as a free wave. The two-body system does the same thing. The radial field between the bodies is the guided signal; the parallel motion is the emission. The direction changes at the crossing, and that is why the ladder has to go all the way down and come back up — the hidden law of symmetric inertia transfer: the transform converts force into relative velocity in the perpendicular direction.

Down first: differentiate, level by level, through all five levels, until you reach the fundamental conservation-of-energy relation — the equation that equals zero. In the original derivation this was the Lagrangian:

$$
L_n = PE_n - KE_n = 0
$$

That is the ground floor: energy conserved, nothing left over, the whole system accounted for in a single vanishing balance.

Then back up: take that equation of mass and integrate, alternating space and time, five levels down and five levels back up, rebuilding the motion in the perpendicular direction. It is a communication stack, exactly like networking: application down to machine code down to hardware — then across the channel — then the layers built back up in reverse on the far side. Here the channel is the crossing from the radial direction to the perpendicular one, and the layers are the integrals.

Five levels, and the four integrations are the crossings between them: three of space, two of time — the five levels of the stack.

And at the end of the climb you arrive at a definite integral of work and impulse:

$$
F_n(\tau) = J_n(L,\tau) - W_n(L,\tau)
$$

evaluated at the bounds of the system — which is the exact equation the derivation started from. The loop closes: the Lagrangian at the bottom, the Lagrangian at the top, with the wave equations, the phasor, and the motion stacked in between.

Then count the levels, because Kepler already did. $T^2 \propto a^3$: two handlings of time — the transformed time (the frequency phase) and the accumulation time — and three spatial dimensions for the path. $2 + 3 = 5$. Five levels down, five levels back up. The proportion is the stack, counted — and the fifth dimension, the hidden one the transform enters, is the frequency domain itself: the symmetric phase domain where space and time stand on equal footing, held up by the invariant of the conservation law.

## References

- Kepler, Johannes. *Astronomia Nova* (1609) — the first and second laws: the elliptical orbit, the focus, the equal areas.
- Kepler, Johannes. *Harmonices Mundi* (1619) — the third law, $T^2 \propto a^3$, and the cosmic music it was found inside.
