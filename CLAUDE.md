# Unknownpedia : contexte pour Claude

Atlas ouvert des questions non résolues de la science, posées sur une carte mesurée de la recherche mondiale. Site statique (GitHub Pages) sur https://unknownpedia.org (le .com redirige). Lire d'abord `PRODUCT.md` (cadrage), `a-faire.md` (priorités), `methode.md` et `README.md` (méthode, limites).

L'auteur est francophone et travaille seul : répondre en français, simplement, sans longs documents.

## Commandes

- Reconstruire le site : `BASE=https://unknownpedia.org node build-directions.mjs` (écrit `docs/`). Node 18+, aucune dépendance.
- Voir le site : servir `docs/` (par exemple `python -m http.server -d docs 8123`). Les polices sont en `/fonts/`, donc à la racine du serveur.
- Données : `fetch-squelette.mjs`, `fetch-liens-sujets.mjs`, `fetch-fiches.mjs`. La clé OpenAlex vient de la variable `OPENALEX_API_KEY` (ou `OPENALEX_KEY_FILE`), **jamais dans un fichier du dépôt**.
- Maquettes et prototypes (hors site) : `build-maquettes.mjs`, `build-proto.mjs`, `build-sciguessr.mjs` lisent `carte-de-l-inconnu.html` (fragment produit par le build principal) ; leurs sorties sont ignorées par Git.

## Décisions prises (ne pas rouvrir sans raison)

- **Direction artistique : la planche de brevet** (`carte.tpl.html`) : courbes de niveau, clair et sombre, « ? » en carmin (blanc en sombre). Pas de couleurs par domaine, pas d'étoiles, pas de visite guidée, pas de carnet ni de « questions lues ». Le texte en haut à gauche, qui dit ce qu'on regarde, reste et s'efface au zoom.
- **Honnêteté d'abord** : le relief mesure l'effort de recherche (articles publiés), pas le savoir. Chaque fiche affiche qu'elle est un brouillon rédigé avec une IA tant qu'un spécialiste nommé ne l'a pas relue (`relue: { par, date }` dans la fiche de `questions.json`). Ne jamais cacher l'usage de l'IA.
- **Pas de comptes, de votes ni de classements au lancement. Jamais de publicité.** Contribution via GitHub.
- **Licences** : données OpenAlex CC0 ; extraits Wikipédia en CC BY-SA (attribués) ; polices et images uniquement sous licence libre, créditées. Polices actuelles (IM Fell DW Pica, Archivo Narrow, OFL) hébergées dans `docs/fonts/` avec leurs licences : ne pas charger de ressource externe chez le visiteur.
- **Nom** : Unknownpedia. Les 31 questions viennent de deux listes publiées (*Science* 2005, problèmes du millénaire), rédigées à la main ; chaque question garde sa source.
- Ne pas inventer de chiffres, de témoignages ni de références : toute référence est vérifiée dans OpenAlex par `fetch-fiches.mjs`.
- Traduction anglaise des fiches à la fin, quand le contenu ne bouge plus.

## Pièges connus

- `textes.json` contient tous les textes de l'interface (FR et EN) ; les noms de sous-disciplines et de sujets sont en anglais (OpenAlex).
- La disposition (cohésion, dilatation du vide central) est en partie éditoriale ; voir le README avant de la présenter comme une mesure.
- Les gabarits `build-*.mjs` extraient `DATA` de `carte-de-l-inconnu.html` : garder la ligne `const DATA = ...;` suivie de `const { F, S, L` dans `carte.tpl.html`.
- Le dépôt est public : aucun secret, aucune adresse personnelle, aucun fichier du dossier `.claude/`.

## Ensuite (voir `a-faire.md`)

Passer de 31 à 100–150 questions sourcées, écrire les fiches par lots avec contrôle automatique des références, trouver des relecteurs nommés, puis monitoring sans cookies, page « Sources et licences », traduction.
