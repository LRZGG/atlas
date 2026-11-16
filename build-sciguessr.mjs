// Fabrique sciguessr.html : une page de test avec deux jeux sur les vraies données de la carte (positions des 4 516 sujets).
//   « Deviner » : un vrai sujet de recherche s'affiche, on clique où il se trouve sur la carte de la science, le score dépend de la distance.
//   « Contribuer » : de petites tâches de vérification (liens entre questions, traductions), pour sentir la mécanique de la science participative.
// Usage : node build-sciguessr.mjs   (lit carte-de-l-inconnu.html pour les données, produit sciguessr.html)
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert';

const h = readFileSync('carte-de-l-inconnu.html', 'utf8'), a = h.indexOf('const DATA = ') + 13, b = h.indexOf(';\nconst { F, S, L');
const DATA = JSON.parse(h.slice(a, b)), { T, F, S, Q } = DATA, N = T.length / 5;

// [numéro du sujet, nom anglais attendu (contrôle), nom français, indice]
const POOL = [
  [2570, 'Soybean genetics and cultivation', 'Génétique et culture du soja', "Comment améliorer les variétés de soja et leur culture."],
  [951, 'PI3K/AKT/mTOR signaling in cancer', 'Voie PI3K/AKT/mTOR dans le cancer', "Une chaîne de signaux dans les cellules, souvent dérégulée dans les cancers."],
  [724, 'RNA Interference and Gene Delivery', 'Interférence ARN et transfert de gènes', "Éteindre un gène ciblé avec de petits ARN et les acheminer jusqu'aux cellules."],
  [1502, 'Cytokine Signaling Pathways and Interactions', 'Cytokines et signaux immunitaires', "Les messages chimiques par lesquels les cellules immunitaires se parlent."],
  [942, 'Escherichia coli research studies', 'Études sur Escherichia coli', "La bactérie la plus utilisée comme modèle de laboratoire."],
  [607, 'Neurogenesis and neuroplasticity mechanisms', 'Neurogenèse et plasticité du cerveau', "Comment le cerveau fabrique de nouveaux neurones et se remodèle."],
  [333, 'Hearing, Cochlea, Tinnitus, Genetics', 'Audition, cochlée et acouphènes', "L'oreille interne et les bruits perçus sans source extérieure."],
  [1352, 'Venomous Animal Envenomation and Studies', 'Envenimations par animaux venimeux', "Morsures de serpents, piqûres de scorpions et leur traitement."],
  [1476, 'Epistemology, Ethics, and Metaphysics', 'Épistémologie, éthique et métaphysique', "Comment on sait, ce qui est bien, ce qui existe."],
  [1591, 'Phenomenology and Existential Philosophy', 'Phénoménologie et philosophie existentielle', "L'expérience vécue, la liberté, le sens de l'existence."],
  [1863, 'Supply Chain Resilience and Risk Management', "Résilience des chaînes d'approvisionnement", "Comment les circuits de production et de livraison résistent aux crises."],
  [1412, 'Risk and Portfolio Optimization', 'Risque et optimisation de portefeuille', "Choisir des placements en équilibrant gain et risque."],
  [2136, 'Economic theories and models', 'Théories et modèles économiques', "Les modèles qui expliquent le fonctionnement des marchés et des économies."],
  [1039, 'Personality Traits and Psychology', 'Traits de personnalité', "Mesurer et comprendre ce qui distingue les personnalités."],
  [3721, 'International Science and Diplomacy', 'Science et diplomatie internationale', "Comment la science sert les relations entre pays."],
  [966, 'Carbon Dioxide Capture Technologies', 'Captage du dioxyde de carbone', "Capter le CO2 de l'air ou des cheminées pour limiter le réchauffement."],
  [1400, 'Minerals Flotation and Separation Techniques', 'Flottation et séparation des minerais', "Trier les minerais grâce à des bulles dans l'eau."],
  [834, 'Carbohydrate Chemistry and Synthesis', 'Chimie des glucides et synthèse', "Fabriquer et modifier les sucres complexes."],
  [681, 'Quantum Computing Algorithms and Architecture', 'Algorithmes et architectures quantiques', "Calculer avec des qubits : algorithmes et machines."],
  [214, 'Semantic Web and Ontologies', 'Web sémantique et ontologies', "Donner un sens lisible par les machines aux données du web."],
  [1756, 'Seismic Waves and Analysis', 'Ondes sismiques', "Lire l'intérieur de la Terre grâce aux ondes des séismes."],
  [1319, 'Atmospheric Ozone and Climate', 'Ozone atmosphérique et climat', "La couche d'ozone, sa destruction et son lien avec le climat."],
  [2082, 'Karst Systems and Hydrogeology', 'Systèmes karstiques et hydrogéologie', "L'eau qui creuse grottes et rivières souterraines dans le calcaire."],
  [1275, 'Solar Radiation and Photovoltaics', 'Rayonnement solaire et photovoltaïque', "Mesurer le soleil et le transformer en électricité."],
  [2559, 'Nuclear Engineering Thermal-Hydraulics', 'Thermohydraulique nucléaire', "Comment l'eau refroidit un réacteur."],
  [87, 'Thermochemical Biomass Conversion Processes', 'Conversion thermochimique de la biomasse', "Transformer bois et déchets végétaux en combustible par la chaleur."],
  [2151, 'Concrete Properties and Behavior', 'Propriétés et comportement du béton', "Comment le béton tient, se fissure et vieillit."],
  [360, 'Silicon Carbide Semiconductor Technologies', 'Semi-conducteurs au carbure de silicium', "Composants électroniques qui résistent aux hautes tensions et températures."],
  [765, 'Urban Heat Island Mitigation', 'Îlots de chaleur urbains', "Rafraîchir les villes, plus chaudes que leurs campagnes."],
  [534, 'Landslides and related hazards', 'Glissements de terrain', "Pourquoi les pentes cèdent et comment prévenir les dégâts."],
  [274, '2D Materials and Applications', 'Matériaux 2D', "Des feuillets d'un seul atome d'épaisseur, comme le graphène."],
  [1089, 'Dark Matter and Cosmic Phenomena', 'Matière noire et phénomènes cosmiques', "La masse invisible qui structure les galaxies."],
  [303, 'Geometric and Algebraic Topology', 'Topologie géométrique et algébrique', "Étudier ce qui reste inchangé quand on étire une forme."],
  [844, 'Advanced Causal Inference Techniques', 'Inférence causale', "Distinguer ce qui cause un effet de ce qui l'accompagne."],
  [1214, 'Chronic Myeloid Leukemia Treatments', 'Traitements de la leucémie myéloïde chronique', "Les traitements d'un cancer du sang qui évolue lentement."],
  [1054, 'Cardiac and Coronary Surgery Techniques', 'Chirurgie cardiaque et coronarienne', "Pontages et réparations du cœur."],
  [836, 'Dermatology and Skin Diseases', 'Dermatologie et maladies de la peau', "Soigner la peau : eczéma, psoriasis, infections."],
  [1148, 'Veterinary Oncology Research', 'Oncologie vétérinaire', "Les cancers des animaux, en particulier des animaux de compagnie."],
  [535, 'Endodontics and Root Canal Treatments', 'Endodontie et traitements de canal', "Soigner l'intérieur d'une dent."],
  [430, 'Ethnobotanical and Medicinal Plants Studies', 'Ethnobotanique et plantes médicinales', "Comment les peuples utilisent les plantes pour se soigner."]
];
// [numéro du sujet, traduction proposée, piège ?] : les pièges servent à vérifier l'attention, comme dans beaucoup de tâches participatives
const TRAD = [[1756, 'Ondes sismiques', 0], [2082, 'Systèmes karstiques et hydrologie marine', 1], [607, 'Neurogenèse et plasticité du cerveau', 0], [214, 'Web sémantique et ontologies', 0], [1319, "Ozone atmosphérique et pollution de l'eau", 1], [1400, 'Flottation et séparation des minerais', 0], [1412, 'Risque et optimisation de portefeuille', 0], [534, 'Glissements de terrain', 0]];
const PAIRS = [['Conscience', 'Mémoire'], ['Origine de la vie', 'Vie ailleurs'], ['Vie ailleurs', 'Au-delà du quantique'], ['Peu de gènes', 'Limites de la longévité'], ['Unification de la physique', 'Navier-Stokes'], ['P contre NP', 'Limites du calcul'], ['Malthus', 'Coopération'], ['Après le pétrole', 'Auto-assemblage']];

