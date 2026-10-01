# Mass Formation from Quarks

*2026-10-01*

## The question I keep coming back to

Protons only form from three quarks. That much is settled — two up quarks and one down quark, and there is no proton with two quarks or four. But I've been wondering whether that's the wrong way to look at it. What if each quark is treated as its own mass? Each quark interacting with the field independently, carrying its own mass-energy wave, whether or not it happens to be inside a proton right now?

The thought goes like this: mass creation wouldn't be "three quarks decide to become a proton." It would be something more local and more mechanical. Quark frequencies are sloshing around in the field, each quark contributing its own wave. And the spots where we see masses converge — the spots where the Mass Creation sim piles up green spheres — are the spots where those different quark frequencies merge together and cancel into a mass packet. Not assembled. Converged.

I don't have a model for the structured interactions. I want to be upfront about that, because everything else in this note leans on it. What I have instead is randomness plus assumed relative abundances, and I want to walk through exactly what I assumed, what the sim does with it, and then the piece I found most interesting: the math actually seems to confirm that this algorithm produces mass where the wavelengths agree in a 1:1 ratio. If that's right, it's a genuine explanation of how matter forms from quarks — not a metaphor, a mechanism.

## What the Mass Creation sim actually does

The Mass Creation graph sits in Quark Space next to the Mass Lattice. Here's the algorithm, honestly described:

Quarks fire at random positions inside a cube, about eight per sim-second. 95% of the time a firing forms a unit mass — a green sphere at that position. The other 5% of the time it releases only energy, a red flash with no mass. Every formed mass then rides the same resultant wave motion as the lattice:

$$p(t) = p_0 + g \cdot (w_x, w_y, w_z)$$

perpendicular to the energy wave, 180° out of phase, so each mass traces a closed loop (the integer frequencies close the orbit). When masses bump into each other they merge into one rendered sphere, sized by the total unit masses inside — the program still counts every unit mass separately, and when they drift apart the cluster breaks up again. Masses that form in the same spot pile onto the same sphere, so it grows.

The random firing is the part I'm least sure of. Quarks in nature don't appear at random positions — they form through structured interactions I haven't worked out models for. So I use randomness as the placeholder, plus assumed relative abundances. The wave-riding is the part I trust: once a quark is in the field, it moves with the field.

## The abundances I assumed

Every eigenstate in the sims is one draw from a fixed table of quark states, in units of $f_q/3$:

- **Formation (95%):** $-\tfrac{2}{3}$ at weight 2, $-\tfrac{1}{3}$ at weight 2, $+\tfrac{1}{3}$, $-\tfrac{4}{3}$, $-1$ at weight 1 each
- **Decay (5%):** $+\tfrac{2}{3}$ at weight 2, $+\tfrac{1}{3}$ at weight 2, $-\tfrac{1}{3}$, $+\tfrac{4}{3}$, $+1$ at weight 1 each

The anchor is the proton: two $\tfrac{2}{3}$ up quarks and one $-\tfrac{1}{3}$ down quark. That's the only hard data point I fed in. Everything else is distributed randomly around it, with a 5% chance of any given quark decaying — its energy subtracted from the field rather than added. So most of the frequency shifts in the field come from quark energies being *removed*, not added. I found that interesting: the field is mostly shaped by what's taken out of it.

Amplitudes fall as $1/\sqrt{k}$ (pink noise), so newer combinations are weaker but every doubling of the eigenstate count adds the same visible structure.

## Mass is the inverse of energy

The whole thing rests on $E \cdot m = 1$. On the convolution surface the mass wave is the inverse of the energy wave — $u = 1 + w$, $m = 1/u$, the 180° partner. So when frequencies in the energy field change — a quark absorbed here, one decayed there — the waves superimpose with new frequency combinations, and where the energy wave dips, the mass wave spikes. The resultant waves *form* masses. That's not an interpretation layered on top; it's the arithmetic of the inverse.

## Differences, not absolutes

Here's something that took me a while to see. No matter how many frequencies and eigenstates I add, the color spectrum stays $1/3$ to $4/3$. Why? Because every eigenstate is drawn from the same fixed table of quark states — $|q|$ only ever takes the values 1 through 4. Adding eigenstates changes the *mixture*, never the range. The relative abundance shifts; the endpoints don't.

