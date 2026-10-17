import { SpeciesItem, SpeciesGalleryImage, YearData, MuseumSection } from './types';

export const NC_FILE_METADATA = {
  title: 'Area Averaged Sea Surface Temperature Anomaly',
  source: 'C3S : SST_GLO_SST_L4_REP_OBSERVATIONS_010_024',
  institution: 'Met Office / E.U. Copernicus Marine Service Information',
  conventions: 'CF-1.7 (NetCDF-4 / HDF5 1.14.3)',
  climatology: '1991-2020',
  variables: ['time (days since 1950-01-01)', 'sst_anomaly (K / °C)', 'sst_anomaly_filtered (X11 Trend)']
};

export const DECODED_NC_SERIES = [
  { year: 1982, ncRawAnomaly: -0.18, ncFilteredTrend: -0.21, franceMedSst: 22.1, franceAtlSst: 17.4, franceMancheSst: 15.8 },
  { year: 1985, ncRawAnomaly: -0.24, ncFilteredTrend: -0.22, franceMedSst: 22.0, franceAtlSst: 17.3, franceMancheSst: 15.7 },
  { year: 1990, ncRawAnomaly: -0.06, ncFilteredTrend: -0.08, franceMedSst: 22.6, franceAtlSst: 17.8, franceMancheSst: 16.1 },
  { year: 1995, ncRawAnomaly: -0.02, ncFilteredTrend: -0.04, franceMedSst: 22.9, franceAtlSst: 18.0, franceMancheSst: 16.3 },
  { year: 1998, ncRawAnomaly: 0.14, ncFilteredTrend: 0.09, franceMedSst: 23.5, franceAtlSst: 18.4, franceMancheSst: 16.6 },
  { year: 2003, ncRawAnomaly: 0.19, ncFilteredTrend: 0.14, franceMedSst: 26.8, franceAtlSst: 19.8, franceMancheSst: 17.9 },
  { year: 2008, ncRawAnomaly: 0.08, ncFilteredTrend: 0.11, franceMedSst: 23.9, franceAtlSst: 18.6, franceMancheSst: 16.8 },
  { year: 2012, ncRawAnomaly: 0.18, ncFilteredTrend: 0.16, franceMedSst: 24.5, franceAtlSst: 18.9, franceMancheSst: 17.1 },
  { year: 2015, ncRawAnomaly: 0.36, ncFilteredTrend: 0.31, franceMedSst: 24.9, franceAtlSst: 19.1, franceMancheSst: 17.2 },
  { year: 2016, ncRawAnomaly: 0.42, ncFilteredTrend: 0.37, franceMedSst: 25.1, franceAtlSst: 19.3, franceMancheSst: 17.4 },
  { year: 2017, ncRawAnomaly: 0.34, ncFilteredTrend: 0.33, franceMedSst: 25.6, franceAtlSst: 19.5, franceMancheSst: 17.6 },
  { year: 2018, ncRawAnomaly: 0.31, ncFilteredTrend: 0.32, franceMedSst: 26.2, franceAtlSst: 19.9, franceMancheSst: 18.0 },
  { year: 2019, ncRawAnomaly: 0.41, ncFilteredTrend: 0.38, franceMedSst: 26.0, franceAtlSst: 19.7, franceMancheSst: 17.9 },
  { year: 2020, ncRawAnomaly: 0.43, ncFilteredTrend: 0.41, franceMedSst: 26.5, franceAtlSst: 20.2, franceMancheSst: 18.3 },
  { year: 2021, ncRawAnomaly: 0.35, ncFilteredTrend: 0.39, franceMedSst: 26.7, franceAtlSst: 20.3, franceMancheSst: 18.5 },
  { year: 2022, ncRawAnomaly: 0.46, ncFilteredTrend: 0.45, franceMedSst: 28.4, franceAtlSst: 21.3, franceMancheSst: 19.5 },
  { year: 2023, ncRawAnomaly: 0.86, ncFilteredTrend: 0.78, franceMedSst: 28.7, franceAtlSst: 21.8, franceMancheSst: 19.8 },
  { year: 2024, ncRawAnomaly: 0.90, ncFilteredTrend: 0.88, franceMedSst: 28.9, franceAtlSst: 22.0, franceMancheSst: 20.1 }
];

