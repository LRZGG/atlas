# Unknownpedia

Un atlas de ce que l'humanité ne sait pas encore. On y entre par curiosité, on s'y promène, et on en sort en sachant où on pourrait aider.

Aujourd'hui, la carte montre le **connu** : les 4 516 sujets de recherche répertoriés par [OpenAlex](https://openalex.org), regroupés par sous-discipline. Les 250 sous-disciplines sont placées d'après les articles qu'elles partagent, puis chacun des 4 516 sujets est placé d'après ses propres liens mesurés (les 8 sujets avec lesquels il partage le plus d'articles), avec une attache à sa sous-discipline (voir les limites). Dessus sont posées 31 **grandes questions ouvertes**, chacune avec sa source (voir `questions.json`) et son propre lien (par exemple `/#conscience`).

- **Vision et méthode** : [methode.md](methode.md)
- **Ce qui reste à améliorer** : [a-polir.md](a-polir.md)
- **La carte** : `docs/index.html`, qui détecte la langue du navigateur (français si la première langue connue est le français, anglais sinon, avec un sélecteur FR / EN). `docs/fr/index.html` et `docs/en/index.html` fixent la langue : un lien partagé la garde.
- **Les trois directions visuelles comparées** : `docs/directions.html`

## Comment lire la carte

| Ce qu'on voit | Ce que ça mesure |
|---|---|
| Un point | Un sujet de recherche réel ; sa taille croît avec le nombre d'articles |
| Les courbes de niveau | L'effort de recherche (articles publiés), pas le savoir établi |
| Les petits traits le long de la première courbe | Le bord du connu, tournés vers le moins étudié |
| Un numéro dans un cercle, relié par une ligne | Une discipline (table des références, en haut à droite) |
| Un « ? » rouge (blanc en mode sombre) et son nom en italique | Une grande question ouverte |
| Le vide au centre | Peu d'articles relient ces disciplines |
| Deux sujets proches | Leurs sous-disciplines partagent beaucoup d'articles |

Rien n'est décoratif : chaque élément correspond à une donnée.

## Régénérer

Il faut Node 18 ou plus récent, sans aucune dépendance.

```bash
node fetch-squelette.mjs --subfields
```

```bash
node build-directions.mjs
```

La première commande télécharge le squelette depuis OpenAlex dans `squelette.json` (déjà fourni, relevé le 16 novembre 2026). La seconde calcule les positions et écrit les pages dans `docs/`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `fetch-squelette.mjs` | Télécharge sujets, hiérarchie et liens depuis OpenAlex |
| `squelette.json` | Les données brutes |
| `fetch-liens-sujets.mjs` | Mesure, pour chaque sujet, les 40 sujets avec lesquels il partage le plus d'articles (clé d'API facultative, reprise automatique) |
| `liens-sujets.json` | Le résultat de `fetch-liens-sujets.mjs` |
| `questions.json` | Les grandes questions : nom court, énoncé, contexte (par langue : `fr` et `en`), source, statut, sous-disciplines touchées, et la fiche détaillée quand elle existe |
| `textes.json` | Tous les textes de l'interface, en français et en anglais. Pour ajouter une langue : une entrée de plus ici, une page de plus dans `build-directions.mjs` |
| `fetch-fiches.mjs` | Pour chaque fiche, télécharge l'extrait Wikipédia et vérifie chaque référence dans OpenAlex ; échoue si l'une est introuvable |
| `fiches.json` | Le résultat de `fetch-fiches.mjs` (extraits et références vérifiées) |
| `build-directions.mjs` | Calcule les positions et génère les pages |
| `carte.tpl.html` | Le gabarit de la carte (direction « planche de brevet », clair et sombre) |
| `docs/fonts/` | Polices libres (OFL) hébergées sur le site, avec leurs licences |
| `a-faire.md`, `PRODUCT.md` | Liste de travail et cadrage du produit |
| `build-maquettes.mjs`, `maquettes.tpl.html` | Les quatre directions artistiques comparées (maquettes) |
| `build-proto.mjs`, `proto-common.js`, `proto-chambre.tpl.html` | Prototype de la « chambre à nuages » (non retenu pour l'instant) |
| `build-sciguessr.mjs`, `sciguessr.tpl.html` | Test d'un jeu de devinettes sur la carte (non publié) |
| `directions.tpl.html` | Le gabarit de la comparaison des trois directions |
| `prototype-v1.html` | Le premier prototype, avec 29 questions écrites à la main et des filaments décoratifs |

## Limites connues

- Le nombre d'articles mesure la quantité de recherche, pas la quantité de savoir.
- Certains compteurs d'OpenAlex sont faux. Ils sont plafonnés au 99e centile et signalés au survol.
- Les liens comptent les articles partagés entre sous-disciplines, pas les citations.
- La disposition dépend des réglages du placement par forces dans `build-directions.mjs`.
- Traduction : l'interface, les noms et énoncés des 105 questions, les 26 disciplines et les extraits Wikipédia sont bilingues. Le contexte des questions et le texte des fiches sont **en français seulement** : en anglais, ils s'affichent en français avec un avertissement. Les noms des 250 sous-disciplines et des 4 516 sujets sont en anglais dans les deux langues (c'est la langue d'OpenAlex). Les titres anglais des questions de *Science* sont écrits de mémoire : à confronter à la liste officielle.
- Référencement : chaque page a sa langue déclarée, ses balises de description et de partage, des liens `hreflang` entre langues, un `robots.txt` et un `sitemap.xml`. Les adresses de ces fichiers viennent de la variable `BASE` (`BASE=https://exemple.org node build-directions.mjs` quand le domaine sera choisi). Le contenu de la carte est dessiné par script : tant que chaque question n'a pas sa propre page HTML, les moteurs de recherche n'y verront presque rien.
- Les liens entre sujets ont été mesurés le 16 novembre 2026 pour les 4 516 sujets (`liens-sujets.json`, environ 0,29 $ d'API, les 40 liens les plus fréquents de chaque sujet ; 87 sujets n'ont aucun lien et restent près du centre de leur sous-discipline). Le placement combine l'attraction par ces liens et une attache à la sous-discipline (`KANC`, 0,4, dans `build-directions.mjs`).
- Ce que ce placement apporte, mesuré : la distance moyenne d'un sujet à ses 5 sujets les plus liés passe de 0,296 à 0,184 (deux sujets au hasard : 0,953). Contrôle sans triche : pour les sujets liés de rang 9 à 13, que le placement n'utilise pas, la distance passe de 0,337 à 0,240. Le gain vient donc bien d'une structure réelle, mais il est partiel.
- Le compromis est volontaire : avec une attache faible (0,03), le gain monte (0,167 sur le contrôle) mais le vide entre les disciplines se comble presque (rayon 0,13 au lieu de 0,38 à 0,46). Ce vide est donc en partie un choix de présentation, à côté de la dilatation du centre.
- Le relief est calculé avec un noyau de 0,035 (unités de la carte), une compression de 0,42 et un premier niveau visible à 2 sur 8 (`SIG`, `GAM`, `B0`). Avec le noyau plus étroit de la version précédente (0,0176), les amas de sujets rendaient le relief fragmenté.
- Pour relancer la mesure : `node fetch-liens-sujets.mjs` avec une clé OpenAlex gratuite dans la variable `OPENALEX_API_KEY` (jamais dans le dépôt). Le script reprend là où il s'est arrêté.
- Les 105 questions viennent de listes publiées : 25 de la revue *Science* (2005, une liste vieille de plus de vingt ans), 6 des 7 problèmes du prix du millénaire (le septième, Poincaré, est résolu), et 74 ajoutées le 17 novembre 2026 d'après les problèmes de Hilbert encore ouverts et les listes Wikipédia des problèmes non résolus (mathématiques, informatique, physique, astronomie, chimie, biologie, neurosciences, géosciences). Chaque question garde sa source (champ `src`). Elles sont choisies et rédigées à la main, pas extraites automatiquement : l'énoncé et le contexte d'une question reprennent l'état que décrit la liste, et sont à faire relire par un spécialiste du domaine. Les listes Wikipédia sont ouvertes à tous et changent : ce n'est pas une source d'autorité.
- Les 12 fiches détaillées (3 d'origine, 9 du 17 novembre) sont des brouillons rédigés avec une IA. Chaque référence est vérifiée dans OpenAlex par `fetch-fiches.mjs` (le script attend quand Wikipédia ou OpenAlex limite le débit), mais le titre trouvé doit encore être comparé à ce qu'on voulait citer : OpenAlex abîme parfois les accents, d'où les champs facultatifs `t` et `a` d'une référence.
- **À vérifier avant tout lancement** : seule une partie des 25 questions de *Science* a été confrontée à une source consultée (l'univers, la conscience, les gènes, la longévité, Malthus, et en partie la vie ailleurs, la coopération, l'unification de la physique et l'incertitude quantique). Les autres sont écrites de mémoire et doivent être relues contre le numéro original du 1er juillet 2005. Le champ `note` de la question « reprogrammation » (prix Nobel 2012) est aussi de mémoire.
- Le statut de Navier-Stokes provient de MathWorld (consulté le 16 novembre 2026) ; la page de l'institut Clay que j'ai ouverte ne mentionne pas ce statut.
- La position d'une question vient d'un choix éditorial (les sous-disciplines qu'elle touche, listées à la main dans `questions.json`) et d'une règle de placement : au bord du connu si elle touche une région, au centre si elle touche au moins trois disciplines couvrant au moins deux domaines, ou des régions éloignées (« question transversale »). Le seuil d'éloignement (0,4) est un réglage choisi d'après une coupure naturelle dans la répartition des écarts. Une question transversale n'est donc pas toujours dans le vide du centre : elle se pose au barycentre des régions qu'elle relie (la conscience, par exemple, tombe côté sciences sociales).
- Le centre de la carte est dilaté (`HOLE`, 0,5, dans `build-directions.mjs`) : c'est un choix de présentation. La transformation est radiale et croissante, donc l'ordre autour du centre et le voisinage sont conservés, mais le vide central passe d'un rayon de 0,17 à 0,41 pour pouvoir se lire.
- Le relief est calculé dans le navigateur (densité de recherche, huit niveaux) puis tracé en courbes de niveau vectorielles, nettes à tout zoom. Il ne dépend plus de WebGL.
- La disposition combine la mesure des liens et une attraction vers la discipline (`COH` dans `build-directions.mjs`, 0,08). Sans cette attraction, 77 % des sous-disciplines voisines d'une sous-discipline sont du même domaine ; avec, 88 %. Les ponts réels (neurologie clinique, interaction homme-machine, génie biomédical) restent visibles.
- Seules 3 questions ont une fiche détaillée (la conscience, P contre NP, l'origine de la vie). Elles sont rédigées à la main à partir de connaissances générales ; l'extrait Wikipédia est repris tel quel (licence CC BY-SA, attribuée dans la fiche) et l'existence de chaque référence est vérifiée dans OpenAlex. Le choix des références et la justesse du texte n'ont **pas** été relus par un spécialiste : à faire avant tout lancement. L'année affichée pour l'article de Chalmers (1996) est celle de la version éditée retrouvée dans OpenAlex.
- Le relief mesure l'effort de recherche (articles publiés), pas le savoir établi : une question fondamentale peut être au cœur d'une zone très publiée.

Données : OpenAlex, sous licence CC0.

- **Choix éditorial (17 novembre 2026)** : « Agricultural and Biological Sciences » est séparée en « Agronomie et alimentation » (agronomie, alimentation, forêts, horticulture, sols) et « Écologie et biologie des organismes » (zoologie, écologie, botanique, insectes, sciences aquatiques, général) ; « Biochimie, génétique et biologie moléculaire » garde son nom complet. Le dentaire reste une discipline à part, comme dans OpenAlex. La carte montre 27 disciplines (26 d'OpenAlex, dont une séparée en deux).
