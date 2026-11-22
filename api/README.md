# Forecast API (no accounts, no money)

The site works without it: forecasts then stay on the visitor's device and the page says so. To show the estimate of all participants, deploy this small API.

## What it does

- `GET /api/challenge` gives a small proof-of-work puzzle (about half a second in the browser).
- `POST /api/vote` records one estimate (1 to 99 %) per device token and per question.
- `GET /api/claim/<id>` returns the number of participants and, from 10 participants, the median of all and the median weighted by track record, a 10-bin histogram, and an "unusual activity" flag.
- `GET /api/horizon/<qid>` and `POST /api/horizon` record one resolution-horizon estimate per device (`0`: < 2035, `1`: 2035–2070, `2`: > 2070, `3`: never) and return the distribution from 10 participants.
- `POST /api/feedback` records an anonymous, deduplicated "too technical?" flag per fiche.
- `POST /api/submit` accepts a no-account question, claim or correction proposal (title + https source URL + optional note), protected by the same proof-of-work puzzle and network rate limit.
- The list of questions, their closing dates and outcomes comes from `https://unknownpedia.org/forecasts.json`, built from `ia.json` (field `forecast`), so resolving a question only needs an edit of `ia.json` (`outcome: true|false`) and a site rebuild.

## Protection against bot armies (honest limits)

1. One vote per device token and question (the token is a random 128-bit value made in the browser; the server stores only a salted hash). Edits are limited to 3.
2. Proof of work bound to the question and the token (17 bits): cheap for a person, a cost per fake device.
3. At most 20 submissions per hour per network (hashed IP with a daily salt; the IP is never stored).
4. A device without a track record weighs 0.05. All such devices together can never carry more than 30% of the weighted estimate, and the weighted estimate is shown only when at least 3 devices with a track record have voted. A track record = well calibrated estimates on resolved questions (Brier score).
5. Medians, not means; nothing shown below 10 participants.
6. "Unusual activity" flag when more than half of the votes come from devices first seen in the last 24 h and most of those sit at the extremes.

What it cannot stop: a patient attacker who builds a track record on many devices over months, or buys many networks. Without accounts there is no perfect answer. The site shows both numbers and says which one to rely on. Run `node api/test.mjs` to see a simulated 40-device bot burst (raw median pushed to 99 %, weighted estimate held at 20 %).

## Deploy on Cloudflare Workers (free tier is enough)

1. Create a KV namespace, bind it as `FC` to a new Worker whose code is `api/worker.js` (with `handler.mjs` and `pow.js` next to it).
2. Add a secret `FC_SECRET` (any long random string) and a variable `SITE=https://unknownpedia.org`.
3. Attach the Worker to a first-party hostname, for example `api.unknownpedia.org` (the visitor's browser then never contacts a third-party origin).
4. In the repository, add the variable `FC_API=https://api.unknownpedia.org` (Settings, Secrets and variables, Actions, Variables). The weekly workflow passes it to the build. For a manual build: `FC_API=https://api.unknownpedia.org BASE=https://unknownpedia.org node build-directions.mjs`.

## Local test

```bash
node api/dev-server.mjs 8787
```

```bash
FC_API=http://localhost:8787 BASE=https://unknownpedia.org node build-directions.mjs
```

Then serve `docs/` and open the Claims window.

## Privacy

No account, no e-mail, no raw IP stored. The device token lives in the browser's local storage; clearing it forgets the track record. Estimates sent to the API are public in aggregate only.