export const FRANCE_SST_GRID_CELLS = [
  { lat: 42.55, lon: 3.35, basin: 'Méditerranée', baseTemp: 22.8, anomalyMultiplier: 4.4, radiusMeters: 55000 },
  { lat: 43.05, lon: 3.95, basin: 'Méditerranée', baseTemp: 22.6, anomalyMultiplier: 4.5, radiusMeters: 60000 },
  { lat: 43.10, lon: 5.05, basin: 'Méditerranée', baseTemp: 23.0, anomalyMultiplier: 4.7, radiusMeters: 60000 },
  { lat: 42.90, lon: 6.15, basin: 'Méditerranée', baseTemp: 23.6, anomalyMultiplier: 5.1, radiusMeters: 65000 },
  { lat: 43.45, lon: 7.15, basin: 'Méditerranée', baseTemp: 23.9, anomalyMultiplier: 5.2, radiusMeters: 60000 },
  { lat: 42.95, lon: 8.45, basin: 'Méditerranée', baseTemp: 23.7, anomalyMultiplier: 5.0, radiusMeters: 70000 },
  { lat: 42.15, lon: 8.55, basin: 'Méditerranée', baseTemp: 23.8, anomalyMultiplier: 4.9, radiusMeters: 65000 },
  { lat: 42.25, lon: 9.65, basin: 'Méditerranée', baseTemp: 24.1, anomalyMultiplier: 5.1, radiusMeters: 60000 },
  { lat: 48.25, lon: -4.95, basin: 'Atlantique', baseTemp: 16.5, anomalyMultiplier: 3.2, radiusMeters: 65000 },
  { lat: 47.45, lon: -3.85, basin: 'Atlantique', baseTemp: 17.4, anomalyMultiplier: 3.5, radiusMeters: 70000 },
  { lat: 46.65, lon: -2.65, basin: 'Atlantique', baseTemp: 18.5, anomalyMultiplier: 3.8, radiusMeters: 70000 },
  { lat: 45.75, lon: -1.65, basin: 'Atlantique', baseTemp: 19.6, anomalyMultiplier: 4.0, radiusMeters: 65000 },
  { lat: 44.55, lon: -1.65, basin: 'Atlantique', baseTemp: 20.4, anomalyMultiplier: 4.2, radiusMeters: 65000 },
  { lat: 43.65, lon: -1.75, basin: 'Atlantique', baseTemp: 20.8, anomalyMultiplier: 4.3, radiusMeters: 55000 },
  { lat: 48.85, lon: -3.65, basin: 'Manche', baseTemp: 16.0, anomalyMultiplier: 3.0, radiusMeters: 55000 },
  { lat: 48.85, lon: -2.25, basin: 'Manche', baseTemp: 16.6, anomalyMultiplier: 3.3, radiusMeters: 55000 },
  { lat: 49.55, lon: -1.05, basin: 'Manche', baseTemp: 16.8, anomalyMultiplier: 3.2, radiusMeters: 60000 },
  { lat: 49.95, lon: 0.45, basin: 'Manche', baseTemp: 17.0, anomalyMultiplier: 3.3, radiusMeters: 55000 },
  { lat: 50.65, lon: 1.35, basin: 'Manche', baseTemp: 16.9, anomalyMultiplier: 3.1, radiusMeters: 50000 }
];

