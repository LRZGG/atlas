# TODO

State on 18 November 2026. Priorities first. Legend: `[x]` done, `[~]` partly done, `[ ]` to do.

## Content

- [x] 150 questions, each with its source (Science 2005, Millennium problems, Hilbert, Wikipedia lists, Smale, 8 documented enigmas).
- [~] **Fiches**: 29 of 150 written (all bilingual, references verified in OpenAlex). 121 to write. Four enigma fiches have no reference yet (Nazca, Phaistos, Linear A, Kryptos).
- [ ] **Named reviewers**: contact specialists as soon as 30 fiches are ready (needs the author). Use ORCID; list by discipline.
- [ ] Verify the 25 *Science* 2005 questions against the official list (some were written from memory).
- [ ] More enigmas (Beale ciphers, rongorongo, Indus script, dancing plague of 1518, Mary Celeste, Hessdalen lights): only those with a research field.
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
- [ ] Entry to the Mysteries from the map: clicking *terra incognita* zooms into the centre and reveals the enigmas.

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
