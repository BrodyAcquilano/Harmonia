"""Direct density test: histogram of ALL masses' observed co-moving positions at
fixed t vs the analytic predicted density rho(eta) = rho0 / |1 + g*W'(xi)|,
mapped through eta = xi + g*W(xi)."""
import math
import numpy as np
from quark_port import build_quark_terms, wave_coeffs_from_terms

ENTROPY, WAVE_AMP, OMEGA, GAIN, SPAWN_SPAN = 60000, 0.15, 0.6, 2.0, 1.6
N = min(1 + round(ENTROPY / 50), 20001)
C = wave_coeffs_from_terms(build_quark_terms(ENTROPY, None), N, WAVE_AMP)
def W(xi):  return sum(C[f] * np.cos(f * xi) for f in range(1, 5))
def Wp(xi): return sum(-f * C[f] * np.sin(f * xi) for f in range(1, 5))

# predicted density on the observed-phase grid
xif = np.linspace(0, 2 * math.pi, 40001)
eta_of = (xif + GAIN * W(xif)) % (2 * math.pi)
rho_of = 1.0 / np.maximum(np.abs(1 + GAIN * Wp(xif)), 1e-6)
bins = np.linspace(0, 2 * math.pi, 49)
ctr = 0.5 * (bins[:-1] + bins[1:])
pred = np.zeros_like(ctr)
for j, c in enumerate(ctr):
    sel = np.abs((eta_of - c + math.pi) % (2 * math.pi) - math.pi) < (math.pi / 48)
    pred[j] = rho_of[sel].mean()

rng = np.random.default_rng(21)
obs = np.zeros_like(ctr)
for trial in range(10):
    rest = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=(900, 3))
    for t in [0.0, 5.0, 10.0, 20.0]:
        ph = OMEGA * t
        x = rest[:, 0] + GAIN * W(rest[:, 0] - ph)
        eta = (x - ph) % (2 * math.pi)
        h, _ = np.histogram(eta, bins=bins)
        obs += h
# normalize out the (non-uniform) rest-phase coverage: expected counts with NO wave
exp0 = np.zeros_like(ctr)
for trial in range(10):
    rest = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=(900, 3))
    for t in [0.0, 5.0, 10.0, 20.0]:
        ph = OMEGA * t
        h, _ = np.histogram((rest[:, 0] - ph) % (2 * math.pi), bins=bins)
        exp0 += h
ratio = obs / np.maximum(exp0, 1)
pred_n = pred / pred.mean()
print('corr(observed/rest-coverage, predicted density): %.3f'
      % float(np.corrcoef(ratio, pred_n)[0, 1]))
print('peak observed/rest-coverage: %.2f  at eta=%.2f rad' %
      (ratio.max(), ctr[ratio.argmax()]))
print('predicted peak: %.2f' % pred_n.max())
