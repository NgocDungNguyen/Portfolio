# Portfolio Admin

A local tool (no dependencies, Node 18+) to manage the portfolio's media:

1. **Scan** the live site (or local `index.html`) → every section with its text, images and which image files are missing.
2. **Add** images, mp4/webm files, or video links (YouTube / Vimeo / Facebook / direct URL) to any section, or **fill a broken image slot**.
3. **Store** files in Cloudflare R2 (recommended) or in the repo (small files only).
4. **Push** `content/media.json` (+ any repo-stored files) to a git branch for review.

The site reads `content/media.json` at load time (`index.html`, section "8b"), so nothing in the HTML needs hand-editing.

## Run

```bash
cd tools/portfolio-admin
cp .env.example .env     # then fill in (see below)
node server.js           # http://localhost:4173
```

It binds to `127.0.0.1` only and rejects requests with a foreign Host/Origin. `.env` is git-ignored and never sent to the browser.

## Cloudflare R2 setup (one time)

1. Cloudflare dashboard → **R2** → create bucket `portfolio-assets`.
2. Bucket → **Settings → Public access**: enable the `r2.dev` URL, or connect a custom domain such as `cdn.yourdomain.com` (better: free caching + your own URL).
3. **R2 → Manage API tokens → Create token**: permission *Object Read & Write*, scoped to that bucket only.
4. Put into `.env`: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE`.
5. Restart the tool — the header pill turns green (`R2: portfolio-assets`).

Without R2 the tool saves images to `images/uploads/<section>/` and videos to `videos/<section>/` (max 25 MB each) so they travel with the git push. mp4 files larger than that need R2 — don't put big binaries in git.

## What the manifest looks like

```json
{ "version": 1, "sections": {
  "ch4-capstone": {
    "replace": [ { "slot": "images/capstone_1.jpg", "type": "image", "src": "https://cdn…/capstone-1-ab12cd34.jpg", "alt": "…" } ],
    "extra":   [ { "type": "video", "src": "https://cdn…/demo.mp4", "caption": "Demo" },
                 { "type": "embed", "src": "https://youtu.be/…", "caption": "Pitch" } ]
  } } }
```

- `replace` swaps the file behind an existing slot (matched by the slot's original `src`).
- `extra` appends new media to the end of the section.
- Only `https://` URLs or repo-relative paths are accepted.

## Test

```bash
node test/run.js
```