export const SPECIES_DATA: SpeciesItem[] = [
  { id: 'corail-rouge', name: 'Corail Rouge', scientificName: 'Corallium rubrum', basin: 'Méditerranée', locationName: 'Côte Vermeille & Réserve de Banyuls', coords: [42.48, 3.16], trend: 'decline', trendLabel: '- Blanchissement & Nécrose', criticalThreshold: '> 24.0°C prolongé sous la thermocline', baseSst2015: 22.4, sst2022: 27.5, sst2026: 28.1, mortalityRate: '60% des colonies peu profondes touchées', shortDesc: 'Or rouge emblématique de la Méditerranée à croissance ultra-lente.', impactDetails: 'Extrêmement sensible au réchauffement, perd ses polypes nourriciers.', narrationText: 'Sur les tombants rocheux méditerranéens, le précieux corail rouge met des décennies à grandir de quelques centimètres. Les canicules marines répétées détruisent en un été ce que la mer a mis un siècle à bâtir.', museumSection: 'med' },
  { id: 'plancton-global', name: 'Plancton & Micro-algues', scientificName: 'Phytoplancton & Copépodes', basin: 'Méditerranée', locationName: 'Golfe du Lion (Large)', coords: [42.85, 4.25], trend: 'decline', trendLabel: '- Chute du bon plancton / + Algues toxiques', criticalThreshold: 'Stratification thermique dès +2.0°C d’anomalie SST', baseSst2015: 22.1, sst2022: 27.4, sst2026: 28.0, mortalityRate: '-30% de biomasse zooplanctonique nutritive en été', shortDesc: 'La base invisible de toute la chaîne alimentaire océanique et premier producteur d’oxygène.', impactDetails: 'Les canicules marines bloquent le brassage vertical des eaux.', narrationText: 'Tout commence dans l’infiniment petit : le plancton produit plus de la moitié de l’oxygène que nous respirons.', museumSection: 'plankton' },
  { id: 'eponges-med', name: 'Éponges & Grande Nacre', scientificName: 'Spongia officinalis & Pinna nobilis', basin: 'Méditerranée', locationName: 'Parc National des Calanques & Côte Bleue', coords: [43.18, 5.32], trend: 'decline', trendLabel: '- Extinction locale', criticalThreshold: '> 25.5°C + prolifération de protozoaires', baseSst2015: 22.9, sst2022: 28.1, sst2026: 28.6, mortalityRate: '95% des Grandes Nacres décimées, éponges nécrosées', shortDesc: 'Filtreurs naturels essentiels à la clarté des eaux.', impactDetails: 'Les températures élevées activent des bactéries Vibrio et des parasites.', narrationText: 'Les éponges et la grande nacre filtrent des milliers de litres d’eau chaque jour en Méditerranée.', museumSection: 'med' },
  { id: 'posidonie', name: 'Herbier de Posidonie', scientificName: 'Posidonia oceanica', basin: 'Méditerranée', locationName: 'Littoral Varois & Îles d’Or', coords: [42.98, 6.22], trend: 'decline', trendLabel: '- Déclin thermique', criticalThreshold: '> 28.0°C en zone côtière peu profonde', baseSst2015: 23.5, sst2022: 28.9, sst2026: 29.3, mortalityRate: 'Perte de densité foliaire et relargage de carbone', shortDesc: 'Le poumon vert de la Méditerranée, puits de carbone majeur.', impactDetails: 'À plus de 28°C, la posidonie subit un déséquilibre métabolique.', narrationText: 'La posidonie n’est pas une algue, mais une plante à fleurs sous-marine qui protège nos plages.', museumSection: 'med' },
  { id: 'tortue-caouanne', name: 'Tortue Caouanne', scientificName: 'Caretta caretta', basin: 'Méditerranée', locationName: 'Plages de la Côte d’Azur', coords: [43.52, 7.12], trend: 'proliferate', trendLabel: '+ Nouvelles pontes au Nord (+ Féminisation)', criticalThreshold: '> 29.0°C dans le sable = 100% de naissances femelles', baseSst2015: 23.0, sst2022: 28.5, sst2026: 29.1, mortalityRate: 'Déplacement historique des aires de ponte vers le Nord-Ouest', shortDesc: 'Elle vient désormais pondre sur les plages françaises.', impactDetails: 'Un sable trop chaud ne produit presque plus aucun mâle.', narrationText: 'Voir la tortue caouanne pondre sur nos plages semble être une bonne nouvelle, mais cela menace l’avenir de l’espèce.', museumSection: 'med' },
  { id: 'gorgone-med', name: 'Gorgone Rouge', scientificName: 'Paramuricea clavata', basin: 'Méditerranée', locationName: 'Réserve de Scandola & Ouest Corse', coords: [42.36, 8.54], trend: 'decline', trendLabel: '- Mortalité massive', criticalThreshold: '> 24.5°C entre 15m et 35m de profondeur pendant 5 jours', baseSst2015: 22.8, sst2022: 27.9, sst2026: 28.4, mortalityRate: 'Jusqu’à 80% de nécrose observée entre 0 et 30m', shortDesc: 'Véritable forêt animale sous-marine méditerranéenne.', impactDetails: 'La Gorgone subit un stress thermique aigu suivi du développement de pathogènes.', narrationText: 'En Méditerranée, la gorgone rouge forme de véritables forêts sous-marines. Mais la chaleur les nécrose.', museumSection: 'med' },
  { id: 'meduse-pelagia', name: 'Méduse Pélagique', scientificName: 'Pelagia noctiluca', basin: 'Méditerranée', locationName: 'Mer Ligure & Large Corse', coords: [43.15, 8.35], trend: 'proliferate', trendLabel: '+ Blooms explosifs', criticalThreshold: 'Favorisée dès > 24.0°C', baseSst2015: 23.1, sst2022: 28.4, sst2026: 29.0, mortalityRate: 'Multiplication par x4 de la fréquence des essaims', shortDesc: 'Espèce gélatineuse urticante.', impactDetails: 'Les eaux chaudes accélèrent la maturation sexuelle des méduses.', narrationText: 'L’eau chaude accélère sa reproduction et déclenche des invasions massives sur les plages méditerranéennes.', museumSection: 'med' },
  { id: 'laminaires-bretagne', name: 'Forêts de Laminaires', scientificName: 'Laminaria hyperborea', basin: 'Atlantique', locationName: 'Mer d’Iroise & Côtes de Bretagne', coords: [48.28, -4.78], trend: 'decline', trendLabel: '- Régression vers le Nord', criticalThreshold: '> 19.5°C', baseSst2015: 16.4, sst2022: 20.6, sst2026: 21.2, mortalityRate: 'Recul de 35% de la biomasse sur la limite sud bretonne', shortDesc: 'Cathédrales d’algues brunes géantes d’Atlantique.', impactDetails: 'Les laminaires sont des algues d’eaux froides à tempérées.', narrationText: 'Ces algues d’eaux fraîches supportent mal de dépasser vingt degrés et reculent rapidement vers le nord.', museumSection: 'atl' },
  { id: 'morue-atlantique', name: 'Morue (Cabillaud)', scientificName: 'Gadus morhua', basin: 'Atlantique', locationName: 'Plateau Celtique & Façade Atlantique', coords: [47.25, -3.55], trend: 'decline', trendLabel: '- Migration forcée au Nord', criticalThreshold: '> 16.0°C pour la survie des œufs', baseSst2015: 17.2, sst2022: 21.4, sst2026: 22.0, mortalityRate: 'Déplacement de son aire de répartition de +200 km', shortDesc: 'Poisson emblématique des eaux froides.', impactDetails: 'Une eau trop chaude réduit la capacité de transport d’oxygène.', narrationText: 'Le cabillaud migre inexorablement vers les eaux polaires.', museumSection: 'atl' },
  { id: 'huitres-moules', name: 'Huîtres Creuses & Moules', scientificName: 'Magallana gigas & Mytilus edulis', basin: 'Atlantique', locationName: 'Pertuis Charentais & Bassin d’Arcachon', coords: [45.88, -1.22], trend: 'decline', trendLabel: '- Hypoxie & Mortalité', criticalThreshold: '> 24.0°C', baseSst2015: 20.5, sst2022: 25.8, sst2026: 26.4, mortalityRate: 'Crises d’anoxie et herpèsvirus OsHV-1', shortDesc: 'Pilier de la conchyliculture française.', impactDetails: 'Plus l’eau est chaude, moins elle contient d’oxygène dissous.', narrationText: 'Une eau trop chaude perd son oxygène et active des virus foudroyants.', museumSection: 'atl' },
  { id: 'pieuvre-manche', name: 'Pieuvre (Poulpe)', scientificName: 'Octopus vulgaris', basin: 'Manche', locationName: 'Golfe Normand-Breton', coords: [48.85, -2.35], trend: 'proliferate', trendLabel: '+ Explosion démographique', criticalThreshold: 'Survie larvaire décuplée dès > 17.5°C', baseSst2015: 16.1, sst2022: 19.9, sst2026: 20.5, mortalityRate: 'Prises multipliées par x15 depuis 2021', shortDesc: 'Grand gagnant du réchauffement en Manche.', impactDetails: 'Le poulpe commun connaît une explosion démographique spectaculaire.', narrationText: 'En Manche, c’est la surprise : le poulpe commun prolifère de façon spectaculaire !', museumSection: 'manche' }
];

