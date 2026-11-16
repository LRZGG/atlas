# À peaufiner

État au 16 novembre 2026. Ce document liste ce qui ne va pas, pourquoi, et ce qu'on propose. Il complète [methode.md](methode.md).

## 0. Fait lors de la deuxième passe (16 novembre)

- **Survol** : une infobulle seule, plus de traits. **Tirage des étoiles supprimé.** Un clic sur un point éclaire toute sa sous-discipline et replie la légende.
- **Relief assumé** comme « effort de recherche », avec une échelle dans la légende.
- **Questions** : au bord du connu, sauf les transversales (au moins trois disciplines, ou régions éloignées) qui restent au centre, dans la « terra incognita ».
- **Couleurs** : cohésion par discipline ajoutée à la disposition (88 % de voisines du même domaine au lieu de 77 %) et une nuance par discipline dans la teinte de son domaine. Les ponts réels restent visibles : le mélange restant n'est pas un bug.
- **Carnet d'exploration** : les questions ouvertes se remplissent, avec un compteur « n / 31 ». Ni points, ni classement.
- **Cadrage** : la question ouverte se place à gauche pour ne pas passer sous la fiche. Les étiquettes ne dépassent plus de l'écran.

**Troisième passe (même jour)**

- **Relief net à tout zoom** : dessiné par le processeur graphique (WebGL 2) au lieu d'une image agrandie. Les petits îlots isolés autour de l'anneau ne sont plus dessinés.
- **Questions** : des étoiles à quatre branches (huit pour les transversales, creuses une fois lues) à la place des anneaux, qui ressemblaient à des cases à cocher.
- **Vide central** agrandi par dilatation radiale (rayon 0,17 → 0,41), avec « terra incognita » centré dedans et une zone réservée au texte.
- **Visite guidée** en cinq étapes. **Légende repliée** au départ, carnet affiché à côté des boutons.

Reste à faire : tout ce qui suit, notamment l'aperçu Wikipédia, la traduction et le contenu (31 questions, c'est trop peu). À trancher : le mode gamifié (voir la discussion du 16 novembre), qui n'a de sens qu'avec bien plus de questions.

## 1. Le but, à trancher avant le reste

**Proposition.** « Choisis une question que personne n'a résolue et vois où elle se situe dans toute la science. »

- **Public principal** : le curieux sans bagage (lycéen, étudiant, grand public).
- **Les experts** ne sont pas les utilisateurs mais les validateurs : ils ne partageront le site que s'ils n'y trouvent aucune erreur.

**Constat.** Aujourd'hui le visuel pèse plus que le contenu. Avec 31 questions, la carte seule ne donne ni raison de revenir ni raison de partager. La valeur est dans les questions et leurs fiches ; la carte sert à les trouver.

## 2. Problème de fond : ce que mesure le relief

Le relief mesure le **nombre d'articles publiés**, c'est-à-dire où les chercheurs travaillent, pas ce qu'on sait. Et les questions tombent dans les zones denses (la matière noire est en astrophysique, une région très publiée). Cela contredit l'idée « le noir = l'inconnu ».

| Option | Effet |
|---|---|
| A. Assumer | Le relief devient « où l'humanité concentre ses efforts », le noir « peu étudié », et les questions se posent au **bord** des régions, tendues vers le noir |
| B. Changer de mesure | Chercher un indicateur de « savoir établi » : aucun n'existe proprement |

**Recommandation : A.** Réécrire la légende en conséquence et placer les questions sur le bord du connu.

## 3. Défauts constatés

