# The Three Body Problem

*The pair machine works. Two bodies in, closed-form waves out, Kepler recovered, the quantum tech stack traversed both ways. The next wall is the famous one: three bodies, where every textbook says closed-form solutions without chaos are impossible. This note is the program for proving that assumption false — six pair-equations through the quantum tech stack, and then the one hard problem the quantum tech stack doesn't solve for us: summing the pairs.*

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
- [9. Wave Lab setup](#9-wave-lab-setup)


## 1. Why three bodies

The three-body problem is the prediction of the motion of three masses under their mutual gravity, given initial positions and velocities. It is the next logical step because it is the problem other theories cannot explain: since Poincaré, the accepted position is that no closed-form solution exists — that any attempt introduces chaos, and the only way forward is numerical integration, step by step, with the error growing as you go.

Our goal is to prove that assumption false.

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

**Idea 3 — Kepler's error, repaired geometrically.** Take what we learned from Kepler's error about ellipses and build a geometrical theory of overlapping circles: find what the difference in apparent motion rectifies to. Our first pass gives 6 circles and 3 center points, but we know there can only be one center and three circles. Rectify by circle intersections — or better: draw the lines connecting each pair and find the single point that all three balance-point lines pass through. This is the favourite: it gives a visual proof of the whole reduction, three pairs → three lines → one point, and then the orbits are adjusted relative to that center to produce circles. **Intersections are the operation here.**

§7 attempts Idea 3 now. §8 sets up the resultant for each mass, with the method left as a choice.

---

## 4. Higher dimensions and the quantum tech stack

A thought experiment first, because it names the mistake. The expected result of the 3-4-5 problem is known: the lighter body is ejected. Read it in our language: the three bodies spiral inward and converge — the pair-waves pile into the same region, the released energy has nowhere left to go, and the configuration becomes unstable. Energy must go somewhere, and by symmetry the third body is expelled: it diverges, its motion increasing without bound, and one mass is ejected. That picture carries a warning — it suggests acceleration is at play — and a question: can the stack generate convergence and divergence and still be coherent? The 3-4-5 acceleration problem is a clue, and it points at the real mistake: we carried the one-dimensional machinery over unchanged, missing the branches.

The mistake is dimensional. We built the quantum tech stack for two bodies on a line — one spatial dimension — and carried it over to three bodies unchanged. But three bodies live in a plane, not a line: two spatial dimensions, not one. The original energy-conservation form is not wrong, but it is incomplete — it must be read as multivariable energy conservation, differentiated in $y$ and $x$ (partial derivatives), because the boundary conditions now span a plane.

From the quantum tech stack we now know the price of a new spatial dimension — and it is not new dimensions. The stack's five fundamental dimensions are fixed; what a new spatial direction adds is *branches* through the same machinery. On the way up, the wobble integral splits into two separate branches: the wobble in one direction, then the wobble in the other, and the resultant wobbles are summed. It is the first time the integration path has split — not two new time dimensions, but the same time dimensions used to rotate into different directions. On the way down, the split runs in reverse: the derivative does not climb into higher dimensions but divides into two initial-condition branches. Call them A and B incoming, Y and Z outgoing — we never track A-on-Y, A-on-Z, B-on-Y, B-on-Z separately, because the quantum tech stack handles the rotations for us, keeping the relative orientation of the branches on the outside and rotating them relative to one another. The boundary conditions for the second spatial direction should look much like the ones we already have: known positions at rest, the same free-fall start, now read in two directions. We start, then, with known boundary conditions, the five-layer quantum tech stack run in branches, and energy conserved from the boundary conditions.

That fixes the problem-solving approach, and there are two ways to write it: keep the six equations and make each one long, with both directions written out — or split each equation into branches and let a summation sign do the work of the repetition. We take the branches. And the branch count is fixed by a rule borrowed from linear algebra: $xx$ and $yy$ already span the plane. Two perpendicular directions define any other direction of the plane by combining them in different proportions, so a pair line pointing along $\hat{u}_{ab} = c_x\hat{x} + c_y\hat{y}$ is recovered as $c_x W^{(x)} + c_y W^{(y)}$ — no $xy$ or $yx$ cross terms, since any cross direction is already a combination of the perpendicular pair.

We suspect the acceleration is not the real problem: the boundary conditions say energy is conserved, and we can expect the same symmetry on the other side. The real issue may be convergence and divergence — whether the stack generates them. But divergence does not imply incoherence: even divergent signals follow coherent rules, and the stack's whole record is coherence preserved through every turn. The old question — whether we may climb another level of time to recover something stable and finite — is answered here: not by new levels but by branches, the same five dimensions doing the rotating, and the symmetry is what the branches are for.

---

## 5. The six equations — $\psi$, $\phi$, $\chi$ (twelve branches)

One opposing wave-pair per body-pair, in the display form — each wave now the sum of its two branches. Write $j \in \{x, y\}$ for the branch; the wave is $\sum_j$ of its branches:

$$W_a^{(ab)} = \sum_j W_{a,j}^{(ab)}, \qquad W_{a,j}^{(ab)}(\lambda_j,\tau) = A_a^{(ab)} e^{-\beta_{ab}\lambda_j}\left[\cos\left(k_{a,j}^{(ab)}\lambda_j - \omega_{a,j}^{(ab)}M_b\tau\right) + i\sin\left(k_{a,j}^{(ab)}\lambda_j - \omega_{a,j}^{(ab)}M_b\tau\right)\right]$$

$$W_b^{(ab)} = \sum_j W_{b,j}^{(ab)}, \qquad W_{b,j}^{(ab)}(\lambda_j,\tau) = A_b^{(ab)} e^{-\beta_{ab}(L_{ab}-\lambda_j)}\left[\cos\left(-k_{b,j}^{(ab)}\lambda_j - \omega_{b,j}^{(ab)}M_a\tau\right) + i\sin\left(-k_{b,j}^{(ab)}\lambda_j - \omega_{b,j}^{(ab)}M_a\tau\right)\right]$$

with, per pair and on each branch, $k_{a,j}^{(ab)} = \omega_{a,j}^{(ab)} = 1$, $k_{b,j}^{(ab)} = \omega_{b,j}^{(ab)} = \sqrt{M_b/M_a}$, $A_a^{(ab)} = \sqrt{M_b/(M_a+M_b)}$, $A_b^{(ab)} = \sqrt{M_a/(M_a+M_b)}$, $\beta_{ab} = |M_a-M_b|/(M_a+M_b)$, and span $L_{ab}$ the pair's separation. The branch touches nothing but the direction: the pair's constants are the pair's, identical on $x$ and $y$. (The alternative — one long equation per wave with both directions written out — is the same mathematics; the branch form is just easier to carry.) The branch count follows the rule of §4: $xx$ and $yy$ span the plane, so two branches per wave and no cross terms. Name them:

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

The 3-4-5 boundary conditions fix every constant — nothing is free:

| Pair | Bodies | $L_{ab}$ | $A_a$ | $A_b$ | $\beta_{ab}$ | $k_b = \omega_b$ |
|---|---|---|---|---|---|---|
| $\psi$ | $(3,4)$ | $5$ | $\sqrt{4/7}$ | $\sqrt{3/7}$ | $1/7$ | $\sqrt{4/3}$ |
| $\phi$ | $(3,5)$ | $4$ | $\sqrt{5/8}$ | $\sqrt{3/8}$ | $1/4$ | $\sqrt{5/3}$ |
| $\chi$ | $(4,5)$ | $3$ | $\sqrt{5/9}$ | $\sqrt{4/9}$ | $1/9$ | $\sqrt{5/4}$ |

($k_{a,j} = \omega_{a,j} = 1$ on each branch for the first-listed body of each pair.) Six equations, twelve branches — the input side of the machine.

Recomputed under the branched stack of §4: nothing here changes. The branches — the wobble integral split in two directions on the way up, the initial conditions split in two on the way down — run through the same five-dimensional machinery; they do not touch the pair's own constants. The table above stands as written.

---

## 6. Throughput

Now the trivial part: run each pair through the quantum tech stack. The descent is the same five levels — limits, differentiation, the vanishing total differential per pair:

$$dW_s^{(ab)} = \left(\frac{\partial W_a^{(ab)}}{\partial M_a}+\frac{\partial W_b^{(ab)}}{\partial M_a}\right)dM_a + \left(\frac{\partial W_a^{(ab)}}{\partial M_b}+\frac{\partial W_b^{(ab)}}{\partial M_b}\right)dM_b = 0,$$

the turn solves each pair's differential equation (the pair's wave, already written above), and the ascent integrates back up. The ascent's definite integrals are the output that matters: per pair, per body, the impulse generated over the pair's span —

