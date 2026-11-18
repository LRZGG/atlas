# Unknownpedia

An open atlas of what humanity does not know yet. Unresolved questions of science are placed on a **measured map of world research**: 4,516 research topics from [OpenAlex](https://openalex.org), positioned by the papers they share. Live at <https://unknownpedia.org> (French and English).

- **Map**: each dot is a real research topic; contour lines show research effort (papers published), *not* knowledge; the red “?” marks an open question (150 so far, 8 of them “documented enigmas”).
- **Fiches**: 29 questions have a detailed page (what we know, what we don't, why it is hard, where to start, references checked in OpenAlex). They are **drafts written with an AI** and labelled as such until a *named* specialist reviews them.
- **Time**: a slider replays research output year by year (1990–2025); a Stats window shows papers per year and per decade.
- **Search**, keyboard control, light and dark themes, no accounts, no votes, no ads, no external requests from the visitor's browser.

Reading order for contributors: [METHOD.md](METHOD.md) (what is measured and how), [PRODUCT.md](PRODUCT.md) (scope), [TODO.md](TODO.md) (priorities), [CONTRIBUTING.md](CONTRIBUTING.md).

## Build

Node 18+ and no dependencies.

```bash
BASE=https://unknownpedia.org node build-directions.mjs
```

This computes the layout and writes the static site into `docs/` (served by GitHub Pages). To look at it locally:

```bash
python -m http.server -d docs 8123
```

Fonts are served from `/fonts/`, so `docs/` must be the root of the server.

## Data pipeline

The OpenAlex key is read from the `OPENALEX_API_KEY` environment variable (or `OPENALEX_KEY_FILE`). **Never commit a key.**

| Script | What it does | Output |
|---|---|---|
| `fetch-squelette.mjs` | Downloads domains, fields, subfields, topics and subfield links | `squelette.json` |
| `fetch-liens-sujets.mjs` | For each topic, the 40 topics it shares most papers with (resumable) | `liens-sujets.json` |
| `fetch-annees.mjs` | Papers per year (1990–2025) for each topic | `annees.json` |
| `fetch-recent.mjs` | Papers of the last 30 days per topic (run weekly by `.github/workflows/frontiere.yml`) | `recent.json` |
| `fetch-fiches.mjs` | Downloads each fiche's Wikipedia excerpt and verifies every reference in OpenAlex; fails if one is missing | `fiches.json` |
| `check-fiches.mjs` | Automatic check of the fiches (no AI, no network): numbers without sources, strong claims, off-topic references, FR/EN mismatches | `checks/report.md` |
| `build-directions.mjs` | Layout + all pages (`docs/fr`, `docs/en`, 150 question pages per language, Sources and Contribute pages, sitemap) | `docs/` |
| `build-partage.mjs` | One 1200×630 share image per question page (needs Playwright and a local server) | `docs/partage/` |

## Files

| File | Role |
|---|---|
| `questions.json` | The questions: short name, statement, context (`fr`, `en`), source (`src`), subfields touched, optional `type: "enigme"`, optional fiche |
| `textes.json` | All interface texts (FR and EN). To add a language: one more entry here and one more page loop in `build-directions.mjs` |
| `sous-disciplines-fr.json` | French names of the 250 subfields (editorial translation; OpenAlex names are English) |
| `carte.tpl.html` | The map template (“patent plate” direction, canvas 2D) |
| `checks/` | Automatic report and the log of human decisions (`decisions.json`) |
| `docs/fonts/` | Open-licence fonts (OFL), self-hosted, with licences |
| `docs/labo/` | Unlisted design experiments (Mysteries and Folklore worlds, 3D rooms, menus). Demo data, not part of the site |
| `build-maquettes.mjs`, `build-proto.mjs`, `build-sciguessr.mjs` | Early prototypes (outputs are git-ignored) |

## How the map is made, and its limits

See [METHOD.md](METHOD.md) for the full account. In short:

- Topic positions come from measured links (shared papers), plus a weak pull to their subfield and a radial dilation of the central void for legibility: the **layout is partly editorial** and the central void is partly a presentation choice.
- The relief counts papers where the topic appears among a paper's assigned topics (a paper can count for several topics). It compares years and disciplines fairly; it is not an absolute total. OpenAlex's own `works_count` field is wrong for some topics (see [OPENALEX-COUNTS.md](OPENALEX-COUNTS.md)) and is not used.
- A question's position is editorial: the subfields it touches are listed by hand in `questions.json`.
- Topic names are in English (OpenAlex); subfield names are translated to French.

## Licences

Code MIT, texts CC BY-SA 4.0, data CC0 (OpenAlex), Wikipedia excerpts CC BY-SA 4.0, fonts OFL. See [LICENSES.md](LICENSES.md). The licence choice is proposed and **to be confirmed by the author**.
