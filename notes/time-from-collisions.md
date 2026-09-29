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
- [7. A clock relative to an external body](#7-a-clock-relative-to-an-external-body)
- [8. The clock belongs to a third reference](#8-the-clock-belongs-to-a-third-reference)
- [9. The eigenplane — Kepler did the same thing](#9-the-eigenplane--kepler-did-the-same-thing)
- [10. The infinite field](#10-the-infinite-field)
- [11. The background energy](#11-the-background-energy)
- [12. A math problem, not a physics problem](#12-a-math-problem-not-a-physics-problem)
- [13. What time is](#13-what-time-is)
- [14. Conclusion](#14-conclusion)


## 1. What the animation showed

Watching the two-body motion, something becomes clear that the equations had been hiding: **it is the center that moves, not the bodies.**

The old picture had each body riding its own wobble — $X_1(t)$ carrying $M_1$, $X_2(t)$ carrying $M_2$, each displaced from its mean. But fix the center between the two circles and let the configuration rotate, and the truth comes out: the bodies are rocking back and forth *together*, locked at their separation, and what actually travels is the point between them.

The bodies are locked by gravity at a fixed distance. The wobble does not move them relative to each other — it moves the center underneath them.


## 2. The turbulence picture

Think of the two bodies as hurtling through space, locked together at distance $L$, immersed in a field of gravity waves — a turbulent sea. Mass causes the waves: every mass broadcasts its spatial frequencies in every direction, and every body sits in the collision of all of them.

Each collision pushes. The pushes arrive as wobbles — $X_{n,j}(t)$, body $n$, branch $j$ — the same wobbles the stack computes at u4. But because the bodies are locked, the wobbles cannot separate them. Instead the wobbles *add*. The turbulence shakes the pair, and the pair, being rigid, hands all of that shaking to the one point it shares: the center.

So the center vibrates in the turbulent field — and that vibration is the sum of a great many mass-wave spatial frequencies colliding from different directions, caused by mass, unified at a point.


## 3. Add the frame's motion — don't move into a new frame

The math is a change of what the wobbles are *for*. An earlier version of this section stated it wrong: lock the bodies rigid, sum the wobbles, move the center. That made the turbulence point sound like an isolated thing — as if the integration lifted the motion into a new reference frame and left the bodies behind. The correction: **the integration adds the reference frame's own motion; it does not move into a new frame.**

Both things are true at once:

- The **resultant velocity acts on the bodies in branches** — each body keeps its wobble $\mathbf{X}_n(t)$, riding it relative to the center.
- The **relative motion acts on the center** — the wobbles summed, vector-sum over bodies and over branches, into the turbulent motion of the center itself:

$$
\mathbf{C}(t) = \sum_{n=1}^{2}\sum_{j\in\{x,y\}} X_{n,j}(t)\,\hat{e}_j,
$$

i.e.

$$
C_x(t) = X_{1,x}(t) + X_{2,x}(t), \qquad C_y(t) = X_{1,y}(t) + X_{2,y}(t).
$$

So $M_n$ sits at $\mathbf{C}(t) + \mathbf{p}_n + \mathbf{X}_n(t)$: the body wobbles relative to the center, and the center itself moves turbulently — because the reference frame wobbles in space too. The turbulence point is not some isolated thing; it is the center carrying the summed wobbles, with the bodies still wobbling on it in branches.

**The plane direction, in the math.** Let $\hat{e}_F$ be the force-line unit vector (along the separation) and $\hat{e}_\perp$ the perpendicular resultant — the direction the transform rotated the force into. The pair's plane of motion is $\mathrm{span}(\hat{e}_F, \hat{e}_\perp)$. The turbulence eigen line is that perpendicular direction:

$$
\hat{e}_{\mathrm{eigen}} = \hat{e}_\perp, \qquad \mathbf{C}(t) = C(t)\,\hat{e}_\perp.
$$

So the eigen line resides **parallel** to the plane of motion — it lies in the plane, along the in-plane perpendicular — while the force line crosses it. The turbulence is never out of the plane; it is the plane's own perpendicular axis, moving.

Finding this resultant wobble is not switching coordinate references or viewing the motion a new way. It is inferring another property from the system: how much we are moving relative to an external force. The velocity integral is the acceleration from the external force — and from it we know not only how much each body wobbles relative to one another in each direction, but how much each one stretches time relative to some third reference point. Two uses for the same acceleration: find the velocity over space, or find the time difference over space relative to the energy difference caused by mass.

$\mathbf{C}(t)$ is the *resultant* — the vector sum of the branch wobbles. It is the whole pair's answer to the turbulence, delivered at the one point the pair shares. This is the math the Motion tab's "The Turbulence: The Next Eigenstate" box is built on: the bodies wobbling relative to the center at the balance-point split, the eigen line through them moving turbulently with the resultant, the center drawn as a cross — the bodies wobbling in the plane of the line, the line itself turbulent relative to the external reference.


## 4. The new symmetry rules

The Quantum Tech Stack had one branching rule: **space splits** — a new spatial dimension branches the integration path, and the stack runs once per branch (§7 of that note). Watching the center move reveals the mirror rule:

**Time unifies.** A time integration cannot be taken branch by branch. The next layer up after the wobbles is a time dimension in the integration, and it *demands* that it act on both spatial dimensions at once — by the symmetry rules. Time is what the branches have in common; the symmetry forbids integrating it piecemeal. Where space split the path, time merges it back.

**The center is the clock.** The merged vector $\mathbf{C}(t)$ — the sum of all branch wobbles at the shared center — is what we perceive as time passing. We perceive a *single* time for all the motions because the merge fuses the colliding frequencies into one motion of one point. The singleness of time is not a background assumption; it is the *result* of the merge.

In short: **space splits the branches; time merges them back.** Splitting is how space acts; unifying is how time acts. That is the new symmetry.


## 5. The new layers

The ascent of the tech stack gains two layers. (The descent is unchanged — the way down is still limits and differentiation.)

| Layer ↑ | Equation | Indicator | Operation |
|---|---|---|---|
| **u6. Merge the branches.** The time layer demands the whole: sum every branch wobble into one center vector. | $\mathbf{C}(t) = \sum_n\sum_j X_{n,j}(t)\,\hat{e}_j$ | The branches reunite — one center, vibrating in space. The merge is not optional; it is the symmetry rule for time layers, the mirror of the split. | Vector-sum over bodies and branches. Add the center's turbulent motion to the bodies' branch wobbles — the frame's own motion, not a new frame. |
| **u7. Integrate the center.** One more integration — another time part. | $\boldsymbol{\tau}(t) = \int_0^t \mathbf{C}(t')\,dt'$ | The stretching of time, accumulated from the center's vibration. How hard the bodies pull the center is how much time stretches. | Integrate the center motion over time. |

The rule for adding branches to a time integration is now explicit: **a time integral takes all branches at once.** u6 is not one more branch — it is the layer where branches end. Any future time layer merges first, then integrates. Space adds branches; time collects them.

And every added integral is another body. To include one more body, integrate over another pair of phasors and add the resultant values: take pairs and branches, merge them into one resultant acceleration by summing, then integrate over space or over time to get the motion of their center relative to some other point. We can always merge any $n$ bodies treated as one resultant with any $m$ bodies treated as one resultant — pairs and branches into one resultant, by summation.

The round trip is a coordinate transform both ways: the descent rewrites position and time in the frequency domain — frequency and wavelength — and the ascent transforms back into motion. The rotation is the transform.


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


## 7. A clock relative to an external body

Fix the frame. Don't let anything move but the point. Now watch: a solid golden point rocking back and forth on a light grey line — the line fits inside the graph, and the point is all there is.

The point is the turbulence point, read as a clock. Its rest position sits at the balance-point split — the mass ratio already said where, $T_1/T_2 = M_2/M_1$ — and it rocks around that rest position with the merged resultant $\mathbf{C}(t)$. The rocking is motion with external force and perpendicular velocity: the point answers the field of some external body, and its position on the line is the time reading.

Integrate that rocking in time and you get the clock ratio — the apparent time difference between the two bodies in space. The balance point already said so. The animation is that ratio made visible: the golden point is the excitation of frequencies at that point in space.

Time, at a point, is the rate of change of frequency in the field of gravitational waves — the excitation of frequencies at each point in space. The rocking golden point is that excitation, drawn — a clock relative to some external body.


## 8. The clock belongs to a third reference

Here is the correction to §7: the clock is not between the two bodies. It is the pair's **shared clock**, and it is read against an **external third reference** — a third body, or the background field beyond the boundary. Two bodies alone have a ratio (the balance point, $T_1/T_2 = M_2/M_1$) but no reading: a ratio is not a clock. The reading needs something outside the pair to be read against. The golden point's position on the line is the time — but the line itself is anchored to the external reference. Move the reference and the reading moves; that is what "relative" means.

**How to compute it.** The pair's merged resultant is $\mathbf{C}(t) = \sum_n\sum_j X_{n,j}(t)\,\hat{e}_j$ — the turbulence point, the one motion the locked bodies agree on. The clock reading is the component of that motion along the direction to the external reference — the projection of $\mathbf{C}(t)$ onto the pair–reference axis, integrated in time:

$$\tau(t) = \int_0^t \mathbf{C}(t') \cdot \hat{e}_{\text{ref}}\,dt'.$$

The balance point sets the zero — the rest position, the ratio — and the integrated projection sets the reading. Two computations, two jobs: the ratio is internal (mass proportions); the reading is external (reference projection).

**Two bodies in 3D space.** The pair's force acts along their separation line; the resultant motion comes back perpendicular — rotated ninety degrees from the force direction, the transform's doing. So the pair lives on a plane: the line of force crossed with the perpendicular resultant velocity. The external third reference sits off that plane — or rather, the plane is *defined* against it: pick the reference, and the perpendicular direction the resultant takes is the one orthogonal to the pair–reference axis. This is the resultant velocity rotated from the direction of the force, and it must be considered: the clock does not read the radial pull, it reads the rotated resultant. Compute $\mathbf{C}(t)$, take the component perpendicular to the force line in the plane containing the reference, integrate — that is the pair's time. The turbulence eigen line — the line $\mathbf{C}(t)$ travels — resides parallel to this plane, running along the perpendicular-resultant direction; the force line crosses it (§3 states this in the math: $\hat{e}_{\mathrm{eigen}} = \hat{e}_\perp$).

**Three bodies in 3D space.** Three pairs, three resultants, three planes — unless the bodies share a plane, in which case the planes coincide and one clock serves. In general: compute each pair's turbulence point against the external reference (the field beyond the three-body boundary — there is always more field), merge the three readings at the common center (u6: time acts on all branches at once), integrate (u7). The merged reading is the triple's shared clock — still relative, still anchored outside.

**There is always some other external force.** The boundary never closes: whatever system you draw, the field beyond it acts on the inside. That is not a flaw in the computation — it is what the computation is *of*. The clock ratio $T_1/T_2 = M_2/M_1$ is exact within the boundary; the reading $\tau(t)$ is exact relative to the chosen reference. Choose a larger boundary — include the third body, recompute the plane, merge a new center — and you get a new clock, exact relative to the new outside. The background energy of §11 is the limit of this process: integrate over all space and all time, and the "external reference" becomes the field itself.

So the rule: **no clock without a third reference, no reference without an outside, no outside that ever ends.** The rotated resultant is the hand of the clock; the external body is the face it reads against.

One more rule, and it is new: **the reference point of motion and the reference point of time are on the same line.** We can only use an external point as a reference if it sits on the perpendicular line of another body — when force and velocity are balanced and constant, so energy is conserved. Otherwise we have to merge branches and use the center point of the new resultant. Adding an external reference point is like adding another level of integration: it holds only when the force is balanced and the point is perpendicular to the direction of motion. When it holds — perpendicular, energy conserved, the symmetry rule maintained — the external reference can be treated like an extra symmetric dimension. Otherwise it can't be treated as another dimension. Dimensions are our perception of where things are symmetrical.


## 9. The eigenplane — Kepler did the same thing

Here is the correction this theory owed Kepler: he was never wrong. He did exactly what the three-body construction did.

Take the 3D motion — bodies accelerating through the field, chaotic to the eye — and find the plane they stay relatively locked on. That plane is constructed in 3D spacetime: you compute the relative vectors in three dimensions, then collapse to the two-dimensional plane where the locking holds. On that plane, the relative motion is an ellipse. That is Kepler's first law — and it is also the Wave Lab's three-body ellipses. The same operation, the same result.

The first time through, with two bodies, the relative velocity in the ignored dimension was constant — which is why the motion wrapped into a circle. Constant relative velocity plus one collapsed dimension gives a closed curve. With three bodies the relative velocities are not constant — there is acceleration relative to something else — so the motion will not close in 3D. But you can still shift into two dimensions and find the plane they all orbit on. That plane is the eigenplane: the flat 2D coordinate system, cut through 3D space, on which the bodies stay relatively locked.

It is not the true motion. It is the projection onto the eigenplane. Kepler drew the projection with perfect fidelity — and so did we, the second time, when the three-body tab produced its ellipses. The mistake was only ever in the interpretation: calling the projection the whole story, or calling it wrong for being a projection. It is neither. It is the 2D relative motion, and it is correct as far as it goes.

Add another body and you get a new vector in a new direction: back to 3D, recompute the vectors for all the bodies, collapse to a new 2D plane, repeat. Really it is just changing the coordinate system to a new flat plane in three-dimensional space — one plane per boundary condition.

And the amount that collapsed point moves between the bodies — the center's motion on the plane — is the rate of change of time. Integrate it and you get the time difference between two points. Integrate again over space and you learn nothing new, because the plane is always constructed in 3D spacetime: re-integrating the same boundary rebuilds the same plane. A new spatial integration only ever tells you how to compute a new relative clock for a *larger* boundary condition.


## 10. The infinite field

Why does it never close? Because the wave field extends infinitely far. Write gravity as a wave field and there is always more energy coming from outside whatever boundary you drew — more masses, more frequencies, more collisions that were not included. Inside the boundary the motion looks clean. The chaos is the outside leaking in.

Space is 3D and motion is 3D. If things are accelerating, the motion appears chaotic — but you can project it into a single 2D plane at the cost of losing the information about the larger system outside the boundary you integrated over. Add all the relative motions inside and you get a point of the gravity field vibrating: the excitation of the frequency domain of the gravity field. That excitation tells you the relative time between each body in the system, and it gives you a clock. Add another body to the system and you must go back to 3D space, recompute the vectors, collapse to 2D, and repeat.

Within a given boundary — a given amount of energy in the system — the integrations close, and you get the initial conservation law back. The closure is real; only the boundary is a choice.

And that may be the conclusion of the whole investigation: we can find the apparent time between two bodies — their shared center, their clock ratio — but to find motion relative to another body we always have to find a new reference plane. Space is infinite and not integrable over infinity. Technically we would have to keep integrating relative to some other part of the wave field, and it goes on forever without any reference. Every time is some system's time. There is no clock of the whole field, because there is no boundary around infinity.


## 11. The background energy

That may be the point of calculating the cosmic background radiation.

If we could integrate over all of space and all of time for frequencies — every mass-wave spatial frequency, every collision, everywhere — we would find the total energy in the system. What is left over, the part belonging to no particular boundary, is the background energy: the field's own temperature, the hum underneath every local clock. Measure it, and we could say whether it is increasing or decreasing — whether the field as a whole is winding up or winding down.

The Big Bang is the structured start. Everything at a point, flying out in an orderly way: a great many bodies traveling in the same direction, sharing planes, covered by one coordinate system. A young system is easy to solve — the bodies agree on their planes, so the eigenplanes coincide and the transforms between them are trivial.

Then the collisions do their work. Bodies meet, scatter, and their directions randomize relative to each other: more and more chaotic, fewer and fewer rotating in groups that share a plane. Every new relative group needs its own eigenplane, and shifting from one 2D plane view to another costs a coordinate transform — more variables, every collision. The older the system, the more planes, the more transforms, the harder the solve. Chaos is not a breakdown of the law; it is the accumulation of coordinate systems.

So the background energy and the planes are the same story told at two scales. Integrate everything and you get the total — the background, increasing or decreasing. Draw a boundary and you get a plane, a center, a clock — and the price of the boundary is the transforms you will pay when the next body arrives.

## 12. A math problem, not a physics problem

The more bodies you add, the more vectors each body carries. Past a point it becomes impossible to solve in three-dimensional space: with four bodies or more there are more independent variables than equations — $x$, $y$, $z$ for four or more vectors each — and the system is underdetermined. And even for three bodies, there is always some unknown part of the field acting on the system from outside the boundary.

So the three-body problem was never a question of the physics. The force law is not missing. It is a math problem: underdetermination. There is always at least one more body — always more field — than the equations close over.

Which clarifies what the wave equation was doing all along: it rewrote the equations of relativity in wave form. The same content, in a shape that was easier to understand. The wave field that extends infinitely far is spacetime; the boundary you integrate over is the reference frame; the clock ratio is proper time. Nothing was overthrown. It was translated.


## 13. What time is

Putting it together:

- The gravity-wave field is turbulent: mass-wave spatial frequencies colliding from every direction, caused by mass.
- Locked bodies cannot answer the collisions separately, so the wobbles sum at their shared center: $\mathbf{C}(t)$.
- The merge is demanded by symmetry — time acts on all space at once — so the many collisions become one vibration.
- We perceive a single time because there is a single center motion. Time is not the background the collisions happen *in*; time is the *resultant of the collisions*.
- The balance point sets the ratio of time between the bodies; the integrated pull sets the stretch.
- The motion being read is the hidden law's product: the transform converted the radial force between the bodies into relative velocity in the perpendicular direction, and the locked pair handed that perpendicular motion to the center.

**What we perceive as time is really the motion of the center point of a mass vibrating in a field of gravity waves.** The bodies are locked together and they act on the center between them — and how much they pull the center is the motion and the stretching of time.

The dimensions, as we can see them: relative motion we see in 3D; absolute motion in a system we can only see in 2D; absolute time we can only see in 1D; symmetry we don't see at all, because it is dimensionless — but we can infer it from context. Time stretching is what motion in the 2D eigenplane looks like from inside it: on the eigenplane things don't stretch relative to one another in time, but there is always another external force stretching or compressing things more.


## 14. Conclusion

The Quantum Tech Stack now climbs seven layers up (u1–u7), and the new top of the stack is time itself — not assumed, but built: branched by space, merged by symmetry, vibrated by collision, integrated into stretch, ratioed by the balance point.

The open question from the tech stack's conclusion — what the phasor's rotation *is* — has its answer: it is the phase of the motion wave, turning in the complex plane. There was never a hidden dimension as a place; the complex plane is a representation, a coordinate choice — it is just how the coordinate transform writes motion as a wave, broken into components in each direction. The hidden fifth dimension is the frequency domain the transform enters — the symmetric phase domain, creating the symmetry between space and time, held up by the invariant of the conservation law. The center, moving — the turbulence point the locked bodies share, the center of the wave, the third external reference point the symmetric frequency domain gives us, doing the one motion they can all agree on — is what the merged frame's clock reads. And that reading is what we call time. The motion the clock reads is the hidden law's output: force turned perpendicular, arriving as motion — the transform converted the radial pull between the bodies into perpendicular relative velocity, the locked pair handed it to the center, and the center carries it through the field. Time is the reading of the converted force, measured against a third reference.

But the agreement is always local. Every clock belongs to the boundary that merged it: the apparent time between two bodies is well-defined, and within that boundary the integrations close and return the conservation law. Beyond the boundary there is always more field — more collisions, more frequencies, another body — and to include it you redraw the boundary, recompute the plane, and merge a new center. There is no final reference, no clock of the whole. The stack does not end at the top; it ends at the edge of whatever you chose to include — the motion is still always relative to the boundary conditions we set, which never account for the full system. That is not a failure of the theory. It is what time is.

We cannot set a boundary condition such that there will be no outside turbulence or chaos in the underlying system — that would need an infinite boundary, and knowing the individual motion of every body in it. There are an infinite number of branches we can't account for, so we only ever see the apparent motion in an eigenplane — unless we add another branch to give us our velocity relative to something else.

The final thing left in the stack is the time difference between two points, or the change in the position. Both are information of the system — the inputs and the outputs of the signal we put in. The system is the boundary conditions and the symmetry between them in the phase domain.