const P = []; for (let i = 0; i < N; i++) P.push(T[i * 5], T[i * 5 + 1], S[T[i * 5 + 3]].f);
const FD = F.map((f, i) => { let x = 0, y = 0, w = 0; S.forEach(s => { if (s.f === i) { x += s.x * s.w; y += s.y * s.w; w += s.w; } }); return { fr: f.nn.fr, en: f.nn.en, d: f.d, x: +(x / w).toFixed(3), y: +(y / w).toFixed(3) }; });
const R = POOL.map(([i, en, fr, hint]) => {
  assert.equal(T[i * 5 + 4], en, `sujet ${i} : nom anglais inattendu (${T[i * 5 + 4]})`);
  const near = []; const dist = []; for (let j = 0; j < N; j++) if (j !== i) dist.push([Math.hypot(T[j * 5] - T[i * 5], T[j * 5 + 1] - T[i * 5 + 1]), j]);
  dist.sort((p, q) => p[0] - q[0]); for (const [, j] of dist) { if (near.length >= 4) break; if (!near.includes(T[j * 5 + 4])) near.push(T[j * 5 + 4]); }
  return { fr, en, h: hint, x: T[i * 5], y: T[i * 5 + 1], f: S[T[i * 5 + 3]].f, near };
});
const qi = n => { const k = Q.findIndex(q => q.nmm.fr === n); assert(k >= 0, 'question inconnue : ' + n); return k; };
const QP = PAIRS.map(([a, b]) => [a, Q[qi(a)].cc.fr, b, Q[qi(b)].cc.fr]);
const TR = TRAD.map(([i, fr, bad]) => ({ en: T[i * 5 + 4], fr, bad }));
const out = { P, FD, DM: DATA.D, R, QP, TR };
writeFileSync('sciguessr.html', readFileSync('sciguessr.tpl.html', 'utf8').replace('/*DATA*/null', () => JSON.stringify(out)));
console.log(`${R.length} manches, ${P.length / 3} sujets sur la carte, ${QP.length} paires de questions, ${TR.length} traductions`);
