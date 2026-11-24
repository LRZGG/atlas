// Forecast API: no accounts, no money. Runs on Cloudflare Workers (see worker.js) or Node 18+ (dev-server.mjs).
// Protection against bot armies (none of it is foolproof; see METHOD.md):
//  1. one vote per device token per question (a device token is a random 128-bit value made in the browser; only its hash is stored);
//  2. a proof of work per vote (hashcash style), bound to the question and the token;
//  3. a limit of submissions per network (hashed IP, daily salt, never stored raw);
//  4. a new device weighs very little until it has a track record on resolved questions: the "weighted" estimate is the one to trust;
//  5. medians, not means, and nothing is shown below MIN_SHOW participants;
//  6. an "unusual activity" flag when most votes come from brand-new devices at the extremes.
import pow from './pow.js';
const { sha256hex, powOk } = pow;

export const MIN_SHOW = 10, POW_BITS = 17, MAX_PER_HOUR = 20, CHALLENGE_TTL = 10 * 60 * 1000, MAX_EDITS = 3;
const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
async function hmac(secret, msg) { const k = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); return hex(await crypto.subtle.sign('HMAC', k, enc.encode(msg))); }
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const json = (o, status = 200, h = {}) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...h } });
const median = a => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
function wmedian(pairs) { const s = pairs.filter(([, w]) => w > 0).sort((a, b) => a[0] - b[0]), tot = s.reduce((a, [, w]) => a + w, 0); if (!tot) return null; let c = 0; for (const [p, w] of s) { c += w; if (c >= tot / 2) return p; } return s[s.length - 1][0]; }

// Reputation: 0.05 for a device with no resolved question; up to 1 with a good calibration on at least 5 resolved questions.
export function weightOf(history, outcomes) {
  let k = 0, sum = 0;
  for (const [claim, p] of Object.entries(history?.votes || {})) { const o = outcomes[claim]; if (o === true || o === false) { k++; sum += (p / 100 - (o ? 1 : 0)) ** 2; } }
  if (!k) return 0.05;
  return 0.05 + 0.95 * Math.min(1, k / 5) * Math.max(0, 1 - 2 * sum / k);
}

