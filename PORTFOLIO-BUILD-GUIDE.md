# June Nguyen Portfolio — Analysis & Build Guide

## Context

June Nguyen (Nguyen Ngoc Dung) is building a "perfect" digital portfolio. A working scaffold already
exists (`index.html` + `images/`). Three downloaded reference projects sit alongside it, to be
harvested for their best parts:

- **`Sample Landing/sylva-hero/`** — the landing / hero section.
- **`Sample Content/kage-optimise/`** — the effects, 3D image transitions, scroll motion.
- **`Sample Portfolio/ngothihoangngan.github.io/`** — the writing style and content structure.

This document is the detailed analysis of all four, plus the plan for merging the best of each into
June's site. It is written to be coded from directly — every effect is traced to a technique and a
build step. **No portfolio code has been written yet**; this is the reference to build against.

**Locked decisions:**
1. **Approach: Hybrid.** Rebuild the hero as a self-contained WebGL landing using Sylva's *systems*
   (layout unit, entrance choreography, magnetic dock, liquid-metal button). Keep the existing
   8-chapter structure for the rest of the page; layer Kage's DOM-level effects onto it. Rewrite all
   copy. Stays one `index.html`, no build step.
2. **Hero visual: kinetic typography + WebGL atmosphere.** Keep the big animated "JUNE NGUYEN"
   type; back it with a WebGL atmospheric layer (drifting motes/embers, fog, shader gradient, grain,
   pointer parallax) — not a bespoke modelled object.
3. **Copy: full rewrite** (Part 9), section by section, in the reference portfolio's evidence-driven
   voice, using June's real material. Numbers/facts marked `[TODO:]` need confirming.

**Repo note:** the three `Sample *` folders are in `.gitignore` — they are reference material only,
one of them (`kage-optimise`) carries **no license**, and each has a nested `.git/`. They must not be
published with June's site.

---

## Part 0 — How to use this document

- **Parts 1–4** are the analysis: June's current site, then each sample, then a "what we take" list.
- **Part 5** is licensing — read before copying anything. Kage is *reference only*.
- **Parts 6–8** are the target build: architecture, the hero spec, and an effect-by-effect catalogue
  that names, for each effect, the **Superpowers Skill** to use so we build clean-room instead of
  copying Kage's code.
- **Part 9** is the full copy rewrite — paste-ready, edit the numbers.
- **Parts 10–11** are the image plan and the perf/a11y/responsive checklist.
- **Parts 12–13** are the phased roadmap and how to verify each phase.

