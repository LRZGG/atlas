# Carte de l'inconnu

Un atlas de ce que l'humanité ne sait pas encore. On y entre par curiosité, on s'y promène, et on en sort en sachant où on pourrait aider.

Aujourd'hui, la carte montre le **connu** : les 4 516 sujets de recherche répertoriés par [OpenAlex](https://openalex.org), placés d'après les articles qu'ils partagent. Les questions ouvertes ne sont pas encore posées dessus.

- **Vision et méthode** : [methode.md](methode.md)
- **La carte** : `docs/index.html`
- **Les trois directions visuelles comparées** : `docs/directions.html`

## Comment lire la carte

| Ce qu'on voit | Ce que ça mesure |
|---|---|
| Une étoile | Un sujet de recherche réel |
| Sa taille et son éclat | Le nombre d'articles publiés dessus |
| Le relief coloré | La densité de recherche, teintée par grand domaine |
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

Données : OpenAlex, sous licence CC0.
