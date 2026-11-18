# Unknownpedia : vision et méthode

## L'idée en une phrase

Un atlas de ce que l'humanité ne sait pas encore : on y entre par curiosité, on s'y promène, et on en sort en sachant où on pourrait aider.

Le public visé est le curieux qui n'y connaît rien, et le lycéen ou l'étudiant qui cherche vers quoi s'orienter. Les chercheurs ne sont pas la cible, mais ils doivent pouvoir regarder le site sans rien trouver de faux.

## La règle qui commande tout le reste

**Rien de décoratif.** Chaque élément visible correspond à une donnée réelle et vérifiable. Si on n'a pas la donnée, on ne dessine rien. C'est ce qui manque au prototype actuel, où les filaments sont inventés.

## 1. Choisir les domaines

On ne les choisit pas nous-mêmes, on reprend une classification scientifique existante. Je propose celle d'OpenAlex, une base ouverte et gratuite de la recherche mondiale. Elle range tous les articles dans un arbre à quatre étages (chiffres relevés le 16 novembre 2026, stockés dans `squelette.json`) :

| Étage | Nombre | Exemple |
|---|---|---|
| Grands domaines | 4 | Sciences de la vie |
| Disciplines | 26 | Neurosciences |
| Sous-disciplines | 250 | Neurosciences cognitives |
| Sujets | 4 516 | Sommeil et mémoire |

Les sous-domaines sont donc fournis d'office : on zoome dans l'arbre. Notre seul travail est de renommer chaque étage en langage courant.

## 2. Relier les domaines entre eux

Les liens sont mesurés, pas dessinés à la main :

- **Entre domaines** : le nombre d'articles qui appartiennent aux deux à la fois (un article de neurosciences qui porte aussi un sujet de psychologie). Deux disciplines qui partagent beaucoup d'articles sont proches sur la carte. Les citations seraient une mesure plus fine, mais OpenAlex ne les donne pas en un appel.
- **Entre questions** : la ressemblance de leurs textes et les sujets qu'elles partagent.

La position de chaque chose sur la carte est calculée à partir de ces liens. Personne ne la place à la main.

## 3. Montrer ce qu'on sait et ce qu'on ignore

| Ce qu'on voit | Ce que ça mesure |
|---|---|
| Un point lumineux | Un sujet de recherche réel |
| Sa luminosité | Le nombre d'articles publiés dessus |
| Une zone sombre entre deux régions | Peu d'articles relient ces deux domaines |
| Un anneau | Une question ouverte |
| Une région avec beaucoup d'anneaux et peu de lumière | Beaucoup de questions, peu de recherche : c'est là qu'il faut chercher |

Deux limites à traiter :

- Le nombre d'articles mesure la quantité de recherche, pas la quantité de savoir. Un domaine peut publier beaucoup et comprendre peu. À afficher clairement sur le site.
- Les compteurs d'OpenAlex contiennent des erreurs de classement. Le sujet « fusion par confinement magnétique » affiche 40 millions d'articles, quand le sujet médian en a 49 000. Il faut plafonner ou corriger ces cas avant de s'en servir pour la luminosité.

## 4. Faire ressortir les questions importantes

Trois niveaux de profondeur. Tout est noté, mais on ne voit d'abord que le premier.

| Niveau | Contenu | Source | Visible |
|---|---|---|---|
| 1 | 100 à 200 grandes questions (problèmes du millénaire, vaincre le cancer, origine de la vie) | Listes reconnues : les 125 questions de la revue *Science*, les problèmes du prix du millénaire, les listes de problèmes non résolus de Wikipédia | Dès l'arrivée |
| 2 | Les sous-questions de chaque grande question | Articles de synthèse de chaque discipline | En zoomant |
| 3 | Les questions de détail, par milliers | Extraction automatique dans les articles | En zoomant à fond, ou par la recherche |

L'importance d'une question se calcule avec des signaux mesurables : dans combien d'articles elle revient, depuis combien de temps elle est posée, combien de domaines elle touche. Chaque question affiche ses sources.

## 5. Vote : pas au lancement

Je déconseille le vote pour l'instant, pour trois raisons : il oblige à gérer des comptes et de la modération, il se manipule facilement, et il mesure la popularité, pas l'importance.

À la place, sans compte :

- Un bouton « cette question m'intéresse », compté de façon anonyme. Il sert à montrer ce qui passionne les gens, jamais à classer les questions.
- Un lien « signaler une erreur ou proposer une source » sur chaque fiche.

Laisser les visiteurs écrire des questions ou des réponses attendra aussi : sans modération, la qualité scientifique s'effondre.

## 6. Le parcours du visiteur

1. **Arrivée** : la carte entière, quelques grandes régions, une trentaine de questions.
2. **Zoom** : les régions se divisent en sous-domaines, de nouvelles questions apparaissent.
3. **Fiche** : la question en une phrase, pourquoi elle compte, ce qui bloque, les sources.
4. **Sortie** : « pour aller plus loin » — par où apprendre ce domaine, qui travaille dessus.

L'étape 4 est celle qui permet d'apporter sa pierre : le site ne résout rien, il oriente.

## 7. Ordre de travail

Tu veux creuser le visuel avant les vraies questions. Je suis d'accord, avec une réserve : on ne peut pas juger un visuel honnête sur des points inventés. Il faut d'abord le squelette réel, qui est rapide à obtenir.

1. **Squelette réel** : récupérer les sujets, leur nombre d'articles et leurs liens. Aucune question à ce stade.
2. **Visuel** : essayer deux ou trois directions sur ce squelette, en choisir une.
3. **Niveau 1** : les grandes questions, rédigées et sourcées à la main.
4. **Niveaux 2 et 3** : l'extraction automatique.
5. **Lancement** : nom de domaine, version anglaise, image d'aperçu par question.

