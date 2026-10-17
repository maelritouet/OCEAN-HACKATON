import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Compass,
  BookOpen,
  Share2,
  Database,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  Download,
  Thermometer,
  AlertTriangle,
  Layers,
  Filter,
  X,
  ChevronRight,
  Maximize2,
  MapPin,
  Waves,
  Mic
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';

// ============================================================================
// 1. METADATA (Pour les exports CSV/JSON)
// ============================================================================
const NC_FILE_METADATA = {
  title: 'Area Averaged Sea Surface Temperature Anomaly',
  source: 'C3S : SST_GLO_SST_L4_REP_OBSERVATIONS_010_024',
  institution: 'Met Office / E.U. Copernicus Marine Service Information',
  conventions: 'CF-1.7 (NetCDF-4 / HDF5 1.14.3)',
  climatology: '1991-2020',
  variables: ['time (days since 1950-01-01)', 'sst_anomaly (K / °C)', 'sst_anomaly_filtered (X11 Trend)']
};

// ============================================================================
// 2. MARINE SPECIES DATA
// ============================================================================
type SpeciesItem = {
  id: string;
  name: string;
  scientificName: string;
  basin: string;
  locationName: string;
  coords: [number, number];
  trend: 'decline' | 'proliferate';
  trendLabel: string;
  criticalThreshold: string;
  baseSst2015: number;
  sst2026: number;
  mortalityRate: string;
  shortDesc: string;
  impactDetails: string;
  narrationText: string;
  museumSection: string;
};

