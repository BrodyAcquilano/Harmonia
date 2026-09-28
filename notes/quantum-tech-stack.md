# The Quantum Tech Stack

*This note is the effect of which the previous note's intuition was the cause. "Decay and Amplitude" records how the wave equation was found — the contraction, the guess, the decay, the amplitudes — as it was understood at the time. This note records what that process looks like from above, once the whole round trip is visible: a stack with five levels, a conservation law at the top, the same conservation law at the bottom, and a return trip that comes back rotated ninety degrees.*

---

## 1. What the stack is

A tech stack is layers with a direction: you go down through them to the thing everything stands on, and back up to the thing the user sees. The derivation of the inertia waves turns out to have exactly this shape.

Going **down** is differentiation: each level removes a variable, contracts the description, strips away space and time until nothing is left but the boundary conditions. Going **up** is integration: each level accumulates again, alternating over space and time, rebuilding the description — but rotated. What went down radial comes back perpendicular.

The trip is a round trip. We started with a conservation law, worked down the stack, and integrated back up to *the same conservation law* — now as a definite integral relating work and impulse. We knew we had hit the bottom because the equation had restored the symmetry and was equal to zero. We knew the trip was over when the law we started from reappeared, evaluated between bounds.

The stack has five levels. That number is not a choice: Kepler's third law says so — $T^2 \propto a^3$, two of time, three of space, $2 + 3 = 5$.

---

## 2. The stack, as a table

Each row is a level. The left column is the descent (differentiation, ↓); the right column is the ascent (integration, ↑); the middle column is the indicator — the sign at that level that this is the quantum tech stack and not an ordinary calculation. Read the left column top to bottom, then the right column bottom to top.

