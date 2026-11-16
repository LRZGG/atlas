# Carte de l'inconnu

Un atlas de ce que l'humanité ne sait pas encore. On y entre par curiosité, on s'y promène, et on en sort en sachant où on pourrait aider.

Aujourd'hui, la carte montre le **connu** : les 4 516 sujets de recherche répertoriés par [OpenAlex](https://openalex.org), placés d'après les articles qu'ils partagent. Dessus sont posées 31 **grandes questions ouvertes**, chacune avec sa source (voir `questions.json`) et son propre lien (par exemple `/#conscience`).

- **Vision et méthode** : [methode.md](methode.md)
- **Ce qui reste à améliorer** : [a-polir.md](a-polir.md)
- **La carte** : `docs/index.html`
- **Les trois directions visuelles comparées** : `docs/directions.html`

## Comment lire la carte

| Ce qu'on voit | Ce que ça mesure |
|---|---|
| Une étoile | Un sujet de recherche réel |
| Sa taille et son éclat | Le nombre d'articles publiés dessus |
| Le relief coloré | La densité de recherche, teintée par grand domaine |
| Une petite étoile crème qui scintille | Une grande question ouverte, au bord du connu |
| La même, entourée d'un cercle | Une question transversale, qui relie plusieurs disciplines |
| Une étoile creuse, immobile | Une question déjà lue (carnet de l'utilisateur) |
| « Terra incognita » | Le vide entre les disciplines : peu d'articles relient des domaines éloignés |
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
- Les 31 questions viennent de deux listes seulement : 25 de la revue *Science* (2005, une liste vieille de plus de vingt ans) et 6 des 7 problèmes du prix du millénaire (le septième, Poincaré, est résolu). Elles sont rédigées à la main, pas extraites automatiquement.
- **À vérifier avant tout lancement** : seule une partie des 25 questions de *Science* a été confrontée à une source consultée (l'univers, la conscience, les gènes, la longévité, Malthus, et en partie la vie ailleurs, la coopération, l'unification de la physique et l'incertitude quantique). Les autres sont écrites de mémoire et doivent être relues contre le numéro original du 1er juillet 2005. Le champ `note` de la question « reprogrammation » (prix Nobel 2012) est aussi de mémoire.
- Le statut de Navier-Stokes provient de MathWorld (consulté le 16 novembre 2026) ; la page de l'institut Clay que j'ai ouverte ne mentionne pas ce statut.
- La position d'une question vient d'un choix éditorial (les sous-disciplines qu'elle touche, listées à la main dans `questions.json`) et d'une règle de placement : au bord du connu si elle touche une région, au centre si elle touche au moins trois disciplines couvrant au moins deux domaines, ou des régions éloignées (« question transversale »). Le seuil d'éloignement (0,4) est un réglage choisi d'après une coupure naturelle dans la répartition des écarts. Une question transversale n'est donc pas toujours dans le vide du centre : elle se pose au barycentre des régions qu'elle relie (la conscience, par exemple, tombe côté sciences sociales).
- Le centre de la carte est dilaté (`HOLE`, 0,5, dans `build-directions.mjs`) : c'est un choix de présentation. La transformation est radiale et croissante, donc l'ordre autour du centre et le voisinage sont conservés, mais le vide central passe d'un rayon de 0,17 à 0,41 pour pouvoir se lire.
- Le relief est dessiné par le processeur graphique avec WebGL 2, ce qui le rend net à tout zoom. Sans WebGL 2, il n'apparaît pas : ce cas n'a pas été testé.
- La disposition combine la mesure des liens et une attraction vers la discipline (`COH` dans `build-directions.mjs`, 0,08). Sans cette attraction, 77 % des sous-disciplines voisines d'une sous-discipline sont du même domaine ; avec, 88 %. Les ponts réels (neurologie clinique, interaction homme-machine, génie biomédical) restent visibles.
- Le relief mesure l'effort de recherche (articles publiés), pas le savoir établi : une question fondamentale peut être au cœur d'une zone très publiée.

Données : OpenAlex, sous licence CC0.