const SPECIES_DATA: SpeciesItem[] = [
  {
    id: 'corail-rouge',
    name: 'Corail Rouge',
    scientificName: 'Corallium rubrum',
    basin: 'Méditerranée',
    locationName: 'Côte Vermeille & Réserve de Scandola',
    coords: [42.48, 3.16],
    trend: 'decline',
    trendLabel: '- Blanchissement & Nécrose',
    criticalThreshold: '> 24.0°C prolongé sous la thermocline',
    baseSst2015: 22.4,
    sst2026: 28.1,
    mortalityRate: '80 à 93% de biomasse disparue à Scandola',
    impactDetails: 'Extrêmement sensible au réchauffement des couches d’eau intermédiaires, le corail rouge perd ses polypes nourriciers lors des vagues de chaleur.',
    narrationText: 'Sur les tombants rocheux méditerranéens, le précieux corail rouge met des décennies à grandir de quelques centimètres.',
    shortDesc: 'Corail précieux de Méditerranée.',
    museumSection: 'med'
  },
  {
    id: 'plancton-global',
    name: 'Plancton & Micro-algues',
    scientificName: 'Phytoplancton & Copépodes',
    basin: 'Méditerranée',
    locationName: 'Golfe du Lion (Large)',
    coords: [42.85, 4.25],
    trend: 'decline',
    trendLabel: '- Chute du bon plancton / + Algues toxiques',
    criticalThreshold: 'Stratification thermique dès +2.0°C d’anomalie SST',
    baseSst2015: 22.1,
    sst2026: 28.0,
    mortalityRate: '-30% de biomasse zooplanctonique nutritive en été',
    shortDesc: 'La base invisible de toute la chaîne alimentaire océanique et premier producteur d’oxygène.',
    impactDetails: 'Les canicules marines bloquent le brassage vertical des eaux (stratification). Privé de sels nutritifs profonds, le phytoplancton nourricier s’effondre au profit de micro-algues toxiques.',
    narrationText: 'Tout commence dans l’infiniment petit : le plancton produit plus de la moitié de l’oxygène que nous respirons.',
    museumSection: 'plankton'
  },
  {
    id: 'eponges-med',
    name: 'Éponges, Bryozoaires & Coralligène',
    scientificName: 'Spongia officinalis & Bryozoa',
    basin: 'Méditerranée',
    locationName: 'Parc National des Calanques & Corse',
    coords: [43.18, 5.32],
    trend: 'decline',
    trendLabel: '- Extinction locale',
    criticalThreshold: '> 25.5°C + stress nutritionnel',
    baseSst2015: 22.9,
    sst2026: 28.6,
    mortalityRate: 'Premiers organismes fixés touchés par les mortalités massives',
    shortDesc: 'Filtreurs et habitats benthiques essentiels.',
    impactDetails: 'Organismes fixes touchés en premier par le combo stress thermique et stress nutritionnel.',
    narrationText: 'Les éponges et les peuplements coralligènes filtrent et structurent les fonds rocheux. La surchauffe des eaux provoque leur nécrose en cascade.',
    museumSection: 'med'
  },
  {
    id: 'posidonie',
    name: 'Herbier de Posidonie',
    scientificName: 'Posidonia oceanica',
    basin: 'Méditerranée',
    locationName: 'Littoral Varois & Corse',
    coords: [42.98, 6.22],
    trend: 'decline',
    trendLabel: '- Déclin thermique & Séquestration CO2',
    criticalThreshold: '> 28.0°C en zone côtière peu profonde',
    baseSst2015: 23.5,
    sst2026: 29.3,
    mortalityRate: 'Mortalités massives documentées (1999, 2003, 2006)',
    shortDesc: 'Le poumon vert de la Méditerranée, puits de carbone majeur.',
    impactDetails: 'À plus de 28°C, la posidonie subit un déséquilibre métabolique : elle consomme plus d’oxygène par respiration qu’elle n’en produit par photosynthèse.',
    narrationText: 'La posidonie n’est pas une algue, mais une plante à fleurs sous-marine qui protège nos plages et capte cinq fois plus de carbone qu’une forêt tropicale.',
    museumSection: 'med'
  },
  {
    id: 'tortue-caouanne',
    name: 'Tortue Caouanne',
    scientificName: 'Caretta caretta',
    basin: 'Méditerranée',
    locationName: 'Plages de la Côte d’Azur',
    coords: [43.52, 7.12],
    trend: 'proliferate',
    trendLabel: '+ Nouvelles pontes au Nord (+ Féminisation)',
    criticalThreshold: '> 29.0°C dans le sable = 100% de naissances femelles',
    baseSst2015: 23.0,
    sst2026: 29.1,
    mortalityRate: 'Déplacement historique des aires de ponte vers le Nord-Ouest',
    shortDesc: 'Elle vient désormais pondre sur les plages françaises.',
    impactDetails: 'On observe de plus en plus de pontes sur les côtes françaises, mais la température d’incubation détermine le sexe, menaçant l’équilibre des populations mâles.',
    narrationText: 'Voir la tortue caouanne pondre sur nos plages semble être une bonne nouvelle. En réalité, elle fuit la Méditerranée orientale devenue trop brûlante.',
    museumSection: 'med'
  },
  {
    id: 'gorgone-med',
    name: 'Gorgone Rouge',
    scientificName: 'Paramuricea clavata',
    basin: 'Méditerranée',
    locationName: 'Réserve de Scandola & Calanques',
    coords: [42.36, 8.54],
    trend: 'decline',
    trendLabel: '- Mortalité massive',
    criticalThreshold: '> 24.5°C entre 15m et 35m de profondeur',
    baseSst2015: 22.8,
    sst2026: 28.4,
    mortalityRate: 'Nécrose observée de 12 à 30m de profondeur',
    shortDesc: 'Véritable forêt animale sous-marine méditerranéenne, décimée par les anomalies.',
    impactDetails: 'Lors des canicules, la thermocline s’enfonce profondément. La gorgone subit un stress aigu menant à la nécrose totale de ses tissus.',
    narrationText: 'En Méditerranée, la gorgone rouge forme de véritables forêts sous-marines. Mais lorsque la température dépasse vingt-cinq degrés en profondeur, ses tissus se nécrosent.',
    museumSection: 'med'
  },
  {
    id: 'meduse-pelagia',
    name: 'Méduse Pélagique (Pelagia)',
    scientificName: 'Pelagia noctiluca',
    basin: 'Méditerranée',
    locationName: 'Mer Ligure & Large Corse',
    coords: [43.15, 8.35],
    trend: 'proliferate',
    trendLabel: '+ Blooms explosifs',
    criticalThreshold: 'Favorisée dès > 24.0°C (accélération métabolique)',
    baseSst2015: 23.1,
    sst2026: 29.0,
    mortalityRate: 'Multiplication par x4 de la fréquence des essaims',
    shortDesc: 'Espèce gélatineuse urticante dont le cycle de reproduction s’accélère.',
    impactDetails: 'Les eaux chaudes accélèrent la maturation sexuelle des méduses. La raréfaction de leurs concurrents leur laisse le champ libre pour former d’immenses radeaux côtiers.',
    narrationText: 'À l’inverse des coraux qui meurent, la méduse Pelagia profite pleinement des canicules marines. L’eau chaude accélère sa reproduction.',
    museumSection: 'med'
  },
  {
    id: 'sardines-med',
    name: 'Sardines (Nanisme & Stress)',
    scientificName: 'Sardina pilchardus',
    basin: 'Méditerranée',
    locationName: 'Golfe du Lion',
    coords: [43.10, 4.00],
    trend: 'decline',
    trendLabel: '- Réduction de taille (15 à 11 cm)',
    criticalThreshold: 'Stress métabolique dès > 22.0°C',
    baseSst2015: 20.0,
    sst2026: 25.5,
    mortalityRate: 'Longueur moyenne passée de 15 à 11 cm en une décennie',
    shortDesc: 'Petit pélagique clé du Golfe du Lion, impacté par le manque de plancton nutritif.',
    impactDetails: 'Affamées par la stratification thermique, les sardines se reproduisent plus jeunes et grandissent moins, menaçant tout le réseau trophique régional.',
    narrationText: 'En Méditerranée, les sardines rapetissent ! Sous l’effet de la chaleur et du manque de plancton de qualité, leur taille moyenne a chuté de quinze à onze centimètres.',
    museumSection: 'med'
  },
  {
    id: 'ostreopsis',
    name: 'Micro-algue Ostreopsis ovata',
    scientificName: 'Ostreopsis ovata',
    basin: 'Méditerranée',
    locationName: 'Côte Basque & Méditerranée',
    coords: [43.38, -1.75],
    trend: 'proliferate',
    trendLabel: '+ Proliférations toxiques',
    criticalThreshold: 'Favorisée par des printemps chauds et calmes',
    baseSst2015: 20.0,
    sst2026: 26.0,
    mortalityRate: 'Fermetures de plages au-delà de 100 000 cellules/L',
    shortDesc: 'Micro-algue toxique provoquant des irritations respiratoires chez les baigneurs.',
    impactDetails: 'Le réchauffement hâtif des eaux côtières stimule la prolifération de cette micro-algue tropicale, entraînant des interdictions de baignade et une perturbation des activités.',
    narrationText: 'Les étés brûlants favorisent l’explosion de micro-algues toxiques comme Ostreopsis sur nos côtes, provoquant toux, irritations et fermetures de plages.',
    museumSection: 'med'
  },
  // ATLANTIQUE / BRETAGNE
  {
    id: 'laminaires-bretagne',
    name: 'Forêts de Laminaires (Kelp)',
    scientificName: 'Laminaria hyperborea & digitata',
    basin: 'Atlantique',
    locationName: 'Mer d’Iroise & Côtes de Bretagne',
    coords: [48.28, -4.78],
    trend: 'decline',
    trendLabel: '- Régression de la canopée',
    criticalThreshold: '> 19.5°C (arrêt de croissance et dépérissement)',
    baseSst2015: 16.4,
    sst2026: 21.2,
    mortalityRate: 'Plusieurs milliers de tonnes perdues à Molène',
    shortDesc: 'Cathédrales d’algues brunes géantes d’Atlantique, refuges indispensables.',
    impactDetails: 'Les laminaires supportent mal de dépasser 19-20°C. Leur disparition fragilise toute la chaîne alimentaire locale (lieu jaune, crustacés) et pénalise l’activité des goémoniers.',
    narrationText: 'Direction l’Atlantique et la Bretagne. Les forêts de laminaires sont de véritables cathédrales sous-marines.',
    museumSection: 'atl'
  },
  {
    id: 'morue-atlantique',
    name: 'Morue (Cabillaud)',
    scientificName: 'Gadus morhua',
    basin: 'Atlantique',
    locationName: 'Plateau Celtique & Façade Atlantique',
    coords: [47.25, -3.55],
    trend: 'decline',
    trendLabel: '- Migration forcée au Nord',
    criticalThreshold: '> 16.0°C pour la survie des œufs et larves',
    baseSst2015: 17.2,
    sst2026: 22.0,
    mortalityRate: 'Déplacement de son aire de répartition vers le Nord',
    shortDesc: 'Poisson emblématique des eaux froides qui déserte progressivement les côtes françaises.',
    impactDetails: 'Une eau trop chaude réduit la capacité de transport d’oxygène dans le sang du cabillaud et compromet le développement embryonnaire, le poussant vers la mer du Nord.',
    narrationText: 'Le cabillaud est un poisson d’eau froide. Avec les vagues de chaleur sur la façade Atlantique, ses larves ne survivent plus et l’espèce migre inexorablement vers les eaux polaires.',
    museumSection: 'atl'
  },
  {
    id: 'huitres-moules',
    name: 'Huîtres Creuses & Moules',
    scientificName: 'Magallana gigas & Mytilus edulis',
    basin: 'Atlantique',
    locationName: 'Pertuis Charentais & Baie de St-Brieuc',
    coords: [45.88, -1.22],
    trend: 'decline',
    trendLabel: '- Hypoxie & Mortalité',
    criticalThreshold: '> 24.0°C couplé aux virus et au manque d’oxygène',
    baseSst2015: 20.5,
    sst2026: 26.4,
    mortalityRate: 'Perte estimée à un quart de la production nationale',
    shortDesc: 'Pilier de la conchyliculture française frappé par l’asphyxie estivale.',
    impactDetails: 'L’eau chaude retient moins d’oxygène. Conjuguée aux attaques de virus (OsHV-1) et de prédateurs (araignées de mer), la mortalité atteint des records.',
    narrationText: 'Sur la façade Atlantique, les huîtres et les moules ne peuvent pas fuir la chaleur. Une eau trop chaude perd son oxygène et active des virus foudroyants.',
    museumSection: 'atl'
  },
  // MANCHE
  {
    id: 'bulot',
    name: 'Bulot Commun',
    scientificName: 'Buccinum undatum',
    basin: 'Manche',
    locationName: 'Baie de Granville & Manche Ouest',
    coords: [49.10, -1.60],
    trend: 'decline',
    trendLabel: '- Chute des captures (-80%)',
    criticalThreshold: '> 17.5°C persistant en eau côtière',
    baseSst2015: 15.0,
    sst2026: 18.5,
    mortalityRate: 'Pêche en baisse de 80% depuis 2017',
    shortDesc: 'Gastéropode emblématique de la pêche côtière normanno-bretonne.',
    impactDetails: 'Le bulot subit un stress thermique majeur qui perturbe son alimentation. Les capteurs in-situ montrent des canicules printanières de +4°C sur les casiers.',
    narrationText: 'Dans la baie de Granville, le bulot subit de plein fouet la surchauffe de l’eau. Les pêcheurs constatent une chute vertigineuse des captures.',
    museumSection: 'manche'
  },
  {
    id: 'pieuvre-manche',
    name: 'Pieuvre (Poulpe Commun)',
    scientificName: 'Octopus vulgaris',
    basin: 'Manche',
    locationName: 'Côtes de la Manche & Golfe Normand-Breton',
    coords: [48.85, -2.35],
    trend: 'proliferate',
    trendLabel: '+ Explosion démographique (x10)',
    criticalThreshold: 'Survie larvaire décuplée dès > 17.5°C en été',
    baseSst2015: 16.1,
    sst2026: 20.5,
    mortalityRate: 'Captures multipliées par x10 depuis 2021',
    shortDesc: 'Grand gagnant du réchauffement en Manche, redoutable prédateur de coquilles.',
    impactDetails: 'Après avoir quasi disparu de Manche depuis l’hiver 1963, le poulpe prolifère grâce aux hivers doux et aux canicules estivales qui boostent la survie des larves.',
    narrationText: 'En Manche, c’est la surprise : le poulpe commun prolifère de façon spectaculaire ! Les eaux plus chaudes boostent la survie de ses larves.',
    museumSection: 'manche'
  },
  {
    id: 'hermelles',
    name: 'Récifs d’Hermelles',
    scientificName: 'Sabellaria alveolata',
    basin: 'Manche',
    locationName: 'Baie du Mont-Saint-Michel & Vendée',
    coords: [48.62, -1.55],
    trend: 'decline',
    trendLabel: '- Risque de dépérissement',
    criticalThreshold: 'Stress thermique sur les bio-constructeurs',
    baseSst2015: 15.5,
    sst2026: 19.2,
    mortalityRate: 'Migration attendue vers le nord',
    shortDesc: 'Le plus grand récif bioconstruit d’Europe.',
    impactDetails: 'Ces vers sabellidés construisent des bio-récifs massifs en intertidal. La hausse des températures fragilise la cohésion des colonies sablonneuses.',
    narrationText: 'Près du Mont-Saint-Michel se trouve le plus grand récif d’hermelles d’Europe. Le réchauffement menace de faire péricliter ces structures vivantes uniques.',
    museumSection: 'manche'
  },
  {
    id: 'thon-rouge',
    name: 'Thon Rouge (Retour en Manche)',
    scientificName: 'Thunnus thynnus',
    basin: 'Manche',
    locationName: 'Manche & Mer du Nord',
    coords: [50.10, -1.20],
    trend: 'proliferate',
    trendLabel: '+ Expansion vers le Nord',
    criticalThreshold: 'Suivi de migration par thermoréférence',
    baseSst2015: 16.0,
    sst2026: 19.5,
    mortalityRate: 'Retour massif dans des eaux qu’il avait désertées',
    shortDesc: 'Grand prédateur pélagique suivant l’isotherme de réchauffement.',
    impactDetails: 'Le retour du thon rouge en Manche et mer du Nord illustre la redistribution géographique des grands pélagiques, modifiant la pression sur les stocks.',
    narrationText: 'Le thon rouge fait un retour spectaculaire en Manche et en mer du Nord. En suivant l’eau chaude, ce grand prédateur redessine la carte des écosystèmes.',
    museumSection: 'manche'
  }
];

