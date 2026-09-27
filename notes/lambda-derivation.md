# Derivation of the Structural Wavelengths $\lambda_1$ and $\lambda_2$

## From the Symmetric Two-Body Free-Fall Relation to the Closed Complex Branch

The purpose of this derivation is to reconstruct the closed-form expressions for the structural wavelengths $\lambda_1$ and $\lambda_2$ from the relations obtained at the end of the two-body free-fall derivation in *The Theory of Symmetric Inertia Transfer*.

The key idea is simple even though the final formulas look complicated. The earlier derivation gives two pieces of information: a gravitational wavelength-product relation and a symmetric mass-wavelength relation. The negative sign in the mass-wavelength relation produces the complex factor $i$. Once one wavelength is written in terms of the other, that relation can be substituted back into the gravitational branch equation and solved algebraically. The long expressions for $\lambda_1$ and $\lambda_2$ are therefore just a factorized form of a much simpler cubic solution.

---

## 1. Starting Relations from the Two-Body Derivation

For the reciprocal branch associated with Body 1, the closed-form solution carries forward the wavelength-product relation

$$
2M_1GT_1^2=\lambda_1^2(\lambda_2-\lambda_1).
$$

Using the Planck-Einstein relation

$$
E=hf=M_1c^2,
$$

the period of the first branch is

$$
T_1=\frac{h}{M_1c^2},
\qquad
T_1^2=\frac{h^2}{M_1^2c^4}.
$$

Substituting this into the wavelength-product relation gives

$$
\frac{2Gh^2}{M_1c^4}=\lambda_1^2(\lambda_2-\lambda_1).
$$

The symmetric two-body derivation also produced the mass-wavelength constraint

$$
M_1\lambda_1^2=-M_2\lambda_2^2.
$$

This second equation is what introduces the complex branch.

---

## 2. Isolating $\lambda_2$ in Terms of $\lambda_1$

Take the square root of the mass-wavelength relation:

$$
\sqrt{M_1\lambda_1^2}=\sqrt{-M_2\lambda_2^2}.
$$

Because $\sqrt{-1}=i$,

$$
\sqrt{M_1}\,\lambda_1=\pm i\sqrt{M_2}\,\lambda_2.
$$

The two signs correspond to the two conjugate complex orientations. The closed-form branch used in the manuscript is obtained by choosing

$$
\sqrt{M_1}\,\lambda_1=-i\sqrt{M_2}\,\lambda_2.
$$

Solving for $\lambda_2$ gives

$$
\boxed{\lambda_2=i\sqrt{\frac{M_1}{M_2}}\,\lambda_1.}
$$

This is the crucial substitution. It says that the second structural wavelength is not independent of the first: it is fixed by the mass ratio and a quarter-cycle complex rotation.

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

This is already a complete solution for $\lambda_1$. The longer expression used in the manuscript is an algebraic refactorization of this same result.

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

The apparently complicated structure is therefore only a symmetric factorization of the simpler cubic-root solution from the previous section.

---

## 5. Deriving $\lambda_2$

The second wavelength now follows directly from the complex branch relation

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

This is the second closed structural wavelength used in the theory.

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

Squaring this relation returns the original mass-wavelength constraint:

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

The closed forms therefore preserve the same complex symmetry from which they were constructed.

---

## 7. Derivation in One Chain

The entire calculation can be summarized as

$$
M_1\lambda_1^2=-M_2\lambda_2^2
$$

$$
\Downarrow
$$

$$
\lambda_2=i\sqrt{\frac{M_1}{M_2}}\lambda_1
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
$$

$$
\Downarrow
$$

$$
\lambda_1
=
\left(\frac{2Gh^2}{M_1c^4}\right)^{1/3}
\left(i\sqrt{\frac{M_1}{M_2}}-1\right)^{-1/3}
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
$$

and finally

$$
\lambda_2=i\sqrt{\frac{M_1}{M_2}}\lambda_1
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

> **Complex-root branch note.** The square root and fractional powers are multivalued in the complex plane. The displayed formulas consistently use the branch satisfying $\lambda_2=i\sqrt{M_1/M_2}\,\lambda_1$; the conjugate branch follows the same algebra with the opposite complex orientation.
