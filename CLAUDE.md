# Unknownpedia: context for Claude

An open atlas of unresolved questions of science, placed on a measured map of world research. Static site (GitHub Pages) at https://unknownpedia.org (.com redirects). Read first: `PRODUCT.md` (scope), `TODO.md` (priorities), `METHOD.md` and `README.md` (method, limits).

**Language**: the author is French-speaking and works alone: **reply to the author in French**, simply, without long documents. Everything committed to the repository (code, comments, documentation, issue templates, commit messages) is in **English**. The site itself is bilingual (FR/EN); interface texts live in `textes.json`.

## Commands

- Rebuild the site: `BASE=https://unknownpedia.org node build-directions.mjs` (writes `docs/`). Node 18+, no dependencies.
- View the site: serve `docs/` (e.g. `python -m http.server -d docs 8123`). Fonts are in `/fonts/`, so they must be at the server root.
- Data: `fetch-squelette.mjs`, `fetch-liens-sujets.mjs`, `fetch-annees.mjs`, `fetch-recent.mjs`, `fetch-fiches.mjs`. The OpenAlex key comes from `OPENALEX_API_KEY` (or `OPENALEX_KEY_FILE`), **never in a file of the repository**.
- Fiche check: `node check-fiches.mjs` (writes `checks/`). Share images: `node build-partage.mjs` (needs a local server and Playwright).
- Prototypes (outside the site): `build-maquettes.mjs`, `build-proto.mjs`, `build-sciguessr.mjs` read `carte-de-l-inconnu.html` (a fragment produced by the main build); their outputs are git-ignored. `docs/labo/` holds unlisted design experiments with demo data.

## Decisions taken (do not reopen without a reason)

- **Art direction: the patent plate** (`carte.tpl.html`): contour lines, light and dark, “?” in carmine (white in dark mode). No colours per domain, no stars, no multi-step guided tour (a single dismissible first-visit card is allowed), no notebook, no “questions read”. The top-left text saying what you are looking at stays and fades on zoom.
- **Honesty first**: the relief measures research effort (papers published), not knowledge. Every fiche says it is an AI-written draft until a named specialist has reviewed it (`relue: { par, date }` in the fiche in `questions.json`). Never hide the use of AI.
- **No accounts, votes or rankings at launch. Never ads.** Contribution through GitHub.
- **Licences**: OpenAlex data CC0; Wikipedia excerpts CC BY-SA (credited); fonts and images only under free licences, credited. Fonts (IM Fell DW Pica, Archivo Narrow, OFL) are self-hosted in `docs/fonts/` with their licences: never load an external resource in the visitor's browser. The licence choice for the repository (MIT / CC BY-SA 4.0) is proposed, **not yet confirmed by the author**.
- **Name**: Unknownpedia. Questions come from published lists (Science 2005, Millennium problems, Hilbert, Wikipedia lists, Smale), hand-picked; each question keeps its source.
- Never invent numbers, testimonials or references: every reference is verified in OpenAlex by `fetch-fiches.mjs`.
- Mysteries are on the map as questions of type `enigme` (same “?”, told apart by the Mysteries filter and the fiche kicker; the small square was dropped because visitors could not read it); folklore is not on the map (a legend is not a research topic).

## Known pitfalls

- `textes.json` holds all interface texts (FR and EN). Topic names are English (OpenAlex); the 250 subfields have French names in `sous-disciplines-fr.json`.
- The layout (cohesion, dilation of the central void) is partly editorial: read `METHOD.md` before presenting it as a measurement.
- The relief uses `annees.json` sums, not OpenAlex's `works_count` (wrong for some topics: see `OPENALEX-COUNTS.md`).
- The `build-*.mjs` templates extract `DATA` from `carte-de-l-inconnu.html`: keep the line `const DATA = ...;` followed by `const { F, S, L` in `carte.tpl.html`.
- The repository is public: no secrets, no personal address, no file of the `.claude/` folder. The OpenAlex key must live in an environment variable or a repository secret.

## Next (see `TODO.md`)

150 questions done, 29 fiches of 150. Remaining: write the other 121 fiches, find named reviewers (needs the author), confirm the licences, set the repository secret for the weekly workflow, analytics without cookies.
