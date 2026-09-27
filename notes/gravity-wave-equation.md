# The Gravity Wave Equation

The two reciprocal complex waves of symmetric inertia transfer, written here with $\psi$ instead of $W$:

$$\psi_1(M_1, M_2) = A_1 e^{i(k_1 M_1 - \omega_1 M_2)}$$

$$\psi_2(M_2, M_1) = A_2 e^{i(k_2 M_2 - \omega_2 M_1)}$$

$\psi_1$ uses $M_1$ as its spatial coordinate and $M_2$ as its temporal coordinate; $\psi_2$ reverses the roles. The total field — the standing wave shown in the Wave Lab — is the sum:

$$\psi_s = \psi_1 + \psi_2$$

Real part = spatial (resistant) inertia. Imaginary part = temporal (change-carrying) inertia. Multiplication by $i$ is a quarter-cycle rotation between the two.

## Display parameters from the masses

$$k_n = \frac{2\pi}{\lambda_n}$$

The structural wavelengths $\lambda_1, \lambda_2$ are the closed cubic-root forms derived in the lambda-derivation note. Their ratio carries the whole symmetry:

$$\frac{\lambda_2}{\lambda_1} = i\sqrt{\frac{M_1}{M_2}}, \qquad M_1\lambda_1^2 = -M_2\lambda_2^2$$

The Wave Lab works in display units with unit phase velocity, $k_1 = \omega_1 = 1$, and takes the wavenumber magnitude ratio straight from the mass-wavelength constraint:

$$k_2 = k_1\sqrt{\frac{M_2}{M_1}}$$

The second frequency is then fixed by the theory's symmetry condition $k_1 k_2 = \omega_1 \omega_2$:

$$\omega_2 = \frac{k_1 k_2}{\omega_1}$$

so the lab always depicts the conserving configuration. (The Planck–Einstein ratio $\omega_2/\omega_1 = M_2/M_1$ is therefore not separately imposed in display units.)

So the Wave Lab needs only two sliders — $M_1$ and $M_2$. Everything else ($k_1, k_2, \omega_1, \omega_2, A_1, A_2, \beta$) is derived from them.

## Amplitudes from the conservation law

The amplitudes are not chosen — they follow from the conservation section plus normalization:

1. $\dfrac{\partial \psi_1}{\partial M_1} + \dfrac{\partial \psi_2}{\partial M_1} = 0$ gives $k_1\psi_1 = \omega_2\psi_2$; at the matched-phase boundary (midpoint), $k_1 A_1 = \omega_2 A_2$.
2. Hence $\dfrac{A_1}{A_2} = \dfrac{\omega_2}{k_1} = \sqrt{\dfrac{M_2}{M_1}}$.
3. Normalization, probability-style: $|A_1|^2 + |A_2|^2 = 1$.

$$A_1 = \sqrt{\frac{M_2}{M_1+M_2}}, \qquad A_2 = \sqrt{\frac{M_1}{M_1+M_2}}$$

Note the cross-coupling: the amplitude of $\psi_1$ (body 1's wave) is set by $M_2$, the companion mass — the same reciprocal structure as the phase coordinates. The heavier body carries the smaller share of its own wave's amplitude. In the symmetric case $M_1 = M_2$, $A_1 = A_2 = 1/\sqrt{2}$.

## Exponential decay along the travel path

Each wave is emitted at its source mass and decays exponentially as it travels toward the companion:

$$\psi_1(x,\tau) = A_1\,e^{-\beta x}\,e^{i(k_1 x - \omega_1 M_2 \tau)}$$

$$\psi_2(x,\tau) = A_2\,e^{-\beta\,(L-x)}\,e^{i(-k_2 x - \omega_2 M_1 \tau)}$$

with $L = 4\pi$ the display span and

$$\beta = \frac{|M_1 - M_2|}{M_1 + M_2}$$

The symmetric case $M_1 = M_2$ gives $\beta = 0$: the pure, non-decaying standing state. Asymmetry leaks amplitude at rate $\beta$ — readable as the net rate at which temporal inertia is handed from one body to the other without a symmetric return. The exact functional form of $\beta(M_1, M_2)$ remains open; the asymmetry ratio above is the display parameterization ($\kappa = 1$).

## Conservation in derivative form

$$\frac{\partial \psi_1}{\partial M_1} + \frac{\partial \psi_2}{\partial M_1} = 0, \qquad \frac{\partial \psi_1}{\partial M_2} + \frac{\partial \psi_2}{\partial M_2} = 0$$

with the explicit gradients

$$\frac{\partial \psi_1}{\partial M_1} = ik_1\psi_1, \qquad \frac{\partial \psi_2}{\partial M_1} = -i\omega_2\psi_2$$

$$\frac{\partial \psi_2}{\partial M_2} = ik_2\psi_2, \qquad \frac{\partial \psi_1}{\partial M_2} = -i\omega_1\psi_1$$

The Derivatives tab in the Wave Lab plots these: the two gradients and their sum, which is the conservation residual. The envelope is a real factor, so it scales the gradient traces without rotating them — the phase-gradient structure the conservation law constrains is preserved. Where the residual vanishes (at the midpoint $x = L/2$ in the symmetric case), the matched-phase boundary condition holds.
