# Contributing

Unknownpedia has no accounts and no votes: contributions go through GitHub, and a change is judged on its **sources**, not on how many people ask for it.

## What you can do

- **Correct a fiche or challenge a claim**: open an issue with the template “Correct a fiche”. Give the sentence, what it should say, and a link or DOI (peer-reviewed article, review, recognised institution).
- **Propose a question**: use the template “Propose a question”. It needs a source stating that the question is unresolved. Wikipedia alone is not enough for a scientific question.
- **Review a fiche** (specialists): use the template “Review a fiche”. A fiche is marked reviewed only by a *named* person with a date (`relue: { par, date }` in `questions.json`). A review concluding “nothing to fix” is useful too.
- **Translate or simplify** a text: pull requests are welcome (`questions.json`, `textes.json`).

## How fiches are checked

1. A fiche is a draft written with an AI, and labelled so on the page.
2. `fetch-fiches.mjs` verifies every DOI in OpenAlex and every link.
3. `check-fiches.mjs` flags what a human should look at first and writes `checks/report.md`. **A flagged point is a question for a human, not a confirmed error.**
4. Humans decide through issues; each decision is logged in `checks/decisions.json` (`key`, `status`: confirmed / corrected / rejected, `by`, `date`).

## Rules

- Never invent a number, a quote or a reference. Every reference must exist in OpenAlex.
- An extraordinary claim needs a solid source; a popular hypothesis is not a credible one.
- No personal data, no accusations, no medical advice.
- The relief of the map measures research effort, never knowledge. Do not present it otherwise.
- Never commit secrets (the OpenAlex key lives in an environment variable or a repository secret).
- Code, comments and documentation are in English. The site itself is bilingual (FR/EN).

## Development

See the README for the build commands. After changing `questions.json`, run `node fetch-fiches.mjs` (if fiches changed), `node check-fiches.mjs`, then `BASE=https://unknownpedia.org node build-directions.mjs`.
