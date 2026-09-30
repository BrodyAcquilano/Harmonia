# Quark Space

2026-09-30

## Table of Contents

- [1. Why I built this diagram](#1-why-i-built-this-diagram)
- [2. What the diagram is](#2-what-the-diagram-is)
- [3. How it is graphed](#3-how-it-is-graphed)
- [4. What the surface represents](#4-what-the-surface-represents)
- [5. Where the frequencies come from](#5-where-the-frequencies-come-from)
- [6. Formation wins — why entropy increases](#6-formation-wins--why-entropy-increases)
- [7. A small input, an increasingly complex system](#7-a-small-input-an-increasingly-complex-system)

## 1. Why I built this diagram

I wanted to *see* the resonator. Not the equations — the thing itself: a region of space where quarks keep forming, each formation ringing the mass field like a bell, the rings piling up into a surface I could look at. The convolution surface is that picture. Every eigenstate on it is one quark event — a formation, or once in a while a decay — and the surface is what all of them, added together, look like from the outside.

## 2. What the diagram is

Two reciprocal waves drawn as one surface: a mass wave and an energy wave. Mass rides the green highs; energy sits in the red lows as its exact inverse, $E = 1/u$, so $E \cdot m = 1$ everywhere. The axes are wavelength $\lambda$ (X), $i\lambda$ (Z — phase is read from the $i\lambda$ axis), and velocity $v$ (Y, vertical). The gold arrow rides the surface at $(\tau_1, \tau_2)$: $\tau_1$ is the wave angle, $\tau_2$ the phase. The entropy slider does two things: it grows the sphere ($R = s/100000$) and it adds eigenstates ($N = 1 + s/50$). Below the surface sits the flat map — the wave unfolded as $\theta \times \tau_2$, like unraveling a globe, the middle row the base wave.

## 3. How it is graphed

The surface is a unit sphere with one wave per eigenstate folded into its radius:

$$u = 1 + \sum_{k=1}^{N(s)} m_k \frac{a}{\sqrt{k}} \sigma_k \cos(q_k \theta)$$

$\theta$ is the angle from $+\lambda$ in the $\lambda$–$v$ plane. The $-\lambda$ half is the $180^\circ$ phase-shifted opposite of the $+\lambda$ half ($w(\theta + \pi) = -w(\theta)$), so $-\lambda$ gives $-f$ — no absolute values anywhere. A $0.05$ floor keeps the mesh from turning inside-out. Each eigenstate's amplitude falls as $1/\sqrt{k}$: new frequencies are weaker, but every doubling of the count adds the same visible structure, so entropy never stops mattering. $m_k = +1$ marks a formation (added); $m_k = -1$ marks a decay (subtracted).

## 4. What the surface represents

A patch of the universe where quarks are forming. That is the whole idea: the frequencies on this surface are not abstract harmonics — they *are* quark states. Each eigenstate is one formation event ringing the field, and the surface is the interference of all of them. The green highs are where mass has piled up; the red lows are the energy released, the inverse. When I look at it I am looking at what a proton-forming region sounds like, if mass had a sound.

## 5. Where the frequencies come from

I got tired of the old chain. It built each new frequency as a random sum or difference of two earlier ones, and after a few hundred eigenstates the pattern just sat there — sliding entropy barely moved it. The seeding wasn't random enough. So I threw it out and seeded from the quarks directly.

Every eigenstate is now one weighted pick from 14 quark states (in units of $f_q/3$, so everything stays an integer and every cosine stays seamless around the sphere):

- **Formation, 95%, added** — the negatives, the same waves phase-shifted by $-180^\circ$: $-2/3$ (weight $2/7$), $-1/3$ ($2/7$), $+1/3$, $-4/3$, $-1$ ($1/7$ each).
- **Decay, 5%, subtracted** — $+2/3$ ($2/7$), $+1/3$ ($2/7$), $-1/3$, $+4/3$, $+1$ ($1/7$ each).

The weights just count quarks: a proton has two up quarks and one down, so $2/3$ is twice as likely as $-1/3$; the two-quark combos are $4/3$ (one way: up+up) and $1/3$ (two ways: either up with the down); all three make $1$. The formation states are the same list negated — quark formation running in reverse. Dark energy is the formation of up quarks, weighted heaviest at 66%; dark matter is the formation of $-1/3$ down quarks at 33% — and those internal weights live inside the 7 formation states. What the 95/5 split sets is formation *versus* decay: the dark sector against normal matter.

## 6. Formation wins — why entropy increases

If formation and decay were equally likely, they would cancel out — every added frequency met by a subtracted one, the surface going nowhere. That is not what the sky shows. Dark matter and dark energy outweigh normal matter about 95 to 5, and on this surface that ratio is the whole story: formation wins 95 to 5, so eigenstates accumulate, and entropy — which just counts eigenstates — rises with them.

Why should formation win? Because of charge. Quarks carry charges that pull them together, and once two ups and a down lock into a proton the structure is stable — it holds, it keeps pulling energy from the field, it does not fly apart. That stability is the bias. The 95% is not a parameter I tuned; it is what the abundance numbers forced: most frequencies in the universe were formed by quarks becoming protons, because charged quarks that find each other *stay* found. And a formed quark does not mean less energy — its frequency is negative, which only means phase-shifted by $-180^\circ$. The energy is still there, still fluctuating, just on the other side of the wave.

So entropy increases because eigenstates are increasing, and eigenstates are increasing because more and more quarks are being formed over time. Entropy is not disorder here. It is construction.

## 7. A small input, an increasingly complex system

This is the part that feels like chaos theory to me. The entire surface — two thousand interfering eigenstates, the whole roiling green-and-red sphere — grows out of two seeds: $2/3$ and $-1/3$. That is the small input. Everything else is the 95/5 dice, rolled two thousand times, each roll adding or subtracting one cosine. No roll knows about the others. And yet the result is not noise — it is a structured, intricate, *specific* surface, different on every page load, sensitive to every early pick. Change one of the first ten frequencies and the whole sphere rearranges; the late ones only ripple the details. A small input created an increasingly complex system, and the complexity never stops growing, because formation keeps winning. That, as far as I can tell, is what the universe has been doing too.
