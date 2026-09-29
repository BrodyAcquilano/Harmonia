# Derivation of the Structural Wavelengths $\lambda_1$ and $\lambda_2$

## Solving the transform's mass–wavelength relation: the coordinate change to lambda, worked through to the closed form

The purpose of this derivation is to solve for the structural wavelengths $\lambda_1$ and $\lambda_2$ — the transformed space coordinates — from the relations the coordinate change hands us at the end of the free-fall construction in *The Theory of Symmetric Inertia Transfer*. It is the coordinate change worked through: velocity and time changed into a symmetric phase domain, solved for $\lambda$.

Two relations, each serving a named principle. The first is the **gravitational wavelength-product relation**

$$2M_1GT_1^2 = \lambda_1^2(\lambda_2-\lambda_1)$$

— Kepler's harmonic baseline, $T^2 \propto a^3$, with the coordinates changed: a squared period set against a cubic quantity built from structural wavelengths. Time has already been transformed out of it via the Planck–Einstein relation $T_n = h/M_nc^2$. The second is the **mass–wavelength constraint**

$$M_1\lambda_1^2 = -M_2\lambda_2^2$$

— what survives the fifth limit (the substitution): no independent variable left, everything a proportion of the boundary masses. The negative sign is structural, not arbitrary: the two reciprocal separations point opposite ways, $\lambda_2-\lambda_1 = -(\lambda_1-\lambda_2)$, and the constraint records that.

The key idea is simple even though the final formulas look complicated. Solve the mass–wavelength relation for $\lambda_2$ — that step turns the structural minus sign into the transform's quarter-turn, $i$ — substitute it into the gravitational branch equation, and solve the resulting cubic. The long closed forms are a symmetric factorization of that cubic solution. Nothing here visits a new dimension: it is the coordinate change to lambda, worked through algebraically, and the invariant — the relative phase structure — is preserved at every step.

---

## Table of Contents

