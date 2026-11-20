# Unknownpedia: vision and method

## One sentence

An atlas of what humanity does not know yet: you enter out of curiosity, wander, and leave knowing where one could help. The audience is the curious person with no background, and the student looking for a direction. Researchers are not the target but they are the reviewers: they must be able to look at the site and find nothing false.

## The rule above all others

**Nothing decorative.** Every visible element encodes a real, checkable datum or source. If we do not have the datum, we draw nothing.

## 1. Domains: we reuse a classification

The tree comes from OpenAlex (open, free). It has four levels (counts taken on 16 November 2026, stored in `squelette.json`):

| Level | Count | Example |
|---|---|---|
| Domains | 4 | Life Sciences |
| Fields (“disciplines”) | 26 | Neuroscience |
| Subfields | 250 | Cognitive Neuroscience |
| Topics | 4,516 | Sleep and memory |

Two editorial choices depart from OpenAlex: *Agricultural and Biological Sciences* is split into “Agronomy and Food” and “Ecology and Organismal Biology”. The map therefore shows 27 disciplines.

## 2. Links are measured, not drawn

- **Between subfields**: the number of papers belonging to both. Disciplines that share many papers are close on the map. Citations would be finer but OpenAlex does not give them in one call.
- **Between topics**: for each topic, the 40 topics it shares the most papers with (`liens-sujets.json`).
- **Layout**: a force layout driven by these links, with a weak pull to the topic's subfield (`KANC` = 0.4) and a mild cohesion by discipline (`COH` = 0.08). Without the pull to the discipline, 77% of a subfield's neighbours are in the same domain; with it, 88%. Real bridges (clinical neurology, human–computer interaction, biomedical engineering) stay visible.
- **Measured gain**: the mean distance of a topic to its 5 most linked topics drops from 0.296 to 0.184 (two random topics: 0.953). On a control that the layout does not use (ranks 9 to 13) it drops from 0.337 to 0.240. The structure is real, but the gain is partial.
- **Presentation choices**: the central void is dilated radially (`HOLE` = 0.5: radius 0.17 → 0.41) so that it can be read. With a weak pull to subfields (0.03) the void almost closes (radius 0.13). The void is therefore partly a presentation choice.

## 3. What the map shows

| What you see | What it measures |
|---|---|
| A dot | A real research topic |
| Contour lines (relief) | Research effort: papers published, **not** knowledge |
| Small ticks along the first contour | The edge of the known, facing the little-studied |
| A numbered circle | A discipline (reference table) |
| A red “?” (white in dark mode) | An open question |
| A “?” of type enigma | A documented mystery: facts exist, the answer is missing (shown in the fiche and with the Mysteries filter, no separate symbol) |
| The void in the middle (and beyond the ring) | Few papers link these disciplines: *terra incognita* |

Limits:

- The number of papers measures the quantity of research, not the quantity of knowledge. A field can publish a lot and understand little.
- The relief uses, for each topic, the sum of papers published 1990–2025 where the topic is among a paper's assigned topics (`annees.json`). OpenAlex's `works_count` is wrong for some topics (41 million for “Magnetic confinement fusion research” instead of about 385,000) and is not used: see [OPENALEX-COUNTS.md](OPENALEX-COUNTS.md). The yearly relief uses a fixed scale, so years are comparable. The current year is excluded (incomplete). Topic positions were not recomputed with the new weights.

## 4. Questions: how they are chosen and placed

We do not invent questions: we collect them from recognised sources, qualify them, place them with data, write their fiche and have it reviewed.

| Source | Status |
|---|---|
| *Science* magazine, “125 questions” (2005) | 25 in place; some written from memory, to be checked against the official list |
| Clay Mathematics Institute, Millennium Prize Problems | Done: the 6 problems still open |
| Hilbert's problems still open | Done (8) |
| Wikipedia “List of unsolved problems in…” (maths, CS, physics, astronomy, chemistry, biology, neuroscience, geoscience, economics, statistics), unsolved problems in medicine, Smale's problems | Done (secondary source: each question keeps its `src`) |
| Documented mysteries (Wow! signal, Voynich manuscript…) | 8 so far, from Wikipedia articles |

A question is kept if it is **open** (a reliable source says it is unresolved at the check date), **serious** (mainstream science; marginal or pseudo-scientific questions are excluded), **understandable** (one sentence, no jargon), **important** (in at least one established list), **sourced** and **dated** (a question can get solved: Poincaré is; Navier–Stokes is under evaluation).

**Placement.** A question's position comes from the subfields it touches, listed by hand in `questions.json` (an editorial choice). A question touching one region sits at the edge of the known, pointing toward the dark. A question linking far-apart regions (at least three disciplines across two domains, or spread above 0.4) is “transversal” and sits between them, in the central void.

**Folklore and tales** are not on the map: a legend is not a research topic. Only their science (for instance why people see ghosts) can be.

## Who writes what
<a id="who-writes-what"></a>

One person makes the site, helped by an AI (Claude). Nothing is hidden:

| Element | Made by | Checked by |
|---|---|---|
| Map data (topics, links, positions) | Scripts, from OpenAlex | Control figures above |
| Questions and sources | Written with an AI from published lists | Not yet reviewed by a specialist |
| Fiches | Drafts written with an AI | Every reference's existence is checked by a script in OpenAlex; the **text is not yet reviewed** by a specialist |
| Wikipedia excerpts | Reproduced as is (CC BY-SA) | Page chosen by hand |

Every fiche shows its state. When a specialist has reviewed a fiche, add `"relue": { "par": "Name", "date": "2026-12-01" }` to it in `questions.json`: the “AI draft” label is replaced by “Reviewed by Name, date”.

## Fiche checking pipeline

1. **Writing**: a draft written with an AI, labelled on the fiche.
2. **References**: `fetch-fiches.mjs` verifies each DOI in OpenAlex and each link; the title found is compared with what we meant to cite.
3. **Automatic check**: `check-fiches.mjs` (no AI, no network) writes `checks/report.md`: numbers absent from the sources, strong claims (“proved”, “never”), possibly off-topic references, number mismatches between French and English, fiches without references or translation.
4. **Human decision**: a flagged point is a question, not an error. Humans rule through GitHub issues; each decision is logged in `checks/decisions.json` with its author and date.
5. **Named review**: only `relue: { par, date }` replaces the “AI draft” label.

Limit: a second AI rereading every draft is not wired in (no key, no external call in this repository). The report format is ready for it.

## What we deliberately do not do (at launch)

No accounts, no votes, no rankings, no ads. Votes need moderation, are easy to manipulate and measure popularity rather than importance. Instead: a “report an error or propose a source” link on each fiche, through GitHub.

## Advances ("!" on the map)

`advances.json` lists major results, prizes and AI-assisted progress (37 entries). Each has a year, a status (`accepted`, `claimed`, `disputed`), an optional `ai` flag, the subfields it touches, a bilingual summary, and the sources actually read. The summaries are drafted with an AI from those sources, so they carry the same "not reviewed" label as the fiches. Most sources are English Wikipedia pages (secondary); Fields, Abel and Nobel items for 2026 are not checked against the official committees. The default view shows advances since 2020; the "Advances" filter shows the whole history. The `ai` tag appears only when a read source says an AI contributed.
