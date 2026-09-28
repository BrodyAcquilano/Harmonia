# Decay and Amplitude: Finishing the Wave Equation

*Companion to "Symmetric Inertia Transfer" and "Lambda Derivation." Those two notes derive the form of the inertia waves and the structural wavelengths. This note picks up where they stop: the exponential decay and the amplitudes were never derived there. The equation as derived had neither — the waves rang forever, lossless, and their amplitudes sat as undetermined constants. Both were added afterward, by hand. This is the honest account of where they came from, and the math that now fixes them.*

---

## 1. What the derivation gave — and what it didn't

The first two notes end with the fundamental waves:

$$
W_1(M_1,M_2) = A_1 e^{i(k_1 M_1 - \omega_1 M_2)}
$$

$$
W_2(M_2,M_1) = A_2 e^{i(k_2 M_2 - \omega_2 M_1)}
$$

They gave the *form*: two reciprocal complex exponentials, the masses themselves as coordinates, the phase structure, the symmetry of the derivatives. What they did not give was the *envelope*: nothing said how fast the wave should die away with distance, and nothing fixed $A_1$ and $A_2$.

The intuition that carried the derivation that far is worth restating, because everything in this note stands on it. Start from the Hamiltonian — the total energy of the system — and deconstruct it by taking derivatives, removing variables one at a time, until nothing remains but the fundamental conservation law of inertia: the equation that equals zero. That stripping-down is a contraction in the tensor sense, or near enough that the analogy holds: each derivative sums away a degree of freedom the system does not independently possess, until only the conserved quantity is left.

What made the contraction possible was spotting the symmetry *inside* the Hamiltonian before differentiating. Energy and mass are opposites in the relativistic sense: energy is timelike inertia, mass is spacelike inertia, and inertia as a whole has to be conserved — which meant the derivatives had to come in symmetric pairs, every $+i$ matched by a $-i$. Once that was seen, the ratios did the rest. Einstein gives $E = mc^2$ and $E = hf$; de Broglie gives $\lambda = h/p$; with $v = \lambda f$ they fix the ratios between energy, mass, wavelength, and frequency with no freedom left over. Time dilation then did the quiet work: a moving clock runs slow, which is the same as saying position is measured in wavelengths — $x$, or $h$, or whatever anyone wants to call it, is actually wavelengths, and $t$ can be eliminated through $v = \lambda f$. So position and time could both be rewritten as functions of $m_1$ and $m_2$: writing the energy through Einstein's relations made the symmetry visible, the free variables collapsed, and the contraction went through. The final derivative itself was never known in advance — only the ratios were, and the ratios were enough.

There is a postscript to the intuition, learned after the fact. The amplitudes and the decay *could* be fixed afterward because the boundary conditions were always known: each wave leaves its own mass at full strength, and it must converge at the far end — a decaying wave over a finite span with a known rate has no freedom left. Start conditions, end conditions, rate of decay: with all three known, the values converge, and the envelope is forced.

And there is a suspicion about the contraction itself — the move of writing variables in terms of other variables. It may have been a limit taken without realizing it: a derivative over a finite space, which works because the relative motion is linear. The limit just happened, quietly, and counted as a derivative. The cleanest candidate is the difference in lambdas: with linear relative motion the limit is simple — wavelength for velocity — and it is fixed entirely by the boundary conditions, which are $m_1$ and $m_2$. Whether it was proportionality all the way down or a quiet limit at one step, the wavelength-for-velocity limit with known endpoints did the work.

One more thing, also learned after the fact. Waves have hidden phasors when you integrate them — but the phasor was already in the Hamiltonian before any integration happened. It went unrecognized at the time: using Einstein's and de Broglie's equations to relate space and time through $v = f\lambda$ *was* the deconstruction of the phasor, performed on the way down the stack without naming it. The phasor was being taken apart before the wave was ever written down.

## 2. Guessing the form

With the conservation law in hand, the way back up was integration, alternating space and time — the ladder the Kepler note describes. But the *form* of the wave, the complex exponential itself, was not derived. It was recognized.

The recognition came from electronics. A transmission line — the telegrapher's equations — gives voltage and current as coupled first-order equations in space and time, and their solutions are complex exponentials: oscillation with a possible decay envelope, the $i$ rotating between the two coupled quantities exactly the way the real and imaginary parts of the inertia wave rotate between spatial and temporal inertia. The inertia equations had the same coupled structure, so they deserved the same solution. It was an educated guess, and the appearance of the complex $i$ in the derivation's intermediate steps was the confirmation: the $i$ was already there, hiding in the ratios, before the guess was made. Many natural processes are governed by differential equations with the same exponential or complex-exponential solutions; this was one more of them.

