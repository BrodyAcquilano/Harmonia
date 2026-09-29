# The Gravitational Tech Stack

*This note is the effect of which the previous note's intuition was the cause. "Decay and Amplitude" records how the wave equation was found — the contraction, the guess, the decay, the amplitudes — as it was understood at the time. This note records what that process looks like from above, once the whole round trip is visible: a stack five levels deep, a conservation law at the top, the same conservation law at the bottom, and a return trip — now seven layers up — that comes back rotated ninety degrees.*

---

## Table of Contents

- [1. What the stack is](#1-what-the-stack-is)
- [2. The stack, in full](#2-the-stack-in-full)
- [3. Facts and takeaways](#3-facts-and-takeaways)
- [4. Layer by layer](#4-layer-by-layer)
- [5. The abstracted stack](#5-the-abstracted-stack)
- [6. The span principle](#6-the-span-principle)
- [7. The spatial dimension addition principle](#7-the-spatial-dimension-addition-principle)
- [8. Planes and coordinate transforms](#8-planes-and-coordinate-transforms)
- [9. Time integrates over all branches — the turbulence point](#9-time-integrates-over-all-branches--the-turbulence-point)
- [10. Conclusion: the rotation is a change of frame](#10-conclusion-the-rotation-is-a-change-of-frame)


## 1. What the stack is

A tech stack is layers with a direction: you go down through them to the thing everything stands on, and back up to the thing the user sees. The derivation of the inertia waves turns out to have exactly this shape.

Going **down** is limits and differentiation: each level removes a variable — a limit with respect to time, a limit over space, a differentiation, another limit over space, a final substitution — until no independent variable is left and everything is a proportion of the boundary masses. Going **up** is integration: the same steps in reverse, accumulating again — but rotated. What went down radial comes back perpendicular.

The trip is a round trip. We started with a conservation law read off the boundary conditions, worked down to a fully contracted differential equation, solved it — the stack tells us the solution is a time- and space-dependent wave — and integrated back up to *the same conservation law*. We knew we had hit the bottom because no independent variable remained and the total differential vanished. We knew the trip was over when the law we started from reappeared.

The stack has five levels. That number is not a choice: Kepler's third law says so — $T^2 \propto a^3$, two of time, three of space, $2 + 3 = 5$.

---

## 2. The stack, in full

Two tables: the way down, then the way back up — each with four columns: the layer and what it means, the equation, the indicator read off that equation, and the operation that moves us one level. Between them, the bottom equation — the differential equation, fully contracted. After them, the whole trip in shorthand, then the patterns.

### The descent — signal in ↓

| ↓ Layer | Equation | Indicator | Operation |
|---|---|---|---|
| **d1.** The first limit: energy is conserved *because the boundary conditions are known*. Moon-earth: we know the equations for potential and kinetic energy, so we can define the thing. The rate of change of energy over the boundary — a limit with respect to time. Energy is time-like. | $\lim_{\text{boundary}}\frac{dE}{dt} = 0$ | Conservation is not postulated — it is read off the boundary. Where the boundary is known, energy cannot leak. | Take the limit with respect to time: $F = ma$ to $KE = \tfrac{1}{2}mv^2$, acceleration to velocity — one time dimension contracted. |
| **d2.** The frequency–velocity part, before any wave solutions: $v = f\lambda$. A limit over $\lambda$ — it has velocity in it — relating frequency and velocity to take the limit over space. | $v = f\lambda$ | One spatial variable contracted: down to one time and two space. The phasor, deconstructed one step further. | Take the limit over space $\lambda$ (spend the dispersion relation). |
| **d3.** The $ik\omega$ level: differentiate with respect to time again. | $\frac{\partial\psi_n}{\partial M_m} = \pm i(k,\omega)\psi_n \;\to\; k_1\psi_1 = \omega_2\psi_2$ | The $i$ drops out of the ratio: the phase gradients relate $k$ to $\omega$ directly. Every $+i$ matched by a $-i$ — the symmetry made local. | Differentiate with respect to time (chain through the phase). |
| **d4.** $k\omega$ is $f\lambda$ with the chain rule applied: another limit over space. | $\omega \propto k$ (chain-rule ratios, e.g. $\omega_2 = k_1k_2/\omega_1$) | The dispersion relation collapses to one proportionality — one $\lambda$ left. | Take the limit over space again. |
| **d5.** $\lambda_2$ in terms of $\lambda_1$: the proportions of the lambdas and the masses are known, so both are written in terms of $m_1$ and $m_2$. | $\frac{\lambda_2}{\lambda_1} = \sqrt{\frac{M_1}{M_2}}$ (from $\frac{k_2}{k_1} = \sqrt{\frac{M_2}{M_1}}$) | No independent variable remains — everything is a mass proportion. The boundary conditions can be reconstructed from mass alone. | Substitute the mass proportions (eliminate the last variable). |

*signal deconstructed:*

$$
d\psi_s = \left(\frac{\partial\psi_1}{\partial M_1}+\frac{\partial\psi_2}{\partial M_1}\right)dM_1 + \left(\frac{\partial\psi_1}{\partial M_2}+\frac{\partial\psi_2}{\partial M_2}\right)dM_2 = 0,
$$

with the two local pairings $\frac{\partial\psi_1}{\partial M_1}+\frac{\partial\psi_2}{\partial M_1} = 0$ and $\frac{\partial\psi_1}{\partial M_2}+\frac{\partial\psi_2}{\partial M_2} = 0$.

**The turn.** We know the solution because the tech stack tells us it is a time- and space-dependent wave. Solve the differential equation and you get the gravity wave equation:

$$
\psi_1 = A_1 e^{i(k_1M_1-\omega_1M_2)}, \qquad \psi_2 = A_2 e^{i(k_2M_2-\omega_2M_1)}.
$$

Then integrate back up, reversing the descent.

### The ascent — signal recovered ↑

Each level undoes one level of the descent, in reverse order.

| Layer ↑ | Equation | Indicator | Operation |
|---|---|---|---|
| **u1.** Undo d5: expand the mass-proportion substitution — one $\lambda$ becomes two. | $\frac{k_2}{k_1} = \sqrt{\frac{M_2}{M_1}}$ | The proportions are the boundary conditions' memory: they survive the round trip, so the rebuild is exact. | Expand: restore the eliminated variable. |
| **u2.** Undo d4: expand the space limit — $\omega$ un-collapses from $k$. Accumulate over the restored space. | $W_n = \int_0^L \mathrm{Re}(\psi_n)\,d\lambda_n$, $J_n = \int_0^L \mathrm{Im}(\psi_n)\,d\lambda_n$ | Oscillation turns into accounts: work (what the field could do) and impulse (what it has done). | Integrate over space. |
| **u3.** Undo d3: integrate with respect to time — the $i$ returns. Collapse to the boundary, then the first time integral. | $F_n(t) = J_n(L,t) - W_n(L,t)$ | The whole line becomes one number per instant; the quarter-turns begin to compose — radial in, perpendicular out. The rotation happens here. | Evaluate at the boundary; integrate over the hidden time. |
| **u4.** Undo d2: expand the $v = f\lambda$ contraction. The second time integral. | $X_n(t) = \int_0^t F_n(t')\,dt'$ | The second time dimension is where motion lives: the wobble, the trajectory. | Integrate over the second time. |
| **u5.** Undo d1: the contracted time dimension is restored — energy is conserved again. | $d\psi_s = 0$ | The conservation law reappears — the trip is over when the equation we started from returns. | Restore the boundary: un-contract the time dimension. |

The Motion tab's push-pull density is this same machinery, differenced per body: $D(\lambda_n) = \int_0^{\lambda_n}[(\mathrm{Re}\psi_1-\mathrm{Im}\psi_1) - (\mathrm{Re}\psi_2-\mathrm{Im}\psi_2)]\,d\lambda'$ — the Integration tab's $W_n - J_n$ areas as definite integrals, one per body, subtracted.

### Shorthand

| signal in ↓ | signal recovered ↑ |
|---|---|
| $\lim_{\text{boundary}}\frac{dE}{dt} = 0$ | $d\psi_s = 0$ |
| $v = f\lambda$ | $X_n(t) = \int_0^t F_n(t')\,dt'$ |
| $\frac{\partial\psi_n}{\partial M_m} \to k_1\psi_1 = \omega_2\psi_2$ | $F_n(t) = J_n(L,t) - W_n(L,t)$ |
| $\omega \propto k$ | $W_n$, $J_n = \int_0^L \psi_n\,d\lambda_n$ |
| $\frac{\lambda_2}{\lambda_1} = \sqrt{\frac{M_1}{M_2}}$ | $\frac{k_2}{k_1} = \sqrt{\frac{M_2}{M_1}}$ |
| *signal deconstructed:* $d\psi_s = \left(\frac{\partial\psi_1}{\partial M_1}+\frac{\partial\psi_2}{\partial M_1}\right)dM_1 + \left(\frac{\partial\psi_1}{\partial M_2}+\frac{\partial\psi_2}{\partial M_2}\right)dM_2 = 0$ | |

### Patterns

| Pattern | What it says | Where it lives |
|---|---|---|
| **Limits** | Every step down is a limit or a differentiation — a limit taken quietly does a derivative's work. | d1 (time), d2 (space), d3 (time, again), d4 (space, again) |
| **Definite integrals** | Every step up is a definite integral — the reverse of a limit, evaluated between known bounds. | u1–u4; the bounds are the boundary conditions, carried the whole way |
| **Boundary conditions** | Known at the top (the PE/KE equations), contracted to pure mass proportions at the bottom, rebuilt from mass on the return. | d1 (given), d5 (contracted), u1 (restored) |
| **Symmetry → coherence** | Every $+i$ matched by a $-i$; relative phases invariant under every operation. The signal survives because the symmetry protects it. | d3 (the $i$ drops from the ratio); the whole trip |
| **Conservation → rotation count** | Five integrations, five quarter-turns $\equiv 90°$: the force that went down radial comes back perpendicular. | u2–u4 (the integrations); the turn composes at u3 |
| **Frame rotation (relativity)** | The descent reads the conservation law in the radial frame; the ascent rebuilds it in the perpendicular frame. The frequency-phase domain is the same physics with the coordinates turned — a change of reference frame, not a new place. That turn is why the acting direction of the energy rotates: the force goes down radial and re-emerges perpendicular, the way a vector's components change when the axes rotate. | The whole round trip; Kepler's third law is the indicator: $T^2 \propto a^3$ counts two times and three spaces |

---

## 3. Facts and takeaways

**The indicators.** Four signs, known in advance, that the stack was the right shape:

1. **Boundary conditions known.** We could define the thing — moon-earth, the PE and KE equations — so the conservation law was read off the boundary instead of postulated. A stack needs a boundary to stand on.
2. **Limits acting as derivatives.** Two limits with respect to time and two limits over space, each removing a variable exactly the way a derivative would — plus one differentiation that took a ratio instead.
3. **The dimension count from Kepler.** $T^2 \propto a^3$ gives $2 + 3 = 5$: three of space, two of time. The descent spends them — one time (d1), two space (d2, d4) — and the fifth level is the substitution that removes the last variable.
4. **The $i$ in the solution.** Relative directions and relative velocities put the imaginary unit in the answer. $i$ indicates rotation.

Given all four, the outcome was nearly forced: solve the bottom equation for a time- and space-dependent wave, integrate back up the other side, and the symmetry guarantees a phasor there too — hence the complex exponential.

**Coherence.** The information stays coherent the whole way down and back up because the relative phases never change. Every operation on the trip — differentiation, contraction, integration — multiplies all components by the same phase factor. Absolute phase shifts; relative phase is invariant. The signal that returns is the signal that left, rotated but intact.

**The chain rule is the deconstruction.** "Signal deconstructed" is not just the equation at the bottom — it is the *result of the chain rule*: limits and differentiations down through every dependency, and integrations back up in reverse order. That exact reversal is what stays coherent — $D^{-1}D$ is the identity on everything the chain touched — and it is what lets us recover the signal. The chain is the mechanism; coherence is its guarantee; recovery is its consequence. Anything the chain didn't touch (the amplitude) waits at the boundary conditions and is fixed at closure.

**Which level rotates, and why.** Every integration is a quarter-turn: integrating $e^{i\phi}$ multiplies by $1/i = -i$, a 90° rotation in the complex plane. Five integrations make $5 \times 90° = 450° \equiv 90°$ — an odd number of quarter-turns nets a single quarter-turn. That is why the force that went down radial comes back perpendicular: the arithmetic of the stack leaves one unmatched rotation. The rotation is concentrated on the ascent, at the time-integration levels (u3, u4), where the phasor — the hidden time dimension — does the turning.

**The frequency connection.** The phasor's rotation rate is tied to mass by the Planck–Einstein relation, $\omega_n = 2\pi M_n c^2/h$. Frequency is mass-energy per quantum of action: the faster the phasor turns, the more massive the body. The $i$ tells you there is rotation; $\omega_n$ tells you how fast, and it is mass all the way down.

**The symmetry.** At the bottom, the total differential vanishes with every $+i$ matched by a $-i$ — the symmetry made explicit in the two local pairings. At the top, $d\psi_s = 0$ — the same statement, read off the boundary conditions. At the return, $d\psi_s = 0$ reappears — the same statement, recovered. Three writings of one fact: inertia is conserved.

**Alternation.** Down: time limit, space limit, time differentiation, space limit, mass substitution. Up: the same steps reversed. The bottom depends on neither space nor time — only on $m_1$ and $m_2$. Space and time are the scaffolding the stack is climbed on; the ground floor is pure boundary condition.

**Reconstruction from mass.** At d5 no independent variable remains and the proportions are known — so the boundary conditions rebuild from the masses alone. This is why the decay rate $\beta = |M_1-M_2|/(M_1+M_2)$ can be read off $m_1$, $m_2$ with nothing else: the bottom of the stack is pure proportion.

---

## 4. Layer by layer

What follows is each layer as its own section, stated generally enough to lift off this particular wave equation.

### a. The boundary conditions and the first limit (top)

Every stack starts with something known: here the PE and KE equations, which define the thing — so the conservation law is read off the boundary, not postulated. The first move is a limit with respect to time: the rate of change of energy over the boundary. Energy is time-like. The general form: **name the boundary conditions before you touch anything else, and take the first limit with respect to time.** Acceleration to velocity ($F = ma$ to $KE = \tfrac12mv^2$) contracts a time dimension.

### b. The frequency–velocity limit

$v = f\lambda$: frequency times velocity, a limit over space. One spatial variable contracted — down to one time and two space. The general form: **find the dispersion relation and spend it.** Any relation of the form (rate) = (frequency)×(wavelength) is a phasor being deconstructed; using it is the way down.

### c. The local response (gradients)

Differentiate with respect to time: $\partial\psi_n/\partial M_m = \pm i(k,\omega)\psi_n$ — and the ratio $k_1\psi_1 = \omega_2\psi_2$, with the $i$ gone. Absolute phase drops out; the phase gradients relate $k$ to $\omega$ directly — the symmetry made local. The general form: **differentiate until only the local symmetry is left.** This is the level the simulation's Derivatives tab lives on.

### d. The second contraction

$k\omega$ is $f\lambda$ with the chain rule applied: another limit over space, and $\omega$ written in terms of $k$ — one $\lambda$ left. The general form: **spend the dispersion relation twice.** The first spending contracts a variable; the second collapses the relation itself to a proportionality.

### e. The ground floor

$\lambda_2$ in terms of $\lambda_1$, everything in mass proportions — no independent variable left. The boundary conditions rebuild from $m_1$, $m_2$ alone, and the bottom equation is the vanishing total differential. The general form: **the bottom is where no independent variable remains and the equation equals zero.** If it still mentions space or time, keep going.

### f. The solution (the turn)

The stack says the solution is a time- and space-dependent wave — so solve the differential equation: $\psi_1$, $\psi_2$, the gravity wave equation. The general form: **the stack dictates the solution's form before you solve.** A conservation law plus a phasor means the answer waves.

### g. Accumulation and the first time integral (first way up)

$W_n$, $J_n = \int \psi_n\,d\lambda_n$: integrate over the restored space; the wave becomes its own accumulation — work, impulse. Collapse to the boundary, then $F_n(t) = J_n(L,t) - W_n(L,t)$: the whole line becomes one number per instant, and the quarter-turns begin to compose. The general form: **integrate over each restored coordinate once, then over the hidden time.** This is the level where rotation enters — the force changes direction here.

### h. The second time integral

$X_n(t) = \int_0^t F_n(t')\,dt'$. Integrate over the second time dimension and motion appears: displacement, the wobble, the trajectory. The general form: **the second time dimension is where motion lives.** One time dimension rotates the phase; the other accumulates the result into movement. A new spatial direction adds no new time dimensions — it adds a branch through the same two, rotated into the new direction (see §7).

### i. Closure (top, returned)

$d\psi_s = 0$ — the conservation law of (a), recovered, with the force now perpendicular to the direction it started. The general form: **the trip ends when the invariant reappears.** If it doesn't reappear, a level was skipped.

---

## 5. The abstracted stack

At its finest level, the gravitational tech stack is this:

1. **Boundary** — name the boundary conditions; read the conserved quantity off them.
2. **Limit (time)** — take the rate of change over the boundary; contract a time dimension.
3. **Limit (space)** — spend the dispersion relation; contract a space dimension.
4. **Gradient** — differentiate to the local symmetry; the $i$ drops from the ratio.
5. **Limit (space, again)** — collapse the dispersion relation to a proportionality.
6. **Ground** — substitute the proportions; no independent variable left; the equation equals zero.
7. **Solve** — the stack says the solution waves in time and space; solve the differential equation.
8. **Accumulate** — integrate back over each restored coordinate.
9. **Rotate** — integrate over the hidden time; let the quarter-turns compose.
10. **Move** — integrate over the second time; read off the trajectory.
11. **Close** — recover the invariant.

Any conservation law with known boundary conditions, a dispersion relation, and wave solutions can be run through it. Other forms of the stack are possible — different dispersion relations contract different coordinates, and a different count of integrations nets a different rotation — but the shape is the same: down by limits and differentiation, up by integration, the solution's form dictated by the stack, closure by recovery of the invariant.

---

## 6. The span principle

Boundary conditions confine motion to the space its forces span. Two bodies with no initial velocity, whose forces act along one dimension, cannot leave that line: with no velocity and no energy in any other direction, there is nowhere else for the motion to go — the resultant motion from that force is confined to one dimension. But the stack's resultant motion comes out perpendicular to the direction of the force, so the two-body object moves in a 2D plane: the line of force crossed with the perpendicular wobble.

Three bodies with no initial velocity, whose forces span a plane, are confined the same way: force and resultant motion stay in the plane. But the resultant motion is perpendicular to the force — and perpendicular to a plane points into the third dimension. So the three-body object moves through 3D space, assuming the three bodies carry some equal velocity relative to some other frame of reference: the common drift gives the perpendicular motion its third axis.

The straight-line force matters here too: because each pair stays connected by a straight line, the resultants still come in six circles — the branches resolve the geometry, and the resultants collapse it back down.

---

## 7. The spatial dimension addition principle

The stack as described is five layers high because the problem it was built for has one spatial dimension — and five is where it stays. Adding a spatial dimension does not add new dimensions at all: it adds *branches* through the same machinery. The dimensions are the same five fundamental dimensions of the tech stack; what multiplies is the integration path. This is the spatial dimension addition principle, stated correctly.

It is the first time the path splits. On the way up, the wobble integral divides into two separate branches — the wobble computed in one direction, then in the other — and the resultant wobbles are summed. It is not two new time dimensions; it is the same time dimensions used to rotate into different directions: figure out the wobble in one direction, then another, then sum the resultant wobbles. On the way down, the split runs in reverse: the derivative does not climb into higher dimensions but divides into two initial-condition branches. Call them A and B incoming, Y and Z outgoing — we never have to track A-on-Y, A-on-Z, B-on-Y, B-on-Z separately, because the gravitational tech stack handles the rotations for us, keeping the relative orientation of the branches on the outside and rotating them relative to one another.

One more rule, borrowed from linear algebra, fixes the branch count: $xx$ and $yy$ already span the plane. Two perpendicular directions define any other direction of the plane by combining them in different proportions, so the branches needed are exactly two — no $xy$ or $yx$ cross terms. Any cross direction is already a linear combination of the perpendicular pair; writing it separately would double-count.

Concretely, the branches just add an extra spatial phase term to the existing equation — $\lambda_j$, $k_{a,j}$ alongside $\lambda$, $k_a$ — and additional branches to integrate or differentiate over at the last node of the five-layer stack: where the stack integrates or differentiates, it now does so once per branch. Still one phase angle per wave; the rest of the equation does not change. That is the whole of the addition principle: same equation, extra spatial term, and the final node run once per branch.

Finding the center is part of the addition process. Technically we need the resultant of each branch — the line between each pair of bodies, which defines their relative motion as perpendicular to their direction of travel, given that relative to one another they have a constant velocity, even if it is zero. In our case the center comes straight from ratios, which makes it even easier — and the reason that works is that those ratios define the span of the vector space. And because each resultant pair is still connected by a straight-line force, we still expect six circles for the resultants: twelve branch-circles collapsing through resultant vectors, per the three-body program.

---

## 8. Planes and coordinate transforms

Motion is always relative to another body in the gravitational field. There is no absolute frame — only bodies, and the planes they share.

The stack computes in three dimensions and draws in two. Take the 3D motion — the full vectors, all branches — and find the plane the bodies stay relatively locked on. That plane is constructed from the vectors: compute in 3D, collapse to the 2D plane where the locking holds, draw the relative motion there. That plane is the eigenplane: the flat 2D coordinate system, cut through 3D space, on which the boundary's bodies stay relatively locked.

Two bodies in 3D space, no external force, constant relative velocity: project onto the plane and the axis wraps into a circle. The circle is what constant velocity looks like on the eigenplane — the axis bent around, no acceleration anywhere. Three bodies in 3D space, with external force acting — acceleration relative to something else: the projection needs an ellipse, or a hyperbola for escape. The ellipse is what acceleration looks like on the eigenplane. Kepler drew ellipses because the planets he watched were under external force — the Sun's pull, acceleration relative to something else — and the ellipse is the projection that carries it.

Each boundary gets its own plane. Add a body and you get new vectors in new directions: back to 3D, recompute, collapse to a new 2D plane, repeat. It is just changing the coordinate system to a new flat plane in three-dimensional space — one plane per boundary condition. And every change of plane is a coordinate transform, computed from the vectors.

This is where the collisions matter. Fresh from a common origin, many bodies travel in the same direction — they share planes, and one coordinate system covers them all. But collisions randomize directions: more and more bodies rotate in different directions relative to each other, fewer and fewer share a plane. Each new relative group needs its own eigenplane, and shifting from one 2D plane view to another costs a coordinate transform — more variables, every time. The older the system, the more planes, the more transforms. That is the price of chaos, counted in coordinate systems.

The branch machinery of §7 is what makes the planes computable: the stack rotates the branches relative to one another while keeping their relative orientation, and the eigenplane is where the rotated branches land. The plane is not assumed; it is constructed — from the vectors, per boundary, every time.

And the stack itself is a coordinate transform. What goes in is position and time — where the bodies are, when. What the stack works in is the frequency domain: frequency and wavelength — how fast the phasor turns, how long the wave is. The descent transforms position-time into frequency-lambda; the ascent transforms back into motion. The ninety-degree rotation the round trip is famous for is what a coordinate transform does: the same physics, rewritten in the new coordinates, comes back pointing somewhere new.

## 9. Time integrates over all branches — the turbulence point

A time integration cannot be taken branch by branch. Space splits the integration path — one branch per direction — but a time layer demands the whole: it acts on all spatial branches at once, by symmetry. Time is what the branches have in common, so time is what merges them.

The stack gains two layers on the ascent for this (see "Time from Collisions" §5):

**u6. Merge the branches.** Sum every branch wobble into one center vector:

$$\mathbf{C}(t) = \sum_n\sum_j X_{n,j}(t)\,\hat{e}_j.$$

**u7. Integrate the center.** One more time integral: $\boldsymbol{\tau}(t) = \int_0^t \mathbf{C}(t')\,dt'$.

What the machine computes at the top of the stack is a **turbulence point in the center**: the merged resultant $\mathbf{C}(t)$, the one point the locked bodies share, vibrating in the turbulent field. That is the point moving in the Motion tab's turbulence graph — the eigen point relative to the center, moving in a line relative to some external body. It is not either body's motion; it is the pair's answer to the collisions, delivered at the center.

And this is why there is one time, not many: the merge fuses the branch frequencies into a single motion of a single point. The singleness of time is not assumed at the bottom of the stack — it is built at the top, by the merge.

## 10. Conclusion: the rotation is a change of frame

The stack goes down in the radial frame and comes back up in the perpendicular frame. Read it as a relativity principle: the frequency-phase domain is not a new place the signal visits — it is the same conservation law with the coordinates turned. A vector's components change when you rotate the axes; the force that went down radial comes back perpendicular for the same reason. The round trip turned the frame.

That is what the whole stack is an instance of: **the physics is the invariant; the frame is the choice.** The conservation law at the top, the vanishing differential at the bottom, the recovered law on the return — one statement, read in three frames. The five levels are the turn, counted: two times, three spaces, $T^2 \propto a^3$.

The rest follows the same principle. The branch machinery (§7) splits the frame into directions; the merge (§9) collects them back into one. The eigenplane (§8) is the frame the boundary's bodies share — constructed from the vectors, one per boundary. The turbulence point (§9) is what the merged frame's clock reads: the center, moving.

What is certain is the coherence. Down five levels and back up — through contraction and limits, the branch splits, the merge, the quarter-turns — the relative phases never change. Whatever the frames are, the information survives them.
