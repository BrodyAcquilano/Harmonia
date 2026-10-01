# Visible Colors as a Result of Amplitude Modulation

*2026-10-01*

*This is a theory, not a result. I'm writing it down because the pieces fit together too neatly to leave as a passing thought, and writing it down is how I find out where it breaks.*

## The gap

The Color Theory note (§10) has the two tables side by side: the four quark states at $1.07$–$4.30 \times 10^{20}$ Hz ($0.44$–$1.78$ MeV, gamma rays), and actual visible light at $4$–$8 \times 10^{14}$ Hz. The violet edge of real vision is still $\sim 136{,}000$ times below the lowest quark frequency. Five orders of magnitude of daylight between them.

So the spectrum bar on the tab is a display convention — honest in ordering, placeholder in absolute terms. That bothered me. If these frequencies are supposed to be the stuff the world is made of, why would the colors we see live a million times below them? Either the colors have nothing to do with these frequencies, or the frequencies we *perceive* aren't the raw ones.

## The Doppler dead end

The first idea I checked was Doppler shift: everything's moving, so maybe we see the quark frequencies shifted by our motion. I ran the numbers before writing anything down, and they don't work — not close.

To drag $1.07 \times 10^{20}$ Hz down to $7.89 \times 10^{14}$ Hz takes a redshift factor of $\sim 7.3 \times 10^{-6}$, a division by $136{,}000$. The actual motions:

- Earth spinning: shifts by $0.0002\%$
- Earth orbiting the Sun ($29.8$ km/s): shifts by $0.01\%$
- The Sun orbiting the galaxy ($220$ km/s): shifts by $0.07\%$
- The Sun against the cosmic microwave background ($370$ km/s): shifts by $0.1\%$

The fastest real motion changes the fourth significant digit. The speed that *would* do it is $\beta = 0.99999999989$ — receding from the source at $99.999999989\%$ of light speed, which is nonsense anyway, since we're made of the stuff we'd be receding from. Gravitational redshift near the Sun is parts per million; planetary gravitational waves are far weaker still. Dead end, honestly reported. The gap isn't motion.

## The reframe: the model never had absolute frequencies

Then it hit me that I'd been asking the wrong question. *Absolute frequency never appears in the simulation.* The convolution surface sums $\cos(q_k \theta)$ with $q_k$ in units of $f_q/3$. Mass Creation rides $\cos(f x_0 - f\omega t)$ with $f$ as the integers $1$ through $4$. The $3.2 \times 10^{20}$ Hz entered only when I imported $m_q c^2 = 2$ MeV to run the comparison — it's my ruler, not the model's.

Multiply every frequency in the sims by any constant and *nothing changes*: the interference patterns, the beats at $|f - f'|$, the caustics, the 1:1 phase agreement, the color ordering. The model is scale-invariant. It only ever knew ratios.

So "the quark frequencies don't match visible light" was never a problem inside the model, because the model never had absolute frequencies to mismatch. The question isn't "why are the frequencies wrong" — it's "what sets the scale, and what does a detector actually read?"

## The proposal: we are demodulators

Here's the theory. Humans evolved *in* this field — the local baseline gravitational field has been the water we've been swimming in for every generation of eyes. What if vision doesn't read absolute frequencies at all, but reads frequencies *relative to the baseline* — the way an AM radio works?

In amplitude modulation, a carrier wave at $f_c$ gets its amplitude varied by the signal, and the receiver mixes the incoming wave with its own local oscillator and keeps only the relative structure. The carrier drops out. The absolute frequency of the station never matters to the music — only the modulation survives demodulation. (This is standard radio engineering: the heterodyne receiver, Armstrong, 1918.)

Apply that here: the baseline field is the carrier — the local oscillator we've been tuned against since before we had eyes. The quark frequencies modulate it. What we perceive as color is the *demodulated* signal: how those frequencies interact with our baseline. Not the raw $10^{20}$ Hz — the relative changes. And then the range on the spectrum bar makes sense: it's not claiming these are the frequencies of light. It's showing the relative positions — coolest-here to hottest-here — which is exactly what a demodulator would report. The ordering is the information; the absolute numbers were never on the table.

This also reframes the sign result from the last note: $-\tfrac{1}{3}$ *is* $\tfrac{1}{3}$ for color, because direction of travel is invisible to an envelope detector. And the differences idea: beats at $|f - f'|$ are precisely what survives demodulation. The pieces I derived separately — sign irrelevance, difference-dominance, scale invariance — are all things a demodulator architecture predicts. That's what made me take the idea seriously: it doesn't add assumptions, it *explains* assumptions I'd already made.

## What would have to be true

A theory has to say what could kill it, so here's the honest accounting.

AM explains why the absolute scale drops out. It does *not* by itself put $10^{14}$ Hz on the table. For literal difference-frequencies $|f_q - f_0|$ to land in the visible band, the baseline $f_0$ would have to sit within $\sim 10^{14}$ Hz of the quark band — tuned to one part in a million — and I have no mechanism for that tuning. That's the fine-tuning objection, and I don't have an answer to it.

