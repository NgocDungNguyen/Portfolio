'use strict';
// Zero-dependency tests: node test/run.js
const assert = require('assert');
const fs = require('fs'); const os = require('os'); const path = require('path');
const { sign, sha256hex } = require('../lib/sigv4');
const scan = require('../lib/scan');
const store = require('../lib/store');

// 1. SigV4 against AWS's published S3 example (GET Object with Range)
const r = sign({
  method: 'GET', host: 'examplebucket.s3.amazonaws.com', path: '/test.txt', headers: { range: 'bytes=0-9' },
  payloadHash: sha256hex(''), region: 'us-east-1', service: 's3',
  accessKeyId: 'AKIAIOSFODNN7EXAMPLE', secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', now: new Date('2013-05-24T00:00:00Z'),
});
assert.strictEqual(r.signature, 'f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41');

// 2. Scanner on the real index.html
const root = path.join(__dirname, '..', '..', '..');
const secs = scan.parse(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), 'http://local/');
const ids = secs.map((s) => s.id);
for (const id of ['hero', 'about', 'ch4-hackathon-2026', 'ch4-capstone', 'contact']) assert(ids.includes(id), 'missing section ' + id);
assert(secs.find((s) => s.id === 'ch4-capstone').images.length === 3);

// 3. Store helpers
assert.strictEqual(store.cleanSrc('javascript:alert(1)'), '');
assert.strictEqual(store.cleanSrc('http://x.com/a.jpg'), '');
assert.strictEqual(store.cleanSrc('../../etc/passwd'), '');
assert.strictEqual(store.cleanSrc('https://cdn.example.com/a.jpg'), 'https://cdn.example.com/a.jpg');
assert.strictEqual(store.typeFromUrl('https://x/y.mp4?z=1'), 'video');
assert.strictEqual(store.typeFromUrl('https://youtu.be/abc'), 'embed');
assert.strictEqual(store.ratio(1920, 1080), '16/9');
const png = Buffer.alloc(24); Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png); png.writeUInt32BE(800, 16); png.writeUInt32BE(600, 20);
assert.deepStrictEqual(store.probe(png), { w: 800, h: 600 });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'pa-'));
const m = store.load(tmp); store.addItem(m, 'about', { type: 'image', src: 'https://a/b.jpg' }); store.addItem(m, 'about', { type: 'image', src: 'https://a/c.jpg' }, 'images/x.jpg');
store.save(tmp, m); const m2 = store.load(tmp);
assert.strictEqual(m2.sections.about.extra.length, 1); assert.strictEqual(m2.sections.about.replace[0].slot, 'images/x.jpg');
store.removeItem(m2, 'about', 'extra', 0); store.removeItem(m2, 'about', 'replace', 0); assert.deepStrictEqual(m2.sections, {});
console.log('all tests passed');
