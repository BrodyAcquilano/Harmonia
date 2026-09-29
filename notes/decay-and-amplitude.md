# Decay and Amplitude: A Worked Example of the Stack

*This note is a worked example of the gravitational tech stack: deriving the decay and the amplitudes step by step, in order, with the actual math. The stack note describes the machine; this note runs it. Read the stack note first if the level names (d1–d5, u1–u5) are unfamiliar.*

---

## Table of Contents

- [1. What the derivation owes us](#1-what-the-derivation-owes-us)
- [2. Decay: exponential dissipation and finite energy](#2-decay-exponential-dissipation-and-finite-energy)
- [3. Amplitude: the stack's integration constant](#3-amplitude-the-stacks-integration-constant)
- [4. The worked example: decay and amplitude through the stack](#4-the-worked-example-decay-and-amplitude-through-the-stack)
- [5. Standing waves, nodes, and harmonies](#5-standing-waves-nodes-and-harmonies)
- [6. Every symbol, and the level that fixes it](#6-every-symbol-and-the-level-that-fixes-it)


## 1. What the derivation owes us

The wave form is

$$
\psi_n = A_n e^{-\beta x_n} e^{i\phi_n}
$$

Three pieces: an amplitude $A_n$, a decay envelope $e^{-\beta x_n}$, and a phase $e^{i\phi_n}$. The phase was derived — it falls out of the symmetry. The other two were not. So the stack owes us two computations:

1. **The decay rate** $\beta$: how fast the wave dies with distance, and why it dies at all.
2. **The amplitude** $A_n$: the absolute scale, fixed — not chosen.

What the Wave Lab shows is a window onto these values, not the values themselves: it samples $\lambda_n$ over $0$ to $4\pi$ and normalizes $|A_1|^2 + |A_2|^2 = 1$, so only ratios are visible. §4 below gives the true computation; §5 explains the window.

---

## 2. Decay: exponential dissipation and finite energy

Nothing acting over a distance keeps all of its energy. Each slice of distance takes its proportional cut, and proportional cutting is the exponential — this is the same decay in the telegrapher's equations, where the transmission line loses energy to resistance. A coupled first-order system in space and time gives complex exponentials *with* envelopes; the inertia waves are that system in mass coordinates, so they get the envelope too.

Each wave decays away from its source. $\psi_1$ is emitted at body 1 ($\lambda_n = 0$) and fades toward $+\lambda_n$; $\psi_2$ is emitted at body 2 ($\lambda_n = L$) and fades toward $-\lambda_n$:

$$
\psi_1 = A_1 e^{-\beta\lambda_n} e^{i(k_1\lambda_n - \omega_1 M_2 \tau)}, \qquad \psi_2 = A_2 e^{-\beta(L-\lambda_n)} e^{i(-k_2\lambda_n - \omega_2 M_1 \tau)}
$$

with

$$
\beta = \frac{|M_1 - M_2|}{M_1 + M_2}
$$

$\beta$ is the boundary asymmetry made quantitative, and it comes from the ground floor of the stack (d5): the only data left there are the boundary conditions $m_1$, $m_2$, so the decay rate can only be built from them. Equal masses give $\beta = 0$ — the symmetric case, lossless. The more lopsided the pair, the harder each wave decays toward the other. It is the same $\beta$ that tilts the envelopes in the simulation and the same normalized difference that sets the orbital eccentricity in the Motion tab.

The decay is what makes the energy finite, and finiteness is what makes the amplitude computable. The energy carried by wave $n$ is the integral of $|\psi_n|^2$ over its line of travel:

$$
E_n = \int_0^{\infty} A_n^2 e^{-2\beta x}\,dx = \frac{A_n^2}{2\beta}, \qquad \beta > 0
$$

This converges if and only if $\beta > 0$ — the decay is the convergence. A pure sinusoid ($\beta = 0$) integrated over all space diverges: infinite energy, amplitude unfixable. Photons are the physical precedent: they arrive in discrete, finite packets precisely because their waves decay and close off. Quantization is decay, seen from the energy side.

---

## 3. Amplitude: the stack's integration constant

### 3a. Why the descent cannot see it

Differentiate $\psi_n = A_n e^{-\beta x_n} e^{i\phi_n}$ with respect to any mass coordinate: $A_n$ is a constant factor, so $dA_n/dM_m = 0$ and it rides through every gradient untouched. Contract via $v = f\lambda$ and $\omega \propto k$: $A_n$ is still there, still untouched. Ground out at the mass proportions, no independent variable left: $A_n$ is gone from the equations entirely.

This is not a failure of the derivation. It is what constants do. The descent differentiates, and differentiation kills constants — the amplitude's information is not destroyed, it is *held by the boundary conditions*, waiting at the bottom while the phase structure goes through the stack. It returns on the ascent as the undetermined constant of integration, and the closure — the definite integral evaluated between known bounds — is what fixes it.

### 3b. The computation

Three facts, each from a different level of the stack:

**The envelope integral (u1–u2).** From §2, the energy in wave $n$ is $E_n = A_n^2/(2\beta)$.

**The ratio (d3, via the chain rule).** Demand the total differential vanish — $d\psi_s = 0$, inertia conserved — and read it through the mass derivatives:

$$
\frac{\partial\psi_1}{\partial M_1} + \frac{\partial\psi_2}{\partial M_1} = ik_1\psi_1 - i\omega_2\psi_2 = 0
$$

At matched phase, $k_1 A_1 = \omega_2 A_2$. With the symmetry condition $k_1 k_2 = \omega_1 \omega_2$ and the wavelength ratio $k_2/k_1 = \sqrt{M_2/M_1}$:

$$
\frac{A_1^2}{A_2^2} = \frac{M_2}{M_1}, \qquad\text{hence}\qquad \frac{E_1}{E_2} = \frac{M_2}{M_1}
$$

Note the cross-coupling: body 1's amplitude is set by body 2's mass. Each wave's strength is fixed by the companion — the reciprocal structure runs all the way down.

**The budget (d1).** The Hamiltonian only rotates its energy — what goes in comes out. Total energy is the invariant the whole stack carries:

$$
E_1 + E_2 = E_{\text{total}}
$$

Solve the three together:

$$
E_1 = E_{\text{total}}\frac{M_2}{M_1+M_2}, \qquad E_2 = E_{\text{total}}\frac{M_1}{M_1+M_2}
$$

$$
A_1 = \sqrt{2\beta E_{\text{total}}\,\frac{M_2}{M_1+M_2}}, \qquad A_2 = \sqrt{2\beta E_{\text{total}}\,\frac{M_1}{M_1+M_2}}
$$

That is the true amplitude: envelope integral, symmetry ratio, energy budget. No guessing.

### 3c. The chain rule in reverse

Why this is trustworthy: the descent applies $D = d/dM$ (chained through the phase), and the ascent applies $D^{-1} = \int dM$ — the same operations, the same variables, in reverse order. $D^{-1}D$ is the identity on everything the chain touched, and the only things it didn't touch are the constants. So the constant fixed at closure *is* the constant that was there at the start. By symmetry, the values at the bottom are known from the values at either end of the chain. You can find $A$ any time you want: evaluate the definite integral.

### 3d. The edge case that proves it

When $\beta = 0$ (equal masses), the envelope integral diverges and the computation above has nothing to grip — the symmetric case genuinely does not fix its own amplitude. That is why the Wave Lab normalizes by convention: $|A_1|^2 + |A_2|^2 = 1$, probability-style. The convention is not arbitrary either — it corresponds to the energy budget $E_{\text{total}} = 1/(2\beta)$, the finite total the waves would carry. For every $\beta > 0$, though, the amplitude is physical, not conventional: pick the system's energy scale for $E_{\text{total}}$ and $A_n$ follows.

---

## 4. The worked example: decay and amplitude through the stack

| Level | What happens to decay and amplitude |
|---|---|
| **d1.** First limit: energy conserved by the boundary conditions | The rate of change of energy over the boundary, with respect to time. Total energy $E_{\text{total}}$ enters here — it is the budget that will fix $A_n$ at the end. Nothing yet about decay. |
| **d2.** Frequency–velocity limit: $v = f\lambda$ | One spatial variable contracted. The wave form is not yet written — only the relation its phase will obey. |
| **d3.** Time differentiation: $\partial\psi_n/\partial M_m$ | $A_n$ passes through untouched ($dA_n/dM_m = 0$). The chain rule gives the ratio $A_1^2/A_2^2 = M_2/M_1$ at matched phase — the $i$ drops out of the ratio. |
| **d4.** Second space limit: $\omega \propto k$ | The dispersion collapses to a proportionality; one $\lambda$ left. $A_n$ still untouched. |
| **d5.** Ground: mass proportions, no independent variable | $A_n$ vanishes from the equations. Its information is held by the boundary conditions $m_1$, $m_2$ — and those same proportions dictate $\beta = \|M_1-M_2\|/(M_1+M_2)$. |
| **Turn.** Solve the bottom DE | The stack says the solution is a time- and space-dependent wave: $\psi_1$, $\psi_2$ written; $A_n$ enters as a multiplicative constant, $dA_n/dM_m = 0$. |
| **u1.** Space integrals: $W_n$, $J_n$ | $A_n$ returns as the unknown scale of the accumulation. The envelope $e^{-\beta x}$ is integrated: $\int e^{-2\beta x}dx = 1/(2\beta)$. |
| **u2.** Boundary evaluation | The line collapses to its endpoints — start conditions (full strength at the source) and end conditions (decayed by $e^{-\beta L}$) are read off. |
| **u3–u4.** Time integrals: $F_n$, $X_n$ | $A_n$ rides along, still undetermined, through the rotation and the wobble. |
| **u5.** Closure: $F_n(\tau) = J_n(L,\tau) - W_n(L,\tau)$ | The definite integral is evaluated between the known bounds. Envelope integral + symmetry ratio + energy budget: $A_n$ is solved. The stack hands back everything it was owed. |

---

## 5. Standing waves, nodes, and harmonies

The summed field $\psi_s = \psi_1 + \psi_2$ is two counter-propagating decaying waves superposed: a standing-wave structure with nodes where they cancel. The balance point $\lambda^*$ is the mass-weighted node of that structure — the negotiation point of the mutual pull, where the lever arms balance ($M_1\lambda^* = M_2(L-\lambda^*)$). Only certain ratios lock stably into the structure; the rest beat against each other and wash out. Those stable ratios are the harmonies — the integer relations Kepler was chasing in *Harmonices Mundi*, now sitting inside $A_1/A_2 = \sqrt{M_2/M_1}$.

---

## 6. Every symbol, and the level that fixes it

- **$M_1, M_2$** — the masses; boundary conditions. Fixed at **d5** (the only data at the ground floor). Display units; only the ratio matters.
- **$\lambda_n$** — spatial coordinate, $0$ to $L$. Contracted at **d2** and **d4** (the space limits); restored on the ascent.
- **$\tau$** — the phasor clock. Fixed at **d3** (the $i$ in the phase gradients).
- **$L = 4\pi$** — the span: the Wave Lab's sampling window, two wavelengths at $k_1 = 1$. A display choice (§5 of this note), not a derived quantity.
- **$k_1 = 1$, $\omega_1 = 1$** — display normalization, unit phase velocity. (Physical: $k_n = 2\pi/\lambda_n$, $\omega_n = 2\pi M_n c^2/h$.)
- **$k_2 = \sqrt{M_2/M_1}$** — fixed at **d5** (mass proportions).
- **$\omega_2 = k_1k_2/\omega_1$** — fixed at **d4** (chain-rule ratios, $\omega \propto k$).
- **$\beta = |M_1-M_2|/(M_1+M_2)$** — fixed at **d5**, from the boundary asymmetry. Three jobs: decay rate, envelope tilt, orbital eccentricity.
- **$A_1, A_2$** — fixed at **u5**, by envelope integral + symmetry ratio + energy budget: $A_n = \sqrt{2\beta E_{\text{total}}\,M_{\text{companion}}/(M_1+M_2)}$. Cross-coupled: each set by the companion mass.
- **$\lambda^* = L\,M_2/(M_1+M_2)$** — the balance point, the mass-weighted node.

The stack owes nothing it hasn't paid: the phase was derived from the symmetry, the decay from the boundary conditions, and the amplitude — the integration constant of the whole trip — from the definite integral at closure.
