"""Mass-formation math for the note: wave-riding analysis of the Mass Creation
algorithm (MassCreation.jsx), a particle-level simulation of firing+clustering,
and rendered snapshots of the relative-abundance graph + spectrum bar.
"""
import math, json
import numpy as np
from quark_port import build_quark_terms, wave_coeffs_from_terms

# ---------------- Mass Creation defaults (MassCreation.jsx) ----------------
ENTROPY = 60000
WAVE_AMP = 0.15
OMEGA = 0.6
GAIN = 2.0
SPAWN_SPAN = 1.6
MERGE_R = 0.35
N = min(1 + round(ENTROPY / 50), 20001)          # 1201
FORM_PROB = 0.95

terms = build_quark_terms(ENTROPY, None)         # seed undefined -> 0, as coded
C = wave_coeffs_from_terms(terms, N, WAVE_AMP)
print('N =', N)
print('C[1..4] =', [round(c, 4) for c in C[1:]])

def W(xi):
    return sum(C[f] * np.cos(f * xi) for f in range(1, 5))
def Wp(xi):
    return sum(-f * C[f] * np.sin(f * xi) for f in range(1, 5))

xi = np.linspace(0, 2 * math.pi, 200001)
w, wp = W(xi), Wp(xi)
caustic = 1.0 / (GAIN * 1.0)                    # env=1 at center: Wp <= -0.5
print('max|W|  =', round(float(np.max(np.abs(w))), 4))
print('max|Wp| =', round(float(np.max(np.abs(wp))), 4))
print('caustic threshold |Wp| >=', caustic,
      '-> caustics form:', bool(np.max(-wp) >= caustic))

i_min = int(np.argmin(wp))                      # strongest convergence
xi_star = float(xi[i_min])
print('strongest convergence at xi = %.4f rad (%.1f deg); min Wp = %.4f'
      % (xi_star, xi_star * 180 / math.pi, float(wp[i_min])))
# distance of strongest convergence from the 1:1 phase-agreement point xi=0
d0 = min(xi_star, 2 * math.pi - xi_star)
print('circular distance from xi=0 (1:1 agreement): %.4f rad = %.1f deg'
      % (d0, d0 * 180 / math.pi))
print('W(0) = %.4f (sum C_f = %.4f); Wp(0) = %.6f'
      % (float(W(0.0)), sum(C[1:]), float(Wp(0.0))))

# caustic crossings: Wp going down through -0.5
cross = []
for i in range(len(xi) - 1):
    if wp[i] > -caustic and wp[i + 1] <= -caustic:
        cross.append(float(xi[i]))
print('caustic crossings (down through -0.5):',
      [round(c, 3) for c in cross])

# ---------------- particle simulation: fire, ride, cluster ----------------
rng = np.random.default_rng(7)
n_fire = 900
times = [0.0, 2.0, 5.0, 10.0, 20.0, 40.0]

def cluster_labels(pos):
    n = len(pos)
    parent = np.arange(n)
    def find(a):
        while parent[a] != a:
            parent[a] = parent[parent[a]]; a = parent[a]
        return a
    d2 = ((pos[:, None, :] - pos[None, :, :]) ** 2).sum(-1)
    ii, jj = np.where((d2 < MERGE_R ** 2))
    for i, j in zip(ii, jj):
        if j <= i: continue
        ri, rj = find(i), find(j)
        if ri != rj: parent[rj] = ri
    return np.array([find(i) for i in range(n)])

phase_all = []     # co-moving phases of clustered members (x-axis)
n_cl_all = 0
for trial in range(6):
    rest = rng.uniform(-SPAWN_SPAN, SPAWN_SPAN, size=(n_fire, 3))
    for t in times:
        ph = OMEGA * t
        pos = np.stack([rest[:, a] + GAIN * W(rest[:, a] - ph) for a in range(3)], axis=1)
        lab = cluster_labels(pos)
        _, counts = np.unique(lab, return_counts=True)
        big = np.where(counts >= 4)[0]
        n_cl_all += len(big)
        for b in big:
            members = np.where(lab == np.unique(lab)[b])[0]
            phase_all.extend(((rest[members, 0] - ph) % (2 * math.pi)).tolist())

phase_all = np.array(phase_all)
print('\nclustered members sampled:', len(phase_all), 'in', n_cl_all, 'clusters(>=4)')

# predicted high-density zones: |1 + G*Wp| small  -> weight each phase by 1/|1+G*Wp|
pred = 1.0 / np.maximum(np.abs(1 + GAIN * wp), 1e-6)
pred /= pred.mean()
# histogram of observed phases vs uniform
bins = np.linspace(0, 2 * math.pi, 25)
obs, _ = np.histogram(phase_all, bins=bins)
ctr = 0.5 * (bins[:-1] + bins[1:])
exp_pred, _ = np.histogram(np.repeat(ctr, 40),
                           bins=bins, weights=np.tile(pred[::len(pred)//24][:24], 40))
# simpler: expected counts proportional to mean predicted density per bin
pb, _ = np.histogram(ctr, bins=bins, weights=1.0 / np.maximum(np.abs(1 + GAIN * Wp(ctr)), 1e-6))
corr = float(np.corrcoef(obs, pb)[0, 1])
print('correlation(observed cluster-phase histogram, predicted density): %.3f' % corr)

# fraction of clustered members within 0.35 rad of xi=0 (the 1:1 point)
near = np.minimum(phase_all, 2 * math.pi - phase_all)
frac_near = float(np.mean(near < 0.35))
print('fraction of clustered members within 0.35 rad of the 1:1 point: %.3f (uniform: %.3f)'
      % (frac_near, 0.35 / math.pi))

json.dump({
    'C': C[1:], 'max_abs_W': float(np.max(np.abs(w))),
    'max_abs_Wp': float(np.max(np.abs(wp))),
    'caustic_threshold': caustic,
    'xi_star': xi_star, 'min_Wp': float(wp[i_min]),
    'dist_to_1to1_deg': float(d0 * 180 / math.pi),
    'caustic_crossings': cross,
    'W_at_0': float(W(0.0)),
    'cluster_phase_corr': corr,
    'frac_near_1to1': frac_near,
}, open('mass_math_results.json', 'w'), indent=1)
print('\nwrote mass_math_results.json')
