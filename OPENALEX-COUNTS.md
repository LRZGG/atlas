# OpenAlex topic counts: check and fix

**Resolved on 18 November 2026.** Check made on the most extreme case, "Magnetic confinement fusion research" (T10346):

| Measure | Value |
|---|---:|
| `works_count` on the topic's page in OpenAlex (what we used to use) | 41,251,603 |
| Works carrying this topic (`works?filter=topics.id:T10346`) | 385,048 |
| of which journal articles | 210,780 |
| of which datasets | 51,057 |
| Articles with this topic as primary topic | 100,557 |
| Text search "magnetic confinement fusion" in Crossref (another database, order of magnitude only) | 1,405,007 |

A random sample of the works shows dataset records in 2026 ("LHD rf9.5-L_tw #191773.1 (analyzed)"), measurements from a large device, and neighbouring articles (plasma, solar wind). The 41 million figure is therefore **wrong by more than 100 times**: it is an OpenAlex error on the topic record, not a feature of research.

**What changed**: the relief and the dots of the map no longer use `works_count` but the sum of papers published 1990–2025 (`annees.json`, filter `topics.id`). No topic is capped or flagged "doubtful" any more. Topic positions (layout) keep the old computation: they were not recomputed.

Original list of suspect topics (kept for reference; a topic is listed if its count exceeded the cap or 25 times the median of its subfield):

| Topic | Papers | × subfield median | Subfield | Decision |
|---|---:|---:|---|---|
| Magnetic confinement fusion research | 40,482,915 | 317 | Nuclear and High Energy Physics | |
| Botany and Plant Ecology Studies | 4,630,849 | 106 | Plant Science | |
| Particle accelerators and beam dynamics | 3,875,512 | 30 | Nuclear and High Energy Physics | |
| Mycorrhizal Fungi and Plant Interactions | 3,718,322 | 85 | Plant Science | |
| Lepidoptera: Biology and Taxonomy | 1,711,049 | 47 | Insect Science | |
| Musicology and Musical Analysis | 1,709,624 | 9 | Music | |
| Species Distribution and Climate Change | 1,571,479 | 1 | Ecological Modeling | |
| Crystal structures of chemical compounds | 1,296,482 | 18 | Inorganic Chemistry | |
| Biographical and Historical Analysis | 1,275,424 | 16 | History | |
| Japanese History and Culture | 1,104,453 | 41 | Cultural Studies | |
| Classical Antiquity Studies | 1,078,129 | 2 | Classics | |
| Forest Management and Policy | 1,037,926 | 33 | Forestry | |
| Biblical Studies and Interpretation | 941,652 | 11 | Religious studies | |
| Marine Biology and Ecology Research | 929,643 | 8 | Oceanography | |
| German Literature and Culture Studies | 891,635 | 12 | Literature and Literary Theory | |
| Avian ecology and behavior | 851,329 | 20 | Ecology | |
| Geological and Geochemical Analysis | 804,277 | 11 | Geochemistry and Petrology | |
| Libraries, Manuscripts, and Books | 789,267 | 10 | History | |
| Architecture, Modernity, and Design | 742,813 | 13 | Architecture | |
| History of Science and Medicine | 738,920 | 13 | History and Philosophy of Science | |
| Reformation and Early Modern Christianity | 733,699 | 9 | History | |
| Medieval Literature and History | 732,079 | 9 | History | |
| Wheat and Barley Genetics and Pathology | 706,462 | 16 | Plant Science | |
| Genomics and Chromatin Dynamics | 695,412 | 21 | Molecular Biology | |
| Cinema History and Criticism | 695,308 | 6 | Visual Arts and Performing Arts | |
| Autobiographical and Biographical Writing | 671,612 | 9 | Literature and Literary Theory | |
| EFL/ESL Teaching and Learning | 650,267 | 6 | Language and Linguistics | |
| Poetry Analysis and Criticism | 633,970 | 9 | Literature and Literary Theory | |
| Agricultural Productivity and Crop Improvement | 628,856 | 21 | Agronomy and Crop Science | |
| Photographic and Visual Arts | 614,198 | 3 | Museology | |
| Theatre and Performance Studies | 606,162 | 5 | Visual Arts and Performing Arts | |
| Syntax, Semantics, Linguistic Variation | 599,526 | 5 | Language and Linguistics | |
| Genetic and Environmental Crop Studies | 598,623 | 14 | Plant Science | |
| Mollusks and Parasites Studies | 585,644 | 9 | Animal Science and Zoology | |
| Ancient and Medieval Archaeology Studies | 581,962 | 5 | Archeology (arts and humanities) | |
| Historical Art and Architecture Studies | 575,941 | 5 | Visual Arts and Performing Arts | |
| Particle physics theoretical and experimental studies | 568,953 | 4 | Nuclear and High Energy Physics | |
| Chinese history and philosophy | 534,810 | 7 | History | |
| Coleoptera Taxonomy and Distribution | 527,754 | 5 | Ecology, Evolution, Behavior and Systematics | |
| World Wars: History, Literature, and Impact | 525,653 | 11 | Political Science and International Relations | |
| Paleontology and Stratigraphy of Fossils | 523,518 | 2 | Paleontology | |
| Stellar, planetary, and galactic studies | 522,870 | 4 | Astronomy and Astrophysics | |
| Lexicography and Language Studies | 522,416 | 5 | Language and Linguistics | |
| Amphibian and Reptile Biology | 499,462 | 5 | Ecology, Evolution, Behavior and Systematics | |
| Catholicism and Religious Studies | 485,862 | 6 | Religious studies | |

45 sujets au total ; les 80 plus gros sont listés.