I checked the most natural candidate for the baseline: the electron's Compton frequency, $f_e = m_e c^2 / h \approx 1.24 \times 10^{20}$ Hz. It sits *inside* the quark band ($1.07$–$4.30 \times 10^{20}$ Hz) — same decade, which is suggestive given the whole "electrons herd quarks" thread. But the differences $|f_q - f_e|$ still land around $10^{19}$ Hz. Five orders short. So the electron-as-local-oscillator doesn't reach visible light either — unless the relevant baseline isn't a single frequency, which it probably isn't.

Also unknown: whether anything in biology actually demodulates against a gravitational baseline. I don't know that. Nobody does — it's not a thing anyone's looked for, as far as I know. This is the part that's pure speculation, and I'm marking it as such.

## How I'd test it

If the theory is right, several things follow:

1. **Color ordering tracks energy ordering, always.** Whatever the absolute scale, cooler-to-hotter maps to red-to-blue. The sims already do this. Any recalibration (new particles, new frequencies) must preserve it.
2. **Ratios survive any shift.** Doppler, gravitational redshift, baseline drift — all multiplicative, so the 1:2:3:4 structure and the beat relationships are indestructible. A theory in which only ratios matter predicts that ratios are what's conserved, and they are.
3. **A baseline shift moves all colors together.** If the local baseline ever changed, every perceived color would shift in lockstep, preserving their relationships. That's a prediction in principle, even if I can't vary the baseline in practice.
4. **The fine-tuning needs a mechanism.** One part in a million doesn't happen by accident. Either there's a reason the baseline sits where it does relative to the quark band, or the visible band isn't a difference-frequency at all and the real story is subtler — maybe the perceived band is set by the *detector* (chemistry of opsins, say) reading a relative spectrum, in which case the absolute mapping is whatever evolution found useful, and the physics only had to supply the ordering.

That fourth one is where I currently land: the field supplies a relative spectrum; evolution built a detector that reads positions in it. The $10^{14}$ Hz of the detector is biology's business. The $10^{20}$ Hz of the field is physics' business. The AM architecture is the interface between them — and it's the interface that makes the bar's range sensible.

## The avenue I'm examining: Sun–Earth baseline, then Doppler

I want to record the approach I'm actually interested in, because it's distinct from the Doppler idea and the distinction matters. Doppler shift is from *motion* — that's established physics, I checked it, it's tapped out. This is a different effect: two masses altering the underlying gravity-energy field. That's what the whole theory has been about from the start — mass as the inverse of energy, the baseline field everything rides on, the local oscillator in the AM picture. The Sun and the Earth are the two masses shaping our local field, so their relation should set the baseline's scale. There is no textbook equation for this, because it isn't Doppler. It's the field responding to the masses in it.

The pipeline, as I'm examining it:

1. **Quark frequencies as variation from a baseline.** The raw frequencies never mattered (the scale-invariance argument above) — what matters is the modulation relative to the local field.
2. **The baseline scale from the Sun–Earth gravity relation.** $M_{\odot}/M_{\oplus} \approx 3.33 \times 10^5$. Running the quark band through it: $[1.07, 4.30] \times 10^{20} / 3.33 \times 10^5 = [3.2 \times 10^{14},\, 1.29 \times 10^{15}]$ Hz. The visible band ($4.0$–$7.9 \times 10^{14}$ Hz) sits inside that — overlapping, straddling. (Sun/Venus at $4.09 \times 10^5$ is the only other planet pair in the window; I use Sun–Earth because it's *our* baseline — the field we evolved in.)
3. **Doppler shift on top**, from Earth's real motion — the $29.8$ km/s orbital, the $0.01\%$ computed earlier. Small, but it's the correct final step: motion shifts whatever the field delivers.

Honest status: step 2 gets the band into the right neighborhood, not onto the exact address — the low end lands ~19% below red, and Doppler can't close a 19% gap. So this is the approach under examination, not a result. I want to be clear about that: this is still a theory, and I'm just experimenting with ideas. The missing piece is the mechanism: *why* a mass ratio sets a frequency scale, rather than being divided in by hand. But the question is sharp now. It's not "why don't the frequencies match" — it's "what is the dynamical link between the Sun–Earth mass relation and the baseline field's scale?" That's the examination I've set myself.

## Where this sits

I don't know that this is how vision works. What I know: the simulation is scale-invariant, the color assignments only ever used ordering, demodulation predicts exactly the features I'd already derived (sign irrelevance, difference-dominance, ratio preservation), and the two obvious alternatives I checked — Doppler from real motions, heterodyne against the electron — both fail numerically. The theory survives its first contact with arithmetic, which is a low bar, but it's the bar I set.

The open question is the one I ended the last section on: what sets the local baseline scale, and is detection really a demodulation against it? Until there's a mechanism, this stays a theory. A neat one, though — neat enough to write down.
