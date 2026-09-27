# THE THEORY OF SYMMETRIC INERTIA TRANSFER

### *Relativistic Mass Distribution and the Coupling of Spatiotemporal Inertia*

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Core Field Equations](#2-core-field-equations)
3. [Closed-Form Structural Wavelength Solutions](#3-closed-form-structural-wavelength-solutions)
4. [Conservation Laws and Symmetric Inertia Transfer](#4-conservation-laws-and-symmetric-inertia-transfer)
5. [First-Principles Two-Body Derivation](#5-first-principles-two-body-derivation)
6. [Analytical Boundary Cases and Research Scenarios](#6-analytical-boundary-cases-and-research-scenarios)

# 1. Introduction

**The Theory of Symmetric Inertia Transfer** is a closed two-body framework in which space and time are not introduced as independent background coordinates. Instead, the relativistic masses $M_1$ and $M_2$ are used directly as the coordinate variables of two coupled complex waves. The geometry of the system is therefore written in terms of the relationship between the two mass states themselves: each body contributes a spatial coordinate to its own field and a temporal coordinate to the companion field.

The physical intuition begins with the word *inert*: non-reactive, or resistant to change. The theory separates this idea into two coupled forms. **Spatial inertia** is the resistance of a mass distribution to spatial change and is represented by the real component of the wave. **Temporal inertia** is the change-carrying counterpart of that spatial resistance and is represented by the imaginary component. In this language, energy is treated as temporal inertia: it is opposite to spatial inertia in role - where spatial inertia resists change, temporal inertia expresses the capacity for change - while both remain parts of the same complete inertial state.

The factor $i$ gives the coupling a geometric form. Multiplication by $i$ is a $90^\circ$ rotation in the complex plane, so the model uses the real and imaginary axes to represent two orthogonal manifestations of inertia. Spatial inertia can rotate into temporal inertia, and temporal inertia can rotate back into spatial inertia, without requiring the complete state of the closed system to be created or destroyed.

The two bodies are therefore not represented by independent waves. Their fields, $W_1$ and $W_2$, are cross-coupled: the spatial phase of Body 1 is paired with the temporal phase associated with Body 2, while the spatial phase of Body 2 is paired with the temporal phase associated with Body 1. This reciprocal structure produces the central symmetry of the theory. A change in one body must be accompanied by a complementary change in the companion field, so that the total inertial state remains conserved.

The structural wavelengths $\lambda_1$ and $\lambda_2$ are part of the same coupling. They are not independent distances laid over the two masses from an outside coordinate system. They are mass-dependent structural scales whose allowed values are constrained by $M_1$, $M_2$, and the symmetry between the two fields. The mass distribution therefore determines the spatial scale of the wave structure, while the conservation law determines how spatial and temporal inertia are transferred through that structure.

This produces the central idea of **symmetric inertia transfer**: in a closed system, inertia is conserved across the coupled fields, but the form in which that inertia appears may change. Spatial inertia in one field is paired with temporal inertia in the other. The real-spatial and imaginary-temporal components are not separately isolated reservoirs; together they form a symmetric exchange in which the total state remains invariant even as its distribution between the two bodies changes.

The massless boundary provides the limiting intuition. As rest mass approaches zero, the corresponding rest-mass spatial wavenumber approaches zero and the field approaches a uniform real amplitude. In the mass-coordinate representation, light therefore occupies the spatially inert limiting state: it carries no rest-mass spatial coordinate to deform, while nonzero rest mass generates the cross-coordinate phase structure that couples spatial and temporal inertia.

# 2. Core Field Equations

The theory begins with two complex waves. The first uses $M_1$ as its spatial coordinate and $M_2$ as its temporal coordinate; the second reverses those roles. This exchange is deliberate. It makes the two-body system symmetric from the beginning and allows spatial inertia in either body to be coupled directly to temporal inertia in the other.

## A. Simple Exponential Form

The compact field equations are

$$W_1(M_1,M_2)=A_1e^{i(k_1M_1-\omega_1M_2)}.$$

$$W_2(M_2,M_1)=A_2e^{i(k_2M_2-\omega_2M_1)}.$$

Here $A_1$ and $A_2$ are the field amplitudes, $k_1$ and $k_2$ are the spatial wavenumbers, and $\omega_1$ and $\omega_2$ are the temporal angular frequencies. The exchange $M_1\leftrightarrow M_2$ between the two equations is the first expression of the theory's spatial-temporal symmetry.

## B. Expanded Trigonometric Form

Using Euler's identity,

$$e^{i\theta}=\cos\theta+i\sin\theta,$$

the real-spatial and imaginary-temporal components become explicit:

$$W_1(M_1,M_2)=A_1\cos(k_1M_1-\omega_1M_2)+iA_1\sin(k_1M_1-\omega_1M_2).$$

$$W_2(M_2,M_1)=A_2\cos(k_2M_2-\omega_2M_1)+iA_2\sin(k_2M_2-\omega_2M_1).$$

The cosine term is the real-spatial component and represents spatial inertia. The sine term is the imaginary-temporal component and represents temporal inertia. The two are separated by a quarter-cycle, so a phase rotation redistributes the same complex field state between its spatial and temporal forms.

## C. Pure-Parameter Trigonometric Form

The intermediate wave parameters can be removed. Wavenumber is written as

$$k_n=\frac{2\pi}{\lambda_n},$$

and the Planck-Einstein relation

$$E=hf=M_nc^2$$

gives

$$\omega_n=2\pi f_n=\frac{2\pi M_nc^2}{h}.$$

Substituting these relations into $W_1$ and $W_2$ leaves the fields in terms of the masses, the two structural wavelengths, and the constants $h$, $c$, $\pi$, and $i$:

$$W_1(M_1,M_2)=A_1\cos\left(\frac{2\pi M_1}{\lambda_1}-\frac{2\pi M_1M_2c^2}{h}\right)+iA_1\sin\left(\frac{2\pi M_1}{\lambda_1}-\frac{2\pi M_1M_2c^2}{h}\right).$$

$$W_2(M_2,M_1)=A_2\cos\left(\frac{2\pi M_2}{\lambda_2}-\frac{2\pi M_1M_2c^2}{h}\right)+iA_2\sin\left(\frac{2\pi M_2}{\lambda_2}-\frac{2\pi M_1M_2c^2}{h}\right).$$

The temporal cross-term is the same mass product $M_1M_2$ in both fields. The spatial term changes only by exchanging the body and its associated wavelength. The full pair can therefore be written without an independent position variable or an independent time variable: the coordinate dependence is carried by $M_1$, $M_2$, $\lambda_1$, and $\lambda_2$ themselves.

# 3. Closed-Form Structural Wavelength Solutions

The wavelengths $\lambda_1$ and $\lambda_2$ are not independent of the masses. They are the spatial scales of the mass-coordinate fields, so changing the mass distribution changes the wavelength structure. The theory therefore imposes a mass-wavelength relation rather than treating $\lambda_1$ and $\lambda_2$ as freely chosen external distances. The two wavelengths are coupled to one another through the same two-body symmetry that couples $W_1$ and $W_2$.

The proposed structural wavelengths are written as exact closed forms under the model's stated boundary conditions. Those boundary conditions are an isolated two-body system in vacuum, with no imposed initial relative velocity, so that the motion being examined is generated by the mutual gravitational coupling of the two bodies. The derivation then evaluates the free-fall balance through $PE_n=KE_n$. The complete construction of those conditions is given in Section 5.

Under this boundary, the structural wavelengths are

$$\lambda_1=\frac{h}{c^2}\sqrt{\frac{2G}{M_1}}\left[\left(\frac{2Gh^2}{c^4}\right)^{1/3}\left(\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}\right)^{2/3}\right]^{-1/2}.$$

$$\lambda_2=i\frac{h}{c^2}\sqrt{\frac{2G}{M_2}}\left[\left(\frac{2Gh^2}{c^4}\right)^{1/3}\left(\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}\right)^{2/3}\right]^{-1/2}.$$

Both wavelengths contain the same coupled two-body factor. Neither can be specified from its own mass alone, and neither can be varied independently while the other mass is held outside the system. Their scale is fixed by the distribution of $M_1$ and $M_2$, while the relative complex branch carries the spatial-temporal rotation required by the symmetric field structure.

The important structural point is that **mass and wavelength are linked**. In the model, wavelength is a mass-dependent coordinate scale, not an additional independent coordinate. The proportional relation that emerges between the mass-wavelength sectors is therefore part of the same symmetry later expressed by the conservation law. Section 5 shows how that mass-wavelength coupling arises from the two-body free-fall construction.

# 4. Conservation Laws and Symmetric Inertia Transfer

The conservation law is the core result of the theory. The field equations establish a symmetric two-body coupling; the conservation law determines how that coupling is allowed to change. The coordinates are simply the two masses themselves: $M_1$ and $M_2$. Each mass appears as the real-spatial coordinate of one field and as the imaginary-temporal coordinate of the other. The symmetry is therefore not between two unrelated coordinate grids. It is the reciprocal use of the same two relativistic masses in opposite spatial and temporal roles.

Define the total or summed field as

$$W_s=W_1+W_2.$$

$W_s$ is the complete inertial state of the closed two-body system. The conservation principle is that $W_1$ and $W_2$ may change individually, but their coupled changes cannot produce an unbalanced change in $W_s$. Spatial inertia and temporal inertia may be redistributed between the two bodies, but the total inertial state remains conserved.

Within this interpretation, **spatial inertia** is the real, resistant component of the field, while **temporal inertia** is the imaginary, change-carrying component. Energy is identified with this temporal inertia. The two have opposite roles - resistance to change and capacity for change - but they are coupled quadratures of one state. The conservation law links them so that a spatial change in one field is paired with a temporal change in the other.

## A. Cross-Coordinate Symmetry

For the first mass coordinate, conservation requires

$$\frac{\partial W_1}{\partial M_1}+\frac{\partial W_2}{\partial M_1}=0.$$

For the second mass coordinate, conservation requires

$$\frac{\partial W_1}{\partial M_2}+\frac{\partial W_2}{\partial M_2}=0.$$

These are the two local symmetry rules. The first pairs the **spatial inertia of Body 1** with the **temporal inertia carried by Body 2 through $M_1$**. The second pairs the **spatial inertia of Body 2** with the **temporal inertia carried by Body 1 through $M_2$**.

Differentiating the exponential fields makes the direction of each response explicit:

$$\frac{\partial W_1}{\partial M_1}=ik_1W_1,\qquad \frac{\partial W_2}{\partial M_1}=-i\omega_2W_2.$$

$$\frac{\partial W_2}{\partial M_2}=ik_2W_2,\qquad \frac{\partial W_1}{\partial M_2}=-i\omega_1W_1.$$

The positive spatial phase gradient of one field is therefore paired with the negative temporal phase gradient of the companion field. The two conservation equations become

$$k_1W_1=\omega_2W_2,$$

$$k_2W_2=\omega_1W_1.$$

Together they give the compact symmetry condition

$$k_1k_2=\omega_1\omega_2.$$

This is the central spatial-temporal symmetry of the field pair. The product of the spatial phase scales equals the product of the temporal phase scales. Spatial inertia is not conserved separately from temporal inertia; rather, the transfer between the two is constrained so that the complete paired state remains unchanged.

Under a matched-phase boundary, the first balance gives

$$\frac{A_1}{\lambda_1}=A_2\frac{M_2c^2}{h},$$

with the companion relation obtained by exchanging $1\leftrightarrow2$. The amplitude and wavelength of either spatial field are therefore tied directly to the temporal mass scale of the other body.

## B. Conservation of the Total Inertial State

The two local symmetry rules combine into the total differential of $W_s$:

$$dW_s=\left(\frac{\partial W_1}{\partial M_1}+\frac{\partial W_2}{\partial M_1}\right)dM_1+\left(\frac{\partial W_1}{\partial M_2}+\frac{\partial W_2}{\partial M_2}\right)dM_2=0.$$

This equation defines conservation of inertia for the closed system. It does not require either body or either wave to remain unchanged. It requires the changes to occur in complementary pairs.

Consider first a positive change $+dM_1$. The $M_1$ part of the conservation law is

$$\frac{\partial W_1}{\partial M_1}dM_1+\frac{\partial W_2}{\partial M_1}dM_1=0.$$

Using the field derivatives,

$$ik_1W_1\,dM_1-i\omega_2W_2\,dM_1=0.$$

The **real-spatial inertia of Body 1** is driven in the positive spatial phase direction through $\partial W_1/\partial M_1$, while the **imaginary-temporal inertia of the companion field** contributes with the opposite sign through $\partial W_2/\partial M_1$. In the phase-gradient convention of the wave equations, the spatial contribution of $W_1$ goes up as the temporal contribution of $W_2$ goes down by the matching amount. Their sum remains zero.

Now consider a positive change $+dM_2$:

$$\frac{\partial W_1}{\partial M_2}dM_2+\frac{\partial W_2}{\partial M_2}dM_2=0,$$

so that

$$-i\omega_1W_1\,dM_2+ik_2W_2\,dM_2=0.$$

The pairing reverses. The **real-spatial inertia of Body 2** is driven in the positive spatial phase direction through $\partial W_2/\partial M_2$, while the **imaginary-temporal inertia of Body 1's field** changes with the opposite sign through $\partial W_1/\partial M_2$. Spatial and temporal inertia exchange roles under $1\leftrightarrow2$, preserving the same symmetry.

There is no required time ordering between the two terms in either infinitesimal balance. They are the two sides of the same differential response. The conservation law states which paired changes must accompany one another, not that one must occur first and the other later.

## C. The Inertial Shift Dynamic

The factor $i$ is what allows the conserved quantity to change form. A quarter-cycle rotation exchanges the real and imaginary axes,

$$1\xrightarrow{\times i}i,\qquad i\xrightarrow{\times i}-1,$$

so the model interprets the transfer between spatial and temporal inertia as a complex rotation rather than as the creation of a new quantity.

If $+dM_1$ increases the spatial inertia represented by $\partial W_1/\partial M_1$, conservation requires the companion term $\partial W_2/\partial M_1$ to shift oppositely. The added state therefore appears across the coupled field as temporal inertia rather than as an uncompensated increase in $W_s$. Likewise, if $+dM_2$ increases the spatial contribution $\partial W_2/\partial M_2$, the balancing response occurs in the temporal contribution $\partial W_1/\partial M_2$.

The symmetry can therefore be read in both directions:

$$\text{Body 1 spatial inertia}\;\longleftrightarrow\;\text{Body 2 temporal inertia},$$

$$\text{Body 2 spatial inertia}\;\longleftrightarrow\;\text{Body 1 temporal inertia}.$$

These two cross-couplings, together with $dW_s=0$, define symmetric inertia transfer. Relativistic mass determines the spatial and temporal phase scales; the conservation law determines how the resulting inertia is allowed to flow between the two bodies. Energy, as temporal inertia, is therefore not an independent addition to the system but the complementary form taken by the same conserved inertial state when it is expressed along the imaginary-temporal axis.

# 5. First-Principles Two-Body Derivation

The derivation begins with two bodies of masses $M_1$ and $M_2$ in an idealized vacuum. For the initial free-fall construction, $M_1$ is taken to be the larger source body and $M_2$ the smaller body released with no imposed initial relative velocity. The relative motion is therefore attributed only to the gravitational coupling between the two bodies. The same construction can then be written from either body's point of view to recover the symmetric two-body form.

The index $n$ denotes the **body currently being evaluated**, so $n$ may be $1$ or $2$. The index $o$ denotes the **other body**. Thus, when $n=1$, $o=2$, and when $n=2$, $o=1$.

A **Lagrangian** is the mechanical function used to describe the dynamics of a system by combining its kinetic and potential energy. In ordinary classical mechanics it is commonly written as $L=KE-PE$ and is used through the equations of motion to determine how the system evolves. For this two-body construction the overall sign is reversed without changing the zero-balance condition, so a separate quantity $L_n$ is assigned to whichever body is being evaluated using

$$L_n=PE_n-KE_n.$$

The familiar mechanical starting expressions are

$$PE=MgH,$$

$$KE=\frac{1}{2}MV^2,$$

where $H$ is used here for ordinary height or radial separation so that it is not confused with Planck's constant $h$. For the radial two-body free-fall boundary, the height scale is the same separation that determines the gravitational field, so $H\rightarrow r$.

The initial condition is then selected by setting the two-body energy balance to zero,

$$L_n=0\quad\Longrightarrow\quad PE_n=KE_n.$$

This boundary isolates the gravitational coupling itself: there is no imposed initial orbital velocity and no external force in the starting case. Body 2 is released into free fall relative to Body 1, and the same construction can then be written with the body labels exchanged. Circular motion, elliptical motion, and other nonzero-velocity states are extensions of this baseline rather than part of the initial derivation.

## Step 1 - Universal Gravitational Substitution

Instead of treating $g$ as a fixed local acceleration, write it from the companion mass:

$$g=\frac{GM_o}{r^2}.$$

Using $H=r$ in $PE_n=M_ngH$ gives

$$PE_n=M_n\left(\frac{GM_o}{r^2}\right)r=\frac{GM_nM_o}{r}.$$

The theory now removes the independent separation coordinate $r$. Each body is assigned an **absolute structural wavelength coordinate**, $\lambda_n$ or $\lambda_o$, and the physical separation is represented by the difference between those absolute wavelength coordinates:

$$r\rightarrow\Delta\lambda=\lambda_o-\lambda_n.$$

This is different from treating $\lambda$ itself as an ordinary relative distance. $\lambda_n$ and $\lambda_o$ are the two absolute structural coordinates; their difference supplies the relational separation. The potential-energy expression becomes

$$PE_n=\frac{GM_nM_o(\lambda_o-\lambda_n)}{(\lambda_o-\lambda_n)^2}=\frac{GM_nM_o}{\lambda_o-\lambda_n}.$$

## Step 2 - Wave Representation of Mechanical Velocity

Mechanical velocity is rewritten using the wave relation

$$V_n=\lambda_nF_n,$$

which gives

$$KE_n=\frac{1}{2}M_nV_n^2=\frac{M_n\lambda_n^2F_n^2}{2}.$$

This step makes the kinetic side of the free-fall problem use the same structural wavelength that defines the spatial coordinate of the field.

## Step 3 - Free-Fall Energy Balance

Applying $PE_n=KE_n$ gives

$$\frac{GM_nM_o}{\lambda_o-\lambda_n}=\frac{M_n\lambda_n^2F_n^2}{2}.$$

Cancelling $M_n$,

$$\frac{GM_o}{\lambda_o-\lambda_n}=\frac{\lambda_n^2F_n^2}{2}.$$

With

$$T_n=\frac{1}{F_n},$$

the relation becomes

$$2M_oGT_n^2=\lambda_n^2(\lambda_o-\lambda_n).$$

The right-hand side has a cubic wavelength structure. This is the model's analogue of **Kepler's third law**, which is normally written

$$T^2\propto a^3.$$

For a body in orbit, Kepler's third law says that the **square of the orbital period $T$ is proportional to the cube of the orbit's semi-major axis $a$**. In other words, the characteristic time scale grows with the three-dimensional spatial scale of the orbit according to $T^2\propto a^3$. In the present two-body construction, the corresponding spatial quantity is not an externally supplied semi-major axis. It is built from the two structural wavelength coordinates themselves:

$$\lambda_n^2(\lambda_o-\lambda_n).$$

This product contains two powers of the wavelength coordinate of the body being evaluated and one power of the wavelength difference between the two bodies. The wavelength difference $\lambda_o-\lambda_n$ supplies the two-body separation, so the complete product plays the role of the cubic spatial scale $a^3$ in the Kepler relation. Thus

$$2M_oGT_n^2=\lambda_n^2(\lambda_o-\lambda_n)$$

has the same basic harmonic structure: a squared period is related to a cubic spatial quantity, but here that spatial quantity is expressed entirely through the absolute structural wavelengths of the two-body system. This is the model's Keplerian harmonic baseline.

## Step 4 - Symmetric Two-Body Branch Relation

Writing the normalized relation for the two reciprocal branches gives

$$\frac{2M_1GT_1^2}{\lambda_1^2(\lambda_2-\lambda_1)}=\frac{2M_2GT_2^2}{\lambda_2^2(\lambda_1-\lambda_2)}.$$

Because

$$\lambda_2-\lambda_1=-(\lambda_1-\lambda_2),$$

the reversal of the relational separation introduces the structural negative sign

$$\frac{M_1T_1^2}{\lambda_1^2}=-\frac{M_2T_2^2}{\lambda_2^2}.$$

## Step 5 - Planck-Einstein Period and Mass-Wavelength Coupling

From

$$E=hf=M_nc^2,$$

we obtain

$$f_n=\frac{M_nc^2}{h},\qquad T_n=\frac{h}{M_nc^2},\qquad T_n^2=\frac{h^2}{M_n^2c^4}.$$

Substituting into the symmetric branch relation eliminates the period terms:

$$\frac{1}{M_1\lambda_1^2}=-\frac{1}{M_2\lambda_2^2}.$$

Equivalently,

$$M_1\lambda_1^2=-M_2\lambda_2^2.$$

This is the direct mass-wavelength constraint produced by the free-fall construction. The structural wavelength is therefore not independent of mass: the two mass-wavelength sectors are linked.

Now take the square root of both sides explicitly:

$$\sqrt{M_1\lambda_1^2}=\sqrt{-M_2\lambda_2^2}.$$

Resolving the negative square root gives

$$\sqrt{M_1}\,\lambda_1=\pm i\sqrt{M_2}\,\lambda_2,\qquad \sqrt{-1}=i.$$

This is the point at which the complex structure becomes explicit. The negative sign did not appear arbitrarily: it entered in Step 4 because the two reciprocal separations have opposite orientation,

$$\lambda_2-\lambda_1=-(\lambda_1-\lambda_2).$$

When the squared mass-wavelength relation is reduced by taking its square root, that structural minus sign becomes the factor $i$. The two reciprocal mass-wavelength branches therefore cannot remain on the same real orientation; they are separated by a quarter-cycle rotation in the complex plane. The two signs represent the conjugate branch orientations. Selecting a branch and combining it with the gravitational product relation yields the closed structural wavelength solutions presented in Section 3. The same complex rotation then reappears in Section 4 as the mechanism that couples spatial inertia to temporal inertia while preserving the total field $W_s$.

# 6. Analytical Boundary Cases and Research Scenarios

## A. Resolved Scenario - Photon / Massless Boundary

Take the second body toward the massless limit,

$$M_2\rightarrow0.$$

The corresponding temporal frequency tends to zero,

$$\omega_2=\frac{2\pi M_2c^2}{h}\rightarrow0,$$

and the structural wavelength branch drives the associated spatial wavenumber toward zero,

$$k_2=\frac{2\pi}{\lambda_2}\rightarrow0.$$

The second field therefore approaches a constant real amplitude:

$$W_2\rightarrow A_2\cos(0)+iA_2\sin(0)=A_2.$$

In the field equations, $A_2$ is the amplitude of the second branch. For the photon boundary, the field amplitude can be normalized to the photon energy,

$$A_2\equiv E_\gamma=hf_\gamma=p_\gamma c=\frac{hc}{\lambda_\gamma},$$

where $f_\gamma$, $p_\gamma$, and $\lambda_\gamma$ are the photon's ordinary frequency, momentum, and electromagnetic wavelength. The photon wavelength $\lambda_\gamma$ is distinct from the structural coordinate wavelength $\lambda_2$. Under this energy normalization,

$$W_2\rightarrow E_\gamma.$$

The first field retains its coupled phase,

$$W_1\rightarrow A_1\cos\left(\frac{2\pi M_1}{\lambda_1}-\frac{2\pi M_1M_2c^2}{h}\right)+iA_1\sin\left(\frac{2\pi M_1}{\lambda_1}-\frac{2\pi M_1M_2c^2}{h}\right),$$

so the total field becomes

$$W_s\rightarrow E_\gamma+A_1\cos\left(\frac{2\pi M_1}{\lambda_1}-\frac{2\pi M_1M_2c^2}{h}\right)+iA_1\sin\left(\frac{2\pi M_1}{\lambda_1}-\frac{2\pi M_1M_2c^2}{h}\right).$$

At the exact massless limit $M_2=0$, the temporal cross-term also vanishes, so the total field can be written with $A_2$ removed entirely:

$$W_s\rightarrow E_\gamma+A_1\cos\left(\frac{2\pi M_1}{\lambda_1}\right)+iA_1\sin\left(\frac{2\pi M_1}{\lambda_1}\right)=E_\gamma+A_1e^{i2\pi M_1/\lambda_1}.$$

The massless companion therefore supplies a uniform real baseline equal to its photon-energy amplitude, while the massive field carries the remaining spatial-temporal phase structure. This is the mass-coordinate sense in which light forms the spatially inert boundary of the theory.

## B. Research Scenarios for the Reader

### Problem 1 - Symmetric-Mass Standing State

Set

$$M_1=M_2=M.$$

Compute $W_s=W_1+W_2$ and determine the conditions on $A_1$, $A_2$, $\lambda_1$, and $\lambda_2$ under which the two cross-coupled phases form a stationary standing-state envelope. Identify the resulting nodes and antinodes in the mass-coordinate representation.

### Problem 2 - Circular Orbit from Nonzero Initial Velocity

Extend the free-fall boundary by giving the smaller body a tangential initial velocity chosen for a circular orbit. Determine how the additional initial kinetic term modifies the relation $PE_n=KE_n$, the structural wavelengths, and the conservation equations. Test whether a constant orbital radius corresponds to a constant mass-wavelength separation while spatial and temporal inertia continue to exchange internally.

### Problem 3 - Elliptical Orbit

Replace the circular initial condition with a bound elliptical orbit. Allow the wavelength separation $\lambda_o-\lambda_n$ to vary through the orbit and determine how the spatial and temporal phase gradients change between periapsis and apoapsis. Examine whether conservation of $W_s$ produces a periodic transfer between spatial and temporal inertia over one complete orbit.

### Problem 4 - Gravitational-Wave Disturbance

Introduce a small time-dependent disturbance into the coupled mass-wavelength structure and study how that disturbance propagates through the cross-coordinate conservation rules. Determine whether a perturbation in the spatial-inertia sector necessarily generates a paired perturbation in the temporal-inertia sector, and derive the corresponding wave speed and polarization structure predicted by the model.

### Problem 5 - Three-Body Extension

Introduce a third mass $M_3$ and replace the two-wave system with a symmetric network of pairwise couplings. Determine the minimum field structure required so that every spatial coordinate has a corresponding temporal partner while a generalized total field remains conserved. Compare the resulting dynamics with standard three-body behavior and identify whether the conservation rule constrains chaotic energy exchange.

### Problem 6 - Strong-Field / Event-Horizon Boundary

Take $M_1\gg M_2$ and follow the closed-form wavelength branches toward an extreme gravitational boundary. Determine how the relative complex rotation changes the balance between spatial and temporal inertia and whether the field develops a limiting transmission or reflection condition.

### Problem 7 - Transmission-Line Impedance Analogy

Treat the two mass sectors as effective coupled impedances with $Z_n\propto M_n$. Derive reflection and transmission coefficients at the coordinate junction and compare the impedance-matching condition with

$$k_1W_1=\omega_2W_2,\qquad k_2W_2=\omega_1W_1.$$

Determine whether perfect matching corresponds to a state in which spatial-to-temporal inertia transfer occurs without a reflected component.

### Problem 8 - Conserved Field Magnitude

Alongside the linear total field $W_s=W_1+W_2$, investigate the positive magnitude

$$|W_1|^2+|W_2|^2.$$

Express it entirely in terms of the mass-coupled phases and determine how it behaves under the same symmetric inertia-transfer rules. Compare conservation of the complex differential $dW_s=0$ with conservation of the total squared field magnitude.