export const SPECIES_GALLERY_IMAGES: Record<string, SpeciesGalleryImage[]> = {
  // (Copiez ici le dictionnaire SPECIES_GALLERY_IMAGES original pour garder le fichier clean)
};

export const COPERNICUS_YEARS: YearData[] = [
  { year: 2015, label: 'Été 2015', ncGlobalAnom: 0.36, ncTrend: 0.31, medSst: 23.4, medAnomaly: 0.8, atlSst: 18.2, atlAnomaly: 0.5, mancheSst: 16.4, mancheAnomaly: 0.4, mhwDaysMed: 18, mhwCategory: 'Modérée', highlight: 'Référence satellite CMEMS' },
  { year: 2016, label: 'Été 2016', ncGlobalAnom: 0.42, ncTrend: 0.37, medSst: 23.8, medAnomaly: 1.1, atlSst: 18.5, atlAnomaly: 0.7, mancheSst: 16.7, mancheAnomaly: 0.6, mhwDaysMed: 24, mhwCategory: 'Modérée', highlight: 'Réchauffement progressif' },
  { year: 2017, label: 'Été 2017', ncGlobalAnom: 0.34, ncTrend: 0.33, medSst: 24.6, medAnomaly: 1.8, atlSst: 18.9, atlAnomaly: 1.0, mancheSst: 17.0, mancheAnomaly: 0.9, mhwDaysMed: 39, mhwCategory: 'Forte', highlight: 'Première alerte sur les gorgones' },
  { year: 2018, label: 'Été 2018', ncGlobalAnom: 0.31, ncTrend: 0.32, medSst: 25.4, medAnomaly: 2.3, atlSst: 19.4, atlAnomaly: 1.4, mancheSst: 17.5, mancheAnomaly: 1.2, mhwDaysMed: 52, mhwCategory: 'Forte', highlight: 'Anomalie Golfe du Lion & Provence' },
  { year: 2019, label: 'Été 2019', ncGlobalAnom: 0.41, ncTrend: 0.38, medSst: 25.1, medAnomaly: 2.0, atlSst: 19.2, atlAnomaly: 1.3, mancheSst: 17.4, mancheAnomaly: 1.1, mhwDaysMed: 46, mhwCategory: 'Forte', highlight: 'Mortalité Grande Nacre' },
  { year: 2020, label: 'Été 2020', ncGlobalAnom: 0.43, ncTrend: 0.41, medSst: 25.6, medAnomaly: 2.5, atlSst: 19.8, atlAnomaly: 1.7, mancheSst: 17.9, mancheAnomaly: 1.5, mhwDaysMed: 58, mhwCategory: 'Sévère', highlight: 'Début du boom du poulpe en Manche' },
  { year: 2021, label: 'Été 2021', ncGlobalAnom: 0.35, ncTrend: 0.39, medSst: 25.9, medAnomaly: 2.7, atlSst: 19.9, atlAnomaly: 1.8, mancheSst: 18.2, mancheAnomaly: 1.7, mhwDaysMed: 64, mhwCategory: 'Sévère', highlight: 'Pontes de tortues sur la côte méditerranéenne' },
  { year: 2022, label: 'Été 2022 🔥', ncGlobalAnom: 0.46, ncTrend: 0.45, medSst: 28.4, medAnomaly: 4.3, atlSst: 21.3, atlAnomaly: 2.9, mancheSst: 19.5, mancheAnomaly: 2.6, mhwDaysMed: 96, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Canicule marine historique en Méditerranée (+4.3°C)' },
  { year: 2023, label: 'Été 2023 🔥', ncGlobalAnom: 0.86, ncTrend: 0.78, medSst: 28.7, medAnomaly: 4.5, atlSst: 21.8, atlAnomaly: 3.3, mancheSst: 19.8, mancheAnomaly: 2.8, mhwDaysMed: 104, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Record C3S .nc (+0.86 K global / +4.5°C Med)' },
  { year: 2024, label: 'Été 2024 🔥', ncGlobalAnom: 0.90, ncTrend: 0.88, medSst: 28.9, medAnomaly: 4.6, atlSst: 21.9, atlAnomaly: 3.3, mancheSst: 19.9, mancheAnomaly: 2.9, mhwDaysMed: 108, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Pic du fichier .nc Copernicus (+0.90 K global)' },
  { year: 2025, label: 'Été 2025 🔥', ncGlobalAnom: 0.92, ncTrend: 0.90, medSst: 29.0, medAnomaly: 4.7, atlSst: 22.1, atlAnomaly: 3.5, mancheSst: 20.1, mancheAnomaly: 3.0, mhwDaysMed: 112, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Tropicalisation accélérée du bassin Méditerranéen' },
  { year: 2026, label: 'Été 2026 (Actuel)', ncGlobalAnom: 0.95, ncTrend: 0.93, medSst: 29.2, medAnomaly: 4.8, atlSst: 22.3, atlAnomaly: 3.6, mancheSst: 20.4, mancheAnomaly: 3.2, mhwDaysMed: 119, mhwCategory: 'Extrême (Cat. IV)', highlight: 'Données Copernicus NRT — Alerte Rouge Biodiversité' }
];

export const MUSEUM_SECTIONS: MuseumSection[] = [
  { id: 'med', buttonNumber: 1, title: 'Méditerranée : Coraux & Herbiers', subtitle: 'Forêts de gorgones, herbiers de posidonie & canicules', center: [43.05, 5.95], zoom: 7, color: 'from-rose-500 to-amber-500', speciesIds: ['corail-rouge', 'eponges-med', 'posidonie', 'tortue-caouanne', 'gorgone-med', 'meduse-pelagia'] },
  { id: 'atl', buttonNumber: 2, title: 'Atlantique & Bretagne : Laminaires', subtitle: 'Recul des forêts de kelp, exode du cabillaud et stress ostréicole', center: [47.15, -3.10], zoom: 7, color: 'from-sky-500 to-blue-600', speciesIds: ['laminaires-bretagne', 'morue-atlantique', 'huitres-moules'] },
  { id: 'manche', buttonNumber: 3, title: 'Manche : La Prolifération du Poulpe', subtitle: 'Quand le réchauffement fait exploser de nouveaux prédateurs', center: [49.15, -2.15], zoom: 8, color: 'from-emerald-500 to-teal-600', speciesIds: ['pieuvre-manche'] },
  { id: 'plankton', buttonNumber: 4, title: 'Plancton : Le Socle Invisible Menacé', subtitle: 'Stratification des eaux, chute d’oxygène et micro-algues toxiques', center: [42.85, 4.25], zoom: 8, color: 'from-indigo-500 to-cyan-600', speciesIds: ['plancton-global'] }
];