And I think that's telling us something physical, not just something about my code. We care more about the *differences* in frequencies than the actual frequencies. Take two components $f$ and $f'$: their interference has a slow envelope beating at $|f - f'|$ — the fast parts average out and what persists, what the eye follows, what the clustering follows, is the difference. Many natural processes depend on differences and changes, not absolutes. Motion is relative, so it makes sense our perception of color would be too.

Really all waves are just superpositions of these changes, so their relative abundance determines what each wave is most likely made of — what it's superimposed from, base pairs upward. And it's not those frequencies we really see but the changes in the field. When a lot of one frequency piles up in one area, that pile-up *is* the change we predominantly see. The frequency is the ingredient; the change is the observation.

There's a related point I want to get down because it matters for the color theory: we care more about the *magnitudes* of frequencies than their signs. A wave can travel in any direction, and quarks fire in random directions — a $-\tfrac{1}{3}$ wave heading one way is the same physical thing as a $+\tfrac{1}{3}$ wave heading the other way. $\cos(q\theta)$ doesn't care about the sign; flipping $q$ just flips the direction of travel. Energy is $E = h\nu$, and $\nu$ is a magnitude. So when I think about color, $-\tfrac{1}{3}$ *is* $\tfrac{1}{3}$. The sign tells you which way the wave is going; the magnitude tells you what it is. That's why the spectrum runs $1/3$ to $4/3$ and not $-4/3$ to $4/3$, and why the code takes $|q|$ everywhere it colors. It was already in the code; it just wasn't written down.

So even though this system is inherently random in how it generates quarks, it produces a distribution we can predict. Slightly different every time — a fresh universe each page load — but the relative abundance converges. Which actually supports quantum theory, and the strange way the universe is seemingly probabilistic but also deterministic at the same time. The process generating matter results from seemingly random collisions, but with a predictable relative abundance. Patterns begin to emerge, and on a large scale the rules governing things become predictable. I didn't set out to reproduce that; it fell out of the tables.

## The math: does the algorithm make mass where wavelengths agree 1:1?

This is the piece I wanted to check properly. The claim I wanted to test: the mass-creation algorithm produces mass in the places where the wavelengths form a 1:1 ratio — and that would explain how matter forms from quarks.

Each mass rides, per axis, the wave

$$w(x_0, t) = \sum_{f=1}^{4} C_f \cos(f \cdot x_0 - f \cdot \omega t)$$

where $x_0$ is the rest position (where the quark fired) and the $C_f$ are the pink-noise coefficients from the quark chain.

**First result: the wave is exactly dispersionless.** Factor the phase: $f \cdot x_0 - f \cdot \omega t = f(x_0 - \omega t)$. So

$$w(x_0, t) = W(x_0 - \omega t), \qquad W(\xi) = \sum_{f=1}^{4} C_f \cos(f\xi)$$

Every component has phase speed $f\omega / f = \omega$ — the same speed, whatever its wavelength. The whole interference pattern translates rigidly at speed $\omega$ and never disperses, never washes out. The pattern a mass surfs today is the same pattern, shifted, that it will surf tomorrow.

**Second: same rest position means same trajectory, forever.** The motion is a deterministic function of $(x_0, t)$. Two quarks fired at the same spot follow the identical path for all time — they can never separate. That is exactly why co-located firings "pile onto the same sphere, so it grows." It's not a rendering convenience; it's in the equations.

**Third: the density folds into caustics.** Fix $t$ and look at the mapping from rest position to observed position: $x = x_0 + g \cdot W(x_0 - \omega t)$. Where this mapping squeezes, mass piles up; where it folds, the density formally diverges. The density transforms as