$$F_1^{(12)}(t) = \int_0^{5}\!\left[\mathrm{Im}(\psi_1) - \mathrm{Re}(\psi_1)\right]d\lambda, \qquad F_2^{(12)}(t) = \int_0^{5}\!\left[\mathrm{Im}(\psi_2) - \mathrm{Re}(\psi_2)\right]d\lambda,$$

$$F_1^{(13)}(t) = \int_0^{4}\!\left[\mathrm{Im}(\phi_1) - \mathrm{Re}(\phi_1)\right]d\lambda, \qquad F_3^{(13)}(t) = \int_0^{4}\!\left[\mathrm{Im}(\phi_3) - \mathrm{Re}(\phi_3)\right]d\lambda,$$

$$F_2^{(23)}(t) = \int_0^{3}\!\left[\mathrm{Im}(\chi_2) - \mathrm{Re}(\chi_2)\right]d\lambda, \qquad F_3^{(23)}(t) = \int_0^{3}\!\left[\mathrm{Im}(\chi_3) - \mathrm{Re}(\chi_3)\right]d\lambda.$$

Six impulse equations — two per pair, one per body per pair. Each is the pair's doing, expressed as the motion it imprints on each of its bodies. This is the far end of the quantum tech stack: six solutions satisfying the 3-4-5 boundary conditions. What the quantum tech stack does *not* give us is how $F_1^{(12)}$ and $F_1^{(13)}$ combine into the motion of $M_1$. That is §3's problem, and §7–§8's work.