const SPECIES_GALLERY_IMAGES: Record<string, any> = {
  'gorgone-med': [
    { title: 'Gorgone', src: 'https://picsum.photos/id/1015/800/500', alt: 'Gorgone et écosystème corallien', artist: 'Archive', license: 'Public' }
  ],
  'corail-rouge': [
    { title: 'Corail', src: 'https://picsum.photos/id/1042/800/500', alt: 'Corail et faune sous-marine', artist: 'Archive', license: 'Public' }
  ],
  'posidonie': [
    { title: 'Posidonie', src: 'https://picsum.photos/id/1053/800/500', alt: 'Herbiers sous-marins', artist: 'Archive', license: 'Public' }
  ],
  'eponges-med': [
    { title: 'Eponge', src: 'https://picsum.photos/id/1068/800/500', alt: 'Filtreurs et éponges benthiques', artist: 'Archive', license: 'Public' }
  ],
  'meduse-pelagia': [
    { title: 'Meduse', src: 'https://picsum.photos/id/1074/800/500', alt: 'Méduse pélagique', artist: 'Archive', license: 'Public' }
  ],
  'tortue-caouanne': [
    { title: 'Tortue', src: 'https://picsum.photos/id/1084/800/500', alt: 'Tortue marine', artist: 'Archive', license: 'Public' }
  ],
  'laminaires-bretagne': [
    { title: 'Kelp', src: 'https://picsum.photos/id/111/800/500', alt: 'Forêts de laminaires et algues brunes', artist: 'Archive', license: 'Public' }
  ],
  'morue-atlantique': [
    { title: 'Poisson', src: 'https://picsum.photos/id/112/800/500', alt: 'Faune des eaux froides', artist: 'Archive', license: 'Public' }
  ],
  'huitres-moules': [
    { title: 'Coquillages', src: 'https://picsum.photos/id/114/800/500', alt: 'Parcs conchylicoles et moules', artist: 'Archive', license: 'Public' }
  ],
  'bulot': [
    { title: 'Bulot', src: 'https://picsum.photos/id/115/800/500', alt: 'Gastéropode marin', artist: 'Archive', license: 'Public' }
  ],
  'sardines-med': [
    { title: 'Sardines', src: 'https://picsum.photos/id/124/800/500', alt: 'Banc de sardines', artist: 'Archive', license: 'Public' }
  ],
  'pieuvre-manche': [
    { title: 'Poulpe', src: 'https://picsum.photos/id/128/800/500', alt: 'Poulpe commun', artist: 'Archive', license: 'Public' }
  ],
  'hermelles': [
    { title: 'Recifs', src: 'https://picsum.photos/id/133/800/500', alt: 'Récif en zone intertidale', artist: 'Archive', license: 'Public' }
  ],
  'thon-rouge': [
    { title: 'Thon', src: 'https://picsum.photos/id/134/800/500', alt: 'Grand prédateur pélagique', artist: 'Archive', license: 'Public' }
  ],
  'ostreopsis': [
    { title: 'Algues', src: 'https://picsum.photos/id/141/800/500', alt: 'Prolifération algale', artist: 'Archive', license: 'Public' }
  ],
  'plancton-global': [
    { title: 'Plancton', src: 'https://picsum.photos/id/145/800/500', alt: 'Phytoplancton marin', artist: 'Archive', license: 'Public' }
  ]
};

const MUSEUM_SECTIONS = [
  {
    id: 'med', buttonNumber: 1, title: 'Méditerranée : Coraux & Herbiers',
    subtitle: 'Forêts de gorgones, herbiers de posidonie & canicules', center: [43.05, 5.95] as [number, number], zoom: 7,
    color: 'from-rose-500 to-amber-500', speciesIds: ['corail-rouge', 'eponges-med', 'posidonie', 'tortue-caouanne', 'gorgone-med', 'meduse-pelagia', 'sardines-med', 'ostreopsis']
  },
  {
    id: 'atl', buttonNumber: 2, title: 'Atlantique & Bretagne : Laminaires',
    subtitle: 'Recul des forêts de kelp, exode du cabillaud et stress ostréicole', center: [47.15, -3.10] as [number, number], zoom: 7,
    color: 'from-sky-500 to-blue-600', speciesIds: ['laminaires-bretagne', 'morue-atlantique', 'huitres-moules']
  },
  {
    id: 'manche', buttonNumber: 3, title: 'Manche : Poulpes, Bulots & Hermelles',
    subtitle: 'Quand le réchauffement bouleverse la pêche côtière', center: [49.15, -2.15] as [number, number], zoom: 8,
    color: 'from-emerald-500 to-teal-600', speciesIds: ['pieuvre-manche', 'bulot', 'hermelles', 'thon-rouge']
  },
  {
    id: 'plankton', buttonNumber: 4, title: 'Plancton : Le Socle Invisible Menacé',
    subtitle: 'Stratification des eaux, chute d’oxygène et micro-algues toxiques', center: [42.85, 4.25] as [number, number], zoom: 8,
    color: 'from-indigo-500 to-cyan-600', speciesIds: ['plancton-global']
  }
];

