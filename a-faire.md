# À faire

État au 18 novembre 2026. Liste de travail, dans l'ordre de priorité. Voir aussi [a-polir.md](a-polir.md) (défauts constatés) et [methode.md](methode.md).

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
- [x] **Page « Sources et licences »** (`/fr/sources/`, `/en/sources/`) ; licences **proposées** (MIT pour le code, CC BY-SA 4.0 pour les textes) dans `LICENCES.md` : à confirmer.
- [x] **Clavier** : la carte se pilote au clavier (flèches, + −, 0, N/P entre questions, Entrée, Échap), focus visible, annonce vocale de la question ; aide dans la table des références. Testé dans Chromium, pas avec un lecteur d'écran.
- [~] **Mobile** : testé en émulation iPhone 13 (pincement, panneau plein écran, cibles tactiles de 42 px, en-tête sans chevauchement) ; **reste à essayer sur un vrai téléphone**. La carte est petite sur écran étroit.
- [x] **Aperçu de partage** : une image 1200×630 par page de question et une pour l'accueil (`node build-partage.mjs`, à relancer quand des pages s'ajoutent). Les pages de question sont maintenant au style de la planche. Un lien `#id` de la carte n'a pas d'aperçu propre : seules les pages `/fr/q/…` en ont.

## 2. Contenu

- [x] **Passer de 31 à 150 questions** (150 le 18 novembre) ;**ancien objectif** 100–150, chacune avec sa source : 105 le 17 novembre 2026 (Science 2005, problèmes du millénaire, Hilbert, listes Wikipédia). Reste à relire les énoncés contre leurs sources ; pistes pour aller plus loin : économie, médecine, statistiques, philosophie, sciences humaines (aucune liste Wikipédia utilisée pour l'instant).
- [ ] **Une fiche pour chaque question**, par lots, avec contrôle automatique des références et étiquette « brouillon IA » tant qu'aucun spécialiste n'a relu. Fait : 29 fiches sur 150 le 18 novembre (12 + 9 + 8 énigmes… voir `questions.json`), toutes bilingues (lot du 17 novembre : jumeaux, factorisation, repliement des protéines, trous noirs et information, tension de Hubble, supraconducteurs, anesthésie, Cambrien, Riemann).
- [ ] **Pages HTML par question** (faites pour 3 fiches) : à étendre au fur et à mesure.
- [x] **Traduction anglaise** des 150 contextes et des 29 fiches, pages `/en/q/…` générées. À refaire pour chaque nouvelle fiche.
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

## 7. Mystères et folklore : décision du 18 novembre

- **Une seule entrée : la carte scientifique.** Les trois onglets sont retirés. Les mystères entrent **sur la carte** comme des questions, sous le type « énigme documentée » (petit carré à côté du « ? », filtre Tout / Questions / Énigmes dans la table des références).
- [x] **8 énigmes sur la carte** (Wow!, Voynich, Anticythère, Toungouska, Nazca, Phaistos, linéaire A, Kryptos) : champ `type: "enigme"` dans `questions.json`, placées par leurs sous-disciplines (donc mesurées, pas dessinées). Fiches : « en préparation ».
- [x] Fiches des 8 énigmes écrites (références : 1 ou 2 seulement pour 4 d'entre elles, 0 pour 4 autres : à compléter)
- [ ] (ancien) Écrire les fiches des 8 énigmes (faits, ce qu'on ignore, références vérifiées, étiquette brouillon IA).
- [ ] Décider du sort du **labo** (`docs/labo/` : mappemonde ancienne, salle 3D, cabinet 3D, dossier tapé réaliste M1R, menus, transitions). Ce sont des maquettes sur données de démonstration : à garder hors site, ou à recycler (la mappemonde ancienne comme vue alternative de la carte ?).
- [ ] Règle d'entrée : « y a-t-il des chercheurs qui pourraient y répondre, et une source qui dit que la réponse manque ? » Oui → carte. Non → récit (folklore), hors carte.
- [ ] Folklore : seulement sa science (« Pourquoi voit-on des fantômes ? ») sur la carte ; les récits (Mothman, yeti) restent hors carte, étiquetés « récit, pas un fait ». Pas de témoignages d'utilisateurs.

## 8. Données à aller chercher

- [x] **Plus de questions** (150 atteint ; au-delà : psychologie, linguistique, sociologie n'ont pas de liste Wikipédia dédiée) : listes Wikipédia encore inexploitées (économie, médecine, statistiques, philosophie, psychologie, linguistique), liste « Problèmes ouverts » de revues, 23 problèmes de Smale, DARPA 2008 ; Wikidata « problème non résolu » (Q… à vérifier).
- [ ] **Énigmes supplémentaires** : colonie de Roanoke, disque de Phaistos déjà fait ; candidates : chiffres de Beale, rongorongo, écriture de l'Indus, épidémie dansante de 1518, Mary Celeste, lumières de Hessdalen (choisir celles qui ont un domaine de recherche).
- [x] **Compteurs d'OpenAlex** : erreur confirmée sur la fiche du sujet (41 M au lieu de 385 000 œuvres) ; le relief utilise maintenant la somme des articles 1990–2025. Voir `compteurs-suspects.md`. Reste : recalculer le placement avec ces poids (non fait).
- [x] **Articles par année et par sujet** (1990–2025) : curseur du temps sur la carte. Reste : « 30 derniers jours » (mise à jour régulière).
- [x] Noms français des 250 sous-disciplines ; [ ] noms français des sujets (4 516, OpenAlex en anglais).
- [ ] **Images libres** par question (Wikimedia Commons, licence créditée) : seulement si elles apprennent quelque chose.
- [ ] **Relecteurs** : liste de spécialistes par discipline (ORCID), à contacter dès 30 fiches.

## 9. Idées visuelles et animations (à trier)

Règle : rien de décoratif, chaque effet encode une donnée ou une source.
- [ ] **Plongée dans le vide** : cliquer « terra incognita » zoome dans le centre et fait apparaître les énigmes (transition déjà testée dans le labo).
- [ ] **Mappemonde ancienne** comme vue alternative (bouton « géographie ») : les questions placées par lieu d'origine (archéologie, observatoires) quand ce lieu existe.
- [ ] **Courbes qui respirent** : relief animé quand on change de période (articles publiés par année, 1990 → aujourd'hui) pour voir la frontière avancer.
- [ ] **Ligne entre questions voisines** au survol (sous-disciplines partagées), seulement entre éléments visibles.
- [ ] **Mode lecture d'une question** : le panneau se déroule comme une planche, texte « tapé » une fois à l'ouverture (déjà utilisé au survol).
- [ ] **Carte de partage animée** (court GIF/vidéo libre) pour chaque question.
- [ ] **Salle 3D** des questions : une travée d'étagères où chaque boîte est une question ; tri par discipline, par année, par nombre d'articles. Maquette faite pour les mystères.
- [ ] **Son** : aucun par défaut. Si un jour : un seul bruit discret de machine à écrire, désactivable.
- [ ] **Mobile** : geste de pincement testé en émulation ; à essayer sur un vrai appareil.