// opts: { store: {get(k), put(k, v, ttlSeconds)}, secret, claims: async () => ({ [id]: { closes: 'YYYY-MM-DD', outcome: true|false|null } }), allowOrigin, now }
export function createApi(opts) {
  const { store, secret, claims, allowOrigin = '*' } = opts, now = opts.now || (() => Date.now());
  const cors = { 'access-control-allow-origin': allowOrigin, 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS', vary: 'origin' };
  const J = (o, s = 200) => json(o, s, cors);
  const rd = async k => { const v = await store.get(k); return v ? JSON.parse(v) : null; };

  async function aggregate(id, C) {
    const cached = await rd('agg:' + id); if (cached && now() - cached.t < 60000) return cached.v;
    const votes = (await rd('claim:' + id)) || {}, th = Object.keys(votes), outcomes = Object.fromEntries(Object.entries(C).map(([k, v]) => [k, v.outcome]));
    const hist = await Promise.all(th.map(h => rd('tok:' + h)));
    const rows = th.map((h, i) => ({ p: votes[h][0], first: hist[i]?.first ?? votes[h][1], w: weightOf(hist[i], outcomes) }));
    const n = rows.length, out = { n, min: MIN_SHOW };
    if (n >= MIN_SHOW) {
      out.all = median(rows.map(r => r.p));
      // Weighted estimate: devices without a track record (weight < 0.3) can never carry more than 30% of the total weight, however many there are,
      // and nothing is shown until at least 3 devices with a track record have voted.
      const hi = rows.filter(r => r.w >= .3), lo = rows.filter(r => r.w < .3), hiTot = hi.reduce((s, r) => s + r.w, 0), loTot = lo.reduce((s, r) => s + r.w, 0), cap = hiTot * 3 / 7, k = loTot > cap && loTot > 0 ? cap / loTot : 1;
      out.experienced = hi.length; out.weighted = hi.length >= 3 ? wmedian([...hi.map(r => [r.p, r.w]), ...lo.map(r => [r.p, r.w * k])]) : null;
      out.hist = Array.from({ length: 10 }, (_, b) => rows.filter(r => Math.min(9, Math.floor((r.p - 1) / 10)) === b).length);
      const fresh = rows.filter(r => now() - r.first < 864e5);
      out.flag = n >= 20 && fresh.length / n > .5 && fresh.length >= 15 && fresh.filter(r => r.p <= 5 || r.p >= 95).length / fresh.length > .6;
    }
    await store.put('agg:' + id, JSON.stringify({ t: now(), v: out }), 120); return out;
  }

  return async function handle(req) {
    const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '');
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const C = await claims();
    if (req.method === 'GET' && path === '/api/challenge') {
      const exp = now() + CHALLENGE_TTL, nonce = hex(crypto.getRandomValues(new Uint8Array(12))), bits = POW_BITS;
      return J({ nonce, exp, bits, sig: await hmac(secret, `${nonce}.${exp}.${bits}`) });
    }
    const m = path.match(/^\/api\/claim\/([a-z0-9-]+)$/);
    if (req.method === 'GET' && m) { if (!C[m[1]]) return J({ error: 'unknown claim' }, 404); return J(await aggregate(m[1], C)); }
    if (req.method === 'POST' && path === '/api/vote') {
      let b; try { b = await req.json(); } catch { return J({ error: 'bad json' }, 400); }
      const c = C[b.claim]; if (!c) return J({ error: 'unknown claim' }, 404);
      if (c.outcome === true || c.outcome === false || now() > Date.parse(c.closes + 'T23:59:59Z')) return J({ error: 'closed' }, 409);
      if (!/^[0-9a-f]{32}$/.test(b.token || '') || !Number.isInteger(b.p) || b.p < 1 || b.p > 99) return J({ error: 'bad vote' }, 400);
      if (!(b.exp > now()) || b.bits !== POW_BITS || b.sig !== await hmac(secret, `${b.nonce}.${b.exp}.${b.bits}`)) return J({ error: 'bad challenge' }, 403);
      if (!Number.isInteger(b.counter) || !powOk(b.nonce, b.claim, b.token, b.counter, POW_BITS)) return J({ error: 'bad work' }, 403);
      const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'local', day = new Date(now()).toISOString().slice(0, 10);
      const rlk = 'rl:' + (await sha(`${secret}|${day}|${ip}`)).slice(0, 24) + ':' + Math.floor(now() / 36e5), cnt = +((await store.get(rlk)) || 0);
      if (cnt >= MAX_PER_HOUR) return J({ error: 'rate limited' }, 429);
      await store.put(rlk, String(cnt + 1), 3700);
      const th = (await sha(secret + '|tok|' + b.token)).slice(0, 32), votes = (await rd('claim:' + b.claim)) || {}, old = votes[th];
      if (old && old[3] >= MAX_EDITS) return J({ error: 'too many edits' }, 409);
      const tok = (await rd('tok:' + th)) || { first: now(), votes: {} };
      votes[th] = [b.p, now(), tok.first, old ? old[3] + 1 : 0]; tok.votes[b.claim] = b.p;
      await store.put('claim:' + b.claim, JSON.stringify(votes)); await store.put('tok:' + th, JSON.stringify(tok)); await store.put('agg:' + b.claim, '', 1);
      return J({ ok: true, ...(await aggregate(b.claim, C)) });
    }
    const hm = path.match(/^\/api\/horizon\/([a-z0-9-]+)$/);
    if (req.method === 'GET' && hm) {
      const votes = (await rd('hor:' + hm[1])) || {}, vals = Object.values(votes), n = vals.length;
      const out = { n, min: MIN_SHOW };
      if (n >= MIN_SHOW) out.bins = [0, 1, 2, 3].map(k => vals.filter(v => v === k).length);
      return J(out);
    }
    if (req.method === 'POST' && path === '/api/horizon') {
      let b; try { b = await req.json(); } catch { return J({ error: 'bad json' }, 400); }
      if (!/^[a-z0-9-]{2,64}$/.test(b.qid || '') || !/^[0-9a-f]{32}$/.test(b.token || '') || !Number.isInteger(b.bin) || b.bin < 0 || b.bin > 3) return J({ error: 'bad horizon' }, 400);
      const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'local', day = new Date(now()).toISOString().slice(0, 10);
      const rlk = 'rl:' + (await sha(`${secret}|${day}|${ip}`)).slice(0, 24) + ':' + Math.floor(now() / 36e5), cnt = +((await store.get(rlk)) || 0);
      if (cnt >= MAX_PER_HOUR) return J({ error: 'rate limited' }, 429);
      await store.put(rlk, String(cnt + 1), 3700);
      const th = (await sha(secret + '|tok|' + b.token)).slice(0, 32), votes = (await rd('hor:' + b.qid)) || {};
      votes[th] = b.bin; await store.put('hor:' + b.qid, JSON.stringify(votes));
      const vals = Object.values(votes), n = vals.length, out = { ok: true, n, min: MIN_SHOW };
      if (n >= MIN_SHOW) out.bins = [0, 1, 2, 3].map(k => vals.filter(v => v === k).length);
      return J(out);
    }
    if (req.method === 'POST' && path === '/api/feedback') {
      let b; try { b = await req.json(); } catch { return J({ error: 'bad json' }, 400); }
      if (!/^[a-z0-9-]{2,64}$/.test(b.qid || '') || !/^[0-9a-f]{32}$/.test(b.token || '')) return J({ error: 'bad feedback' }, 400);
      const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'local', day = new Date(now()).toISOString().slice(0, 10);
      const rlk = 'rl:' + (await sha(`${secret}|${day}|${ip}`)).slice(0, 24) + ':' + Math.floor(now() / 36e5), cnt = +((await store.get(rlk)) || 0);
      if (cnt >= MAX_PER_HOUR) return J({ error: 'rate limited' }, 429);
      await store.put(rlk, String(cnt + 1), 3700);
      const th = (await sha(secret + '|tok|' + b.token)).slice(0, 32), set = (await rd('tech:' + b.qid)) || {};
      if (b.on === false) delete set[th]; else set[th] = 1;
      await store.put('tech:' + b.qid, JSON.stringify(set));
      return J({ ok: true, n: Object.keys(set).length });
    }
    if (req.method === 'POST' && path === '/api/submit') {
      let b; try { b = await req.json(); } catch { return J({ error: 'bad json' }, 400); }
      const kind = b.kind, title = String(b.title || '').trim(), src = String(b.url || '').trim(), note = String(b.note || '').trim();
      if (!['question', 'claim', 'correction'].includes(kind) || title.length < 6 || title.length > 220 || !/^https?:\/\/\S+$/i.test(src) || src.length > 400 || note.length > 600 || !/^[0-9a-f]{32}$/.test(b.token || '')) return J({ error: 'bad submission' }, 400);
      if (!(b.exp > now()) || b.bits !== POW_BITS || b.sig !== await hmac(secret, `${b.nonce}.${b.exp}.${b.bits}`)) return J({ error: 'bad challenge' }, 403);
      if (!Number.isInteger(b.counter) || !powOk(b.nonce, 'submit:' + kind, b.token, b.counter, POW_BITS)) return J({ error: 'bad work' }, 403);
      const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'local', day = new Date(now()).toISOString().slice(0, 10);
      const rlk = 'rl:' + (await sha(`${secret}|${day}|${ip}`)).slice(0, 24) + ':' + Math.floor(now() / 36e5), cnt = +((await store.get(rlk)) || 0);
      if (cnt >= MAX_PER_HOUR) return J({ error: 'rate limited' }, 429);
      await store.put(rlk, String(cnt + 1), 3700);
      const id = now() + '-' + (await sha(b.token + '|' + title)).slice(0, 8);
      const list = (await rd('subs:list')) || [];
      list.unshift({ id, at: new Date(now()).toISOString(), kind, title, url: src, note });
      await store.put('subs:list', JSON.stringify(list.slice(0, 500)));
      return J({ ok: true, id });
    }
    const im = path.match(/^\/api\/illusion\/([a-z0-9-]+)$/);
    if (req.method === 'GET' && im) {
      const votes = (await rd('ill:' + im[1])) || {}, vals = Object.values(votes), n = vals.length;
      const out = { n, min: MIN_SHOW };
      if (n >= MIN_SHOW) { const known = vals.filter(v => v === 1).length; out.known = known; out.pct = Math.round(100 * known / n); }
      return J(out);
    }
    if (req.method === 'POST' && path === '/api/illusion') {
      let b; try { b = await req.json(); } catch { return J({ error: 'bad json' }, 400); }
      if (!/^[a-z0-9-]{2,64}$/.test(b.qid || '') || !/^[0-9a-f]{32}$/.test(b.token || '') || typeof b.thoughtKnown !== 'boolean') return J({ error: 'bad illusion' }, 400);
      const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'local', day = new Date(now()).toISOString().slice(0, 10);
      const rlk = 'rl:' + (await sha(`${secret}|${day}|${ip}`)).slice(0, 24) + ':' + Math.floor(now() / 36e5), cnt = +((await store.get(rlk)) || 0);
      if (cnt >= MAX_PER_HOUR) return J({ error: 'rate limited' }, 429);
      await store.put(rlk, String(cnt + 1), 3700);
      const th = (await sha(secret + '|tok|' + b.token)).slice(0, 32), votes = (await rd('ill:' + b.qid)) || {};
      votes[th] = b.thoughtKnown ? 1 : 0; await store.put('ill:' + b.qid, JSON.stringify(votes));
      const vals = Object.values(votes), n = vals.length, out = { ok: true, n, min: MIN_SHOW };
      if (n >= MIN_SHOW) { const known = vals.filter(v => v === 1).length; out.known = known; out.pct = Math.round(100 * known / n); }
      return J(out);
    }
    const PR_IDS = new Set(['longevite', 'conscience', 'mental', 'climat', 'cancer', 'vaccins', 'cosmos', 'physique', 'quantique', 'origine', 'ia', 'anesthesie']);
    const prioSummary = votes => {
      const voters = Object.values(votes), n = voters.length, out = { n, min: MIN_SHOW };
      if (n >= MIN_SHOW) {
        const counts = {}; for (const id of PR_IDS) counts[id] = 0;
        for (const picks of voters) if (Array.isArray(picks)) for (const id of picks) if (PR_IDS.has(id)) counts[id]++;
        out.counts = counts;
      }
      return out;
    };
    if (req.method === 'GET' && path === '/api/priorities') {
      const votes = (await rd('prio:votes')) || {};
      return J(prioSummary(votes));
    }
    if (req.method === 'POST' && path === '/api/priorities') {
      let b; try { b = await req.json(); } catch { return J({ error: 'bad json' }, 400); }
      const picks = Array.isArray(b.picks) ? [...new Set(b.picks)].filter(id => PR_IDS.has(id)) : [];
      if (!/^[0-9a-f]{32}$/.test(b.token || '') || picks.length < 1 || picks.length > 3 || picks.length !== (Array.isArray(b.picks) ? b.picks.length : 0)) return J({ error: 'bad priorities' }, 400);
      const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'local', day = new Date(now()).toISOString().slice(0, 10);
      const rlk = 'rl:' + (await sha(`${secret}|${day}|${ip}`)).slice(0, 24) + ':' + Math.floor(now() / 36e5), cnt = +((await store.get(rlk)) || 0);
      if (cnt >= MAX_PER_HOUR) return J({ error: 'rate limited' }, 429);
      await store.put(rlk, String(cnt + 1), 3700);
      const th = (await sha(secret + '|tok|' + b.token)).slice(0, 32), votes = (await rd('prio:votes')) || {};
      votes[th] = picks; await store.put('prio:votes', JSON.stringify(votes));
      return J({ ok: true, ...prioSummary(votes) });
    }
    return J({ error: 'not found' }, 404);
  };
}