---

## 7. Finding the actual center

Attempt at Idea 3 — and it works. Each pair has its two-body balance point, dividing its triangle side in the mass ratio (from §2 of the two-body work, $\lambda^*_{ab} = L_{ab}M_b/(M_a+M_b)$ measured from body $a$):

- $B_{12}$ on side 12: $20/7$ from $M_1$ (side length 5),
- $B_{13}$ on side 13: $5/2$ from $M_1$ (side length 4),
- $B_{23}$ on side 23: $5/3$ from $M_2$ (side length 3).

Draw the three cevians: from each body to the balance point on the *opposite* side. $B_{23}$ divides side 23 in the ratio $M_3:M_2$ from vertex 2; $B_{31}$ divides side 31 in $M_1:M_3$ from vertex 3; $B_{12}$ divides side 12 in $M_2:M_1$ from vertex 1. By **Ceva's theorem**, the three cevians concur if and only if the product of the three ratios is 1:

$$\frac{M_3}{M_2}\cdot\frac{M_1}{M_3}\cdot\frac{M_2}{M_1} = 1.$$

It is identically 1 — for *any* three masses, not just 3-4-5. The three balance-point lines always meet at a single point, and that point is the barycentric $(M_1:M_2:M_3)$: the center of mass. Checked on Burrau's coordinates: the cevians from $(1,3)$, $(-2,-1)$, $(1,-1)$ through $(-5/7,\,5/7)$, $(1,\,1/2)$, $(-1/3,\,-1)$ all pass through $(0,0)$.

So the favourite idea is proved, not conjectured: draw the pairs, mark the three balance points, draw the three lines — one point. The six circles' three pair-centers rectify to a single center, and it is the system's center of mass. The visual is exactly as advertised: three pairs → three lines → one point, and the orbits get re-referred to that center to produce circles.

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

---

## 9. Wave Lab setup

The Wave Lab's three-body tab is where the impulses get used. It jumps straight to three-body motion: no per-level graphs, no per-body descent — the quantum tech stack's definite integrals are taken as given, integrated, and plotted. The three pair graphs are static snapshots at $\tau = 0$, one per pair, each showing its two waves in the bodies' colors plus the pair's standing wave as a black line — so the six waves can be inspected the way the gravity tab inspects two. There is deliberately no combined wobble graph: the wobble gets three graphs, one per body — each body's pair-impulses summed (idea 1, the straight sum) and integrated over time — because the three wobbles point in different directions, so they share no common axis and one plot would mislead. Masses are fixed at 3, 4, 5 — the 3-4-5 problem — and the right panel shows the solved pair values instead of sliders.

From there the reconstruction follows the two-body procedure: analyze the orthographic projections on each plane, take the apparent projection onto the plane we don't know, and draw the six circles — each body's two pair-circles about the pair balance points, re-referred to the single center of §7. Once the problem can be visualized — six circles, three balance points, one center — the summation of §8 has something to work on.
