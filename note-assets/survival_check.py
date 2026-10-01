"""Cluster survival test: do mass packets that form near the 1:1 phase-agreement
point (xi = 0 mod 2pi, where W' = 0 and neighbors ride in lockstep) survive
longer than packets formed on the steep slopes?"""
import math
import numpy as np
from quark_port import build_quark_terms, wave_coeffs_from_terms

ENTROPY, WAVE_AMP, OMEGA, GAIN, SPAWN_SPAN, MERGE_R = 60000, 0.15, 0.6, 2.0, 1.6, 0.35
N = min(1 + round(ENTROPY / 50), 20001)
C = wave_coeffs_from_terms(build_quark_terms(ENTROPY, None), N, WAVE_AMP)
def W(xi):  return sum(C[f] * np.cos(f * xi) for f in range(1, 5))
def Wp(xi): return sum(-f * C[f] * np.sin(f * xi) for f in range(1, 5))

rng = np.random.default_rng(11)
def disp(rest, t):
    ph = OMEGA * t
    return np.stack([rest[:, a] + GAIN * W(rest[:, a] - ph) for a in range(3)], axis=1)

# plant tight pairs at controlled co-moving phases, watch them over time
n_pairs = 400
survive_near, survive_far = [], []
for trial in range(8):
    # random base phases, random rest positions
    base_xi = rng.uniform(0, 2 * math.pi, size=n_pairs)
    x0 = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=n_pairs)
    y0 = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=n_pairs)
    z0 = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=n_pairs)
    # pair partner: 0.15 away in x rest position (well within merge radius)
    rest1 = np.stack([x0, y0, z0], axis=1)
    rest2 = np.stack([x0 + 0.15, y0, z0], axis=1)
    d_near, d_far = [], []
    for t in [0, 1, 2, 4, 8, 16, 32]:
        p1, p2 = disp(rest1, t), disp(rest2, t)
        d = np.sqrt(((p1 - p2) ** 2).sum(axis=1))
        xi_now = (x0 - OMEGA * t) % (2 * math.pi)
        near = np.minimum(xi_now, 2 * math.pi - xi_now) < 0.3   # within ~17 deg of 1:1
        d_near.append(d[near]); d_far.append(d[~near])
    survive_near.append([float(np.mean(d < MERGE_R)) for d in d_near])
    survive_near_t = np.array(survive_near)
    survive_far.append([float(np.mean(d < MERGE_R)) for d in d_far])
    survive_far_t = np.array(survive_far)

times = [0, 1, 2, 4, 8, 16, 32]
print('t:                ', times)
print('survival near 1:1:', [round(float(v), 3) for v in survive_near_t.mean(axis=0)])
print('survival far:     ', [round(float(v), 3) for v in survive_far_t.mean(axis=0)])
