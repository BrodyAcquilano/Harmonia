"""Render note snapshots: (1) the relative-abundance graph, replicating the
site's FrequencyDistribution layout exactly; (2) a standalone spectrum bar.
Saved to ~/workspace/harmonia/public/note-images/."""
import math, os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from quark_port import build_quark_terms

IR_RGB = (110, 20, 20)
UV_RGB = (216, 191, 216)
VISIBLE_STOPS = [
    (255, 0, 0), (255, 127, 0), (255, 255, 0), (0, 200, 0),
    (0, 200, 255), (0, 0, 255), (139, 0, 255),
]

def spectrum_bounds(qs):
    qMin = min(abs(q) for q in qs); qMax = max(abs(q) for q in qs)
    pad = 0.1 * (qMax - qMin) if qMax > qMin else 0.5
    lo, hi = qMin - pad, qMax + pad
    return dict(lo=lo, hi=hi, qMin=qMin, qMax=qMax,
                tIR=(qMin - lo) / (hi - lo), tUV=(qMax - lo) / (hi - lo))

def spectrum_color(t, b):
    tc = max(0.0, min(1.0, t))
    if tc <= b['tIR']: return IR_RGB
    if tc >= b['tUV']: return UV_RGB
    s = (tc - b['tIR']) / (b['tUV'] - b['tIR'])
    x = s * (len(VISIBLE_STOPS) - 1)
    i = min(len(VISIBLE_STOPS) - 2, math.floor(x))
    f = x - i
    A, B = VISIBLE_STOPS[i], VISIBLE_STOPS[i + 1]
    return tuple(round(A[k] + (B[k] - A[k]) * f) for k in range(3))

def freq_label(q):
    aq = abs(q)
    return {1: '1/3 f_q', 2: '2/3 f_q', 3: '1 f_q', 4: '4/3 f_q'}.get(aq, f'{aq}/3 f_q')

def rgb01(c, a=1.0):
    return (c[0] / 255, c[1] / 255, c[2] / 255, a)

# ---- the algorithm, as coded ----
ENTROPY, SHOWN = 60000, 12
terms = build_quark_terms(40, ENTROPY)
n = min(SHOWN, len(terms))
qs = [abs(terms[k]['q']) for k in range(n)]
bounds = spectrum_bounds(qs)
t_of = lambda q: (q - bounds['lo']) / (bounds['hi'] - bounds['lo'])
ts = [t_of(q) for q in qs]
bw = 0.1
gauss = lambda u: math.exp(-0.5 * u * u) / math.sqrt(2 * math.pi)
M = 240
xs = np.linspace(0, 1, M + 1)
ds = np.array([sum(gauss((t - tk) / bw) for tk in ts) / (n * bw) for t in xs])
dMax = ds.max()
print('snapshot terms |q|:', qs)
print('bounds:', {k: round(v, 3) for k, v in bounds.items()})

# ---- layout, in the site's CSS pixels ----
Wpx, Hpx = 1168, 292
padL, padR, padT, plotH = 14, 14, 10, 190
barH, barGap = 18, 8
iw = Wpx - padL - padR
baseY = padT + plotH
X = lambda t: padL + t * iw
Y = lambda d: baseY - (d / (dMax * 1.08)) * plotH
barY = baseY + barGap
row1, row2 = barY + barH + 15, barY + barH + 31

fig = plt.figure(figsize=(Wpx / 100, Hpx / 100), dpi=100)
fig.patch.set_alpha(0.0)
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, Wpx); ax.set_ylim(Hpx, 0); ax.set_axis_off()

# area under the curve, filled with the spectrum itself (alpha 0.55)
for i in range(M):
    ax.add_patch(Polygon(
        [[X(xs[i]), baseY], [X(xs[i+1]), baseY],
         [X(xs[i+1]), Y(ds[i+1])], [X(xs[i]), Y(ds[i])]],
        closed=True, facecolor=rgb01(spectrum_color((xs[i] + xs[i+1]) / 2, bounds), 0.55),
        edgecolor='none', zorder=1))
