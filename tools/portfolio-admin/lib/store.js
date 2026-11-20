'use strict';
// content/media.json read/write + validation + small helpers for uploads.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IMG = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif' };
const VID = { '.mp4': 'video/mp4', '.webm': 'video/webm' };

function manifestPath(root) { return path.join(root, 'content', 'media.json'); }

function load(root) {
  try {
    const m = JSON.parse(fs.readFileSync(manifestPath(root), 'utf8'));
    if (!m.sections || typeof m.sections !== 'object') m.sections = {};
    return m;
  } catch { return { version: 1, sections: {} }; }
}

function save(root, m) {
  const p = manifestPath(root);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(m, null, 2) + '\n');
  fs.renameSync(tmp, p);
}

function sectionIds(root) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  return new Set([...html.matchAll(/<section\b[^>]*\sid="([^"]+)"/g)].map((x) => x[1]));
}

function slug(s) {
  return String(s).toLowerCase().replace(/\.[^.]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'file';
}

function kindOf(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (IMG[ext]) return { type: 'image', ext, mime: IMG[ext] };
  if (VID[ext]) return { type: 'video', ext, mime: VID[ext] };
  return null;
}

// Read width/height from the first bytes of common image formats.
function probe(buf) {
  try {
    if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (buf.slice(0, 3).toString() === 'GIF') return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const mk = buf[i + 1];
        if (mk >= 0xc0 && mk <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(mk)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') {
      const t = buf.slice(12, 16).toString();
      if (t === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (t === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
      if (t === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
    }
  } catch { /* fall through */ }
  return null;
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
function ratio(w, h) { const g = gcd(w, h); return `${w / g}/${h / g}`; }

function objectKey(section, filename, buf, ext) {
  const h = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  return `portfolio/${section}/${slug(filename)}-${h}${ext}`;
}

// Accept https URLs or repo-relative paths only.
function cleanSrc(u) {
  u = String(u || '').trim();
  if (/^https:\/\/[^\s]+$/i.test(u)) return u;
  if (/^[\w][\w\-./() %]*$/.test(u) && !u.includes('..') && !/^[a-z][a-z0-9+.\-]*:/i.test(u)) return u;
  return '';
}

function typeFromUrl(u) {
  const ext = path.extname(u.split('?')[0]).toLowerCase();
  if (IMG[ext]) return 'image';
  if (VID[ext]) return 'video';
  return 'embed';
}

function addItem(m, section, item, slot) {
  const sec = (m.sections[section] = m.sections[section] || {});
  if (slot) {
    sec.replace = (sec.replace || []).filter((r) => r.slot !== slot);
    sec.replace.push({ slot, ...item });
  } else {
    sec.extra = sec.extra || [];
    sec.extra.push(item);
  }
}

function removeItem(m, section, kind, index) {
  const sec = m.sections[section];
  if (!sec || !Array.isArray(sec[kind]) || !sec[kind][index]) return null;
  const [gone] = sec[kind].splice(index, 1);
  if (!sec.replace?.length) delete sec.replace;
  if (!sec.extra?.length) delete sec.extra;
  if (!Object.keys(sec).length) delete m.sections[section];
  return gone;
}

module.exports = { load, save, sectionIds, kindOf, probe, ratio, objectKey, cleanSrc, typeFromUrl, addItem, removeItem, slug, IMG, VID };
