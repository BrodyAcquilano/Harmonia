"""Honest enrichment test: cluster-member phases vs ALL fired masses' phases
(same times, so the wave-shift cancels — any difference is the wave's doing)."""
import math
import numpy as np
from quark_port import build_quark_terms, wave_coeffs_from_terms

ENTROPY, WAVE_AMP, OMEGA, GAIN, SPAWN_SPAN, MERGE_R = 60000, 0.15, 0.6, 2.0, 1.6, 0.35
N = min(1 + round(ENTROPY / 50), 20001)
C = wave_coeffs_from_terms(build_quark_terms(ENTROPY, None), N, WAVE_AMP)
def W(xi):  return sum(C[f] * np.cos(f * xi) for f in range(1, 5))
def Wp(xi): return sum(-f * C[f] * np.sin(f * xi) for f in range(1, 5))

xi = np.linspace(0, 2 * math.pi, 200001)
wp = Wp(xi); thr = 1.0 / GAIN
caustics = [float(xi[i]) for i in range(len(xi)-1) if wp[i] > -thr and wp[i+1] <= -thr]
print('caustic phases:', [round(c, 3) for c in caustics])

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

def circ_dist(a, b):
    d = np.abs(a - b) % (2 * math.pi)
    return np.minimum(d, 2 * math.pi - d)

member_phase, all_phase = [], []
for trial in range(10):
    rest = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=(900, 3))
    for t in [0.0, 2.0, 5.0, 10.0, 20.0, 40.0]:
        ph = OMEGA * t
        pos = np.stack([rest[:, a] + GAIN * W(rest[:, a] - ph) for a in range(3)], axis=1)
        lab = cluster_labels(pos)
        uniq, counts = np.unique(lab, return_counts=True)
        is_member = np.isin(lab, uniq[counts >= 4])
        member_phase.extend(((rest[is_member, 0] - ph) % (2 * math.pi)).tolist())
        all_phase.extend(((rest[:, 0] - ph) % (2 * math.pi)).tolist())
member_phase = np.array(member_phase); all_phase = np.array(all_phase)
print('members:', len(member_phase), ' total mass-phases:', len(all_phase))

def frac_near(phases, pts, rad):
    d = np.minimum.reduce([circ_dist(phases, p) for p in pts])
    return float(np.mean(d < rad))

for rad in (0.35, 0.6):
    fm = frac_near(member_phase, [0.0], rad)
    fa = frac_near(all_phase, [0.0], rad)
    print('within %.2f rad of 1:1 point: members %.3f vs all %.3f (enrichment %.2fx)'
          % (rad, fm, fa, fm / fa))
    fm = frac_near(member_phase, caustics, rad)
    fa = frac_near(all_phase, caustics, rad)
    print('within %.2f rad of a caustic:  members %.3f vs all %.3f (enrichment %.2fx)'
          % (rad, fm, fa, fm / fa))