| ↓ Descent — differentiate | Indicator | Ascent — integrate ↑ |
|---|---|---|
| **d1.** State the conservation law: $d\psi_s = 0$. Inertia-energy is conserved; the total differential vanishes. | A conservation law is the signature that a stack exists — something is being carried through every transformation unchanged. | **u5.** Close the loop: the definite integral $F_n(\tau) = J_n(L,\tau) - W_n(L,\tau)$. The same conservation law, evaluated between bounds — work and impulse, balanced. The force has been rotated perpendicular. |
| **d2.** Expand into the wave solutions: $\psi_1(M_1,M_2)$, $\psi_2(M_2,M_1)$ — the complex exponentials the conserved quantity demands. | The solution carries a complex $i$, born of relative directions and relative velocities. $i$ means rotation: a hidden phasor is present. | **u4.** Second time integral: $X_n(t) = \int_0^t F_n(t')\,dt'$. Displacement accumulates in the second time dimension — the wobble, the trajectory. |
| **d3.** Differentiate in the mass coordinates: $\frac{\partial\psi_n}{\partial M_m} = \pm i(k,\omega)\psi_n$. Absolute phase is stripped; only the local response remains. | Every $+i$ is matched by a $-i$. The symmetry is visible, and the relative phases are untouched. | **u3.** First time integral: $F_n(t) = J_n(L,t) - W_n(L,t)$. The whole spatial line collapsed to one number per instant — the net released impulse. The 90° rotation happens here: radial in, perpendicular out. |
| **d4.** Contract space and time via $v = f\lambda$. Write $t$ in terms of $\lambda$ — a limit over the linear relative motion, fixed by the boundary conditions $m_1$, $m_2$. | Space and time can always be contracted this way: one written in terms of the other. That contractibility *is* the phasor, deconstructed. A limit taken quietly counts as a derivative. | **u2.** Evaluate at the boundary: $W_n(L,t)$, $J_n(L,t)$. The accumulated line, read at its far end, one value per instant. |
| **d5.** Ground out: $L_n = PE_n - KE_n = 0$. No space, no time — only $m_1$ and $m_2$. | The equation equals zero and the symmetry is restored. The bottom is found: nothing left to remove. | **u1.** Integrate over space: $W_n = \int_0^L \mathrm{Re}(\psi_n)\,d\lambda_n$, $J_n = \int_0^L \mathrm{Im}(\psi_n)\,d\lambda_n$. Work and impulse accumulate along the line. |

**Bottom of the stack:** $L_n = PE_n - KE_n = 0$ — the Lagrangian ground floor, depending only on $m_1$ and $m_2$.

The arrows say the method: ↓ differentiate down, ↑ integrate up. The middle column says why it worked.

---

## 3. Facts and takeaways

**The indicators.** Four signs, known in advance, that the stack was the right shape:

1. **A conservation law.** We started with one — something had to be carried through every transformation unchanged, or there was no stack to climb.
2. **A limit acting as a derivative.** The Lagrangian with its boundary conditions ($m_1$, $m_2$) took a limit — the wavelength-for-velocity limit over linear relative motion — and the limit reduced a variable exactly the way a derivative would.
3. **The dimension count from Kepler.** $T^2 \propto a^3$ gives $2 + 3 = 5$: three of space, two of time. And space and time dimensions can always be contracted by $v = f\lambda$, one written in terms of the other — which indicates a phasor.
4. **The $i$ in the solution.** Relative directions and relative velocities put the imaginary unit in the answer. $i$ indicates rotation.

Given all four, the outcome was nearly forced: integrate back up the other side, and the symmetry guarantees a phasor there too — hence the complex exponential.

**Coherence.** The information stays coherent the whole way down and back up because the relative phases never change. Every operation on the trip — differentiation, contraction, integration — multiplies all components by the same phase factor. Absolute phase shifts; relative phase is invariant. The signal that returns is the signal that left, rotated but intact.

**Which level rotates, and why.** Every integration is a quarter-turn: integrating $e^{i\phi}$ multiplies by $1/i = -i$, a 90° rotation in the complex plane. Five integrations make $5 \times 90° = 450° \equiv 90°$ — an odd number of quarter-turns nets a single quarter-turn. That is why the force that went down radial comes back perpendicular: the arithmetic of the stack leaves one unmatched rotation. The rotation is concentrated on the ascent, at the time-integration levels (u3, u4), where the phasor — the hidden time dimension — does the turning.

**The frequency connection.** The phasor's rotation rate is tied to mass by the Planck–Einstein relation, $\omega_n = 2\pi M_n c^2/h$. Frequency is mass-energy per quantum of action: the faster the phasor turns, the more massive the body. The $i$ tells you there is rotation; $\omega_n$ tells you how fast, and it is mass all the way down.

**The symmetry.** At the bottom, $L_n = 0$ with every $+i$ matched by a $-i$ — the symmetry restored. At the top, $d\psi_s = 0$ — the same statement in differential form. At the return, $F_n = J_n - W_n$ — the same statement as a definite integral. Three writings of one fact: inertia is conserved.

**Alternation.** Down and up, the operations alternate over space and time — but the bottom level depends on neither. It depends only on $m_1$ and $m_2$. Space and time are the scaffolding the stack is climbed on; the ground floor is pure boundary condition.

---

## 4. Layer by layer

What follows is each layer as its own section, stated generally enough to lift off this particular wave equation.

### a. The conservation law (top)

Every stack starts with an invariant: a quantity the system cannot create or destroy. Here it is inertia-energy, $d\psi_s = 0$. The general form: **name what is conserved before you touch anything else.** The conservation law is both the entry point and the acceptance test — the trip is over when it reappears.

### b. The wave equation

The conserved quantity, expanded into the waves that carry it: $\psi_1$, $\psi₂$, counter-propagating, complex. The general form: **the invariant's solutions are waves.** If the solution carries an $i$ born of relative motion, a phasor is hiding in it — expect rotation.

### c. The local response (gradients)

Differentiate in the coordinates: $\partial\psi_n/\partial M_m = \pm i(k,\omega)\psi_n$. Absolute phase drops out; what remains is how each point responds to its neighbors — the symmetry made local. The general form: **differentiate until only the local symmetry is left.** This is the level the simulation's Derivatives tab lives on.

### d. The contraction (limit)

Write one coordinate in terms of another: $t$ in terms of $\lambda$ via $v = f\lambda$. A limit over linear motion, fixed by boundary conditions, does the work of a derivative — one variable fewer. The general form: **find the dispersion relation and spend it.** Any relation of the form (rate) = (frequency)×(wavelength) is a phasor being deconstructed; using it is the way down.

### e. The ground floor

$L_n = PE_n - KE_n = 0$. No space, no time — only the boundary conditions $m_1$, $m_2$, and the symmetry restored. The general form: **the bottom is where the equation equals zero and depends only on boundary conditions.** If it still mentions space or time, keep differentiating.

### f. Accumulation over space (first way up)

$W_n$, $J_n = \int \psi_n\,d\lambda_n$. Integrate over the contracted coordinate; the wave becomes its own accumulation — work, impulse. The general form: **integrate over each contracted coordinate once.** Accumulation is the inverse of the contraction in (d).

### g. Collapse and the first time integral

Evaluate at the boundary, then integrate over the phasor's time: $F_n(t) = J_n(L,t) - W_n(L,t)$. The whole line becomes one number per instant, and the quarter-turns begin to compose. The general form: **collapse the spatial accumulation, then integrate over the hidden time.** This is the level where rotation enters — the force changes direction here.

### h. The second time integral

$X_n(t) = \int_0^t F_n(t')\,dt'$. Integrate over the second time dimension and motion appears: displacement, the wobble, the trajectory. The general form: **the second time dimension is where motion lives.** One time dimension rotates the phase; the other accumulates the result into movement. For every spatial dimension, two of time.

### i. Closure (top, returned)

$F_n(\tau) = J_n(L,\tau) - W_n(L,\tau)$, the definite integral — the conservation law of (a), evaluated between bounds, with the force now perpendicular to the direction it started. The general form: **the trip ends when the invariant reappears as a definite integral.** If it doesn't reappear, a level was skipped.

---

## 5. The abstracted stack

At its finest level, the quantum tech stack is this:

1. **Invariant** — name the conserved quantity.
2. **Wave** — expand it into the waves that carry it; read the $i$ as rotation.
3. **Gradient** — differentiate to the local symmetry.
4. **Contraction** — spend the dispersion relation; let a limit do a derivative's work.
5. **Ground** — reach zero in boundary conditions only.
6. **Accumulate** — integrate back over each contracted coordinate.
7. **Rotate** — integrate over the hidden time; let the quarter-turns compose.
8. **Move** — integrate over the second time; read off the trajectory.
9. **Close** — recover the invariant as a definite integral.

Any conservation law with wave solutions and a dispersion relation can be run through it. Other forms of the stack are possible — different dispersion relations contract different coordinates, and a different count of integrations nets a different rotation — but the shape is the same: down by differentiation and limits, up by integration, odd turns netting a rotation, closure by definite integral.

---

## 6. Conclusion: what the rotation means

The open question is what the fifth dimension — and the second time dimension generally — *is*. Three readings are on the table.

**Merely symbolic.** The dimensions are bookkeeping: repeated integration over time and space produces the formal structure of extra dimensions, and the 90° rotation is just what an odd number of integrations does to a phasor. Nothing "goes" anywhere; the force changes direction because the mathematics of accumulation turns it.

**Actually visited.** The information genuinely enters another dimension, rotates there, and comes back out — the signal from gravity transferring into a different direction by passing through a direction we don't move in. The coherence of the signal (relative phases unchanged) is then evidence: something preserved it *through* the rotation, the way a fiber preserves polarization.

**Both.** The mathematics is the trace left by the passage — symbolic because we only see the trace, real because the trace is so clean.

The applications follow whichever reading is right. If the rotation is real, the stack is a machine for turning forces: feed a signal in along one direction, run it down to the ground floor and back up, and collect it pointing somewhere it could never have pointed on its own — gravity in, perpendicular force out. That is already what the simulation does to produce the wobble from the radial pull. Whether it can be pushed further — signals sent *into* another dimension and recovered, rather than merely turned within the ones we have — is the experiment this stack is waiting for.

What is certain is the coherence. Down five levels and back up, through contraction and limits and five quarter-turns, the relative phases never change. Whatever the dimensions are, the information survives them. A signal that can be rotated through another dimension and come back intact is a signal that can be *sent*.
