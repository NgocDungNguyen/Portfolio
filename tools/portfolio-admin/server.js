'use strict';
// Portfolio admin — local only. Run: node server.js  →  http://localhost:4173
const http = require('http');
const fs = require('fs');
const path = require('path');
const scan = require('./lib/scan');
const store = require('./lib/store');
const r2 = require('./lib/r2');
const gitlib = require('./lib/git');

// ---- env (.env is optional, never logged, never sent to the browser) ----
function loadEnv(file) {
  const out = {};
  try {
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m && !line.trim().startsWith('#')) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* no .env */ }
  return out;
}
const ENV = { ...loadEnv(path.join(__dirname, '.env')), ...process.env };
const ROOT = path.resolve(process.env.REPO_ROOT || path.join(__dirname, '..', '..'));
const PORT = +(ENV.PORT || 4173);
const SITE_URL = ENV.SITE_URL || 'https://ngocdungnguyen.github.io/Portfolio/';
const GIT_BRANCH = ENV.GIT_BRANCH || 'content/media-updates';
const R2 = r2.r2Config(ENV);
const MAX_IMG = 25 * 1024 * 1024, MAX_VID = 300 * 1024 * 1024, MAX_LOCAL_VID = 25 * 1024 * 1024;

const json = (res, code, obj) => { const b = JSON.stringify(obj); res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(b); };
const fail = (res, code, msg) => json(res, code, { error: msg });

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let n = 0;
    req.on('data', (c) => { n += c.length; if (n > limit) { reject(Object.assign(new Error('File too large'), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function mapLimit(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; out[k] = await fn(items[k]); }
  }));
  return out;
}

async function head(url) {
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    return r.status;
  } catch { return 0; }
}

async function doScan(source, siteUrl) {
  let html, base, live = source === 'live';
  if (live) {
    const u = new URL(siteUrl);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') throw new Error('Site URL must be http(s)');
    const r = await fetch(u.href, { signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'portfolio-admin/1.0' } });
    if (!r.ok) throw new Error(`Live site returned ${r.status}`);
    html = await r.text(); base = u.href;
  } else {
    html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'); base = 'http://local/';
  }
  const sections = scan.parse(html, base);
  const manifest = store.load(ROOT);
  const all = sections.flatMap((s) => s.images);
  const uniq = [...new Set(all.map((i) => i.url))];
  const status = {};
  await mapLimit(uniq, 8, async (url) => {
    status[url] = live ? await head(url) : (fs.existsSync(path.join(ROOT, decodeURIComponent(new URL(url).pathname))) ? 200 : 404);
  });
  for (const s of sections) {
    for (const im of s.images) {
      im.status = status[im.url] || 0;
      im.preview = live ? im.url : `/repo/${im.src.split('/').map(encodeURIComponent).join('/')}`;
    }
    s.manifest = manifest.sections[s.id] || {};
  }
  return { source, base, scannedAt: new Date().toISOString(), sections, r2: { enabled: R2.enabled, publicBase: R2.publicBase || null } };
}

function guard(req, res) {
  const host = (req.headers.host || '').toLowerCase();
  if (host !== `localhost:${PORT}` && host !== `127.0.0.1:${PORT}`) { fail(res, 403, 'Bad host'); return false; }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const origin = req.headers.origin;
    if (origin !== `http://${host}` || req.headers['x-admin'] !== '1') { fail(res, 403, 'Cross-origin request blocked'); return false; }
  }
  return true;
}

const STATIC = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json' };
function serveFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) return fail(res, 404, 'Not found');
    res.writeHead(200, { 'content-type': STATIC[path.extname(file).toLowerCase()] || 'application/octet-stream', 'x-content-type-options': 'nosniff', 'cache-control': 'no-store' });
    res.end(buf);
  });
}
const inside = (base, target) => { const r = path.relative(base, target); return r && !r.startsWith('..') && !path.isAbsolute(r); };

