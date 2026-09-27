# Superposition

The **superposition principle** states that when two or more waves overlap in
a linear medium, the total displacement is simply the sum of the individual
displacements:

$$y(x, t) = y_1(x, t) + y_2(x, t) + \cdots$$

Linearity is doing all the work here: because the wave equation is linear in
$y$, any sum of solutions is itself a solution. No cross-terms, no
interaction — the waves pass straight through each other.

## Constructive and destructive interference

Where two waves arrive **in phase** ($\Delta\phi = 2\pi n$), amplitudes add:
constructive interference. Where they arrive **out of phase**
($\Delta\phi = (2n+1)\pi$), they cancel: destructive interference.

For two waves of equal amplitude $A$ with phase difference $\Delta\phi$:

$$y = 2A\cos\left(\frac{\Delta\phi}{2}\right)\sin\left(kx - \omega t + \frac{\Delta\phi}{2}\right)$$

The resultant amplitude $2A\cos(\Delta\phi/2)$ slides smoothly from $2A$ down
to $0$ as the waves drift out of phase.

## Beats

Two waves of slightly different frequencies $\omega_1 \approx \omega_2$
produce an amplitude that swells and fades at the difference frequency:

$$y \approx 2A\cos\left(\frac{\Delta\omega}{2}\,t\right)\sin(kx - \bar\omega t)$$

The audible (or visible) beat frequency is $|\omega_1 - \omega_2| / 2\pi$.

## Try it in the Wave Lab

In the **Two waves** model, sweep $\phi_2$ from $0$ to $2\pi$ and watch the
bold sum grow and shrink. Set $k$ and $\omega$ equal for both waves and the
sum stays a clean traveling wave; make the amplitudes unequal and part of
each wave survives cancellation.