| Défaut | Cause | Correction proposée |
|---|---|---|
| Le survol d'une étoile trace des traits et des noms | Il dessine les liens entre les centres de sous-disciplines, qui ne sont pas visibles | Survol = infobulle seule. Les liens n'apparaissent qu'au clic, entre éléments visibles |
| Tirer une étoile fait bouger tout de façon bizarre | Le geste déplace tout son groupe, puis ses voisins en élastique, pour un seul point attrapé | **Supprimer le tirage.** Interactions utiles à la place : recherche, filtre par domaine, parcours guidé |
| Les questions sont mal posées | 31 anneaux identiques, placés à un barycentre choisi à la main, parfois au milieu de zones denses, étiquettes qui se chevauchent | Les placer au bord du connu. Hiérarchie : grandes questions visibles de loin, sous-questions en zoomant. Regrouper les voisines |
| Relief flou en zoom | Calculé une fois, à 1 400 pixels | Le recalculer par morceaux selon le zoom, ou le tracer en courbes vectorielles |
| Légende masquée par la fiche | Fiche et légende se superposent sur les écrans peu hauts | Correctif ajouté, **non vérifié à l'écran** |
| Noms en anglais | Les 276 noms de disciplines et sous-disciplines viennent d'OpenAlex ; 26 seulement sont traduits | Traduire à la main les 250 sous-disciplines. Pour les 4 516 sujets, à décider |
| Compteurs d'articles faux | OpenAlex classe mal certains sujets (40 millions d'articles pour un seul) | Aujourd'hui plafonnés au 99e centile : corriger sujet par sujet |
| Inutilisable au clavier | Tout est dessiné dans un canvas | Une liste des questions accessible, avec focus visible |
| Temps de chargement | Le relief est calculé au démarrage sur le fil principal | Durée non mesurée : la mesurer, puis le précalculer au build si besoin |

D'autres défauts existent sûrement : à compléter avec ceux que tu as vus.

## 4. La fiche d'une question, avec aperçu dans l'appli

Contenu proposé : **ce qu'on sait** · **ce qu'on ignore** · **pourquoi c'est dur** · **pour aller plus loin** (3 liens) · **par où commencer**.

- **Aperçu** : un extrait et une image tirés de Wikipédia, et quelques articles marquants d'OpenAlex.
- **Où les récupérer** : au moment du build et pas dans le navigateur du visiteur. Plus robuste, rien ne dépend d'un service externe en direct, et le visiteur n'envoie rien à personne. Résultat stocké dans `questions.json`.
- **À vérifier** : la page Wikipédia de chaque question doit être choisie à la main (champ `wiki`) car la correspondance automatique se trompera. Les images ont leurs licences à respecter et à citer.

## 5. Direction artistique

Piste : **l'atlas d'exploration**, avec la zone sombre comme *terra incognita*.

- **Garder** : le fond sombre, le relief, les quatre teintes par grand domaine, la typographie à empattements pour les noms de régions.
- **Réduire** : les étoiles, qui deviennent une poussière fine. Le relief porte l'information.
- **Une seule couleur pour l'inconnu** (la crème des anneaux), rien d'autre ne la partage.
- **Ajouter** : un quadrillage très discret et des repères de cartographe, pour le côté « atlas » et sérieux.
- **Interdire** : les effets qui n'encodent rien.

## 6. Ce qui peut se partager

- **Une image par question**, générée au build, qui montre la carte et la question. C'est ce qui s'affichera quand on colle un lien.
- **« Ma question »** : choisir celle qui nous intrigue et l'envoyer.
- **Un chiffre vrai et frappant**, calculé sur les données (par exemple la part de la recherche concentrée dans quelques disciplines). Seulement s'il résiste à la vérification.
- **Une version anglaise** : le public francophone seul est trop petit pour un effet de masse.

## 7. Ordre de travail proposé

1. **Corriger l'interaction** : survol, tirage supprimé, placement des questions au bord du connu.
2. **Fiche avec aperçu** pour quelques questions, pour juger le principe.
3. **Contenu** : passer de 31 à environ 150 questions, chacune vérifiée contre sa source.
4. **Direction artistique** affinée.
5. **Partage** : image par question, version anglaise.
6. **Lancement.**

## 8. À décider

- **Le public principal** : le curieux d'abord. D'accord ?
- **Le tirage des étoiles** : le supprimer. D'accord ?
- **Le relief** : l'assumer comme « effort de recherche » et le dire dans la légende. D'accord ?
- **Les questions** : les placer au bord du connu. D'accord ?