function getSstColor(tempC: number): string {
  if (tempC >= 28.0) return '#be123c'; 
  if (tempC >= 26.5) return '#e11d48'; 
  if (tempC >= 24.5) return '#f97316'; 
  if (tempC >= 22.0) return '#f59e0b'; 
  if (tempC >= 19.5) return '#eab308'; 
  if (tempC >= 17.5) return '#10b981'; 
  return '#0ea5e9'; 
}

class UnderwaterAudioEngine {
  ctx: AudioContext | null;
  isPlaying: boolean;
  masterGain: GainNode | null;
  pingInterval: ReturnType<typeof setInterval> | null;
  whiteNoise: AudioBufferSourceNode | undefined;
  lfo: OscillatorNode | undefined;
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.pingInterval = null;
  }

  start() {
    if (this.isPlaying) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);
      this.masterGain.connect(this.ctx.destination);

      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }

      this.whiteNoise = this.ctx.createBufferSource();
      this.whiteNoise.buffer = noiseBuffer;
      this.whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(160, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.14;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 70;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      this.whiteNoise.connect(filter);
      filter.connect(this.masterGain);

      this.whiteNoise.start(0);
      lfo.start(0);
      this.lfo = lfo;

      this.pingInterval = setInterval(() => {
        const masterGain = this.masterGain;
        if (!this.ctx || !this.isPlaying || !masterGain) return;

        const osc = this.ctx.createOscillator();
        const pingGain = this.ctx.createGain();
        const freqs = [396, 528, 639, 432];
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freqs[Math.floor(Math.random() * freqs.length)], this.ctx.currentTime);

        pingGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        pingGain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 0.4);
        pingGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.2);

        osc.connect(pingGain);
        pingGain.connect(masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 3.3);
      }, 5500);

      this.isPlaying = true;
    } catch (e) {
      console.warn('Web Audio API non supportée ou bloquée:', e);
    }
  }

  stop() {
    if (!this.isPlaying) return;
    try {
      if (this.pingInterval) clearInterval(this.pingInterval);
      if (this.ctx) {
        this.ctx.close();
      }
    } catch (e) {
      console.warn(e);
    }
    this.isPlaying = false;
  }
}

declare global {
  interface Window {
    L: any;
  }
}

