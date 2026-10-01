"""Sparse-firing control: with few masses, random co-location is rare, so any
clustering must come from the wave. Wave ON vs wave OFF (gain 0)."""
import math
import numpy as np
from quark_port import build_quark_terms, wave_coeffs_from_terms

ENTROPY, WAVE_AMP, OMEGA, SPAWN_SPAN, MERGE_R = 60000, 0.15, 0.6, 1.6, 0.35
N = min(1 + round(ENTROPY / 50), 20001)
C = wave_coeffs_from_terms(build_quark_terms(ENTROPY, None), N, WAVE_AMP)
def W(xi):  return sum(C[f] * np.cos(f * xi) for f in range(1, 5))
def Wp(xi): return sum(-f * C[f] * np.sin(f * xi) for f in range(1, 5))
xi = np.linspace(0, 2 * math.pi, 200001)
wp = Wp(xi)
caustics = [float(xi[i]) for i in range(len(xi)-1) if wp[i] > -0.5 and wp[i+1] <= -0.5]

def cluster_count(pos, min_members=3):
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
    lab = np.array([find(i) for i in range(n)])
    _, counts = np.unique(lab, return_counts=True)
    return int((counts >= min_members).sum()), int(counts[counts >= min_members].sum())

rng = np.random.default_rng(3)
for n_fire in (120, 300):
    on_c, on_m, off_c, off_m = [], [], [], []
    for trial in range(12):
        rest = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=(n_fire, 3))
        t = 10.0; ph = OMEGA * t
        pos_on = np.stack([rest[:, a] + 2.0 * W(rest[:, a] - ph) for a in range(3)], axis=1)
        c, m = cluster_count(pos_on); on_c.append(c); on_m.append(m)
        c, m = cluster_count(rest); off_c.append(c); off_m.append(m)
    print('n_fire=%d  wave ON : clusters>=3 %5.1f  members %6.1f' %
          (n_fire, float(np.mean(on_c)), float(np.mean(on_m))))
    print('n_fire=%d  wave OFF: clusters>=3 %5.1f  members %6.1f' %
          (n_fire, float(np.mean(off_c)), float(np.mean(off_m))))
