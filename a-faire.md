# À faire

État au 16 novembre 2026. Liste de travail, dans l'ordre de priorité. Voir aussi [a-polir.md](a-polir.md) (défauts constatés) et [methode.md](methode.md).

## 1. Design (priorité)

- [ ] **Direction artistique à part**, pas un style qu'un seul prompt suffit à produire : cherchée dans l'inconnu, l'espace, les cartes anciennes, la nature, les jeux vidéo. Plusieurs directions comparées, puis une choisie.
- [ ] **Police originale et libre** (licence OFL ou équivalente), vérifiée avant usage.
- [ ] **Clair, sombre ou les deux** : à trancher. Wikipédia et LaTeX sont blancs ; la carte a besoin de noir pour l'« inconnu ».
- [ ] **Texte en haut à gauche** : à **garder**, il donne le contexte (« qu'est-ce que je regarde ? ») et disparaît quand on zoome. À changer : la police et peut-être le texte.
- [ ] **Légende en haut à droite** : repliée au départ (ok), mais à refaire. Les couleurs ressemblent aux couleurs de clusters de Google Chrome ; les boutons font « cheap ».
- [ ] **Bouton FR / EN** : bug d'affichage au changement de langue, il manque une partie de l'encadré.
- [ ] **Visite guidée** (en bas à gauche) : classique, à repenser.
- [ ] **Carnet d'exploration et « questions lues »** : retirer pour l'instant (effet jeu vidéo, pas beau). On y reviendra.
- [ ] **Le « ? » des questions** : à garder.
- [ ] **Sources et licences** : une petite bulle d'information en bas à droite qui renvoie vers une page claire (OpenAlex, Wikipédia, polices, licence du dépôt).

## 2. Contenu

- [ ] **Passer de 31 à 100–150 questions**, chacune avec sa source. Pistes : liste *Science* 2005 (faite), problèmes du millénaire (faits), problèmes de Hilbert, listes Wikipédia des problèmes non résolus par discipline.
- [ ] **Une fiche pour chaque question**, par lots, avec contrôle automatique des références et étiquette « brouillon IA » tant qu'aucun spécialiste n'a relu.
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
