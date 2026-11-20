'use strict';
const { sign, sha256hex, encPath } = require('./sigv4');

function r2Config(env) {
  const c = {
    accountId: env.R2_ACCOUNT_ID, accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY, bucket: env.R2_BUCKET,
    publicBase: (env.R2_PUBLIC_BASE || '').replace(/\/+$/, ''),
  };
  c.enabled = !!(c.accountId && c.accessKeyId && c.secretAccessKey && c.bucket && /^https:\/\//.test(c.publicBase));
  return c;
}

async function call(cfg, method, key, body, contentType) {
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const path = `/${cfg.bucket}/${key}`;
  const payload = body || Buffer.alloc(0);
  const headers = {};
  if (contentType) headers['content-type'] = contentType;
  if (method === 'PUT') headers['cache-control'] = 'public, max-age=31536000, immutable';
  const s = sign({
    method, host, path, headers, payloadHash: sha256hex(payload),
    region: 'auto', service: 's3', accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey,
  });
  const res = await fetch(`https://${host}${encPath(path)}`, {
    method, headers: s.headers, body: method === 'PUT' ? payload : undefined,
  });
  if (!res.ok) {
    const t = (await res.text()).slice(0, 300);
    throw new Error(`R2 ${method} ${res.status}: ${t}`);
  }
}

const putObject = (cfg, key, body, type) => call(cfg, 'PUT', key, body, type);
const deleteObject = (cfg, key) => call(cfg, 'DELETE', key);
const publicUrl = (cfg, key) => `${cfg.publicBase}/${encPath(key)}`;

module.exports = { r2Config, putObject, deleteObject, publicUrl };