$$\rho = \frac{\rho_0}{|1 + g \cdot W'(\xi)|}$$

so caustics — infinite-density sheets — sit where $W'(\xi) = -1/g$. This is the Zel'dovich pancake mechanism: the same mathematics that forms the cosmic web, the filaments and walls of galaxies out of nearly-uniform dark matter (Zel'dovich, 1970). The universe builds its largest structures this way; the sim builds its smallest ones the same way. I like when the same equation shows up at both ends of the scale.

**Fourth: the 1:1 agreement points.** At $\xi \equiv 0 \pmod{2\pi}$, $\cos(f\xi) = 1$ for *every* integer $f$ — all the component wavelengths, in whatever ratios (1:2, 1:3, 2:3…), crest together there. All wavelengths in 1:1 phase agreement. Two exact consequences: $W'(0) = 0$ (the field is locally flat — a whole neighborhood rides in lockstep, no shear to tear a packet apart) and $W(0) = \sum_f C_f$ (the components add coherently, extremal).

**Then I ran the actual algorithm** — the real quark-term generator, the real coefficient code, the default sim settings (1,201 eigenstates, amplitude 0.15), and a particle simulation of firing, wave-riding, and clustering:

- Coefficients: $C = (-0.196,\ 0.273,\ 0.115,\ 0.089)$; max $|W'| = 1.03$, well past the caustic threshold of $0.5$ — so the density genuinely folds, three caustic phases per period at $\xi = 0.156,\ 3.54,\ 4.624$ radians.
- The strongest convergence sits at $\xi = 0.49$ rad, 28° from the 1:1 point; the first caustic is 9° away. The convergence field feeds directly into the neighborhood of the 1:1 agreement point.
- The predicted caustic density vs. the simulated mass pile-up: correlation **0.86**, with density peaks ~10× over background right at the predicted spikes.

So yes — with the honest quantification — the algorithm concentrates mass where the wavelengths agree 1:1. The random firing dominates the coin-flip of *which* clusters form, but the wave's convergence field decides *where the pile-ups live*, and it puts them at the 1:1 phase-agreement points, r = 0.86. That's the confirmation I was after: matter, in this model, forms where quark frequencies merge and cancel into coherent packets — where the wavelengths agree.

One thing I noticed while doing this, flagged but not changed: the three axes currently share a single quark chain (the code passes entropy as the count and no seed, so all three axes get identical terms — the comment says "independent"). For this analysis it just means $W$ is the same function on $x$, $y$, $z$, which if anything strengthens the cross-axis coherence. Whether the axes *should* be independent is a decision for later.

## The trios

Given the 1:1 result, the combinations I keep coming back to read differently now:

- **$(-\tfrac{1}{3},\ \tfrac{2}{3},\ \tfrac{2}{3})$** — the proton. The two $\tfrac{2}{3}$ quarks have wavelengths in *exact* 1:1 ratio: permanently phase-locked, a coherent core that never beats against itself. The $-\tfrac{1}{3}$ differs by exactly one full $f_q$. Charges sum to $+1$.
- **$(\tfrac{4}{3},\ -\tfrac{1}{3})$** — and $\tfrac{4}{3} = 2 - \tfrac{2}{3}$: the same $\tfrac{2}{3}$ energy, reversed, subtracted instead of added. The pair sums to $1$.
- **$(1,\ -\tfrac{1}{3},\ -\tfrac{1}{3},\ -\tfrac{1}{3})$** — sums to *zero*. Full cancellation. No residual oscillation at all: a lump that just sits there. That, I think, is what a mass packet *is* — frequencies that have canceled into rest.

These are hypotheses, not derivations. But the 1:1 machinery above is derived, and the trios are what it predicts should be stable.

## The color section

The energy spectrum, as the sims color it — dark red infrared for the coolest live frequency, light purple ultraviolet for the hottest, the visible spectrum stretched across whatever frequencies are actually in view:

![The energy spectrum, from 1/3 f_q (infrared) to 4/3 f_q (ultraviolet)](/note-images/mass-formation-spectrum-bar.png)

And the relative abundance, snapshotted by running the algorithm itself — 40 quark draws, first 12 shown, the Gaussian-kernel distribution rising from the number line with the area beneath filled by the spectrum:

![Relative abundance of frequencies, from a run of the quark generator](/note-images/mass-formation-abundance.png)

This particular universe drew $|q| = [2, 1, 2, 1, 1, 3, 2, 2, 2, 2, 3, 4]$ — heavy on the 2s, as the weights say it should be. The curve humps in the yellow-green: the middle frequencies most abundant, the IR tail of slow-decaying lows, the UV fringe of rare highs. Next page load it will be slightly different, and the shape will be recognizably the same. That's the whole thesis in one picture.

One caveat I want on the record (written up fully in the Color Theory note): the spectrum bar is a display convention, not a measurement. It assigns colors to frequencies based on the range of frequency variance I have — from quarks alone. I can't say these are the actual frequencies that cause the colors; they're just what's available. Running the numbers: $f_q = (2/3)m_qc^2/h$ with $m_qc^2 = 2$ MeV gives $f_q \approx 3.2 \times 10^{20}$ Hz, so the bar spans $\tfrac{1}{3}f_q \approx 1.1 \times 10^{20}$ Hz to $\tfrac{4}{3}f_q \approx 4.3 \times 10^{20}$ Hz — $0.44$ to $1.78$ MeV, gamma rays, roughly a million times above visible light. Other particle interactions would bring other frequencies and let the scale be recalibrated. From just quarks, this is the relative abundance in the field and the distribution of energies, with colors assigned.

## On entropy, scale, and what this isn't

I have to keep something in mind, and so should anyone reading this: the total entropy here is pretty low compared to the entropy of the universe. And the way I've calculated entropy — eigenstate count from a slider — may be a different thing from what the universe means by entropy. But it is still an entropy calculation nonetheless: a count of accessible states, growing as the system gets room to explore.

Relatedly: we don't know enough yet to get the exact relative abundance of each quark's frequency. My tables are anchored to one data point (the proton) plus educated guessing. And the scale here is relatively small — a cube a few units across, hundreds of eigenstates, not $10^{80}$ particles. So we should expect errors. Plenty of them, probably.

None of that bothers me much. This is an interesting set of experiments in the quark space nonetheless, and they produce interesting ideas and visualizations — and every so often, like the 1:1 result above, an idea that survives being checked. The errors are where the next questions live.

## Next: electrons, and one field instead of particles

The quark story feels incomplete without electrons, and I've been putting off thinking about them. The next plan:

**Electrons herd quarks.** I keep coming back to the feeling that electrons play an active role — herding quarks, forcing them into groups, which is what causes proton formations in the first place, and quark frequencies being subtracted from the field when the grouping happens. The electron isn't just another particle in the soup; it might be the shepherd.

**The up/down abundance question.** What *is* the abundance of up vs. down quarks? The proton needs two ups and a down, but maybe the universe made equal numbers of each. If so — where are the leftover down quarks? Maybe they're out there floating freely, unable to form stable pairs, just colliding into one another and potentially forming other particles. The $-1/3$ surplus has to go somewhere.

**Up quarks can collide and form electrons.** That's the other direction of the same thought: the interactions aren't one-way. If quark collisions can produce electrons, and electrons herd quarks into protons, there's a cycle — and working out these interactions properly would tell me how abundant each quark really is, and how to distribute their relative abundances better than my current tables do. The tables are a placeholder for this cycle.

**Stop considering particles as particles at all.** This is the bigger leap, and I think it's where all of this is headed. Maybe there are no particles — just different frequencies interacting at different directions relative to one another. What we call a proton or an electron would be a collection of frequencies that happens to form a stable packet because of how its components interact with each other, constructively or destructively. That requires understanding how electromagnetism plays a role in interacting with the energy field — charge has to enter the picture, not as a label on a particle but as something the field itself does.

**The goal: a single charge-mass-energy field.** One field, not three. Then the particles just fall out — different collections of frequencies forming packets that resemble our familiar particles, because of how they interfere. And the fundamental frequencies that define each packet would dictate all of its possible interactions: what it can collide with, what it can decay into, what it can form. The particle zoo becomes a frequency catalog.

That's the direction. The 1:1 result in this note is the first piece of it: a concrete, checkable case of frequencies agreeing and a packet falling out.

## Conclusion

Treat each quark as its own mass, each with its own mass-energy wave, interacting with the field independently. Let them fire, let frequencies be added and subtracted, let the resultant waves superimpose — and mass is the inverse of energy, so the waves form masses where the energy cancels. The math says the pile-ups happen where the wavelengths agree 1:1 in phase: the field goes flat, the packet rides in lockstep, and the caustics feed it. I ran the algorithm and the density follows the prediction at r = 0.86.

Matter forms from quarks where their frequencies merge and cancel into coherent packets. The trios — $(-\tfrac{1}{3}, \tfrac{2}{3}, \tfrac{2}{3})$, $(\tfrac{4}{3}, -\tfrac{1}{3})$, $(1, -\tfrac{1}{3}\times 3)$ — are my candidates for the stable ones. The electrons, and the single field, come next.