# the curve on top
ax.plot(X(xs), Y(ds), color=(74/255, 63/255, 44/255, 0.85), lw=2, zorder=2)
# the number line
ax.plot([padL, padL + iw], [baseY, baseY], color=(107/255, 90/255, 62/255, 0.5), lw=1, zorder=3)
# spectrum bar beneath
for i in range(48):
    t0, t1 = i / 48, (i + 1) / 48
    ax.add_patch(Polygon(
        [[X(t0), barY], [X(t1), barY], [X(t1), barY + barH], [X(t0), barY + barH]],
        closed=True, facecolor=rgb01(spectrum_color((t0 + t1) / 2, bounds)),
        edgecolor='none', zorder=3))
ax.plot([padL, padL + iw, padL + iw, padL],
        [barY, barY, barY + barH, barY + barH],
        color=(107/255, 90/255, 62/255, 0.35), lw=1, zorder=4)
for tt in (bounds['tIR'], bounds['tUV']):
    ax.add_patch(Polygon(
        [[X(tt) - 1, barY], [X(tt) + 1, barY],
         [X(tt) + 1, barY + barH], [X(tt) - 1, barY + barH]],
        closed=True, facecolor=(1, 1, 1, 0.7), edgecolor='none', zorder=5))
# labels
MONO = dict(family='monospace', size=11)
ax.text(padL, row1, 'infrared', color='#715f43', ha='left', va='top', **MONO)
ax.text(padL + iw, row1, 'ultraviolet', color='#715f43', ha='right', va='top', **MONO)
ax.text(X(bounds['tIR']), row2, freq_label(bounds['qMin']),
        color='#4a3f2c', ha='center', va='top', **MONO)
ax.text(X(bounds['tUV']), row2, freq_label(bounds['qMax']),
        color='#4a3f2c', ha='center', va='top', **MONO)

outdir = os.path.expanduser('~/workspace/harmonia/public/note-images')
os.makedirs(outdir, exist_ok=True)
fig.savefig(f'{outdir}/mass-formation-abundance.png', dpi=100, transparent=True)
plt.close(fig)

# ---- standalone spectrum bar ----
BW, BH = 1168, 132
bpad, bbarH = 14, 40
biw = BW - 2 * bpad
fig2 = plt.figure(figsize=(BW / 100, BH / 100), dpi=100)
fig2.patch.set_alpha(0.0)
ax2 = fig2.add_axes([0, 0, 1, 1])
ax2.set_xlim(0, BW); ax2.set_ylim(BH, 0); ax2.set_axis_off()
BX = lambda t: bpad + t * biw
for i in range(96):
    t0, t1 = i / 96, (i + 1) / 96
    ax2.add_patch(Polygon(
        [[BX(t0), 14], [BX(t1), 14], [BX(t1), 14 + bbarH], [BX(t0), 14 + bbarH]],
        closed=True, facecolor=rgb01(spectrum_color((t0 + t1) / 2, bounds)),
        edgecolor='none'))
ax2.plot([bpad, bpad + biw, bpad + biw, bpad],
         [14, 14, 14 + bbarH, 14 + bbarH],
         color=(107/255, 90/255, 62/255, 0.35), lw=1)
for tt in (bounds['tIR'], bounds['tUV']):
    ax2.add_patch(Polygon(
        [[BX(tt) - 1, 14], [BX(tt) + 1, 14],
         [BX(tt) + 1, 14 + bbarH], [BX(tt) - 1, 14 + bbarH]],
        closed=True, facecolor=(1, 1, 1, 0.7), edgecolor='none'))
ax2.text(bpad, 14 + bbarH + 22, 'infrared', color='#715f43', ha='left', va='top', **MONO)
ax2.text(bpad + biw, 14 + bbarH + 22, 'ultraviolet', color='#715f43', ha='right', va='top', **MONO)
ax2.text(BX(bounds['tIR']), 14 + bbarH + 40, freq_label(bounds['qMin']),
         color='#4a3f2c', ha='center', va='top', **MONO)
ax2.text(BX(bounds['tUV']), 14 + bbarH + 40, freq_label(bounds['qMax']),
         color='#4a3f2c', ha='center', va='top', **MONO)
fig2.savefig(f'{outdir}/mass-formation-spectrum-bar.png', dpi=100, transparent=True)
plt.close(fig2)
print('wrote', outdir + '/mass-formation-abundance.png')
print('wrote', outdir + '/mass-formation-spectrum-bar.png')
