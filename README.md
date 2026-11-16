# Carte de l'inconnu

Un atlas de ce que l'humanité ne sait pas encore. On y entre par curiosité, on s'y promène, et on en sort en sachant où on pourrait aider.

Aujourd'hui, la carte montre le **connu** : les 4 516 sujets de recherche répertoriés par [OpenAlex](https://openalex.org), placés d'après les articles qu'ils partagent. Dessus sont posées 31 **grandes questions ouvertes**, chacune avec sa source (voir `questions.json`) et son propre lien (par exemple `/#conscience`).

- **Vision et méthode** : [methode.md](methode.md)
- **La carte** : `docs/index.html`
- **Les trois directions visuelles comparées** : `docs/directions.html`

## Comment lire la carte

| Ce qu'on voit | Ce que ça mesure |
|---|---|
| Une étoile | Un sujet de recherche réel |
| Sa taille et son éclat | Le nombre d'articles publiés dessus |
| Le relief coloré | La densité de recherche, teintée par grand domaine |
| Un anneau | Une grande question ouverte, placée entre les sous-disciplines qu'elle touche |
| Deux sujets proches | Leurs sous-disciplines partagent beaucoup d'articles |
| Le noir | Presque personne n'y travaille |

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
| `questions.json` | Les grandes questions, avec source, statut et sous-disciplines touchées |
| `build-directions.mjs` | Calcule les positions et génère les pages |
| `carte.tpl.html` | Le gabarit de la carte |
| `directions.tpl.html` | Le gabarit de la comparaison des trois directions |
| `prototype-v1.html` | Le premier prototype, avec 29 questions écrites à la main et des filaments décoratifs |

## Limites connues

- Le nombre d'articles mesure la quantité de recherche, pas la quantité de savoir.
- Certains compteurs d'OpenAlex sont faux. Ils sont plafonnés au 99e centile et signalés au survol.
- Les liens comptent les articles partagés entre sous-disciplines, pas les citations.
- La disposition dépend des réglages du placement par forces dans `build-directions.mjs`.
- Les noms des sous-disciplines et des sujets sont encore en anglais.
- Les 31 questions viennent de deux listes seulement : 24 de la revue *Science* (2005, dont la liste date de plus de vingt ans) et les 7 problèmes du prix du millénaire. Elles sont rédigées à la main d'après les sources citées, pas extraites automatiquement. La liste complète des 125 questions de *Science* n'a pas été consultée.
- La position d'une question est un barycentre des sous-disciplines que j'ai choisies à la main : c'est un choix éditorial, pas une mesure.

Données : OpenAlex, sous licence CC0.
