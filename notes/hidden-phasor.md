# The Hidden Phasor: Time as Rotation in the Wave Lab

*Companion to "Symmetric Inertia Transfer" and "Lambda Derivation." This note documents the Wave Lab simulation: what the animation means, why there is no time axis, and how each graph is to be read.*

---

## 1. The phase-angle knob

The field equations from the main paper are

$$
W_1(M_1,M_2) = A_1 e^{i(k_1 M_1 - \omega_1 M_2)}
$$

$$
W_2(M_2,M_1) = A_2 e^{i(k_2 M_2 - \omega_2 M_1)}
$$

There is no time variable here. The masses themselves are the coordinates: $M_1$ is the spatial coordinate of $W_1$, $M_2$ its temporal coordinate, and the roles reverse for $W_2$.

The simulation introduces a clock $\tau$ and writes the phase of the first wave as

$$
\phi_1(\tau) = k_1 \lambda_n - \omega_1 M_2 \tau
$$

The essential clarification: **$\tau$ is not a knob for $M_2$. It is a knob for the phase angle.** $M_2$ stays fixed at whatever the slider sets. What advances is the angle $\phi_1$ itself. The phasor $e^{i\phi_1}$ rotates through the complex plane — real part becoming imaginary, imaginary becoming negative real — cycling through full periods as $\tau$ runs.

So the period $T$ is not the time for $M_2$ to change. It is the time for the phasor to complete one rotation:

$$
T_1 = \frac{2\pi}{\omega_1 M_2}, \qquad T_2 = \frac{2\pi}{\omega_2 M_1}
$$

Playing $\tau$ from $0$ to $T$ rotates each phasor through exactly one full cycle: potential to kinetic and back.

## 2. There is no axis for time

Every graph in the Wave Lab has a spatial horizontal axis ($\lambda_n$). **There is no axis for time.** Time is a hidden dimension — the phasor rotates through it, and we perceive that rotation only as animation: the curves breathing, shifting, exchanging real and imaginary parts frame by frame.

This is deliberate. In the theory, time was never an independent background coordinate. The simulation honors that by refusing to draw it. What we see is the *effect* of time — the phase advancing — without ever plotting time itself.

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

This is why the waves are counter-propagating ($\psi_1$ toward $+\lambda_n$, $\psi_2$ toward $-\lambda_n$) and why they decay in opposite directions. Each wave is strongest at its own body's end and fades toward the other: the signal attenuates with distance. The balance point $\lambda^*$, where the envelopes cross, is where the two signals meet at equal strength — the negotiation point of the mutual pull.

The relative velocity stays fixed — the bodies are not accelerating *relative to each other* — but within that fixed frame they wobble back and forth, each tugging the other. The wobble switches direction **every half cycle**: push becomes pull, pull becomes push, at each zero-crossing of the wave. That switching is the heartbeat of the energy transfer.

## 5d. From energy at a point to distance moved

This leads to the central conclusion of the simulation. If we can read, at every point $\lambda_n$ along the wavelength, how much spatial inertia has acted there — how much work has been done, how much impulse generated — then we can determine **how far the body has moved**. The spatial pattern of energy *is* the displacement history, encoded as a wave.

We are very close to making this quantitative. The integration graphs already compute the first integrals:

$$
W_n(\lambda_n) = \int_0^{\lambda_n} \mathrm{Re}(\psi_n)\,d\lambda', \qquad J_n(\lambda_n) = \int_0^{\lambda_n} \mathrm{Im}(\psi_n)\,d\lambda'
$$

The next step — not yet implemented — is a **second integral**: not a plain accumulation, but the integral of the *difference* between the two bodies' work-impulse balances. Define the local push-pull at each point:

$$
D(\lambda_n) = \big[W_1(\lambda_n) - J_1(\lambda_n)\big] - \big[W_2(\lambda_n) - J_2(\lambda_n)\big]
$$

