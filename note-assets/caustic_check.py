"""Refined check: predicted caustic positions (in observed coordinates) vs the
actual cluster centroids from the particle simulation."""
import math, json
import numpy as np
from quark_port import build_quark_terms, wave_coeffs_from_terms

ENTROPY, WAVE_AMP, OMEGA, GAIN, SPAWN_SPAN, MERGE_R = 60000, 0.15, 0.6, 2.0, 1.6, 0.35
N = min(1 + round(ENTROPY / 50), 20001)
C = wave_coeffs_from_terms(build_quark_terms(ENTROPY, None), N, WAVE_AMP)

def W(xi):  return sum(C[f] * np.cos(f * xi) for f in range(1, 5))
def Wp(xi): return sum(-f * C[f] * np.sin(f * xi) for f in range(1, 5))

xi = np.linspace(0, 2 * math.pi, 200001)
wp = Wp(xi)
thr = 1.0 / GAIN
cross = [float(xi[i]) for i in range(len(xi) - 1) if wp[i] > -thr and wp[i+1] <= -thr]
print('caustic phases xi:', [round(c, 3) for c in cross])
# observed co-moving coordinate eta = xi + g*W(xi)  (x = x0 + gW, eta = x - wt)
eta_pred = sorted(float((c + GAIN * W(c)) % (2 * math.pi)) for c in cross)
print('predicted density-spike observed phases eta:', [round(e, 3) for e in eta_pred])

rng = np.random.default_rng(7)
def cluster_labels(pos):
    n = len(pos); parent = np.arange(n)
    def find(a):
        while parent[a] != a: parent[a] = parent[parent[a]]; a = parent[a]
        return a
    d2 = ((pos[:, None, :] - pos[None, :, :]) ** 2).sum(-1)
    ii, jj = np.where(d2 < MERGE_R ** 2)
    for i, j in zip(ii.tolist(), jj.tolist()):
        if j <= i: continue
        ri, rj = find(i), find(j)
        if ri != rj: parent[rj] = ri
    return np.array([find(i) for i in range(n)])

centroid_etas = []
for trial in range(6):
    rest = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=(900, 3))
    for t in [0.0, 2.0, 5.0, 10.0, 20.0, 40.0]:
        ph = OMEGA * t
        pos = np.stack([rest[:, a] + GAIN * W(rest[:, a] - ph) for a in range(3)], axis=1)
        lab = cluster_labels(pos)
        uniq, counts = np.unique(lab, return_counts=True)
        for u, cn in zip(uniq, counts):
            if cn >= 4:
                cen = pos[lab == u].mean(axis=0)
                centroid_etas.append([(cen[a] - ph) % (2 * math.pi) for a in range(3)])
centroid_etas = np.array(centroid_etas).ravel()
print('centroids sampled:', len(centroid_etas))

# distance from each centroid phase to nearest predicted spike (circular)
D = np.abs(centroid_etas[:, None] - np.array(eta_pred)[None, :])
D = np.minimum(D, 2 * math.pi - D).min(axis=1)
for rad, name in [(0.35, '0.35'), (0.6, '0.6')]:
    # uniform expectation for min-distance-to-3-points on circle: approx
    print('frac within %s rad of a predicted spike: %.3f' % (name, float(np.mean(D < rad))))

# null: same for uniform random phases
u = rng.uniform(0, 2 * math.pi, size=len(centroid_etas))
Du = np.minimum(np.abs(u[:, None] - np.array(eta_pred)[None, :]),
                2 * math.pi - np.abs(u[:, None] - np.array(eta_pred)[None, :])).min(axis=1)
for rad in [0.35, 0.6]:
    print('  uniform null within %s rad: %.3f' % (rad, float(np.mean(Du < rad))))

# observed-phase histogram vs predicted density curve
bins = np.linspace(0, 2 * math.pi, 49)
obs, _ = np.histogram(centroid_etas, bins=bins)
ctr = 0.5 * (bins[:-1] + bins[1:])
# predicted density at observed phase eta: parametrize by xi
xif = np.linspace(0, 2 * math.pi, 20001)
eta_of_xi = (xif + GAIN * W(xif)) % (2 * math.pi)
dens_of_xi = 1.0 / np.maximum(np.abs(1 + GAIN * Wp(xif)), 1e-6)
pred = np.zeros_like(ctr)
for j, c in enumerate(ctr):
    sel = np.abs((eta_of_xi - c + math.pi) % (2 * math.pi) - math.pi) < (math.pi / 48)
    pred[j] = dens_of_xi[sel].mean() if sel.any() else 0
corr = float(np.corrcoef(obs, pred)[0, 1])
print('corr(centroid observed-phase histogram, predicted density): %.3f' % corr)
np.save('centroid_etas.npy', centroid_etas)
json.dump({'eta_pred': eta_pred, 'corr': corr}, open('caustic_check.json', 'w'))