Everything is scoped to stay **one hand-authored `index.html`, no npm, no bundler**, matching both
June's current site and all three samples. Three.js is vendored (r149, ~608 KB, already present in two
of the samples). GSAP + ScrollTrigger + Lenis stay on CDN (already in June's site).

---

## Part 1 — June's current portfolio: full audit

### 1.1 What exists

| Item | State |
|---|---|
| `index.html` | 738 lines, one file. `<style>` in head, DOM, then GSAP + ScrollTrigger + Lenis from CDN and one inline `<script>`. |
| `images/` | **14 real files.** The HTML references **~130 image paths** — ~116 are placeholders that 404 today. |
| Build tooling | None. `.vscode/` holds a stray C/C++ Runner config, irrelevant. |
| Git | 3 commits, `main`. Last: "Fix desktop scroll lag and add image lightbox". |

### 1.2 Tech stack (current)

- **Fonts:** Playfair Display (serif headings), Archivo Black (`.bold-type`, hero), Space Grotesk
  (body) — Google Fonts.
- **Libs:** GSAP 3.12.5 + ScrollTrigger (cdnjs), Lenis 1.0.27 (jsdelivr `studio-freight/lenis`).
- **CSS:** custom properties (`--pure-black`, `--accent:#ff3c00`, `--light-bg:#f4f1ea`, …), global
  `cursor:none`, `overflow-x:hidden`, a `body.light-mode` theme, one `@media (max-width:768px)`.
- **No `prefers-reduced-motion` handling anywhere.** No perf tiering. No WebGL.

### 1.3 Structure (the 8-chapter narrative — keep this spine)

| Section id | Chapter label | Content |
|---|---|---|
| `.hero` | — | Kinetic per-letter "JUNE / NGUYEN" (Archivo Black, `clamp(4rem,15vw,16rem)`), subtitle "IT · BUSINESS ANALYST", faint `me.jpg` at 0.3 opacity behind. |
| `#about` | `00 · PROFILE` + `EDUCATION` | Bio spread + RMIT / QUT timeline. |
| `#ch1-2018` | `01 · FOUNDATION OF EVERYTHING` | 2018 Robotacon Hanoi + IYRC Vietnam, two 1st prizes. FB video embed. |
| `#ch1-2019` | — | 2019/2020 Seoul — Excellent Award, then Silver. |
| `#ch1-timeline` | `THE PODIUM RECORD` | Horizontal-scroll strip 2017→2021. |
| `#ch2-pivot` | `02 · A NEW BEGINNING` *(light)* | 2022 Australia pivot, handy jobs. |
| `#ch2-uniqlo` | `UNIQLO AUSTRALIA` *(light)* | 9 months, only STEM student on the floor. |
| `#ch3-2023` | `03 · EDISON AN KHANH` | 2-week sprint → 3 seasons, 12 teams (VEX IQ). |
| `#ch3-2024` | — | 4 teams, 6 awards; Mentor of the Year; SSET article; LinkedIn video. |
| `#ch3-2025` | — | 4 new teams, autonomous focus; first Think Award + 2 Spirit. |
| `#ch3-ai` | — | 2025-26 AI mentoring — Editech: autism-detection (1st), toxic-content filter (3rd). |
| `#ch4-network` | `04 · THE RMIT ECOSYSTEM` *(light)* | SAT + Student Council. |
| `#ch4-clubs` | — *(light)* | IEC (HR Exec Assistant) + BUFI (External Affairs). |
| `#ch4-sset` | — *(light)* | ITSE Ambassador & Future Tech Camp Facilitator. |
| `#ch4-hackathon` | — *(light)* | Hackathons. |
| `#ch4-tapxanh` | `GLOBAL LEADERSHIP EXPERIENCE` *(light)* | TapXanh public-transport pitch. |
| `#ch4-pitch` | — *(light)* | Perfect Pitch 2025 + 2026. |
| `#ch5-genesis` | `05 · PROFESSIONAL PATH` | Genesis Escape — Game Master. |
| `#ch5-fpt` | — | FPT IS — Project Coordinator Intern. |
| `#ch5-bss` | — | BSS Commerce — Business Analyst. |
| `#projects` | `06 · KEY PROJECTS` | MatureCare, TapXanh, Inventory app. |
| `#awards` | `07 · RECOGNITION` | Inspiring Leaders, RMIT Choice Top 5, Dean's List, Minister welcome. |
| `#contact` | `08 · CONTACT` *(light)* | Contact list + **fake** `alert()` demo form. |

### 1.4 Current effects (inventory — what's already here)

- Kinetic hero: per-`<span>` letters animate `opacity/translateY/rotate` in with GSAP stagger.
- `ScrollTrigger.batch('.reveal-up', …)` staggered reveals.
- Custom cursor dot (`gsap.to` on mousemove), progress bar, SVG film-grain overlay with `@keyframes grain`.
- Sticky CTA pill with `@keyframes pulse`.
- Light/dark: `ScrollTrigger.create` per `.light-section` toggles `body.light-mode`.
- Image lightbox (built in JS, Esc/backdrop close).
- Horizontal-scroll track, mosaic/offset/grid layouts.
- Facebook + LinkedIn `<iframe>` embeds (heavy, privacy-leaky).

### 1.5 Bugs / issues to fix during the rebuild

1. **Line 223** — `images/358583564_1652563545253361_3227352357123657327_n.jpg/` has a trailing slash → broken.
2. **`cursor:none` globally** with a JS-driven dot → if JS fails or on reduced-motion, there is no
   visible cursor at all. Gate `cursor:none` behind a `.js` + `(pointer:fine)` check.
3. **`loading="lazy"` on the hero image** (`me.jpg`) — above the fold, should be eager.
4. **Contact form is a demo** (`onsubmit="alert('Message sent! (Demo)')"`). Wire to Formspree (the
   reference site uses `formspree.io/f/…`) or Netlify Forms.
5. **No reduced-motion path.** Every sample handles this in *both* CSS and JS; June's has none.
6. **FB/LinkedIn iframes** load on page load. Convert to click-to-load posters.
7. **~116 missing images** — see Part 10.
8. `about_me.jpg` was 16 MB in commit 1 (now 269 KB). Keep a hard image-weight budget.
9. Hero letters have no `aria-label` — the `<h1>` reads as "J U N E N G U Y E N" to a screen reader.
   Wrap with a visually-hidden real "June Nguyen".

### 1.6 Keep / change / kill

- **Keep:** the 8-chapter chronological narrative and its section ids; light/dark section switching;
  the lightbox; the progress bar; GSAP + ScrollTrigger + Lenis; Archivo Black for display type.
- **Change:** the hero (→ Part 7); all copy (→ Part 9); reveal system (→ Kage's word-by-word +
  `[data-rv]`); the film grain (→ keep the div, add the shader-grain term only in the hero canvas);
  transitions between chapters (→ Kage's foreground-stage handoff where images stack at a section).
- **Kill:** the fake form; eager iframes; global `cursor:none`; grayscale-free but unoptimised images.

---

## Part 2 — Sample A: `Sample Landing/sylva-hero` (the landing)

### 2.1 What it is

A standalone extract of Meng To's `SylvaHero` component from **ThreeUI Community**
(`github.com/MengTo/threeui`), **MIT licensed**. One file, `index.html` (~4,300 lines). Renders a
procedural mossy branch in **Three.js r149** (no ES modules, global `THREE`), with drifting pollen, a
butterfly, floating content cards, a magnetic dock, two "liquid-metal" WebGL buttons, and a
parallax camera. **No GSAP, no Lenis, no ScrollTrigger** — there is nothing to scroll; it's a fixed
`100svh` hero. All motion is CSS transitions/keyframes + plain `requestAnimationFrame`.

### 2.2 The transferable systems (this is what we take)

| System | Where | What it does | Port difficulty |
|---|---|---|---|
| **`--u` proportional unit** | `:root{--u:calc(100vw/1600)}`, capped at `min-width:1900px`, re-based at `max-width:900px` | Every dimension is `calc(N*var(--u))`. Pixel-faithful fluid scaling with **zero `clamp()`**. The single most useful idea in the file. | **Easy** |
| **Entrance choreography** | `.js` pre-state → forced reflow → `body.is-ready` → per-element `style="--d:760ms"` → `body.intro-done` (2.9 s) clears clip-paths so they stop trapping stacking contexts | `.mask` (inset wipe), `.mask-circle` (circle reveal), `.fade`, headline rise. Generic, rename nothing. | **Easy** |
| **Pointer-parallax layers** | `.par` class + `--px/--py` on a root (eased pointer, lerp 0.055, writes rounded to 3 dp and skipped if unchanged → idle page does zero work) + per-element `--pd` (px) / `--pr` (deg) | Drop-in for any hero. | **Easy** |
| **Magnetic dock** | `initDock`/`drawDock`/`drawSpec` (~150 lines) | Proximity magnification + pointer-tracking specular rim, spring-eased, keyboard-mirrored, **disabled on touch** (`(hover:hover) and (pointer:fine)`), all on one shared rAF with layout reads kept inside the frame. Re-skin the pill CSS, swap glyphs. | **Easy–Medium** |
| **Specular rim** | `[data-spec]::after` — a `conic-gradient` masked to a 1px border, angle points back at the pointer | Reusable "lit glass edge" for any card/nav/button. | **Easy** |
| **Liquid-metal button** | `mountLiquidMetal(host)` IIFE (~800 lines), its **own** WebGL2 context per button | 5-pass dispersion renderer. Self-contained, mounts on any `[data-liquid-metal]` host, tunables on `window.__P/__E/__C/__R`, has its own reduced-motion + 30 Hz idle cap + `!gl` text fallback. Fully re-colourable via uniforms. | **Medium** (large but isolated) |
| **Graceful-degradation stack** | `.js` flag gates hidden states; `if(!window.THREE){ready();return;}`; `if(!gl)` swaps to text; `pointerType==='touch'` early-returns | Page fully works with no WebGL / no JS. | **Easy** |
| **Perf-tier pattern** | `small = narrow || area<620000` → fewer particles, `antialias:false`, DPR cap 1.6 vs 2; `REDUCED = matchMedia('(prefers-reduced-motion:reduce)')` kills wind/parallax/scan/spray; `?blades=N` URL override | Template for June's hero. | **Easy** |

### 2.3 What we do NOT take

- **The entire moss/branch Three.js world** (~2,600 lines): tapered-tube limbs traced off *that*
  artwork's alpha channel, 190k instanced moss blades, bark/lichen/fern/flower/swallowtail-butterfly
  shaders, the "survey pulse" scan-in. It is a bespoke botanical illustration. June's hero uses a far
  simpler atmosphere layer (Part 7).
- The green palette (`#383b34` / `#4a4d44` page, warm floor-light pools, `--card:#f2f3ef`).
- The copy ("Step into / the living world"), nav labels (Grove / Habitats / Journal), the "SYLVA"
  ghost wordmark, the leaf-mark SVGs, the two moss card photos, and `<title>`.
- **Lexend** — swap for June's display face (Archivo Black) + body (Space Grotesk). Note: the dock
  re-measures on `document.fonts.ready` because label widths set pill widths — keep that hook.

### 2.4 Colour / easing tokens worth copying verbatim

```
--ease:     cubic-bezier(.22,.61,.36,1)
--ease-out: cubic-bezier(.16,1,.3,1)
```

---

## Part 3 — Sample B: `Sample Content/kage-optimise` (the effects)

### 3.1 What it is

A five-chapter cinematic night-walk through a fictional Kyoto mountain temple, **Three.js r149** +
**Lenis 1.3.4** (currently from unpkg — self-host if lifted). One file, `index.html` (~4,844 lines).
A fixed full-viewport `#gl` canvas is the environment; one continuous camera path is driven by page
scroll; editorial text + generated image plates + alpha-WebP foreground cut-outs are layered over.
Custom multi-pass bloom/grade (no `EffectComposer`). No GSAP — all tweening is a hand-rolled
`damp(cur,to,rate,dt) = lerp(cur,to,1-exp(-rate*dt))` frame-rate-independent smoother.

**`README.md` / `PROMPT.md`** frame it as an "editorial art book moving through a live 3D world."
The README explicitly notes two techniques were extracted into standalone Agent Skills: **falling
leaves** and **pointer-trail-emitter** — those Skills are the sanctioned way to reuse them.

### 3.2 The "3D image transition" — how it actually works (important)

There is **no shader cross-dissolve, no displacement map, no GSAP-uniform tween** between images. The
effect is four cooperating mechanisms:

1. **One continuous camera scrub.** `RIG.smooth` is exponentially damped toward
   `progressFor(scrollY)` (a float 0–5 = chapter + fraction) at rate 5.2/s. That one scalar samples
   two `CatmullRomCurve3`s (position + look-at, tension 0.42) plus a per-segment FOV `lerp`. Every
   section is a *composed shot of the same scene*, not a scene swap. Reduced-motion → `RIG.smooth =
   RIG.prog` (instant).
2. **Depth-driven opacity dissolves** as the camera flies through layers:
   `opacity = smoothstep(0.9, 4.6, camera.position.z - plane.position.z)` — a plane is invisible
   until the camera is >0.9 u behind it, full by 4.6 u. The camera "walks through" veils instead of
   hitting a hard wall.
3. **DOM foreground-stage handoff** (pure CSS + one IntersectionObserver): when a section becomes the
   most-intersecting, its `.fg` block is re-parented into a top-level `#fg-sky` host and gets
   `.fg-active` (children fade/slide up, staggered `--fg-delay` 0/90/180/270 ms). The outgoing stage
   gets `.fg-retiring` → `opacity:0; transform:translate3d(0,8vh,0) scale(.98); filter:blur(18px)`,
   parked after 820 ms. **This is the "images arrive at full opacity, pin while active, then fade and
   blur away during handoff" effect** — and it needs no WebGL.
4. **Live scissored 3D viewports** blitted into DOM card rects (the fanciest; optional for June).

### 3.3 Effect inventory — clean/generic vs theme-locked

**Cleanly generic (drop-in / low risk):**

| Effect | Kage lines (ref only) | Superpowers Skill to use instead |
|---|---|---|
| Lenis smooth-scroll config + reduced-motion gate | 4757–4772 | `cinematic-gsap-lenis-motion-system` |
| `damp()` + `smooth`/`easeOut` helpers | 1224–1232 | — (2 lines, re-type) |
| Scroll→camera spline rig (Catmull-Rom pos+target, damped param, per-waypoint FOV, portrait fit, intro dolly, pointer parallax) | 4036–4087 | `build-threejs-scroll-worlds` |
| Foreground stage handoff (arrive → pin fixed → blur/slide/fade retire) | CSS 640–809, JS 4207–4273 | `masked-reveal` + `progressive-blur` |
| Multi-mip bloom + grade composite (threshold → 4× ½-res 13-tap Gaussian → additive upsample → CA + ACES + split-tone + vignette + animated grain + fade + gamma + contrast) | 3930–4033 | `build-threejs-scroll-worlds` (post section) |
| Cursor wisp / pointer-trail emitter (Points as camera child, emit-by-distance) | 3260–3383 | **`pointer-trail-emitter`** |
| Instanced leaf-fall, camera-cone recycling, two-axis tumble | 3175–3258 | **`falling-leaves`** |
| WebGL2 cloth-draped image (96² wave-eq sim, pointer brush imprint, 2-pass SDF shader) | 3385–3877 | `webgl-3d-object` / `masked-reveal` (or skip) |
| CSS word-by-word heading reveal (keeps `aria-label`) | 4168–4196 | **`staggered-word-reveal`** / `scroll-scrubbed-word-reveal` |
| `[data-rv]` IntersectionObserver reveal, per-group stagger | 4148–4166 | `animation-on-scroll` |
| Scroll-linked hero exit (per-element `at`/`span` windows, blur on flat elements) | 4275–4329 | `scroll-progress-timeline` |
| Two-track non-harmonic CSS glow/flame | CSS 311–353 | `beam-glow-states` |
| Static procedural film grain (180² noise → dataURL → `mix-blend:overlay`) + shader grain term | 4435–4444 | `atmosphere-background` |
| Static vignette div + shader vignette term | CSS 55–58 | `atmosphere-background` |
| Custom cursor ring (fine-pointer only, lerp-follow, `.act` on `[data-cursor]`) | 4415–4433 | `add-shader-cursor-trail` (or keep June's dot) |
| Auto-hide / stuck nav on scroll | 4378–4392 | `animation-systems` |
| Fixed progress rail built from `[data-cam]` | 4331–4345 | `scroll-progress-timeline` |
| Ambient rising motes / embers (Points shader, rise+wrap, size attenuation) | 3093–3123 | **`ambient-section-particles`** / `thinking-orbs` |
| Adaptive-resolution governor (`PERF.scale` walk from real frame times) | 4580–4602 | `optimize-web-animations` / `performance-profiling` |
| Foreground plane sway + edge-feather (`onBeforeCompile`, height²-weighted sway, smoothstep alpha) | 2960–2989 | `ambient-section-particles` |
| Depth-based layer dissolve (`opacity = smooth(near,far, camZ - planeZ)`) | updateWorld 4649–4655 | `build-threejs-scroll-worlds` |
| `.no-webgl` progressive-enhancement fallback | CSS 354–380 | — (mirror the pattern) |

**Theme-locked (do NOT reuse — Kyoto/shrine specific):** the procedural temple/torii/lantern/maple
geometry; the yakisugi/lacquer/granite/blood-moon/shoji canvas textures; the near-black split-tone
grade (teal shadows / warm highlights) tuned for a night temple; Japanese display type + copy; the
per-section foreground WebP placements; the camera waypoint numbers.

### 3.4 Perf / a11y patterns to carry over wholesale

- `dt = min(raw, 0.05)` so a stall never teleports the camera; the governor reads the *unclamped* raw.
- `document.hidden` / `visibilitychange` pause the main loop; IntersectionObserver + settle-detection
  stop sub-simulations (cloth self-terminates when `energy < .004`).
- Shadows baked once (`shadow.autoUpdate = false` after boot — nothing that casts a shadow moves).
- Every surface texture is a runtime `<canvas>` → zero image files for the 3D scene → first paint
  needs only `index.html` + Three.js. Favicon/fonts/grain are data URIs.
- `prefers-reduced-motion`: camera snaps, Lenis disabled, intro skipped, CSS animations ~0 ms,
  reveals immediate, foreground stages park without blur.
- `?q=low|high`, `?post=0`, `?dpr=n`, `?nogl=1`, `?shot=0..5` debug flags — worth adding `?shot=N`
  deterministic states for screenshotting.

---

## Part 4 — Sample C: `ngothihoangngan.github.io` (the writing style)

### 4.1 What it is

The real single-page graduate portfolio of **Ngo Thi Hoang Ngan**, a final-year RMIT Vietnam
Business student (Logistics & SCM + Finance). Vanilla HTML/CSS/JS on GitHub Pages, **5 languages** via
`translations.js` (a `window.I18N` map: flat `ui` dot-path dict + `projects`/`experiences` objects),
independent light/dark theme, background music, a Formspree booking form, Swiss-industrial visual
language (near-black on white, one hard RMIT-red accent, condensed black display type, IBM Plex Mono
labels).

> **We are taking the *writing style and content architecture only* — not her code, her copy, her
> name, her images, or her audio.** She is a real person; June's rewrite must be original.

### 4.2 The organising conceit — the "metaphor spine"

Every section is titled after a **real freight document**: `01 / Consignee Details` → About;
`02 / Bill of Lading` → Projects; `03 / Route Log` → Experience; `04 / Customs Declaration` →
Capabilities; `05 / Cargo Tags` → Skills; `06 / Certificate of Origin` → Awards; `07 / Delivery
Details` → Contact. Jobs are "stops" on a "Route Log"; the hero stat block is a "manifest"; the CV is
a "Cargo Manifest Attachment"; extracurriculars are "Crew Logistics". Playful, never breaks
character. **June needs her own spine — see Part 9.1 / Part 6.4.**

### 4.3 Voice & tone (the rules)

1. **First person singular, throughout.** "I turn…", "I learned to notice a gap before being asked
   to fix it." Third person only in referee quotes.
2. **Confident, never boastful.** Every claim is immediately cashed out in a number or a named
   artifact. The words *passionate, hard-working, team player, detail-oriented* never appear in her
   own prose — only inside referee quotes.
3. **Reflective / self-aware.** Every capability card ends with a candid limitation ("Next
   development: build stronger SQL and dashboard automation").
4. **Metrics-driven and diagnostic.** The engine is *observed number → deeper number → what it
   means*: "2025's observed 223 downtime hours looked survivable, but the simulation put the true
   expected mean at 320 hours a year."
5. **Narrative, not list-dump.** Projects are "a progression … each one built the capability the next
   one needed", jobs are titled to show motion: "Event Member → Coordinator → Mentor".
6. **Plain-language payoff lines** break the jargon: "systems that actually run", "scale without
   breaking", "just applied to people instead of freight."

### 4.4 Sentence mechanics

- **Em dash is the signature** — appositive expansion and the punch-line aside, ~1–2 per sentence.
- **Long diagnostic sentence, then a short verdict.**
- **Triads / parallel lists** inside one sentence.
- **Colon as "here's the breakdown" pivot**, then an enumerated scope: "Coordinated recruitment-event
  logistics at scale: 9 Unifairs, 29 High School Tours, 10 Information Days, 3 Experience Days…".
- **Middot `·`** for scannable meta-lines: "Focus: Carrier comparison · Route design · Incoterms".
- **Bullets open with a strong past-tense verb**, never "Responsible for": *Grew, Directed, Led, Ran,
  Coordinated, Diagnosed, Modelled, Built, Traced, Reconciled, Benchmarked, Mapped, Stress-tested.*
- **Numbers never rounded away**, given as a contrast pair: "from 66 to 152 members", "$959,248 vs.
  $354,829", "320 hrs … vs. 223 hrs observed".
- **Named specifics over categories:** real companies, real places, real model IDs.
- Consistent spelling (she uses British: *analysed, organisation, modelling*). June can pick US or
  British — just be consistent.

### 4.5 The 9-part case-study template (use for June's projects + big experiences)

**Card (teaser):** arc claim (one first-person sentence, e.g. *"I can turn interviews into
requirements."*) → code (`PRJ-0x · CATEGORY`) → title (`Method / Deliverable — Client or System`) →
**one** body sentence (what you analysed + the reframe) → 2 featured stats (`number + unit` /
short contrast label) → focus line (`Focus: technique · technique · technique`) → tool chips.

**Modal / expandable (9 parts, each tight):**
1. **The challenge** — 1–2 sentences. Name the real entity, the constraint, the starting setup. No
   solution yet.
2. **My role** — 3 verb-first bullets: what *you personally* owned vs. the team.
3. **Approach** — 3 bullets, method steps in order.
4. **Findings** — 2–3 bullets, each a number or a named result, ≥1 as a contrast pair; include the
   counter-intuitive one.
5. **Recommendation** — exactly one declarative sentence: "Recommended [action], and [action]."
6. **Impact** — one sentence on what it's worth / what it changed. Prefer "reframed / delivered a
   reusable tool / identified a change worth X" over "helped".
7. **Evidence** — 2–4 captioned screenshots/charts.
8. **Capabilities demonstrated** — 2 bullets, each `**Attribute:** one line`.
9. **Skills acquired** — 3 noun-phrase chips.

**Governing principles:** name specifics not categories; lead with diagnosis, end with a decision;
every claim gets a number or an artifact; the voice stays calm because the metrics don't.

### 4.6 Structural features worth adopting

- Single page, ~7–8 anchored sections + expandable case-study detail + a separate `cv.html`.
- Card-teaser → detail split (short promise on the card, full 9-part in the modal).
- Grouped **skill tag clouds** naming *methods not buzzwords* ("Time-Series Forecasting (ARIMA/ETS)",
  not "analytical"). Languages get a proficiency word, not a %.
- **Education written as an argument**, not a data row (two short reflective paragraphs).
- One **referee quote** under the bio, one on the strongest experience — 1–2 sentences, trimmed with
  "…", attributed `— Name, Title, Org`.
- A **sticky "open to roles" pill** after 60% of hero, hides at contact, dismissible.
- Count-up stat numbers; bidirectional IntersectionObserver reveals; a real (Formspree) booking form
  with intent pills + a toast confirmation.
- **Do NOT** copy the background-music autoplay — it's a UX/a11y liability and not on-brand for June.

---

## Part 5 — Licensing & attribution (read before copying anything)

| Project | License | What June may do |
|---|---|---|
| **`sylva-hero`** | **MIT**, © 2026 Meng To (ThreeUI Community). Bundled Three.js MIT; Lexend SIL OFL 1.1. | May use, modify, ship. **Must keep the MIT copyright + permission notice** in any copied substantial portion. Best practice: re-implement the *systems* (they're small patterns) and add a short credit comment — `/* Hero systems adapted from ThreeUI SylvaHero by Meng To, MIT */`. Don't ship the "SYLVA" branding or copy. |
| **`kage-optimise`** | **No license granted** — README: *"kept public for reference and review only."* Three.js remains MIT. | **Do not copy its code, shaders, or assets.** Techniques (a Catmull-Rom camera on scroll, depth-dissolve, bloom) are not themselves copyrightable, but the specific implementation is. **Rebuild each effect clean-room** using the Superpowers Skills named in Part 3.3 / Part 8. The author's own extracted Skills (`falling-leaves`, `pointer-trail-emitter`) are the blessed path. |
| **`ngothihoangngan.github.io`** | Personal site of a real person, no license. | **Style and structure only.** No verbatim copy, no images, no `translations.js`, no name, no audio file. June's text must be original and about June. |

**Repo hygiene:** the three `Sample *` folders each contain a nested `.git/`. They are in
`.gitignore` so (a) Kage's unlicensed code isn't redistributed under June's deploy, and (b) tooling
stops tripping on nested repos. Keep them out of the build; delete them from the working tree once
this guide is settled.

---

## Part 6 — Target architecture (the hybrid build)

### 6.1 File & tech

- **One `index.html`**, hand-authored, no build step. Same as today.
- **Vendored** `assets/three.min.js` (r149 — copy from either sample; keep its MIT header).
- **CDN:** GSAP 3.12.5 + ScrollTrigger, Lenis (bump to 1.3.x, or vendor it). Google Fonts:
  Archivo Black + Space Grotesk (+ optionally Playfair for one accent).
- Optional: `cv.html` (Ngan-style PDF viewer) later.
- New folder `assets/` for `three.min.js`, fonts if self-hosted, and any real foreground PNGs.

### 6.2 Layer stack (z-index map for the whole page)

```
 0    #hero-gl        fixed canvas, hero only (atmosphere), fades out after hero
 1    section scrims / .guides
 2    page content (the 8 chapters)
 3    parked .fg foreground stages
45    .rail  (chapter progress rail, desktop)
50    header / dock
52    #fg-sky  (the ACTIVE foreground stage, re-parented here)
55    #vignette (static radial)
60    #grain    (static tiled noise, mix-blend:overlay, opacity ~.05)
80    .cursor-dot (fine-pointer only)
100   #preloader
10000 progress-bar
10001 lightbox
```

### 6.3 Load / boot order (from Sylva + Kage)

1. Inline `<script>document.documentElement.className+=' js'</script>` first — gates all
   pre-entrance hidden states so no-JS users see the finished layout.
2. Fonts: `document.fonts.ready` before the dock measures pill widths.
3. `ready()` (entrance: add `body.is-ready`) fires **before** the heavier WebGL build; a
   `setTimeout(ready, 4000)` failsafe so the page is never left invisible.
4. `if (!window.THREE) { ready(); return; }` — page fully works with no hero canvas.
5. Double `requestAnimationFrame`, then build the hero atmosphere scene inside `try/catch`.
6. One page-wide `requestAnimationFrame` loop: Lenis raf → ScrollTrigger.update → parallax writes
   (rounded, skipped if unchanged) → dock spring → hero scene render (only while hero in view).
7. `body.intro-done` ~2.9 s later: clear clip-paths so they stop holding stacking contexts.

### 6.4 The metaphor spine for June (recommended)

**"Commit history / build log"** — signals IT fluency the way Ngan's freight docs signal logistics,
and maps naturally onto a chronological story (commits over time). Section-tag rename:

| Current label | New tag | Section title |
|---|---|---|
| hero eyebrow | `$ whoami` or `System Manifest — Portfolio 2026` | JUNE NGUYEN |
| `00 · PROFILE` | `00 / README.md` | About |
| `01 · FOUNDATION` | `01 / init — first commit` | Foundation: Robotics |
| `02 · A NEW BEGINNING` | `02 / hard reset` | The Pivot |
| `03 · EDISON AN KHANH` | `03 / long-running branch` | Mentorship |
| `04 · THE RMIT ECOSYSTEM` | `04 / merge` | The RMIT Ecosystem |
| `05 · PROFESSIONAL PATH` | `05 / deploy to production` | Professional Path |
| `06 · KEY PROJECTS` | `06 / repositories` | Key Projects |
| `07 · RECOGNITION` | `07 / releases & tags` | Recognition |
| `08 · CONTACT` | `08 / open a pull request` | Contact |

*Alternative spine (if "commit history" feels too on-the-nose):* a **robotics control loop** —
`SENSE / PLAN / ACT / CALIBRATE / ITERATE` — mapped across the same chapters. Keep whichever, but
commit to one and use its vocabulary in the marquee, the rail labels, and the section tags.

---

## Part 7 — Hero rebuild spec (kinetic type + WebGL atmosphere + Sylva systems)

### 7.1 Layout

- Adopt Sylva's **`--u` unit**: `:root{--u:calc(100vw/1440)}`, `@media(min-width:1800px){--u:calc(1800px/1440)}`,
  `@media(max-width:820px){--u:calc(100vw/720)}`. Position hero elements with `calc(N*var(--u))` on a
  centred `.stage` (negative margins, **not** `transform` — a transform opens a stacking context that
  would trap elements under the canvas).
- Hero fills `100svh` desktop, `height:auto` ≤820 px.

### 7.2 Type

- Keep **"JUNE / NGUYEN"** in Archivo Black, `font-size:calc(120*var(--u))` (≈ current
  `clamp(4rem,15vw,16rem)`), `line-height:.8`, `letter-spacing:-.03em`.
- Keep the per-letter `<span>` split, but wrap the `<h1>` content with a visually-hidden real
  "June Nguyen" for screen readers and set the spans `aria-hidden`.
- Entrance: Sylva-style — spans start `opacity:0; transform:translateY(110%) rotate(8deg)`, animate to
  0 with `transition:transform 1.25s var(--ease-out) var(--d), opacity 1.05s var(--ease) var(--d)`,
  per-letter `--d` ladder (`i*45ms`). (Can stay GSAP if preferred — same result.)
- Subtitle "IT · BUSINESS ANALYST · ROBOTICS MENTOR" in Space Grotesk, tracked out, `.fade --d:1s`.
- Add a **"manifest" stat row** (Ngan pattern) — 4 hard numbers as `<dl>`:
  `Top 1%` GPA · `12` VEX IQ teams mentored · `9+` national/international robotics podiums ·
  `200+` daily Scrum syncs coordinated. Count-up on load.

### 7.3 WebGL atmosphere (`#hero-gl`)

Small, cheap, generic — **not** a modelled object. Build with the `atmosphere-background` +
`ambient-section-particles` Skills. Scene contents:

- `WebGLRenderer({alpha:true, antialias:!small})`, `setPixelRatio(min(dpr, small?1.6:2))`,
  `ACESFilmicToneMapping`, exposure ~1.1, transparent clear.
- **Gradient backdrop:** one full-screen shader plane — vertical dark gradient
  (`--pure-black` → a near-black warm `#0a0705`) + a soft off-centre glow lobe in `--accent`
  (`#ff3c00`) at low alpha, very slow drift.
- **Drifting motes / embers:** `THREE.Points`, count `small?600:1400`, GPU-animated from a `uTime`
  uniform — slow rise + wrap in a tall column, lateral sine wander, size attenuation
  `gl_PointSize = uSize*seed/max(-mv.z,0.6)`, twinkle `0.55+0.45*sin(...)`, `AdditiveBlending`,
  warm-amber tint. (This is Kage's ember shader pattern, rebuilt from the Skill.)
- **Fog:** `scene.fog = new THREE.FogExp2(0x0a0705, ~0.02)` for depth on the motes.
- **Pointer parallax:** camera `position.x = -smooth.x*20`, `position.y = smooth.y*12`,
  `lookAt(x*0.4, y*0.4, 0)`, `smooth` lerped at 0.055. Same eased-and-rounded write loop as Sylva so
  an idle hero costs nothing.
- **Film grain:** the animated grain *term* (one line of hash noise) in the gradient shader's
  fragment, `~0.02` amplitude — plus keep the existing DOM `#grain` div for the rest of the page.
- **Scroll-out:** as the hero leaves, fade `#hero-gl` opacity → 0 over the first ~60% of a viewport
  of scroll (Kage's `wireHeroExit` pattern) and **stop rendering it** once fully scrolled past
  (`renderer` loop early-returns when hero `intersectionRatio === 0`).

### 7.4 Sylva systems wired into the hero

- **Magnetic dock** as the header nav: pills for `README · robotics · mentorship · rmit · work ·
  projects · contact`, proximity magnification + specular rim, keyboard-mirrored, **off on touch**.
- **Liquid-metal button** for the primary CTA "Contact June" (replaces the current `.sticky-cta`),
  re-coloured to `--accent` via its uniforms; `!gl` → plain styled `<a>`.
- **Specular rim** (`[data-spec]::after`) reused on chapter cards and the dock.
- **`.par` pointer-parallax layers** for the stat row, subtitle, and a faint portrait.

### 7.5 Fallbacks (non-negotiable)

- No JS → finished static hero (the `.js` gate).
- No WebGL → no `#hero-gl`, kinetic type + gradient CSS background only.
- `prefers-reduced-motion` → no mote motion, no parallax, no letter rotation; type just fades in;
  `body.intro-done` at 0 ms.
- Touch / coarse pointer → no dock magnification, no custom cursor, no liquid-metal pointer tracking.

---

## Part 8 — Effects catalogue: what goes where

For each effect: the target section, and the **Skill** to build it with (so nothing is copied from
Kage). Phase numbers reference Part 12.

| # | Effect | Applies to | Skill(s) | Phase |
|---|---|---|---|---|
| 1 | `--u` unit + entrance choreography (`.mask` / `.mask-circle` / `.fade` / `--d` ladder) | Hero, then reused page-wide for section intros | `agency-grid-layout-minimal`, `masked-reveal` | 2 |
| 2 | WebGL hero atmosphere (gradient shader + motes + fog + grain term + pointer parallax) | Hero `#hero-gl` | `atmosphere-background`, `ambient-section-particles`, `webgl-3d-object` | 3 |
| 3 | Magnetic dock + specular rim | Header nav; rims on cards | `animation-systems`, `beam-glow-states` | 3 |
| 4 | Liquid-metal CTA button | Hero CTA, contact CTA | `liquid-metal-border` (or port Sylva's, keeping MIT note) | 3 |
| 5 | Word-by-word heading reveal (keeps real text as `aria-label`) | Every chapter `<h2>` | **`staggered-word-reveal`**, `scroll-scrubbed-word-reveal` | 2 |
| 6 | `[data-rv]` staggered reveals (replace `.reveal-up`) | All chapter body copy, images | `animation-on-scroll` | 2 |
| 7 | Foreground-stage handoff (images arrive full-opacity → pin → blur/slide/fade out) | Chapters with image clusters (`#ch1-2018`, `#ch3-2024`, `#ch3-2025`, `#ch3-ai`, `#ch4-*`) | `masked-reveal`, `progressive-blur`, `scroll-scrubbed-visual-sequence` | 4 |
| 8 | Scroll-linked hero exit (fade/blur hero foot elements over first 60% vh) | Hero → chapter 00 handoff | `scroll-progress-timeline` | 3 |
| 9 | Pointer-trail emitter (subtle spark trail on fine pointers) | Whole page, above canvas | **`pointer-trail-emitter`**, `add-shader-cursor-trail` (pick one; keep it restrained) | 5 |
| 10 | Falling leaves / drifting particles per section (optional, thematic — e.g. circuit dots, code glyphs) | 1–2 accent sections only | **`falling-leaves`**, `ambient-section-particles` | 5 |
| 11 | Chapter progress rail from `[data-cam]` / section ids | Fixed right, desktop | `scroll-progress-timeline` | 4 |
| 12 | Auto-hide / "stuck" nav on scroll | Header | `animation-systems` | 4 |
| 13 | Count-up stat numbers | Hero manifest, chapter stat callouts | `number-details` | 3 |
| 14 | Marquee with the spine's vocabulary ("SHIP IT", "REFACTOR THE PLAN", "LEAD BY MERGE") | One divider strip | `marquee-loop` | 4 |
| 15 | Smooth-scroll (Lenis) tuned + reduced-motion gate; one shared rAF | Global | `cinematic-gsap-lenis-motion-system` | 1 |
| 16 | Case-study card → expandable 9-part detail | `#projects`, big experiences | `editorial-portfolio-chapters`, `reveal-hover-effect` | 6 |
| 17 | Formspree contact form + intent pills + toast; sticky "open to roles" pill | `#contact` | `editorial-service-booking` (form patterns), `pricing-page` (pill patterns) | 6 |
| 18 | Adaptive-resolution governor + `visibilitychange` pause + `dt` clamp + reduced-motion (CSS+JS) | Hero canvas + all sub-loops | `optimize-web-animations`, `performance-profiling` | 7 |
| 19 | Lightbox (keep June's, add focus-trap + `aria`) | All `.img-placeholder img` | `animation-on-scroll` | 7 |
| 20 | `.no-webgl` / no-JS progressive-enhancement mirrors | Global | — (mirror the sample pattern) | 7 |

> **Deliberately skipped:** Kage's live scissored 3D card viewports and the WebGL2 cloth-image — high
> effort, marginal payoff for a CV-style portfolio. Revisit only if June wants a signature "wow"
> piece later.

---

## Part 9 — Full copy rewrite

Voice: first person singular, calm, evidence-first. Verb-first past-tense bullets. Em dash for the
aside. Contrast-pair metrics. Named specifics. Spelling: **pick British or US and keep it consistent**
(examples below use British to match the reference; switch if June prefers). **Every bracketed
`[TODO: …]` is a number or fact June must confirm.**

### 9.1 Hero

- **Eyebrow:** `System Manifest — Portfolio 2026`
- **H1:** JUNE NGUYEN
- **Role line:** `IT · Business Analyst · Robotics & AI Mentor`
- **Tagline:** *"I turn messy, people-heavy problems into systems that run — combining enterprise
  software know-how, business analysis, six years of competitive robotics, and leadership built one
  team at a time."*
- **Manifest stats (count-up):**
  `Top 1%` — GPA across the RMIT SSET program ·
  `12` — VEX IQ teams mentored over three seasons ·
  `9` — national & international robotics podium finishes [TODO: confirm count] ·
  `200+` — daily Scrum sync-ups coordinated at FPT IS
- **CTA:** `Open a pull request →` (links to `#contact`)
- **Marquee:** `SHIP IT · REFACTOR THE PLAN · LEAD BY MERGE · EVIDENCE OVER ADJECTIVES · CALM UNDER LOAD · FROM CONTESTANT TO MENTOR`

### 9.2 `00 / README.md` — About + Education

**ID card (definition list):**
Name — June Nguyen (Nguyen Ngoc Dung) · Program — Bachelor of Information Technology, Major in
Enterprise Systems Development · Institution — RMIT University Vietnam · Based in — Hanoi, Vietnam

**P1.** "I'm a final-year IT student at RMIT Vietnam, majoring in Enterprise Systems Development and
working as a Business Analyst. Over the past six years I've built a consistent record of leadership —
robotics team captain, AI project mentor, club executive, student ambassador — while holding a GPA in
the top 1% of my program. The common thread is turning operations that run on people and goodwill
into systems that hold up without them."

**P2.** "My background pulls from two directions that turn out to be one skill. Competitive robotics
taught me to design, program and debug something that has to work on the day, in front of judges,
with no second try. Business analysis taught me to do the same thing for software — find the real
requirement under the stated one, make it visible, and prove it works before it ships. I'm most
useful where those meet: a team that needs a plan, a plan that needs a system, and a system that
needs someone to check it actually solves the problem."

**P3.** "I'm looking for graduate and early-career roles in business analysis, enterprise systems, and
technical project delivery — in Vietnam or remote."

**Roles chips:** `Business Analysis` · `Enterprise Systems` · `Agile Delivery (Scrum)` ·
`QA & UAT` · `Requirements Engineering` · `Technical Mentoring`

**Education (written as argument, two short paragraphs):**
"My degree moved me from writing code to specifying it. Enterprise Systems Development is less about a
language and more about the seams — where a sales channel meets a warehouse, where a requirement meets
a test case — which is exactly the work I do now as a BA."
"I started in Mechatronics at QUT in Australia [TODO: dates] before transferring home to RMIT. The
detour wasn't wasted: a year of hands-on jobs and a hardware degree gave me a feel for how a system
behaves when the neat diagram meets a real user."

**Timeline entries:**
- **RMIT University Vietnam** — *Expected May 2026 · GPA 3.6 (Top 1% of SSET)* — Bachelor of
  Information Technology. Major: Enterprise Systems Development.
- **Queensland University of Technology** — *Jul 2022 – Jun 2023* — Bachelor of Engineering
  (Mechatronics), Australia. Transferred to RMIT.

**Referee quote (place one here):** *"[TODO: 1–2 sentences from an RMIT lecturer or the SSET
program — analytical ability, ownership, ability to lead peers.]"* — [Name, Title, RMIT Vietnam]

### 9.3 `01 / init — first commit` — Foundation: Robotics

**Section intro:** "Six years of competitive robotics, in the order they happened — not a trophy
shelf, but where I learned to build under a deadline and lead a team that has to perform on cue."

**2018 — two national 1st-place finishes, one role.**
"Robotacon is Vietnam's premier educational robotics tournament. In 2018 I led my team to first place
in the Hanoi regional round as the mechanical-design lead, then won first prize again at IYRC Vietnam
later that year as lead programmer for the autonomous line-trace routine. Two nationals, two golds,
the same job done twice — design the thing, then make it run itself."

**2019–2020 — representing Vietnam in Seoul, twice.**
"Selected for the Vietnam national team in 2019, I competed in Seoul against representatives from more
than twenty countries and we took the Excellent Award. I went back in 2020 and we moved up — Silver
Prize, second overall, the second-highest honour — under pandemic-era constraints that cut our build
and travel time [TODO: confirm]."

**The podium record (horizontal strip, one line each):**
- `2017` — 3rd Prize, Robotacon · IYRC Malaysia representative
- `2018` — 1st Prize Robotacon Hanoi · 1st Prize IYRC Vietnam
- `2019` — Vietnam national team, Seoul — Excellent Award · MakeX finalist
- `2020` — Seoul — Silver (2nd) · TechGenius finalist
- `2021` — AVSC Top 10

**Takeaway line:** "Everything after this — mentoring, BA work, running a floor of 200 volunteers —
is the same loop: scope it, build it, test it before it counts."

### 9.4 `02 / hard reset` — The Pivot

**2022 — six years of robotics, then a deliberate detour.**
"I finished high school with a plan to study Mechatronics in Australia. What I didn't have was much
exposure to how people outside the robotics bubble actually live, so I made a choice: spend a year in
Australia doing ordinary jobs. Not for the money — to stand on the other side of the counter."

**Three handy jobs, one lesson.**
"Car-wash attendant, kitchen hand, dishwasher. Those jobs put you face to face with customers in
their most ordinary moments, which is where you actually learn what people want and how it feels to
be the one serving them."

**UNIQLO Australia — 9 months, the only STEM student on the floor.**
"I learned how a shop works as a small society — rosters, standards, the difference a floor leader
makes. My manager cheered the team on and was first to take responsibility when we got something
wrong. I've run teams that way ever since."

### 9.5 `03 / long-running branch` — Mentorship (Edison An Khanh + AI)

**Section intro:** "A former teacher asked me to 'check out' a robotics competition for two weeks.
That branch never got merged back — it's still running, three seasons and twelve teams later, and
it's the most sustained commitment I've made."

**2023 — a two-week favour that didn't end.**
"Invited by a former teacher who'd moved to Edison An Khanh, whose school was entering the VEX IQ
Robotics Competition and needed someone to scope it. The two-week sprint turned into three full
seasons: twelve teams, and a coaching role I still hold."

**2024 — four teams, six awards, one breakthrough season.**
- Coached 4 VEX IQ teams through a full competitive season.
- Delivered 6 competition awards across the four teams [TODO: name them].
- Won the program's **Mentor of the Year** award.
- Featured in RMIT SSET's spotlight article, *"From contestant to mentor"* [link], and a Mentor of
  the Year video on LinkedIn [link].

**2025 — new teams, deeper into code.**
- Took on 4 completely new VEX IQ teams, shifting the emphasis to autonomous programming and
  team-spirit development.
- The season produced the program's **first-ever Think Award**, plus **two Spirit Awards**.

**2025–2026 — from robotics into AI mentoring.**
"I mentored two student groups for Editech: an AI system for early autism detection, which took
**1st Prize**, and an AI pipeline for filtering toxic online content, which took **3rd Prize**. Same
mentoring loop as robotics — help them scope the problem, pick a method they can defend, and show it
works — applied to models instead of motors."

### 9.6 `04 / merge` — The RMIT Ecosystem

**Section intro:** "In first year I decided to step out of the comfort zone deliberately. Two roles —
Student Ambassadors Team and Student Council — pulled my network wider than I thought it could go."

**From heads-down to networked.**
"I joined the Student Ambassadors Team (SAT) and the Student Council. From just those two, my circle
grew past anything I'd planned for — and I learned that most opportunities arrive through a person,
not a posting."

**Two clubs, two roles, one thread.**
"HR Executive Assistant at IEC — looking after the people inside the organisation. External Affairs
at BUFI — connecting the organisation to the world outside it. I want to keep getting better at both
halves at once."

**ITSE Ambassador & Future Tech Camp Facilitator — May 2025 to present.**
- Represented the IT & Software Engineering programs to prospective students and families.
- Supported workshop sessions in Python, AI/ML fundamentals, Arduino robotics, and game development.
- Guided 3 student teams — all 3 took top awards [TODO: which event].

**Building under pressure — hackathons.**
"Hackathons force a working build in 24 to 48 hours. Each one has tightened my ability to lead a team
through a problem with no textbook answer — decide fast, cut scope honestly, ship something that
runs."

**TapXanh — Global Leadership Experience, June 2025.**
"Led the design of an incentive-based public-transport solution: a 5-year strategic plan funded 80%
government / 20% private equity, delivered as a 4-minute pitch that scored strongly for clarity and
local relevance."

**Perfect Pitch — 2025, then 2026.**
"First tryout in 2025 was deliberate exposure — get on the stage, learn the format. I came back in
2026 sharper [TODO: result / placement]."

### 9.7 `05 / deploy to production` — Professional Path

Use the **9-part template** (Part 4.5) for FPT IS and BSS; keep Genesis short.

**Genesis Escape — Game Master · 3 months, 2024.**
"As a Game Master I learned to read emotion in real time — when a customer is frustrated or genuinely
scared — while playing the NPC, controlling the game's pace, and steering the room's mood at once.
It's a very specific kind of leadership training."

**FPT IS — Project Coordinator Intern · May–Nov 2025.**
- **Challenge:** Daily Scrum sync-ups between bank clients (HDBank, MB, Vietcombank) and offshore
  delivery teams were running long and slowing decisions.
- **My role:** Coordinated 200+ of these sync-ups; owned the agenda, the blocker list, and the
  follow-ups.
- **Approach:** Tightened the format — pre-collected blockers, time-boxed each item, pushed
  decisions to owners in the room.
- **Findings / impact:** Cut meeting duration by 60–75% and measurably sped up blocker removal and
  decision-making [TODO: any hard figure].
- **Skills:** Stakeholder coordination · Agile ceremonies · Cross-timezone delivery.

**BSS Commerce — Business Analyst · Jan 2026 to present.**
- **Challenge:** Features were reaching release with requirement gaps that surfaced as post-release
  hotfixes.
- **My role:** Authored requirement documentation, drove feature visualisation, and led UAT
  validation for [TODO: product / team].
- **Findings / impact:** Reached a **95% UAT pass rate per feature** and cut **post-release hotfixes
  by 40%**. A market-research study I ran is projected to lift monthly recurring revenue by **25%**.
- **Skills:** Requirements engineering · UAT strategy · Market research · Feature specification.

### 9.8 `06 / repositories` — Key Projects

Card teaser format: arc claim → `PRJ-0x · CATEGORY` → `Title — Client` → one body sentence → 2 stats
→ focus line → tools.

**PRJ-01 · AI PRODUCT DELIVERY — MatureCare (AI Assistant Chatbot App)**
- Arc: *"I can run a software project end to end."*
- *Oct 2025 – Jan 2026 · Project Manager (Scrum) & QA*
- Body: "Led Agile Scrum delivery for two software projects — sprint planning, stand-ups,
  retrospectives — and owned QA against acceptance criteria."
- Stats: `90%+` — user-story acceptance rate per sprint · `2` — projects delivered in parallel
- Findings: produced full project documentation — vision, SRS, product backlog, acceptance criteria.
- Tools: Scrum · SRS · Test cases · Backlog management.

**PRJ-02 · STRATEGY & PITCH — TapXanh (Public-Transport Green App)**
- Arc: *"I can turn a policy problem into a funded plan."*
- *June 2025 · Global Leadership Experience*
- Body: "Designed an incentive-based public-transport solution and a 5-year rollout plan, pitched in
  four minutes."
- Stats: `80 / 20` — government / private-equity funding split · `5-year` — strategic plan
- Tools: Strategic planning · Financial modelling · Pitching.

**PRJ-03 · IT SUPPORT & TOOLING — Inventory Management & Price-Checking App**
- Arc: *"I can build the tool that fixes the data."*
- *Sep 2023 – present · IT Support Specialist, Thuy Thailand Consumer Goods*
- Body: "Built a web-based inventory and price-checking app around a scanning workflow to stop
  manual-entry drift."
- Stats: `90%` — data-accuracy improvement · `1,300+` — products brought under control
- Tools: Web app · Barcode scanning workflow · Data reconciliation.

### 9.9 `07 / releases & tags` — Recognition

**Inspiring Leaders Award — RMIT Student Leadership Recognition, 2025.**
"RMIT's award for students who've shown sustained, values-driven leadership across the university
community. [link to article]"

**Top 5 — RMIT Choice Awards.**
"Voted into the top five [TODO: category] in RMIT's student-choice awards. [link]"

**Dean's List Award.**
"Recognised on the RMIT Dean's List for sustained academic performance — top 1% of GPA across the
SSET program."

**Welcoming the Australian Minister for Education.**
"One of four students chosen from across all RMIT Vietnam faculties to formally welcome the
Australian Minister for Education on an official visit to the Hanoi campus."

### 9.10 `08 / open a pull request` — Contact

- **Heading:** "Let's build something."
- **Sub:** "Open to graduate and early-career roles in business analysis, enterprise systems, and
  technical delivery. I reply within 24 hours."
- **Contact list:** Phone `+84 865 949 604` · Email `juneng2108@gmail.com` · LinkedIn
  `ngoc-dung-nguyen-june` · Based in Hanoi, Vietnam — open to remote.
- **Form (Formspree):** Full name · Email · What are you reaching out about? (pills:
  `Graduate role · Internship · Contract · Coffee chat · Collaboration · Other`) · Message ·
  `Send request →` (busy: `Sending…`).
- **Toast:** "Request received — June will reply within 24 hours."
- **Close-note:** `June Nguyen · IT & Business Analysis · RMIT University Vietnam`.

---

## Part 10 — Image plan

### 10.1 The gap

`index.html` references **~130 image paths**; **14 exist**. Every non-existent path currently 404s.

**On disk now (14):** `2018 (1).jpg`, `2018 (2).jpg`, `355207177_…_n.png`, `358360817_…_n.jpg`,
`358583564_…_n.jpg`, `358617227_…_n.jpg`, `38531455_…_n.jpg`, `about_me.jpg`,
`d46bb8ca1363f73dae72.jpg`, `me.jpg`, `Picture1.jpg`, `Screenshot 2023-07-06 234706.png`,
`z4494478225826_…_n.jpg`.

**Referenced but missing (representative — full list is every `src` in `index.html` not above):**
`timeline_2017_*`, `pivot_2022_main`, `handy_jobs_1`, `uniqlo_1..5`, `edison_2023_main` + `add1..4`,
`edison_2024_main1..2` + `add1..8`, `mentor_award_1..2`, `edison_2025_main` + `add1..8`,
`ai_main1..2` + `ai_add1..8`, `nerdy_main` + `nerdy_add1..8`, `clubs_main1..2` + `clubs_add1..8`,
`sset_main` + `sset_add1..6`, `hackathon_main1..2` + `hackathon_game1..3`, `tapxanh_1..4`,
`pp2025_*`, `pp2026_*`, `genesis_1..4`, `fpt_1..2`, `bss_1..4`, `inspiring_leader`,
`rmit_choice_1..2`, `deans_list_1..2`, `minister_1..2` + `minister_add1..4`.

### 10.2 Actions

1. **Rename the 14 real files** to the convention (`section_role_index.jpg`) and map them to the
   slots they belong in (e.g. `2018 (1).jpg` → `robotics_2018_main1.jpg`).
2. **Collect the rest** — June has these photos; they need gathering into `images/` under the naming
   scheme. Build a checklist per chapter from the `src` list.
3. **Placeholder strategy until then:** a tiny helper that, on `img` error, swaps to a
   dominant-colour block + the label text (June's `.img-label` already exists). Keeps layout intact,
   no 404 noise.
4. **Budget:** every image ≤ 300 KB, hero image ≤ 150 KB, `loading="lazy"` on everything **except**
   the hero. Prefer `.webp`. Add explicit `width`/`height` on every `<img>` (prevents CLS; all three
   samples do this).
5. **If June picks image-driven hero later:** those need 2000 px, colour-graded, consistent set —
   separate task.
6. **Replace FB/LinkedIn iframes** with a poster image + play button that loads the embed on click.

---

## Part 11 — Performance, accessibility, responsive checklist

Carried from all three samples; each item is a pass/fail gate for Phase 7.

**Performance**
- [ ] One page-wide `requestAnimationFrame`. Lenis on it. Parallax writes rounded to 3 dp, skipped
      when unchanged (idle page = zero style invalidation).
- [ ] Hero canvas: `setPixelRatio(min(dpr, small?1.6:2))`; `small = narrow || area<620000`.
- [ ] `dt = min(raw, 0.05)` in every loop.
- [ ] `visibilitychange` pauses the hero loop; hero loop early-returns when hero not intersecting.
- [ ] Adaptive-resolution governor on the hero canvas (walk a `scale` in `[0.55,1]` from real frame
      times) — optional but cheap.
- [ ] `?nogl=1`, `?shot=N` debug flags.
- [ ] Images: `.webp`, ≤300 KB, explicit dimensions, lazy except hero. No image feeds the hero
      shader (procedural only).
- [ ] FB/LinkedIn embeds click-to-load.
- [ ] Total JS (excl. Three.js): keep under ~30 KB hand-written.

**Accessibility**
- [ ] `prefers-reduced-motion` handled in **both** CSS and JS: no letter rotation, no mote motion,
      no parallax, no scrub-blur; reveals immediate; `intro-done` at 0 ms; Lenis disabled.
- [ ] Hero `<h1>` has a real visually-hidden "June Nguyen"; letter spans `aria-hidden`.
- [ ] `cursor:none` only under `.js` + `(hover:hover) and (pointer:fine)`; real cursor otherwise.
- [ ] Dock items are real links with visible focus; magnification mirrors on `focusin`.
- [ ] Every decorative canvas / grain / vignette / `.fg` is `aria-hidden`.
- [ ] Word-split reveals keep the phrase as `aria-label` on the parent.
- [ ] Lightbox: focus-trap, `Esc` closes, focus returns to the trigger, `role="dialog"`.
- [ ] Colour contrast AA in both light and dark sections (check `--gray-text` on `--pure-black`).
- [ ] Skip-link to `#about`.
- [ ] Form fields have `<label>`s; errors announced.

**Responsive**
- [ ] `--u` re-bases at ≤820 px; hero becomes `height:auto`.
- [ ] Dock drops labels → glyphs only, `min()` floors for 44 px touch targets, magnification off.
- [ ] Liquid-metal Play/secondary buttons may be dropped on mobile (Sylva does).
- [ ] Grids collapse (`grid-3/4` → 2 → 1); horizontal-scroll strips keep momentum + snap.
- [ ] Test at 390×844 and 1440×900 (Kage's two required checkpoints); check console for 404s.

---

## Part 12 — Phased build roadmap

Each phase is independently shippable and verifiable.

| Phase | Goal | Deliverable | Skills |
|---|---|---|---|
| **1 — Groundwork** | Vendor Three.js; bump Lenis; add `.js` gate, `prefers-reduced-motion` scaffolding (CSS+JS), `small` tier, one shared rAF; repo hygiene (gitignore samples). No visual change. | Same-looking site on a clean engine. | `cinematic-gsap-lenis-motion-system`, `optimize-web-animations` |
| **2 — Layout + reveals** | Add `--u` unit + entrance choreography (`.mask`/`.fade`/`--d`); swap `.reveal-up` → `[data-rv]` + word-by-word `<h2>` reveals. Apply the new section tags (spine). | Editorial reveal system; renamed chapters. | `masked-reveal`, `staggered-word-reveal`, `animation-on-scroll`, `agency-grid-layout-minimal` |
| **3 — Hero** | Rebuild hero per Part 7: kinetic type on `--u`, `#hero-gl` atmosphere (gradient + motes + fog + grain), pointer parallax, magnetic dock, liquid-metal CTA, count-up manifest, scroll-out fade. Full fallbacks. | New landing section. | `atmosphere-background`, `ambient-section-particles`, `webgl-3d-object`, `beam-glow-states`, `liquid-metal-border`, `number-details`, `scroll-progress-timeline` |
| **4 — Chapter motion** | Foreground-stage handoff on image-cluster chapters; chapter progress rail; auto-hide nav; one marquee divider. | Chapters gain the "pin then blur away" transitions. | `masked-reveal`, `progressive-blur`, `scroll-scrubbed-visual-sequence`, `marquee-loop` |
| **5 — Accent effects** | Restrained pointer-trail emitter; 1–2 sections get themed drifting particles (circuit dots / code glyphs). Keep it subtle. | Signature texture, not noise. | `pointer-trail-emitter`, `falling-leaves`, `add-shader-cursor-trail` |
| **6 — Content + case studies** | Paste Part 9 copy; build card → 9-part expandable detail for projects + FPT/BSS; Formspree form + intent pills + toast + sticky "open to roles" pill. | Real portfolio content, real contact flow. | `editorial-portfolio-chapters`, `editorial-service-booking`, `reveal-hover-effect` |
| **7 — Harden** | Full Part 11 checklist; lightbox a11y; `.no-webgl` / no-JS mirrors; image optimisation pass + error-placeholder helper; 390×844 + 1440×900 + reduced-motion + no-JS + no-WebGL test matrix. | Ship-ready. | `performance-profiling`, `iterate-until-verified`, `audit-verify-explain-grade-5` |
| **8 — (optional) Polish** | `cv.html`; `?shot=N` states; a signature 3D piece if wanted. | Nice-to-haves. | `build-threejs-scroll-worlds` |

---

## Part 13 — Verification

**Per phase:** open `index.html` via a local static server (`python -m http.server`), not `file://`
(fonts + any texture sampling break on `file://`). Check the browser console is clean (no 404s, no
script errors) — Kage's own PROMPT makes this a ship gate.

**Test matrix (Phase 7, and spot-checked earlier):**
1. **Desktop 1440×900, fine pointer** — hero atmosphere renders; dock magnifies; letters animate;
   reveals fire once; light/dark switches; lightbox works; no jank on scroll (target 60 fps, no long
   tasks > 50 ms after load).
2. **Mobile 390×844 (touch)** — no custom cursor, no dock magnification, no liquid-metal pointer
   tracking; `--u` re-based; grids collapsed; horizontal strips still swipe; hero is `height:auto`.
3. **`prefers-reduced-motion: reduce`** — no rotation, no motes moving, no parallax, no scrub-blur;
   everything readable; `intro-done` immediate; Lenis off.
4. **JS disabled** — finished static layout, real cursor, all content present, no hidden elements
   stuck at `opacity:0`.
5. **WebGL disabled / `?nogl=1`** — hero falls back to CSS gradient + kinetic type; rest of page
   unaffected.
6. **Lighthouse** — Performance ≥ 90 mobile, Accessibility ≥ 95, no CLS from images (explicit
   dimensions), LCP < 2.5 s.
7. **Screen reader pass** (NVDA/VoiceOver) — `<h1>` reads "June Nguyen"; nav is a real list; chapter
   headings announce as plain text; form labels read; lightbox traps focus.
8. **Content proof** — every `[TODO:]` in Part 9 resolved; no placeholder image visible; all outbound
   links (SSET article, LinkedIn videos, FB posts) resolve.

**Definition of done:** all 8 rows pass; the three `Sample *` folders are gitignored or removed; the
MIT credit comment for the Sylva-derived hero systems is present; the contact form delivers a real
email.