$D(\lambda_n)$ is the net push in the $+\lambda_n$ direction at that point: body 1's remaining inertia minus body 2's. Integrating it along the wavelength,

$$
X = \int_0^{L} D(\lambda_n)\,d\lambda_n
$$

gives the total displacement — how far the system has moved over the elapsed phasor time. The first integral turned the field into energy; the second turns the energy *difference* into motion.

There is a dimensional logic to this, worth stating plainly. We started with **one dimension**: the spatial line $\lambda_n$ between the bodies. We added a **second**: the hidden phasor dimension $\tau$, time as rotation. Integrating once over the wavelength gave us energy as a function of position. Integrating the *difference* once more gives us displacement as a function of time. **For every spatial dimension, we add two time dimensions**: one for the phase to rotate through, one for the motion to accumulate in. The pattern — space, phasor-time, displacement-time — should generalize to higher dimensions the same way.

## 6. Why the axis runs $0$ to $4\pi$

The spatial axis spans $0$ to $4\pi$. With the normalized $k_1 = 1$, the spatial wavelength is $2\pi/k_1 = 2\pi$, so the window holds exactly **two full wavelengths**.

Two, not one, because the wave is complex. The real part (spatial inertia, $\cos\phi$) and the imaginary part (temporal inertia, $\sin\phi$) sit a quarter-cycle apart — that offset *is* the factor of $i$, the $90^\circ$ rotation coupling the two forms of inertia. One wavelength shows a single cycle of each; two wavelengths let the eye confirm the quarter-cycle offset persists, and show how the envelope $e^{-\beta\lambda_n}$ decays across the span. It is the smallest window that displays both the oscillation and its structure.

The envelope deserves a remark. Each wave carries a decay factor — $e^{-\beta\lambda_n}$ for $\psi_1$ (decaying to the right), $e^{-\beta(L-\lambda_n)}$ for $\psi_2$ (decaying to the left) — with $\beta = |M_1-M_2|/(M_1+M_2)$. When the masses are equal, $\beta = 0$ and both waves are pure, undecaying sinusoids: the symmetric case. Unequal masses tilt the envelopes in opposite directions, and the two waves become mirror images of each other.

## 7. Reading the graphs

### 7.1 Gravity — "Gravity Waves Inertia-Energy"

Three curves, all real parts (the spatial-inertia component) plotted against $\lambda_n$:

- **$\psi_1$ (blue)** travels toward $+\lambda_n$; **$\psi_2$ (orange)** travels toward $-\lambda_n$. They are counter-propagating by construction: the sign of the spatial phase term is reversed between them.
- **$\psi_s = \psi_1 + \psi_2$ (dark)** is the summed field — the total inertial state of the closed system.
- The vertical dashed line is the **balance point** $\lambda^* = L\,M_1/(M_1+M_2)$, the mass-weighted center. For equal masses it sits at the midpoint; for $M_2 = 3M_1$ it sits at $L/4$.

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

## 8. What this simulation does not show

This note describes the constant-relative-velocity, phasor-rotation simulation only. It does not show:

- The **mass-space view** — the fields plotted directly against $M_1$ and $M_2$ as coordinates, with no $\lambda_n$ and no $\tau$. There the wavenumber varies with the coordinate itself and the waves chirp.
- The **accelerating case** — relative velocity changing with time, wavelength breathing in and out (the chirp of Section 5b, second half).
- The **second integral** — the displacement $X = \int D(\lambda_n)\,d\lambda_n$ proposed in Section 5d. The work/impulse graphs exist; the push-pull difference integral does not yet.
- The **$\lambda$-derivation bridge** — the explicit change of variables from $(M_1, M_2)$ to $(\lambda, T)$ via the free-fall construction, which would make the "equivalent but viewed from a different space" claim exact rather than analogical.

Each of these is a future simulation. This one is kept, as is, so the ideas can be revisited as they mature.
