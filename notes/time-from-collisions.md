# Time from Collisions

*This note updates the theory. The earlier notes stand as the derivation path — the route by which the stack was found — and are not rewritten. What follows extends the Quantum Tech Stack upward: two new layers, two new symmetry rules, and a new account of what time is. Where this note and an earlier note disagree about what moves, this note is the current statement.*

---

## Table of Contents

- [1. What the animation showed](#1-what-the-animation-showed)
- [2. The turbulence picture](#2-the-turbulence-picture)
- [3. Lock the bodies, move the center](#3-lock-the-bodies-move-the-center)
- [4. The new symmetry rules](#4-the-new-symmetry-rules)
- [5. The new layers](#5-the-new-layers)
- [6. The balance point is a clock ratio](#6-the-balance-point-is-a-clock-ratio)
- [7. The Universal Clock](#7-the-universal-clock)
- [8. The eigenplane — Kepler did the same thing](#8-the-eigenplane--kepler-did-the-same-thing)
- [9. The infinite field](#9-the-infinite-field)
- [10. A math problem, not a physics problem](#10-a-math-problem-not-a-physics-problem)
- [11. What time is](#11-what-time-is)
- [12. Conclusion](#12-conclusion)


## 1. What the animation showed

Watching the two-body motion, something becomes clear that the equations had been hiding: **it is the center that moves, not the bodies.**

The old picture had each body riding its own wobble — $X_1(t)$ carrying $M_1$, $X_2(t)$ carrying $M_2$, each displaced from its mean. But fix the center between the two circles and let the configuration rotate, and the truth comes out: the bodies are rocking back and forth *together*, locked at their separation, and what actually travels is the point between them.

The bodies are locked by gravity at a fixed distance. The wobble does not move them relative to each other — it moves the center underneath them.


## 2. The turbulence picture

Think of the two bodies as hurtling through space, locked together at distance $L$, immersed in a field of gravity waves — a turbulent sea. Mass causes the waves: every mass broadcasts its spatial frequencies in every direction, and every body sits in the collision of all of them.

Each collision pushes. The pushes arrive as wobbles — $X_{n,j}(t)$, body $n$, branch $j$ — the same wobbles the stack computes at u4. But because the bodies are locked, the wobbles cannot separate them. Instead the wobbles *add*. The turbulence shakes the pair, and the pair, being rigid, hands all of that shaking to the one point it shares: the center.

So the center vibrates in the turbulent field — and that vibration is the sum of a great many mass-wave spatial frequencies colliding from different directions, caused by mass, unified at a point.


## 3. Lock the bodies, move the center

The math is a change of what the wobbles are *for*.

**Old:** each body rides its wobble. $M_n$ sits at $p_n + \mathbf{X}_n(t)$.

**New:** the bodies are rigid. $M_1$ and $M_2$ hold separation $L$ fixed. The wobbles are summed — vector sum, over bodies and over branches — into the motion of the center:

$$
\mathbf{C}(t) = \sum_{n=1}^{2}\sum_{j\in\{x,y\}} X_{n,j}(t)\,\hat{e}_j,
$$

i.e.

$$
C_x(t) = X_{1,x}(t) + X_{2,x}(t), \qquad C_y(t) = X_{1,y}(t) + X_{2,y}(t).
$$

The rigid pair rides on $\mathbf{C}(t)$: both bodies displaced by the same center vector. The relative motion the old picture showed was the center moving under the bodies, misread as the bodies moving under themselves.

$\mathbf{C}(t)$ is the *resultant* — the vector sum of the branch wobbles. It is the whole pair's answer to the turbulence, delivered at the one point the pair shares. This is the math the Motion tab's "True Motion: Unified Center Vibration" box is built on: bodies locked to each other at the balance-point split, the center drawn as a cross, the whole rigid configuration moving with the resultant vector.


## 4. The new symmetry rules

The Quantum Tech Stack had one branching rule: **space splits** — a new spatial dimension branches the integration path, and the stack runs once per branch (§7 of that note). Watching the center move reveals the mirror rule:

**Time unifies.** A time integration cannot be taken branch by branch. The next layer up after the wobbles is a time dimension in the integration, and it *demands* that it act on both spatial dimensions at once — by the symmetry rules. Time is what the branches have in common; the symmetry forbids integrating it piecemeal. Where space split the path, time merges it back.

**The center is the clock.** The merged vector $\mathbf{C}(t)$ — the sum of all branch wobbles at the shared center — is what we perceive as time passing. We perceive a *single* time for all the motions because the merge fuses the colliding frequencies into one motion of one point. The singleness of time is not a background assumption; it is the *result* of the merge.

In short: **space splits the branches; time merges them back.** Splitting is how space acts; unifying is how time acts. That is the new symmetry.


## 5. The new layers

The ascent of the tech stack gains two layers. (The descent is unchanged — the way down is still limits and differentiation.)

| Layer ↑ | Equation | Indicator | Operation |
|---|---|---|---|
| **u6. Merge the branches.** The time layer demands the whole: sum every branch wobble into one center vector. | $\mathbf{C}(t) = \sum_n\sum_j X_{n,j}(t)\,\hat{e}_j$ | The branches reunite — one center, vibrating in space. The merge is not optional; it is the symmetry rule for time layers, the mirror of the split. | Vector-sum over bodies and branches. Lock the bodies rigid; move the center with the resultant. |
| **u7. Integrate the center.** One more integration — another time part. | $\boldsymbol{\tau}(t) = \int_0^t \mathbf{C}(t')\,dt'$ | The stretching of time, accumulated from the center's vibration. How hard the bodies pull the center is how much time stretches. | Integrate the center motion over time. |

The rule for adding branches to a time integration is now explicit: **a time integral takes all branches at once.** u6 is not one more branch — it is the layer where branches end. Any future time layer merges first, then integrates. Space adds branches; time collects them.


## 6. The balance point is a clock ratio

The center the branches merge at is the balance point $\lambda^*$ — and it was already telling us about time.

$\lambda^*$ divides the span $L$ in the mass ratio:

$$
\lambda^*_1 = L\frac{M_2}{M_1+M_2}, \qquad \lambda^*_2 = L\frac{M_1}{M_1+M_2}, \qquad \frac{\lambda^*_1}{\lambda^*_2} = \frac{M_2}{M_1}.
$$

The new reading: **this is the ratio of time between the two bodies.**

$$
\frac{T_1}{T_2} = \frac{M_2}{M_1}.
$$

The lighter body, on the longer lever arm, runs through more time; the heavier body, on the shorter arm, runs through less. Mass dilates time — read straight off the balance point, no new constants. The balance point was never just a spatial divider; it is the clock ratio of the pair.

And the *amount* of time-stretch — how much time dilates moment to moment — is the pull on the center: the magnitude of $\mathbf{C}(t)$, accumulated by u7. How much the locked bodies pull their shared center is the motion, and the stretching, of time.


## 7. The Universal Clock

Fix the two bodies. Don't let them move at all. Now watch the center: a solid golden point rocking back and forth on the light grey line between them — each body pulling on it separately.

When two masses rock a center point of the field in space, they each pull on it separately. $M_1$ pulls it one way, $M_2$ pulls it the other, and the point stretches between them. That stretching *is* the wave in space being stretched: the separate pulls deform the field at the shared point, and the golden point is time itself, stretched between the masses.

Integrate that rocking in time and you get the clock ratio — which happens to be the apparent time difference between the two bodies in space. The balance point already said so: $T_1/T_2 = M_2/M_1$. The "Universal Clock" animation is that ratio made visible: the golden point is the excitation of frequencies at that point in space, rocking on the two pulls.

Time, at a point, is the rate of change of frequency in the field of gravitational waves — the excitation of frequencies at each point in space. The rocking golden point is that excitation, drawn.


## 8. The eigenplane — Kepler did the same thing

Here is the correction this theory owed Kepler: he was never wrong. He did exactly what the three-body construction did.

Take the 3D motion — bodies accelerating through the field, chaotic to the eye — and find the plane they stay relatively locked on. That plane is constructed in 3D spacetime: you compute the relative vectors in three dimensions, then collapse to the two-dimensional plane where the locking holds. On that plane, the relative motion is an ellipse. That is Kepler's first law — and it is also the Wave Lab's three-body ellipses. The same operation, the same result.

The first time through, with two bodies, the relative velocity in the ignored dimension was constant — which is why the motion wrapped into a circle. Constant relative velocity plus one collapsed dimension gives a closed curve. With three bodies the relative velocities are not constant — something is accelerating in space — so the true motion will not close in 3D. But you can still shift into two dimensions and find the plane they all orbit on. That plane is the eigenplane: the flat 2D coordinate system, cut through 3D space, on which the bodies stay relatively locked.

It is not the true motion. It is the projection onto the eigenplane. Kepler drew the projection with perfect fidelity — and so did we, the second time, when the three-body tab produced its ellipses. The mistake was only ever in the interpretation: calling the projection the whole story, or calling it wrong for being a projection. It is neither. It is the 2D relative motion, and it is correct as far as it goes.

Add another body and you get a new vector in a new direction: back to 3D, recompute the vectors for all the bodies, collapse to a new 2D plane, repeat. Really it is just changing the coordinate system to a new flat plane in three-dimensional space — one plane per boundary condition.

And the amount that collapsed point moves between the bodies — the center's motion on the plane — is the rate of change of time. Integrate it and you get the time difference between two points. Integrate again over space and you learn nothing new, because the plane is always constructed in 3D spacetime: re-integrating the same boundary rebuilds the same plane. A new spatial integration only ever tells you how to compute a new relative clock for a *larger* boundary condition.


## 9. The infinite field

Why does it never close? Because the wave field extends infinitely far. Write gravity as a wave field and there is always more energy coming from outside whatever boundary you drew — more masses, more frequencies, more collisions that were not included. Inside the boundary the motion looks clean. The chaos is the outside leaking in.

Space is 3D and motion is 3D. If things are accelerating, the motion appears chaotic — but you can project it into a single 2D plane at the cost of losing the information about the larger system outside the boundary you integrated over. Add all the relative motions inside and you get a point of the gravity field vibrating: the excitation of the frequency domain of the gravity field. That excitation tells you the relative time between each body in the system, and it gives you a clock. Add another body to the system and you must go back to 3D space, recompute the vectors, collapse to 2D, and repeat.

Within a given boundary — a given amount of energy in the system — the integrations close, and you get the initial conservation law back. The closure is real; only the boundary is a choice.

And that may be the conclusion of the whole investigation: we can find the apparent time between two bodies — their shared center, their clock ratio — but to find motion relative to another body we always have to find a new reference plane. Space is infinite and not integrable over infinity. Technically we would have to keep integrating relative to some other part of the wave field, and it goes on forever without any reference. Every time is some system's time. There is no clock of the whole field, because there is no boundary around infinity.


## 10. A math problem, not a physics problem

The more bodies you add, the more vectors each body carries. Past a point it becomes impossible to solve in three-dimensional space: with four bodies or more there are more independent variables than equations — $x$, $y$, $z$ for four or more vectors each — and the system is underdetermined. And even for three bodies, there is always some unknown part of the field acting on the system from outside the boundary.

So the three-body problem was never a question of the physics. The force law is not missing. It is a math problem: underdetermination. There is always at least one more body — always more field — than the equations close over.

Which clarifies what the wave equation was doing all along: it rewrote the equations of relativity in wave form. The same content, in a shape that was easier to understand. The wave field that extends infinitely far is spacetime; the boundary you integrate over is the reference frame; the clock ratio is proper time. Nothing was overthrown. It was translated.


## 11. What time is

Putting it together:

- The gravity-wave field is turbulent: mass-wave spatial frequencies colliding from every direction, caused by mass.
- Locked bodies cannot answer the collisions separately, so the wobbles sum at their shared center: $\mathbf{C}(t)$.
- The merge is demanded by symmetry — time acts on all space at once — so the many collisions become one vibration.
- We perceive a single time because there is a single center motion. Time is not the background the collisions happen *in*; time is the *resultant of the collisions*.
- The balance point sets the ratio of time between the bodies; the integrated pull sets the stretch.

**What we perceive as time is really the motion of the center point of a mass vibrating in a field of gravity waves.** The bodies are locked together and they act on the center between them — and how much they pull the center is the motion and the stretching of time.


## 12. Conclusion

The Quantum Tech Stack now climbs seven layers up (u1–u7), and the new top of the stack is time itself — not assumed, but built: branched by space, merged by symmetry, vibrated by collision, integrated into stretch, ratioed by the balance point.

The open question from the tech stack's conclusion — what the hidden time dimension *is* — has its answer: it is the center, moving. The fifth dimension was never a place; it is the point the locked bodies share, doing the one motion they can all agree on. And that agreement is what we call time.

But the agreement is always local. Every clock belongs to the boundary that merged it: the apparent time between two bodies is well-defined, and within that boundary the integrations close and return the conservation law. Beyond the boundary there is always more field — more collisions, more frequencies, another body — and to include it you redraw the boundary, recompute the plane, and merge a new center. There is no final reference, no clock of the whole. The stack does not end at the top; it ends at the edge of whatever you chose to include. That is not a failure of the theory. It is what time is.
