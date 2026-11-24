# TODO

State on 18 November 2026. Priorities first. Legend: `[x]` done, `[~]` partly done, `[ ]` to do.

## Content

- [x] 150 questions, each with its source (Science 2005, Millennium problems, Hilbert, Wikipedia lists, Smale, 8 documented mysteries).
- [~] **Fiches**: 29 of 150 written (all bilingual, references verified in OpenAlex). 121 to write. Four mystery fiches have no reference yet (Nazca, Phaistos, Linear A, Kryptos).
- [ ] **Named reviewers**: contact specialists as soon as 30 fiches are ready (needs the author). Use ORCID; list by discipline.
- [ ] Verify the 25 *Science* 2005 questions against the official list (some were written from memory).
- [ ] More mysteries (Beale ciphers, rongorongo, Indus script, dancing plague of 1518, Mary Celeste, Hessdalen lights): only those with a research field.
- [ ] More questions beyond 150: psychology, linguistics, sociology have no dedicated Wikipedia list.
- [ ] French names of the 4,516 topics (OpenAlex names are English; the 250 subfields are translated).

## Data and quality

- [x] OpenAlex counts: `works_count` is wrong for some topics. The relief now uses the sum of papers 1990–2025 (see OPENALEX-COUNTS.md).
- [ ] Recompute the topic layout with these weights (not done; it would move everything).
- [x] Papers per year per topic (`fetch-annees.mjs`): time slider and Stats window.
- [~] **Weekly frontier** (`fetch-recent.mjs`, `.github/workflows/frontiere.yml`): written, untested in CI. **Author to do**: add the OpenAlex key as repository secret `OPENALEX_API_KEY`, then run the workflow once by hand. Until `recent.json` exists the “What is moving” tab is empty.
- [x] Automatic fiche check (`check-fiches.mjs`), decision log, issue templates, Contribute page.
- [ ] A second AI pass over the fiches (needs a key; the report format is ready for it).
- [ ] Close or confirm the 85 open check points (numbers without sources, strong claims) against real sources.

## Product

- [x] Search (key `/`), keyboard control, light/dark, share images, per-question pages (FR/EN), Sources and Contribute pages.
- [x] Time slider, Stats window (by year, by decade, what is moving).
- [~] Mobile: tested in emulation only; try on a real phone.
- [ ] **Licences**: MIT for code and CC BY-SA 4.0 for texts are *proposed* (LICENSE, LICENSES.md); the author must confirm before accepting contributions.
- [ ] Analytics without cookies (GoatCounter, Cloudflare Web Analytics or Plausible); distinguish bots.
- [ ] Measure load time; precompute the relief at build time if needed.
- [ ] Decide what to do with `docs/labo/` (unlisted design experiments with demo data): keep out of the site, or reuse parts (the old-style world map as an alternate view).
- [x] Entry to the Mysteries from the map: clicking *terra incognita* zooms into the centre and reveals the mysteries.

## Visual ideas (to sort)

Rule: nothing decorative; every effect encodes a datum or a source.

- [ ] Animated relief over time (done as a slider; could add a “trails” mode showing where research grew most).
- [ ] Line between neighbouring questions on hover (shared subfields), only between visible items.
- [ ] Animated share card per question.
- [ ] 3D room of the questions (a prototype exists for the Mysteries in the lab).
- [ ] Sound: none by default.

## Money and later

- [ ] GitHub Sponsors, then a legal structure when income arrives.
- [ ] Mobile-specific layout polish; true offline reading pages.

## AI contributions (`ia.json`)

- Nine entries (Navier–Stokes, Riemann x3, Erdős problems x3, AlphaEvolve, AlphaFold). Each has `st` (`claimed` | `assisted` | `related`), `date`, `checked`, `fr`, `en`, `r` (references) and `q` (ids of the map questions it concerns; `[]` = only on the /ia/ page).
- Update path: issue template `propose-an-ai-entry.yml` (new entry or status change), then edit `ia.json` and bump `checked`.
- Read only through secondary sources so far: Navier–Stokes and unit distance (Quanta), AlphaFold and AlphaEvolve (lab pages). Not readable by our tools: erdosproblems.com, OpenAI page, nobelprize.org. Read the primary papers when possible.
- Re-check regularly: peer review and Clay decision for Navier–Stokes, formal verification for unit distance, DeepMind's 9-of-353 Erdős paper (arXiv 2605.22763, not read).
- Missing: AlphaProof / IMO 2025 (no primary source reached yet).