const server = http.createServer(async (req, res) => {
  try {
    if (!guard(req, res)) return;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const p = url.pathname;

    if (req.method === 'GET' && (p === '/' || p === '/index.html')) return serveFile(res, path.join(__dirname, 'public', 'index.html'));
    if (req.method === 'GET' && p.startsWith('/repo/')) {
      const rel = decodeURIComponent(p.slice(6));
      const f = path.resolve(ROOT, rel);
      const top = rel.split('/')[0];
      if (!inside(ROOT, f) || !['images', 'videos', 'content'].includes(top)) return fail(res, 403, 'Forbidden');
      return serveFile(res, f);
    }

    if (req.method === 'GET' && p === '/api/config')
      return json(res, 200, { siteUrl: SITE_URL, branch: GIT_BRANCH, r2: { enabled: R2.enabled, bucket: R2.bucket || null, publicBase: R2.publicBase || null }, root: ROOT });

    if (req.method === 'GET' && p === '/api/scan') {
      const source = url.searchParams.get('source') === 'local' ? 'local' : 'live';
      return json(res, 200, await doScan(source, url.searchParams.get('site') || SITE_URL));
    }

    if (req.method === 'POST' && p === '/api/upload') {
      const section = url.searchParams.get('section') || '';
      const slot = url.searchParams.get('slot') || '';
      if (!store.sectionIds(ROOT).has(section)) return fail(res, 400, 'Unknown section');
      const filename = decodeURIComponent(req.headers['x-filename'] || 'file');
      const kind = store.kindOf(filename);
      if (!kind) return fail(res, 400, 'Unsupported file type (jpg, png, webp, gif, avif, mp4, webm)');
      const buf = await readBody(req, kind.type === 'video' ? MAX_VID : MAX_IMG);
      if (!buf.length) return fail(res, 400, 'Empty file');
      const key = store.objectKey(section, filename, buf, kind.ext);
      let src, where;
      if (R2.enabled) {
        await r2.putObject(R2, key, buf, kind.mime);
        src = r2.publicUrl(R2, key); where = 'r2';
      } else {
        if (kind.type === 'video' && buf.length > MAX_LOCAL_VID) return fail(res, 400, 'mp4/webm over 25 MB needs Cloudflare R2 configured (see README). Use a YouTube/Vimeo link or set up R2.');
        const dir = kind.type === 'video' ? 'videos' : path.join('images', 'uploads');
        const rel = path.join(dir, section, path.basename(key));
        fs.mkdirSync(path.join(ROOT, path.dirname(rel)), { recursive: true });
        fs.writeFileSync(path.join(ROOT, rel), buf);
        src = rel.split(path.sep).join('/'); where = 'git';
      }
      const dims = kind.type === 'image' ? store.probe(buf) : null;
      const item = { type: kind.type, src, alt: url.searchParams.get('alt') || '', caption: url.searchParams.get('caption') || '' };
      if (dims) { item.w = dims.w; item.h = dims.h; if (!slot) item.ratio = store.ratio(dims.w, dims.h); }
      const m = store.load(ROOT);
      store.addItem(m, section, item, slot || null);
      store.save(ROOT, m);
      return json(res, 200, { ok: true, where, item });
    }

    if (req.method === 'POST' && p === '/api/link') {
      const body = JSON.parse((await readBody(req, 64 * 1024)).toString() || '{}');
      if (!store.sectionIds(ROOT).has(body.section)) return fail(res, 400, 'Unknown section');
      const src = store.cleanSrc(body.url);
      if (!src) return fail(res, 400, 'URL must be https:// (or a path inside the repo)');
      const type = body.type && ['image', 'video', 'embed'].includes(body.type) ? body.type : store.typeFromUrl(src);
      const item = { type, src, alt: String(body.alt || '').slice(0, 200), caption: String(body.caption || '').slice(0, 200) };
      const m = store.load(ROOT);
      store.addItem(m, body.section, item, body.slot || null);
      store.save(ROOT, m);
      return json(res, 200, { ok: true, item });
    }

    if (req.method === 'POST' && p === '/api/remove') {
      const body = JSON.parse((await readBody(req, 16 * 1024)).toString() || '{}');
      if (!['extra', 'replace'].includes(body.kind)) return fail(res, 400, 'Bad kind');
      const m = store.load(ROOT);
      const gone = store.removeItem(m, body.section, body.kind, +body.index);
      if (!gone) return fail(res, 404, 'Item not found');
      store.save(ROOT, m);
      let purged = false;
      if (body.purge && R2.enabled && gone.src.startsWith(R2.publicBase + '/')) {
        const key = decodeURIComponent(gone.src.slice(R2.publicBase.length + 1));
        if (key.startsWith('portfolio/')) { await r2.deleteObject(R2, key); purged = true; }
      }
      return json(res, 200, { ok: true, purged });
    }

    if (req.method === 'GET' && p === '/api/git') return json(res, 200, await gitlib.status(ROOT));

    if (req.method === 'POST' && p === '/api/push') {
      const body = JSON.parse((await readBody(req, 16 * 1024)).toString() || '{}');
      const msg = String(body.message || 'content: update portfolio media').slice(0, 200);
      return json(res, 200, await gitlib.push(ROOT, body.branch || GIT_BRANCH, msg));
    }

    fail(res, 404, 'Not found');
  } catch (e) {
    fail(res, e.code === 413 ? 413 : 500, e.message || 'Server error');
  }
});

if (require.main === module) {
  server.listen(PORT, '127.0.0.1', () => {
    console.log(`Portfolio admin → http://localhost:${PORT}`);
    console.log(`Repo: ${ROOT}`);
    console.log(`Storage: ${R2.enabled ? `Cloudflare R2 (${R2.bucket})` : 'git only (R2 not configured — see README)'}`);
  });
}
module.exports = { server, doScan };
