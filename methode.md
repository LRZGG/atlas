# Carte de l'inconnu : vision et méthode

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

## Ce qui reste à décider

- **Le vote** : d'accord pour s'en passer au lancement ?
- **Le périmètre** : toute la science d'un coup, ou une discipline d'abord pour valider la méthode ?
- **La métaphore** : garder le ciel, ou tester autre chose à l'étape 2 ?
