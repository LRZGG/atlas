// Cloudflare Worker entry. Bindings to create in the Cloudflare dashboard: KV namespace "FC" and secret "FC_SECRET".
// Variables: SITE (e.g. https://unknownpedia.org), used for CORS and to read /forecasts.json (claims, closing dates, outcomes).
// Deploy on a first-party subdomain (api.unknownpedia.org) so visitors never contact a third-party origin.
import { createApi } from './handler.mjs';
let cache = { t: 0, v: {} };
export default {
  async fetch(req, env) {
    const claims = async () => { if (Date.now() - cache.t > 10 * 60 * 1000) { try { cache = { t: Date.now(), v: await (await fetch(env.SITE + '/forecasts.json')).json() }; } catch (e) { /* keep the previous copy */ } } return cache.v; };
    const store = { get: k => env.FC.get(k), put: (k, v, ttl) => env.FC.put(k, v, ttl ? { expirationTtl: Math.max(60, ttl) } : undefined) };
    return createApi({ store, secret: env.FC_SECRET, claims, allowOrigin: env.SITE })(req);
  }
};
