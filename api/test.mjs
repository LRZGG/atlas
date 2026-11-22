// Self-test of the forecast API: proof of work, one vote per device, rate limit, weighting, hidden below MIN_SHOW, bot flag.
import assert from 'node:assert/strict';
import { createApi, weightOf, MIN_SHOW } from './handler.mjs';
import pow from './pow.js';
const mem = new Map(); let T = Date.parse('2026-11-21T10:00:00Z');
const store = { get: async k => mem.get(k) ?? null, put: async (k, v) => { mem.set(k, v); } };
let C = { 'c1': { closes: '2027-12-31', outcome: null }, 'old': { closes: '2025-01-01', outcome: null } };
const api = createApi({ store, secret: 's', claims: async () => C, now: () => T });
const call = (m, p, b, ip = '1.1.1.1') => api(new Request('http://x' + p, { method: m, headers: { 'x-forwarded-for': ip }, body: b ? JSON.stringify(b) : undefined })).then(async r => [r.status, await r.json()]);
const tok = () => [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
async function vote(claim, p, token = tok(), ip = '1.1.1.1', mut = x => x) {
  const [, ch] = await call('GET', '/api/challenge'); let counter = 0; while (!pow.powOk(ch.nonce, claim, token, counter, ch.bits)) counter++;
  return call('POST', '/api/vote', mut({ claim, token, p, ...ch, counter }), ip);
}
let [s, r] = await vote('c1', 30); assert.equal(s, 200); assert.equal(r.n, 1); assert.equal(r.all, undefined, 'hidden below MIN_SHOW');
const t1 = tok(); await vote('c1', 40, t1); [s, r] = await vote('c1', 60, t1); assert.equal(r.n, 2, 'same device counts once'); 
for (let i = 0; i < 3; i++) await vote('c1', 50, t1); [s] = await vote('c1', 50, t1); assert.equal(s, 409, 'edits are limited');
[s] = await vote('c1', 50, tok(), '2.2.2.2', b => ({ ...b, counter: b.counter + 1 })); assert.equal(s, 403, 'wrong work refused');
[s] = await vote('c1', 50, tok(), '2.2.2.2', b => ({ ...b, sig: 'x' })); assert.equal(s, 403, 'forged challenge refused');
[s] = await vote('c1', 150); assert.equal(s, 400); [s] = await vote('nope', 50); assert.equal(s, 404); [s] = await vote('old', 50); assert.equal(s, 409, 'closed question');
for (let i = 0; i < 25; i++) [s] = await vote('c1', 50, tok(), '3.3.3.3'); assert.equal(s, 429, 'rate limit per network');
// a bot army: 40 fresh devices at 99% from many networks
for (let i = 0; i < 40; i++) await vote('c1', 99, tok(), '9.9.9.' + i);
T += 61000; [s, r] = await call('GET', '/api/claim/c1'); assert.ok(r.n >= MIN_SHOW);
assert.equal(r.all, 99, 'the raw median is pushed by 40 fresh devices'); assert.equal(r.weighted, null, 'no weighted estimate without devices with a track record');
assert.equal(r.flag, true, 'bot burst flagged');
// honest devices with a track record: 5 resolved questions, well calibrated; then they all say 20 on c1
const out5 = { r1: true, r2: false, r3: true, r4: false, r5: true }, hon = Array.from({ length: 5 }, tok);
for (const id of Object.keys(out5)) C[id] = { closes: '2027-12-31', outcome: null };
for (const h of hon) for (const [id, o] of Object.entries(out5)) await vote(id, o ? 90 : 10, h, '5.5.5.' + hon.indexOf(h));
for (const [id, o] of Object.entries(out5)) C[id].outcome = o;
for (const h of hon) await vote('c1', 20, h, '6.6.6.' + hon.indexOf(h));
T += 61000; [s, r] = await call('GET', '/api/claim/c1');
console.log('raw median', r.all, '| weighted median', r.weighted, '| experienced', r.experienced, '| flag', r.flag, '| n', r.n);
assert.equal(r.weighted, 20, 'weighted estimate holds against the bot army'); assert.equal(r.all, 99, 'raw still pushed (shown with the flag)');
assert.equal(weightOf({ votes: {} }, {}), 0.05);
const good = { votes: { a: 90, b: 10, c: 90, d: 10, e: 90 } }, o = { a: true, b: false, c: true, d: false, e: true };
assert.ok(weightOf(good, o) > .9, 'well calibrated history weighs a lot'); assert.ok(weightOf({ votes: { a: 5, b: 95, c: 5, d: 95, e: 5 } }, o) < .06, 'badly calibrated history weighs little');
// horizon estimates: deduplicated per device, hidden below MIN_SHOW, shown once MIN_SHOW reached
for (let i = 0; i < MIN_SHOW; i++) { [s, r] = await call('POST', '/api/horizon', { qid: 'p-np', token: tok(), bin: i % 4 }, '7.7.7.' + i); assert.equal(s, 200); }
[s, r] = await call('GET', '/api/horizon/p-np'); assert.equal(s, 200); assert.equal(r.n, MIN_SHOW); assert.equal(r.bins.reduce((a, b) => a + b, 0), MIN_SHOW);
// anonymous "too technical" toggle
const ft = tok(); [s, r] = await call('POST', '/api/feedback', { qid: 'p-np', token: ft, on: true }, '8.8.8.1'); assert.equal(s, 200); assert.equal(r.n, 1);
[s, r] = await call('POST', '/api/feedback', { qid: 'p-np', token: ft, on: false }, '8.8.8.1'); assert.equal(s, 200); assert.equal(r.n, 0);
// no-account submission with PoW
const st = tok(), [, chS] = await call('GET', '/api/challenge'); let cS = 0; while (!pow.powOk(chS.nonce, 'submit:question', st, cS, chS.bits)) cS++;
[s, r] = await call('POST', '/api/submit', { kind: 'question', title: 'Why does glass stay disordered?', url: 'https://example.org/glass', note: 'Solid review.', token: st, ...chS, counter: cS }, '8.8.8.2');
assert.equal(s, 200); assert.equal(r.ok, true);
[s] = await call('POST', '/api/submit', { kind: 'question', title: 'Bad URL', url: 'javascript:alert(1)', token: st, ...chS, counter: cS }, '8.8.8.2');
assert.equal(s, 400, 'non-http URL refused');
console.log('api tests passed');
