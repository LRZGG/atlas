# À faire

État au 16 novembre 2026. Liste de travail, dans l'ordre de priorité. Voir aussi [a-polir.md](a-polir.md) (défauts constatés) et [methode.md](methode.md).

## 1. Design (priorité)

Direction retenue le 16 novembre 2026 : **la planche de brevet** (clair et sombre, relief en courbes de niveau).

- [x] **Direction artistique** : quatre directions comparées (`maquettes.tpl.html`), la planche de brevet choisie.
- [x] **Polices libres** : IM Fell DW Pica et Archivo Narrow (OFL), hébergées dans `docs/fonts/` avec leurs licences (pas de requête vers Google chez le visiteur).
- [x] **Clair et sombre** : bouton ◐, réglage du système par défaut, choix mémorisé.
- [x] **Texte en haut à gauche** : gardé, il s'efface au zoom et à l'ouverture d'une fiche ; nouvelle police et nouveau texte.
- [x] **Légende** : remplacée par une table des références repliée (disciplines numérotées et liste des questions).
- [x] **Bouton FR / EN** : refait dans le style de la planche. À vérifier à l'usage.
- [x] **Visite guidée, carnet et « questions lues »** : retirés.
- [x] **Le « ? » des questions** : gardé.
- [x] **Sources et licences** : bulle en bas à droite.
- [ ] **Page « Sources et licences » complète** : la bulle résume ; une vraie page reste à écrire (licence du dépôt, citations).
- [x] **Clavier** : la carte se pilote au clavier (flèches, + −, 0, N/P entre questions, Entrée, Échap), focus visible, annonce vocale de la question ; aide dans la table des références. Testé dans Chromium, pas avec un lecteur d'écran.
- [~] **Mobile** : testé en émulation iPhone 13 (pincement, panneau plein écran, cibles tactiles de 42 px, en-tête sans chevauchement) ; **reste à essayer sur un vrai téléphone**. La carte est petite sur écran étroit.
- [x] **Aperçu de partage** : une image 1200×630 par page de question et une pour l'accueil (`node build-partage.mjs`, à relancer quand des pages s'ajoutent). Les pages de question sont maintenant au style de la planche. Un lien `#id` de la carte n'a pas d'aperçu propre : seules les pages `/fr/q/…` en ont.

## 2. Contenu

- [x] **Passer de 31 à 100–150 questions**, chacune avec sa source : 105 le 17 novembre 2026 (Science 2005, problèmes du millénaire, Hilbert, listes Wikipédia). Reste à relire les énoncés contre leurs sources ; pistes pour aller plus loin : économie, médecine, statistiques, philosophie, sciences humaines (aucune liste Wikipédia utilisée pour l'instant).
- [ ] **Une fiche pour chaque question**, par lots, avec contrôle automatique des références et étiquette « brouillon IA » tant qu'aucun spécialiste n'a relu. Fait : 12 fiches sur 105 (lot du 17 novembre : jumeaux, factorisation, repliement des protéines, trous noirs et information, tension de Hubble, supraconducteurs, anesthésie, Cambrien, Riemann).
- [ ] **Pages HTML par question** (faites pour 3 fiches) : à étendre au fur et à mesure.
- [ ] **Traduction anglaise** à la fin, quand le contenu ne bouge plus.
- [ ] **Relecteurs nommés** : en contacter quelques-uns dès que 30 fiches sont prêtes.

## 3. Aider à faire avancer les choses (avec l'IA)

Il manque un twist. Pistes retenues pour y réfléchir :

- [ ] **L'IA vérifie l'IA, l'humain arbitre** : une seconde IA relit chaque brouillon, les désaccords vont dans une file que des humains tranchent. Historique public.
- [ ] **Une carte qui bouge** : articles publiés ces 30 derniers jours par sujet (OpenAlex), pour voir où la frontière avance cette semaine. À vérifier : faisabilité exacte des comptages.
- [ ] **Adopter une question** : la suivre, être prévenu quand un travail lié paraît.
- [ ] **Page « Comment contribuer »** : corriger une référence, proposer une question, relire.

## 4. Mesure et protection

- [ ] **Monitoring** : nombre de visites, y compris les robots (à distinguer). GitHub Pages ne donne aucune statistique : il faut un outil de mesure. À comparer plus tard, de préférence sans cookies (GoatCounter, Cloudflare Web Analytics, Plausible).
- [ ] **Faux comptes, faux avis, robots** : le plus sûr au lancement est de ne **pas avoir de comptes** ni de votes publics, donc rien à falsifier. Quand la contribution arrivera :
  - passer par des comptes existants (GitHub) plutôt qu'un système maison ;
  - pas de classement ni de compteur de popularité qui fasse foi (loi de Goodhart) ;
  - une relecture « validée » exige plusieurs relecteurs indépendants et une identité vérifiable (par exemple ORCID) ;
  - limites de fréquence et anti-robot gratuit (Cloudflare Turnstile) sur tout formulaire.

## 5. Sources et licences

- [ ] OpenAlex : données CC0, citation souhaitée mais non obligatoire.
- [ ] Wikipédia : extraits en **CC BY-SA** : attribution et même licence obligatoires (déjà dans les fiches).
- [ ] Polices et images : uniquement sous licence libre (OFL, CC0…), licence citée dans « Sources et licences ».
- [ ] Choisir la licence du dépôt (code et contenus) avant d'accepter des contributions.

## 6. Plus tard

- [ ] Argent : GitHub Sponsors, puis micro-entreprise quand des revenus arrivent (à vérifier avec l'URSSAF).
- [ ] SciGuessr (test privé, non commité) : jeu d'entrée secondaire, à garder seulement s'il apprend quelque chose.
- [ ] Accessibilité au clavier (aujourd'hui tout est dans un canvas).
- [ ] Temps de chargement à mesurer.
- [ ] Noms français des 250 sous-disciplines.

## 7. Univers « Mystères » et « Folklore » (idée, à trancher)

- [~] **Labo des styles** (`docs/labo/`, non indexé, `node fetch-labo.mjs` puis `node build-labo.mjs`) : 8 maquettes sur de vraies données (Wikipédia, Wikidata, Commons). Mystères : dossier tapé, listing, cyanotype, coupure de presse. Folklore : bestiaire, estampe, cabinet de curiosités, bibliothèque bleue. Contenu de démonstration : statuts non validés, brouillons IA.
- [ ] Choisir un style par univers, puis 3 à 5 dossiers de test. Voir la critique dans la conversation du 17 novembre : le folklore reste hors de la carte mesurée, pas de témoignages d'utilisateurs, la barre de statut est identique partout.
- [x] Choix du 17 novembre : folklore = **colportage blanc (F4W) et nuit (F4K)** ; mystères : M6 (chemise) écarté, M1 repris en trois versions plus adultes (M1B rapport tapé, M1C fiches de catalogue, M1D dactylo en direct).
- [~] **Labo, 17 novembre (suite)** : M1R (dossier tapé réaliste, favori) ; vues « centre » : `viz-mystere.html` et `viz-folklore.html` (`node fetch-labo.mjs`, `node fetch-labo-plus.mjs`, `node make-world.mjs`, `node build-labo.mjs`, `node build-viz.mjs`). Constat sur les données : Wikidata n'a presque aucune date ni origine pour les légendes orales, donc une frise du folklore serait vide.
