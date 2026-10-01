"""Exact Python port of the Harmonium quark-term generator (ConvolutionSurface.jsx),
plus verification against Node.js. Run: python3 quark_port.py --verify
"""
import subprocess, json, sys

def _u32(x): return x & 0xFFFFFFFF
def _i32(x):
    x &= 0xFFFFFFFF
    return x - 0x100000000 if x & 0x80000000 else x
def _imul(a, b): return _i32(_u32(a) * _u32(b))

def mulberry32(seed):
    # JS: let t = seed >>> 0 ;  seed=undefined -> 0
    t = _u32(0 if seed is None else seed)
    def rnd():
        nonlocal t
        t = t + 0x6D2B79F5
        u = _u32(t)
        r = _imul(_i32(u ^ (u >> 15)), _i32(1 | u))
        ur = _u32(r)
        r = _i32(r ^ _i32(r + _imul(_i32(ur ^ (ur >> 7)), _i32(61 | ur))))
        ur = _u32(r)
        return _u32(ur ^ (ur >> 14)) / 4294967296.0
    return rnd

FORMATION_STATES = [[-2, 2], [-1, 2], [1, 1], [-4, 1], [-3, 1]]
DECAY_STATES = [[2, 2], [1, 2], [-1, 1], [4, 1], [3, 1]]

def pick_weighted(rnd, table):
    r = rnd() * 7
    for q, w in table:
        r -= w
        if r <= 0: return q
    return table[-1][0]

def build_quark_terms(count, seed, formation_only=False):
    rnd = mulberry32(seed)
    terms = [{'q': 2, 'm': 1}, {'q': -1, 'm': 1}]
    while len(terms) < count:
        if formation_only or rnd() < 0.95:
            terms.append({'q': pick_weighted(rnd, FORMATION_STATES), 'm': 1})
        else:
            terms.append({'q': pick_weighted(rnd, DECAY_STATES), 'm': -1})
    return terms

SGN_GAMMA = 0.618033988749895
def wave_coeffs_from_terms(terms, N, a):
    import math
    C = [0.0]*5
    n = min(N, len(terms))
    for k in range(n):
        sgn = 1 if (math.floor((k+1)*SGN_GAMMA) % 2 == 0) else -1
        t = terms[k]
        C[abs(t['q'])] += t['m'] * sgn * (a / math.sqrt(k+1))
    return C

NODE_SRC = r"""
function mulberry32(seed) {
  let t = seed >>> 0
  return function () {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
const FORMATION_STATES = [[-2, 2], [-1, 2], [1, 1], [-4, 1], [-3, 1]]
const DECAY_STATES = [[2, 2], [1, 2], [-1, 1], [4, 1], [3, 1]]
function pickWeighted(rnd, table) {
  let r = rnd() * 7
  for (const [q, w] of table) { r -= w; if (r <= 0) return q }
  return table[table.length - 1][0]
}
function buildQuarkTerms(count, seed, formationOnly = false) {
  const rnd = mulberry32(seed)
  const terms = [{ q: 2, m: 1 }, { q: -1, m: 1 }]
  while (terms.length < count) {
    if (formationOnly || rnd() < 0.95) terms.push({ q: pickWeighted(rnd, FORMATION_STATES), m: 1 })
    else terms.push({ q: pickWeighted(rnd, DECAY_STATES), m: -1 })
  }
  return terms
}
const out = {}
for (const [label, count, seed] of [['a', 60000, undefined], ['b', 40, 60000], ['c', 40, 12345]]) {
  const ts = buildQuarkTerms(count, seed)
  out[label] = ts.map(t => [t.q, t.m])
}
console.log(JSON.stringify(out))
"""

def verify():
    p = subprocess.run(['node', '-e', NODE_SRC], capture_output=True, text=True)
    if p.returncode != 0:
        print('node failed:', p.stderr); sys.exit(1)
    js = json.loads(p.stdout)
    cases = {'a': (60000, None), 'b': (40, 60000), 'c': (40, 12345)}
    ok = True
    for label, (count, seed) in cases.items():
        py = [[t['q'], t['m']] for t in build_quark_terms(count, seed)]
        match = py == js[label]
        ok &= match
        print(f'case {label} (count={count}, seed={seed}): {"MATCH" if match else "MISMATCH"} '
              f'(terms={len(py)})')
        if not match:
            for i, (a, b) in enumerate(zip(py, js[label])):
                if a != b: print('  first diff at', i, a, b); break
    # also verify wave coeffs for the mass-creation defaults
    print('port verification:', 'OK' if ok else 'FAILED')
    return ok

if __name__ == '__main__':
    if '--verify' in sys.argv:
        sys.exit(0 if verify() else 1)
