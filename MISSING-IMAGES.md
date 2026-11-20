# Hidden image slots (temporary)

On 2026-11-20 every image slot whose file does not exist yet was **hidden** on the site, so visitors don't see empty coloured boxes with file names on them.
Nothing was deleted from `index.html`: the slots are still in the HTML.

- Image tags in the page: 61
- Slots hidden because the file is missing: **49**

## How they come back

- **Per image, automatic:** put a file at the exact path listed below (inside `images/`), commit and push. That slot appears by itself, and any grid it belongs to reappears.
- **Per image, no code:** use the admin tool (`tools/portfolio-admin`, http://localhost:4173) to fill the slot; it is written to `content/media.json`.
- **To show the old placeholder blocks and file-name tags again** (for example to see where every photo goes): in `index.html`, delete the CSS rules `.img-missing,.all-missing{…}` and `.img-label{ display:none }` (search for "TEMPORARY"), and restore the old `swapToFallback` behaviour from git history (commit before this change).

The file-name tags (`.img-label`) are hidden on **all** images, including ones that exist.

## Missing files, by section

### `ch2-pivot` (2)
- `images/pivot_2022_main.jpg` — Australia 2022
- `images/handy_jobs_1.jpg` — Handy jobs

### `ch2-uniqlo` (4)
- `images/uniqlo_1.jpg` — UNIQLO Australia
- `images/uniqlo_2.jpg` — UNIQLO Australia
- `images/uniqlo_3.jpg` — UNIQLO Australia
- `images/uniqlo_4.jpg` — UNIQLO Australia

### `ch3-2023` (5)
- `images/edison_2023_main.jpg` — Edison An Khanh 2023
- `images/edison_2023_add1.jpg` — Edison 2023
- `images/edison_2023_add2.jpg` — Edison 2023
- `images/edison_2023_add3.jpg` — Edison 2023
- `images/edison_2023_add4.jpg` — Edison 2023

### `ch3-2024` (6)
- `images/edison_2024_add1.jpg` — Edison 2024
- `images/edison_2024_add2.jpg` — Edison 2024
- `images/edison_2024_add3.jpg` — Edison 2024
- `images/edison_2024_add4.jpg` — Edison 2024
- `images/mentor_award_1.jpg` — Mentor of the Year award
- `images/mentor_award_2.jpg` — Mentor of the Year award

### `ch3-2025` (4)
- `images/edison_2025_add1.jpg` — Edison 2025
- `images/edison_2025_add2.jpg` — Edison 2025
- `images/edison_2025_add3.jpg` — Edison 2025
- `images/edison_2025_add4.jpg` — Edison 2025

### `ch3-ai` (4)
- `images/ai_add1.jpg` — AI mentoring
- `images/ai_add2.jpg` — AI mentoring
- `images/ai_add3.jpg` — AI mentoring
- `images/ai_add4.jpg` — AI mentoring

### `ch4-network` (4)
- `images/nerdy_add1.jpg` — RMIT ecosystem
- `images/nerdy_add2.jpg` — RMIT ecosystem
- `images/nerdy_add3.jpg` — RMIT ecosystem
- `images/nerdy_add4.jpg` — RMIT ecosystem

### `ch4-clubs` (2)
- `images/clubs_main1.jpg` — IEC
- `images/clubs_main2.jpg` — BUFI

### `ch4-sset` (1)
- `images/sset_main.jpg` — Future Tech Camp

### `ch4-hackathon` (3)
- `images/hackathon_game1.jpg` — Hackathon
- `images/hackathon_game2.jpg` — Hackathon
- `images/hackathon_game3.jpg` — Hackathon

### `ch4-hackathon-2026` (3)
- `images/hackathon2026_1.jpg` — Hackathon 2026 — Vietnam Champion
- `images/hackathon2026_2.jpg` — Hackathon 2026 team
- `images/hackathon2026_3.jpg` — Hackathon 2026 award ceremony

### `ch4-tapxanh` (4)
- `images/tapxanh_1.jpg` — TapXanh
- `images/tapxanh_2.jpg` — TapXanh
- `images/tapxanh_3.jpg` — TapXanh
- `images/tapxanh_4.jpg` — TapXanh

### `ch4-pitch` (2)
- `images/pp2025_main1.jpg` — Perfect Pitch 2025
- `images/pp2026_main1.jpg` — Perfect Pitch 2026

### `ch4-capstone` (3)
- `images/capstone_1.jpg` — Capstone project showcase
- `images/capstone_2.jpg` — Capstone team
- `images/capstone_3.jpg` — Best Capstone Project award

### `ch5-genesis` (2)
- `images/genesis_1.jpg` — Genesis Escape
- `images/genesis_2.jpg` — Genesis Escape

