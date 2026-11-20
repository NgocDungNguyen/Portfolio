'use strict';
// Parses the portfolio HTML (live or local) into sections: title, text blocks, images, embeds.
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rarr: '→', times: '×' };
const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (ENT[n.toLowerCase()] !== undefined ? ENT[n.toLowerCase()] : m));
const text = (h) => decode(h.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] !== undefined ? m[2] : m[3]) : '';
};

function parse(html, baseUrl) {
  const sections = [];
  const re = /<section\b([^>]*)>([\s\S]*?)<\/section>/gi;
  let m;
  while ((m = re.exec(html))) {
    const open = `<section ${m[1]}>`;
    const body = m[2];
    const id = attr(open, 'id');
    if (!id) continue;
    const blocks = [];
    const br = /<(h1|h2|h3|h4|p|li|dt|dd|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi;
    let b;
    while ((b = br.exec(body))) {
      if (/class="[^"]*\bvh\b/.test(b[0]) && b[1] !== 'h1') continue;
      const t = text(b[2]);
      if (t) blocks.push({ tag: b[1], text: t });
    }
    let heading = blocks.find((x) => x.tag === 'h2');
    if (!heading) {
      const vh = body.match(/<span class="vh">([\s\S]*?)<\/span>/);
      heading = vh ? { text: text(vh[1]) } : blocks.find((x) => x.tag === 'h1');
    }
    const images = [];
    const ir = /<img\b[^>]*>/gi;
    let i;
    while ((i = ir.exec(body))) {
      const src = attr(i[0], 'src');
      if (!src) continue;
      images.push({ src, alt: attr(i[0], 'alt'), url: resolve(src, baseUrl) });
    }
    const embeds = [];
    const er = /data-embed="([^"]+)"/gi;
    let e;
    while ((e = er.exec(body))) embeds.push(decode(e[1]));
    const links = [];
    const lr = /<a\b[^>]*href="(https?:[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    let l;
    while ((l = lr.exec(body))) links.push({ href: decode(l[1]), label: text(l[2]) });
    sections.push({
      id,
      title: heading ? heading.text : id,
      rail: attr(open, 'data-rail-full') || attr(open, 'data-rail') || '',
      theme: /light-section/.test(open) ? 'light' : 'dark',
      blocks, images, embeds, links,
      todoCount: (body.match(/\[TODO/g) || []).length,
    });
  }
  return sections;
}

function resolve(src, base) {
  try { return new URL(src, base).href; } catch { return src; }
}

module.exports = { parse, resolve };
