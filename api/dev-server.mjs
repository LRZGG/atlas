// Local test server for the forecast API (in-memory store). Usage: node api/dev-server.mjs [port]
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { createApi } from './handler.mjs';
const mem = new Map(), store = { get: async k => mem.get(k) ?? null, put: async (k, v) => { mem.set(k, v); } };
const claims = async () => existsSync('docs/forecasts.json') ? JSON.parse(readFileSync('docs/forecasts.json', 'utf8')) : {};
export const api = createApi({ store, secret: process.env.FC_SECRET || 'dev-secret', claims, allowOrigin: '*' });
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = +process.argv[2] || 8787;
  createServer(async (rq, rs) => { const body = ['GET', 'HEAD'].includes(rq.method) ? undefined : await new Promise(r => { let d = ''; rq.on('data', c => d += c); rq.on('end', () => r(d)); });
    const res = await api(new Request('http://localhost' + rq.url, { method: rq.method, headers: { ...rq.headers, 'cf-connecting-ip': rq.socket.remoteAddress }, body }));
    rs.writeHead(res.status, Object.fromEntries(res.headers)); rs.end(await res.text()); }).listen(port, () => console.log('forecast dev API on', port));
}
