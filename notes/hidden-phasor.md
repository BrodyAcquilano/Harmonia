# The Phasor: The Coordinate Transform in the Wave Lab

*Companion to "The Theory of Symmetric Inertia Transfer" and "Derivation of the Structural Wavelengths." This note documents the Wave Lab simulation: the coordinate transform from time and space into the frequency domain — velocity and time changed into a symmetric phase domain — performed live: what the animation means, and how each graph is to be read.*

---

## Table of Contents

- [1. The phase-angle knob](#1-the-phase-angle-knob)
- [2. Where time is — and where it stays hidden](#2-where-time-is--and-where-it-stays-hidden)
- [3. Why the spatial part stays fixed](#3-why-the-spatial-part-stays-fixed)
- [4. Proportional masses: only the ratio matters](#4-proportional-masses-only-the-ratio-matters)
- [5. The Moon, projected onto a plane](#5-the-moon-projected-onto-a-plane)
- [5c. The mutual pull: two equations, two directions](#5c-the-mutual-pull-two-equations-two-directions)
- [5d. From energy at a point to distance moved](#5d-from-energy-at-a-point-to-distance-moved)
- [6. Why the axis runs $0$ to $4\pi$](#6-why-the-axis-runs-0-to-4pi)
- [7. Reading the graphs](#7-reading-the-graphs)
- [8. What this simulation does not show](#8-what-this-simulation-does-not-show)
- [9. Conclusion: the fifth dimension is the frequency domain](#9-conclusion-the-fifth-dimension-is-the-frequency-domain)


## 1. The phase-angle knob

The field equations from *The Theory of Symmetric Inertia Transfer* are

$$
W_1(M_1,M_2) = A_1 e^{i(k_1 M_1 - \omega_1 M_2)}
$$

$$
W_2(M_2,M_1) = A_2 e^{i(k_2 M_2 - \omega_2 M_1)}
$$

There is no time variable here. The masses themselves are the coordinates: $M_1$ is the spatial coordinate of $W_1$, $M_2$ its temporal coordinate, and the roles reverse for $W_2$.

The simulation performs the coordinate transform on these equations. It introduces a clock $\tau$ and writes the phase of the first wave as

$$
\phi_1(\tau) = k_1 \lambda_n - \omega_1 M_2 \tau
$$

Read it as the transform reads it: $\lambda_n$ is space rewritten as wavelength; $\omega_1 M_2 \tau$ is time rewritten as frequency. Position-time in, frequency-lambda out — the phasor $e^{i\phi_1}$ is the transformed motion, and its rotation through the complex plane is the transform turning: real part becoming imaginary, imaginary becoming negative real, cycling through full periods as $\tau$ runs.

The essential clarification: **$\tau$ is not a knob for $M_2$. It is a knob for the phase angle.** $M_2$ stays fixed at whatever the slider sets. What advances is the angle $\phi_1$ itself.

So the period $T$ is not the time for $M_2$ to change. It is the time for the phasor to complete one rotation:

$$
T_1 = \frac{2\pi}{\omega_1 M_2}, \qquad T_2 = \frac{2\pi}{\omega_2 M_1}
$$

Playing $\tau$ from $0$ to $T$ rotates each phasor through exactly one full cycle: potential to kinetic and back.

## 2. Where time is — and where it stays hidden

Most graphs in the Wave Lab have a spatial horizontal axis ($\lambda_n$). On those there is no time axis — what you see instead is the transform at work: the phasor rotating in the frequency domain, and we perceive that rotation only as animation: the curves breathing, shifting, exchanging real and imaginary parts frame by frame.

The phasor itself is the coordinate transform: position and time rewritten in the frequency domain — frequency and wavelength. The field equations take mass-coordinates in; the simulation works in $(\omega, \lambda)$ — how fast the phasor turns, how long the wave is — and the Motion tab transforms back into displacement over time. Same physics, turned coordinates. It is not a window into a hidden place; it is the transform, performing — the hidden fifth dimension, the frequency domain, turning.

The Motion tab adds what the other tabs refuse: graphs with a genuine time axis. "Net Impulse Over Time" and "Wobble Over Time" plot $F_n(t)$ and $X_n(t)$ against $t$ over one full wobble cycle, marked $0$ to $T$. Everywhere else, time stays off the axes by design. In the theory, time was never an independent background coordinate; the simulation honors that everywhere except where the point of the graph *is* the trajectory — there, and only there, time gets an axis.

## 3. Why the spatial part stays fixed

During the animation, the spatial term $k_1 \lambda_n$ does not change. Only the phase angle advances. The reason is physical: **the relative velocity of the two bodies is fixed.** They are not accelerating relative to one another, so the wavelength — the spatial scale of the pattern — stays constant.

If the bodies *were* accelerating relative to each other, $k$ would itself be a function of time. The wave would chirp: compressing as they fall together, stretching as they separate. That is a different simulation — the free-fall-and-return case, where a body falls inward, flies past, loses speed, and comes back. The current simulation is the constant-relative-velocity case: fixed wavelength, pure phasor rotation, clean sinusoids.

## 4. Proportional masses: only the ratio matters

What if both $M_1$ and $M_2$ change proportionally — the whole system scaling together? In the normalized simulation, every wave parameter depends only on the mass ratio:

$$
\frac{k_2}{k_1} = \sqrt{\frac{M_2}{M_1}}, \qquad \frac{\omega_2}{\omega_1} = \frac{M_2}{M_1}, \qquad \frac{A_1}{A_2} = \sqrt{\frac{M_2}{M_1}}, \qquad \beta = \frac{|M_1 - M_2|}{M_1 + M_2}
$$

Scaling $M_1 \to f\,M_1$, $M_2 \to f\,M_2$ leaves every one of these unchanged. The spatial pattern is identical. Only the temporal rate $\omega_1 M_2 = M_2^2/M_1$ scales (by $f$), which runs the animation faster or slower without altering its shape. The relative motion is the same — we are merely splitting it differently between the two bodies. This is why the mass sliders can be read as setting a mass *ratio*: the absolute scale drops out of the picture.

## 5. The Moon, projected onto a plane

As a physical picture for what the simulation shows, consider the Moon. It orbits Earth while Earth orbits the Sun. The Moon is in free fall toward Earth — that is what an orbit *is*: continuous falling. It falls inward, but its tangential velocity carries it past; it never arrives in time. It swings out, loses speed, and falls back. Back and forth, forever.

Now project this motion onto the plane perpendicular to Earth's velocity around the Sun. Earth's own drift drops out. What remains is the Moon's *relative* motion: a line, back and forth — falling in, flying past, coming back.

The simulation shows exactly this projection. The wave's oscillation is the back-and-forth, laid out along a line. The fixed wavelength is the fixed relative velocity. The phasor rotation is the cycling of fall-and-return. If we added Earth's heliocentric velocity back in, we would recover the Moon's full three-dimensional path; the Wave Lab shows the relative motion with the common drift removed. It is offered here as an interpretation and a direction for future work, not as a derived result.

### 5b. Two endpoints, two center-crossings, two cycles

Read the $4\pi$ window in these terms. Start at the center: the body falls inward, crosses the center, reaches the far endpoint, falls back, crosses the center again, reaches the near endpoint, and returns. **One full wavelength contains two center-crossings and two endpoints** — the complete fall-and-return in both directions. The $4\pi$ axis holds two such wavelengths, so the graph shows the cycle twice: fall, return, fall, return.

The quarter-cycle offset between the real and imaginary parts is what makes this readable. When spatial inertia ($\cos\phi$, the real part) is at an endpoint — maximum displacement — temporal inertia ($\sin\phi$, the imaginary part) is at zero: all position, no change. When the body crosses the center, the reverse holds: spatial inertia is zero, temporal inertia is maximal — all change, no displacement. The two curves hand the motion back and forth every quarter cycle, and the $4\pi$ window lets you watch the handoff happen four times.

A word on the chirp, since it belongs here too. The Moon's orbit as drawn above is the *stable* case: fixed relative velocity, fixed wavelength, no chirp. But a decaying orbit — the Moon spiraling inward, or a body accelerating as it falls — would change the wavelength over time: the wave would chirp, compressing as the fall steepens. Section 3 named the chirp as the accelerating case; the Moon example shows both sides. Stable orbit: constant $k$, pure rotation. Decaying orbit: $k(t)$, chirp. The simulation currently implements only the first.

## 5c. The mutual pull: two equations, two directions

So far we have spoken as if only one body moves. But the Earth is also pulled by the Moon — and that is what the *second* equation is for.

$$
\psi_1 \;\longleftrightarrow\; \text{body 1's view}, \qquad \psi_2 \;\longleftrightarrow\; \text{body 2's view}
$$

The two waves are not two pictures of the same thing. They are the two directions of a conversation. At each point $\lambda_n$ between the bodies, $\psi_1$ reports how much energy body 1 is sending toward body 2, and $\psi_2$ reports how much body 2 is sending back. They are signals — each body telling the other how hard it is pulling, and the pull being answered.

This is why the waves are counter-propagating ($\psi_1$ toward $+\lambda_n$, $\psi_2$ toward $-\lambda_n$) and why they decay in opposite directions. Each wave is strongest at its own body's end and fades toward the other: the signal attenuates with distance. The balance point $\lambda^*$, where the lever arms balance ($M_1\lambda^* = M_2(L-\lambda^*)$), is the mass-weighted center — the negotiation point of the mutual pull.

The relative velocity stays fixed — the bodies are not accelerating *relative to each other* — but within that fixed frame they wobble back and forth, each tugging the other. The wobble switches direction **every half cycle**: push becomes pull, pull becomes push, at each zero-crossing of the wave. That switching is the heartbeat of the energy transfer.

## 5d. From energy at a point to distance moved

This leads to the central conclusion of the simulation. If we can read, at every point $\lambda_n$ along the wavelength, how much spatial inertia has acted there — how much work has been done, how much impulse generated — then we can determine **how far each body has moved**. But there is a subtlety that matters: the second integral must be taken over **time**, not over space.

The integration graphs already compute the first integrals — over space, at each instant $t$:

$$
W_n(\lambda_n, t) = \int_0^{\lambda_n} \mathrm{Re}(\psi_n)\,d\lambda', \qquad J_n(\lambda_n, t) = \int_0^{\lambda_n} \mathrm{Im}(\psi_n)\,d\lambda'
$$

(They carry a $t$ now, because the phasor rotates: work and impulse breathe as the phase cycles.)

An earlier draft of this note proposed integrating the work-impulse difference over space a second time. That yields a spatial accumulation — a number that grows along the wavelength — but it is not a trajectory. It answers "how much has piled up by this point" when the question we want is "where is the body now." Wrong axis.

The correct second integral works the other way: at each instant $t$, collapse the whole spatial line to a single number — the **net released impulse** on each body:

$$
F_n(t) = J_n(L, t) - W_n(L, t) = \int_0^L \big[\mathrm{Im}(\psi_n) - \mathrm{Re}(\psi_n)\big]\,d\lambda_n
$$

$F_n(t)$ is the driver: how hard the field is pushing body $n$ at time $t$. The sign is flipped from $W_n - J_n$ on purpose — on the Integration tab, $W_n > J_n$ (green) is inertia *stored*; motion comes from what is *released*, $J_n > W_n$ (red). Then integrate over time:

$$
X_n(t) = \int_0^t F_n(t')\,dt'
$$

$X_n(t)$ is the wobble: body $n$'s displacement from its starting point, as a function of time, both directions. This is what the Motion tab now plots.

There is a transform logic to this, worth stating plainly. We started with the spatial line $\lambda_n$ between the bodies — space rewritten as wavelength. Then the coordinate change moves the physics into the frequency domain — the fifth dimension — where the phase rotates: time rewritten as frequency. Integrating once over the wavelength gives energy as a function of position. The second integral is taken over **time**, not space — and it gives displacement as a function of time. **For every spatial direction, we add a branch, not new dimensions**: the same transform — motion treated as a wave, one wave per direction — runs again, rotated into the new direction. The pattern — wavelength, frequency-domain phase, displacement-time — generalizes the same way: branches through the same machinery.

That is the hidden law of symmetric inertia transfer, performing live: force goes in radial — the pull along the line between the bodies — and relative velocity comes out perpendicular. The phasor's rotation *is* the conversion. Each quarter-turn of the phase moves energy from the spatial account to the temporal one; five quarter-turns net one, and the direction has changed. What the graphs show, step by step, is force being turned into perpendicular motion.

A note on wavelengths, since the two axes are easily confused: the **spatial wavelength** is $2\pi$ (with normalized $k_1 = 1$). The **phasor's temporal period** is $2\pi/(\omega_1 M_2)$ — a different quantity, different units, different axis. Every graph before the Motion tab is plotted against the spatial one; the Motion tab's time graphs are plotted against the temporal one. They are not the same wavelength.

## 6. Why the axis runs $0$ to $4\pi$

The spatial axis spans $0$ to $4\pi$. With the normalized $k_1 = 1$, the spatial wavelength is $2\pi/k_1 = 2\pi$, so the window holds exactly **two full wavelengths**.

Two, not one, because the wave is complex. The real part (spatial inertia, $\cos\phi$) and the imaginary part (temporal inertia, $\sin\phi$) sit a quarter-cycle apart — that offset *is* the factor of $i$, the $90^\circ$ rotation coupling the two forms of inertia. One wavelength shows a single cycle of each; two wavelengths let the eye confirm the quarter-cycle offset persists, and show how the envelope $e^{-\beta\lambda_n}$ decays across the span. It is the smallest window that displays both the oscillation and its structure.

The envelope deserves a remark. Each wave carries a decay factor — $e^{-\beta\lambda_n}$ for $\psi_1$ (decaying to the right), $e^{-\beta(L-\lambda_n)}$ for $\psi_2$ (decaying to the left) — with $\beta = |M_1-M_2|/(M_1+M_2)$. When the masses are equal, $\beta = 0$ and both waves are pure, undecaying sinusoids: the symmetric case. Unequal masses tilt the envelopes in opposite directions, and the two waves become mirror images of each other.

## 7. Reading the graphs

### 7.1 Gravity — "Gravity Waves Inertia-Energy"

Three curves, all real parts (the spatial-inertia component) plotted against $\lambda_n$:

- **$\psi_1$ (blue)** travels toward $+\lambda_n$; **$\psi_2$ (orange)** travels toward $-\lambda_n$. They are counter-propagating by construction: the sign of the spatial phase term is reversed between them.
- **$\psi_s = \psi_1 + \psi_2$ (dark)** is the summed field — the total inertial state of the closed system.
- The vertical dashed line is the **balance point** $\lambda^* = L\,M_2/(M_1+M_2)$, the mass-weighted center. For equal masses it sits at the midpoint; for $M_2 = 3M_1$ it sits at $3L/4$ — nearer the heavier body.

The display dropdown selects $\psi_1,\psi_2$ alone, their sum alone, or all three. As the phasor rotates (animation playing), watch the blue and orange curves trade amplitude: when one is at a crest of spatial inertia, the other is crossing through zero into temporal inertia. Their sum stays bounded — the visual form of the conservation law.

### 7.2 Derivatives — rates of change

Three graphs showing how the field responds to changes in the mass coordinates.

**"Gravity Wave Inertia-Energy Rates Of Change"** plots the four partial derivatives:

$$
\frac{\partial\psi_1}{\partial M_1} = ik_1\psi_1, \qquad \frac{\partial\psi_1}{\partial M_2} = -i\omega_1\psi_1
$$

$$
\frac{\partial\psi_2}{\partial M_1} = -i\omega_2\psi_2, \qquad \frac{\partial\psi_2}{\partial M_2} = ik_2\psi_2
$$

Solid curves are derivatives with respect to a wave's *own* spatial mass (positive spatial phase gradient, factor $+i$); dashed curves are derivatives with respect to the *companion* mass (negative temporal phase gradient, factor $-i$). The pairing — every $+i$ matched by a $-i$ — is the local symmetry made visible.

**"Inertia To Energy Symmetry"** collects these into the two half-waves:

$$
dM_1 = \frac{\partial\psi_1}{\partial M_1} + \frac{\partial\psi_2}{\partial M_1}, \qquad dM_2 = \frac{\partial\psi_1}{\partial M_2} + \frac{\partial\psi_2}{\partial M_2}
$$

Each shows, for one mass coordinate, the spatial response of the first field superimposed on the temporal response of the second.

**"Conservation of Inertia-Energy"** plots the total differential $d\psi_s = dM_1\,dM_1 + dM_2\,dM_2$ (the sum of both halves). In the exact theory this is zero — the two pairings cancel. The graph should read as a flat line at zero; any visible deviation is numerical residue, and its smallness is itself the check that the symmetry holds.

### 7.3 Integration — work and impulse

Two graphs, one per body. Each integrates the wave along $\lambda_n$ by the trapezoidal rule:

- **$W_n = \int \mathrm{Re}(\psi_n)\,d\lambda_n$** (solid) — the **potential work**, accumulated spatial inertia: what the field *could do*.
- **$J_n = \int \mathrm{Im}(\psi_n)\,d\lambda_n$** (dashed) — the **impulse generated**, accumulated temporal inertia: what the field *has done*.
- **$W_n - J_n$** (dark) — the **inertia remaining**: work not yet converted to impulse.

The shading between the curves is the key:

- **Green** where $W_n > J_n$: **inertia stored** — potential exceeds what has been spent.
- **Red** where $J_n > W_n$: **inertia released** — impulse has overtaken work.

The colors alternate at each crossing, so the graph reads as a ledger: green bands where the body is charging, red bands where it is discharging. The $W_n - J_n$ line tracks the running balance.

### 7.4 Motion — the wobble, in space and time

Eleven graphs, in tab order — and the order is the methodology. It starts from the push-pull density: the local push at each point between the bodies, which is where the whole definition began. Integrate over space and you get each body's net impulse $F_n(t)$; integrate that over time — one full period — and you get the wobble $X_n(t)$. Two integrations, and you are back to motion from the thing you started with: a definite integral over one period recovering the trajectory. Then the live wobble projections, then the axis wrapped into a circle (constant velocity, no external force), the ellipse restoring acceleration (external force), the separation split at the balance point, the center itself moving as the turbulence point, and the clock read off that motion relative to an external body. The dot diagrams are live (they animate); the time graphs are static snapshots of one full wobble cycle, both directions, with the axis marked in time ($0$ to $T$). Four quantities are shared across them:

$$
P_n(\lambda_n) = \int_0^{\lambda_n} \big[\mathrm{Re}(\psi_n) - \mathrm{Im}(\psi_n)\big]\,d\lambda', \qquad D(\lambda_n) = \int_0^{\lambda_n} \big[(\mathrm{Re}\psi_1 - \mathrm{Im}\psi_1) - (\mathrm{Re}\psi_2 - \mathrm{Im}\psi_2)\big]\,d\lambda'
$$

$$
F_n(t) = \int_0^L \big[\mathrm{Im}(\psi_n) - \mathrm{Re}(\psi_n)\big]\,d\lambda_n, \qquad X_n(t) = \int_0^t F_n(t')\,dt'
$$

$P_n(\lambda_n)$ is body $n$'s remaining inertia at the point $\lambda_n$ — the definite integral of what is stored minus what has been released, the Integration tab's $W_n - J_n$ curve accumulated — and $D(\lambda_n)$ is the local push: the two definite integrals differenced, where body 1's remaining inertia exceeds body 2's, and vice versa. $F_n(t)$ is the net released impulse on body $n$ at time $t$ — the whole spatial line collapsed to a single number. $X_n(t)$ is the wobble: body $n$'s displacement from its starting point as a function of time.

**"Push-Pull Density (spatial)"** — $D(\lambda_n)$ against the spatial wavelength $\lambda_n$: the starting definition, plotted first. The Display dropdown also shows the two parts separately — $P_1(\lambda_n)$ (blue) and $P_2(\lambda_n)$ (orange) — or all three together.

**"Push-Pull Density (temporal)"** — the same difference, the whole spatial line collapsed and tracked through time. Since $F_n(t) = J_n(L,t) - W_n(L,t)$, each body's remaining inertia at time $t$ is $P_n(t) = -F_n(t)$, and the temporal push-pull is their difference:

$$
T(t) = P_1(t) - P_2(t) = F_2(t) - F_1(t)
$$

Same Display dropdown: the two parts, the difference, or all three. Where the spatial graph shows *where* body 1 pushes harder than body 2, this one shows *when*.

**"Net Impulse Over Time"** — $F_1(t)$ (blue) and $F_2(t)$ (orange) against time. The driver: each body's total released impulse as the phasor turns through one cycle.

**"Wobble Over Time"** — $X_1(t)$ (blue) and $X_2(t)$ (orange) against time, same one-cycle window. The trajectories: each body's displacement from its start. Read them against the center line — this is motion relative to the impartial reference point, not merely the relative motion between the bodies.

**"Bodies: In-Line Wobble (yz plane)"** — the wobble projection, live: the same $X_n(t)$, now looking straight down the $x$ ($\lambda$) axis, $z$ up. Both bodies sit on the line of sight — superimposed at the center — and the wobble is drawn horizontally along $y$ (the wobble direction, seen edge-on):

$$
y_1(t) = X_1(t), \qquad y_2(t) = X_2(t)
$$

The center cross is the impartial reference point, head-on. Dot size scales with mass, and the lighter body is drawn on top, so at each crossing it visibly passes *in front of* the heavier body, like a transit. This is the head-on view down the line between the bodies.

**"Bodies: Wobble (xy plane)"** — the **apparent wobble**, a projection, live. $m_1$ (blue) on the left, $m_2$ (orange) on the right, each sliding up and down as the animation runs. This is the motion before it is wrapped into circles: the $y$-component of the circular orbit with the bodies pinned at their $x$ positions — what you would reconstruct if you saw the system from the $xz$ plane and knew there was a distance $\lambda$ between the bodies. This is the $xy$ plane: $x$ (spatial) runs horizontally between the bodies — it is the $\lambda$ line, the coordinate the rest of the site calls $\lambda_n$ — and the wobble is drawn along $y$, a spatial direction with no special name, just the perpendicular:

$$
y_1(t) = X_1(t), \qquad y_2(t) = X_2(t)
$$

The horizontal center line is the constant-relative-velocity axis: there is no motion along it, so the wobble is purely perpendicular. The dots move opposite — when one rises, the other falls — and the heavier mass visibly moves less. This is the live instant; the time graphs show the full trajectory it traces.

**"Apparent Motion with Constant Velocity"** — the wobble wrapped into a circular orbit: the $x$-axis ($\lambda$ line) bent into a circle around the center point, the orbital angle running one full turn per wobble cycle, synced to the same clock as the wobble diagrams, footnoted *xy plane*. It pins $M_{\max}$ at the center while the companion circles at the full separation $L$ — the naive view, what the Moon's orbit looks like if you assume the Earth doesn't move. The circle is what constant velocity looks like: no external force, no acceleration, the axis wrapped around and the motion closed. The legend keeps the naive-view equation $\lambda_2 - \lambda_1 = \lambda_1 - \lambda_2 = x$ — the deliberate false assumption, marked as such:

$$
\phi(t) = 2\pi t / T, \qquad \mathbf{r}_1 = 0, \quad \mathbf{r}_2(\phi) = L(\cos\phi, \sin\phi)
$$

**"Kepler's Ellipse: Motion with External Force"** — the projected view with acceleration restored: $M_{\max}$ fixed at a focus, the companion tracing $r(\phi) = a(1-e^2)/(1+e\cos\phi)$, the eccentricity set by the balance-point split $e = |\lambda^*-(L-\lambda^*)|/L$. Ellipses are what acceleration looks like on the eigenplane — external energy acting on the system, motion relative to something else. The static geometry diagram beside it draws the same $a$, $b$, $e$ as pure proportion.

**"Our View: Space Branches Split"** — the axis wrapped around the center and split at $\lambda^*$: the separation divided at the center of mass, $r_1 + r_2 = L$ always, the two bodies circling the balance point ($+$) on opposite sides, the heavier mass tracing the smaller circle — consistent with the wobble projection, where the heavier mass moves less. The bigger box, with tiny zoom controls underneath (50%–400%), so the rings have room to expand as the masses change. A semi-transparent grey line joins the two masses, always passing through the center point — the direction gravity acts along, rotating with the bodies: the visual form of the statement that the separation (and hence $\lambda$) does not change.

**"The Turbulence: The Next Eigenstate"** — the center itself moving: the bodies locked rigid at the balance-point split, the whole configuration translating with the resultant $\mathbf{C}(t) = X_1(t) + X_2(t)$. The center is drawn as a gold cross — the turbulence point, the eigen point relative to the center, a turbulence point moving in a line relative to some external body.

**"A Clock Relative to an External Body"** — the point on the line, and nothing else: a solid golden point rocking on a light grey line that fits inside the graph, its rest position at the balance-point split, its position the time reading. Motion with external force and perpendicular velocity — the clock ratio $T_1/T_2 = M_2/M_1$ integrated from the rocking.

## 8. What this simulation does not show

This note describes the constant-relative-velocity, phasor-rotation simulation only. It does not show:

- The **mass-space view** — the fields plotted directly against $M_1$ and $M_2$ as coordinates, with no $\lambda_n$ and no $\tau$. There the wavenumber varies with the coordinate itself and the waves chirp.
- The **accelerating case** — relative velocity changing with time, wavelength breathing in and out (the chirp of Section 5b, second half).
- The **$\Delta X$ readout** — the Motion tab plots $X_1(t)$ and $X_2(t)$ separately, but their difference $\Delta X(t) = X_1 - X_2$ is not yet drawn as its own curve.
- The **$\lambda$-derivation bridge** — the explicit change of variables from $(M_1, M_2)$ to $(\lambda, T)$ via the free-fall construction. *The Theory of Symmetric Inertia Transfer* states the transform directly; wiring the simulation's coordinates to that derivation end to end is future work.

Each of these is a future simulation. This one is kept, as is, so the ideas can be revisited as they mature.

## 9. Conclusion: the fifth dimension is the frequency domain

What was built here is the coordinate transform, performed live.

The picture, stated plainly. The Earth moves forward and the Earth pulls the Moon, but their relative velocity is constant — so relative to one another, the Moon moves in a straight line. Project its motion onto the plane perpendicular to the velocity vector and the orbit collapses: the Moon falls toward the Earth and comes back, falls and comes back. **Four quarter cycles** of the Moon's motion — in, back, out, back — and that is the wave. The spatial oscillation *is* the projected orbit.

Then the transform: position and time rewritten as frequency and wavelength. The phasor is not a window into a hidden place — it *is* the transform, turning. Its rotation cycles the phase of the wave, and as the phase cycles, the energy-over-wavelength distribution changes. That is all that changes. **All the masses stay constant; nothing changes except the energy at each point in between the two masses.** The phasor turns; the energy redistributes; the bodies stay what they are.

Integrate once over wavelength and you get work and impulse — the energy accounts, $W_n$ and $J_n$. Then, at each instant, collapse the whole spatial line to a single number — the net released impulse $F_n(t) = J_n(L,t) - W_n(L,t)$ — and integrate *that* over time: $X_n(t) = \int_0^t F_n(t')\,dt'$. That is the second integral: not over space but over time, flipped to $J_n - W_n$ because motion comes from what is released, not what is stored. It gives each body's wobble as a trajectory, both directions. It is plotted in the Motion tab as eleven graphs: the spatial and temporal push-pull densities (the starting definition, recovered after two integrations), the static one-cycle snapshots of net impulse and displacement over time, the live in-line wobble projection (the same motion looking down the $\lambda$ axis, $yz$ plane — the lighter body crossing in front), the apparent wobble (the $xy$-plane projection, the two dots), the apparent circular orbit at constant velocity (the naive fixed-center view), Kepler's ellipse with external force, the balance-point-split view, the turbulence point, and the clock relative to an external body.

But here is the part that matters. If you treated the distance between the two bodies as a single variable, you would only ever know their *relative* motion — how far apart they are, how fast the gap opens and closes. The transform gives you more than that. The second integral is taken over time, and that gives us motion in the time domain we know. So we learn not only how much their motion was relative to each other, but **how much the motion was relative to a center point** — a third, impartial reference point that belongs to neither body. Not just "the Moon falls toward the Earth," but how far the Moon wobbles one way from center and how far the Earth wobbles the other, each pulled by gravity, each measured against something neutral. That is new information. The relative motion was always visible; the wobble against center was hidden until the second integral. And the clock is read off that center's motion relative to an external body — time as the shared reading, not an absolute background.

And the fifth dimension. Here is the statement: **the fifth dimension is the frequency domain itself — entered by the coordinate change.** The fifth dimension came from converting into a symmetric wave frequency domain. When the transform moves $(t, x) \to (\omega, \lambda)$, the physics goes somewhere new: the domain of frequency and wavelength, somewhere symmetric in space and time — the phase treats the spatial gradient $k$ and the temporal gradient $\omega$ as the same kind of thing. That domain is the fifth dimension — the hidden fifth dimension that creates the symmetry: hidden because it is the transformed coordinates, not the time and space we started in. That is where it comes in — because we do a coordinate change. Then it converts back to a 4 dimensional spacetime: the ascent reverses the transform, and the rotated result reads out as motion — force in radial, relative velocity out perpendicular. That conversion is the hidden law of symmetric inertia transfer. And it holds up over the invariant of the conservation law: $dW_s = 0$ read off the boundary at the top, vanished at the bottom, returned on the ascent — the relative phases never changing under any operation. A coordinate change is only honest if what it claims to preserve is actually preserved. Here it is: the invariant holds, so the domain holds.

Kepler is still where it comes from: bodies falling around each other, the period bound to the distance, $T^2 \propto a^3$ — two handlings of time, three of space, the five the transform spends. The Wave Lab is Kepler's orbit with the common drift removed and the fall-and-return laid bare on a line — transformed into frequency and wavelength, integrated back into motion.
