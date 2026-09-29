# The Three Body Problem
*2026-09-28*

*The pair machine works. Two bodies in, closed-form waves out, Kepler recovered, the quantum tech stack traversed both ways. The next wall is the famous one: three bodies, where every textbook says closed-form solutions without chaos are impossible. This note is the program for running six pair-equations through the quantum tech stack — and then the one hard problem the quantum tech stack doesn't solve for us: summing the pairs.*

---

## Table of Contents

- [1. Why three bodies](#1-why-three-bodies)
- [2. The problem, stated](#2-the-problem-stated)
- [3. The challenge — summing the pairs](#3-the-challenge--summing-the-pairs)
- [4. Higher dimensions and the quantum tech stack](#4-higher-dimensions-and-the-quantum-tech-stack)
- [5. The six equations — $\psi$, $\phi$, $\chi$ (twelve branches)](#5-the-six-equations--psi-phi-chi-twelve-branches)
- [6. Throughput](#6-throughput)
- [7. Finding the actual center](#7-finding-the-actual-center)
- [8. The resultant of the two circles](#8-the-resultant-of-the-two-circles)
- [9. Conic sections](#9-conic-sections)
- [10. Wave Lab setup](#10-wave-lab-setup)
- [11. Resultants from phasors](#11-resultants-from-phasors)
- [12. The resultant wobble](#12-the-resultant-wobble)
- [13. Center, balance points, and why the motion is elliptical](#13-center-balance-points-and-why-the-motion-is-elliptical)
- [14. Conclusion — the 3-4-5 projection](#14-conclusion--the-3-4-5-projection)
- [15. Split branches — unstretching the ellipses](#15-split-branches--unstretching-the-ellipses)


## 1. Why three bodies

The three-body problem is the prediction of the motion of three masses under their mutual gravity, given initial positions and velocities. It is the next logical step because it is the problem other theories cannot explain: since Poincaré, the accepted position is that no closed-form solution exists — that any attempt introduces chaos, and the only way forward is numerical integration, step by step, with the error growing as you go.

Our goal is to push the pair machinery as far as it goes: run each pair through the stack, sum the resultants, and draw the relative motion on the plane the three bodies share. What comes out are ellipses — the eigenplane projection, Kepler's operation performed by machine. It is not a closed-form solution to the three-body problem, and this note does not claim it is. The field beyond the boundary does not close, and no projection can close it. What the construction gives — honestly stated — is the 2D relative motion for one boundary condition: the plane, the center, and the clock for the 3-4-5 system. The motion is still always relative to the boundary conditions we set, which never account for the full system.

We know the quantum tech stack and how to work through it, so that part is trivial: the descent by limits and differentiation, the vanishing total differential at the bottom, the turn, the ascent by integration back to the conservation law. That machinery doesn't care how many bodies there are. What it was built for is *pairs* — and a three-body system contains three pairs: $(M_1,M_2)$, $(M_1,M_3)$, $(M_2,M_3)$. So we write the six equations, one opposing pair of waves per pair of bodies, run each pair through the quantum tech stack, and get six solutions that satisfy the boundary conditions on the other end. Each pair hands us the motion caused by that pair.

But then we have to sum them. That is what this note sets out to explain. We built the machine to work on pairs — can it work on more than two bodies? The six pair-solutions are not the answer; they are the raw material. The answer is whatever turns three pair-motions into one three-body motion. Everything below is aimed at that summation.

---

## 2. The problem, stated

A summation needs something to sum *toward*, and that means boundary conditions. We choose a problem the field already knows: the **3-4-5 problem**. Three masses in the ratio $3:4:5$, placed at rest at the vertices of a 3-4-5 right triangle — the Pythagorean three-body problem, stated by Meissel, computed by hand by Burrau, integrated by Szebehely and Peters. It is the standard chaos exhibit: the textbooks say the lightest mass gets ejected and no closed form can say otherwise. That is exactly why it is the right target.

The boundary conditions, in $G = 1$ units (Burrau's coordinates, center of mass at the origin):

| Body | Mass | Initial position | Initial velocity |
|---|---|---|---|
| $M_1$ | $3$ | $(1, 3)$ | $(0, 0)$ |
| $M_2$ | $4$ | $(-2, -1)$ | $(0, 0)$ |
| $M_3$ | $5$ | $(1, -1)$ | $(0, 0)$ |

Three bodies in free fall: all velocities zero, the system released from rest. The heaviest body sits at the right angle. The pair separations — the spans each pair's waves live on — are fixed by the triangle:

$$L_{12} = 5, \qquad L_{13} = 4, \qquad L_{23} = 3, \qquad 3^2 + 4^2 = 5^2.$$

What must be solved: the positions $\mathbf{r}_1(t)$, $\mathbf{r}_2(t)$, $\mathbf{r}_3(t)$ for all $t \geq 0$. In our language: the six pair-waves, each run through the quantum tech stack to its impulse equations — and then the summation of §3.

---

## 3. The challenge — summing the pairs

We know the system works for two bodies. Will it work for three? The obstacle is not the waves — it is the adding. We have three main ideas, which aren't really different from each other: they are the common approaches for adding quantities, applied to pair-motions.

**Idea 1 — vector sum of the paired motions.** The obvious choice. Each body ends up with two linear motions, of different magnitudes and phases — $M_1$ moves under $(M_1,M_2)$ and under $(M_1,M_3)$ — and we sum them. The resultant vector is the body's linear motion, and from the three resultants we reconstruct the paths. Note the shape of the last approach: for two bodies we used 2 circles and one center. Here we are looking at 6 circles and 3 centers (each pair contributes its two body-circles about its own balance point), and then we need the true center — which might be found at the intersection of the circles. There is an old Euclidean trick for finding the center of a circle (two chords, their perpendicular bisectors meet at the center), and it may generalize to the common center of the six. The path a body takes will then be a new circle: its relation to that center plus the sum of its two pair-circles — or, equivalently, the sum of its two pair-vectors referred to that center. It may *appear* to rotate in a figure eight along its two circles somehow. We know not to be fooled by geometry: the figure eight would be the shadow, not the thing. One more consideration for the vector sum: the third vector. Each body belongs to two pairs, but the triangle has three sides — the unmatched pair, the one the body is not in, is still in the system, and its pull may run opposite to the body's two pair-vectors. If that turns out to be the case, the resultant is a sum *and* a subtraction: add the body's two pair-vectors, subtract the unmatched pair's vector. Luckily subtracting vectors is just as achievable as adding them. This is where set theory starts to look like the right language: the three pair-motions are overlapping areas, and a naive sum counts the overlaps twice — inclusion–exclusion says subtract the intersection. The body's true motion would then be its two pair-vectors with the doubly-counted overlap removed. That said, we do not suspect this subtraction will turn out to be necessary. The third pair's equation is not linked or coupled to the body's own two — folding its equation in would be wrong — but its *vector* could still be subtracted if the geometry demands it. The symmetry of the construction says the straight sum should already be complete. So subtraction is the fallback, not the expectation: our mind is open to it if all else fails, and the inclusion–exclusion framing will be waiting.

**Idea 2 — statistical, by ratios.** Find average points through ratios, the way we did with the two-body balance point. Each pair hands us a balance point dividing its side in the mass ratio; the three-body balance is some ratio-weighted average of the three. This would likely produce a valid solution, and it has the virtue of using only quantities the quantum tech stack already gives us.

**Idea 3 — Kepler's projection, done geometrically.** Take what we learned from Kepler's projection about ellipses and build a geometrical theory of overlapping circles: find what the difference in apparent motion rectifies to. Our first pass gives 6 circles and 3 center points, but we know there can only be one center and three circles. Rectify by circle intersections — or better: draw the lines connecting each pair and find the single point that all three balance-point lines pass through. This is the favourite: it gives a visual proof of the whole reduction, three pairs → three lines → one point, and then the orbits are adjusted relative to that center to produce circles. **Intersections are the operation here.**

§7 attempts Idea 3 now. §8 sets up the resultant for each mass, with the method left as a choice.

---

## 4. Higher dimensions and the quantum tech stack

A thought experiment first, because it names the mistake. The expected result of the 3-4-5 problem is known: the lighter body is ejected. Read it in our language: the three bodies spiral inward and converge — the pair-waves pile into the same region, the released energy has nowhere left to go, and the configuration becomes unstable. Energy must go somewhere, and by symmetry the third body is expelled: it diverges, its motion increasing without bound, and one mass is ejected. That picture carries a warning — it suggests acceleration is at play — and a question: can the stack generate convergence and divergence and still be coherent? The 3-4-5 acceleration problem is a clue, and it points at the real mistake: we carried the one-dimensional machinery over unchanged, missing the branches.

The mistake is dimensional. We built the quantum tech stack for two bodies on a line — one spatial dimension — and carried it over to three bodies unchanged. But three bodies live in a plane, not a line: two spatial dimensions, not one. The original energy-conservation form is not wrong, but it is incomplete — it must be read as multivariable energy conservation, differentiated in $y$ and $x$ (partial derivatives), because the boundary conditions now span a plane.

From the quantum tech stack we now know the price of a new spatial dimension — and it is not new dimensions. The stack's five levels are fixed; what a new spatial direction adds is *branches* through the same machinery. On the way up, the wobble integral splits into two separate branches: the wobble in one direction, then the wobble in the other, and the resultant wobbles are summed. It is the first time the integration path has split — not new time dimensions, but the same transformed and accumulation times used to rotate into different directions. On the way down, the split runs in reverse: the derivative does not climb into higher dimensions but divides into two initial-condition branches. Call them A and B incoming, Y and Z outgoing — we never track A-on-Y, A-on-Z, B-on-Y, B-on-Z separately, because the quantum tech stack handles the rotations for us, keeping the relative orientation of the branches on the outside and rotating them relative to one another. The boundary conditions for the second spatial direction should look much like the ones we already have: known positions at rest, the same free-fall start, now read in two directions. We start, then, with known boundary conditions, the five-layer quantum tech stack run in branches, and energy conserved from the boundary conditions.

That fixes the problem-solving approach, and there are two ways to write it: keep the six equations and make each one long, with both directions written out — or split each equation into branches and let a summation sign do the work of the repetition. We take the branches. And the branch count is fixed by a rule borrowed from linear algebra: $xx$ and $yy$ already span the plane. Two perpendicular directions define any other direction of the plane by combining them in different proportions, so a pair line pointing along $\hat{u}_{ab} = c_x\hat{x} + c_y\hat{y}$ is recovered as $c_x W^{(x)} + c_y W^{(y)}$ — no $xy$ or $yx$ cross terms, since any cross direction is already a combination of the perpendicular pair.

One more question this section must answer: does the 3-4-5 problem introduce any third-dimensional motion? We assume not. All three bodies start in a two-dimensional plane with no initial velocity and no energy in $z$ — and the boundary conditions control that: with nothing to carry them out of the plane, they cannot leave it. Just as the two bodies acted in a line, the three act in a plane. The pairs, branched in $x$ and $y$, can produce any result for a body in a plane — and no result outside it.

We suspect the acceleration is not the real problem: the boundary conditions say energy is conserved, and we can expect the same symmetry on the other side. The real issue may be convergence and divergence — whether the stack generates them. But divergence does not imply incoherence: even divergent signals follow coherent rules, and the stack's whole record is coherence preserved through every turn. The old question — whether we may climb another level of time to recover something stable and finite — is answered here: not by new levels but by branches, the same five dimensions doing the rotating, and the symmetry is what the branches are for.

---

## 5. The six equations — $\psi$, $\phi$, $\chi$ (twelve branches)

One opposing wave-pair per body-pair, in the display form — each wave now the sum of its two branches. Write $j \in \{x, y\}$ for the branch; the wave is $\sum_j$ of its branches:

$$W_a^{(ab)} = \sum_j W_{a,j}^{(ab)}, \qquad W_{a,j}^{(ab)}(\lambda_j,\tau) = A_a^{(ab)} e^{-\beta_{ab}\lambda_j}\left[\cos\left(k_{a,j}^{(ab)}\lambda_j - \omega_{a,j}^{(ab)}M_b\tau\right) + i\sin\left(k_{a,j}^{(ab)}\lambda_j - \omega_{a,j}^{(ab)}M_b\tau\right)\right]$$

$$W_b^{(ab)} = \sum_j W_{b,j}^{(ab)}, \qquad W_{b,j}^{(ab)}(\lambda_j,\tau) = A_b^{(ab)} e^{-\beta_{ab}(L_{ab}-\lambda_j)}\left[\cos\left(-k_{b,j}^{(ab)}\lambda_j - \omega_{b,j}^{(ab)}M_a\tau\right) + i\sin\left(-k_{b,j}^{(ab)}\lambda_j - \omega_{b,j}^{(ab)}M_a\tau\right)\right]$$

with, per pair and on each branch, $k_{a,j}^{(ab)} = \omega_{a,j}^{(ab)} = 1$, $k_{b,j}^{(ab)} = \omega_{b,j}^{(ab)} = \sqrt{M_b/M_a}$, $A_a^{(ab)} = \sqrt{M_b/(M_a+M_b)}$, $A_b^{(ab)} = \sqrt{M_a/(M_a+M_b)}$, $\beta_{ab} = |M_a-M_b|/(M_a+M_b)$, and span $L_{ab}$ the pair's separation. The branch touches nothing but the direction: the pair's constants are the pair's, identical on $x$ and $y$. Still one phase angle per wave — the branch contributes only an extra spatial term ($\lambda_j$, $k_{a,j}^{(ab)}$) per direction. (The alternative — one long equation per wave with both directions written out — is the same mathematics; the branch form is just easier to carry.) The branch count follows the rule of §4: $xx$ and $yy$ span the plane, so two branches per wave and no cross terms. Name them:

- **$\psi$** for $(M_1,M_2)$: $\psi_1 = W_1^{(12)}$, $\psi_2 = W_2^{(12)}$, span $L_{12} = 5$;
- **$\phi$** for $(M_1,M_3)$: $\phi_1 = W_1^{(13)}$, $\phi_3 = W_3^{(13)}$, span $L_{13} = 4$;
- **$\chi$** for $(M_2,M_3)$: $\chi_2 = W_2^{(23)}$, $\chi_3 = W_3^{(23)}$, span $L_{23} = 3$.

In full — each wave summed over its two branches — the $\psi$ pair:

$$\psi_1 = \sum_j A_{\psi1}\, e^{-\beta_{\psi}\lambda_j}\left[\cos\left(\lambda_j - M_2\tau\right) + i\sin\left(\lambda_j - M_2\tau\right)\right]$$

$$\psi_2 = \sum_j A_{\psi2}\, e^{-\beta_{\psi}(5-\lambda_j)}\left[\cos\left(-k_{\psi2,j}\lambda_j - \omega_{\psi2,j}M_1\tau\right) + i\sin\left(-k_{\psi2,j}\lambda_j - \omega_{\psi2,j}M_1\tau\right)\right]$$

the $\phi$ pair:

$$\phi_1 = \sum_j A_{\phi1}\, e^{-\beta_{\phi}\lambda_j}\left[\cos\left(\lambda_j - M_3\tau\right) + i\sin\left(\lambda_j - M_3\tau\right)\right]$$

$$\phi_3 = \sum_j A_{\phi3}\, e^{-\beta_{\phi}(4-\lambda_j)}\left[\cos\left(-k_{\phi3,j}\lambda_j - \omega_{\phi3,j}M_1\tau\right) + i\sin\left(-k_{\phi3,j}\lambda_j - \omega_{\phi3,j}M_1\tau\right)\right]$$

the $\chi$ pair:

$$\chi_2 = \sum_j A_{\chi2}\, e^{-\beta_{\chi}\lambda_j}\left[\cos\left(\lambda_j - M_3\tau\right) + i\sin\left(\lambda_j - M_3\tau\right)\right]$$

$$\chi_3 = \sum_j A_{\chi3}\, e^{-\beta_{\chi}(3-\lambda_j)}\left[\cos\left(-k_{\chi3,j}\lambda_j - \omega_{\chi3,j}M_2\tau\right) + i\sin\left(-k_{\chi3,j}\lambda_j - \omega_{\chi3,j}M_2\tau\right)\right]$$

The 3-4-5 boundary conditions fix every constant up to one overall scale — nothing is free except the ruler:

| Pair | Bodies | $L_{ab}$ | $A_a$ | $A_b$ | $\beta_{ab}$ | $k_b = \omega_b$ |
|---|---|---|---|---|---|---|
| $\psi$ | $(3,4)$ | $5$ | $\sqrt{4/7}$ | $\sqrt{3/7}$ | $1/7$ | $\sqrt{4/3}$ |
| $\phi$ | $(3,5)$ | $4$ | $\sqrt{5/8}$ | $\sqrt{3/8}$ | $1/4$ | $\sqrt{5/3}$ |
| $\chi$ | $(4,5)$ | $3$ | $\sqrt{5/9}$ | $\sqrt{4/9}$ | $1/9$ | $\sqrt{5/4}$ |

($k_{a,j} = \omega_{a,j} = 1$ on each branch for the first-listed body of each pair is the *normalization* — the chosen reference scale, not a result the boundary conditions derive. What the 3-4-5 data fix are the *relative* values: $k_{b,j}/k_{a,j} = \omega_{b,j}/\omega_{a,j} = \sqrt{M_b/M_a}$, plus the amplitudes, $\beta_{ab}$, and the spans. An absolute wavelength/frequency scale would need another datum.) Six equations, twelve branches — the input side of the machine.

Recomputed under the branched stack of §4: nothing here changes. The branches — the wobble integral split in two directions on the way up, the initial conditions split in two on the way down — run through the same five-layer machinery; they do not touch the pair's own constants. The table above stands as written.

---

## 6. Throughput

Now the trivial part: run each pair through the quantum tech stack. The descent is the same five levels — limits, differentiation (now partial, in $x$ and $y$, per §4), the vanishing total differential per pair per branch:

$$dW_{s,j}^{(ab)} = \left(\frac{\partial W_{a,j}^{(ab)}}{\partial M_a}+\frac{\partial W_{b,j}^{(ab)}}{\partial M_a}\right)dM_a + \left(\frac{\partial W_{a,j}^{(ab)}}{\partial M_b}+\frac{\partial W_{b,j}^{(ab)}}{\partial M_b}\right)dM_b = 0,$$

the turn solves each pair's differential equation (the pair's wave, already written above), and the ascent integrates back up. The ascent's definite integrals are the output that matters — now unraveled into branches. Per pair, per body, per branch: twelve impulse equations. With $n$ the body, $(ab)$ the pair — the other body acting — and $j \in \{x, y\}$ the spatial branch:

$$F_{n,j}^{(ab)}(t) = \int_0^{L_{ab}}\!\left[\mathrm{Im}\left(W_{n,j}^{(ab)}\right) - \mathrm{Re}\left(W_{n,j}^{(ab)}\right)\right]d\lambda_j.$$

Six pair-waves in, twelve impulses out. The wobble integral splits the same way — twelve wobbles:

$$X_{n,j}^{(ab)}(t) = \int_0^t F_{n,j}^{(ab)}(t')\,dt'.$$

The twelve wobbles come in pairs of two: for each body and each of its pairs, the $x$- and $y$-branch wobbles together define that pair's planar motion. Each body belongs to two pairs, so four wobbles per body — the outer sum over the body's pairs, the inner sum over the two branches:

$$X_1 = \sum_{(ab)\ni 1}\sum_j X_{1,j}^{(ab)} = \big(X_{1,x}^{(12)} + X_{1,y}^{(12)}\big) + \big(X_{1,x}^{(13)} + X_{1,y}^{(13)}\big),$$

and likewise $X_2$ from pairs $(12)$, $(23)$ and $X_3$ from pairs $(13)$, $(23)$. Once the first index is used, the second sum starts on its own index — two sums, two branches.

Twelve impulse equations, twelve wobbles — each the pair's doing, expressed as the motion it imprints on each of its bodies, in each direction. This is the far end of the quantum tech stack: twelve solutions satisfying the 3-4-5 boundary conditions. What the quantum tech stack does *not* give us is how $X_{1,j}^{(12)}$ and $X_{1,j}^{(13)}$ combine into the motion of $M_1$. That is §3's problem, and §7–§8's work.

---

## 7. Finding the actual center

Attempt at Idea 3 — and it works. Each pair has its two-body balance point, dividing its triangle side in the mass ratio (from §2 of the two-body work, $\lambda^*_{ab} = L_{ab}M_b/(M_a+M_b)$ measured from body $a$):

- $B_{12}$ on side 12: $20/7$ from $M_1$ (side length 5),
- $B_{13}$ on side 13: $5/2$ from $M_1$ (side length 4),
- $B_{23}$ on side 23: $5/3$ from $M_2$ (side length 3).

Draw the three cevians: from each body to the balance point on the *opposite* side. $B_{23}$ divides side 23 in the ratio $M_3:M_2$ from vertex 2; $B_{31}$ divides side 31 in $M_1:M_3$ from vertex 3; $B_{12}$ divides side 12 in $M_2:M_1$ from vertex 1. By **Ceva's theorem**, the three cevians concur if and only if the product of the three ratios is 1:

$$\frac{M_3}{M_2}\cdot\frac{M_1}{M_3}\cdot\frac{M_2}{M_1} = 1.$$

It is identically 1 — for *any* three masses, not just 3-4-5. The three balance-point lines always meet at a single point, and that point is the barycentric $(M_1:M_2:M_3)$: the center of mass. Checked on Burrau's coordinates: the cevians from $(1,3)$, $(-2,-1)$, $(1,-1)$ through $(-5/7,\,5/7)$, $(1,\,1/2)$, $(-1/3,\,-1)$ all pass through $(0,0)$.

So the favourite idea is proved, not conjectured: draw the pairs, mark the three balance points, draw the three lines — one point. The six circles' three pair-centers rectify to a single center, and it is the system's center of mass — the center of the wave, the third external reference point. The visual is exactly as advertised: three pairs → three lines → one point, and the orbits get re-referred to that center to produce circles.

A note on why this survives the branches of §4–§6: it is kind of special. Despite the extra branches, each body still acts on the other *radially* — the pair force is still a straight line between the two bodies — so there are still exactly three balance points, one per pair, and Ceva still concurs them at one center. The branches change how the motion is integrated, not where the pairs balance. This section does not change.

---

## 8. The resultant of the two circles

With the center found, each body now owns two circular components, one per pair it belongs to — each referred to the single center instead of its pair's balance point:

- $M_1$: the $\psi$-circle (from pair 12) and the $\phi$-circle (from pair 13),
- $M_2$: the $\psi$-circle (from pair 12) and the $\chi$-circle (from pair 23),
- $M_3$: the $\phi$-circle (from pair 13) and the $\chi$-circle (from pair 23).

The pair-impulses of §6 drive them; the balance points of §2/§7 locate them; the center of §7 anchors them. Everything needed is on the table. How the two circles per body combine into the one true circle is now a choice between §3's methods:

1. **Vector sum** — add the two pair-vectors per body about the common center (the §3 subtraction of the unmatched pair's vector stands as a fallback, but the symmetry says the straight sum should hold); the resultant is the body's motion, and the paths are reconstructed from the three resultants.
2. **Ratio average** — the statistical route: weight the two components by the same mass ratios that placed the balance points.
3. **Circle intersection** — the geometric route: intersect each body's two circles (referred to the common center) and read the true circle off the intersection structure.

The execution is left here, open for inspection: the machine produces pairs, the triangle produces balance points, Ceva produces the center — and the resultant is the last operation. Intersections, vectors, or ratios; the note will record whichever one the working chooses.

The 6-circle rule still holds: because each resultant pair is still connected by a straight-line force, we still expect six circles for the resultants — one per pair-wave. Technically it is twelve circles, one per branch, but they collapse through resultant vectors: twelve branch-circles into six pair-circles (branches combined per pair), and then into three circles in the end, one per body. The branches do not multiply the geometry; they resolve it, and the resultants collapse it back down.

---

## 9. Conic sections

For the 3-4-5 problem we should expect the possibility that one body flies off — and a body that escapes does not orbit in a circle. It leaves on an orbit with eccentricity: an ellipse stretched toward escape, or a hyperbola. That matters for how we project the wobbles later, when we wrap an axis into an orbit: we usually choose a circle, but the projection surface may actually be something else. A wobble wrapped into a circle is a bound orbit; wrapped into an ellipse with eccentricity approaching one, it is an escape. The conic section is therefore not a detail to fix at the end — it is a parameter of the projection, and the 3-4-5 problem may demand we read our wobbles off something other than a circle.

---

## 10. Wave Lab setup

Twelve wobbles, no combined graph — and no pair graphs either: the tab goes straight to the wobbles. Each wobble belongs to a plane (its branch direction), so the tab shows three squares, one per pair, each square holding that pair's four wobbles.

The square is a phasor diagram with the wobble graphs drawn off it, and it exists to show how the phasor entangles $x$ and $y$ through rotation. Two phasors per square, one per body, placed in diagonal corners (top-left and bottom-right). Off each phasor run two thin banner graphs — the body's $x$ wobble and $y$ wobble — forming an L: the top-left phasor's banners run right ($x$) and down ($y$) along the top and left edges; the bottom-right phasor's banners run left ($x$) and up ($y$) along the bottom and right edges. The two Ls never touch. The center of the square stays empty for the phasor names, and the other two corners stay empty so it is always clear which banners belong to which phasor. Each square keeps a title bar up top — "Wobbles for pair $M_1$ $M_2$", and so on — and stays square by layout design, comparable in size to the other graphs.

Everything is a static snapshot — nothing rotates. Each nonzero branch gets its own phasor, drawn as a circle with the phasor frozen at its snapshot angle: the two branch phasors share the radial phase angle up to a $\pi$ flip — a negative direction cosine flips that branch's phase, because the branch wobble is the radial wobble times that cosine. The machine projects one radial pair-line wobble rather than integrating each branch over its own dimension, so the branches cannot carry fully independent phases; two genuinely independent branch angles would need the twelve-branch integrals actually performed per dimension. The wobble banners are static graphs drawn off those snapshots, each starting at $t=0$ on its own branch tip's projection. Twelve wobbles retrieved through three phasor squares — the whole of §6, visible at once. The circles are amplitude-matched: each branch phasor's circle radius is proportional to its branch's wobble amplitude, on one shared scale across all three squares, and every banner is drawn on that same scale — a banner's peaks can never outgrow its phasor's circle. Each banner starts at $t=0$ on its own branch circle's true edge — right on the tip when the tip faces the banner, otherwise joined to the tip by a dashed projection — so the right wave connects to the right tip, the classic phasor-to-wave figure, drawn static. A zero direction cosine is a zero branch: no phasor, just the flat banner ($\phi$'s $x$, $\chi$'s $y$).

The Wave Lab's three-body tab is where the impulses get used: no per-level graphs, no per-body descent — the quantum tech stack's definite integrals are taken as given, integrated, and plotted as the squares above. Masses are fixed at 3, 4, 5 — the 3-4-5 problem — and the right panel shows the computed pair values, now including the branch direction cosines, instead of sliders.

From there the reconstruction follows the two-body procedure: analyze the orthographic projections on each plane, take the apparent projection onto the plane we don't know, and draw the six circles — each body's two pair-circles about the pair balance points, re-referred to the single center of §7. Once the problem can be visualized — six circles, three balance points, one center — the summation of §8 has something to work on.

### What the wobbles should look like

The three masses (3, 4, 5) are close together and the starting separations are comparable (spans 5, 4, 3), and the boundary conditions put the bodies on near-circular paths — so the wobbles *should* look alike: similar frequencies, similar amplitudes, near-uniform across the three pairs. The uniformity in the lab is the expectation, not a bug.

Two of the three pairs drive only one branch direction: the $\phi$ pair's $x$ banners are flat, and the $\chi$ pair's $y$ banners are flat. That is the right triangle speaking. The $\phi$ side runs vertically ($M_1 \to M_3$ at $x = 1$), so the pair pulls purely in $y$; the $\chi$ side runs horizontally ($M_2 \to M_3$ at $y = -1$), so it pulls purely in $x$. Only the hypotenuse $\psi$ meets its bodies at a slant, with both $x$ and $y$ components — direction cosines $(-0.6, -0.8)$. The flat banners are the boundary conditions' own prediction, confirmed by the $(0,-1)$ and $(1,0)$ cosines in the right panel.

---

## 11. Resultants from phasors

§6 ends with twelve wobbles — four per body (two pairs × two branches). §8 left the summation as a choice between vector sum, ratio average, or circle intersection. The Wave Lab executes the vector sum, and it does it through phasors.

Each nonzero branch is reduced to one phasor — a magnitude and an angle:

- **Magnitude** $r$: the branch wobble's peak amplitude over the $4\pi$ window.
- **Angle** $\theta$: the argument of the pair-span integral at $\tau = 0$, plus $\pi$ when the branch's direction cosine is negative (a negative cosine flips that branch's phase, because the branch wobble is the radial wobble times that cosine).

A zero direction cosine is a zero branch: no phasor ($\phi$'s $x$, $\chi$'s $y$).

The resultants are then **complex addition** — not multiplication:

$$Z = \sum_k r_k e^{i\theta_k}$$

$$R = \sqrt{r_1^2 + r_2^2 + 2r_1r_2\cos(\theta_1 - \theta_2)}, \qquad \Theta = \operatorname{atan2}\!\left(\sum_k r_k\sin\theta_k,\, \sum_k r_k\cos\theta_k\right).$$

Not products — phases don't add here, vectors do. Not $\sqrt{r_1^2 + r_2^2}$ either — that's only the $\pm 90°$ special case. Per body, per direction, the two pair-branches sum to one directional resultant: twelve branches into six directional resultants, three bodies each with an $x$ and a $y$:

$$W_1 = \big(0.156\angle{-1.21},\; 0.474\angle{-1.43}\big), \qquad W_2 = \big(0.317\angle{1.18},\; 0.114\angle{-0.79}\big), \qquad W_3 = \big(0.322\angle{-1.79},\; 0.157\angle{-0.26}\big),$$

in the Wave Lab's normalized units. That is §8's Idea 1 executed — the straight vector sum, no subtraction needed. The symmetry held.

---

## 12. The resultant wobble

Each $W_n$ is a pair of directional phasors: $Z_{n,x} = R_{n,x}e^{i\Theta_{n,x}}$, $Z_{n,y} = R_{n,y}e^{i\Theta_{n,y}}$. Read as a time-dependent displacement, the path they imply is:

$$x_n(\tau) = R_{n,x}\cos(\tau + \Theta_{n,x}), \qquad y_n(\tau) = R_{n,y}\cos(\tau + \Theta_{n,y}).$$

Equal frequencies — but the $x/y$ phases differ, and that phase split is what makes the path elliptical rather than a straight line. The splits:

- $M_1$: $\Delta\Theta = \Theta_x - \Theta_y \approx 0.22\ \mathrm{rad} \approx 13°$ — nearly in phase; a thin ellipse, almost one-dimensional.
- $M_2$: $\Delta\Theta \approx 1.97\ \mathrm{rad} \approx 113°$ — an open ellipse.
- $M_3$: $\Delta\Theta \approx -1.53\ \mathrm{rad} \approx -88°$ — nearly a proper ellipse, axes almost aligned.

So $M_1$'s wobble nearly collapses to the single-axis case — the resultant almost acts along one line — while $M_2$ and $M_3$ genuinely need two dimensions. The phase split does visible work here; it is a result, not an assumption.

One honesty note, carried from the build: these branch phasors are (peak, span-phase) proxies, not true Fourier amplitudes. The machine still computes the radial pair-line version and projects it into $x/y$ — the branches are not independently integrated per dimension. The compact phasor sum is the interim summation; the geometric time-series sum is the later check. This section records what was actually done.

---

## 13. Center, balance points, and why the motion is elliptical

The geometric setup is §7's and it stands: three pair balance points ($B_{12}$, $B_{13}$, $B_{23}$) dividing the triangle sides in the mass ratios, three cevians concurring by Ceva at the center of mass $(0,0)$. Every body's motion is referred to that one center.

Now the step that decides the shape — and it comes from comparing with the two-body tab. There, $\lambda^*$ split the motion into two circular parts about the balance point, and that was *right*: for two bodies the force is direct and radial — one line, one circle. Read it as the $a$ and $b$ of a would-be ellipse that coincide. The anisotropy is zero, so the ellipse collapses to a circle, and shifting the body's circle relative to the center is exactly the correct move when the force acts directly.

But the three-body resultants are not direct forces. Each $W_n$ is a **resultant force** — a phasor sum of two pair-waves, synthesized by addition, exerted along no single pair line. Its $x$ and $y$ components have different magnitudes ($R_x \neq R_y$) and different phases. No one circle can carry that anisotropy. Splitting the resultant into $x$ and $y$ hands us $a \propto R_x$ and $b \propto R_y$ directly — an ellipse, with eccentricity $e = \sqrt{1 - (b/a)^2}$ read off the calculation, not chosen.

That is why the ellipses here are not Kepler's error. Nothing was imposed and then fit — §9's warning was heeded. The phasor sum dictated unequal axes; the ellipse is what the resultant *is*, drawn as a path. Had $R_x$ equaled $R_y$ at equal phases, the method would have drawn circles. The method decides the shape; the assumption never enters.

The Wave Lab's "Three Bodies Projected onto a 2D Eigenplane in 3D Space" is this section drawn: one center $C = (0,0)$, three ellipses centered there with $a \propto R_x$, $b \propto R_y$ (major axis scaled to each body's starting distance from the center), the three bodies riding their ellipses.

Read as a projection: three bodies in 3D space, drawn on the 2D eigenplane — the flat plane, cut through 3D space, on which the three stay relatively locked. The ellipses are the projection, not the true motion; the true motion is the centers moving through the field, each carrying its own clock. And the point moving in the Motion tab's turbulence graph is the same kind of point here: the eigen point relative to the center — the merged resultant of the branches, the turbulence point of the 3-4-5 boundary.

Splitting the branches deconstructs into individual components — the motion based on the energy within the system. Merging them asks about the change in energy from an external source outside the boundary conditions — and merging is how we restore the clock rate, adding the additional clock information and the additional motion from the new source.

---

## 14. Conclusion — the 3-4-5 projection

The chain, end to end:

1. **Boundary conditions** (§2): 3-4-5 masses at Burrau's coordinates, released from rest, center of mass at the origin.
2. **Six pair-waves** (§5): $\psi$, $\phi$, $\chi$, each branched in $x$ and $y$ (§4) — twelve branches, one overall scale free.
3. **Throughput** (§6): each pair through the quantum tech stack — twelve impulses, twelve wobbles.
4. **Phasors** (§11): each nonzero branch reduced to (peak, span-phase); $\pi$ flip on negative direction cosine.
5. **Resultants** (§11): complex addition per body per direction — $W_1$, $W_2$, $W_3$.
6. **Center** (§7, §13): three balance points, Ceva's concurrence, one center of mass.
7. **Paths** (§12–§13): the directional resultants project to ellipses — $a \propto R_x$, $b \propto R_y$ — centered at the common center.

8. **Deconstruction** (§15): each resultant ellipse factored into prograde + retrograde circles — six circles, twelve equations — landing exactly on the §13 ellipses.

What this chain computes is the eigenplane projection for the Burrau boundary — not a solution to the three-body problem. The three bodies released from rest at Burrau's coordinates are a boundary condition: a choice of how much energy to include. Inside that boundary, the pair-waves go through the stack, the resultants sum by phasor arithmetic, Ceva gives the common center, and the directional resultants project to ellipses on the 2D plane where the three bodies stay relatively locked. Twelve branches went in; three elliptical wobbles came out — the 2D relative motion, drawn on the eigenplane. Kepler's operation, four hundred years later, by machine.

It was never a solution, because the problem as stated — the positions for all $t \geq 0$, in the real field — does not close. The wave field extends infinitely far beyond the 3-4-5 boundary, and there is always more energy coming from outside it: more masses, more frequencies, more collisions than the twelve branches include. That outside is what appears as chaos. What the textbooks call chaotic motion is the larger system leaking through the boundary we drew.

And the boundary is redrawn every time: add a fourth body and you get new vectors in new directions — back to 3D, recompute everything, collapse to a new 2D plane, merge a new center, compute a new clock. Each plane belongs to its boundary; each clock belongs to its plane. The merge rule generalizes: any $n$ bodies treated as one resultant can merge with any $m$ bodies treated as one resultant — pairs and branches into one resultant acceleration by summing, then integrate over space or over time for the center's motion relative to some other point. Every added integral is another body: another pair of phasors, another resultant value to add.

We cannot set the boundary so that there is no outside turbulence — that would need an infinite boundary and the individual motion of every body in it. There are always more branches than we can account for, so we only ever see the apparent motion in an eigenplane.

So this was never a question of the physics. The force law is not missing. It is a math problem: underdetermination. With four bodies or more there are more independent variables than equations — $x$, $y$, $z$ for four or more vectors each — and even with three there is always unknown field outside the boundary. We can add up all the forces inside the boundary, but there is always some other gravitational body acting on the system — some external force — that the sum does not include. There is always at least one more body — always more field — than the equations close over.

The honest statement, then: the 3-4-5 construction computes the relative motion on the eigenplane for one boundary condition — the plane, the center, the clock ratio for that system. The true motion, the centers moving through the infinite field each carrying their own time, was never on the plane. It was underneath it all along.

---

## 15. Split branches — unstretching the ellipses

§8 gave each body two pair-circles; §§11–13 summed them into resultant ellipses, every motion referred to the one eigenpoint. The Wave Lab's "Split Branches: Three Centers: Six Circles" runs the factorization backward — not recovering the pair-circles (that information was merged away in the sum), but splitting each resultant ellipse into its two circular components. An axis-aligned ellipse $(a\\cos\\tau,\\,e\\sin\\tau)$ is exactly the sum of two circular motions at the same rate, counter-rotating:

$$D(\\tau) = \\tfrac{a+e}{2}(\\cos\\tau,\\,\\sin\\tau), \\qquad P(\\tau) = \\tfrac{a-e}{2}(\\cos\\tau,\\,-\\sin\\tau), \\qquad D+P = (a\\cos\\tau,\\,e\\sin\\tau).$$

Three deferent centers $D_k$ ride the prograde circles about the fixed eigenpoint $E$; each body rides its retrograde epicycle. Six circles, twelve equations of motion. The semi-axes $(a_k, e_k)$ come straight from the solved resultants, so the circles carry the true mass ratios — no mechanical guess. (The first attempt set the epicycle to twice the deferent rate; a 2:1 epicycle draws an epitrochoid, never an ellipse. The rates must match, counter-rotating.) The first graph's ellipses are drawn faint beneath; each body lands on its ellipse exactly, and that coincidence is the verification.

The acceleration reading comes along. The ellipse at uniform $\\tau$ has non-uniform speed, $|v|^2 = a^2\\sin^2\\tau + e^2\\cos^2\\tau$ — real tangential acceleration along the path. Each circle alone has constant speed; the variation is the interference of the two. Unstretching isolates the squish as its own uniform motion: the retrograde circle of radius $(a-e)/2$ *is* the eccentricity, made into a motion.

Nothing is subtracted to get there. Body = frame motion + relative motion — the frame's motion adds (the turbulence correction: add the frame, never remove it). Each body interacts in two pairs, each pair counted once; the opposite side of the triangle is the reference the relative motion is measured against — the deferent center — not a term to remove. No double counting, because nothing is counted twice.

And the point §13 was approaching: the squish can come from inside the eigenplane. No fourth body and no force outside the plane is needed to stretch circles into ellipses — referring all of the motion to the single eigenpoint does it.
