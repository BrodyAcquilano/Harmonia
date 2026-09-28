# The Three Body Problem

*The pair machine works. Two bodies in, closed-form waves out, Kepler recovered, the quantum tech stack traversed both ways. The next wall is the famous one: three bodies, where every textbook says closed-form solutions without chaos are impossible. This note is the program for proving that assumption false — six pair-equations through the quantum tech stack, and then the one hard problem the quantum tech stack doesn't solve for us: summing the pairs.*

---

## Table of Contents

- [1. Why three bodies](#1-why-three-bodies)
- [2. The problem, stated](#2-the-problem-stated)
- [3. The challenge — summing the pairs](#3-the-challenge--summing-the-pairs)
- [4. The six equations — $\psi$, $\phi$, $\chi$](#4-the-six-equations--psi-phi-chi)
- [5. Through the quantum tech stack](#5-through-the-quantum-tech-stack)
- [6. Finding the actual center](#6-finding-the-actual-center)
- [7. The resultant of the two circles](#7-the-resultant-of-the-two-circles)
- [8. Convergence and divergence](#8-convergence-and-divergence)
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

§6 attempts Idea 3 now. §7 sets up the resultant for each mass, with the method left as a choice.

---

## 4. The six equations — $\psi$, $\phi$, $\chi$

One opposing wave-pair per body-pair, in the display form. For a pair $(a,b)$, with $\lambda$ measured along the pair line from body $a$ and $\tau$ the clock:

$$W_a^{(ab)}(\lambda,\tau) = A_a^{(ab)} e^{-\beta_{ab}\lambda}\left[\cos\left(k_a^{(ab)}\lambda - \omega_a^{(ab)}M_b\tau\right) + i\sin\left(k_a^{(ab)}\lambda - \omega_a^{(ab)}M_b\tau\right)\right]$$

$$W_b^{(ab)}(\lambda,\tau) = A_b^{(ab)} e^{-\beta_{ab}(L_{ab}-\lambda)}\left[\cos\left(-k_b^{(ab)}\lambda - \omega_b^{(ab)}M_a\tau\right) + i\sin\left(-k_b^{(ab)}\lambda - \omega_b^{(ab)}M_a\tau\right)\right]$$

with, per pair, $k_a^{(ab)} = \omega_a^{(ab)} = 1$, $k_b^{(ab)} = \omega_b^{(ab)} = \sqrt{M_b/M_a}$, $A_a^{(ab)} = \sqrt{M_b/(M_a+M_b)}$, $A_b^{(ab)} = \sqrt{M_a/(M_a+M_b)}$, $\beta_{ab} = |M_a-M_b|/(M_a+M_b)$, and span $L_{ab}$ the pair's separation. Name them:

- **$\psi$** for $(M_1,M_2)$: $\psi_1 = W_1^{(12)}$, $\psi_2 = W_2^{(12)}$, span $L_{12} = 5$;
- **$\phi$** for $(M_1,M_3)$: $\phi_1 = W_1^{(13)}$, $\phi_3 = W_3^{(13)}$, span $L_{13} = 4$;
- **$\chi$** for $(M_2,M_3)$: $\chi_2 = W_2^{(23)}$, $\chi_3 = W_3^{(23)}$, span $L_{23} = 3$.

In full, the $\psi$ pair:

$$\psi_1 = A_{\psi1}\, e^{-\beta_{\psi}\lambda}\left[\cos\left(\lambda - M_2\tau\right) + i\sin\left(\lambda - M_2\tau\right)\right]$$

$$\psi_2 = A_{\psi2}\, e^{-\beta_{\psi}(5-\lambda)}\left[\cos\left(-k_{\psi2}\lambda - \omega_{\psi2}M_1\tau\right) + i\sin\left(-k_{\psi2}\lambda - \omega_{\psi2}M_1\tau\right)\right]$$

the $\phi$ pair:

$$\phi_1 = A_{\phi1}\, e^{-\beta_{\phi}\lambda}\left[\cos\left(\lambda - M_3\tau\right) + i\sin\left(\lambda - M_3\tau\right)\right]$$

$$\phi_3 = A_{\phi3}\, e^{-\beta_{\phi}(4-\lambda)}\left[\cos\left(-k_{\phi3}\lambda - \omega_{\phi3}M_1\tau\right) + i\sin\left(-k_{\phi3}\lambda - \omega_{\phi3}M_1\tau\right)\right]$$

the $\chi$ pair:

$$\chi_2 = A_{\chi2}\, e^{-\beta_{\chi}\lambda}\left[\cos\left(\lambda - M_3\tau\right) + i\sin\left(\lambda - M_3\tau\right)\right]$$

$$\chi_3 = A_{\chi3}\, e^{-\beta_{\chi}(3-\lambda)}\left[\cos\left(-k_{\chi3}\lambda - \omega_{\chi3}M_2\tau\right) + i\sin\left(-k_{\chi3}\lambda - \omega_{\chi3}M_2\tau\right)\right]$$

The 3-4-5 boundary conditions fix every constant — nothing is free:

| Pair | Bodies | $L_{ab}$ | $A_a$ | $A_b$ | $\beta_{ab}$ | $k_b = \omega_b$ |
|---|---|---|---|---|---|---|
| $\psi$ | $(3,4)$ | $5$ | $\sqrt{4/7}$ | $\sqrt{3/7}$ | $1/7$ | $\sqrt{4/3}$ |
| $\phi$ | $(3,5)$ | $4$ | $\sqrt{5/8}$ | $\sqrt{3/8}$ | $1/4$ | $\sqrt{5/3}$ |
| $\chi$ | $(4,5)$ | $3$ | $\sqrt{5/9}$ | $\sqrt{4/9}$ | $1/9$ | $\sqrt{5/4}$ |

($k_a = \omega_a = 1$ for the first-listed body of each pair.) Six equations, six unknowns' worth of wave — the input side of the machine.

---

## 5. Through the quantum tech stack

Now the trivial part: run each pair through the quantum tech stack. The descent is the same five levels — limits, differentiation, the vanishing total differential per pair:

$$dW_s^{(ab)} = \left(\frac{\partial W_a^{(ab)}}{\partial M_a}+\frac{\partial W_b^{(ab)}}{\partial M_a}\right)dM_a + \left(\frac{\partial W_a^{(ab)}}{\partial M_b}+\frac{\partial W_b^{(ab)}}{\partial M_b}\right)dM_b = 0,$$

the turn solves each pair's differential equation (the pair's wave, already written above), and the ascent integrates back up. The ascent's definite integrals are the output that matters: per pair, per body, the impulse generated over the pair's span —

$$F_1^{(12)}(t) = \int_0^{5}\!\left[\mathrm{Im}(\psi_1) - \mathrm{Re}(\psi_1)\right]d\lambda, \qquad F_2^{(12)}(t) = \int_0^{5}\!\left[\mathrm{Im}(\psi_2) - \mathrm{Re}(\psi_2)\right]d\lambda,$$

$$F_1^{(13)}(t) = \int_0^{4}\!\left[\mathrm{Im}(\phi_1) - \mathrm{Re}(\phi_1)\right]d\lambda, \qquad F_3^{(13)}(t) = \int_0^{4}\!\left[\mathrm{Im}(\phi_3) - \mathrm{Re}(\phi_3)\right]d\lambda,$$

$$F_2^{(23)}(t) = \int_0^{3}\!\left[\mathrm{Im}(\chi_2) - \mathrm{Re}(\chi_2)\right]d\lambda, \qquad F_3^{(23)}(t) = \int_0^{3}\!\left[\mathrm{Im}(\chi_3) - \mathrm{Re}(\chi_3)\right]d\lambda.$$

Six impulse equations — two per pair, one per body per pair. Each is the pair's doing, expressed as the motion it imprints on each of its bodies. This is the far end of the quantum tech stack: six solutions satisfying the 3-4-5 boundary conditions. What the quantum tech stack does *not* give us is how $F_1^{(12)}$ and $F_1^{(13)}$ combine into the motion of $M_1$. That is §3's problem, and §6–§7's work.

---

## 6. Finding the actual center

Attempt at Idea 3 — and it works. Each pair has its two-body balance point, dividing its triangle side in the mass ratio (from §2 of the two-body work, $\lambda^*_{ab} = L_{ab}M_b/(M_a+M_b)$ measured from body $a$):

- $B_{12}$ on side 12: $20/7$ from $M_1$ (side length 5),
- $B_{13}$ on side 13: $5/2$ from $M_1$ (side length 4),
- $B_{23}$ on side 23: $5/3$ from $M_2$ (side length 3).

Draw the three cevians: from each body to the balance point on the *opposite* side. $B_{23}$ divides side 23 in the ratio $M_3:M_2$ from vertex 2; $B_{31}$ divides side 31 in $M_1:M_3$ from vertex 3; $B_{12}$ divides side 12 in $M_2:M_1$ from vertex 1. By **Ceva's theorem**, the three cevians concur if and only if the product of the three ratios is 1:

$$\frac{M_3}{M_2}\cdot\frac{M_1}{M_3}\cdot\frac{M_2}{M_1} = 1.$$

It is identically 1 — for *any* three masses, not just 3-4-5. The three balance-point lines always meet at a single point, and that point is the barycentric $(M_1:M_2:M_3)$: the center of mass. Checked on Burrau's coordinates: the cevians from $(1,3)$, $(-2,-1)$, $(1,-1)$ through $(-5/7,\,5/7)$, $(1,\,1/2)$, $(-1/3,\,-1)$ all pass through $(0,0)$.

So the favourite idea is proved, not conjectured: draw the pairs, mark the three balance points, draw the three lines — one point. The six circles' three pair-centers rectify to a single center, and it is the system's center of mass. The visual is exactly as advertised: three pairs → three lines → one point, and the orbits get re-referred to that center to produce circles.

---

## 7. The resultant of the two circles

With the center found, each body now owns two circular components, one per pair it belongs to — each referred to the single center instead of its pair's balance point:

- $M_1$: the $\psi$-circle (from pair 12) and the $\phi$-circle (from pair 13),
- $M_2$: the $\psi$-circle (from pair 12) and the $\chi$-circle (from pair 23),
- $M_3$: the $\phi$-circle (from pair 13) and the $\chi$-circle (from pair 23).

The pair-impulses of §5 drive them; the balance points of §2/§6 locate them; the center of §6 anchors them. Everything needed is on the table. How the two circles per body combine into the one true circle is now a choice between §3's methods:

1. **Vector sum** — add the two pair-vectors per body about the common center (the §3 subtraction of the unmatched pair's vector stands as a fallback, but the symmetry says the straight sum should hold); the resultant is the body's motion, and the paths are reconstructed from the three resultants.
2. **Ratio average** — the statistical route: weight the two components by the same mass ratios that placed the balance points.
3. **Circle intersection** — the geometric route: intersect each body's two circles (referred to the common center) and read the true circle off the intersection structure.

The execution is left here, open for inspection: the machine produces pairs, the triangle produces balance points, Ceva produces the center — and the resultant is the last operation. Intersections, vectors, or ratios; the note will record whichever one the working chooses.

---

## 8. Convergence and divergence

The expected result of the 3-4-5 problem is known: the lighter body is ejected. In our language the story reads as convergence and divergence. The three bodies spiral inward and converge — the pair-waves pile into the same region, the released energy has nowhere left to go, and the configuration becomes unstable. Energy must go somewhere, and by symmetry the third body is expelled: it diverges, its motion increasing without bound, and one mass is ejected.

This may pose a problem for us, because it suggests acceleration is at play — and from what we know of the quantum tech stack, recovering something conserved after an acceleration may require another layer of integration, a sixth layer. But our boundary conditions exist at layer 5 on the incoming side, and we are unsure whether we are allowed to go up another level: the other side has no sixth layer, because all three bodies start from free fall. The question becomes: can we go up one more level of time to recover something stable and finite, or would that break the symmetry? It may be possible to extend up one more layer and simply account for the rotation. This idea makes sense because we have added another spatial dimension to the problem — three bodies need the full plane where two needed a line, and the extra layer may be where the rotation lives.

---

## 9. Wave Lab setup

The Wave Lab's three-body tab is where the impulses get used. It jumps straight to three-body motion: no per-level graphs, no per-body descent — the quantum tech stack's definite integrals are taken as given, integrated, and plotted. The wobble-over-time graph sums each body's two pair-impulses (idea 1, the straight sum) and integrates over time, the same $X_n(t) = \int F_n$ construction as the two-body Motion tab. The three pair graphs are static snapshots at $\tau = 0$, one per pair, so the six waves can be inspected the way the gravity tab inspects two. Masses are fixed at 3, 4, 5 — the 3-4-5 problem — and the right panel shows the solved pair values instead of sliders.

From there the reconstruction follows the two-body procedure: analyze the orthographic projections on each plane, take the apparent projection onto the plane we don't know, and draw the six circles — each body's two pair-circles about the pair balance points, re-referred to the single center of §6. Once the problem can be visualized — six circles, three balance points, one center — the summation of §7 has something to work on.
