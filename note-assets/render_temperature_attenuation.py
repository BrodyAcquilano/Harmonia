"""Render temperature-attenuation panels for the FM note:
for three temperature ranges across the Sun's gradient, the mean attenuation
factor h*nu/(k*T) averaged over the range, vs quark-band frequency;
plus a fourth panel with the total end-to-end mapping from the note's table.
Saved to ~/workspace/harmonia/public/note-images/temperature-attenuation.png."""
import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import Polygon

h = 6.62607015e-34
k = 1.380649e-23
c = 299792458.0
eV = 1.602176634e-19
fq = (2/3) * 2e6 * eV / h  # quark frequency unit, Hz

STOPS = [  # (x in f_q units, name, rgb)
    (1/3, 'red', (220, 30, 30)),
    (2/3, 'yellow', (240, 200, 20)),
    (1.0, 'teal-green', (0, 190, 140)),
    (4/3, 'blue', (50, 90, 255)),
]

def lerp(a, b, f):
    return tuple(a[i] + (b[i] - a[i]) * f for i in range(3))

def rgb01(t, a=1.0):
    return (t[0] / 255, t[1] / 255, t[2] / 255, a)

def spec_color(x):
    for i in range(len(STOPS) - 1):
        x0, _, c0 = STOPS[i]
        x1, _, c1 = STOPS[i + 1]
        if x0 <= x <= x1:
            f = (x - x0) / (x1 - x0)
            return lerp(c0, c1, f)
    return STOPS[-1][2]

def spectrum_fill(ax, xs, ys, base=1.0):
    """Fill under (xs, ys) with the horizontal spectrum gradient, like the
    site's FrequencyDistribution: no vertical meaning in the color itself."""
    for i in range(len(xs) - 1):
        xm = (xs[i] + xs[i + 1]) / 2
        poly = Polygon([(xs[i], base), (xs[i], ys[i]),
                        (xs[i + 1], ys[i + 1]), (xs[i + 1], base)],
                       closed=True, facecolor=rgb01(spec_color(xm), 0.55),
                       edgecolor='none')
        ax.add_patch(poly)

xs = np.linspace(1/3, 4/3, 400)
nus = xs * fq
Teq = h * nus / k  # equivalent temperature of the input frequency

RANGES = [
    ("Outer Sun: 5.8\u00d710\u00b3 \u2013 10\u2075 K", 5.778e3, 1e5),
    ("Middle Sun: 10\u2075 \u2013 10\u2076 K", 1e5, 1e6),
    ("Inner Sun: 10\u2076 \u2013 1.5\u00d710\u2077 K", 1e6, 1.5e7),
]

fig, axes = plt.subplots(2, 2, figsize=(11, 8.2))
fig.suptitle("Temperature as a non-linear modulator \u2014 attenuation of the quark band\n"
             "at different depths in the Sun (illustrative model, not exact numbers)",
             fontsize=13)

for ax, (title, T1, T2) in zip(axes.flat[:3], RANGES):
    invT = math.log(T2 / T1) / (T2 - T1)  # mean of 1/T over the range
    A = Teq * invT                         # mean attenuation factor h*nu/(k*T)
    spectrum_fill(ax, xs, A)
    ax.plot(xs, A, color='#3a2a1a', lw=1.6)
    ax.set_title(title, fontsize=11)
    ax.set_yscale('log')
    ax.set_xlim(1/3, 4/3)
    ax.set_ylim(3e2, 2e6)
    ax.set_xticks([s[0] for s in STOPS])
    ax.set_xticklabels([f"{s[1]}\n{s[0]*fq:.2e} Hz" for s in STOPS], fontsize=8)
    ax.set_ylabel('attenuation factor', fontsize=9)
    ax.grid(True, which='major', axis='y', alpha=0.25)

# ---- fourth panel: total end-to-end mapping from the note's table ----
ax = axes.flat[3]
vis_nm = [700, 580, 530, 470]  # red, yellow, green, blue counterparts
qx = [s[0] for s in STOPS]
factors = [(qx[i] * fq) / (c / (nm * 1e-9)) for i, nm in enumerate(vis_nm)]
spectrum_fill(ax, np.array(qx), np.array(factors))
ax.plot(qx, factors, color='#3a2a1a', lw=1.6, marker='o', ms=5)
for x, f_ in zip(qx, factors):
    ax.text(x, f_ * 1.25, f"{f_:.1e}\u00d7", ha='center', fontsize=8)
ax.set_title("Total: whole-Sun mapping (from the color table)", fontsize=11)
ax.set_yscale('log')
ax.set_xlim(1/3, 4/3)
ax.set_ylim(3e2, 2e6)
ax.set_xticks(qx)
ax.set_xticklabels([f"{s[1]}\n{s[0]*fq:.2e} Hz" for s in STOPS], fontsize=8)
ax.set_ylabel('attenuation factor', fontsize=9)
ax.grid(True, which='major', axis='y', alpha=0.25)

fig.tight_layout(rect=[0, 0, 1, 0.92])
fig.savefig('public/note-images/temperature-attenuation.png', dpi=150)
print('saved; fq = %.4e Hz' % fq)
print('table factors:', ['%.3e' % f_ for f_ in factors])