## Advances (`advances.json`)

- 37 entries so far (maths 12, natural sciences 15, AI 10). Sources are mostly Wikipedia: replace with primary sources (IMU, Nobel Committee, arXiv, journals) when readable.
- Not yet covered: Abel Prize, Breakthrough Prizes, Turing Award, economics, social sciences, earth science, ecology. Add the 2024 Physics Nobel (Hopfield, Hinton) once its citation is read.
- Idea: show advances by year with the time slider.
- Riemann (20 Nov 2026): the Alpöge note was read only second-hand (AFP, OfficeChai); re-check for expert reactions, a paper, and whether the Lean files build and state RH correctly. Also check OpenAI's own release for the 7/8 vs 11/12 figures.

## Claims and forecasts

- [ ] Deploy the forecast API (`api/README.md`) and set the `FC_API` repository variable. Until then forecasts stay on the device.
- [ ] Read the primary sources behind each ladder (OpenAI's pages return 403 to our tools; the note on alpo.ge was not readable).
- [ ] Turn good candidates of `claims-inbox.json` into claims with a ladder each week; resolve forecasts by setting `outcome` in `ia.json`.
- [ ] Named reviewers (maths, physics, biology) for the ladders: without them "established" only means "as the sources we read say".
- [ ] AI-assisted cross-reading of sources (needs an API key as a repository secret; not wired).

## Three-angle product roadmap (next)

Combining all three pillars around the measured map, without ads or accounts:

1. **Daily curiosity & retention ("Today's Frontier")**
   - [x] Daily 5-round challenge (`#defi` / `#daily`): 3 "Resolved or Unknown?" cards + 1 OpenAlex research-effort duel ("Which publishes more?") + 1 participative forecast, shareable score card, daily streak, and endless replay mode.
2. **Anti-hype science & AI watch (viral shareability)**
   - [x] Dedicated per-claim shareable verdict pages (`/fr/c/<id>/`, `/en/c/<id>/`), self-contained 1200×630 SVG verdict cards (`docs/partage/claim-<id>.svg`), Playwright PNG pipeline (`build-partage.mjs`), and instant client-side Canvas PNG + verdict text sharing in the Claims register.
   - [x] Shareable "Did you know science still doesn't know..." engraved fact cards on every question fiche (one-click text copy + 1200×630 Canvas PNG card download).
   - [x] Live "Frontier log" tab inside the Claims register showing chronological status flips (`? → ◐` under verification, `? → ◒` partial advance, `? → !` resolved).
3. **Lightweight participation & student/curious compass**
   - [x] Direct no-account submission modal (`#proposer` / `#submit`) for proposing a missing question, claim or correction (PoW-protected `/api/submit` when API is live, with pre-filled GitHub issue & copy fallback when offline).
   - [x] Collective horizon estimates on every open question ("Before 2035 / 2035–2070 / After 2070 / Never") stored locally and synced via `/api/horizon` when API is connected.
   - [x] One-click anonymous "Too technical?" feedback button on open question fiches (`/api/feedback` + local state).
   - [x] Dedicated "Are you a specialist? Review this fiche (5 min)" CTA with named ORCID credit support on unreviewed fiches (interactive panel and static `/q/` pages).
   - [x] Compass filters on the map & legend: Everyday mysteries, $1M & classics, Fastest rising (live from `DATA.Y`), With AI, and Full fiches, with a browseable matching list.
4. **V2 palette, decluttering & public engagement**
   - [x] Engraved Observatory Night (`#0b111c` / `#e5decb` / `#c9b98b` / `#e36246`) & soft matte vellum Day (`#ece5d5` / `#171e29` / `#a5242c`) across map, plates, share cards, and static pages.
   - [x] Collapsible legend on all viewports + on-demand reading margin collapse (`marginClose`) for wide open map framing.
   - [x] Everyday **Illusion of Knowledge** game (`#defi` / `#daily`): 6 daily Yes/No questions mixing genuine everyday open unknowns and settled traps, false-certainty counter, and Endless mode (Everyday / Full Atlas).
   - [x] One-click fiche reaction ("I thought science already knew" / "I knew we didn't know") synced via `GET/POST /api/illusion`.
   - [x] **Priorities vs Research** plate (`#priorites` / `#priorities` & flagship tab in Stats): pick your top 3 unknowns to solve in your lifetime and compare live against measured OpenAlex publication shares (`GET/POST /api/priorities`).
