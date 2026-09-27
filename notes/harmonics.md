# Harmonics

Fix a string at both ends ($y = 0$ at $x = 0$ and $x = L$) and pluck it. The
only standing waves that fit are the **normal modes**:

$$y_m(x, t) = A_m \sin\left(\frac{m\pi x}{L}\right)\cos(m\,\omega_0 t),
\qquad m = 1, 2, 3, \dots$$

with fundamental angular frequency $\omega_0 = \pi c / L$ (the Wave Lab uses
wave speed $c = 1$, so $\omega_0 = \pi/L$). The $m$-th mode has $m$ half-waves
along the string and frequency

$$f_m = m\,\frac{c}{2L}$$

— an exact integer harmonic series. This is why strings sound musical.

## Fourier's idea

Any reasonable initial shape $y(x, 0)$ on the string can be written as a sum
of these modes:

$$y(x, 0) = \sum_{m=1}^{\infty} A_m \sin\left(\frac{m\pi x}{L}\right)$$

The mode amplitudes $A_m$ are the Fourier sine coefficients of the shape.
A plucked triangle is dominated by odd modes with amplitudes falling off as
$1/m^2$; a sharper strike excites more high modes, which is why it sounds
brighter.

## Why $A/m$ in the Wave Lab

The Harmonics model weights mode $m$ by $A/m$, a middle ground between a pure
fundamental and a harsh sawtooth (which falls as $1/m$ in amplitude too, for
its displacement series). Increase $N$ and watch the sum sharpen toward the
idealized shape — and notice the small ripples near the ends, a glimpse of
the Gibbs phenomenon.

## Try it in the Wave Lab

Set $N = 1$ for a pure sine, then raise $N$ toward 8. Shorten $L$ to pack the
modes tighter. Flip to **Charge (±)** mode and drive $A$ negative to invert
every mode at once.