## Qui écrit quoi

Le site est fait par une seule personne, avec l'aide d'une IA (Claude). Rien n'est caché : voici la répartition.

| Élément | Fait par | Vérifié par |
|---|---|---|
| Données de la carte (sujets, liens, positions) | Script, à partir d'OpenAlex | Chiffres de contrôle dans `README.md` |
| Questions et sources | Rédigées avec une IA, à partir de listes publiées (*Science* 2005, prix du millénaire) | Pas encore relues par un spécialiste |
| Fiches détaillées | Brouillons rédigés avec une IA | L'existence de chaque référence est vérifiée par script dans OpenAlex ; le texte **n'est pas encore relu** par un spécialiste |
| Extraits Wikipédia | Repris tels quels (CC BY-SA) | Page choisie à la main |

Chaque fiche affiche son état. Quand un spécialiste l'a relue, on ajoute dans `questions.json`, dans la fiche, `"relue": { "par": "Nom", "date": "2026-12-01" }` : l'étiquette « brouillon IA » est alors remplacée par « Relu par Nom, date ». Si tu es spécialiste d'une de ces questions et que tu veux la relire, ouvre une *issue* sur le dépôt.

## Ce qui reste à décider

- **Le vote** : d'accord pour s'en passer au lancement ?
- **Le périmètre** : toute la science d'un coup, ou une discipline d'abord pour valider la méthode ?
- **La métaphore** : garder le ciel, ou tester autre chose à l'étape 2 ?

## 9. Les questions : méthode

On n'invente pas de questions : on les collecte dans des sources reconnues, on les qualifie, on les place avec des données, on écrit leur fiche et on la fait relire.

### Où les trouver

| Source | Statut |
|---|---|
| Revue *Science*, 125 questions (2005) | 25 déjà en place, en partie écrites de mémoire. La liste officielle complète reste à obtenir et à confronter |
| Problèmes du prix du millénaire (institut Clay) | Fait : les 6 problèmes encore ouverts |
| Listes Wikipédia « List of unsolved problems in… » | Existent en anglais pour la physique, la chimie, la biologie, les neurosciences, l'informatique, les mathématiques, la médecine, l'économie, la philosophie et les géosciences (vérifié le 16 novembre 2026). Source secondaire : chaque question retenue doit être recoupée avec une source institutionnelle ou un article de synthèse |
| Rapports d'académies et d'agences (astronomie, climat, santé, ingénierie) | À explorer, non vérifié |
| Extraction automatique des sections « limites » des articles | Plus tard, pour les questions de détail. Marquées « extraites automatiquement », jamais présentées comme choisies |

### Ce qui fait qu'une question est retenue

| Critère | Test |
|---|---|
| Ouverte | Une source fiable la dit non résolue ou sans consensus, à la date de vérification |
| Sérieuse | Question de la science établie ; les questions marginales, idéologiques ou pseudo-scientifiques sont exclues |
| Compréhensible | Elle se formule en une phrase, sans jargon |
| Importante | Elle figure dans au moins une liste établie |
| Sourcée | Au moins une source citée et une référence dont l'existence est vérifiée |
| Datée | On note la date de dernière vérification : une question peut se résoudre (Poincaré l'est, Navier-Stokes est en cours d'évaluation) |

### Où on la place

Aujourd'hui, les sous-disciplines d'une question sont choisies à la main : c'est un choix éditorial. La version mesurée : chercher dans OpenAlex les articles qui parlent de la question, regarder dans quelles sous-disciplines ils tombent, et garder les trois à cinq plus fréquentes. L'éditeur ne fait plus que valider. À faire.

### La fiche

Brouillon (une IA peut aider à le rédiger) → script de vérification (extrait Wikipédia et références retrouvées) → relecture par un spécialiste → publication avec « relu par X, le jj/mm ». Trois états affichés : « en préparation », « brouillon », « relu ». Seules les fiches relues devraient être mises en avant.

### Combien

Je n'ai pas de chiffre vérifié. Un objectif raisonnable pour la première version : environ 150 questions, avec au moins 4 par discipline (26 × 4 = 104) pour qu'aucune région ne soit vide, plus une vingtaine de questions transversales. Ensuite, quelques centaines de sous-questions, puis des milliers de questions de détail extraites automatiquement, marquées comme telles.

### Proposer une question

Ouvrir une « issue » sur le dépôt GitHub avec l'énoncé, la source et la discipline. Elle est évaluée selon les critères ci-dessus. Pas de comptes ni de vote à construire pour l'instant.


## Contrôle des fiches (18 novembre 2026)

1. **Écriture** : brouillon rédigé avec une IA, étiqueté comme tel sur la fiche.
2. **Références** : `fetch-fiches.mjs` vérifie chaque DOI dans OpenAlex et les liens ; le titre trouvé est comparé à ce qu'on voulait citer.
3. **Contrôle automatique** : `verifier-fiches.mjs` (sans IA, sans réseau) écrit `controle/rapport.md`. Il repère les nombres absents des sources, les affirmations fortes (« démontré », « jamais »), les références peut-être hors sujet, les écarts de nombres entre français et anglais, les fiches sans référence ou sans traduction.
4. **Décision humaine** : un point repéré est une question, pas une erreur. Les humains tranchent par GitHub (modèles dans `.github/ISSUE_TEMPLATE/`) ; chaque décision est notée dans `controle/decisions.json` avec son auteur et sa date.
5. **Relecture nommée** : seule la mention `relue: { par, date }` dans la fiche de `questions.json` remplace l'étiquette « brouillon IA ».

Limite : une seconde IA qui relirait chaque brouillon n'est pas branchée (aucune clé, aucun appel externe dans ce dépôt). Le format du rapport est prévu pour l'accueillir.