Two deliberate swaps turned the transmission-line form into the inertia-wave form. First, $x$ and $t$ were traded for mass: the coordinates became $M_1$ and $M_2$ themselves — $M_1$ the spatial coordinate of $W_1$, $M_2$ its temporal coordinate, the roles reversed for $W_2$. Second, the masses were swapped between the equations: $W_1$ reads $(M_1, M_2)$ while $W_2$ reads $(M_2, M_1)$, so each wave carries its own mass as space and the companion's as time. With those swaps, differentiating the guessed form reproduced the fundamental building block — the symmetric derivative pairs — and the guess closed into a derivation. From there it could be integrated back up, and the perpendicular application of the force fell out the far end.

## 3. Adding the decay

The guess had no decay, and that was luck, not physics: the telegrapher's equations *have* a decay term — the line loses energy to resistance — and the inertia waves were written down without one. It was added because nothing acting over a distance keeps all of its energy. Dissipation is exponential, always: each slice of distance takes its proportional cut, and proportional cutting is the exponential.

So each wave got its envelope, decaying away from its source. $\psi_1$ is emitted at body 1 ($\lambda_n = 0$) and fades toward $+\lambda_n$; $\psi_2$ is emitted at body 2 ($\lambda_n = L$) and fades toward $-\lambda_n$:

$$
\psi_1 = A_1 e^{-\beta\lambda_n} e^{i(k_1\lambda_n - \omega_1 M_2 \tau)}
$$

$$
\psi_2 = A_2 e^{-\beta(L-\lambda_n)} e^{i(-k_2\lambda_n - \omega_2 M_1 \tau)}
$$

with

$$
\beta = \frac{|M_1 - M_2|}{M_1 + M_2}
$$

The form of $\beta$ is the asymmetry made quantitative. Equal masses give $\beta = 0$ — the symmetric case, lossless, both waves pure sinusoids. The more lopsided the pair, the harder each wave decays toward the other. It is the same $\beta$ that tilts the envelopes in the simulation, and the same normalized difference that sets the orbital eccentricity $e$ in the Motion tab. One number, three jobs: decay rate, envelope tilt, orbital shape.

There is a physical reason the decay had to be there, beyond the electronics analogy. A wave that never decays carries infinite energy — integrate a pure sinusoid over all space and the integral does not converge. Photons are the cleanest example: they arrive in discrete, finite packets precisely because their waves decay and close off. Quantization *is* decay, seen from the energy side. The inertia waves needed the same finiteness, so they got the same envelope.

## 4. The amplitudes

With decay in place, the last undetermined piece was the scale: $A_1$ and $A_2$. These were solved the relativistic way — not from absolute units but from ratios, the same way the rest of the derivation worked.

The simulation samples the wave over the span $L = 4\pi$: two full wavelengths at the normalized $k_1 = 1$, the smallest window that shows the oscillation and its structure together. That window is one segment of a repeating, decaying train, and its boundary conditions are known: each wave leaves its own body's end at full strength and arrives at the far end diminished by $e^{-\beta L}$. Within such a segment the absolute scale is unknowable and unnecessary; what matters is the *ratio* of the amplitudes — the harmony between the two waves, in Kepler's language.

The ratio comes from the conservation law, applied to the finished form. Demand that the total differential vanish — $d\psi_s = 0$, inertia conserved — and read it through the mass derivatives:

$$
\frac{\partial\psi_1}{\partial M_1} + \frac{\partial\psi_2}{\partial M_1} = ik_1\psi_1 - i\omega_2\psi_2 = 0
$$

At matched phase this gives $k_1 A_1 = \omega_2 A_2$. The symmetry condition of the theory is $k_1 k_2 = \omega_1 \omega_2$, and with the display normalization $k_1 = \omega_1 = 1$ and the wavelength ratio $k_2/k_1 = \sqrt{M_2/M_1}$:

$$
\frac{A_1}{A_2} = \frac{\omega_2}{k_1} = k_2 = \sqrt{\frac{M_2}{M_1}}
$$

Probability-style normalization, $|A_1|^2 + |A_2|^2 = 1$, then fixes the scale:

$$
A_1 = \sqrt{\frac{M_2}{M_1+M_2}}, \qquad A_2 = \sqrt{\frac{M_1}{M_1+M_2}}
$$

Note the cross-coupling: $A_1$, body 1's amplitude, is set by $M_2$, the companion's mass — and vice versa. Each wave's strength is fixed by the other body. The reciprocal structure runs all the way down.