- [1. Starting Relations from the Two-Body Derivation](#1-starting-relations-from-the-two-body-derivation)
- [2. Isolating $\lambda_2$ in Terms of $\lambda_1$](#2-isolating-lambda_2-in-terms-of-lambda_1)
- [3. Substituting into the Gravitational Branch Equation](#3-substituting-into-the-gravitational-branch-equation)
- [4. Rewriting $\lambda_1$ in the Symmetric Factorized Form](#4-rewriting-lambda_1-in-the-symmetric-factorized-form)
- [5. Deriving $\lambda_2$](#5-deriving-lambda_2)
- [6. Why the Two Final Expressions Have the Same Internal Bracket](#6-why-the-two-final-expressions-have-the-same-internal-bracket)
- [7. Derivation in One Chain](#7-derivation-in-one-chain)


## 1. Starting Relations from the Two-Body Derivation

For the reciprocal branch associated with Body 1, the transform hands us the wavelength-product relation

$$
2M_1GT_1^2=\lambda_1^2(\lambda_2-\lambda_1).
$$

Read it as the harmonic law in the new coordinates: the left side is a squared period (time, transformed), the right side is cubic in the structural wavelengths (space, transformed) — $\lambda_1^2$ times the separation $\lambda_2-\lambda_1$. This is $T^2 \propto a^3$ with $a^3$ rebuilt from $\lambda$ itself.

Using the Planck–Einstein relation

$$
E=hf=M_1c^2,
$$

the period of the first branch is

$$
T_1=\frac{h}{M_1c^2},
\qquad
T_1^2=\frac{h^2}{M_1^2c^4}.
$$

Substituting this into the wavelength-product relation eliminates the period entirely — time is now fully expressed through mass — giving

$$
\frac{2Gh^2}{M_1c^4}=\lambda_1^2(\lambda_2-\lambda_1).
$$

The fifth limit hands us the second relation, the mass–wavelength constraint:

$$
M_1\lambda_1^2=-M_2\lambda_2^2.
$$

This is the substitution made explicit: with no independent variable left, the two wavelengths cannot vary independently — each is fixed by the mass ratio. The minus sign is the opposite orientation of the two separations, carried forward. This second equation is what introduces the quarter-turn.

---

## 2. Isolating $\lambda_2$ in Terms of $\lambda_1$

Take the square root of the mass–wavelength relation:

$$
\sqrt{M_1\lambda_1^2}=\sqrt{-M_2\lambda_2^2}.
$$

Because $\sqrt{-1}=i$,

$$
\sqrt{M_1}\,\lambda_1=\pm i\sqrt{M_2}\,\lambda_2.
$$

The two signs correspond to the two conjugate orientations. The closed-form branch used here is obtained by choosing

$$
\sqrt{M_1}\,\lambda_1=-i\sqrt{M_2}\,\lambda_2.
$$

Solving for $\lambda_2$ gives

$$
\boxed{\lambda_2=i\sqrt{\frac{M_1}{M_2}}\,\lambda_1.}
$$

This is the crucial substitution, and the $i$ in it needs its honest reading. It is **the transform's quarter-turn recording that the two separations point opposite ways** — $\lambda_2-\lambda_1 = -(\lambda_1-\lambda_2)$ — carried through the square root. It is not a new dimension and not a hidden place: it is the coordinate change writing "opposite orientation" as a 90° rotation in the complex plane, the same $i$ that writes "perpendicular" everywhere else in the transform. The equation says the second structural wavelength is not independent of the first: it is fixed by the mass ratio and that quarter-turn. Relative, not absolute — as everything in the frequency domain is.

---

## 3. Substituting into the Gravitational Branch Equation

Return to

$$
\frac{2Gh^2}{M_1c^4}=\lambda_1^2(\lambda_2-\lambda_1).
$$

Insert

$$
\lambda_2=i\sqrt{\frac{M_1}{M_2}}\,\lambda_1.
$$

Then

$$
\frac{2Gh^2}{M_1c^4}
=
\lambda_1^2\left(i\sqrt{\frac{M_1}{M_2}}\lambda_1-\lambda_1\right).
$$

Factor out $\lambda_1$ from the parenthesis:

$$
\frac{2Gh^2}{M_1c^4}
=
\lambda_1^3\left(i\sqrt{\frac{M_1}{M_2}}-1\right).
$$

Therefore,

$$
\lambda_1^3
=
\frac{2Gh^2}{M_1c^4}
\left(i\sqrt{\frac{M_1}{M_2}}-1\right)^{-1}.
$$

Taking the cube root gives the compact closed form

$$
\boxed{
\lambda_1
=
\left(\frac{2Gh^2}{M_1c^4}\right)^{1/3}
\left(i\sqrt{\frac{M_1}{M_2}}-1\right)^{-1/3}.
}
$$

This is already a complete solution for $\lambda_1$ — and it is Kepler's harmonic baseline, solved. The cubic in $\lambda$ is what $T^2 \propto a^3$ becomes once the period is eliminated through mass: the cubed structural wavelength, fixed by the gravitational constant, Planck's constant, the masses, and the quarter-turn. The longer expression below is an algebraic refactorization of this same result, displaying the two-body symmetry.

---

## 4. Rewriting $\lambda_1$ in the Symmetric Factorized Form

Define

$$
D\equiv\frac{2Gh^2}{c^4},
\qquad
Q\equiv\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}.
$$

Notice that

$$
i\sqrt{\frac{M_1}{M_2}}-1
=
\sqrt{M_1}\left(\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}\right)
=
\sqrt{M_1}\,Q.
$$

The compact solution can therefore be written as

$$
\lambda_1
=
\left(\frac{D}{M_1}\right)^{1/3}
(\sqrt{M_1}Q)^{-1/3}.
$$

Combining the powers of $M_1$ gives

$$
\lambda_1
=
D^{1/3}M_1^{-1/2}Q^{-1/3}.
$$

Now use

$$
\frac{h}{c^2}\sqrt{2G}=D^{1/2},
$$

and

$$
\left[D^{1/3}Q^{2/3}\right]^{-1/2}
=D^{-1/6}Q^{-1/3}.
$$

Multiplying these factors gives

$$
D^{1/2}D^{-1/6}=D^{1/3},
$$

so the compact solution becomes exactly

$$
\boxed{
\lambda_1
=
\frac{h}{c^2}\sqrt{\frac{2G}{M_1}}
\left[
\left(\frac{2Gh^2}{c^4}\right)^{1/3}
\left(
\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}
\right)^{2/3}
\right]^{-1/2}.
}
$$

The apparently complicated structure is therefore only a symmetric factorization of the simpler cubic-root solution from the previous section. The factorization is worth doing because it separates what belongs to Body 1 alone — the prefactor $(h/c^2)\sqrt{2G/M_1}$ — from what belongs to the pair — the shared bracket. That shared bracket is the coupled structure both wavelengths inherit from the same transform of the same boundary.

---

## 5. Deriving $\lambda_2$

The second wavelength now follows directly from the quarter-turn relation

$$
\lambda_2=i\sqrt{\frac{M_1}{M_2}}\,\lambda_1.
$$

Substituting the factorized expression for $\lambda_1$ gives

$$
\lambda_2
=
i\sqrt{\frac{M_1}{M_2}}
\frac{h}{c^2}\sqrt{\frac{2G}{M_1}}
\left[
\left(\frac{2Gh^2}{c^4}\right)^{1/3}
\left(
\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}
\right)^{2/3}
\right]^{-1/2}.
$$

The mass factors simplify because

$$
\sqrt{\frac{M_1}{M_2}}\sqrt{\frac{1}{M_1}}
=
\frac{1}{\sqrt{M_2}}.
$$

Therefore,

$$
\boxed{
\lambda_2
=
i\frac{h}{c^2}\sqrt{\frac{2G}{M_2}}
\left[
\left(\frac{2Gh^2}{c^4}\right)^{1/3}
\left(
\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}
\right)^{2/3}
\right]^{-1/2}.
}
$$

This is the second closed structural wavelength. The $i$ out front is the same quarter-turn from §2, carried through — the two wavelengths differ by the mass ratio and the 90° rotation, nothing else.

---

## 6. Why the Two Final Expressions Have the Same Internal Bracket

Both wavelengths contain the same common structural factor

$$
\mathcal{B}(M_1,M_2)
=
\left[
\left(\frac{2Gh^2}{c^4}\right)^{1/3}
\left(
\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}
\right)^{2/3}
\right]^{-1/2}.
$$

The two solutions can therefore be displayed transparently as

$$
\lambda_1
=
\frac{h}{c^2}\sqrt{\frac{2G}{M_1}}\,\mathcal{B}(M_1,M_2),
$$

$$
\lambda_2
=
i\frac{h}{c^2}\sqrt{\frac{2G}{M_2}}\,\mathcal{B}(M_1,M_2).
$$

Their ratio is immediately

$$
\boxed{
\frac{\lambda_2}{\lambda_1}
=
i\sqrt{\frac{M_1}{M_2}}.
}
$$

The shared bracket is the invariant structure showing through: both branches went through the same transform of the same boundary, so both carry the same coupled factor. What differs between them is only relative — the mass ratio and the quarter-turn. Squaring the ratio returns the original mass–wavelength constraint:

$$
M_2\lambda_2^2
=
M_2\left(i^2\frac{M_1}{M_2}\right)\lambda_1^2
=
-M_1\lambda_1^2,
$$

or

$$
\boxed{M_1\lambda_1^2=-M_2\lambda_2^2.}
$$

The closed forms therefore preserve the same relative structure from which they were constructed. The transform is consistent: what went in as a constraint comes back out as a constraint.

---

## 7. Derivation in One Chain

The entire calculation, annotated with the principle each link serves:

$$
M_1\lambda_1^2=-M_2\lambda_2^2
\qquad\text{(Limit 5: the substitution — everything a mass proportion)}
$$

$$
\Downarrow
$$

$$
\lambda_2=i\sqrt{\frac{M_1}{M_2}}\lambda_1
\qquad\text{(the quarter-turn: opposite orientation, recorded as $i$)}
$$

$$
\Downarrow
$$

$$
\frac{2Gh^2}{M_1c^4}
=
\lambda_1^2(\lambda_2-\lambda_1)
=
\lambda_1^3\left(i\sqrt{\frac{M_1}{M_2}}-1\right)
\qquad\text{(Kepler's baseline in $\lambda$: $T^2$ against a cubic)}
$$

$$
\Downarrow
$$

$$
\lambda_1
=
\left(\frac{2Gh^2}{M_1c^4}\right)^{1/3}
\left(i\sqrt{\frac{M_1}{M_2}}-1\right)^{-1/3}
\qquad\text{(the cubic, solved)}
$$

$$
\Downarrow
$$

$$
\lambda_1
=
\frac{h}{c^2}\sqrt{\frac{2G}{M_1}}
\left[
\left(\frac{2Gh^2}{c^4}\right)^{1/3}
\left(
\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}
\right)^{2/3}
\right]^{-1/2}
\qquad\text{(factorized: body factor $\times$ shared pair structure)}
$$

and finally

$$
\lambda_2=i\sqrt{\frac{M_1}{M_2}}\lambda_1
\qquad\text{(the quarter-turn, carried through)}
$$

which gives

$$
\lambda_2
=
i\frac{h}{c^2}\sqrt{\frac{2G}{M_2}}
\left[
\left(\frac{2Gh^2}{c^4}\right)^{1/3}
\left(
\frac{i}{\sqrt{M_2}}-\frac{1}{\sqrt{M_1}}
\right)^{2/3}
\right]^{-1/2}.
$$

The essential move is exactly the one remembered from the original derivation: **solve the symmetric mass-wavelength relation for $\lambda_2$, substitute it into the gravitational equation for $\lambda_1$, solve the resulting cubic, and then recover $\lambda_2$ from the symmetry relation.**

> **Complex-root branch note.** The square root and fractional powers are multivalued in the complex plane. The displayed formulas consistently use the branch satisfying $\lambda_2=i\sqrt{M_1/M_2}\,\lambda_1$; the conjugate branch follows the same algebra with the opposite orientation.

That is the whole derivation: the coordinate change to lambda, worked through. Time transformed into frequency via Planck–Einstein, space transformed into structural wavelength, the last variable eliminated by the mass proportions, the opposite orientation of the two separations recorded as the transform's quarter-turn, and Kepler's harmonic law solved in the new coordinates. No hidden dimensions were visited — the fifth dimension, the frequency domain, is where the algebra lives, and it holds up because the invariant does: the relative structure that went in is the relative structure that came out.