function RealWorldMap({
  species,
  selectedSpecies,
  onSelectSpecies,
  onClearSelection,
  focusedBasin,
  selectedBasin,
  showThermalOverlay,
  showSatelliteRaster,
  heatFactor,
  liveCells,
  mapDate,
  isMapLoading,
  tileStyle,
  colorMode,
  livePipeline,
  mapDataType,
  dynamicTelemetry,
  apiStartDate
}: {
  species: SpeciesItem[];
  selectedSpecies: SpeciesItem | null;
  onSelectSpecies: (sp: SpeciesItem) => void;
  onClearSelection: () => void;
  focusedBasin: string | null;
  selectedBasin: string;
  showThermalOverlay: boolean;
  showSatelliteRaster: boolean;
  heatFactor: number;
  liveCells: Array<{ lat: number; lon: number; sst: number }>;
  mapDate: string;
  isMapLoading: boolean;
  tileStyle: 'voyager' | 'osm';
  colorMode: 'daily' | 'average';
  livePipeline: any;
  mapDataType: 'sst' | 'mhw' | 'impact';
  dynamicTelemetry: any;
  apiStartDate: string;
}) {

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const copernicusRasterRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const thermalLayerRef = useRef<any>(null);
  const [leafletReady, setLeafletReady] = useState(false);

  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const cssId = 'leaflet-cdn-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const scriptId = 'leaflet-cdn-js';
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener('load', () => setLeafletReady(true));
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => setLeafletReady(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const L = window.L;

    const map = L.map(mapContainerRef.current, {
      center: [46.1, 2.5],
      zoom: 6,
      minZoom: 4,
      maxZoom: 13,
      zoomControl: false,
      preferCanvas: true
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileUrl =
      tileStyle === 'osm'
        ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';

    tileLayerRef.current = L.tileLayer(tileUrl, {
      maxZoom: 13,
      attribution: '&copy; OpenStreetMap France &copy; Esri World Ocean &copy; Copernicus C3S'
    }).addTo(map);
    map.fitBounds([[41.0, -6.5], [51.5, 10.5]], { padding: [18, 18] });

    thermalLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', () => {
      onClearSelection();
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletReady]);

  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const tileUrl =
      tileStyle === 'osm'
        ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}';
    tileLayerRef.current.setUrl(tileUrl);
  }, [tileStyle]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const L = window.L;

    if (copernicusRasterRef.current) {
      map.removeLayer(copernicusRasterRef.current);
      copernicusRasterRef.current = null;
    }

    if (showSatelliteRaster) {
      const franceBounds = L.latLngBounds([41.0, -6.5], [51.5, 10.5]);
      copernicusRasterRef.current = L.tileLayer(
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GHRSST_L4_MUR_Sea_Surface_Temperature/default/2023-08-15/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
        {
          opacity: 0.55,
          maxNativeZoom: 7,
          maxZoom: 13,
          bounds: franceBounds,
          attribution: 'SST Raster: Copernicus / GHRSST L4'
        }
      ).addTo(map);
    }
  }, [leafletReady, showSatelliteRaster]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (focusedBasin === 'Méditerranée') {
      map.flyTo([42.95, 5.85], 7.4, { duration: 1.25 });
    } else if (focusedBasin === 'Atlantique') {
      map.flyTo([47.2, -3.2], 7.2, { duration: 1.25 });
    } else if (focusedBasin === 'Manche') {
      map.flyTo([49.05, -2.15], 8.0, { duration: 1.25 });
    } else {
      map.flyTo([46.1, 2.5], 6.0, { duration: 1.2 });
    }
  }, [focusedBasin]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedSpecies) return;
    const currentZoom = map.getZoom();
    map.flyTo(selectedSpecies.coords, Math.max(currentZoom, 7.5), { duration: 0.9 });
  }, [selectedSpecies?.id]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const thermalLayer = thermalLayerRef.current;
    if (!map || !thermalLayer || !window.L) return;
    const L = window.L;

    thermalLayer.clearLayers();
    if (!showThermalOverlay) return;

    const isAvgMode = colorMode === 'average';
    let cellsToRender = liveCells.map(c => ({ ...c, avgSst: c.sst, peakSst: c.sst }));

    if (isAvgMode && livePipeline?.records) {
      const globalAvgSst = livePipeline.records.reduce((acc: number, r: any) => acc + r.sst, 0) / (livePipeline.records.length || 1);
      const globalMaxSst = Math.max(...livePipeline.records.map((r: any) => r.sst));
      
      cellsToRender = liveCells.map(c => ({
        ...c,
        avgSst: +(c.sst * 0.4 + globalAvgSst * 0.6).toFixed(2),
        peakSst: +(c.sst + (globalMaxSst - globalAvgSst) * 0.3).toFixed(2)
      }));
    }

    const halfRes = 0.05 / 2;
    const parsedYear = apiStartDate ? new Date(apiStartDate).getFullYear() : 2024;
    const baselineStart = isNaN(parsedYear) ? 1991 : parsedYear - 30;
    const baselineEnd = isNaN(parsedYear) ? 2020 : parsedYear - 1;

    const clim = dynamicTelemetry?.climatology || 20.0;
    const thresh = dynamicTelemetry?.threshold || 22.0;

    cellsToRender.forEach((cell) => {
      const displaySst = isAvgMode ? cell.avgSst : cell.sst;
      const hobdaySst = isAvgMode ? cell.peakSst : cell.sst;

      let color = getSstColor(displaySst);
      let fillOpacity = 0.45;
      let popupHTML = '';

      const gap = Math.max(0.4, thresh - clim);
      const intensity = hobdaySst - clim;
      const multiple = intensity / gap;
      
      let catName = 'Normale';
      let catColor = '#38bdf8'; 

      if (hobdaySst > thresh) {
        if (multiple >= 4) { catName = 'Cat. IV (Extrême)'; catColor = '#701a75'; }
        else if (multiple >= 3) { catName = 'Cat. III (Sévère)'; catColor = '#e11d48'; }
        else if (multiple >= 2) { catName = 'Cat. II (Forte)'; catColor = '#f97316'; }
        else { catName = 'Cat. I (Modérée)'; catColor = '#fbbf24'; }
      }

      if (mapDataType === 'impact') {
        const stressLevel = hobdaySst > (thresh + 1.5) ? 'CRITIQUE (Mortalité imminente)' : hobdaySst > thresh ? 'ÉLEVÉ (Stress thermique)' : 'STABLE';
        const stressColor = hobdaySst > (thresh + 1.5) ? '#701a75' : hobdaySst > thresh ? '#e11d48' : '#10b981';
        
        color = stressColor;
        fillOpacity = hobdaySst > thresh ? 0.75 : 0.15;

        popupHTML = `
          <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; padding: 6px; min-width: 200px; color: #1e293b;">
            <strong style="color: #701a75; font-size: 12px; border-bottom: 1px solid #cbd5e1; display: block; padding-bottom: 4px; margin-bottom: 6px;">
              ⚠️ Diagnostic d'Impact Biologique
            </strong>
            <b>Période / Date :</b> ${isAvgMode ? `${baselineStart}-${baselineEnd}` : mapDate}<br/>
            <b>SST / Pic :</b> <span style="color: #e11d48;">${hobdaySst.toFixed(2)}°C</span> (Seuil P90: ${thresh.toFixed(2)}°C)<br/>
            <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #cbd5e1;">
              <b>Niveau de Stress :</b> <span style="color: ${stressColor}; font-weight: bold;">${stressLevel}</span><br/>
              <p style="margin-top: 4px; font-size: 10px; color: #475569; font-style: italic;">
                ${hobdaySst > thresh ? 'Risque de blanchiment, rupture de la chaîne trophique et asphyxie des espèces sessiles (Gorgones, Posidonies).' : 'Conditions favorables au maintien des habitats.'}
              </p>
            </div>
          </div>
        `;
      } else if (mapDataType === 'mhw') {
        color = catColor;
        fillOpacity = hobdaySst > thresh ? 0.65 : 0.08; 
      } else {
        if (isAvgMode) {
          popupHTML = `
            <div style="font-family: sans-serif; font-size: 11px; line-height: 1.4; padding: 6px; min-width: 190px; color: #1e293b;">
              <strong style="color: #0f172a; font-size: 12px; border-bottom: 1px solid #cbd5e1; display: block; padding-bottom: 4px; margin-bottom: 6px;">
                SST Moyenne (${baselineStart}-${baselineEnd})
              </strong>
              <b>Température :</b> <span style="color: ${color}; font-weight: bold;">${displaySst.toFixed(2)}°C</span><br/>
            </div>
          `;
        } else {
          popupHTML = `
            <div style="font-family: sans-serif; font-size: 11px; line-height: 1.35; padding: 4px; min-width: 150px;">
              <strong style="color: #0f172a;">Pixel Copernicus (Jour J)</strong><br/>
              Température : <b style="color: ${color};">${displaySst.toFixed(2)}°C</b><br/>
              Donnée du ${mapDate}
            </div>
          `;
        }
      }

      const bounds = [
        [cell.lat - halfRes, cell.lon - halfRes],
        [cell.lat + halfRes, cell.lon + halfRes]
      ];

      const pixel = L.rectangle(bounds, {
        stroke: false,
        fillColor: color,
        fillOpacity: fillOpacity
      }).addTo(thermalLayer);

      pixel.bindTooltip(popupHTML, { sticky: true, direction: 'top' });
    });
  }, [leafletReady, showThermalOverlay, heatFactor, liveCells, mapDate, colorMode, mapDataType, dynamicTelemetry, livePipeline, apiStartDate]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer || !window.L) return;
    const L = window.L;

    markersLayer.clearLayers();

    species.forEach((sp) => {
      const isSelected = selectedSpecies?.id === sp.id;
      const isDecline = sp.trend === 'decline';
      const badgeColor = isDecline ? '#e11d48' : '#10b981';
      const ringColor = isDecline ? 'rgba(225, 29, 72, 0.28)' : 'rgba(16, 185, 129, 0.28)';
      const borderColor = isDecline ? '#fecdd3' : '#a7f3d0';
      const sign = isDecline ? '−' : '+';

      const html = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: translate(-50%, -50%);
          cursor: pointer;
          user-select: none;
        ">
          <div style="
            position: relative;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            border-radius: 9999px;
            background: ${badgeColor};
            border: 3px solid #ffffff;
            box-shadow: 0 0 0 ${isSelected ? '8px' : '5px'} ${ringColor}, 0 6px 14px rgba(15, 23, 42, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-weight: 900;
            font-size: ${isSelected ? '18px' : '15px'};
            line-height: 1;
            transition: all 0.2s ease;
          ">
            ${sign}
          </div>
          <div style="
            margin-top: 5px;
            padding: 2px 8px;
            border-radius: 9999px;
            background: ${isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.96)'};
            color: ${isSelected ? '#ffffff' : '#0f172a'};
            border: 1.5px solid ${isSelected ? badgeColor : borderColor};
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.14);
          ">
            ${sp.name}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-species-leaflet-pin',
        html,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      const marker = L.marker(sp.coords, { icon }).addTo(markersLayer);
      marker.on('click', (e: any) => {
        if (e.originalEvent) {
          e.originalEvent.stopPropagation();
        }
        onSelectSpecies(sp);
      });
    });
  }, [leafletReady, species, selectedSpecies]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {!leafletReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-sky-50 text-sky-800 text-sm font-semibold">
          Chargement de la carte mondiale OpenStreetMap…
        </div>
      )}
      {leafletReady && isMapLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px] transition-all">
          <div className="bg-white/95 px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center gap-3 border border-sky-200 animate-in fade-in zoom-in duration-200">
            <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
            <span className="text-sm font-bold text-sky-900">
              Extraction des thermiques du {mapDate}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [apiStartDate, setApiStartDate] = useState('1982-01-01');
  const [apiEndDate, setApiEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [activeMode, setActiveMode] = useState('visualiser');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [selectedBasin, setSelectedBasin] = useState('Tous');
  const [selectedTrend, setSelectedTrend] = useState('Tous');
  const [showThermalOverlay, setShowThermalOverlay] = useState(true);
  const [showSatelliteRaster, setShowSatelliteRaster] = useState(false);
  const [showCopernicusWmsInfo, setShowCopernicusWmsInfo] = useState(false);
  const [colorMode, setColorMode] = useState<'daily' | 'average'>('daily');
  const [mapDataType, setMapDataType] = useState<'sst' | 'mhw' | 'impact'>('sst');
  const [tileStyle, setTileStyle] = useState<'voyager' | 'osm'>('voyager');

  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesItem | null>(null);
  const [speciesImageIndex, setSpeciesImageIndex] = useState(0);
  const [isHoveringCarousel, setIsHoveringCarousel] = useState(false);

  const selectedSpeciesImages = selectedSpecies ? SPECIES_GALLERY_IMAGES[selectedSpecies.id] : null;
  const activeFiltersCount = (selectedBasin !== 'Tous' ? 1 : 0) + (selectedTrend !== 'Tous' ? 1 : 0);

  useEffect(() => {
    setSpeciesImageIndex(0);
  }, [selectedSpecies?.id]);

  useEffect(() => {
    if (!selectedSpeciesImages || isHoveringCarousel) return;
    const timer = window.setInterval(() => {
      setSpeciesImageIndex((index) => (index + 1) % selectedSpeciesImages.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isHoveringCarousel, selectedSpecies?.id, selectedSpeciesImages]);

  const [ambientSoundOn, setAmbientSoundOn] = useState(false);
  const [voiceOverOn, setVoiceOverOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioEngineRef = useRef<UnderwaterAudioEngine | null>(null);

  const [exportPreviewFormat, setExportPreviewFormat] = useState<'csv' | 'json' | null>(null);
  const [mapView, setMapView] = useState<{ focusedBasin: string | null }>({ focusedBasin: null });

  const [sourceSeries, setSourceSeries] = useState<Array<{ year: number; ncRawAnomaly: number | null; ncFilteredTrend: number | null; }>>([]);
  const [livePipeline, setLivePipeline] = useState<any>(null);
  const [liveCells, setLiveCells] = useState<Array<{ lat: number; lon: number; sst: number }>>([]);
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(-1);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [selectedHeatwaveYear, setSelectedHeatwaveYear] = useState<number>(new Date().getFullYear());
  const [hoveredStripEvent, setHoveredStripEvent] = useState<any>(null);

  const timelineRecords = livePipeline?.records ?? [];
  const latestLiveRecord = timelineRecords[timelineRecords.length - 1];
  const selectedLiveRecord = timelineRecords[selectedRecordIndex] ?? latestLiveRecord;
  const selectedMapDate = selectedLiveRecord?.date ?? '';

  const getHobdayCategory = (sst: number, clim: number, thresh: number) => {
    if (!sst || !clim || !thresh || sst <= thresh) return { name: 'Aucune', num: 0, color: 'bg-slate-100 text-slate-500', mult: '0' };
    
    const gap = thresh - clim; 
    const intensity = sst - clim; 
    const multiple = intensity / gap;

    if (multiple >= 4) return { name: 'Cat. IV (Extrême)', num: 4, color: 'bg-fuchsia-900 text-white', mult: multiple.toFixed(1) };
    if (multiple >= 3) return { name: 'Cat. III (Sévère)', num: 3, color: 'bg-rose-700 text-white', mult: multiple.toFixed(1) };
    if (multiple >= 2) return { name: 'Cat. II (Forte)', num: 2, color: 'bg-orange-500 text-white', mult: multiple.toFixed(1) };
    return { name: 'Cat. I (Modérée)', num: 1, color: 'bg-amber-400 text-amber-950', mult: multiple.toFixed(1) };
  };

  const getDayOfYear = (dateString: string) => {
    const date = new Date(dateString);
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const dynamicTelemetry = useMemo(() => {
    if (!selectedLiveRecord) return null;
    return {
      date: selectedLiveRecord.date,
      year: Number(selectedLiveRecord.date.slice(0, 4)),
      sst: selectedLiveRecord.sst,
      climatology: selectedLiveRecord.climatology,
      threshold: selectedLiveRecord.threshold,
      anomaly: selectedLiveRecord.anomaly ?? 0
    };
  }, [selectedLiveRecord]);

  const maxAnomalyDynamic = useMemo(() => {
    if (!sourceSeries.length) return 0;
    return Math.max(...sourceSeries.map(s => s.ncRawAnomaly || 0));
  }, [sourceSeries]);

  const heatFactor = useMemo(() => {
    if (!dynamicTelemetry) return 0.2;
    return Math.min(1, Math.max(0.18, dynamicTelemetry.anomaly / 4.0));
  }, [dynamicTelemetry]);

  const loadCopernicusData = () => {
    setIsAppLoading(true);
    fetch(`/api/mhw?lat=43&lon=6&radius=0.05&start=${apiStartDate}&end=${apiEndDate}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Live pipeline unavailable'))))
      .then((payload: any) => {
        setLivePipeline(payload);
        if (!payload?.records) return;
        setSelectedRecordIndex(payload.records.length - 1);
        
        const annual = new Map<number, { sum: number; count: number }>();
        payload.records.forEach((record: any) => {
          if (record.anomaly === null) return;
          const year = Number(record.date.slice(0, 4));
          const current = annual.get(year) ?? { sum: 0, count: 0 };
          annual.set(year, { sum: current.sum + record.anomaly, count: current.count + 1 });
        });
        setSourceSeries(Array.from(annual.entries()).map(([year, values]) => ({
          year,
          ncRawAnomaly: +(values.sum / values.count).toFixed(3),
          ncFilteredTrend: null
        })));
      })
      .catch(() => {
        setLivePipeline(null);
        setSourceSeries([]);
      })
      .finally(() => {
        setIsAppLoading(false);
        setIsFiltering(false)
      });
  };

  useEffect(() => {
    loadCopernicusData();
  }, []);

  useEffect(() => {
    if (!selectedMapDate) return;
    const controller = new AbortController();
    const requestDate = selectedMapDate;
    setLiveCells([]);
    setIsMapLoading(true);
    const timer = window.setTimeout(() => {
      fetch(`/api/map?min_lon=-6.5&max_lon=10.5&min_lat=41&max_lat=51.5&day=${requestDate}`, { signal: controller.signal })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Live map unavailable'))))
        .then((payload: any) => {
          if (payload.source.date !== requestDate) throw new Error('Stale map response');
          setLiveCells(payload.cells);
        })
        .catch((error: Error) => {
          if (error.name !== 'AbortError' && error.message !== 'Stale map response') setLiveCells([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsMapLoading(false);
        });
    }, 800);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [selectedMapDate]);

  useEffect(() => {
    audioEngineRef.current = new UnderwaterAudioEngine();
    return () => {
      if (audioEngineRef.current) audioEngineRef.current.stop();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const toggleAmbientSound = () => {
    if (!audioEngineRef.current) return;
    if (ambientSoundOn) {
      audioEngineRef.current.stop();
      setAmbientSoundOn(false);
    } else {
      audioEngineRef.current.start();
      setAmbientSoundOn(true);
    }
  };

  const speakText = (text: string | undefined) => {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    if (!voiceOverOn) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

const filteredSpecies = useMemo(() => {
    // Règle 1 : Si la carte est en mode pur Océanographie (SST/MHW) et qu'on n'a cliqué sur AUCUN filtre, la carte est VIERGE.
    if (mapDataType !== 'impact' && selectedBasin === 'Tous' && selectedTrend === 'Tous') {
      return []; 
    }

    // Règle 2 : Application stricte des filtres utilisateurs (Façade & Boutons Vert/Rouge) combinée au Mode Impact
    return SPECIES_DATA.filter((sp) => {
      const matchBasin = selectedBasin === 'Tous' || sp.basin === selectedBasin;
      const matchTrend =
        selectedTrend === 'Tous' ||
        (selectedTrend === 'decline' && sp.trend === 'decline') ||
        (selectedTrend === 'proliferate' && sp.trend === 'proliferate');
      
      // Si on est en "Mode Impact" sans filtre spécifique, on montre tout (Les Rouges ET les Verts qui prolifèrent avec la canicule)
      // Si un filtre (vert ou rouge) est cliqué, on respecte STRICTEMENT le clic de l'utilisateur !
      return matchBasin && matchTrend;
    });
  }, [selectedBasin, selectedTrend, mapDataType]);

  const handleSelectSpecies = (sp: SpeciesItem) => {
    setSelectedSpecies(sp);
  };

  const handleBasinFocus = (basin: string) => {
    setSelectedBasin(basin);
    if (basin === 'Méditerranée') {
      setMapView({ focusedBasin: 'Méditerranée' });
    } else if (basin === 'Atlantique') {
      setMapView({ focusedBasin: 'Atlantique' });
    } else if (basin === 'Manche') {
      setMapView({ focusedBasin: 'Manche' });
    } else {
      setMapView({ focusedBasin: null });
    }
  };

  return (
    <div className="h-screen w-screen bg-sky-50 text-slate-800 font-sans selection:bg-sky-500 selection:text-white flex flex-col overflow-hidden">
      <header className="shrink-0 z-40 backdrop-blur-xl bg-white/95 border-b border-sky-200/80 px-4 lg:px-6 py-2.5 shadow-xs">
        <div className="w-full flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-500 flex items-center justify-center shadow-sm shadow-sky-500/25">
              <Waves className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-extrabold tracking-tight bg-gradient-to-r from-sky-900 via-cyan-800 to-teal-700 bg-clip-text text-transparent">
                  ThermoMaris
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                  Copernicus .NC Intégré
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden xl:block">
                Sentinelle des Canicules Marines • Données C3S SST_GLO_SST_L4_REP_OBSERVATIONS_010_024
              </p>
            </div>
          </div>

          <nav className="flex items-center bg-sky-100/80 p-1 rounded-xl border border-sky-200/80 shadow-inner">
            <button
              onClick={() => { setActiveMode('visualiser'); stopSpeech(); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'visualiser' ? 'bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-sm shadow-sky-600/25' : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <Compass className="w-4 h-4" /> <span>1. Visualiser</span>
            </button>
            <button
              onClick={() => { setActiveMode('comprendre'); stopSpeech(); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'comprendre' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm shadow-orange-500/25' : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <BookOpen className="w-4 h-4" /> <span>2. Comprendre</span>
            </button>
            <button
              onClick={() => { setActiveMode('partager'); stopSpeech(); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                activeMode === 'partager' ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white shadow-sm shadow-indigo-600/25' : 'text-slate-600 hover:text-sky-950 hover:bg-white/60'
              }`}
            >
              <Share2 className="w-4 h-4" /> <span>3. Partager</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAmbientSound}
              title="Activer/Désactiver l'ambiance sonore sous-marine"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                ambientSoundOn ? 'bg-cyan-100 border-cyan-400 text-cyan-900 shadow-xs' : 'bg-white border-sky-200 text-slate-600 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              {ambientSoundOn ? <Volume2 className="w-4 h-4 text-cyan-600 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden md:inline">{ambientSoundOn ? 'Son Mer ON' : 'Ambiance Mer'}</span>
            </button>
            <button
              onClick={() => { if (voiceOverOn) { stopSpeech(); setVoiceOverOn(false); } else { setVoiceOverOn(true); } }}
              title="Activer/Désactiver la voix off française"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                voiceOverOn ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-sky-200 text-slate-600 hover:bg-sky-50 hover:text-sky-900'
              }`}
            >
              <Mic className={`w-4 h-4 ${isSpeaking ? 'text-amber-600 animate-bounce' : ''}`} />
              <span className="hidden md:inline">{voiceOverOn ? 'Voix Off FR' : 'Voix Off Muet'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* MODE 1: VISUALISER */}
      {activeMode === 'visualiser' && (
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="relative flex-1 w-full h-full overflow-hidden">
            <RealWorldMap
              species={filteredSpecies}
              selectedSpecies={selectedSpecies}
              onSelectSpecies={handleSelectSpecies}
              onClearSelection={() => setSelectedSpecies(null)}
              focusedBasin={mapView.focusedBasin}
              selectedBasin={selectedBasin}
              showThermalOverlay={showThermalOverlay}
              showSatelliteRaster={showSatelliteRaster}
              heatFactor={heatFactor}
              liveCells={liveCells}
              mapDate={selectedMapDate}
              isMapLoading={isMapLoading}
              tileStyle={tileStyle}
              colorMode={colorMode}
              livePipeline={livePipeline}
              mapDataType={mapDataType}
              dynamicTelemetry={dynamicTelemetry}
              apiStartDate={apiStartDate}
            />

            <div onClick={(e) => e.stopPropagation()} className="absolute top-4 left-4 z-30 flex flex-col items-start gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterOpen((open) => !open)}
                  aria-expanded={isFilterOpen}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-lg border transition-all ${
                    isFilterOpen ? 'bg-sky-700 text-white border-sky-800 shadow-sky-900/20' : 'bg-white/95 hover:bg-white text-slate-800 border-sky-200 shadow-sky-950/10'
                  }`}
                >
                  <Filter className={`w-4 h-4 ${isFilterOpen ? 'text-sky-200' : 'text-sky-600'}`} />
                  <span>Façades & Calques SST</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">{activeFiltersCount}</span>
                  )}
                </button>
                {mapView.focusedBasin && (
                  <button onClick={() => handleBasinFocus('Tous')} className="px-3.5 py-2.5 rounded-2xl bg-white/95 hover:bg-sky-50 text-xs font-bold text-sky-800 border border-sky-300 shadow-lg flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> <span>Vue France Entière</span>
                  </button>
                )}
              </div>

              {isFilterOpen && (
                <div className="w-80 bg-white/95 backdrop-blur-xl border border-sky-200/90 rounded-2xl p-4 shadow-2xl shadow-sky-950/15 space-y-4">
                  <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-sky-600" /> Façades & Données .NC
                    </span>
                    <button onClick={() => setIsFilterOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sky-50">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">1. Filtrer par Façade</label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {[
                        { id: 'Tous', label: '🇫🇷 Toutes les façades (France)' },
                        { id: 'Méditerranée', label: '🌊 Méditerranée' },
                        { id: 'Atlantique', label: '🌊 Atlantique & Bretagne' },
                        { id: 'Manche', label: '🌊 Manche' }
                      ].map((item) => (
                        <button
                          key={item.id} onClick={() => handleBasinFocus(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${selectedBasin === item.id ? 'bg-sky-600 text-white shadow-xs' : 'bg-sky-50/80 text-slate-700 hover:bg-sky-100 border border-sky-200/60'}`}
                        >
                          <span>{item.label}</span>
                          {selectedBasin === item.id && <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                {mapDataType === 'impact' && (
                    <div className="space-y-1.5 animate-in fade-in zoom-in duration-300">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Réponse à la Canicule</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        <button onClick={() => setSelectedTrend('Tous')} className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all ${selectedTrend === 'Tous' ? 'bg-slate-800 text-white' : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100 border border-sky-200/60'}`}>
                          Toutes les espèces ({SPECIES_DATA.length})
                        </button>
                        <button onClick={() => setSelectedTrend('decline')} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${selectedTrend === 'decline' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'}`}>
                          <span className="w-4 h-4 rounded-full bg-rose-700 text-white font-bold flex items-center justify-center text-xs">−</span>
                          <span>Disparaît / En déclin</span>
                        </button>
                        <button onClick={() => setSelectedTrend('proliferate')} className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${selectedTrend === 'proliferate' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'}`}>
                          <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">+</span>
                          <span>Apparaît / Prolifère</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-sky-100 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">2. Cartes SST Copernicus</label>
                    <div className="flex items-center justify-between">
                      <button onClick={() => setShowThermalOverlay(!showThermalOverlay)} className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${showThermalOverlay ? 'bg-gradient-to-r from-orange-50 to-rose-100 border-rose-300 text-rose-800' : 'bg-sky-50 border-sky-200 text-slate-600'}`}>
                        <Thermometer className="w-4 h-4 text-rose-600" /> <span>Pixels NRT : {showThermalOverlay ? 'ON' : 'OFF'}</span>
                      </button>
                      <button onClick={() => setShowCopernicusWmsInfo(!showCopernicusWmsInfo)} className="ml-1.5 p-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 hover:bg-sky-100"><Layers className="w-4 h-4" /></button>
                    </div>

                    {showThermalOverlay && (
                      <div className="flex flex-col gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-[11px] font-bold shadow-inner">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setMapDataType('sst')}
                            className={`flex-1 py-1.5 rounded-lg transition-all ${mapDataType === 'sst' ? 'bg-white text-sky-700 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                          >
                            🌡️ SST Brute
                          </button>
                          <button
                            onClick={() => setMapDataType('mhw')}
                            className={`flex-1 py-1.5 rounded-lg transition-all ${mapDataType === 'mhw' ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30' : 'text-slate-500 hover:text-rose-600'}`}
                          >
                            🔥 Canicule
                          </button>
                        </div>
                        <button
                          onClick={() => setMapDataType(mapDataType === 'impact' ? 'sst' : 'impact')}
                          className={`w-full py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${mapDataType === 'impact' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'}`}
                        >
                          <span>🐙 Mode Impact Biologique</span>
                        </button>
                      </div>
                    )}

                    <div className="flex items-center bg-sky-50 p-1 rounded-xl border border-sky-200 text-[11px] font-semibold">
                      <button onClick={() => setColorMode('daily')} className={`flex-1 py-1 rounded-lg transition-all ${colorMode === 'daily' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Précis (Jour J)</button>
                      <button onClick={() => setColorMode('average')} className={`flex-1 py-1 rounded-lg transition-all ${colorMode === 'average' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>Moyenne période</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedSpecies && selectedSpeciesImages && (
              <aside onClick={(e) => e.stopPropagation()} className="absolute top-4 right-4 bottom-4 z-30 w-[calc(100%-2rem)] sm:w-[420px] bg-white/95 backdrop-blur-xl border border-sky-200 rounded-2xl shadow-2xl shadow-sky-950/20 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="p-4 bg-gradient-to-r from-sky-50 via-cyan-50/50 to-white border-b border-sky-100 flex items-start justify-between gap-2 shrink-0">
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-100 text-sky-800">{selectedSpecies.basin}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedSpecies.trend === 'decline' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
                        {selectedSpecies.trendLabel}
                      </span>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900 mt-1 leading-tight">{selectedSpecies.name}</h2>
                    <p className="text-xs italic text-slate-500">{selectedSpecies.scientificName}</p>
                  </div>
                  <button onClick={() => setSelectedSpecies(null)} className="p-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-500 hover:text-slate-900 border border-sky-200/80 shrink-0"><X className="w-4 h-4" /></button>
                </div>

                <div className="relative bg-sky-100 h-56 shrink-0 overflow-hidden group border-b border-sky-100 select-none" onMouseEnter={() => setIsHoveringCarousel(true)} onMouseLeave={() => setIsHoveringCarousel(false)}>
                  <img key={selectedSpeciesImages[speciesImageIndex].src} src={selectedSpeciesImages[speciesImageIndex].src} alt={selectedSpeciesImages[speciesImageIndex].alt} onClick={() => setSpeciesImageIndex((index: number) => (index + 1) % selectedSpeciesImages.length)} className="w-full h-full object-cover cursor-pointer transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[10px] font-semibold text-slate-800 border border-sky-200/80 shadow-xs flex items-center gap-1 truncate max-w-[65%]">
                      <MapPin className="w-3 h-3 text-sky-600 shrink-0" /> <span className="truncate">{selectedSpecies.locationName}</span>
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); speakText(`${selectedSpecies.name}. ${selectedSpecies.narrationText}`); }} className="pointer-events-auto px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] shadow-md flex items-center gap-1 transition-transform active:scale-95 shrink-0">
                      <Volume2 className="w-3.5 h-3.5" /> <span>Audio</span>
                    </button>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-900/65 to-transparent px-3.5 pb-8 pt-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <p className="text-xs font-semibold text-white leading-snug drop-shadow-xs">{selectedSpeciesImages[speciesImageIndex].alt}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[10px] text-sky-100 pointer-events-auto">
                      <span>Photo :</span>
                      <a href={`https://commons.wikimedia.org/wiki/${encodeURIComponent(`File:${selectedSpeciesImages[speciesImageIndex].title}`)}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="underline decoration-sky-300/70 underline-offset-2 hover:text-white">{selectedSpeciesImages[speciesImageIndex].artist}</a>
                      <span aria-hidden="true">·</span>
                      <span>{selectedSpeciesImages[speciesImageIndex].license}</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2.5 inset-x-0 flex items-center justify-center gap-2 z-10">
                    {selectedSpeciesImages.map((img: any, idx: number) => (
                      <button key={img.title} type="button" onClick={(e) => { e.stopPropagation(); setSpeciesImageIndex(idx); }} className={`h-2 rounded-full transition-all duration-300 shadow-xs ${idx === speciesImageIndex ? 'w-7 bg-white ring-2 ring-sky-500/50' : 'w-2 bg-white/65 hover:bg-white'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
                  <div className={`p-3 rounded-xl border ${selectedSpecies.trend === 'decline' ? 'bg-rose-50/70 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'}`}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                        <AlertTriangle className={`w-3.5 h-3.5 ${selectedSpecies.trend === 'decline' ? 'text-rose-600' : 'text-emerald-600'}`} /> Seuil Critique :
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{selectedSpecies.criticalThreshold}</p>
                    <p className="text-[11px] text-slate-600 mt-1">Terrain : <span className="font-semibold text-slate-800">{selectedSpecies.mortalityRate}</span></p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Effet de la canicule marine</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{selectedSpecies.impactDetails}</p>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: COMPRENDRE */}
      {activeMode === 'comprendre' && (() => {
        const refYear = new Date(apiStartDate).getFullYear();
        const baselineStart = refYear - 30;
        const baselineEnd = refYear - 1;

        return (
          <main className="flex-1 overflow-y-auto w-full px-4 lg:px-8 py-6 bg-slate-50">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="bg-white border border-sky-200/80 rounded-2xl p-6 shadow-xs flex flex-col xl:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                    Protocole de Catégorisation de Hobday (2018)
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Conformément aux normes internationales de l'OMM, la période de référence (climatologie) est calculée dynamiquement sur les 30 années précédant votre sélection : <strong>de {baselineStart} à {baselineEnd}</strong>[cite: 1].
                  </p>
                </div>
              </div>
            </div>
          </main>
        );
      })()}

      {/* MODE 3: PARTAGER */}
      {activeMode === 'partager' && (
        <main className="flex-1 overflow-y-auto w-full px-4 lg:px-8 py-6 bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-600" /> Centre de Partage & Données
            </h2>
            <button onClick={() => triggerDownload('csv')} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
              Télécharger .CSV
            </button>
          </div>
        </main>
      )}

      {/* BOTTOM CONTROL BAR */}
      <div className="shrink-0 z-30 px-4 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-t border-sky-200/90 shadow-sm relative">
<div className="max-w-7xl mx-auto flex items-center justify-center min-h-[44px] gap-4">
          {/* 1. SÉLECTEUR DE DATE UNIQUE (Visible en mode "Précis (Jour J)") */}
          {activeMode === 'visualiser' && colorMode === 'daily' && (
            <div className="flex items-center gap-3 bg-sky-50 px-5 py-1.5 rounded-xl border border-sky-200 shadow-sm">
              <Thermometer className="w-5 h-5 text-rose-600" />
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Carte SST du :
              </label>
              <input 
                type="date"
                min={apiStartDate}
                max={apiEndDate}
                value={dynamicTelemetry?.date || ''}
                onChange={(e) => {
                  const idx = timelineRecords.findIndex((r: any) => r.date === e.target.value);
                  if (idx !== -1) setSelectedRecordIndex(idx);
                }}
                className="px-2 py-1 rounded bg-white border border-sky-300 text-sky-900 font-bold text-sm outline-none cursor-pointer"
              />
            </div>
          )}

          {/* 2. SÉLECTEUR DE PÉRIODE (Visible en mode "Moyenne période") */}
          {colorMode === 'average' && (
            <div className="flex items-center gap-2 bg-white px-4 py-1 rounded-xl shadow-sm border border-slate-200">
              <Database className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold text-slate-700">Période :</span>
              <input type="date" value={apiStartDate} onChange={(e) => setApiStartDate(e.target.value)} className="px-2 py-1 border rounded text-xs font-bold" />
              <span>au</span>
              <input type="date" value={apiEndDate} onChange={(e) => setApiEndDate(e.target.value)} className="px-2 py-1 border rounded text-xs font-bold" />
              <button onClick={loadCopernicusData} className="px-3 py-1 bg-sky-600 text-white rounded text-xs font-bold">Recharger</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}