This is also where the standing waves enter. The summed field $\psi_s = \psi_1 + \psi_2$ is two counter-propagating decaying waves superposed: a standing-wave structure with nodes where they cancel. The balance point $\lambda^*$ is the mass-weighted node of that structure — the negotiation point of the mutual pull, the same point the lever arms balance on. Only certain ratios lock stably into that structure; the rest beat against each other and wash out. Those stable ratios are the harmonies — integer relations between the waves, the music Kepler was chasing in *Harmonices Mundi*, now sitting inside the amplitude ratio $A_1/A_2 = \sqrt{M_2/M_1}$.

## 5. The chain rule, revisited

Now that the form of the equations is understood, the amplitude problem can be redone as a chain-rule computation — and this is the general version of what §4 did in the display normalization.

The mass derivatives $\partial\psi_n/\partial M_m$ are themselves chain rules: the phase depends on mass directly, as a coordinate, and indirectly, through $k_n$ and $\omega_n$, which are functions of the masses via the wavelength relations. Write the total differential and expand every partial through its chain:

$$
d\psi_s = \left(\frac{\partial\psi_1}{\partial M_1} + \frac{\partial\psi_2}{\partial M_1}\right)dM_1 + \left(\frac{\partial\psi_1}{\partial M_2} + \frac{\partial\psi_2}{\partial M_2}\right)dM_2 = 0
$$

$$
\frac{\partial\psi_1}{\partial M_1} = \frac{\partial\psi_1}{\partial\phi_1}\frac{\partial\phi_1}{\partial k_1}\frac{dk_1}{dM_1} + \cdots
$$

The amplitude ratio is whatever the chains require for the two bracketed sums to vanish independently — the condition that every path by which $M_1$ can move the field is cancelled by a matching path. In the display normalization the chains collapse to the simple $k_1 A_1 = \omega_2 A_2$ of §4. But the chain form is the honest general statement, and it is the route by which $A_1$ and $A_2$ would be re-solved if the model ever leaves the display normalization — with physical wavenumbers $k_n = 2\pi/\lambda_n$ and Planck–Einstein frequencies $\omega_n = 2\pi M_n c^2/h$, the chains lengthen but the requirement is unchanged: the total differential must vanish, and the amplitudes are whatever makes it vanish.

## 6. Conclusion: the finished equations

The complete wave, as simulated:

$$
\psi_1(\lambda_n,\tau) = A_1 e^{-\beta\lambda_n} e^{i(k_1\lambda_n - \omega_1 M_2\tau)}
$$

$$
\psi_2(\lambda_n,\tau) = A_2 e^{-\beta(L-\lambda_n)} e^{i(-k_2\lambda_n - \omega_2 M_1\tau)}
$$

Every symbol, and how to solve for it:

- **$M_1, M_2$** — the two masses. Display units; only the ratio matters, the absolute scale drops out.
- **$\lambda_n$** — the spatial coordinate along the line between the bodies, $0$ to $L$.
- **$\tau$** — the phasor clock: a knob for the phase angle, not for either mass.
- **$L = 4\pi$** — the span. Chosen as the sampling window: two full wavelengths at $k_1 = 1$, one segment of the repeating decaying train.
- **$k_1 = 1$, $\omega_1 = 1$** — display normalization: unit phase velocity. (Physical form: $k_n = 2\pi/\lambda_n$, $\omega_n = 2\pi M_n c^2/h$.)
- **$k_2 = \sqrt{M_2/M_1}$** — from the wavelength ratio $|\lambda_2|/|\lambda_1| = \sqrt{M_1/M_2}$.
- **$\omega_2 = k_1 k_2/\omega_1$** — from the symmetry condition $k_1 k_2 = \omega_1 \omega_2$.
- **$\beta = |M_1-M_2|/(M_1+M_2)$** — the decay rate, from the mass asymmetry. Zero when the masses are equal: the symmetric case is lossless. Also the envelope tilt and the orbital eccentricity.
- **$A_1 = \sqrt{M_2/(M_1+M_2)}$, $A_2 = \sqrt{M_1/(M_1+M_2)}$** — from the vanishing total differential ($k_1A_1 = \omega_2A_2$ at matched phase) plus $|A_1|^2+|A_2|^2 = 1$. Cross-coupled: each amplitude is set by the companion mass.
- **$\lambda^* = L\,M_2/(M_1+M_2)$** — the balance point, the mass-weighted node: $M_1\lambda^* = M_2(L-\lambda^*)$.

The derivation gave the form. Electronics gave the guess its confidence. Exponential decay made the energy finite. The conservation law, read through the chain rule, fixed the amplitudes. What remains undetermined is nothing structural — only the absolute scale, which the theory, being a theory of ratios, never needed.
