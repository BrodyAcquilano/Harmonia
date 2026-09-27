# Standing Waves

A standing wave looks frozen in place: it oscillates in time but its shape
doesn't travel. It arises whenever two waves of the same frequency move in
opposite directions through the same medium and interfere.

## The wave equation

Small transverse displacements $y(x, t)$ of a stretched string obey

$$\frac{\partial^2 y}{\partial t^2} = c^2 \frac{\partial^2 y}{\partial x^2}$$

where $c$ is the wave speed. d'Alembert's solution shows that any disturbance
splits into left- and right-traveling parts:

$$y(x, t) = f(x - ct) + g(x + ct)$$

## Two counter-propagating waves

Take two sine waves of equal amplitude $A$, wavenumber $k$, and angular
frequency $\omega$, traveling in opposite directions:

$$y_1 = A\sin(kx - \omega t), \qquad y_2 = A\sin(kx + \omega t)$$

Their sum is

$$y = y_1 + y_2 = 2A\sin(kx)\cos(\omega t)$$

Space and time have separated: every point oscillates with amplitude
$2A\sin(kx)$, in phase with every other point. Nothing propagates.

## Nodes and antinodes

- **Nodes** sit where $\sin(kx) = 0$, i.e. $x = n\pi/k$ for integer $n$.
  They never move.
- **Antinodes** sit where $|\sin(kx)| = 1$, halfway between the nodes.
  They swing with the full amplitude $2A$.

The distance between adjacent nodes is half a wavelength, $\lambda/2 = \pi/k$.

## Try it in the Wave Lab

Open the **Two waves** model, set $A_1 = A_2$, and watch the traveling
components (faint) add up to a standing sum (bold). Detuning $A_2$ slightly
below $A_1$ leaves a residual traveling ripple on top of the standing pattern.
